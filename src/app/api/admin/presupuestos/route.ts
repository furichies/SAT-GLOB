import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DocumentoTipo } from '@/types/enums'

// GET /api/admin/presupuestos - Listar presupuestos existentes
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'tecnico' && session.user.role !== 'superadmin')) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(req.url)
        const busqueda = searchParams.get('busqueda')
        const ticketId = searchParams.get('ticketId')

        const where: any = {
            tipo: DocumentoTipo.DIAGNOSTICO_PRESUPUESTO
        }

        // Filtrar por ticket si se proporciona
        if (ticketId) {
            where.ticketId = ticketId
        }

        // Filtrar por búsqueda (número de documento o número de ticket)
        if (busqueda) {
            where.OR = [
                { numeroDocumento: { contains: busqueda } },
                {
                    ticket: {
                        numeroTicket: { contains: busqueda }
                    }
                }
            ]
        }

        const presupuestos = await prisma.documento.findMany({
            where,
            include: {
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
                                codigoPostal: true,
                                ciudad: true
                            }
                        },
                        producto: {
                            select: {
                                id: true,
                                nombre: true,
                                marca: true,
                                modelo: true
                            }
                        },
                        tecnico: {
                            include: {
                                usuario: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        apellidos: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                },
                usuarioGenerador: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true
                    }
                },
                documentoRelacionado: {
                    select: {
                        id: true,
                        numeroDocumento: true,
                        tipo: true,
                        estadoDocumento: true
                    }
                }
            },
            orderBy: {
                fechaGeneracion: 'desc'
            }
        })

        // Formatear respuesta
        const presupuestosFormateados = presupuestos.map(doc => {
            let metadatos: any = null
            try {
                if (doc.metadatos) {
                    metadatos = JSON.parse(doc.metadatos)
                }
            } catch (e) {
                console.error('Error parseando metadatos:', e)
            }

            return {
                id: doc.id,
                numeroDocumento: doc.numeroDocumento,
                numeroTicket: doc.ticket?.numeroTicket || 'N/A',
                fechaGeneracion: doc.fechaGeneracion,
                estadoDocumento: doc.estadoDocumento,
                ticketId: doc.ticketId,
                tecnicoAsignado: {
                    id: doc.ticket?.tecnico?.id || '',
                    nombre: doc.ticket?.tecnico?.usuario ? `${doc.ticket.tecnico.usuario.nombre} ${doc.ticket.tecnico.usuario.apellidos || ''}`.trim() : 'Sin asignar'
                },
                cliente: doc.ticket?.usuario ? {
                    id: doc.ticket.usuario.id,
                    nombre: doc.ticket.usuario.nombre,
                    apellidos: doc.ticket.usuario.apellidos || '',
                    email: doc.ticket.usuario.email,
                    telefono: doc.ticket.usuario.telefono || '',
                    direccion: doc.ticket.usuario.direccion || '',
                    codigoPostal: doc.ticket.usuario.codigoPostal || '',
                    ciudad: doc.ticket.usuario.ciudad || ''
                } : null,
                equipo: doc.ticket?.producto ? {
                    id: doc.ticket.producto.id,
                    nombre: doc.ticket.producto.nombre,
                    marca: doc.ticket.producto.marca || 'N/A',
                    modelo: doc.ticket.producto.modelo || 'N/A'
                } : null,
                presupuesto: metadatos ? {
                    id: doc.id,
                    numeroPresupuesto: metadatos.numeroPresupuesto || doc.numeroDocumento,
                    validezPresupuesto: metadatos.validezPresupuesto,
                    total: metadatos.costos?.total || 0,
                    tecnicoAsignado: metadatos.tecnicoAsignado?.nombre || 'Sin asignar',
                    tecnicoAsignadoId: metadatos.tecnicoAsignado?.id || ''
                } : null,
                documentoRelacionado: doc.documentoRelacionado ? {
                    id: doc.documentoRelacionado.id,
                    numeroDocumento: doc.documentoRelacionado.numeroDocumento,
                    tipo: doc.documentoRelacionado.tipo,
                    estado: doc.documentoRelacionado.estadoDocumento
                } : null
            }
        })

        return NextResponse.json({
            success: true,
            data: { presupuestos: presupuestosFormateados }
        })
    } catch (error) {
        console.error('Error al obtener presupuestos:', error)
        return NextResponse.json(
            { success: false, error: 'Error al obtener presupuestos' },
            { status: 500 }
        )
    }
}
