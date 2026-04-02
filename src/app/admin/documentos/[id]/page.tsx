'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    FileText,
    Download,
    Edit,
    Trash2,
    ArrowLeft,
    Calendar,
    User,
    Ticket,
    Package,
    Clock,
    CheckCircle,
    XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { DocumentoTipo, EstadoDocumento } from '@/types/enums'
import { DocumentoConRelaciones } from '@/types'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { EvidenciaFotografica } from '@/components/documentos/EvidenciaFotografica'
import type { EvidenciaFotografica as EvidenciaType } from '@/types/documentos'

// Mapeo de etiquetas
const DOCUMENTO_TIPO_LABELS: Record<DocumentoTipo, string> = {
    [DocumentoTipo.FACTURA]: 'Factura',
    [DocumentoTipo.ALBARAN]: 'Albarán',
    [DocumentoTipo.PRESUPUESTO]: 'Presupuesto',
    [DocumentoTipo.INFORME_REPARACION]: 'Informe de Reparación',
    [DocumentoTipo.GARANTIA]: 'Garantía',
    [DocumentoTipo.MANUAL]: 'Manual',
    [DocumentoTipo.ORDEN_SERVICIO]: 'Orden de Servicio',
    [DocumentoTipo.DIAGNOSTICO_PRESUPUESTO]: 'Diagnóstico y Presupuesto',
    [DocumentoTipo.ACEPTACION_PRESUPUESTO]: 'Aceptación de Presupuesto',
    [DocumentoTipo.RECHAZO_PRESUPUESTO]: 'Rechazo de Presupuesto',
    [DocumentoTipo.EXTENSION_PRESUPUESTO]: 'Extensión de Presupuesto',
    [DocumentoTipo.ACEPTACION_EXTENSION]: 'Aceptación de Extensión',
    [DocumentoTipo.ORDEN_TRABAJO_INTERNA]: 'Orden de Trabajo Interna',
    [DocumentoTipo.HOJA_RUTA]: 'Hoja de Ruta',
    [DocumentoTipo.ALBARAN_ENTREGA]: 'Albarán de Entrega',
    [DocumentoTipo.ORDEN_INTERVENCION]: 'Orden de Intervención',
    [DocumentoTipo.INFORME_MANTENIMIENTO]: 'Informe de Mantenimiento',
    [DocumentoTipo.ACTA_INSTALACION]: 'Acta de Instalación',
    [DocumentoTipo.INFORME_ENTREGA]: 'Informe de Entrega',
    [DocumentoTipo.AUTORIZACION_ACCESO_REMOTO]: 'Autorización Remota',
    [DocumentoTipo.ENCUESTA_SATISFACCION]: 'Encuesta Satisfacción',
    [DocumentoTipo.INFORME_MANTENIMIENTO_PREVENTIVO]: 'Informe Mantenimiento Preventivo',
    [DocumentoTipo.ACTA_INSTALACION_CONFIGURACION]: 'Acta Instalación y Configuración',
}

const ESTADO_DOCUMENTO_LABELS: Record<EstadoDocumento, string> = {
    [EstadoDocumento.BORRADOR]: 'Borrador',
    [EstadoDocumento.PENDIENTE_FIRMA]: 'Pendiente de Firma',
    [EstadoDocumento.FIRMADO]: 'Firmado',
    [EstadoDocumento.ENVIADO]: 'Enviado',
    [EstadoDocumento.ACEPTADO]: 'Aceptado',
    [EstadoDocumento.RECHAZADO]: 'Rechazado',
    [EstadoDocumento.VENCIDO]: 'Vencido',
    [EstadoDocumento.ANULADO]: 'Anulado',
}

const ESTADO_COLORS: Record<EstadoDocumento, string> = {
    [EstadoDocumento.BORRADOR]: 'bg-gray-100 text-gray-800',
    [EstadoDocumento.PENDIENTE_FIRMA]: 'bg-yellow-100 text-yellow-800',
    [EstadoDocumento.FIRMADO]: 'bg-blue-100 text-blue-800',
    [EstadoDocumento.ENVIADO]: 'bg-purple-100 text-purple-800',
    [EstadoDocumento.ACEPTADO]: 'bg-green-100 text-green-800',
    [EstadoDocumento.RECHAZADO]: 'bg-red-100 text-red-800',
    [EstadoDocumento.VENCIDO]: 'bg-orange-100 text-orange-800',
    [EstadoDocumento.ANULADO]: 'bg-gray-100 text-gray-800',
}

