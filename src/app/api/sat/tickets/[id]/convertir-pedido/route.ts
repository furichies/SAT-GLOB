import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Special SKUs for repair items
const SKU_MANO_OBRA = 'SAT-MANO-OBRA'
const SKU_REPUESTO = 'SAT-REPUESTO'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['admin', 'tecnico', 'superadmin'].includes(session.user.role)) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { laborHours, parts } = body

        if (laborHours === undefined || laborHours < 0) {
            return NextResponse.json({ success: false, error: 'Horas de mano de obra inválidas' }, { status: 400 })
        }

        // 1. Get Ticket
        const ticket = await db.ticket.findUnique({
            where: { id },
            include: { usuario: true }
        })

        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Ticket no encontrado' }, { status: 404 })
        }

        // 2. Ensure Service Products Exist
        // Mano de Obra
        let manoObra = await db.producto.findUnique({ where: { sku: SKU_MANO_OBRA } })
        if (!manoObra) {
            manoObra = await db.producto.create({
                data: {
                    sku: SKU_MANO_OBRA,
                    nombre: 'Mano de Obra SAT',
                    descripcion: 'Servicio técnico especializado por horas',
                    precio: 80.0,
                    stock: 999999,
                    tipo: 'componente', // or 'servicio' if enum allowed, fallback to component
                    activo: true
                }
            })
        }

        // Repuesto Genérico
        let repuestoGen = await db.producto.findUnique({ where: { sku: SKU_REPUESTO } })
        if (!repuestoGen) {
            repuestoGen = await db.producto.create({
                data: {
                    sku: SKU_REPUESTO,
                    nombre: 'Repuesto SAT',
                    descripcion: 'Pieza de repuesto para reparación',
                    precio: 0.0, // Variable
                    stock: 999999,
                    tipo: 'componente',
                    activo: true
                }
            })
        }

        // 3. Prepare Order Details
        type DetalleItem = {
            productoId: string
            cantidad: number
            cantidad_real?: number
            precio: number
            subtotal: number
            descripcion: string
        }
        const detalles: DetalleItem[] = []
        let subtotal = 0

        // Add Labor
        if (laborHours > 0) {
            const laborCost = laborHours * 80.0
            detalles.push({
                productoId: manoObra.id,
                cantidad: 1,
                cantidad_real: laborHours,
                precio: 80.0,
                subtotal: laborCost,
                descripcion: `Mano de Obra (${laborHours} horas)`
            })
            subtotal += laborCost
        }

        // Add Parts
        if (parts && Array.isArray(parts)) {
            for (const part of parts) {
                if (!part.name || typeof part.cost !== 'number') continue

                detalles.push({
                    productoId: repuestoGen.id,
                    cantidad: 1,
                    precio: part.cost,
                    subtotal: part.cost,
                    descripcion: part.name
                })
                subtotal += part.cost
            }
        }

        const iva = subtotal * 0.21
        const total = subtotal + iva

        // 4. Create Order
        // Generate order number
        const dateStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)
        const orderNum = `REP-${ticket.numeroTicket.replace('SAT-', '')}-${dateStr}`

        // Create structured address object for JSON storage
        const addressObj = {
            direccion: ticket.usuario.direccion || 'Recogida en Tienda',
            ciudad: ticket.usuario.ciudad || '',
            codigoPostal: ticket.usuario.codigoPostal || '',
            telefono: ticket.usuario.telefono || ''
        }

        const pedido = await db.pedido.create({
            data: {
                numeroPedido: orderNum,
                usuarioId: ticket.usuarioId,
                estado: 'pendiente',
                subtotal,
                iva,
                total,
                direccionEnvio: JSON.stringify(addressObj),
                metodoPago: 'transferencia',
                fechaPedido: new Date(),
                detalles: {
                    create: detalles.map(d => ({
                        productoId: d.productoId,
                        cantidad: d.cantidad_real || d.cantidad,
                        precioUnitario: d.precio,
                        subtotal: d.subtotal,
                        descripcion: d.descripcion
                    }))
                }
            }
        })

        // 5. Update Ticket
        await db.ticket.update({
            where: { id: ticket.id },
            data: {
                pedidoId: pedido.id,
                estado: 'en_progreso', // Mark as in progress as we have an order
                costeReparacion: total // Update estimated cost
            }
        })

        // 6. Create Invoice (Documento)
        const fecha = new Date()
        const invoiceNum = `FAC-${orderNum}`

        await db.documento.create({
            data: {
                tipo: 'factura',
                numeroDocumento: invoiceNum,
                entidadTipo: 'pedido',
                pedidoId: pedido.id,
                usuarioGeneradorId: session.user.id,
                contenido: `Factura de Reparación para Ticket ${ticket.numeroTicket}`,
                // We don't generate the PDF file here yet, but we create the record.
                // The URL could point to a dynamic generation endpoint:
                rutaArchivo: `/api/documentos/factura/${pedido.id}`
            }
        })

        // Add comment to ticket
        await db.seguimientoTicket.create({
            data: {
                ticketId: ticket.id,
                usuarioId: session.user.id,
                tipo: 'nota_interna',
                contenido: `Se ha generado el Pedido de Reparación ${orderNum} por valor de ${total.toFixed(2)}€.`
            }
        })

        return NextResponse.json({ success: true, pedidoId: pedido.id })

    } catch (error) {
        console.error('Error creating repair order:', error)
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
    }
}
