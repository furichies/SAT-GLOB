import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generarPDFDocumento } from '@/lib/pdf-generator'

// GET /api/admin/documentos/[id]/pdf - Generar y descargar PDF
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Obtener documento con todas las relaciones
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
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                                email: true,
                                telefono: true,
                                direccion: true,
                                ciudad: true,
                                provincia: true,
                                codigoPostal: true,
                            },
                        },
                        tecnico: {
                            include: {
                                usuario: {
                                    select: {
                                        nombre: true,
                                        apellidos: true,
                                    },
                                },
                            },
                        },
                        producto: true,
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
            },
        })

        if (!documento) {
            return NextResponse.json(
                { success: false, error: 'Documento no encontrado' },
                { status: 404 }
            )
        }

        // Generar PDF
        const pdfBuffer = await generarPDFDocumento(documento)

        // Retornar PDF como respuesta
        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${documento.numeroDocumento}.pdf"`,
            },
        })
    } catch (error) {
        console.error('Error al generar PDF:', error)
        return NextResponse.json(
            { success: false, error: 'Error al generar PDF' },
            { status: 500 }
        )
    }
}
