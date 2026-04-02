'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { DocumentoTipo } from '@/types/enums'
import type {
    MetadatosOrdenServicio,
    MetadatosDiagnosticoPresupuesto,
    MetadatosAceptacionPresupuesto,
    MetadatosRechazoPresupuesto,
    MetadatosExtensionPresupuesto,
    MetadatosAlbaranEntrega
} from '@/types/documentos'
import { DiagnosticoPresupuestoForm } from '@/components/documentos/DiagnosticoPresupuestoForm'
import { OrdenServicioForm } from '@/components/documentos/OrdenServicioForm'
import { AceptacionPresupuestoForm, RechazoPresupuestoForm } from '@/components/documentos/AceptacionRechazoForms'
import { ExtensionPresupuestoForm } from '@/components/documentos/ExtensionPresupuestoForm'
import { AlbaranEntregaForm } from '@/components/documentos/AlbaranEntregaForm'

export default function EditarDocumentoPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Datos del documento
    const [documentoData, setDocumentoData] = useState<any>(null)
    const [tipoDocumento, setTipoDocumento] = useState<DocumentoTipo | null>(null)
    const [metadatos, setMetadatos] = useState<any>(null)

    useEffect(() => {
        if (id) {
            fetchDocumento()
        }
    }, [id])

    const fetchDocumento = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/admin/documentos/${id}`)
            const data = await response.json()

            if (data.success) {
                setDocumentoData(data.data)
                setTipoDocumento(data.data.tipo)

                if (data.data.metadatos) {
                    try {
                        setMetadatos(JSON.parse(data.data.metadatos))
                    } catch (e) {
                        console.error('Error parsing metadatos:', e)
                        setError('Error al procesar los datos del documento')
                    }
                }
            } else {
                setError(data.error || 'No se pudo cargar el documento')
            }
        } catch (err) {
            console.error('Error fetching document:', err)
            setError('Error de conexión al cargar el documento')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (nuevosMetadatos: any) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/admin/documentos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    metadatos: nuevosMetadatos
                }),
            })

            const data = await response.json()

            if (data.success) {
                router.push(`/admin/documentos/${id}`)
                router.refresh()
            } else {
                alert('Error al actualizar: ' + data.error)
            }
        } catch (err) {
            console.error('Error saving:', err)
            alert('Error al guardar los cambios')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex">
                    <AdminSidebar />
                    <main className="flex-1 lg:ml-64 p-8 flex items-center justify-center">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Cargando documento...</p>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    if (error || !documentoData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex">
                    <AdminSidebar />
                    <main className="flex-1 lg:ml-64 p-8">
                        <div className="text-center py-12">
                            <p className="text-red-500 mb-4">{error || 'Documento no encontrado'}</p>
                            <Button variant="outline" asChild>
                                <Link href="/admin/documentos">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver a Documentos
                                </Link>
                            </Button>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 lg:ml-64 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Button variant="outline" asChild>
                                <Link href={`/admin/documentos/${id}`}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold">Editar Documento</h1>
                                <p className="text-gray-600">
                                    {documentoData.numeroDocumento} - {tipoDocumento}
                                </p>
                            </div>
                        </div>
                    </div>



                    {/* Formulario según tipo */}
                    {tipoDocumento === DocumentoTipo.ORDEN_SERVICIO && (
                        <OrdenServicioForm
                            initialValues={metadatos as MetadatosOrdenServicio}
                            onSubmit={handleSubmit}
                            onCancel={() => router.push(`/admin/documentos/${id}`)}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {tipoDocumento === DocumentoTipo.DIAGNOSTICO_PRESUPUESTO && (
                        <DiagnosticoPresupuestoForm
                            ticketId={documentoData.ticketId}
                            initialValues={metadatos as MetadatosDiagnosticoPresupuesto}
                            onSubmit={handleSubmit}
                            onCancel={() => router.push(`/admin/documentos/${id}`)}
                        />
                    )}

                    {tipoDocumento === DocumentoTipo.ACEPTACION_PRESUPUESTO && (
                        <AceptacionPresupuestoForm
                            presupuestoId={metadatos?.presupuestoId}
                            initialValues={metadatos as MetadatosAceptacionPresupuesto}
                            onSubmit={handleSubmit}
                            onCancel={() => router.push(`/admin/documentos/${id}`)}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {tipoDocumento === DocumentoTipo.RECHAZO_PRESUPUESTO && (
                        <RechazoPresupuestoForm
                            presupuestoId={metadatos?.presupuestoId}
                            initialValues={metadatos as MetadatosRechazoPresupuesto}
                            onSubmit={handleSubmit}
                            onCancel={() => router.push(`/admin/documentos/${id}`)}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {tipoDocumento === DocumentoTipo.EXTENSION_PRESUPUESTO && (
                        <ExtensionPresupuestoForm
                            presupuestoOriginalId={metadatos?.presupuestoOriginalId}
                            initialValues={metadatos as MetadatosExtensionPresupuesto}
                            onSubmit={handleSubmit}
                            onCancel={() => router.push(`/admin/documentos/${id}`)}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {tipoDocumento === DocumentoTipo.ALBARAN_ENTREGA && (
                        <AlbaranEntregaForm
                            ticketId={documentoData.ticketId}
                            initialValues={metadatos as MetadatosAlbaranEntrega}
                            onSubmit={handleSubmit}
                            onCancel={() => router.push(`/admin/documentos/${id}`)}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {![
                        DocumentoTipo.ORDEN_SERVICIO,
                        DocumentoTipo.DIAGNOSTICO_PRESUPUESTO,
                        DocumentoTipo.ACEPTACION_PRESUPUESTO,
                        DocumentoTipo.RECHAZO_PRESUPUESTO,
                        DocumentoTipo.EXTENSION_PRESUPUESTO,
                        DocumentoTipo.ALBARAN_ENTREGA
                    ].includes(tipoDocumento as DocumentoTipo) && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-gray-500">
                                        La edición para este tipo de documento aún no está disponible.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                </main>
            </div>
        </div>
    )
}
