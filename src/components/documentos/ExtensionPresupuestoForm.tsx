'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type {
    MetadatosExtensionPresupuesto,
    ItemRepuesto,
    ActividadManoObra
} from '@/types/documentos'
import { PresupuestoSelector } from '@/components/common/PresupuestoSelector'

interface ExtensionPresupuestoFormProps {
    presupuestoOriginalId?: string
    initialValues?: MetadatosExtensionPresupuesto
    readOnly?: boolean
    onSubmit: (metadatos: MetadatosExtensionPresupuesto) => void
    onCancel: () => void
    isSubmitting?: boolean
}

export function ExtensionPresupuestoForm({
    presupuestoOriginalId = '',
    initialValues,
    readOnly = false,
    onSubmit,
    onCancel,
    isSubmitting = false
}: ExtensionPresupuestoFormProps) {
    // Estado
    const [presupuestoSeleccionadoId, setPresupuestoSeleccionadoId] = useState(presupuestoOriginalId || '')
    const [numeroPresupuestoOriginal, setNumeroPresupuestoOriginal] = useState(initialValues?.numeroPresupuestoOriginal || '')
    const [fechaDescubrimiento, setFechaDescubrimiento] = useState<Date>(initialValues?.fechaDescubrimiento ? new Date(initialValues.fechaDescubrimiento) : new Date())
    const [motivo, setMotivo] = useState<'danos_adicionales' | 'componentes_adicionales' | 'problemas_colaterales' | 'otro'>(initialValues?.motivoExtension || 'danos_adicionales')

    // Diagnóstico Ampliado
    const [diagnosticoDesc, setDiagnosticoDesc] = useState(initialValues?.diagnosticoAmpliado.descripcion || '')

    // Nuevos Trabajos
    const [trabajosDesc, setTrabajosDesc] = useState(initialValues?.nuevosTrabajos.descripcionDetallada || '')
    const [repuestos, setRepuestos] = useState<ItemRepuesto[]>(initialValues?.nuevosTrabajos.repuestosAdicionales || [])
    const [manoObra, setManoObra] = useState<ActividadManoObra[]>(initialValues?.nuevosTrabajos.manoObraExtra || [])

    // Tiempos
    const [tiempoExtra, setTiempoExtra] = useState(initialValues?.nuevoTiempoEstimado?.toString() || '0')
    const [impactoGarantia, setImpactoGarantia] = useState(initialValues?.impactoGarantia || 'Mantiene garantías del presupuesto original')

    // Totales calculados
    const [totalRepuestos, setTotalRepuestos] = useState(0)
    const [totalManoObra, setTotalManoObra] = useState(0)
    const [totalGeneral, setTotalGeneral] = useState(0)

    // Handler para cambio de presupuesto
    const handlePresupuestoChange = (presupuesto: any) => {
        setPresupuestoSeleccionadoId(presupuesto.id)
        setNumeroPresupuestoOriginal(presupuesto.numeroDocumento)
    }

    // Efecto para calcular totales
    useEffect(() => {
        const tRep = repuestos.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0)
        const tMO = manoObra.reduce((acc, item) => acc + (item.horasEstimadas * item.precioHora), 0)

        setTotalRepuestos(tRep)
        setTotalManoObra(tMO)
        setTotalGeneral(tRep + tMO)
    }, [repuestos, manoObra])

    // Handlers para Repuestos
    const agregarRepuesto = () => {
        setRepuestos([...repuestos, { codigo: '', descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }])
    }

    const actualizarRepuesto = (index: number, campo: keyof ItemRepuesto, valor: any) => {
        const nuevos = [...repuestos]
        nuevos[index] = { ...nuevos[index], [campo]: valor }
        // Recalcular subtotal
        nuevos[index].subtotal = nuevos[index].cantidad * nuevos[index].precioUnitario
        setRepuestos(nuevos)
    }

    const eliminarRepuesto = (index: number) => {
        setRepuestos(repuestos.filter((_, i) => i !== index))
    }

    // Handlers para Mano de Obra
    const agregarManoObra = () => {
        setManoObra([...manoObra, { descripcion: '', horasEstimadas: 1, precioHora: 40, subtotal: 40 }])
    }

    const actualizarManoObra = (index: number, campo: keyof ActividadManoObra, valor: any) => {
        const nuevos = [...manoObra]
        nuevos[index] = { ...nuevos[index], [campo]: valor }
        // Recalcular subtotal
        nuevos[index].subtotal = nuevos[index].horasEstimadas * nuevos[index].precioHora
        setManoObra(nuevos)
    }

    const eliminarManoObra = (index: number) => {
        setManoObra(manoObra.filter((_, i) => i !== index))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const metadatos: MetadatosExtensionPresupuesto = {
            presupuestoOriginalId,
            numeroPresupuestoOriginal,
            fechaDescubrimiento,
            motivoExtension: motivo,
            diagnosticoAmpliado: {
                descripcion: diagnosticoDesc,
                evidencias: [] // TODO: Implementar manejo de evidencias si es necesario
            },
            nuevosTrabajos: {
                descripcionDetallada: trabajosDesc,
                repuestosAdicionales: repuestos,
                manoObraExtra: manoObra
            },
            costoAdicional: {
                repuestos: totalRepuestos,
                manoObra: totalManoObra,
                total: totalGeneral
            },
            nuevoTiempoEstimado: parseFloat(tiempoExtra) || 0,
            impactoGarantia
        }

        onSubmit(metadatos)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-blue-200 bg-blue-50/10">
                <CardHeader>
                    <CardTitle className="text-blue-900">Extensión de Presupuesto</CardTitle>
                    <CardDescription>Documentación de trabajos adicionales no contemplados inicialmente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Información Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Presupuesto Original</Label>
                            <PresupuestoSelector
                                value={presupuestoSeleccionadoId}
                                onChange={handlePresupuestoChange}
                                disabled={readOnly}
                            />
                            {numeroPresupuestoOriginal && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Número: {numeroPresupuestoOriginal}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha del Hallazgo</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !fechaDescubrimiento && "text-muted-foreground"
                                        )}
                                        disabled={readOnly}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {fechaDescubrimiento ? format(fechaDescubrimiento, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={fechaDescubrimiento}
                                        onSelect={(date) => date && setFechaDescubrimiento(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Motivo de la Extensión</Label>
                        <Select
                            value={motivo}
                            onValueChange={(v: any) => setMotivo(v)}
                            disabled={readOnly}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="danos_adicionales">Daños Adicionales Descubiertos</SelectItem>
                                <SelectItem value="componentes_adicionales">Componentes Adicionales Necesarios</SelectItem>
                                <SelectItem value="problemas_colaterales">Problemas Colaterales</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Descripción del Nuevo Diagnóstico</Label>
                        <Textarea
                            value={diagnosticoDesc}
                            onChange={(e) => setDiagnosticoDesc(e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa el problema encontrado..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Descripción de los Trabajos Adicionales</Label>
                        <Textarea
                            value={trabajosDesc}
                            onChange={(e) => setTrabajosDesc(e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa qué se necesita hacer..."
                            rows={3}
                        />
                    </div>

                    {/* Repuestos Adicionales */}
                    <div className="border rounded-md p-4 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-sm">Repuestos Adicionales</h4>
                            {!readOnly && (
                                <Button type="button" variant="outline" size="sm" onClick={agregarRepuesto}>
                                    <Plus className="h-4 w-4 mr-2" /> Agregar Repuesto
                                </Button>
                            )}
                        </div>
                        {repuestos.length === 0 ? (
                            <p className="text-sm text-gray-500 italic text-center py-2">No se requieren repuestos adicionales</p>
                        ) : (
                            <div className="space-y-3">
                                {repuestos.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-2">
                                        <div className="col-span-2">
                                            <Label className="text-xs">Código</Label>
                                            <Input
                                                value={item.codigo}
                                                onChange={(e) => actualizarRepuesto(index, 'codigo', e.target.value)}
                                                disabled={readOnly}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <Label className="text-xs">Descripción</Label>
                                            <Input
                                                value={item.descripcion}
                                                onChange={(e) => actualizarRepuesto(index, 'descripcion', e.target.value)}
                                                disabled={readOnly}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-xs">Cant.</Label>
                                            <Input
                                                type="number"
                                                value={item.cantidad}
                                                onChange={(e) => actualizarRepuesto(index, 'cantidad', parseFloat(e.target.value))}
                                                disabled={readOnly}
                                                className="h-8 text-xs"
                                                min={1}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-xs">Precio U.</Label>
                                            <Input
                                                type="number"
                                                value={item.precioUnitario}
                                                onChange={(e) => actualizarRepuesto(index, 'precioUnitario', parseFloat(e.target.value))}
                                                disabled={readOnly}
                                                className="h-8 text-xs"
                                                min={0}
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <div className="flex-1">
                                                <Label className="text-xs">Subtotal</Label>
                                                <div className="text-sm font-bold h-8 flex items-center px-2 bg-gray-50 rounded border">
                                                    {(item.cantidad * item.precioUnitario).toFixed(2)}€
                                                </div>
                                            </div>
                                            {!readOnly && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => eliminarRepuesto(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end mt-2 pt-2 border-t border-dashed">
                            <span className="text-sm font-medium mr-2">Total Repuestos:</span>
                            <span className="text-sm font-bold">{totalRepuestos.toFixed(2)}€</span>
                        </div>
                    </div>

                    {/* Mano de Obra Extra */}
                    <div className="border rounded-md p-4 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-sm">Mano de Obra Extra</h4>
                            {!readOnly && (
                                <Button type="button" variant="outline" size="sm" onClick={agregarManoObra}>
                                    <Plus className="h-4 w-4 mr-2" /> Agregar Tarea
                                </Button>
                            )}
                        </div>
                        {manoObra.length === 0 ? (
                            <p className="text-sm text-gray-500 italic text-center py-2">No se requiere mano de obra adicional</p>
                        ) : (
                            <div className="space-y-3">
                                {manoObra.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-2">
                                        <div className="col-span-6">
                                            <Label className="text-xs">Descripción Tarea</Label>
                                            <Input
                                                value={item.descripcion}
                                                onChange={(e) => actualizarManoObra(index, 'descripcion', e.target.value)}
                                                disabled={readOnly}
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-xs">Horas Est.</Label>
                                            <Input
                                                type="number"
                                                value={item.horasEstimadas}
                                                onChange={(e) => actualizarManoObra(index, 'horasEstimadas', parseFloat(e.target.value))}
                                                disabled={readOnly}
                                                className="h-8 text-xs"
                                                min={0.5}
                                                step="0.5"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-xs">Precio/Hora</Label>
                                            <Input
                                                type="number"
                                                value={item.precioHora}
                                                onChange={(e) => actualizarManoObra(index, 'precioHora', parseFloat(e.target.value))}
                                                disabled={readOnly}
                                                className="h-8 text-xs"
                                                min={0}
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <div className="flex-1">
                                                <Label className="text-xs">Subtotal</Label>
                                                <div className="text-sm font-bold h-8 flex items-center px-2 bg-gray-50 rounded border">
                                                    {(item.horasEstimadas * item.precioHora).toFixed(2)}€
                                                </div>
                                            </div>
                                            {!readOnly && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => eliminarManoObra(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end mt-2 pt-2 border-t border-dashed">
                            <span className="text-sm font-medium mr-2">Total Mano de Obra:</span>
                            <span className="text-sm font-bold">{totalManoObra.toFixed(2)}€</span>
                        </div>
                    </div>

                    {/* Resumen Total */}
                    <div className="flex flex-col items-end space-y-2 pt-4 border-t">
                        <div className="text-xl font-bold text-blue-800">
                            Total Adicional Estimado: {totalGeneral.toFixed(2)}€ <span className="text-xs text-gray-500 font-normal">(sin IVA)</span>
                        </div>
                        <div className="w-full md:w-1/2 flex items-center gap-4">
                            <Label className="whitespace-nowrap">Tiempo Adicional Estimado (horas):</Label>
                            <Input
                                type="number"
                                value={tiempoExtra}
                                onChange={(e) => setTiempoExtra(e.target.value)}
                                disabled={readOnly}
                                className="w-24"
                                min={0}
                            />
                        </div>
                        <div className="w-full">
                            <Label>Impacto en Garantía</Label>
                            <Input
                                value={impactoGarantia}
                                onChange={(e) => setImpactoGarantia(e.target.value)}
                                disabled={readOnly}
                            />
                        </div>
                    </div>

                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                {!readOnly && (
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Generar Extensión'}
                    </Button>
                )}
            </div>
        </form>
    )
}
