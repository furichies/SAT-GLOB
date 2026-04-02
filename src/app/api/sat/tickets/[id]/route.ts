import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'No autenticado' },
                { status: 401 }
            )
        }

        const { id } = await params
        const ticket = await db.ticket.findUnique({
            where: { id },
            include: {
                usuario: { select: { nombre: true, email: true, dni: true } },
                tecnico: { include: { usuario: { select: { id: true, nombre: true, apellidos: true, email: true } } } },
                seguimientos: {
                    orderBy: { fechaCreacion: 'asc' },
                    include: { usuario: { select: { nombre: true } } }
                },
                documentos: {
                    orderBy: { fechaGeneracion: 'desc' }
                }
            }
        })

        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Ticket no encontrado' }, { status: 404 })
        }

        // Manual fetch of resolution association to avoid Prisma relation issues if client is not synced
        let resolucionData: any = null
        if ((ticket as any).resolucionId) {
            resolucionData = await db.baseConocimiento.findUnique({
                where: { id: (ticket as any).resolucionId },
                select: { id: true, titulo: true }
            })
        }

        const finalTicket = { ...ticket, resolucion: resolucionData }

        const userRole = session.user.role?.toLowerCase()
        const isStaff = userRole === 'admin' || userRole === 'tecnico' || userRole === 'superadmin'

        if (!isStaff && finalTicket.usuarioId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'No tienes permiso para ver este ticket' }, { status: 403 })
        }

        return NextResponse.json({ success: true, ticket: finalTicket })
    } catch (error) {
        console.error('Error al obtener ticket:', error)
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
    }
}

export async function PATCH(
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

        const body = await req.json()
        const { estado, prioridad, tecnico, tecnicoId: bodyTecnicoId, tipo, descripcion, asunto, diagnostico, solucion } = body
        const { id } = await params

        let tecnicoId: string | null | undefined = undefined

        // Prioritize explicit tecnicoId if provided (including empty string to unassign)
        if (bodyTecnicoId !== undefined) {
            tecnicoId = bodyTecnicoId === 'Sin asignar' || bodyTecnicoId === '' ? null : bodyTecnicoId
        } else if (tecnico === 'Sin asignar') {
            tecnicoId = null
        } else if (tecnico) {
            // FALLBACK: Buscar técnico por nombre completo o parcial (Legacy/Fallback)
            const techRecord = await db.tecnico.findFirst({
                where: {
                    OR: [
                        { usuario: { nombre: { contains: tecnico } } },
                        { usuario: { apellidos: { contains: tecnico } } },
                        {
                            usuario: {
                                AND: [
                                    { nombre: { contains: tecnico.split(' ')[0] } },
                                    { apellidos: { contains: tecnico.split(' ').slice(1).join(' ') } }
                                ]
                            }
                        }
                    ]
                }
            })
            if (techRecord) {
                tecnicoId = techRecord.id
            }
        }
        const updated = await db.ticket.update({
            where: { id },
            data: {
                ...(estado && { estado }),
                ...(prioridad && { prioridad }),
                ...(tipo && { tipo }),
                ...(descripcion !== undefined && { descripcion }),
                ...(asunto && { asunto }),
                ...(tecnicoId !== undefined && { tecnicoId }),
                ...(tecnicoId ? { fechaAsignacion: new Date() } : {}),
                ...(diagnostico !== undefined && { diagnostico }),
                ...(solucion !== undefined && { solucion }),
                ...(estado === 'resuelto' ? { fechaResolucion: new Date() } : {})
            }
        })

        return NextResponse.json({ success: true, ticket: updated })
    } catch (error) {
        console.error('Error al actualizar ticket:', error)
        return NextResponse.json({ success: false, error: 'Error al actualizar' }, { status: 500 })
    }
}

export async function DELETE(
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
        await db.ticket.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: 'Ticket eliminado correctamente' })
    } catch (error) {
        console.error('Error al eliminar ticket:', error)
        return NextResponse.json({ success: false, error: 'Error al eliminar' }, { status: 500 })
    }
}
