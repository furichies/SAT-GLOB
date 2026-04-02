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
        const { id } = await params

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
        }

        const body = await req.json()
        const { satisfaccion } = body

        if (!satisfaccion || satisfaccion < 1 || satisfaccion > 5) {
            return NextResponse.json({ success: false, error: 'Valoración inválida' }, { status: 400 })
        }

        // Get ticket to verify ownership
        const ticket = await db.ticket.findUnique({
            where: { id }
        })

        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Ticket no encontrado' }, { status: 404 })
        }

        // Only owner can rate, and only if resolved/closed
        if (ticket.usuarioId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
        }

        if (ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado') {
            return NextResponse.json({ success: false, error: 'Solo se pueden valorar tickets resueltos o cerrados' }, { status: 400 })
        }

        // Update satisfaction
        const updated = await db.ticket.update({
            where: { id },
            data: {
                satisfaccion: satisfaccion
            }
        })

        // NOTE: We do not need to update 'tecnico.valoracionMedia' here because
        // we updated '/api/admin_tecnicos/route.ts' to calculate it dynamically on read.

        return NextResponse.json({ success: true, ticket: updated })
    } catch (error) {
        console.error('Error rating ticket:', error)
        return NextResponse.json({ success: false, error: 'Error al guardar valoración' }, { status: 500 })
    }
}
