'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeft,
    Clock,
    User,
    MessageSquare,
    Send,
    AlertCircle,
    CheckCircle,
    Package,
    Calendar,
    Tag,
    QrCode,
    Download,
    Settings,
    FileText,
    Star,
    ImageIcon
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function TicketDetailPage() {
    const params = useParams()
    const id = params?.id as string
    const router = useRouter()
    const { data: session, status } = useSession()
    const [ticket, setTicket] = useState<any>(null)
    const [nuevoComentario, setNuevoComentario] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [isSubmittingRating, setIsSubmittingRating] = useState(false)

    // Preview de imagen
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    // --- Lógica de Resolución (Base de Conocimiento) ---
    const [isResolucionModalOpen, setIsResolucionModalOpen] = useState(false)
    const [resolucionData, setResolucionData] = useState({ title: '', content: '', id: '' })
    const [isSavingResolucion, setIsSavingResolucion] = useState(false)

    // Check staff role
    const isStaff = session?.user?.role === 'admin' || session?.user?.role === 'tecnico' || session?.user?.role === 'superadmin'

    const handleGestionarResolucion = async () => {
        if (!ticket) return

        // 1. Si el ticket ya tiene resolución asociada (viene en el GET /api/sat/tickets/[id])
        if (ticket.resolucion) {
            // Fetch contenido completo
            try {
                const res = await fetch(`/api/sat/tickets/${id}/resolucion`)
                const data = await res.json()
                if (data.success) {
                    setResolucionData({
                        id: data.resolucion.id,
                        title: data.resolucion.titulo,
                        content: data.resolucion.contenido
                    })
                    setIsResolucionModalOpen(true)
                } else {
                    alert('Error al cargar resolución: ' + data.error)
                }
            } catch (e) {
                console.error(e)
                alert('Error de conexión')
            }
        } else {
            // 2. Si no tiene, preparamos para crear una nueva
            let contenidoInicial = '## Procedimiento de Resolución\n\n1. Diagnóstico:\n2. Acciones realizadas:\n3. Pruebas finales:\n'

            // --- Lógica de Auto-rellenado desde Documentos ---
            if (ticket.documentos && ticket.documentos.length > 0) {
                const docsRelevantes = ticket.documentos.filter((d: any) =>
                    ['diagnostico_presupuesto', 'informe_mantenimiento', 'informe_entrega', 'acta_instalacion'].includes(d.tipo)
                )

                if (docsRelevantes.length > 0) {
                    contenidoInicial += '\n\n---\n### Histórico de Documentación Adjunta\n'

                    docsRelevantes.forEach((doc: any) => {
                        try {
                            const meta = typeof doc.metadatos === 'string' ? JSON.parse(doc.metadatos) : doc.metadatos
                            contenidoInicial += `\n#### Documento: ${doc.tipo.toUpperCase()} (${doc.numeroDocumento})\n`

                            if (doc.tipo === 'diagnostico_presupuesto') {
                                contenidoInicial += `- Diagnóstico: ${meta.diagnostico?.resultadosObtenidos || 'N/A'}\n`
                                contenidoInicial += `- Causa: ${meta.diagnostico?.causaRaiz || 'N/A'}\n`
                            } else if (doc.tipo === 'informe_mantenimiento') {
                                contenidoInicial += `- Obs. Hardware: ${meta.observacionesHardware || 'N/A'}\n`
                                contenidoInicial += `- Rendimiento: ${meta.rendimiento?.testRendimiento || 'N/A'}\n`
                            } else if (doc.tipo === 'informe_entrega') {
                                contenidoInicial += `- Reparación: ${meta.reparacion?.descripcionTecnica || 'N/A'}\n`
                            }
                        } catch (e) {
                            console.error('Error parseando metadatos para KB', e)
                        }
                    })
                }
            }

            setResolucionData({
                id: '',
                title: `Resolución: ${ticket.asunto}`,
                content: contenidoInicial
            })
            setIsResolucionModalOpen(true)
        }
    }

    const handleGuardarResolucion = async () => {
        setIsSavingResolucion(true)
        try {
            let res
            if (resolucionData.id) {
                // UPDATE (PUT)
                res = await fetch(`/api/sat/tickets/${id}/resolucion`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        titulo: resolucionData.title,
                        contenido: resolucionData.content,
                        estado: 'borrador' // Opcional, podría ser parámetro
                    })
                })
            } else {
                // CREATE (POST)
                res = await fetch(`/api/sat/tickets/${id}/resolucion`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                })
            }

            if (!resolucionData.id) {
                // Estábamos creando.
                const data = await res.json()
                if (data.success) {
                    // Ahora actualizamos con el contenido real del modal si es diferente al default
                    await fetch(`/api/sat/tickets/${id}/resolucion`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            titulo: resolucionData.title,
                            contenido: resolucionData.content
                        })
                    })
                    // Refrescar ticket para coger la asociación
                    fetchTicket()
                    setIsResolucionModalOpen(false)
                } else {
                    alert('Error al crear: ' + data.error)
                }
            } else {
                // Update normal
                const data = await res.json()
                if (data.success) {
                    setIsResolucionModalOpen(false)
                    alert('Resolución guardada correctamente')
                } else {
                    alert('Error al guardar: ' + data.error)
                }
            }

        } catch (e) {
            console.error(e)
            alert('Error al guardar resolución')
        } finally {
            setIsSavingResolucion(false)
        }
    }

    const [error, setError] = useState<string | null>(null)

    const fetchTicket = async (silent = false) => {
        if (!id) return
        if (!silent) setIsLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/sat/tickets/${id}`)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al cargar el ticket')
            }

            if (data.success) {
                // Si estamos enviando, no sobreescribir con datos antiguos si hubiera lag,
                // aunque lo ideal es que el servidor mande lo último.
                // Como setTicket reemplaza todo, está bien.
                setTicket(data.ticket)
                if (data.ticket.satisfaccion) {
                    setRating(data.ticket.satisfaccion)
                }

                // Generar QR solo la primera vez o si cambia (opcional, pero lo dejamos aquí por simplicidad)
                if (!qrCodeUrl && !silent) {
                    const ticketUrl = `${window.location.origin}/sat/${id}`
                    try {
                        const qrDataUrl = await QRCode.toDataURL(ticketUrl, {
                            width: 256,
                            margin: 2,
                            color: {
                                dark: '#000000',
                                light: '#FFFFFF'
                            }
                        })
                        setQrCodeUrl(qrDataUrl)
                    } catch (qrError) {
                        console.error('Error generating QR code:', qrError)
                    }
                }
            }
        } catch (error: any) {
            console.error('Error fetching ticket:', error)
            if (!silent) setError(error.message || 'No se pudo cargar la información del ticket')
        } finally {
            if (!silent) setIsLoading(false)
        }
    }

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/sat/' + id)
        } else if (session && id) {
            fetchTicket()
        }
    }, [id, session, status])

    // Polling para actualización automática de mensajes (cada 5 segundos)
    useEffect(() => {
        if (!id || status !== 'authenticated') return

        const intervalId = setInterval(() => {
            fetchTicket(true)
        }, 5000)

        return () => clearInterval(intervalId)
    }, [id, status])

    const handleEnviarComentario = async () => {
        if (!nuevoComentario.trim() || !id) return

        setIsSending(true)
        try {
            const res = await fetch(`/api/sat/tickets/${id}/comentarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contenido: nuevoComentario })
            })

            const data = await res.json()
            if (data.success) {
                setNuevoComentario('')
                fetchTicket()
            }
        } catch (error) {
            console.error('Error sending comment:', error)
        } finally {
            setIsSending(false)
        }
    }

    const handleRating = async (value: number) => {
        setRating(value)
        setIsSubmittingRating(true)
        try {
            await fetch(`/api/sat/tickets/${id}/valorar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ satisfaccion: value })
            })
            fetchTicket(true)
        } catch (error) {
            console.error('Error submitting rating:', error)
        } finally {
            setIsSubmittingRating(false)
        }
    }

    const generateTicketPDF = async () => {
        if (!ticket) return

        const doc = new jsPDF()

        // Header
        doc.setFontSize(22)
        doc.setTextColor(0, 48, 135)
        doc.text('MICROINFO SAT', 14, 22)

        doc.setFontSize(12)
        doc.setTextColor(100)
        doc.text('Resumen de Ticket de Soporte', 14, 30)
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 30)

        // Separator line
        doc.setDrawColor(200)
        doc.line(14, 35, 196, 35)

        // Ticket Info
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text(`Número de Ticket: ${ticket.numeroTicket}`, 14, 45)

        const estadoInfo = getEstadoInfo(ticket.estado)
        doc.text(`Estado: ${estadoInfo.label.toUpperCase()}`, 14, 52)

        // Client and Priority Info
        doc.setFontSize(12)
        doc.text('INFORMACIÓN DEL TICKET', 14, 65)
        doc.setFontSize(10)
        doc.text(`Cliente: ${ticket.usuario?.nombre || 'N/A'}`, 14, 72)
        doc.text(`Email: ${ticket.usuario?.email || 'N/A'}`, 14, 78)
        doc.text(`Prioridad: ${ticket.prioridad.toUpperCase()}`, 14, 84)
        doc.text(`Tipo: ${ticket.tipo}`, 14, 90)

        // Technician info (right side)
        if (ticket.tecnico) {
            doc.text('TÉCNICO ASIGNADO:', 110, 65)
            doc.text(`${ticket.tecnico.usuario.nombre}`, 110, 72)
            doc.text(`Nivel: ${ticket.tecnico.nivel}`, 110, 78)
        }

        // Subject and Description
        doc.setFontSize(12)
        doc.text('ASUNTO:', 14, 105)
        doc.setFontSize(10)
        const asuntoLines = doc.splitTextToSize(ticket.asunto, 180)
        doc.text(asuntoLines, 14, 112)

        let currentY = 112 + (asuntoLines.length * 5) + 8

        doc.setFontSize(12)
        doc.text('DESCRIPCIÓN:', 14, currentY)
        currentY += 7
        doc.setFontSize(10)
        const descripcionLines = doc.splitTextToSize(ticket.descripcion, 180)
        doc.text(descripcionLines, 14, currentY)

        currentY += (descripcionLines.length * 5) + 10

        // Serial number if exists
        if (ticket.numeroSerieProducto) {
            doc.setFontSize(12)
            doc.text('NÚMERO DE SERIE:', 14, currentY)
            currentY += 7
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(ticket.numeroSerieProducto, 14, currentY)
            doc.setFont('helvetica', 'normal')
            currentY += 10
        }

        // Seguimiento table
        if (ticket.seguimientos && ticket.seguimientos.length > 0) {
            const seguimientoData = ticket.seguimientos.slice(0, 5).map((seg: any) => [
                new Date(seg.fechaCreacion).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                seg.usuario?.nombre || 'Sistema',
                seg.contenido.substring(0, 60) + (seg.contenido.length > 60 ? '...' : '')
            ])

            autoTable(doc, {
                startY: currentY,
                head: [['Fecha', 'Usuario', 'Comentario']],
                body: seguimientoData,
                theme: 'grid',
                headStyles: { fillColor: [0, 48, 135] },
                styles: { fontSize: 9 }
            })

            currentY = (doc as any).lastAutoTable.finalY + 10
        }

        // QR Code
        if (qrCodeUrl) {
            // Add QR code to PDF
            const qrSize = 40
            const qrX = 14
            const qrY = currentY

            doc.setFontSize(10)
            doc.text('Escanea para seguimiento:', qrX, qrY)
            doc.addImage(qrCodeUrl, 'PNG', qrX, qrY + 5, qrSize, qrSize)

            doc.setFontSize(8)
            doc.setTextColor(100)
            const ticketUrl = `${window.location.origin}/sat/${id}`
            doc.text(ticketUrl, qrX + qrSize + 5, qrY + 20, { maxWidth: 130 })
        }

        // Footer
        const pageHeight = doc.internal.pageSize.height
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text('Microinfo - Servicio Técnico Profesional', 14, pageHeight - 10)
        doc.text(`Generado el ${new Date().toLocaleString()}`, 150, pageHeight - 10)

        // Save PDF
        doc.save(`Ticket_${ticket.numeroTicket}.pdf`)
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="min-h-screen py-16 flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">
                    {error || 'Ticket no encontrado'}
                </h1>
                <p className="text-muted-foreground mb-6">
                    {error ? 'Hubo un problema al acceder al ticket.' : 'El ticket solicitado no existe o no tienes permiso para verlo.'}
                </p>
                <Button asChild>
                    <Link href="/sat">Volver a mis tickets</Link>
                </Button>
            </div>
        )
    }

    const getPrioridadColor = (p: string) => {
        const colors: any = {
            baja: 'bg-green-100 text-green-800 border-green-200',
            media: 'bg-blue-100 text-blue-800 border-blue-200',
            alta: 'bg-orange-100 text-orange-800 border-orange-200',
            urgente: 'bg-red-100 text-red-800 border-red-200'
        }
        return colors[p] || 'bg-gray-100'
    }

    const getEstadoInfo = (e: string) => {
        const info: any = {
            abierto: { label: 'Abierto', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            asignado: { label: 'Asignado', color: 'bg-blue-100 text-blue-800', icon: User },
            en_progreso: { label: 'En Progreso', color: 'bg-purple-100 text-purple-800', icon: Package },
            pendiente_cliente: { label: 'Pendiente Cliente', color: 'bg-orange-100 text-orange-800', icon: Clock },
            pendiente_pieza: { label: 'Esperando Pieza', color: 'bg-indigo-100 text-indigo-800', icon: Package },
            resuelto: { label: 'Resuelto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
            cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
        }
        return info[e] || { label: e, color: 'bg-gray-100', icon: AlertCircle }
    }

    const estadoInfo = getEstadoInfo(ticket.estado)

    return (
        <div className="min-h-screen py-8 bg-muted/30">
            <div className="container max-w-5xl">
                <Link href="/sat" className="inline-flex items-center gap-2 mb-6 text-sm font-medium hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Mis Tickets
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-lg border-none">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                        {ticket.numeroTicket}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={generateTicketPDF}
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Descargar PDF
                                        </Button>
                                        <Badge className={`${estadoInfo.color} border-none shadow-sm px-4 py-1 rounded-full`}>
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <estadoInfo.icon className="h-3.5 w-3.5" />
                                                {estadoInfo.label.toUpperCase()}
                                            </div>
                                        </Badge>
                                    </div>
                                </div>
                                <CardTitle className="text-4xl font-extrabold tracking-tight text-foreground">{ticket.asunto}</CardTitle>
                                <CardDescription className="pt-6 text-lg leading-relaxed text-foreground/70 font-medium">
                                    {ticket.descripcion}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-8 text-sm text-muted-foreground border-t pt-6 bg-muted/5 p-4 rounded-xl mt-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span className="font-semibold">Creado el {new Date(ticket.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-primary" />
                                        <span className="capitalize font-semibold">Tipo: {ticket.tipo}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {(ticket.estado === 'resuelto' || ticket.estado === 'cerrado') && !isStaff && (
                            <Card className="shadow-lg border-2 border-yellow-400/20 bg-yellow-50/50">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2 text-yellow-700">
                                        <div className="bg-yellow-100 p-2 rounded-full">
                                            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                        </div>
                                        Valorar Atención y Resolución
                                    </CardTitle>
                                    <CardDescription>
                                        ¿Qué tal ha sido el servicio técnico? Su opinión nos ayuda a mejorar.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center gap-4 py-4">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className="transition-all hover:scale-110 focus:outline-none"
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => handleRating(star)}
                                                    disabled={isSubmittingRating}
                                                >
                                                    <Star
                                                        className={`h-10 w-10 ${(hoverRating || rating) >= star
                                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground h-5 text-center">
                                            {hoverRating === 1 && "Muy insatisfecho"}
                                            {hoverRating === 2 && "Insatisfecho"}
                                            {hoverRating === 3 && "Normal"}
                                            {hoverRating === 4 && "Satisfecho"}
                                            {hoverRating === 5 && "Muy satisfecho"}
                                            {!hoverRating && rating > 0 && "¡Gracias por su valoración!"}
                                            {!hoverRating && rating === 0 && "Seleccione una puntuación"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="flex flex-col shadow-xl border-none overflow-hidden">
                            {/* ... Chat Content ... */}
                            <CardHeader className="border-b bg-primary/5">
                                <CardTitle className="text-xl flex items-center gap-2 font-black text-primary">
                                    <MessageSquare className="h-6 w-6" />
                                    SEGUIMIENTO TÉCNICO
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 bg-muted/10">
                                <div className="max-h-[600px] min-h-[400px] overflow-y-auto p-8 space-y-8">
                                    {ticket.seguimientos && ticket.seguimientos.length > 0 ? (
                                        ticket.seguimientos.map((seg: any) => (
                                            <div key={seg.id} className={`flex ${seg.usuarioId === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] rounded-3xl p-5 shadow-sm relative group ${seg.usuarioId === session?.user?.id
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none ml-12'
                                                    : 'bg-white text-foreground rounded-tl-none mr-12 border'
                                                    }`}>
                                                    <div className={`flex items-center justify-between gap-8 mb-3 pb-2 border-b ${seg.usuarioId === session?.user?.id ? 'border-white/20' : 'border-muted'
                                                        }`}>
                                                        <span className="text-xs font-black uppercase tracking-widest opacity-90">
                                                            {seg.usuarioId === session?.user?.id ? `Tú (${session?.user?.name || 'Yo'})` : (seg.usuario?.nombre || 'Especialista MicroInfo')}
                                                        </span>
                                                        <span className="text-[10px] font-bold opacity-70 whitespace-nowrap">
                                                            {new Date(seg.fechaCreacion).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[15px] whitespace-pre-wrap leading-relaxed font-medium">{seg.contenido}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 text-muted-foreground">
                                            <div className="w-24 h-24 bg-white shadow-inner rounded-full flex items-center justify-center mx-auto mb-6">
                                                <MessageSquare className="h-12 w-12 opacity-10" />
                                            </div>
                                            <p className="text-xl font-bold text-foreground/40">Sin mensajes todavía</p>
                                            <p className="text-sm opacity-50 mt-2">Personal técnico revisará su caso en breve.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t p-8 bg-white">
                                <div className="w-full space-y-6">
                                    <div className="relative">
                                        <Textarea
                                            placeholder="Escriba aquí sus dudas, fotos o aclaraciones..."
                                            value={nuevoComentario}
                                            onChange={(e) => setNuevoComentario(e.target.value)}
                                            className="resize-none focus-visible:ring-primary border-muted-foreground/20 rounded-2xl p-6 text-[15px] shadow-sm min-h-[120px]"
                                        />
                                        <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground font-bold uppercase">
                                            Mensaje de Cliente
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[11px] text-muted-foreground italic font-medium">
                                            Su mensaje será notificado al técnico asignado.
                                        </p>
                                        <Button
                                            onClick={handleEnviarComentario}
                                            disabled={isSending || !nuevoComentario.trim()}
                                            className="px-10 h-14 rounded-full gap-3 font-black text-lg shadow-xl hover:shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95"
                                        >
                                            {isSending ? 'Enviando...' : 'ENVIAR MENSAJE'}
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {isStaff && (
                            <Card className="shadow-xl border-none overflow-hidden rounded-3xl ring-2 ring-primary bg-primary/5">
                                <CardHeader className="bg-primary pb-3">
                                    <CardTitle className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        PANEL DE GESTIÓN TÉCNICA
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <p className="text-sm text-primary/80 font-medium">
                                        Herramientas exclusivas para el personal técnico.
                                    </p>
                                    <Button
                                        onClick={handleGestionarResolucion}
                                        className="w-full bg-white text-primary hover:bg-white/90 font-bold shadow-sm"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        {ticket.resolucionId
                                            ? 'Ver / Editar Procedimiento Resolución'
                                            : (['asignado', 'en_progreso', 'pendiente_cliente'].includes(ticket.estado))
                                                ? 'AGREGAR HISTÓRICO A LA BASE DE CONOCIMIENTO'
                                                : 'Crear Procedimiento de Resolución'
                                        }
                                    </Button>
                                    {ticket.resolucionId && (
                                        <p className="text-xs text-center text-primary/60 font-medium">
                                            * Resolución ya vinculada
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="shadow-xl border-none overflow-hidden rounded-3xl">
                            <div className="h-2 bg-primary w-full" />
                            <CardHeader className="bg-muted/5 pb-2">
                                <CardTitle className="text-2xl font-black tracking-tight">DATOS DEL SAT</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-4">
                                <div className="space-y-3">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Nivel de Prioridad</p>
                                    <Badge className={`${getPrioridadColor(ticket.prioridad)} px-5 py-2 text-[13px] font-black border-none rounded-xl shadow-sm w-full flex justify-center`}>
                                        {ticket.prioridad.toUpperCase()}
                                    </Badge>
                                </div>

                                <Separator className="opacity-50" />

                                <div className="space-y-4">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Responsable Técnico</p>
                                    {ticket.tecnico ? (
                                        <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-3xl border border-primary/10 transition-colors hover:bg-primary/10">
                                            <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl shadow-xl rotate-3">
                                                {ticket.tecnico.usuario.nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-primary leading-none mb-1">{ticket.tecnico.usuario.nombre}</p>
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Nivel {ticket.tecnico.nivel}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 p-6 bg-amber-50 rounded-3xl border border-amber-100 text-amber-800 text-center">
                                            <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center animate-bounce">
                                                <Clock className="h-6 w-6" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-tighter">Buscando técnico calificado...</p>
                                        </div>
                                    )}
                                </div>

                                {ticket.numeroSerieProducto && (
                                    <>
                                        <Separator className="opacity-50" />
                                        <div className="space-y-3">
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Identificador de Producto</p>
                                            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-sm break-all shadow-inner border-2 border-slate-800 relative group">
                                                <div className="absolute -top-2 -left-2 bg-primary text-[8px] font-black px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">S/N</div>
                                                {ticket.numeroSerieProducto}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Información de Cita para Incidencias con Acceso Remoto */}
                                {ticket.tipo === 'incidencia' && ticket.documentos && ticket.documentos.some((doc: any) =>
                                    doc.tipo === 'orden_intervencion' && doc.metadatos
                                ) && (() => {
                                    const ordenIntervencion = ticket.documentos.find((doc: any) => doc.tipo === 'orden_intervencion')
                                    let metadatos: any = {}
                                    try {
                                        metadatos = JSON.parse(ordenIntervencion.metadatos)
                                    } catch (e) {
                                        console.error('Error parsing metadatos:', e)
                                    }

                                    if (metadatos.tipoAcceso === 'remoto' && metadatos.fechaHoraPreferida) {
                                        const fecha = new Date(metadatos.fechaHoraPreferida)
                                        return (
                                            <>
                                                <Separator className="opacity-50" />
                                                <div className="space-y-4">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Cita de Asistencia Remota</p>

                                                    {/* Fecha y Hora */}
                                                    <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl space-y-2">
                                                        <div className="flex items-center gap-2 text-amber-900">
                                                            <Clock className="h-5 w-5" />
                                                            <p className="text-xs font-black uppercase">Horario Programado</p>
                                                        </div>
                                                        <p className="text-lg font-black text-amber-900">
                                                            {fecha.toLocaleDateString('es-ES', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                        <p className="text-2xl font-black text-amber-900">
                                                            {fecha.toLocaleTimeString('es-ES', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        <p className="text-xs text-amber-700 font-medium">
                                                            ⚠️ Debe estar disponible en este horario
                                                        </p>
                                                    </div>

                                                    {/* Enlace AnyDesk */}
                                                    <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-2xl space-y-3">
                                                        <div className="flex items-center gap-2 text-blue-900">
                                                            <Download className="h-5 w-5" />
                                                            <p className="text-xs font-black uppercase">Aplicación Requerida</p>
                                                        </div>
                                                        <p className="text-sm text-blue-800 font-medium">
                                                            Para la asistencia remota, necesita descargar AnyDesk:
                                                        </p>
                                                        <a
                                                            href="https://anydesk.com/es/downloads/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block w-full"
                                                        >
                                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg">
                                                                <Download className="h-4 w-4 mr-2" />
                                                                DESCARGAR ANYDESK
                                                            </Button>
                                                        </a>
                                                        <div className="bg-white border border-blue-200 rounded-lg p-3 space-y-2">
                                                            <p className="text-xs font-black text-blue-900">📝 INSTRUCCIONES:</p>
                                                            <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                                                                <li>Ejecuta el archivo descargado</li>
                                                                <li>Aparecerá un <span className="font-bold">número de 9 dígitos</span></li>
                                                                <li><span className="font-bold">Envía ese número</span> en el chat de seguimiento</li>
                                                            </ol>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }
                                    return null
                                })()}
                            </CardContent>
                        </Card>

                        {qrCodeUrl && (
                            <Card className="shadow-xl border-none overflow-hidden rounded-3xl">
                                <div className="h-2 bg-gradient-to-r from-primary to-primary/60 w-full" />
                                <CardHeader className="bg-muted/5 pb-2">
                                    <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                        <QrCode className="h-5 w-5 text-primary" />
                                        CÓDIGO QR
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    <div className="flex justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-primary/20">
                                        <img
                                            src={qrCodeUrl}
                                            alt="QR Code para seguimiento"
                                            className="w-48 h-48"
                                        />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Escanea para seguimiento rápido
                                        </p>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                                            Comparte este código QR para acceder directamente al estado de tu ticket desde cualquier dispositivo.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Evidencias Fotográficas */}
                        {ticket.documentos && ticket.documentos.filter((d: any) =>
                            d.evidenciasFotos || d.rutaArchivo?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                        ).length > 0 && (
                                <Card className="shadow-xl border-none overflow-hidden rounded-3xl">
                                    <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 w-full" />
                                    <CardHeader className="bg-muted/5 pb-2">
                                        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            EVIDENCIAS FOTOGRÁFICAS
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {ticket.documentos
                                                .filter((d: any) => d.evidenciasFotos)
                                                .map((doc: any) => {
                                                    let evidencias: any[] = []
                                                    try {
                                                        evidencias = JSON.parse(doc.evidenciasFotos)
                                                    } catch (e) {
                                                        console.error('Error parseando evidencias:', e)
                                                    }

                                                    return evidencias.map((img: any) => (
                                                        <div key={img.id} className="border rounded-lg overflow-hidden">
                                                            <div className="aspect-square relative">
                                                                <Image
                                                                    src={img.url}
                                                                    alt={img.descripcion || 'Evidencia'}
                                                                    fill
                                                                    className="object-cover cursor-pointer hover:opacity-90"
                                                                    onClick={() => setPreviewImage(img.url)}
                                                                    sizes="33vw"
                                                                />
                                                            </div>
                                                            <div className="p-3">
                                                                <p className="text-sm font-medium truncate">
                                                                    {img.descripcion || 'Sin descripción'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(img.fechaCaptura).toLocaleDateString('es-ES', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                })
                                            }
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-none shadow-none p-1 rounded-3xl">
                            <div className="bg-white/80 backdrop-blur-sm rounded-[22px] p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-sm font-black text-primary uppercase">Asistencia en Vivo</CardTitle>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold">
                                    Este canal es directo. Si desea añadir capturas de pantalla o documentos, indíquelo en el chat y el técnico le habilitará el enlace de subida.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal Resolución */}
            <Dialog open={isResolucionModalOpen} onOpenChange={setIsResolucionModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-2xl font-black">Procedimiento de Resolución</DialogTitle>
                        <DialogDescription>
                            Documenta los pasos técnicos y la solución aplicada. Esto se guardará en la base de conocimiento.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Título del Artículo</Label>
                            <Input
                                value={resolucionData.title}
                                onChange={(e) => setResolucionData({ ...resolucionData, title: e.target.value })}
                                className="font-bold text-lg"
                                placeholder="Ej: Resolución: Fallo en placa base..."
                            />
                        </div>
                        <div className="space-y-2 h-[400px]">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Contenido Detallado (Markdown soportado)</Label>
                            <Textarea
                                value={resolucionData.content}
                                onChange={(e) => setResolucionData({ ...resolucionData, content: e.target.value })}
                                className="h-full font-mono text-sm leading-relaxed resize-none p-4"
                                placeholder="Describe el procedimiento técnico..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="border-t pt-4">
                        <Button variant="ghost" onClick={() => setIsResolucionModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleGuardarResolucion} disabled={isSavingResolucion} className="gap-2">
                            {isSavingResolucion ? 'Guardando...' : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Guardar Resolución
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de preview de imagen */}
            {previewImage && (
                <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                    <DialogContent className="max-w-4xl p-0">
                        <div className="relative w-full h-[70vh]">
                            <Image
                                src={previewImage}
                                alt="Vista previa"
                                fill
                                className="object-contain bg-gray-100"
                                sizes="100vw"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
