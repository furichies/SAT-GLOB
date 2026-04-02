import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const pedido = await db.pedido.findUnique({
            where: { id },
            include: {
                detalles: {
                    include: {
                        producto: true
                    }
                }
            }
        })

        if (!pedido) {
            return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 })
        }

        // Seguridad: solo el dueño o un admin pueden verlo
        if (pedido.usuarioId !== session.user.id && session.user.role !== 'admin' && session.user.role !== 'superadmin') {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
        }

        return NextResponse.json({
            success: true,
            data: {
                pedido
            }
        })
    } catch (error) {
        console.error('Error en GET /api/pedidos/[id]:', error)
        return NextResponse.json({ success: false, error: 'Error al obtener el detalle del pedido' }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const pedido = await db.pedido.findUnique({
            where: { id }
        })

        if (!pedido) {
            return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 })
        }

        if (pedido.usuarioId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'No autorizado para modificar este pedido' }, { status: 403 })
        }

        if (pedido.estado !== 'pendiente') {
            return NextResponse.json({ success: false, error: 'Solo se pueden cancelar pedidos pendientes' }, { status: 400 })
        }

        const updatedPedido = await db.pedido.update({
            where: { id },
            data: { estado: 'cancelado' }
        })

        return NextResponse.json({
            success: true,
            data: {
                pedido: updatedPedido,
                mensaje: 'Pedido cancelado correctamente'
            }
        })
    } catch (error) {
        console.error('Error en PUT /api/pedidos/[id]:', error)
        return NextResponse.json({ success: false, error: 'Error al cancelar el pedido' }, { status: 500 })
    }
}
