import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { startOfDay, subDays, format } from 'date-fns'
// import { PedidoEstado, TicketEstado } from '@prisma/client' 

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin'

        // Allow access, typically admin only
        if (!session || !isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const period = searchParams.get('period') || '30d'
        const days = period === '7d' ? 7 : (period === '90d' ? 90 : 30)

        const dateLimit = startOfDay(subDays(new Date(), days))

        // 1. Fetch Orders for KPIs and Sales Chart
        const pedidos = await db.pedido.findMany({
            where: {
                fechaPedido: {
                    gte: dateLimit
                },
                estado: {
                    not: 'cancelado' // Exclude cancelled orders from revenue stats
                }
            },
            include: {
                usuario: true, // For client counting if needed
                detalles: {
                    include: {
                        producto: {
                            include: {
                                categoria: true
                            }
                        }
                    }
                }
            }
        })

        // 2. Fetch All Tickets for Status and Performance
        // We fetch ALL tickets to calculate status distribution correctly 
        // (though maybe time-limited for performance? Usually dashboard shows 'Current' state, so all open tickets + recent closed)
        // For simplicity, let's fetch all active or recent.
        const tickets = await db.ticket.findMany({
            include: {
                tecnico: {
                    include: {
                        usuario: true
                    }
                }
            }
        })

        // 3. Fetch Technicians for Performance
        const tecnicos = await db.tecnico.findMany({
            include: {
                usuario: true,
                tickets: true
            }
        })

        // --- Process Data ---

        // KPI Calculations
        const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0)
        const totalPedidos = pedidos.length

        // Count NEW clients in period (based on User creation date, actually better to query Usuario table separately)
        const newClientsCount = await db.usuario.count({
            where: {
                rol: 'cliente',
                fechaRegistro: {
                    gte: dateLimit
                }
            }
        })

        const ticketsPendientes = tickets.filter(t => ['abierto', 'asignado', 'pendiente_cliente', 'pendiente_pieza'].includes(t.estado)).length

        const kpis = {
            ventas: totalVentas,
            pedidos: totalPedidos,
            clientes_nuevos: newClientsCount,
            tickets_pendientes: ticketsPendientes
            // Older periods could be calculated for 'trend' comparison, but skipping for MVP speed unless requested
        }


        // Sales Chart (Group by Day)
        const salesByDayMap = new Map<string, { valor: number, pedidos: number }>()

        // Initialize map with 0s
        for (let i = 0; i < days; i++) {
            // Depending on days, if 90, bar chart might be too crowded, but let's assume UI handles it.
            // Usually for 90d we might group by week, but let's stick to days or simplify to specific dataset size.
            // If days > 30, maybe just show last 30? The user asked for functional stats.
            // Let's stick to generating selected days.
            const d = subDays(new Date(), i)
            salesByDayMap.set(format(d, 'yyyy-MM-dd'), { valor: 0, pedidos: 0 })
        }

        pedidos.forEach(p => {
            const dayKey = format(p.fechaPedido, 'yyyy-MM-dd')
            if (salesByDayMap.has(dayKey)) {
                const curr = salesByDayMap.get(dayKey)!
                curr.valor += p.total
                curr.pedidos += 1
            }
        })

        // Convert to array and reverse (oldest first)
        const salesChart = Array.from(salesByDayMap.entries()).map(([date, data]) => ({
            dia: format(new Date(date), 'dd/MM'), // Format for label
            fullDate: date,
            valor: data.valor,
            pedidos: data.pedidos
        })).sort((a, b) => a.fullDate.localeCompare(b.fullDate))


        // Category Distribution (Pie Chart)
        const categoryMap = new Map<string, number>()
        pedidos.forEach(p => {
            p.detalles.forEach(d => {
                const catName = d.producto.categoria?.nombre || 'Sin Categoría'
                const current = categoryMap.get(catName) || 0
                categoryMap.set(catName, current + d.subtotal)
            })
        })

        const categoryChart = Array.from(categoryMap.entries()).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value).slice(0, 5) // Top 5 categories


        // Ticket Status (Pie Chart)
        const ticketStatusMap = new Map<string, number>()
        tickets.forEach(t => {
            const status = t.estado.replace('_', ' ').toUpperCase()
            ticketStatusMap.set(status, (ticketStatusMap.get(status) || 0) + 1)
        })

        // Colors mapping helper
        const getColorForStatus = (status: string) => {
            if (status.includes('ABIERTO')) return '#EF4444' // Red
            if (status.includes('RESUELTO') || status.includes('CERRADO')) return '#10B981' // Green
            if (status.includes('PENDIENTE')) return '#F59E0B' // Yellow
            return '#3B82F6' // Blue default
        }

        const ticketStatusChart = Array.from(ticketStatusMap.entries()).map(([name, value]) => ({
            name,
            value,
            color: getColorForStatus(name)
        }))

        // Tech Performance (Bar Chart)
        // Ensure ALL technicians are returned
        const techPerformance = tecnicos.map(tech => {
            const assignedTickets = tickets.filter(t => t.tecnicoId === tech.id)
            const resolvedTickets = assignedTickets.filter(t => ['resueltos', 'cerrado', 'resuelto'].includes(t.estado))

            // Calculate satisfaction
            // Assuming ticket.satisfaccion is 1-5 int. 
            // If unknown, use tech.valoracionMedia or 0
            const ratedTickets = assignedTickets.filter(t => t.satisfaccion && t.satisfaccion > 0)
            const avgRating = ratedTickets.length > 0
                ? ratedTickets.reduce((sum, t) => sum + (t.satisfaccion || 0), 0) / ratedTickets.length
                : (tech.valoracionMedia || 0)

            // Name format
            const name = tech.usuario.nombre.split(' ')[0] + ' ' + (tech.usuario.apellidos?.charAt(0) || '') + '.'

            return {
                id: tech.id,
                name: name,
                asignados: assignedTickets.length,
                resueltos: resolvedTickets.length,
                satisfaccion: Number(avgRating.toFixed(1))
            }
        })


        return NextResponse.json({
            success: true,
            data: {
                kpis,
                salesChart,
                categoryChart,
                ticketStatusChart,
                techPerformance
            }
        })

    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
