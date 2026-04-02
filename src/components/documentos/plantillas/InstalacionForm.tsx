'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Monitor, Plus, Trash2 } from 'lucide-react'
import { MetadatosInstalacion } from '@/types/plantillas'
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

interface InstalacionFormProps {
    ticket: any
    onSuccess?: (documento: any) => void
    onCancel?: () => void
}

export function InstalacionForm({ ticket, onSuccess, onCancel }: InstalacionFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState<MetadatosInstalacion>({
        proyecto: ticket.asunto,
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

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/admin/documentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: DocumentoTipo.ACTA_INSTALACION,
                    ticketId: ticket.id,
                    metadatos: JSON.stringify(formData)
                })
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Acta generada",
                    description: "El acta de instalación se ha creado correctamente.",
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
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <CardHeader className="bg-primary/5 border-b mb-6">
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <Monitor className="h-5 w-5" />
                    Acta de Instalación y Configuración
                </CardTitle>
                <CardDescription>
                    Ticket #{ticket.numeroTicket}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* 1. Datos Generales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Proyecto / Tarea</Label>
                        <Input
                            value={formData.proyecto}
                            onChange={(e) => setFormData(p => ({ ...p, proyecto: e.target.value }))}
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

                {/* 2. Equipamiento Instalado */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Equipamiento Instalado</h3>

                    {/* Formulario Añadir Equipo */}
                    <div className="bg-muted/30 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                        <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs">Descripción</Label>
                            <Input
                                placeholder="Ej: Monitor 24p"
                                value={nuevoEquipo.descripcion}
                                onChange={(e) => setNuevoEquipo(p => ({ ...p, descripcion: e.target.value }))}
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
                        <div className="md:col-span-1 space-y-1">
                            <Label className="text-xs">S/N</Label>
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
                        <Button variant="secondary" onClick={agregarEquipo} disabled={!nuevoEquipo.descripcion}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Lista Equipos */}
                    {formData.equipamiento.length > 0 ? (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Ubicación</TableHead>
                                        <TableHead>S/N</TableHead>
                                        <TableHead>Cant.</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.equipamiento.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{item.descripcion}</TableCell>
                                            <TableCell>{item.ubicacion}</TableCell>
                                            <TableCell className="font-mono text-xs">{item.numSerie || '-'}</TableCell>
                                            <TableCell>{item.cantidad}</TableCell>
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

                {/* 3. Configuración Realizada */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Checklist de Configuración</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { k: 'sistemaOperativo', l: 'Instalación S.O.' },
                            { k: 'red', l: 'Conf. Red' },
                            { k: 'dominio', l: 'Unión Dominio' },
                            { k: 'email', l: 'Conf. Email' },
                            { k: 'impresoras', l: 'Impresoras' },
                            { k: 'seguridad', l: 'Antivirus' },
                            { k: 'politicas', l: 'Políticas GPO' },
                            { k: 'backup', l: 'Automatización Backup' },
                        ].map((item: any) => (
                            <div key={item.k} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`conf-${item.k}`}
                                    checked={formData.configuracion[item.k as keyof typeof formData.configuracion] as boolean}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        configuracion: { ...p.configuracion, [item.k]: c }
                                    }))}
                                />
                                <Label htmlFor={`conf-${item.k}`}>{item.l}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Entregables y Finalización */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <Label className="font-semibold mb-2 block">Documentación Entregada</Label>
                        <div className="space-y-2 mt-2">
                            {[
                                { k: 'credenciales', l: 'Credenciales Acceso' },
                                { k: 'manualUsuario', l: 'Manual Usuario' },
                                { k: 'garantias', l: 'Garantías' },
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
                                    <Label htmlFor={`doc-${item.k}`}>{item.l}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <Label className="font-semibold mb-2 block text-green-900">Cierre</Label>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Periodo de Prueba</Label>
                                <Select
                                    value={formData.periodoPrueba.toString()}
                                    onValueChange={(v) => setFormData(p => ({ ...p, periodoPrueba: Number(v) as 7 | 15 | 30 }))}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 días</SelectItem>
                                        <SelectItem value="15">15 días</SelectItem>
                                        <SelectItem value="30">30 días</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-start space-x-2 pt-2 border-t border-green-200">
                                <Checkbox
                                    id="confirm"
                                    checked={formData.confirmacionUsuario}
                                    onCheckedChange={(c) => setFormData(p => ({ ...p, confirmacionUsuario: c as boolean }))}
                                />
                                <Label htmlFor="confirm" className="font-bold text-green-800 cursor-pointer text-sm leading-tight pt-0.5">
                                    El usuario confirma el funcionamiento correcto y la recepción del equipo.
                                </Label>
                            </div>
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
