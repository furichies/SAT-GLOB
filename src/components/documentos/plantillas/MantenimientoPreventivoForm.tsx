'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Wrench } from 'lucide-react'
import { MetadatosMantenimientoPreventivo } from '@/types/plantillas'
import { DocumentoTipo } from '@/types/enums'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface MantenimientoPreventivoFormProps {
    ticket: any
    onSuccess?: (documento: any) => void
    onCancel?: () => void
}

export function MantenimientoPreventivoForm({ ticket, onSuccess, onCancel }: MantenimientoPreventivoFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState<MetadatosMantenimientoPreventivo>({
        equipo: '',
        periodicidad: 'trimestral',
        revisionHardware: {
            fuenteAlimentacion: { estado: 'ok', accion: '' },
            ventilacion: { estado: 'ok', accion: '' },
            discoDuro: { estado: 'ok', accion: '' },
            memoriaRam: { estado: 'ok', accion: '' },
            tarjetaGrafica: { estado: 'ok', accion: '' },
            placaBase: { estado: 'ok', accion: '' },
            conectividad: { estado: 'ok', accion: '' },
            perifericos: { estado: 'ok', accion: '' }
        },
        limpiezaFisica: false,
        observacionesHardware: '',
        revisionSoftware: {
            actualizacionesSo: 'completas',
            actualizacionesAntivirus: 'ok',
            espacioDiscoLibre: 50,
            fragmentacion: 'ok',
            programasInstalados: 'revisado',
            licenciasVigentes: 'ok',
            copiasSeguridad: {
                estado: false
            }
        },
        rendimiento: {
            tiempoArranqueActual: 0,
            testRendimiento: 'optimo'
        },
        recomendaciones: {
            ampliacionRam: false,
            actualizacionSsd: false,
            renovacionEquipo: false,
            mejoraSeguridad: '',
            otras: ''
        }
    })

    const handleHardwareChange = (componente: keyof typeof formData.revisionHardware, field: 'estado' | 'accion', value: any) => {
        setFormData(prev => ({
            ...prev,
            revisionHardware: {
                ...prev.revisionHardware,
                [componente]: {
                    ...prev.revisionHardware[componente],
                    [field]: value
                }
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
                    tipo: DocumentoTipo.INFORME_MANTENIMIENTO_PREVENTIVO,
                    ticketId: ticket.id,
                    metadatos: JSON.stringify(formData)
                })
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Informe generado",
                    description: "El informe de mantenimiento preventivo se ha creado correctamente.",
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

    const componentesHardware = [
        { key: 'fuenteAlimentacion', label: 'Fuente alimentación' },
        { key: 'ventilacion', label: 'Ventilación/cooling' },
        { key: 'discoDuro', label: 'Disco duro/SSD' },
        { key: 'memoriaRam', label: 'Memoria RAM' },
        { key: 'tarjetaGrafica', label: 'Tarjeta gráfica' },
        { key: 'placaBase', label: 'Placa base' },
        { key: 'conectividad', label: 'Conectividad (RJ45)' },
        { key: 'perifericos', label: 'Periféricos' }
    ] as const

    return (
        <Card className="w-full max-w-5xl mx-auto shadow-lg">
            <CardHeader className="bg-primary/5 border-b mb-6">
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <Wrench className="h-5 w-5" />
                    Informe de Mantenimiento Preventivo
                </CardTitle>
                <CardDescription>
                    Ticket #{ticket.numeroTicket} - {ticket.cliente?.nombre || 'Cliente'}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Datos Generales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Equipo</Label>
                        <Input
                            value={formData.equipo}
                            onChange={(e) => setFormData(p => ({ ...p, equipo: e.target.value }))}
                            placeholder="Ej: PC Oficina 01"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Periodicidad</Label>
                        <Select
                            value={formData.periodicidad}
                            onValueChange={(v: any) => setFormData(p => ({ ...p, periodicidad: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mensual">Mensual</SelectItem>
                                <SelectItem value="trimestral">Trimestral</SelectItem>
                                <SelectItem value="semestral">Semestral</SelectItem>
                                <SelectItem value="anual">Anual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Revisión Hardware */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Revisión Hardware</h3>
                    <div className="space-y-3">
                        {componentesHardware.map(({ key, label }) => (
                            <div key={key} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-muted/20 p-3 rounded-lg">
                                <div className="md:col-span-3">
                                    <Label className="text-sm font-medium">{label}</Label>
                                </div>
                                <div className="md:col-span-2 flex gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`${key}-estado`}
                                            checked={formData.revisionHardware[key].estado === 'ok'}
                                            onChange={() => handleHardwareChange(key, 'estado', 'ok')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">OK</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`${key}-estado`}
                                            checked={formData.revisionHardware[key].estado === 'ko'}
                                            onChange={() => handleHardwareChange(key, 'estado', 'ko')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">KO</span>
                                    </label>
                                </div>
                                <div className="md:col-span-7">
                                    <Input
                                        placeholder="Acción realizada"
                                        value={formData.revisionHardware[key].accion}
                                        onChange={(e) => handleHardwareChange(key, 'accion', e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="limpieza"
                                checked={formData.limpiezaFisica}
                                onCheckedChange={(c) => setFormData(p => ({ ...p, limpiezaFisica: c as boolean }))}
                            />
                            <Label htmlFor="limpieza">Limpieza física realizada</Label>
                        </div>
                        <div className="space-y-2">
                            <Label>Observaciones Hardware</Label>
                            <Textarea
                                value={formData.observacionesHardware}
                                onChange={(e) => setFormData(p => ({ ...p, observacionesHardware: e.target.value }))}
                                placeholder="Observaciones adicionales sobre el hardware..."
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Revisión Software */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Revisión Software</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Actualizaciones SO</Label>
                            <Select
                                value={formData.revisionSoftware.actualizacionesSo}
                                onValueChange={(v: any) => setFormData(p => ({
                                    ...p,
                                    revisionSoftware: { ...p.revisionSoftware, actualizacionesSo: v }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="completas">Completas</SelectItem>
                                    <SelectItem value="pendientes">Pendientes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.revisionSoftware.actualizacionesSo === 'pendientes' && (
                            <div className="space-y-2">
                                <Label>Detalles pendientes</Label>
                                <Input
                                    value={formData.revisionSoftware.detallesPendientes || ''}
                                    onChange={(e) => setFormData(p => ({
                                        ...p,
                                        revisionSoftware: { ...p.revisionSoftware, detallesPendientes: e.target.value }
                                    }))}
                                    placeholder="Especificar actualizaciones pendientes"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Actualizaciones Antivirus</Label>
                            <Select
                                value={formData.revisionSoftware.actualizacionesAntivirus}
                                onValueChange={(v: any) => setFormData(p => ({
                                    ...p,
                                    revisionSoftware: { ...p.revisionSoftware, actualizacionesAntivirus: v }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ok">OK</SelectItem>
                                    <SelectItem value="requiere_atencion">Requiere atención</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Espacio en disco libre (%)</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.revisionSoftware.espacioDiscoLibre}
                                onChange={(e) => setFormData(p => ({
                                    ...p,
                                    revisionSoftware: { ...p.revisionSoftware, espacioDiscoLibre: Number(e.target.value) }
                                }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Fragmentación (HDD)</Label>
                            <Select
                                value={formData.revisionSoftware.fragmentacion}
                                onValueChange={(v: any) => setFormData(p => ({
                                    ...p,
                                    revisionSoftware: { ...p.revisionSoftware, fragmentacion: v }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ok">OK</SelectItem>
                                    <SelectItem value="desfragmentado">Desfragmentado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Programas instalados</Label>
                            <Select
                                value={formData.revisionSoftware.programasInstalados}
                                onValueChange={(v: any) => setFormData(p => ({
                                    ...p,
                                    revisionSoftware: { ...p.revisionSoftware, programasInstalados: v }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="revisado">Revisado</SelectItem>
                                    <SelectItem value="limpieza_realizada">Limpieza realizada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Licencias vigentes</Label>
                            <Select
                                value={formData.revisionSoftware.licenciasVigentes}
                                onValueChange={(v: any) => setFormData(p => ({
                                    ...p,
                                    revisionSoftware: { ...p.revisionSoftware, licenciasVigentes: v }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ok">OK</SelectItem>
                                    <SelectItem value="renovaciones">Renovaciones necesarias</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.revisionSoftware.licenciasVigentes === 'renovaciones' && (
                            <div className="space-y-2">
                                <Label>Detalles renovaciones</Label>
                                <Input
                                    value={formData.revisionSoftware.detallesRenovaciones || ''}
                                    onChange={(e) => setFormData(p => ({
                                        ...p,
                                        revisionSoftware: { ...p.revisionSoftware, detallesRenovaciones: e.target.value }
                                    }))}
                                    placeholder="Especificar licencias a renovar"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Última copia de seguridad</Label>
                            <Input
                                type="date"
                                value={formData.revisionSoftware.copiasSeguridad.ultimaCopia || ''}
                                onChange={(e) => setFormData(p => ({
                                    ...p,
                                    revisionSoftware: {
                                        ...p.revisionSoftware,
                                        copiasSeguridad: {
                                            ...p.revisionSoftware.copiasSeguridad,
                                            ultimaCopia: e.target.value
                                        }
                                    }
                                }))}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="backup-ok"
                                checked={formData.revisionSoftware.copiasSeguridad.estado}
                                onCheckedChange={(c) => setFormData(p => ({
                                    ...p,
                                    revisionSoftware: {
                                        ...p.revisionSoftware,
                                        copiasSeguridad: {
                                            ...p.revisionSoftware.copiasSeguridad,
                                            estado: c as boolean
                                        }
                                    }
                                }))}
                            />
                            <Label htmlFor="backup-ok">Copias de seguridad OK</Label>
                        </div>
                    </div>
                </div>

                {/* Rendimiento */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Rendimiento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Tiempo de arranque actual (seg)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.rendimiento.tiempoArranqueActual}
                                onChange={(e) => setFormData(p => ({
                                    ...p,
                                    rendimiento: { ...p.rendimiento, tiempoArranqueActual: Number(e.target.value) }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tiempo de arranque anterior (seg)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.rendimiento.tiempoArranqueAnterior || ''}
                                onChange={(e) => setFormData(p => ({
                                    ...p,
                                    rendimiento: { ...p.rendimiento, tiempoArranqueAnterior: Number(e.target.value) || undefined }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Test de rendimiento</Label>
                            <Select
                                value={formData.rendimiento.testRendimiento}
                                onValueChange={(v: any) => setFormData(p => ({
                                    ...p,
                                    rendimiento: { ...p.rendimiento, testRendimiento: v }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="optimo">Óptimo</SelectItem>
                                    <SelectItem value="aceptable">Aceptable</SelectItem>
                                    <SelectItem value="mejorable">Mejorable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Recomendaciones */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Recomendaciones</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="rec-ram"
                                    checked={formData.recomendaciones.ampliacionRam}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        recomendaciones: { ...p.recomendaciones, ampliacionRam: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="rec-ram">Ampliación RAM</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="rec-ssd"
                                    checked={formData.recomendaciones.actualizacionSsd}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        recomendaciones: { ...p.recomendaciones, actualizacionSsd: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="rec-ssd">Actualización a SSD</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="rec-renovacion"
                                    checked={formData.recomendaciones.renovacionEquipo}
                                    onCheckedChange={(c) => setFormData(p => ({
                                        ...p,
                                        recomendaciones: { ...p.recomendaciones, renovacionEquipo: c as boolean }
                                    }))}
                                />
                                <Label htmlFor="rec-renovacion">Renovación equipo</Label>
                            </div>
                            {formData.recomendaciones.renovacionEquipo && (
                                <div className="space-y-2">
                                    <Label className="text-xs">Antigüedad (años)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.recomendaciones.antiguedadEquipo || ''}
                                        onChange={(e) => setFormData(p => ({
                                            ...p,
                                            recomendaciones: { ...p.recomendaciones, antiguedadEquipo: Number(e.target.value) || undefined }
                                        }))}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Mejora de seguridad</Label>
                            <Input
                                value={formData.recomendaciones.mejoraSeguridad}
                                onChange={(e) => setFormData(p => ({
                                    ...p,
                                    recomendaciones: { ...p.recomendaciones, mejoraSeguridad: e.target.value }
                                }))}
                                placeholder="Recomendaciones de seguridad..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Otras recomendaciones</Label>
                            <Textarea
                                value={formData.recomendaciones.otras}
                                onChange={(e) => setFormData(p => ({
                                    ...p,
                                    recomendaciones: { ...p.recomendaciones, otras: e.target.value }
                                }))}
                                placeholder="Otras recomendaciones..."
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Próximo mantenimiento programado</Label>
                            <Input
                                type="date"
                                value={formData.proximoMantenimiento || ''}
                                onChange={(e) => setFormData(p => ({ ...p, proximoMantenimiento: e.target.value }))}
                            />
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
                            Generar Informe
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
