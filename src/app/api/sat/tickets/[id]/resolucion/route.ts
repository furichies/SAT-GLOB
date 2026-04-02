import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
        }

        const isStaff = session.user.role === 'admin' || session.user.role === 'tecnico' || session.user.role === 'superadmin'
        if (!isStaff) {
            return NextResponse.json({ success: false, error: 'Privilegios insuficientes' }, { status: 403 })
        }

        const { id } = await params

        // Verificar si ya existe y obtener datos completos
        const ticket = await db.ticket.findUnique({
            where: { id },
            include: { producto: true } // Incluir producto para linkear
        })

        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Ticket no encontrado' }, { status: 404 })
        }

        // Verificar si ya existe (usando raw query por si el cliente de Prisma está desactualizado)
        const existingRaw = await db.$queryRawUnsafe<{ resolucionId: string }[]>('SELECT resolucionId FROM Ticket WHERE id = ?', id)
        const existingResolucionId = existingRaw[0]?.resolucionId

        if (existingResolucionId) {
            return NextResponse.json({ success: true, resolucionId: existingResolucionId, message: 'Ya existe una resolución asociada' })
        }

        // Mapear Tipo de Ticket a Categoría de Conocimiento
        let categoria = 'Soporte Técnico'
        if (ticket.tipo === 'incidencia' || ticket.tipo === 'reparacion') {
            categoria = 'Hardware' // Default, refinar si tenemos datos de producto
            if (ticket.producto?.tipo === 'software') categoria = 'Software'
        } else if (ticket.tipo === 'garantia') {
            categoria = 'Garantía'
        }

        // Crear base de conocimiento
        const nuevaResolucion = await db.baseConocimiento.create({
            data: {
                titulo: `Resolución: ${ticket.asunto}`,
                contenido: `## Procedimiento de Resolución\n\n**Ticket Asociado:** #${ticket.numeroTicket}\n**Problema Original:**\n${ticket.descripcion}\n\n### Pasos Realizados:\n1. \n2. \n`,
                tipo: 'solucion',
                categoria: categoria,
                etiquetas: ticket.producto?.nombre ? `${ticket.tipo}, ${ticket.producto.nombre}` : ticket.tipo,
                autorId: session.user.id,
                productoRelacionadoId: ticket.productoId || null,
                activo: false // Borrador inicial
            }
        })

        // Vincular al ticket usando Raw Query para evitar error de validación de esquema en cliente desactualizado
        await db.$executeRawUnsafe(
            'UPDATE Ticket SET resolucionId = ? WHERE id = ?',
            nuevaResolucion.id,
            id
        )

        return NextResponse.json({ success: true, resolucionId: nuevaResolucion.id, resolucion: nuevaResolucion })

    } catch (error: any) {
        console.error('Error creando resolución:', error)
        // Devolver el error específico para debugging
        return NextResponse.json({ success: false, error: `Error creando resolución: ${error.message}` }, { status: 500 })
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })

        const { id } = await params
        const ticket = await db.ticket.findUnique({
            where: { id },
            select: { resolucionId: true }
        })

        if (!ticket?.resolucionId) {
            return NextResponse.json({ success: false, error: 'No hay resolución asociada' }, { status: 404 })
        }

        const resolucion = await db.baseConocimiento.findUnique({
            where: { id: ticket.resolucionId }
        })

        return NextResponse.json({ success: true, resolucion })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error al obtener resolución' }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const isStaff = session?.user?.role === 'admin' || session?.user?.role === 'tecnico' || session?.user?.role === 'superadmin'

        if (!isStaff) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const { contenido, titulo, estado } = body

        const ticket = await db.ticket.findUnique({
            where: { id },
            select: { resolucionId: true }
        })

        if (!ticket?.resolucionId) {
            return NextResponse.json({ success: false, error: 'No hay resolución asociada para actualizar' }, { status: 404 })
        }

        const updated = await db.baseConocimiento.update({
            where: { id: ticket.resolucionId },
            data: {
                contenido,
                ...(titulo && { titulo }),
                ...(estado && { activo: estado === 'publicado' }) // Map 'publicado' to activo=true ? or just keep basic
            }
        })

        return NextResponse.json({ success: true, resolucion: updated })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error al actualizar resolución' }, { status: 500 })
    }
}
