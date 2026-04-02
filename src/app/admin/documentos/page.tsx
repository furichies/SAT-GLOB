'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    FileText,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    Plus,
    FileCheck,
    FileClock,
    FileX,
    Calendar,
    User,
    Ticket,
} from 'lucide-react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { DocumentoTipo, EstadoDocumento } from '@/types/enums'
import { DocumentoConRelaciones } from '@/types'
import { WorkflowGuide } from '@/components/documentos/WorkflowGuide'
import { getWorkflowStatus } from '@/lib/document-workflow'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Zap, Info } from 'lucide-react'

// Mapeo de etiquetas en español para los tipos de documento
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

// Mapeo de etiquetas en español para los estados de documento
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

// Colores para los badges de estado
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

export default function DocumentosPage() {
    const [documentos, setDocumentos] = useState<DocumentoConRelaciones[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroTipo, setFiltroTipo] = useState<string>('todos')
    const [filtroEstado, setFiltroEstado] = useState<string>('todos')
    const [filtroUsuarioGenerador, setFiltroUsuarioGenerador] = useState<string>('todos')
    const [filtroTecnicoAsignado, setFiltroTecnicoAsignado] = useState<string>('todos')
    const [paginaActual, setPaginaActual] = useState(1)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [usuarios, setUsuarios] = useState<{ id: string; nombre: string; apellidos?: string | null }[]>([])
    const [tecnicos, setTecnicos] = useState<{ id: string; nombre: string; apellidos?: string | null }[]>([])

    useEffect(() => {
        fetchDocumentos()
    }, [paginaActual, filtroTipo, filtroEstado, busqueda, filtroUsuarioGenerador, filtroTecnicoAsignado])

    useEffect(() => {
        fetchUsuarios()
        fetchTecnicos()
    }, [])

    const fetchUsuarios = async () => {
        try {
            const response = await fetch('/api/admin/usuarios')
            const data = await response.json()
            if (data.success) {
                setUsuarios(data.data.usuarios)
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error)
        }
    }

    const fetchTecnicos = async () => {
        try {
            const response = await fetch('/api/admin/tecnicos')
            const data = await response.json()
            if (data.success) {
                setTecnicos(data.data.tecnicos)
            }
        } catch (error) {
            console.error('Error al cargar técnicos:', error)
        }
    }

    const fetchDocumentos = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: paginaActual.toString(),
                limit: '20',
            })

            if (filtroTipo !== 'todos') params.append('tipo', filtroTipo)
            if (filtroEstado !== 'todos') params.append('estado', filtroEstado)
            if (filtroUsuarioGenerador !== 'todos') params.append('usuarioGeneradorId', filtroUsuarioGenerador)
            if (filtroTecnicoAsignado !== 'todos') params.append('tecnicoAsignado', filtroTecnicoAsignado)
            if (busqueda) params.append('busqueda', busqueda)

            const response = await fetch(`/api/admin/documentos?${params}`)
            const data = await response.json()

            if (data.success) {
                setDocumentos(data.data.documentos)
                setTotalPaginas(Math.ceil(data.data.total / 20))
            }
        } catch (error) {
            console.error('Error al cargar documentos:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDescargarPDF = async (documentoId: string) => {
        try {
            const response = await fetch(`/api/admin/documentos/${documentoId}/pdf`)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `documento-${documentoId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Error al descargar PDF:', error)
        }
    }

    const formatearFecha = (fecha: Date | string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 lg:ml-64 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Seguimiento y Documentación</h1>
                                <p className="text-gray-600">
                                    Gestiona todos los documentos del proceso de reparación
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <WorkflowGuide />
                                <Button asChild>
                                    <Link href="/admin/documentos/nuevo">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nuevo Documento
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Estadísticas rápidas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Total Documentos
                                    </CardTitle>
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{documentos.length}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Pendientes de Firma
                                    </CardTitle>
                                    <FileClock className="h-4 w-4 text-yellow-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {documentos.filter(d => d.estadoDocumento === EstadoDocumento.PENDIENTE_FIRMA).length}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Firmados
                                    </CardTitle>
                                    <FileCheck className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {documentos.filter(d => d.estadoDocumento === EstadoDocumento.FIRMADO).length}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Vencidos
                                    </CardTitle>
                                    <FileX className="h-4 w-4 text-red-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {documentos.filter(d => d.estadoDocumento === EstadoDocumento.VENCIDO).length}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Filtros y búsqueda */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filtros y Búsqueda
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por número o contenido..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipo de documento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los tipos</SelectItem>
                                        <SelectItem value={DocumentoTipo.ORDEN_SERVICIO}>
                                            {DOCUMENTO_TIPO_LABELS[DocumentoTipo.ORDEN_SERVICIO]}
                                        </SelectItem>
                                        <SelectItem value={DocumentoTipo.DIAGNOSTICO_PRESUPUESTO}>
                                            {DOCUMENTO_TIPO_LABELS[DocumentoTipo.DIAGNOSTICO_PRESUPUESTO]}
                                        </SelectItem>
                                        <SelectItem value={DocumentoTipo.ACEPTACION_PRESUPUESTO}>
                                            {DOCUMENTO_TIPO_LABELS[DocumentoTipo.ACEPTACION_PRESUPUESTO]}
                                        </SelectItem>
                                        <SelectItem value={DocumentoTipo.RECHAZO_PRESUPUESTO}>
                                            {DOCUMENTO_TIPO_LABELS[DocumentoTipo.RECHAZO_PRESUPUESTO]}
                                        </SelectItem>
                                        <SelectItem value={DocumentoTipo.EXTENSION_PRESUPUESTO}>
                                            {DOCUMENTO_TIPO_LABELS[DocumentoTipo.EXTENSION_PRESUPUESTO]}
                                        </SelectItem>
                                        <SelectItem value={DocumentoTipo.ALBARAN_ENTREGA}>
                                            {DOCUMENTO_TIPO_LABELS[DocumentoTipo.ALBARAN_ENTREGA]}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los estados</SelectItem>
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
                                    </SelectContent>
                                </Select>

                                <Select value={filtroUsuarioGenerador} onValueChange={setFiltroUsuarioGenerador}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Generado por" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los usuarios</SelectItem>
                                        {usuarios.map((usuario) => (
                                            <SelectItem key={usuario.id} value={usuario.id}>
                                                {usuario.nombre} {usuario.apellidos || ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={filtroTecnicoAsignado} onValueChange={setFiltroTecnicoAsignado}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Técnico asignado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los técnicos</SelectItem>
                                        {tecnicos.map((tecnico) => (
                                            <SelectItem key={tecnico.id} value={tecnico.id}>
                                                {tecnico.nombre} {tecnico.apellidos || ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabla de documentos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Documentos</CardTitle>
                            <CardDescription>
                                {documentos.length} documento(s) encontrado(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Cargando documentos...</p>
                                </div>
                            ) : documentos.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No se encontraron documentos</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Número</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Ticket/Pedido</TableHead>
                                                <TableHead>Técnico Asignado</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Generado por</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {documentos.map((doc) => (
                                                <TableRow key={doc.id}>
                                                    <TableCell className="font-medium">
                                                        {doc.numeroDocumento}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {DOCUMENTO_TIPO_LABELS[doc.tipo]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={ESTADO_COLORS[doc.estadoDocumento]}>
                                                            {ESTADO_DOCUMENTO_LABELS[doc.estadoDocumento]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {doc.ticket && (
                                                            <Link
                                                                href={`/admin/tickets?ticketId=${doc.ticket.id}`}
                                                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                                            >
                                                                <Ticket className="h-3 w-3" />
                                                                {doc.ticket.numeroTicket}
                                                            </Link>
                                                        )}
                                                        {doc.pedido && (
                                                            <Link
                                                                href={`/admin/pedidos/${doc.pedido.id}`}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {doc.pedido.numeroPedido}
                                                            </Link>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {doc.ticket?.tecnico ? (
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <User className="h-3 w-3" />
                                                                {doc.ticket.tecnico.usuario.nombre} {doc.ticket.tecnico.usuario.apellidos || ''}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">Sin asignar</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatearFecha(doc.fechaGeneracion)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <User className="h-3 w-3" />
                                                            {doc.usuarioGenerador?.nombre || 'Sistema'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {getWorkflowStatus(doc.tipo) && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="px-2 py-1 rounded bg-blue-50 border border-blue-100 flex items-center gap-1.5 cursor-help">
                                                                                <Info className="h-3.5 w-3.5 text-blue-600" />
                                                                                <span className="text-xs font-medium text-blue-700 hidden xl:inline-block">
                                                                                    Siguiente paso
                                                                                </span>
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className="max-w-xs p-3">
                                                                            <p className="font-semibold text-sm mb-1">
                                                                                {getWorkflowStatus(doc.tipo)?.description}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 mb-2">
                                                                                {getWorkflowStatus(doc.tipo)?.note}
                                                                            </p>
                                                                            {getWorkflowStatus(doc.tipo)?.autoGenerated && (
                                                                                <div className="mt-2 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 flex items-center gap-1">
                                                                                    <Zap className="h-3 w-3" />
                                                                                    Genera: Factura
                                                                                </div>
                                                                            )}
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link href={`/admin/documentos/${doc.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDescargarPDF(doc.id)}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link href={`/admin/documentos/${doc.id}/editar`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Paginación */}
                    {totalPaginas > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                disabled={paginaActual === 1}
                            >
                                Anterior
                            </Button>
                            <span className="text-sm text-gray-600">
                                Página {paginaActual} de {totalPaginas}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                disabled={paginaActual === totalPaginas}
                            >
                                Siguiente
                            </Button>
                        </div>
                    )}
                </main>
            </div >
        </div >
    )
}
