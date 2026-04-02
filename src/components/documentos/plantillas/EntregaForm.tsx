'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, PackageCheck, Plus, Trash2 } from 'lucide-react'
import { MetadatosEntrega } from '@/types/plantillas'
import { DocumentoTipo } from '@/types/enums'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface EntregaFormProps {
    ticket: any
    onSuccess?: (documento: any) => void
    onCancel?: () => void
}

export function EntregaForm({ ticket, onSuccess, onCancel }: EntregaFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Estado inicial
    const [formData, setFormData] = useState<MetadatosEntrega>({
        equipo: {
            tipo: ticket.tipo || 'Equipo',
            marcaModelo: '',
            numSerie: ticket.numeroSerieProducto || '',
            accesorios: ''
        },
        reparacion: {
            descripcionTecnica: '',
            componentes: [],
            garantiaMeses: 3,
            garantiaHasta: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
        },
        estadoFinal: {
            operatividad: 'total',
            detallesLimitacion: '',
            datosUsuario: 'conservados',
            backupUbicacion: ''
        },
        instrucciones: [
            'No exponer a líquidos ni temperaturas extremas',
            'Cargar batería completamente antes del primer uso prolongado'
        ],
        recomendaciones: {
            actualizarSistemaDias: 0,
            backupPeriodico: true,
            proteccionAdicional: '',
            proximaRevision: ''
        },
        conforme: false
    })

    const [nuevoComponente, setNuevoComponente] = useState('')
    const [nuevaInstruccion, setNuevaInstruccion] = useState('')

    const agregarComponente = () => {
        if (!nuevoComponente) return
        setFormData(p => ({
            ...p,
            reparacion: {
                ...p.reparacion,
                componentes: [...p.reparacion.componentes, nuevoComponente]
            }
        }))
        setNuevoComponente('')
    }

    const eliminarComponente = (index: number) => {
        setFormData(p => ({
            ...p,
            reparacion: {
                ...p.reparacion,
                componentes: p.reparacion.componentes.filter((_, i) => i !== index)
            }
        }))
    }

    const agregarInstruccion = () => {
        if (!nuevaInstruccion) return
        setFormData(p => ({
            ...p,
            instrucciones: [...p.instrucciones, nuevaInstruccion]
        }))
        setNuevaInstruccion('')
    }

    const eliminarInstruccion = (index: number) => {
        setFormData(p => ({
            ...p,
            instrucciones: p.instrucciones.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/admin/documentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: DocumentoTipo.INFORME_ENTREGA,
                    ticketId: ticket.id,
                    metadatos: JSON.stringify(formData)
                })
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Documento generado",
                    description: "El informe de entrega se ha creado correctamente.",
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
                    <PackageCheck className="h-5 w-5" />
                    Informe de Entrega Post-Reparación
                </CardTitle>
                <CardDescription>
                    Entregado el {new Date().toLocaleDateString('es-ES')}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* 1. Datos del Equipo */}
                <div className="bg-muted/10 p-4 rounded-lg">
                    <h3 className="text-md font-semibold mb-3">Datos del Equipo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Marca / Modelo</Label>
                            <Input
                                value={formData.equipo.marcaModelo}
                                onChange={(e) => setFormData(p => ({ ...p, equipo: { ...p.equipo, marcaModelo: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Nº Serie</Label>
                            <Input
                                value={formData.equipo.numSerie}
                                onChange={(e) => setFormData(p => ({ ...p, equipo: { ...p.equipo, numSerie: e.target.value } }))}
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1">
                            <Label>Accesorios Entregados</Label>
                            <Input
                                placeholder="Cargador, funda, ratón..."
                                value={formData.equipo.accesorios}
                                onChange={(e) => setFormData(p => ({ ...p, equipo: { ...p.equipo, accesorios: e.target.value } }))}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Reparación Realizada */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Detalle de la Intervención</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Descripción Técnica del Trabajo</Label>
                            <Textarea
                                className="min-h-[100px]"
                                value={formData.reparacion.descripcionTecnica}
                                onChange={(e) => setFormData(p => ({ ...p, reparacion: { ...p.reparacion, descripcionTecnica: e.target.value } }))}
                            />
                        </div>

                        {/* Componentes */}
                        <div className="space-y-2">
                            <Label>Componentes Reemplazados</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ej: Pantalla LCD"
                                    value={nuevoComponente}
                                    onChange={(e) => setNuevoComponente(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && agregarComponente()}
                                />
                                <Button variant="secondary" onClick={agregarComponente} type="button">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.reparacion.componentes.map((c, i) => (
                                    <div key={i} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-100">
                                        <span>{c}</span>
                                        <button onClick={() => eliminarComponente(i)} className="hover:text-red-500">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Garantía */}
                        <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="space-y-1">
                                <Label className="text-green-900">Garantía (meses)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.reparacion.garantiaMeses}
                                    onChange={(e) => {
                                        const meses = Number(e.target.value)
                                        const hasta = new Date()
                                        hasta.setMonth(hasta.getMonth() + meses)
                                        setFormData(p => ({ ...p, reparacion: { ...p.reparacion, garantiaMeses: meses, garantiaHasta: hasta.toISOString().split('T')[0] } }))
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-green-900">Válida hasta</Label>
                                <Input
                                    type="date"
                                    value={formData.reparacion.garantiaHasta}
                                    readOnly
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Estado Final y Datos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Label className="font-semibold text-lg">Estado Operativo</Label>
                        <Select
                            value={formData.estadoFinal.operatividad}
                            onValueChange={(v: any) => setFormData(p => ({ ...p, estadoFinal: { ...p.estadoFinal, operatividad: v } }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="total">Totalmente Operativo (OK)</SelectItem>
                                <SelectItem value="limitada">Funcional con limitaciones</SelectItem>
                                <SelectItem value="configuracion_adicional">Requiere config. usuario</SelectItem>
                            </SelectContent>
                        </Select>

                        {formData.estadoFinal.operatividad === 'limitada' && (
                            <Input
                                placeholder="Especificar limitaciones..."
                                value={formData.estadoFinal.detallesLimitacion}
                                onChange={(e) => setFormData(p => ({ ...p, estadoFinal: { ...p.estadoFinal, detallesLimitacion: e.target.value } }))}
                            />
                        )}
                    </div>

                    <div className="space-y-4">
                        <Label className="font-semibold text-lg">Datos de Usuario</Label>
                        <Select
                            value={formData.estadoFinal.datosUsuario}
                            onValueChange={(v: any) => setFormData(p => ({ ...p, estadoFinal: { ...p.estadoFinal, datosUsuario: v } }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="conservados">Conservados</SelectItem>
                                <SelectItem value="formateados">Formateados (Eliminados)</SelectItem>
                                <SelectItem value="backup_entregado">Backup Entregado</SelectItem>
                            </SelectContent>
                        </Select>

                        {formData.estadoFinal.datosUsuario === 'backup_entregado' && (
                            <Input
                                placeholder="Ubicación backup (Ej: /D/Backup)"
                                value={formData.estadoFinal.backupUbicacion}
                                onChange={(e) => setFormData(p => ({ ...p, estadoFinal: { ...p.estadoFinal, backupUbicacion: e.target.value } }))}
                            />
                        )}
                    </div>
                </div>

                {/* 4. Instrucciones y Conformidad */}
                <div className="border-t pt-6">
                    <div className="mb-6">
                        <Label className="font-semibold mb-2 block">Instrucciones al Cliente</Label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                placeholder="Añadir instrucción..."
                                value={nuevaInstruccion}
                                onChange={(e) => setNuevaInstruccion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && agregarInstruccion()}
                            />
                            <Button variant="outline" onClick={agregarInstruccion} type="button">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {formData.instrucciones.map((inst, i) => (
                                <li key={i} className="tems-center justify-between group">
                                    {inst}
                                    <button onClick={() => eliminarInstruccion(i)} className="ml-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="h-3 w-3 inline" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border flex items-center gap-4">
                        <Checkbox
                            id="conforme"
                            className="h-6 w-6 border-2 border-primary"
                            checked={formData.conforme}
                            onCheckedChange={(c) => setFormData(p => ({ ...p, conforme: c as boolean }))}
                        />
                        <div>
                            <Label htmlFor="conforme" className="font-bold text-lg cursor-pointer">
                                Conformidad del Cliente
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                                El cliente declara recibir el equipo en las condiciones descritas y estar conforme con la intervención.
                            </p>
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
                            Generar Entregable
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
