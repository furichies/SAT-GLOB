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

        const { id } = await params
        const body = await req.json()
        const { contenido } = body

        if (!contenido?.trim()) {
            return NextResponse.json({ success: false, error: 'Contenido vacío' }, { status: 400 })
        }

        const ticket = await db.ticket.findUnique({ where: { id } })
        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Ticket inexistente' }, { status: 404 })
        }

        const isStaff = session.user.role === 'admin' || session.user.role === 'tecnico' || session.user.role === 'superadmin'
        if (!isStaff && ticket.usuarioId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
        }

        const seguimiento = await db.seguimientoTicket.create({
            data: {
                ticketId: id,
                usuarioId: session.user.id,
                contenido,
                tipo: 'comentario'
            },
            include: { usuario: { select: { nombre: true } } }
        })

        return NextResponse.json({ success: true, seguimiento })
    } catch (error) {
        console.error('Error al comentar:', error)
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
    }
}
