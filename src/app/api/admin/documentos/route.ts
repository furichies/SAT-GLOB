import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DocumentoTipo, EstadoDocumento, DocumentoEntidadTipo } from '@/types/enums'

// GET /api/admin/documentos - Listar documentos con filtros
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== 'admin' && session.user.role !== 'tecnico' && session.user.role !== 'superadmin')) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const tipo = searchParams.get('tipo')
        const estado = searchParams.get('estado')
        const busqueda = searchParams.get('busqueda')
        const ticketId = searchParams.get('ticketId')
        const pedidoId = searchParams.get('pedidoId')
        const usuarioGeneradorId = searchParams.get('usuarioGeneradorId')
        const tecnicoAsignado = searchParams.get('tecnicoAsignado')

        console.log('[API] GET /admin/documentos params:', { page, limit, tipo, estado, ticketId, pedidoId, usuarioGeneradorId, tecnicoAsignado });

        const skip = (page - 1) * limit

        // Construir filtros
        const where: any = {}

        if (tipo && tipo !== 'todos') {
            where.tipo = tipo as DocumentoTipo
        }

        if (estado && estado !== 'todos') {
            where.estadoDocumento = estado as EstadoDocumento
        }

        if (ticketId) {
            where.ticketId = ticketId
        }

        if (pedidoId) {
            where.pedidoId = pedidoId
        }

        if (usuarioGeneradorId) {
            where.usuarioGeneradorId = usuarioGeneradorId
        }

        // Si hay filtro de técnico asignado, necesitamos manejarlo de forma especial
        // para que no se sobrescriba con la búsqueda
        // El frontend envía Usuario.id, pero necesitamos filtrar por ticket.tecnico.usuarioId
        if (tecnicoAsignado) {
            if (!where.AND) {
                where.AND = []
            }
            where.AND.push({
                ticket: {
                    tecnico: {
                        usuarioId: tecnicoAsignado
                    }
                }
            })
        }

        if (busqueda) {
            where.OR = [
                { numeroDocumento: { contains: busqueda } },
                { contenido: { contains: busqueda } },
                { metadatos: { contains: busqueda } },
                {
                    ticket: {
                        numeroTicket: { contains: busqueda }
                    }
                },
                {
                    pedido: {
                        numeroPedido: { contains: busqueda }
                    }
                },
                {
                    usuarioGenerador: {
                        nombre: { contains: busqueda }
                    }
                }
            ]
        }

        console.log('[API] GET /admin/documentos where:', JSON.stringify(where));

        // Obtener documentos
        const [documentos, total] = await Promise.all([
            prisma.documento.findMany({
                where,
                skip,
                take: limit,
                orderBy: { fechaGeneracion: 'desc' },
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
                            tecnico: {
                                select: {
                                    id: true,
                                    usuario: {
                                        select: {
                                            id: true,
                                            nombre: true,
                                            apellidos: true,
                                        },
                                    },
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
                        },
                    },
                    documentoRelacionado: true,
                    documentosHijos: true,
                },
            }),
            prisma.documento.count({ where }),
        ])

        console.log(`[API] Found ${documentos.length} documents (Total: ${total})`);

        return NextResponse.json({
            success: true,
            data: {
                documentos,
                total,
                pagina: page,
                porPagina: limit,
            },
        })
    } catch (error) {
        console.error('Error al obtener documentos:', error)
        return NextResponse.json(
            { success: false, error: 'Error al obtener documentos' },
            { status: 500 }
        )
    }
}

