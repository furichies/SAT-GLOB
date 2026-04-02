import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/documentos/[id] - Obtener documento específico
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'tecnico' && session.user.role !== 'superadmin')) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            )
        }

        const documento = await prisma.documento.findUnique({
            where: { id },
            include: {
                usuarioGenerador: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
                ticket: {
                    select: {
                        id: true,
                        numeroTicket: true,
                        asunto: true,
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                email: true,
                                telefono: true,
                            },
                        },
                    },
                },
                pedido: {
                    select: {
                        id: true,
                        numeroPedido: true,
                    },
                },
                producto: {
                    select: {
                        id: true,
                        nombre: true,
                        marca: true,
                        modelo: true,
                    },
                },
                documentoRelacionado: true,
                documentosHijos: true,
            },
        })

        if (!documento) {
            return NextResponse.json(
                { success: false, error: 'Documento no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: documento,
        })
    } catch (error) {
        console.error('Error al obtener documento:', error)
        return NextResponse.json(
            { success: false, error: 'Error al obtener documento' },
            { status: 500 }
        )
    }
}

// PUT /api/admin/documentos/[id] - Actualizar documento
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'tecnico' && session.user.role !== 'superadmin')) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            metadatos,
            estadoDocumento,
            firmaCliente,
            firmaTecnico,
            evidenciasFotos,
            contenido,
        } = body

        // Preparar datos para actualizar
        const updateData: any = {}

        if (metadatos !== undefined) {
            updateData.metadatos = JSON.stringify(metadatos)
        }

        if (estadoDocumento !== undefined) {
            updateData.estadoDocumento = estadoDocumento
        }

        if (firmaCliente !== undefined) {
            updateData.firmaCliente = firmaCliente
            if (firmaCliente) {
                updateData.fechaFirma = new Date()
            }
        }

        if (firmaTecnico !== undefined) {
            updateData.firmaTecnico = firmaTecnico
        }

        if (evidenciasFotos !== undefined) {
            updateData.evidenciasFotos = JSON.stringify(evidenciasFotos)
        }

        if (contenido !== undefined) {
            updateData.contenido = contenido
        }

        const documento = await prisma.documento.update({
            where: { id },
            data: updateData,
            include: {
                usuarioGenerador: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
                ticket: {
                    select: {
                        id: true,
                        numeroTicket: true,
                        asunto: true,
                    },
                },
                pedido: {
                    select: {
                        id: true,
                        numeroPedido: true,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: documento,
        })
    } catch (error) {
        console.error('Error al actualizar documento:', error)
        return NextResponse.json(
            { success: false, error: 'Error al actualizar documento' },
            { status: 500 }
        )
    }
}

// DELETE /api/admin/documentos/[id] - Eliminar documento
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            )
        }

        await prisma.documento.delete({
            where: { id },
        })

        return NextResponse.json({
            success: true,
            message: 'Documento eliminado correctamente',
        })
    } catch (error) {
        console.error('Error al eliminar documento:', error)
        return NextResponse.json(
            { success: false, error: 'Error al eliminar documento' },
            { status: 500 }
        )
    }
}
