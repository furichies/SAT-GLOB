'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Settings, Plus, Trash2 } from 'lucide-react'
import { MetadatosInstalacionConfiguracion } from '@/types/plantillas'
import { DocumentoTipo } from '@/types/enums'
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
} from "@/components/ui/table"

interface InstalacionConfiguracionFormProps {
    ticket: any
    onSuccess?: (documento: any) => void
    onCancel?: () => void
}

export function InstalacionConfiguracionForm({ ticket, onSuccess, onCancel }: InstalacionConfiguracionFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState<MetadatosInstalacionConfiguracion>({
        proyecto: ticket.asunto || '',
        duracionHoras: 1,
        equipamiento: [],
        configuracion: {
            sistemaOperativo: false,
            red: false,
            dominio: false,
            email: false,
            softwareEspecifico: [],
            impresoras: false,
            migracionDatos: '',
            seguridad: false,
            politicas: false,
            backup: false
        },
        documentacionEntregada: {
            manualUsuario: false,
            guiaPrimerosPasos: false,
            credenciales: false,
            licencias: false,
            garantias: false
        },
        formacion: {
            impartida: false,
            duracionMinutos: 0,
            temas: [],
            nivelComprension: 'medio'
        },
        periodoPrueba: 7,
        contactoSoporte: '',
        confirmacionUsuario: false
    })

    // Estado temporal para añadir equipos
    const [nuevoEquipo, setNuevoEquipo] = useState({
        descripcion: '',
        marcaModelo: '',
        numSerie: '',
        cantidad: 1,
        ubicacion: ''
    })

    // Estado temporal para software específico
    const [nuevoSoftware, setNuevoSoftware] = useState('')

    // Estado temporal para temas de formación
    const [nuevoTema, setNuevoTema] = useState('')

    const agregarEquipo = () => {
        if (!nuevoEquipo.descripcion) return
        setFormData(prev => ({
            ...prev,
            equipamiento: [...prev.equipamiento, nuevoEquipo]
        }))
        setNuevoEquipo({
            descripcion: '',
            marcaModelo: '',
            numSerie: '',
            cantidad: 1,
            ubicacion: ''
        })
    }

    const eliminarEquipo = (index: number) => {
        setFormData(prev => ({
            ...prev,
            equipamiento: prev.equipamiento.filter((_, i) => i !== index)
        }))
    }

    const agregarSoftware = () => {
        if (!nuevoSoftware.trim()) return
        setFormData(prev => ({
            ...prev,
            configuracion: {
                ...prev.configuracion,
                softwareEspecifico: [...prev.configuracion.softwareEspecifico, nuevoSoftware]
            }
        }))
        setNuevoSoftware('')
    }

    const eliminarSoftware = (index: number) => {
        setFormData(prev => ({
            ...prev,
            configuracion: {
                ...prev.configuracion,
                softwareEspecifico: prev.configuracion.softwareEspecifico.filter((_, i) => i !== index)
            }
        }))
    }

    const agregarTema = () => {
        if (!nuevoTema.trim()) return
        setFormData(prev => ({
            ...prev,
            formacion: {
                ...prev.formacion,
                temas: [...prev.formacion.temas, nuevoTema]
            }
        }))
        setNuevoTema('')
    }

    const eliminarTema = (index: number) => {
        setFormData(prev => ({
            ...prev,
            formacion: {
                ...prev.formacion,
                temas: prev.formacion.temas.filter((_, i) => i !== index)
            }
        }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/admin/documentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: DocumentoTipo.ACTA_INSTALACION_CONFIGURACION,
                    ticketId: ticket.id,
                    metadatos: JSON.stringify(formData)
                })
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Acta generada",
                    description: "El acta de instalación y configuración se ha creado correctamente.",
                })
                if (onSuccess) onSuccess(data.data)
            } else {
                throw new Error(data.error || "Error al crear documento")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="w-full max-w-5xl mx-auto shadow-lg">
            <CardHeader className="bg-primary/5 border-b mb-6">
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <Settings className="h-5 w-5" />
                    Acta de Instalación y Configuración
                </CardTitle>
                <CardDescription>
                    Ticket #{ticket.numeroTicket} - {ticket.cliente?.nombre || 'Cliente'}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Datos Generales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Proyecto / Tarea</Label>
                        <Input
                            value={formData.proyecto}
                            onChange={(e) => setFormData(p => ({ ...p, proyecto: e.target.value }))}
                            placeholder="Nombre del proyecto"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Duración (Horas)</Label>
                        <Input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={formData.duracionHoras}
                            onChange={(e) => setFormData(p => ({ ...p, duracionHoras: Number(e.target.value) }))}
                        />
                    </div>
                </div>

                {/* Equipamiento Instalado */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Equipamiento Instalado</h3>

                    {/* Formulario Añadir Equipo */}
                    <div className="bg-muted/30 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                        <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs">Descripción</Label>
                            <Input
                                placeholder="Ej: PC Sobremesa"
                                value={nuevoEquipo.descripcion}
                                onChange={(e) => setNuevoEquipo(p => ({ ...p, descripcion: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-1 space-y-1">
                            <Label className="text-xs">Marca/Modelo</Label>
                            <Input
                                placeholder="HP EliteDesk"
                                value={nuevoEquipo.marcaModelo}
                                onChange={(e) => setNuevoEquipo(p => ({ ...p, marcaModelo: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-1 space-y-1">
                            <Label className="text-xs">Nº Serie</Label>
                            <Input
                                placeholder="Opcional"
                                value={nuevoEquipo.numSerie}
                                onChange={(e) => setNuevoEquipo(p => ({ ...p, numSerie: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-1 space-y-1">
                            <Label className="text-xs">Cant.</Label>
                            <Input
                                type="number"
                                min="1"
                                value={nuevoEquipo.cantidad}
                                onChange={(e) => setNuevoEquipo(p => ({ ...p, cantidad: Number(e.target.value) }))}
                            />
                        </div>
                        <div className="md:col-span-1 space-y-1">
                            <Label className="text-xs">Ubicación</Label>
                            <Input
                                placeholder="Sala 1"
                                value={nuevoEquipo.ubicacion}
                                onChange={(e) => setNuevoEquipo(p => ({ ...p, ubicacion: e.target.value }))}
                            />
                        </div>
                        <Button variant="secondary" onClick={agregarEquipo} disabled={!nuevoEquipo.descripcion} className="md:col-span-6 md:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Equipo
                        </Button>
                    </div>

                    {/* Lista Equipos */}
                    {formData.equipamiento.length > 0 ? (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Marca/Modelo</TableHead>
                                        <TableHead>Nº Serie</TableHead>
                                        <TableHead>Cant.</TableHead>
                                        <TableHead>Ubicación</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.equipamiento.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{item.descripcion}</TableCell>
                                            <TableCell>{item.marcaModelo}</TableCell>
                                            <TableCell className="font-mono text-xs">{item.numSerie || '-'}</TableCell>
                                            <TableCell>{item.cantidad}</TableCell>
                                            <TableCell>{item.ubicacion}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => eliminarEquipo(i)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground bg-muted/10 rounded-lg border-dashed border">
                            No hay equipos añadidos
                        </div>
                    )}
                </div>

                {/* Configuración Realizada */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Configuración Realizada</h3>
                    <div className="space-y-4">
                        {/* Sistema Operativo */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id="conf-so"
                                    checked={formData.configuracion.sistemaOperativo}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, sistemaOperativo: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="conf-so" className="font-medium">Instalación Sistema Operativo</Label>
                            </div>
                            {formData.configuracion.sistemaOperativo && (
                                <Input
                                    placeholder="Detalles del SO instalado..."
                                    value={formData.configuracion.detallesSo || ''}
                                    onChange={(e) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, detallesSo: e.target.value }
                                    }))}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        {/* Red */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id="conf-red"
                                    checked={formData.configuracion.red}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, red: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="conf-red" className="font-medium">Configuración Red (IP/DNS/DHCP)</Label>
                            </div>
                            {formData.configuracion.red && (
                                <Input
                                    placeholder="Detalles de configuración de red..."
                                    value={formData.configuracion.detallesRed || ''}
                                    onChange={(e) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, detallesRed: e.target.value }
                                    }))}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        {/* Dominio */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id="conf-dominio"
                                    checked={formData.configuracion.dominio}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, dominio: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="conf-dominio" className="font-medium">Unión a Dominio/Grupo Trabajo</Label>
                            </div>
                            {formData.configuracion.dominio && (
                                <Input
                                    placeholder="Nombre del dominio o grupo de trabajo..."
                                    value={formData.configuracion.detalleDominio || ''}
                                    onChange={(e) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, detalleDominio: e.target.value }
                                    }))}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        {/* Email */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id="conf-email"
                                    checked={formData.configuracion.email}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, email: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="conf-email" className="font-medium">Configuración Correo Electrónico</Label>
                            </div>
                            {formData.configuracion.email && (
                                <Input
                                    placeholder="Detalles de configuración de email..."
                                    value={formData.configuracion.detalleEmail || ''}
                                    onChange={(e) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, detalleEmail: e.target.value }
                                    }))}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        {/* Software Específico */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <Label className="font-medium mb-2 block">Instalación Software Específico</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    placeholder="Nombre del software..."
                                    value={nuevoSoftware}
                                    onChange={(e) => setNuevoSoftware(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && agregarSoftware()}
                                />
                                <Button variant="secondary" onClick={agregarSoftware} disabled={!nuevoSoftware.trim()}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {formData.configuracion.softwareEspecifico.length > 0 && (
                                <div className="space-y-1">
                                    {formData.configuracion.softwareEspecifico.map((sw, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white p-2 rounded">
                                            <span className="text-sm">• {sw}</span>
                                            <Button variant="ghost" size="sm" onClick={() => eliminarSoftware(i)}>
                                                <Trash2 className="h-3 w-3 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Impresoras */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id="conf-impresoras"
                                    checked={formData.configuracion.impresoras}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, impresoras: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="conf-impresoras" className="font-medium">Configuración Impresoras/Dispositivos</Label>
                            </div>
                            {formData.configuracion.impresoras && (
                                <Input
                                    placeholder="Detalles de impresoras configuradas..."
                                    value={formData.configuracion.detalleImpresoras || ''}
                                    onChange={(e) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, detalleImpresoras: e.target.value }
                                    }))}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        {/* Migración de Datos */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <Label className="font-medium mb-2 block">Migración de Datos Desde</Label>
                            <Input
                                placeholder="Origen de los datos migrados..."
                                value={formData.configuracion.migracionDatos}
                                onChange={(e) => setFormData(p => ({
                                    ...p,
                                    configuracion: { ...p.configuracion, migracionDatos: e.target.value }
                                }))}
                            />
                        </div>

                        {/* Seguridad */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id="conf-seguridad"
                                    checked={formData.configuracion.seguridad}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, seguridad: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="conf-seguridad" className="font-medium">Configuración Seguridad/Antivirus</Label>
                            </div>
                            {formData.configuracion.seguridad && (
                                <Input
                                    placeholder="Detalles de seguridad configurada..."
                                    value={formData.configuracion.detalleSeguridad || ''}
                                    onChange={(e) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, detalleSeguridad: e.target.value }
                                    }))}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        {/* Políticas */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id="conf-politicas"
                                    checked={formData.configuracion.politicas}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, politicas: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="conf-politicas" className="font-medium">Políticas de Grupo/Permisos</Label>
                            </div>
                            {formData.configuracion.politicas && (
                                <Input
                                    placeholder="Detalles de políticas configuradas..."
                                    value={formData.configuracion.detallePoliticas || ''}
                                    onChange={(e) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, detallePoliticas: e.target.value }
                                    }))}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        {/* Backup */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id="conf-backup"
                                    checked={formData.configuracion.backup}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, backup: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="conf-backup" className="font-medium">Copia de Seguridad Automatizada</Label>
                            </div>
                            {formData.configuracion.backup && (
                                <Input
                                    placeholder="Detalles del sistema de backup..."
                                    value={formData.configuracion.detalleBackup || ''}
                                    onChange={(e) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, detalleBackup: e.target.value }
                                    }))}
                                    className="mt-2"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Documentación Entregada */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Documentación Entregada</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                            { k: 'manualUsuario', l: 'Manual de Usuario Básico' },
                            { k: 'guiaPrimerosPasos', l: 'Guía de Primeros Pasos' },
                            { k: 'credenciales', l: 'Credenciales de Acceso' },
                            { k: 'licencias', l: 'Licencias/Originales Software' },
                            { k: 'garantias', l: 'Garantías Equipamiento' }
                        ].map((item: any) => (
                            <div key={item.k} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`doc-${item.k}`}
                                    checked={formData.documentacionEntregada[item.k as keyof typeof formData.documentacionEntregada]}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        documentacionEntregada: { ...p.documentacionEntregada, [item.k]: c }
                                    }))}
                                />
                                <Label htmlFor={`doc-${item.k}`} className="text-sm">{item.l}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formación al Usuario */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Formación al Usuario</h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="formacion-impartida"
                                checked={formData.formacion.impartida}
                                onCheckedChange={(c) => setFormData(p => ({
                                    ...p,
                                    formacion: { ...p.formacion, impartida: c as boolean }
                                }))}
                            />
                            <Label htmlFor="formacion-impartida" className="font-medium">Sesión de formación impartida</Label>
                        </div>

                        {formData.formacion.impartida && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Duración (minutos)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.formacion.duracionMinutos}
                                            onChange={(e) => setFormData(p => ({
                                                ...p,
                                                formacion: { ...p.formacion, duracionMinutos: Number(e.target.value) }
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nivel de Comprensión del Usuario</Label>
                                        <Select
                                            value={formData.formacion.nivelComprension}
                                            onValueChange={(v: any) => setFormData(p => ({
                                                ...p,
                                                formacion: { ...p.formacion, nivelComprension: v }
                                            }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="alto">Alto</SelectItem>
                                                <SelectItem value="medio">Medio</SelectItem>
                                                <SelectItem value="bajo">Bajo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Temas Cubiertos</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Añadir tema..."
                                            value={nuevoTema}
                                            onChange={(e) => setNuevoTema(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && agregarTema()}
                                        />
                                        <Button variant="secondary" onClick={agregarTema} disabled={!nuevoTema.trim()}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {formData.formacion.temas.length > 0 && (
                                        <div className="space-y-1 mt-2">
                                            {formData.formacion.temas.map((tema, i) => (
                                                <div key={i} className="flex items-center justify-between bg-muted/30 p-2 rounded">
                                                    <span className="text-sm">• {tema}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => eliminarTema(i)}>
                                                        <Trash2 className="h-3 w-3 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Período de Prueba y Cierre */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="text-lg font-semibold mb-4 text-green-900">Período de Prueba y Cierre</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Período de Prueba</Label>
                                <Select
                                    value={formData.periodoPrueba.toString()}
                                    onValueChange={(v) => setFormData(p => ({ ...p, periodoPrueba: Number(v) as 7 | 15 | 30 }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 días</SelectItem>
                                        <SelectItem value="15">15 días</SelectItem>
                                        <SelectItem value="30">30 días</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Contacto Soporte Durante Pruebas</Label>
                                <Input
                                    value={formData.contactoSoporte}
                                    onChange={(e) => setFormData(p => ({ ...p, contactoSoporte: e.target.value }))}
                                    placeholder="Email o teléfono de soporte"
                                />
                            </div>
                        </div>
                        <div className="flex items-start space-x-2 pt-2 border-t border-green-200">
                            <Checkbox
                                id="confirm"
                                checked={formData.confirmacionUsuario}
                                onCheckedChange={(c) => setFormData(p => ({ ...p, confirmacionUsuario: c as boolean }))}
                            />
                            <Label htmlFor="confirm" className="font-bold text-green-800 cursor-pointer text-sm leading-tight pt-0.5">
                                El usuario confirma el funcionamiento correcto del sistema instalado y configurado.
                            </Label>
                        </div>
                    </div>
                </div>

            </CardContent>

            <CardFooter className="flex justify-between border-t p-6 bg-muted/5">
                <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[200px]">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Generar Acta
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
