'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Calendar,
    MapPin,
    Monitor,
    User,
    Phone,
    Clock,
    AlertTriangle,
    Download,
    ExternalLink
} from 'lucide-react'

interface OrdenIntervencionFormProps {
    documento: any
    ticket: any
    onClose?: () => void
}

export default function OrdenIntervencionForm({ documento, ticket, onClose }: OrdenIntervencionFormProps) {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    // Parsear metadatos
    const metadatos = documento.metadatos ? JSON.parse(documento.metadatos) : {}

    const handleGeneratePDF = async () => {
        setIsGeneratingPDF(true)
        try {
            const response = await fetch(`/api/admin/documentos/${documento.id}/pdf`)
            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${documento.numeroDocumento}.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }
        } catch (error) {
            console.error('Error al generar PDF:', error)
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const getEstadoBadge = () => {
        switch (documento.estadoDocumento) {
            case 'pendiente_firma':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Sin Asignar</Badge>
            case 'firmado':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Asignado</Badge>
            case 'enviado':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">En Proceso</Badge>
            case 'aceptado':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Completado</Badge>
            default:
                return <Badge variant="outline">{documento.estadoDocumento}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl">Orden de Intervención</CardTitle>
                            <CardDescription className="mt-2">
                                {documento.numeroDocumento} • Creado el {new Date(documento.fechaGeneracion).toLocaleDateString('es-ES')}
                            </CardDescription>
                        </div>
                        {getEstadoBadge()}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF}>
                            <Download className="h-4 w-4 mr-2" />
                            {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
                        </Button>
                        {onClose && (
                            <Button variant="outline" onClick={onClose}>
                                Cerrar
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Información del Ticket */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Información del Ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Número de Ticket</p>
                            <p className="font-medium">{ticket?.numeroTicket || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Asunto</p>
                            <p className="font-medium">{ticket?.asunto || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Prioridad</p>
                            <Badge variant={
                                ticket?.prioridad === 'urgente' ? 'destructive' :
                                    ticket?.prioridad === 'alta' ? 'default' :
                                        'secondary'
                            }>
                                {ticket?.prioridad || 'N/A'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Estado</p>
                            <Badge variant="outline">{ticket?.estado || 'N/A'}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tipo de Incidencia */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Tipo de Incidencia
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {metadatos.tiposIncidencia?.map((tipo: string) => (
                            <Badge key={tipo} variant="secondary" className="capitalize">
                                {tipo}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Descripción y Síntomas */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Descripción y Síntomas Observados
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Descripción</p>
                        <p className="text-sm whitespace-pre-wrap">{ticket?.descripcion || 'N/A'}</p>
                    </div>
                    {metadatos.sintomasObservados && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Síntomas Observados</p>
                            <p className="text-sm whitespace-pre-wrap">{metadatos.sintomasObservados}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tipo de Acceso */}
            <Card className={metadatos.tipoAcceso === 'remoto' ? 'border-blue-300 bg-blue-50/30' : ''}>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Tipo de Acceso
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-start gap-3">
                            {metadatos.tipoAcceso === 'remoto' ? (
                                <Monitor className="h-5 w-5 text-blue-600 mt-0.5" />
                            ) : (
                                <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className="font-medium capitalize mb-1">
                                    {metadatos.tipoAcceso === 'remoto' ? 'Acceso Remoto' : 'Intervención Presencial'}
                                </p>
                                {metadatos.tipoAcceso === 'remoto' ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            Autorizado por: <span className="font-medium text-foreground">{metadatos.autorizadoPor}</span>
                                        </p>

                                        {/* Horario destacado para acceso remoto */}
                                        <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="h-5 w-5 text-amber-700" />
                                                <p className="font-bold text-amber-900">Horario Programado</p>
                                            </div>
                                            <p className="text-lg font-bold text-amber-900">
                                                {metadatos.fechaHoraPreferida ?
                                                    new Date(metadatos.fechaHoraPreferida).toLocaleString('es-ES', {
                                                        dateStyle: 'full',
                                                        timeStyle: 'short'
                                                    }) :
                                                    'No especificado'
                                                }
                                            </p>
                                            <p className="text-xs text-amber-700 mt-1">
                                                ⚠️ El cliente debe estar disponible en este horario
                                            </p>
                                        </div>

                                        {/* Instrucciones AnyDesk */}
                                        <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                                            <p className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                                                <Download className="h-4 w-4" />
                                                Instrucciones para el Cliente
                                            </p>

                                            <div className="space-y-3 text-sm text-blue-800">
                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold min-w-[20px]">1.</span>
                                                    <div>
                                                        <p className="font-medium">Descargar AnyDesk:</p>
                                                        <a
                                                            href="https://anydesk.com/es/downloads/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 mt-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                                                        >
                                                            Descargar AnyDesk
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold min-w-[20px]">2.</span>
                                                    <p>
                                                        <span className="font-medium">Ejecutar el archivo descargado</span> (no requiere instalación)
                                                    </p>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold min-w-[20px]">3.</span>
                                                    <div>
                                                        <p className="font-medium mb-1">Comunicar el número de identificación:</p>
                                                        <div className="p-2 bg-white border border-blue-200 rounded">
                                                            <p className="text-xs text-blue-700">
                                                                Al abrir AnyDesk, aparecerá un <span className="font-bold">número grande de 9 dígitos</span>.
                                                            </p>
                                                            <p className="text-xs text-blue-700 mt-1">
                                                                📝 <span className="font-bold">Envíe este número como mensaje</span> en la plataforma para que el técnico pueda conectarse.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                                                    <p className="text-xs text-amber-800">
                                                        ⏰ <span className="font-bold">Importante:</span> Tenga AnyDesk abierto en el horario programado arriba.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm">
                                                    {metadatos.direccion}
                                                    {metadatos.ciudad && `, ${metadatos.ciudad}`}
                                                    {metadatos.codigoPostal && ` (${metadatos.codigoPostal})`}
                                                </p>
                                            </div>
                                        </div>
                                        {metadatos.telefono && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm">{metadatos.telefono}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Horario Preferido - Solo para intervención presencial */}
            {metadatos.tipoAcceso !== 'remoto' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Horario Preferido
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                            <Clock className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium">
                                    {metadatos.fechaHoraPreferida ?
                                        new Date(metadatos.fechaHoraPreferida).toLocaleString('es-ES', {
                                            dateStyle: 'full',
                                            timeStyle: 'short'
                                        }) :
                                        'No especificado'
                                    }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Fecha y hora solicitada por el cliente
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Información del Cliente */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Información del Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Nombre</p>
                            <p className="font-medium">{metadatos.autorizadoPor || 'N/A'}</p>
                        </div>
                        {metadatos.telefono && (
                            <div>
                                <p className="text-sm text-muted-foreground">Teléfono</p>
                                <p className="font-medium">{metadatos.telefono}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