export default function DocumentoDetallePage() {
    const params = useParams()
    const router = useRouter()
    const [documento, setDocumento] = useState<DocumentoConRelaciones | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [metadatos, setMetadatos] = useState<any>(null)
    const [evidencias, setEvidencias] = useState<any[]>([])
    const [isUpdatingEstado, setIsUpdatingEstado] = useState(false)

    useEffect(() => {
        if (params.id) {
            fetchDocumento()
        }
    }, [params.id])

    const fetchDocumento = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/documentos/${params.id}`)
            const data = await response.json()

            if (data.success) {
                setDocumento(data.data)

                // Parsear metadatos si existen
                if (data.data.metadatos) {
                    try {
                        setMetadatos(JSON.parse(data.data.metadatos))
                    } catch (e) {
                        console.error('Error al parsear metadatos:', e)
                    }
                }

                // Parsear evidencias si existen
                if (data.data.evidenciasFotos) {
                    try {
                        setEvidencias(JSON.parse(data.data.evidenciasFotos))
                    } catch (e) {
                        console.error('Error al parsear evidencias:', e)
                    }
                }
            }
        } catch (error) {
            console.error('Error al cargar documento:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCambiarEstado = async (nuevoEstado: EstadoDocumento) => {
        setIsUpdatingEstado(true)
        try {
            const response = await fetch(`/api/admin/documentos/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estadoDocumento: nuevoEstado,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setDocumento(data.data)
            } else {
                alert('Error al cambiar estado: ' + data.error)
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error)
            alert('Error al cambiar estado')
        } finally {
            setIsUpdatingEstado(false)
        }
    }

    const handleDescargarPDF = async () => {
        try {
            const response = await fetch(`/api/admin/documentos/${params.id}/pdf`)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${documento?.numeroDocumento}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Error al descargar PDF:', error)
        }
    }

    const handleEliminar = async () => {
        try {
            const response = await fetch(`/api/admin/documentos/${params.id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                router.push('/admin/documentos')
            }
        } catch (error) {
            console.error('Error al eliminar documento:', error)
        }
    }

    const formatearFecha = (fecha: Date | string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex">
                    <AdminSidebar />
                    <main className="flex-1 lg:ml-64 p-8">
                        <div className="text-center py-12">
                            <p className="text-gray-500">Cargando documento...</p>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    if (!documento) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex">
                    <AdminSidebar />
                    <main className="flex-1 lg:ml-64 p-8">
                        <div className="text-center py-12">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Documento no encontrado</p>
                            <Button asChild className="mt-4">
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
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" asChild>
                                    <Link href="/admin/documentos">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Volver
                                    </Link>
                                </Button>
                                <div>
                                    <h1 className="text-3xl font-bold">{documento.numeroDocumento}</h1>
                                    <p className="text-gray-600">
                                        {DOCUMENTO_TIPO_LABELS[documento.tipo]}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={handleDescargarPDF}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar PDF
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={`/admin/documentos/${documento.id}/editar`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. El documento será eliminado permanentemente.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleEliminar}>
                                                Eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="flex items-center gap-2">
                            <Badge className={ESTADO_COLORS[documento.estadoDocumento]}>
                                {ESTADO_DOCUMENTO_LABELS[documento.estadoDocumento]}
                            </Badge>
                            {documento.estadoDocumento === EstadoDocumento.FIRMADO && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            {documento.estadoDocumento === EstadoDocumento.RECHAZADO && (
                                <XCircle className="h-5 w-5 text-red-600" />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Información principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Información general */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información General</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Tipo de Documento</p>
                                            <p className="font-medium">{DOCUMENTO_TIPO_LABELS[documento.tipo]}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Estado</p>
                                            <Badge className={ESTADO_COLORS[documento.estadoDocumento]}>
                                                {ESTADO_DOCUMENTO_LABELS[documento.estadoDocumento]}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Fecha de Generación</p>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <p className="font-medium">{formatearFecha(documento.fechaGeneracion)}</p>
                                            </div>
                                        </div>
                                        {documento.fechaFirma && (
                                            <div>
                                                <p className="text-sm text-gray-500">Fecha de Firma</p>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <p className="font-medium">{formatearFecha(documento.fechaFirma)}</p>
                                                </div>
                                            </div>
                                        )}
                                        {documento.fechaVencimiento && (
                                            <div>
                                                <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <p className="font-medium">{formatearFecha(documento.fechaVencimiento)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cambiar Estado */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cambiar Estado</CardTitle>
                                    <CardDescription>
                                        Actualiza el estado del documento según el flujo de trabajo
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Select
                                        value={documento.estadoDocumento}
                                        onValueChange={(value) => handleCambiarEstado(value as EstadoDocumento)}
                                        disabled={isUpdatingEstado}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={EstadoDocumento.BORRADOR}>
                                                {ESTADO_DOCUMENTO_LABELS[EstadoDocumento.BORRADOR]}
                                            </SelectItem>
                                            <SelectItem value={EstadoDocumento.PENDIENTE_FIRMA}>
                                                {ESTADO_DOCUMENTO_LABELS[EstadoDocumento.PENDIENTE_FIRMA]}
                                            </SelectItem>
                                            <SelectItem value={EstadoDocumento.FIRMADO}>
                                                {ESTADO_DOCUMENTO_LABELS[EstadoDocumento.FIRMADO]}
                                            </SelectItem>
                                            <SelectItem value={EstadoDocumento.ENVIADO}>
                                                {ESTADO_DOCUMENTO_LABELS[EstadoDocumento.ENVIADO]}
                                            </SelectItem>
                                            <SelectItem value={EstadoDocumento.ACEPTADO}>
                                                {ESTADO_DOCUMENTO_LABELS[EstadoDocumento.ACEPTADO]}
                                            </SelectItem>
                                            <SelectItem value={EstadoDocumento.RECHAZADO}>
                                                {ESTADO_DOCUMENTO_LABELS[EstadoDocumento.RECHAZADO]}
                                            </SelectItem>
                                            <SelectItem value={EstadoDocumento.VENCIDO}>
                                                {ESTADO_DOCUMENTO_LABELS[EstadoDocumento.VENCIDO]}
                                            </SelectItem>
                                            <SelectItem value={EstadoDocumento.ANULADO}>
                                                {ESTADO_DOCUMENTO_LABELS[EstadoDocumento.ANULADO]}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            {/* Evidencias Fotográficas */}
                            <EvidenciaFotografica
                                documentoId={documento.id}
                                evidencias={evidencias}
                                onEvidenciasChange={(nuevasEvidencias) => setEvidencias(nuevasEvidencias)}
                            />

                            {/* Metadatos específicos */}
                            {metadatos && documento.tipo === DocumentoTipo.FACTURA && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Detalles de Facturación</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Cliente / Facturar a</h4>
                                                <p className="font-medium text-lg">{metadatos.cliente.nombre}</p>
                                                <p className="text-sm text-gray-600">NIF/DNI: {metadatos.cliente.identificacion}</p>
                                                {metadatos.cliente.direccion && <p className="text-sm text-gray-600">{metadatos.cliente.direccion}</p>}
                                                {metadatos.cliente.telefono && <p className="text-sm text-gray-600">Tel: {metadatos.cliente.telefono}</p>}
                                                {metadatos.cliente.email && <p className="text-sm text-gray-600">{metadatos.cliente.email}</p>}
                                            </div>
                                            {metadatos.equipo && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Equipo / Servicio</h4>
                                                    <p className="font-medium">{metadatos.equipo.tipo} {metadatos.equipo.marca} {metadatos.equipo.modelo}</p>
                                                    {metadatos.equipo.numeroSerie && <p className="text-sm text-gray-600">N/S: {metadatos.equipo.numeroSerie}</p>}
                                                    {metadatos.numeroTicket && <p className="text-sm text-blue-600 font-medium mt-1">Ticket: {metadatos.numeroTicket}</p>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left font-semibold">Descripción</th>
                                                        <th className="px-4 py-2 text-center font-semibold w-20">Cant.</th>
                                                        <th className="px-4 py-2 text-right font-semibold w-32">Precio</th>
                                                        <th className="px-4 py-2 text-right font-semibold w-32">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {metadatos.items.map((item: any, idx: number) => (
                                                        <tr key={idx}>
                                                            <td className="px-4 py-3">{item.descripcion}</td>
                                                            <td className="px-4 py-3 text-center">{item.cantidad}</td>
                                                            <td className="px-4 py-3 text-right">{item.precioUnitario.toFixed(2)}€</td>
                                                            <td className="px-4 py-3 text-right font-medium">{item.subtotal.toFixed(2)}€</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-gray-50 border-t">
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-2 text-right text-gray-500">Base Imponible</td>
                                                        <td className="px-4 py-2 text-right">{metadatos.totales.subtotal.toFixed(2)}€</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-2 text-right text-gray-500">I.V.A (21%)</td>
                                                        <td className="px-4 py-2 text-right">{metadatos.totales.iva.toFixed(2)}€</td>
                                                    </tr>
                                                    <tr className="text-lg font-bold text-primary">
                                                        <td colSpan={3} className="px-4 py-2 text-right">TOTAL</td>
                                                        <td className="px-4 py-2 text-right">{metadatos.totales.total.toFixed(2)}€</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-blue-600 font-semibold uppercase">Método de Pago</p>
                                                <p className="text-blue-800 font-medium capitalize">{metadatos.pago.metodo}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-blue-600 font-semibold uppercase">Estado</p>
                                                <Badge className="bg-green-100 text-green-800 border-green-200">PAGADO</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {metadatos && documento.tipo !== DocumentoTipo.FACTURA && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Detalles del Documento</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                                            {JSON.stringify(metadatos, null, 2)}
                                        </pre>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Contenido */}
                            {documento.contenido && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Contenido</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 whitespace-pre-wrap">{documento.contenido}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Generado por */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Generado por</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{documento.usuarioGenerador.nombre}</p>
                                            <p className="text-sm text-gray-500">{documento.usuarioGenerador.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ticket relacionado */}
                            {documento.ticket && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Ticket Relacionado</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Link
                                            href={`/admin/tickets?ticketId=${documento.ticket.id}`}
                                            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Ticket className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{documento.ticket.numeroTicket}</p>
                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                    {documento.ticket.asunto}
                                                </p>
                                            </div>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Pedido relacionado */}
                            {documento.pedido && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Pedido Relacionado</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Link
                                            href={`/admin/pedidos/${documento.pedido.id}`}
                                            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <Package className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{documento.pedido.numeroPedido}</p>
                                            </div>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Producto relacionado */}
                            {documento.producto && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Producto Relacionado</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                <Package className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{documento.producto.nombre}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Documento relacionado */}
                            {documento.documentoRelacionado && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Documento Relacionado</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Link
                                            href={`/admin/documentos/${documento.documentoRelacionado.id}`}
                                            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{documento.documentoRelacionado.numeroDocumento}</p>
                                                <p className="text-sm text-gray-500">
                                                    {DOCUMENTO_TIPO_LABELS[documento.documentoRelacionado.tipo]}
                                                </p>
                                            </div>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Documentos hijos */}
                            {documento.documentosHijos && documento.documentosHijos.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Documentos Derivados</CardTitle>
                                        <CardDescription>
                                            {documento.documentosHijos.length} documento(s)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {documento.documentosHijos.map((hijo) => (
                                            <Link
                                                key={hijo.id}
                                                href={`/admin/documentos/${hijo.id}`}
                                                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                            >
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{hijo.numeroDocumento}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {DOCUMENTO_TIPO_LABELS[hijo.tipo]}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
