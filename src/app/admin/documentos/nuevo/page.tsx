'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { DocumentoTipo, DocumentoEntidadTipo } from '@/types/enums'
import type {
    MetadatosOrdenServicio,
    MetadatosDiagnosticoPresupuesto,
    MetadatosAceptacionPresupuesto,
    MetadatosRechazoPresupuesto,
    MetadatosExtensionPresupuesto,
    MetadatosAlbaranEntrega
} from '@/types/documentos'
import { DiagnosticoPresupuestoForm } from '@/components/documentos/DiagnosticoPresupuestoForm'
import { TicketSelector } from '@/components/tickets/TicketSelector'
import { OrdenServicioForm } from '@/components/documentos/OrdenServicioForm'
import { AceptacionPresupuestoForm, RechazoPresupuestoForm } from '@/components/documentos/AceptacionRechazoForms'
import { ExtensionPresupuestoForm } from '@/components/documentos/ExtensionPresupuestoForm'
import { AlbaranEntregaForm } from '@/components/documentos/AlbaranEntregaForm'

export default function NuevoDocumentoPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Si viene ticketId por URL, lo usamos por defecto
    const ticketIdParam = searchParams.get('ticketId') || ''

    const [tipoDocumento, setTipoDocumento] = useState<DocumentoTipo>(DocumentoTipo.ORDEN_SERVICIO)
    const [ticketId, setTicketId] = useState(ticketIdParam)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Tipo unión de todos los metadatos posibles
    type AnyMetadatos =
        | MetadatosOrdenServicio
        | MetadatosDiagnosticoPresupuesto
        | MetadatosAceptacionPresupuesto
        | MetadatosRechazoPresupuesto
        | MetadatosExtensionPresupuesto
        | MetadatosAlbaranEntrega

    const handleSubmit = async (metadatos: AnyMetadatos, ticketIdFromForm?: string) => {
        console.log('--- INTENTANDO CREAR DOCUMENTO ---')
        console.log('Tipo:', tipoDocumento)
        console.log('TicketID desde URL:', ticketId || ticketIdParam)
        console.log('TicketID desde Form:', ticketIdFromForm)
        console.log('Metadatos:', metadatos)

        setIsSubmitting(true)

        try {
            // Para Orden de Servicio, usar el ticketId del formulario si existe
            const finalTicketId = ticketIdFromForm || ticketId || ticketIdParam || undefined

            const payload = {
                tipo: tipoDocumento,
                entidadTipo: DocumentoEntidadTipo.TICKET,
                ticketId: finalTicketId,
                metadatos: metadatos,
            }
            console.log('Payload a enviar:', payload)

            const response = await fetch('/api/admin/documentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            console.log('Respuesta status:', response.status)
            const data = await response.json()
            console.log('Respuesta data:', data)

            if (data.success) {
                console.log('Creación exitosa, redirigiendo...')
                router.push(`/admin/documentos/${data.data.id}`)
            } else {
                console.error('Error reportado por API:', data.error)
                alert('Error al crear documento: ' + (data.error || JSON.stringify(data)))
            }
        } catch (error) {
            console.error('Error excepcion al crear documento:', error)
            alert('Error grave al crear documento: ' + String(error))
        } finally {
            setIsSubmitting(false)
        }
    }

    const requiresTicket = [
        DocumentoTipo.DIAGNOSTICO_PRESUPUESTO,
        DocumentoTipo.ACEPTACION_PRESUPUESTO,
        DocumentoTipo.RECHAZO_PRESUPUESTO,
        DocumentoTipo.EXTENSION_PRESUPUESTO,
        DocumentoTipo.ALBARAN_ENTREGA
    ].includes(tipoDocumento)

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 lg:ml-64 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Button variant="outline" asChild>
                                <Link href="/admin/documentos">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold">Nuevo Documento</h1>
                                <p className="text-gray-600">Crear un nuevo documento del sistema</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Formulario principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tipo de documento */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tipo de Documento</CardTitle>
                                    <CardDescription>
                                        Selecciona el tipo de documento que deseas crear
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="tipoDocumento">Tipo</Label>
                                            <Select
                                                value={tipoDocumento}
                                                onValueChange={(value) => setTipoDocumento(value as DocumentoTipo)}
                                            >
                                                <SelectTrigger id="tipoDocumento">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={DocumentoTipo.ORDEN_SERVICIO}>
                                                        Orden de Servicio
                                                    </SelectItem>
                                                    <SelectItem value={DocumentoTipo.DIAGNOSTICO_PRESUPUESTO}>
                                                        Diagnóstico y Presupuesto
                                                    </SelectItem>
                                                    <SelectItem value={DocumentoTipo.ACEPTACION_PRESUPUESTO}>
                                                        Aceptación de Presupuesto
                                                    </SelectItem>
                                                    <SelectItem value={DocumentoTipo.RECHAZO_PRESUPUESTO}>
                                                        Rechazo de Presupuesto
                                                    </SelectItem>
                                                    <SelectItem value={DocumentoTipo.EXTENSION_PRESUPUESTO}>
                                                        Extensión de Presupuesto
                                                    </SelectItem>
                                                    <SelectItem value={DocumentoTipo.ALBARAN_ENTREGA}>
                                                        Albarán de Entrega
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Selector de Ticket */}
                                        {tipoDocumento !== DocumentoTipo.ORDEN_SERVICIO && (
                                            <div>
                                                <Label htmlFor="ticketSelector">
                                                    Vincular a Ticket Existente <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="mt-1">
                                                    {ticketIdParam ? (
                                                        // Si viene por URL, mostrar solo lectura
                                                        <div className="border p-2 rounded bg-gray-100 text-sm text-gray-700">
                                                            Ticket ID Vinculado: <strong>{ticketIdParam}</strong>
                                                        </div>
                                                    ) : (
                                                        // Si no, usar el selector
                                                        <TicketSelector
                                                            value={ticketId}
                                                            onChange={setTicketId}
                                                        />
                                                    )}
                                                </div>
                                                {!ticketId && !ticketIdParam && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        Debes seleccionar un ticket para continuar.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Aviso de Requerimiento de Ticket */}
                            {requiresTicket && !ticketId && !ticketIdParam ? (
                                <Card className="border-yellow-300 bg-yellow-50">
                                    <CardContent className="py-6 text-center">
                                        <div className="flex justify-center mb-4">
                                            <span className="text-4xl">⚠️</span>
                                        </div>
                                        <h3 className="text-lg font-medium text-yellow-800 mb-2">
                                            Ticket Requerido
                                        </h3>
                                        <p className="text-yellow-700 mb-4">
                                            Este tipo de documento <strong>debe</strong> estar vinculado a un Ticket existente.
                                        </p>
                                        <p className="text-sm text-yellow-600">
                                            Por favor, ve al detalle del Ticket correspondiente y selecciona "Generar Documento",
                                            o ingresa el ID del Ticket en el panel de la izquierda.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {/* Formulario específico según el tipo */}
                                    {tipoDocumento === DocumentoTipo.ORDEN_SERVICIO && (
                                        <OrdenServicioForm
                                            onSubmit={handleSubmit}
                                            onCancel={() => router.push('/admin/documentos')}
                                            isSubmitting={isSubmitting}
                                        />
                                    )}

                                    {tipoDocumento === DocumentoTipo.DIAGNOSTICO_PRESUPUESTO && (
                                        <DiagnosticoPresupuestoForm
                                            ticketId={ticketId || ticketIdParam}
                                            onSubmit={(metadatos) => handleSubmit(metadatos)}
                                            onCancel={() => router.push('/admin/documentos')}
                                        />
                                    )}

                                    {tipoDocumento === DocumentoTipo.ACEPTACION_PRESUPUESTO && (
                                        <AceptacionPresupuestoForm
                                            onSubmit={(metadatos) => handleSubmit(metadatos)}
                                            onCancel={() => router.push('/admin/documentos')}
                                            isSubmitting={isSubmitting}
                                        />
                                    )}

                                    {tipoDocumento === DocumentoTipo.RECHAZO_PRESUPUESTO && (
                                        <RechazoPresupuestoForm
                                            onSubmit={(metadatos) => handleSubmit(metadatos)}
                                            onCancel={() => router.push('/admin/documentos')}
                                            isSubmitting={isSubmitting}
                                        />
                                    )}

                                    {tipoDocumento === DocumentoTipo.EXTENSION_PRESUPUESTO && (
                                        <ExtensionPresupuestoForm
                                            onSubmit={(metadatos) => handleSubmit(metadatos)}
                                            onCancel={() => router.push('/admin/documentos')}
                                            isSubmitting={isSubmitting}
                                        />
                                    )}

                                    {tipoDocumento === DocumentoTipo.ALBARAN_ENTREGA && (
                                        <AlbaranEntregaForm
                                            ticketId={ticketId || ticketIdParam}
                                            onSubmit={(metadatos) => handleSubmit(metadatos)}
                                            onCancel={() => router.push('/admin/documentos')}
                                            isSubmitting={isSubmitting}
                                        />
                                    )}
                                </>
                            )}


                            {/* Mensaje para otros tipos de documentos no implementados */}
                            {![
                                DocumentoTipo.ORDEN_SERVICIO,
                                DocumentoTipo.DIAGNOSTICO_PRESUPUESTO,
                                DocumentoTipo.ACEPTACION_PRESUPUESTO,
                                DocumentoTipo.RECHAZO_PRESUPUESTO,
                                DocumentoTipo.EXTENSION_PRESUPUESTO,
                                DocumentoTipo.ALBARAN_ENTREGA
                            ].includes(tipoDocumento) && (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <p className="text-gray-500">
                                                El formulario para este tipo de documento aún no está implementado.
                                            </p>
                                            <p className="text-sm text-gray-400 mt-2">
                                                Por favor, selecciona otro tipo de documento disponible.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                        </div>

                        {/* Sidebar de acciones */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Información</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-gray-600 space-y-2">
                                    <p>
                                        Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                                    </p>
                                    <p>
                                        El documento se guardará como borrador y podrá ser editado posteriormente.
                                    </p>
                                    <p>
                                        Una vez guardado, podrás generar el PDF del documento.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
