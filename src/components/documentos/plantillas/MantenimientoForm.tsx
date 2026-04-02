'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, FileText, CheckCircle2 } from 'lucide-react'
import { MetadatosMantenimiento } from '@/types/plantillas'
import { DocumentoTipo } from '@/types/enums'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface MantenimientoFormProps {
    ticket: any
    onSuccess?: (documento: any) => void
    onCancel?: () => void
}

export function MantenimientoForm({ ticket, onSuccess, onCancel }: MantenimientoFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Estado inicial con valores por defecto
    const [formData, setFormData] = useState<MetadatosMantenimiento>({
        periodicidad: 'semestral',
        hardware: {
            fuenteAlimentacion: false,
            ventilacion: false,
            discoDuro: false,
            memoriaRam: false,
            tarjetaGrafica: false,
            placaBase: false,
            conectividad: false,
            perifericos: false,
        },
        limpiezaFisica: false,
        observacionesHardware: '',
        software: {
            actualizacionesSo: 'pendientes',
            actualizacionesAntivirus: 'ok',
            espacioDiscoLibre: 0,
            fragmentacion: false,
            programasInstalados: 'revisado',
            licenciasVigentes: 'ok',
            copiasSeguridad: {
                estado: false
            }
        },
        rendimiento: {
            tiempoArranqueActual: 0,
            testRendimiento: 'aceptable'
        },
        recomendaciones: {
            ampliacionRam: false,
            actualizacionSsd: false,
            renovacionEquipo: false,
            mejoraSeguridad: '',
            otras: ''
        }
    })

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/admin/documentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: DocumentoTipo.INFORME_MANTENIMIENTO,
                    ticketId: ticket.id,
                    metadatos: JSON.stringify(formData)
                })
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Documento generado",
                    description: "El informe de mantenimiento se ha creado correctamente.",
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

    const updateHardware = (key: keyof typeof formData.hardware, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            hardware: { ...prev.hardware, [key]: value }
        }))
    }

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <CardHeader className="bg-primary/5 border-b mb-6">
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <FileText className="h-5 w-5" />
                    Informe de Mantenimiento Preventivo
                </CardTitle>
                <CardDescription>
                    Ticket #{ticket.numeroTicket} - {ticket.asunto}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* 1. Periodicidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-lg">
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
                    <div className="space-y-2">
                        <Label>Fecha Próximo Mantenimiento (Opcional)</Label>
                        <Input
                            type="date"
                            onChange={(e) => setFormData(p => ({ ...p, proximoMantenimiento: e.target.value }))}
                        />
                    </div>
                </div>

                {/* 2. Revisión Hardware */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Revisión Hardware
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {[
                            { k: 'fuenteAlimentacion', l: 'Fuente Alimentación' },
                            { k: 'ventilacion', l: 'Ventilación/Cooling' },
                            { k: 'discoDuro', l: 'Disco Duro/SSD' },
                            { k: 'memoriaRam', l: 'Memoria RAM' },
                            { k: 'tarjetaGrafica', l: 'Tarjeta Gráfica' },
                            { k: 'placaBase', l: 'Placa Base' },
                            { k: 'conectividad', l: 'Conectividad (RJ45)' },
                            { k: 'perifericos', l: 'Periféricos' },
                        ].map((item: any) => (
                            <div key={item.k} className="flex items-center space-x-2 border p-3 rounded hover:bg-muted/50 transition-colors">
                                <Checkbox
                                    id={item.k}
                                    checked={formData.hardware[item.k as keyof typeof formData.hardware]}
                                    onCheckedChange={(c) => updateHardware(item.k, c as boolean)}
                                />
                                <Label htmlFor={item.k} className="cursor-pointer flex-1">{item.l}</Label>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 border p-3 rounded bg-blue-50/50">
                            <Checkbox
                                id="limpiezaFisica"
                                checked={formData.limpiezaFisica}
                                onCheckedChange={(c) => setFormData(p => ({ ...p, limpiezaFisica: c as boolean }))}
                            />
                            <Label htmlFor="limpiezaFisica" className="font-semibold cursor-pointer">Limpieza física realizada</Label>
                        </div>
                        <div className="space-y-2">
                            <Label>Observaciones Hardware</Label>
                            <Input
                                placeholder="Notas sobre el estado físico..."
                                value={formData.observacionesHardware}
                                onChange={(e) => setFormData(p => ({ ...p, observacionesHardware: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Revisión Software */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        Revisión Software
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Actualizaciones SO</Label>
                                <Select
                                    value={formData.software.actualizacionesSo}
                                    onValueChange={(v: any) => setFormData(p => ({ ...p, software: { ...p.software, actualizacionesSo: v } }))}
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
                            <div className="space-y-2">
                                <Label>Licencias Vigentes</Label>
                                <Select
                                    value={formData.software.licenciasVigentes}
                                    onValueChange={(v: any) => setFormData(p => ({ ...p, software: { ...p.software, licenciasVigentes: v } }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ok">Correctas (OK)</SelectItem>
                                        <SelectItem value="renovaciones">Requiere renovación</SelectItem>
                                        <SelectItem value="no_aplica">No aplica</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 border p-3 rounded">
                                <Checkbox
                                    id="backup"
                                    checked={formData.software.copiasSeguridad.estado}
                                    onCheckedChange={(c) => setFormData(p => ({ ...p, software: { ...p.software, copiasSeguridad: { ...p.software.copiasSeguridad, estado: c as boolean } } }))}
                                />
                                <Label htmlFor="backup" className="cursor-pointer">Copia de Seguridad OK</Label>
                            </div>
                            <div className="space-y-2">
                                <Label>Espacio Libre Disco (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.software.espacioDiscoLibre}
                                    onChange={(e) => setFormData(p => ({ ...p, software: { ...p.software, espacioDiscoLibre: Number(e.target.value) } }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Recomendaciones */}
                <div className="bg-amber-50/50 p-6 rounded-lg border border-amber-100">
                    <h3 className="text-lg font-semibold mb-4 text-amber-800">Recomendaciones Finales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="ram"
                                checked={formData.recomendaciones.ampliacionRam}
                                onCheckedChange={(c) => setFormData(p => ({ ...p, recomendaciones: { ...p.recomendaciones, ampliacionRam: c as boolean } }))}
                            />
                            <Label htmlFor="ram">Ampliación RAM</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="ssd"
                                checked={formData.recomendaciones.actualizacionSsd}
                                onCheckedChange={(c) => setFormData(p => ({ ...p, recomendaciones: { ...p.recomendaciones, actualizacionSsd: c as boolean } }))}
                            />
                            <Label htmlFor="ssd">Pasar a SSD</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="new"
                                checked={formData.recomendaciones.renovacionEquipo}
                                onCheckedChange={(c) => setFormData(p => ({ ...p, recomendaciones: { ...p.recomendaciones, renovacionEquipo: c as boolean } }))}
                            />
                            <Label htmlFor="new">Renovar Equipo</Label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Otras recomendaciones / Seguridad</Label>
                        <Textarea
                            placeholder="Detallar sugerencias adicionales..."
                            value={formData.recomendaciones.otras}
                            onChange={(e) => setFormData(p => ({ ...p, recomendaciones: { ...p.recomendaciones, otras: e.target.value } }))}
                        />
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