// POST /api/admin/documentos - Crear nuevo documento
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            tipo,
            entidadTipo,
            ticketId,
            pedidoId,
            productoId,
            metadatos,
            evidenciasFotos,
            estadoDocumento,
            documentoRelacionadoId,
        } = body

        // LOGGING DEPURACION (usar console.log en lugar de archivo para Vercel)
        console.log(`[DOCUMENTOS] POST /api/admin/documentos - Tipo: ${tipo}, TicketId: ${ticketId}, EntidadTipo: ${entidadTipo}`)

        const session = await getServerSession(authOptions)
        console.log('--- DEBUG POST /api/admin/documentos ---')
        console.log('Session:', session ? session.user : 'No session')
        console.log('Payload Type:', tipo)
        console.log('TicketID:', ticketId)

        if (!session || (session.user.role !== 'admin' && session.user.role !== 'tecnico' && session.user.role !== 'superadmin')) {
            console.log('--- DEBUG: Unauthorized access attempt ---')
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Validar que el usuario generador existe en la BD (Evitar error de FK si se reinició la BD)
        const usuarioGenerador = await prisma.usuario.findUnique({
            where: { id: session.user.id }
        })

        if (!usuarioGenerador) {
            return NextResponse.json(
                { success: false, error: 'Sesión inválida: El usuario no existe en la base de datos. Por favor cierre sesión e ingrese nuevamente.' },
                { status: 401 }
            )
        }

        // Generar número de documento único
        const prefijo = tipo.toUpperCase().substring(0, 3)
        const timestamp = Date.now()
        const numeroDocumento = `${prefijo}-${timestamp}`

        // Sanitizar IDs (convertir string vacío a null)
        let cleanTicketId = ticketId && ticketId.trim() !== '' ? ticketId.trim() : null
        const cleanPedidoId = pedidoId && pedidoId.trim() !== '' ? pedidoId.trim() : null
        const cleanProductoId = productoId && productoId.trim() !== '' ? productoId.trim() : null
        const cleanDocumentoRelacionadoId = documentoRelacionadoId && documentoRelacionadoId.trim() !== '' ? documentoRelacionadoId.trim() : null

        // === VALIDACIÓN DE INTEGRIDAD REFERENCIAL ===
        if (cleanTicketId) {
            const ticketExiste = await prisma.ticket.findUnique({
                where: { id: cleanTicketId },
                include: { usuario: true, producto: true }
            })

            if (!ticketExiste) {
                return NextResponse.json(
                    { success: false, error: 'El ticket especificado no existe' },
                    { status: 404 }
                )
            }
            // Guardar ticket validado para uso posterior
            (request as any).ticketValidado = ticketExiste
        }

        if (cleanPedidoId) {
            const pedidoExiste = await prisma.pedido.findUnique({
                where: { id: cleanPedidoId }
            })

            if (!pedidoExiste) {
                return NextResponse.json(
                    { success: false, error: 'El pedido especificado no existe' },
                    { status: 404 }
                )
            }
        }

        // === AUTO-GENERACIÓN DE TICKET PARA ORDEN DE SERVICIO ===
        // Solo crear un nuevo ticket SAT si:
        // 1. Es una orden de servicio
        // 2. NO se proporcionó un ticketId (no se está vinculando a un TKT existente)
        // 3. Hay metadatos disponibles
        if ((tipo === 'orden_servicio' || tipo === 'ORDEN_SERVICIO') && !cleanTicketId && metadatos) {
            try {
                console.log('[Auto-Generación] Creando ticket SAT desde Orden de Servicio')
                const meta = metadatos as any // MetadatosOrdenServicio

                // 1. Buscar o Crear Cliente (Usuario)
                let cliente = await prisma.usuario.findFirst({
                    where: {
                        email: meta.cliente.correoElectronico
                    }
                })

                if (!cliente) {
                    console.log('[Auto-Generación] Creando nuevo cliente:', meta.cliente.correoElectronico)
                    cliente = await prisma.usuario.create({
                        data: {
                            email: meta.cliente.correoElectronico,
                            nombre: meta.cliente.nombreCompleto.split(' ')[0],
                            apellidos: meta.cliente.nombreCompleto.split(' ').slice(1).join(' ') || '',
                            rol: 'cliente',
                            passwordHash: '$2b$10$tempPasswordHashForAutoCreatedUser',
                            telefono: meta.cliente.telefono,
                            direccion: meta.cliente.direccion,
                            activo: true
                        }
                    })
                } else {
                    // Actualizar datos si cambiaron
                    console.log('[Auto-Generación] Actualizando cliente existente')
                    await prisma.usuario.update({
                        where: { id: cliente.id },
                        data: {
                            telefono: meta.cliente.telefono,
                            direccion: meta.cliente.direccion
                        }
                    })
                }

                // 2. Buscar o Crear Producto (Equipo del cliente)
                const skuEquipo = `CLI-${cliente.id}-${meta.equipo.numeroSerie || 'SIN-SERIE'}`
                let producto = await prisma.producto.findFirst({
                    where: { sku: skuEquipo }
                })

                if (!producto) {
                    producto = await prisma.producto.create({
                        data: {
                            sku: `REP-${Date.now().toString().slice(-6)}`,
                            tipo: 'equipo_completo',
                            nombre: `${meta.equipo.tipoEquipo} ${meta.equipo.marca} ${meta.equipo.modelo}`,
                            descripcion: `Cliente: ${cliente.nombre} ${cliente.apellidos}\n` +
                                `IMEI/Serie: ${meta.equipo.imei || meta.equipo.numeroSerie || 'N/A'}\n` +
                                `Color: ${meta.equipo.color || 'N/A'}\n` +
                                `Estado físico: ${meta.estadoFisico.danosVisibles || 'Sin daños visibles'}\n` +
                                meta.equipo.caracteristicasFisicas,
                            precio: 0,
                            stock: 0,
                            marca: meta.equipo.marca,
                            modelo: meta.equipo.modelo
                        }
                    })
                }

                // 3. Crear Ticket SAT
                const numeroTicket = `SAT-${Date.now().toString().slice(-6)}`
                const ticket = await prisma.ticket.create({
                    data: {
                        numeroTicket,
                        usuarioId: cliente.id,
                        productoId: producto.id,
                        tipo: 'reparacion',
                        prioridad: 'media',
                        estado: 'abierto',
                        asunto: `Reparación: ${meta.equipo.tipoEquipo} ${meta.equipo.marca} ${meta.equipo.modelo}`,
                        descripcion: `Problema reportado: ${meta.problema.sintomasReportados}\n` +
                            `Frecuencia del fallo: ${meta.problema.frecuenciaFallo || 'No especificada'}\n` +
                            `Condiciones de ocurrencia: ${meta.problema.condicionesOcurrencia || 'No especificadas'}\n` +
                            `Accesorios entregados: ${meta.equipo.accesoriosEntregados?.join(', ') || 'Ninguno'}\n` +
                            `Estado físico al ingreso:\n` +
                            `- Golpes: ${meta.estadoFisico.golpes ? 'Sí' : 'No'}\n` +
                            `- Rayones: ${meta.estadoFisico.rayones ? 'Sí' : 'No'}\n` +
                            `- Estado pantalla: ${meta.estadoFisico.estadoPantalla || 'Normal'}\n` +
                            `- Daños visibles: ${meta.estadoFisico.danosVisibles || 'Ninguno'}`,
                        diagnostico: meta.observacionesTecnico || null
                    }
                })

                console.log('[Auto-Generación] Ticket SAT creado exitosamente:', ticket.numeroTicket)
                cleanTicketId = ticket.id

            } catch (autoGenError) {
                console.error('[Auto-Generación] Error creando ticket:', autoGenError)
                return NextResponse.json(
                    { success: false, error: 'Error al crear ticket asociado: ' + (autoGenError as Error).message },
                    { status: 500 }
                )
            }
        } else if ((tipo === 'orden_servicio' || tipo === 'ORDEN_SERVICIO') && cleanTicketId) {
            console.log('[Vinculación] Orden de Servicio vinculada a ticket TKT existente:', cleanTicketId)
        }

        const documento = await prisma.documento.create({
            data: {
                tipo,
                numeroDocumento,
                entidadTipo: entidadTipo || DocumentoEntidadTipo.TICKET,
                ticketId: cleanTicketId,
                pedidoId: cleanPedidoId,
                productoId: cleanProductoId,
                usuarioGeneradorId: session.user.id,
                metadatos: metadatos ? JSON.stringify(metadatos) : null,
                evidenciasFotos: evidenciasFotos ? JSON.stringify(evidenciasFotos) : null,
                estadoDocumento: estadoDocumento || EstadoDocumento.PENDIENTE_FIRMA,
                documentoRelacionadoId: cleanDocumentoRelacionadoId,
            },
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
                                direccion: true,
                                telefono: true,
                                apellidos: true
                            }
                        }
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
                    },
                },
            },
        })

        // LOGICA DE NEGOCIO ADICIONAL: Auto-generar FACTURA si es ALBARÁN DE ENTREGA
        if ((tipo === 'albaran_entrega' || tipo === DocumentoTipo.ALBARAN_ENTREGA) && metadatos) {
            try {
                console.log('--- AUTO-GENERANDO FACTURA DESDE ALBARAN ---')
                const metaAlbaran = metadatos as any // MetadatosAlbaranEntrega

                // Generar número de factura
                const numFactura = `FAC-${Date.now().toString().slice(-8)}`

                const total = metaAlbaran.pagoRecibido?.monto || 0
                const subtotal = total / 1.21
                const iva = total - subtotal

                // Generar items de factura detallados
                const itemsFactura: any[] = []

                // Opción informativa: detallar trabajos y repuestos en la descripción DE UN ITEM ÚNICO
                // (Ya que el Albarán no tiene precios unitarios guardados)

                let descripcionDetallada = `Servicio Técnico Reparación: ${metaAlbaran.equipoEntregado?.tipo || 'Equipo'} ${metaAlbaran.equipoEntregado?.marca || ''} ${metaAlbaran.equipoEntregado?.modelo || ''}\n`
                descripcionDetallada += `Ticket: ${metaAlbaran.numeroTicket || 'N/A'} - Albarán: ${numeroDocumento}\n\n`

                if (metaAlbaran.reparacionesRealizadas?.length > 0) {
                    descripcionDetallada += `TRABAJOS REALIZADOS:\n`
                    metaAlbaran.reparacionesRealizadas.forEach((rep: string) => {
                        descripcionDetallada += `- ${rep}\n`
                    })
                }

                if (metaAlbaran.repuestosUtilizados?.length > 0) {
                    descripcionDetallada += `\nREPUESTOS SUSTITUIDOS:\n`
                    metaAlbaran.repuestosUtilizados.forEach((rep: any) => {
                        descripcionDetallada += `- ${rep.descripcion} (${rep.cantidad} un.)\n`
                    })
                }

                itemsFactura.push({
                    descripcion: descripcionDetallada,
                    cantidad: 1,
                    precioUnitario: subtotal, // El subtotal calculado previamente del gran total
                    subtotal: subtotal
                })

                const metadatosFactura = {
                    ticketId: cleanTicketId,
                    numeroTicket: metaAlbaran.numeroTicket,
                    cliente: {
                        nombre: metaAlbaran.clienteRecibe?.nombre ||
                            `${documento.ticket?.usuario?.nombre || 'Cliente'} ${documento.ticket?.usuario?.apellidos || ''}`.trim(),
                        identificacion: metaAlbaran.clienteRecibe?.identificacion || '',
                        email: documento.ticket?.usuario?.email || '',
                        direccion: documento.ticket?.usuario?.direccion || '',
                        telefono: documento.ticket?.usuario?.telefono || ''
                    },
                    equipo: {
                        tipo: metaAlbaran.equipoEntregado?.tipo || '',
                        marca: metaAlbaran.equipoEntregado?.marca || '',
                        modelo: metaAlbaran.equipoEntregado?.modelo || '',
                        numeroSerie: metaAlbaran.equipoEntregado?.numeroSerie || ''
                    },

                    items: itemsFactura,
                    totales: {
                        subtotal: subtotal,
                        iva: iva,
                        total: total
                    },
                    pago: {
                        metodo: metaAlbaran.pagoRecibido?.metodo || 'tarjeta',
                        monto: total,
                        referencia: metaAlbaran.pagoRecibido?.referencia
                    },
                    fechaEmision: new Date()
                }

                await prisma.documento.create({
                    data: {
                        tipo: 'factura' as any, // DocumentoTipo.FACTURA
                        numeroDocumento: numFactura,
                        entidadTipo: entidadTipo || DocumentoEntidadTipo.TICKET,
                        ticketId: cleanTicketId,
                        pedidoId: cleanPedidoId,
                        usuarioGeneradorId: session.user.id,
                        metadatos: JSON.stringify(metadatosFactura),
                        estadoDocumento: EstadoDocumento.FIRMADO, // Las facturas suelen nacer firmadas/cerradas
                        documentoRelacionadoId: documento.id // Relacionamos la factura con el albarán
                    }
                })
                console.log('--- FACTURA GENERADA EXITOSAMENTE ---')
            } catch (facturaError) {
                console.error('Error auto-generando factura:', facturaError)
            }
        }

        return NextResponse.json({
            success: true,
            data: documento,
        })
    } catch (error) {
        console.error('Error al crear documento:', error)

        return NextResponse.json(
            { success: false, error: 'Error al crear documento: ' + (error instanceof Error ? error.message : String(error)) },
            { status: 500 }
        )
    }
}
