import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import path from 'path'
import { DocumentoTipo, DocumentoEntidadTipo } from '@prisma/client'
import { uploadToStorage, getSignedUrl } from '@/lib/supabase-storage'

function generarNumeroTicket(): string {
    const fecha = new Date()
    const año = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `TKT-${año}${mes}${dia}-${random}`
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'No autenticado' },
                { status: 401 }
            )
        }

        const formData = await req.formData()
        const tipo: any = formData.get('tipo')
        const prioridad: any = formData.get('prioridad')
        const asunto: any = formData.get('asunto')
        const descripcion: any = formData.get('descripcion')
        const files = formData.getAll('adjuntos') as File[]

        const tiposIncidencia = formData.get('tiposIncidencia')
        const sintomasObservados = formData.get('sintomasObservados')
        const tipoAcceso = formData.get('tipoAcceso')
        const fechaPreferida = formData.get('fechaPreferida')
        const horaPreferida = formData.get('horaPreferida')

        if (!tipo || !prioridad || !asunto || !descripcion) {
            return NextResponse.json(
                { success: false, error: 'Faltan campos obligatorios' },
                { status: 400 }
            )
        }

        let numeroTicket = generarNumeroTicket()
        let existente = await db.ticket.findUnique({
            where: { numeroTicket }
        })

        while (existente) {
            numeroTicket = generarNumeroTicket()
            existente = await db.ticket.findUnique({
                where: { numeroTicket }
            })
        }

        let descripcionCompleta = descripcion
        if (tipo === 'incidencia' && tiposIncidencia && sintomasObservados) {
            const tipos = JSON.parse(tiposIncidencia as string)
            descripcionCompleta = `TIPO DE INCIDENCIA: ${tipos.join(', ')}\n\nDESCRIPCIÓN: ${descripcion}\n\nSÍNTOMAS OBSERVADOS: ${sintomasObservados}`
        }

        const ticket = await db.ticket.create({
            data: {
                numeroTicket,
                tipo,
                prioridad,
                asunto,
                descripcion: descripcionCompleta,
                estado: 'abierto',
                usuarioId: session.user.id,
            }
        })

        if (files && files.length > 0) {
            for (const file of files) {
                if (file.size > 0 && file.name !== 'undefined') {
                    const bytes = await file.arrayBuffer()
                    const buffer = Buffer.from(bytes)
                    const fileName = `${ticket.numeroTicket}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

                    await uploadToStorage('tickets', fileName, buffer)
                    const signedUrl = await getSignedUrl('tickets', fileName, 3600)

                    await db.documento.create({
                        data: {
                            tipo: DocumentoTipo.informe_reparacion,
                            numeroDocumento: fileName,
                            entidadTipo: DocumentoEntidadTipo.ticket,
                            ticketId: ticket.id,
                            usuarioGeneradorId: session.user.id,
                            contenido: `Adjunto: ${file.name}`,
                            rutaArchivo: signedUrl
                        }
                    })
                }
            }
        }

        if (tipo === 'incidencia' && tiposIncidencia && tipoAcceso && fechaPreferida && horaPreferida) {
            const tipos = JSON.parse(tiposIncidencia as string)
            const fechaHoraIntervencion = `${fechaPreferida} ${horaPreferida}`

            const usuario = await db.usuario.findUnique({
                where: { id: session.user.id }
            })

            const metadatos = {
                tiposIncidencia: tipos,
                sintomasObservados: sintomasObservados || '',
                tipoAcceso: tipoAcceso,
                fechaHoraPreferida: fechaHoraIntervencion,
                autorizadoPor: usuario?.nombre || session.user.name,
                direccion: usuario?.direccion || 'Por especificar',
                ciudad: usuario?.ciudad || '',
                codigoPostal: usuario?.codigoPostal || '',
                telefono: usuario?.telefono || '',
                enlaceAnyDesk: tipoAcceso === 'remoto' ? 'https://anydesk.com/es/downloads/' : null
            }

            const fecha = new Date()
            const año = fecha.getFullYear()
            const mes = String(fecha.getMonth() + 1).padStart(2, '0')
            const dia = String(fecha.getDate()).padStart(2, '0')
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
            const numeroDocumento = `OI-${año}${mes}${dia}-${random}`

            await db.documento.create({
                data: {
                    tipo: DocumentoTipo.orden_intervencion,
                    numeroDocumento,
                    entidadTipo: DocumentoEntidadTipo.ticket,
                    ticketId: ticket.id,
                    usuarioGeneradorId: session.user.id,
                    metadatos: JSON.stringify(metadatos),
                    estadoDocumento: 'pendiente_firma',
                    contenido: `Orden de Intervención para ${asunto}`
                }
            })
        }

        return NextResponse.json({
            success: true,
            ticket: {
                id: ticket.id,
                numeroTicket: ticket.numeroTicket
            }
        })
    } catch (error) {
        console.error('Error al crear ticket:', error)
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'No autenticado' },
                { status: 401 }
            )
        }

        const isStaff = session.user.role === 'admin' || session.user.role === 'tecnico' || session.user.role === 'superadmin'

        const tickets = await db.ticket.findMany({
            where: isStaff ? {} : {
                usuarioId: session.user.id
            },
            orderBy: {
                fechaCreacion: 'desc'
            },
            include: {
                usuario: {
                    select: {
                        nombre: true,
                        email: true
                    }
                },
                tecnico: {
                    include: {
                        usuario: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                },
                documentos: true,
                _count: {
                    select: {
                        seguimientos: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            tickets
        })
    } catch (error) {
        console.error('Error al obtener tickets:', error)
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
