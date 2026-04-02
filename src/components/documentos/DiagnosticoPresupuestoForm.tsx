'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, FileText, Wrench, DollarSign } from 'lucide-react'
import type { MetadatosDiagnosticoPresupuesto, ItemRepuesto, ActividadManoObra } from '@/types/documentos'
import { TecnicoSelector } from '@/components/common/TecnicoSelector'

interface DiagnosticoPresupuestoFormProps {
    ticketId?: string
    initialValues?: MetadatosDiagnosticoPresupuesto
    readOnly?: boolean
    onSubmit: (metadatos: MetadatosDiagnosticoPresupuesto) => void
    onCancel: () => void
}

export function DiagnosticoPresupuestoForm({
    ticketId,
    initialValues,
    readOnly = false,
    onSubmit,
    onCancel,
}: DiagnosticoPresupuestoFormProps) {
    // Estado del formulario
    const [tecnicoId, setTecnicoId] = useState(initialValues?.tecnicoAsignado.id || '')
    const [tecnicoNombre, setTecnicoNombre] = useState(initialValues?.tecnicoAsignado.nombre || '')
    const [pruebasRealizadas, setPruebasRealizadas] = useState<string[]>(initialValues?.diagnostico.pruebasRealizadas || [''])
    const [resultadosObtenidos, setResultadosObtenidos] = useState(initialValues?.diagnostico.resultadosObtenidos || '')
    const [componentesDefectuosos, setComponentesDefectuosos] = useState<string[]>(initialValues?.diagnostico.componentesDefectuosos || [''])
    const [causaRaiz, setCausaRaiz] = useState(initialValues?.diagnostico.causaRaiz || '')
    const [descripcionTrabajos, setDescripcionTrabajos] = useState(initialValues?.reparacionPropuesta.descripcionTrabajos || '')
    const [repuestos, setRepuestos] = useState<ItemRepuesto[]>(initialValues?.reparacionPropuesta.repuestosNecesarios || [
        { codigo: '', descripcion: '', cantidad: 0, precioUnitario: 0, subtotal: 0 }
    ])
    const [manoObra, setManoObra] = useState<ActividadManoObra[]>(initialValues?.reparacionPropuesta.manoObra || [
        { descripcion: '', horasEstimadas: 0, precioHora: 0, subtotal: 0 }
    ])
    const [costosAdicionales, setCostosAdicionales] = useState<{ descripcion: string; monto: number }[]>(initialValues?.costos.costosAdicionales || [])
    const [tiempoEstimado, setTiempoEstimado] = useState(initialValues?.tiempoEstimadoReparacion || 0)
    const [garantiaRepuestos, setGarantiaRepuestos] = useState(initialValues?.garantiaOfrecida.repuestos || 12)
    const [garantiaManoObra, setGarantiaManoObra] = useState(initialValues?.garantiaOfrecida.manoObra || 6)
    const [validezPresupuesto, setValidezPresupuesto] = useState(initialValues?.validezPresupuesto || 15)
    const [alternativas, setAlternativas] = useState<string[]>(initialValues?.alternativasReparacion || [])
    const [recomendaciones, setRecomendaciones] = useState(initialValues?.recomendacionesAdicionales || '')

    // Cargar el técnico asignado al ticket si existe
    useEffect(() => {
        const cargarTecnicoDelTicket = async () => {
            if (!ticketId || initialValues?.tecnicoAsignado.id) {
                // Si no hay ticketId o ya hay valores iniciales, no hacer nada
                return
            }

            try {
                // Obtener información del ticket
                const res = await fetch(`/api/sat/tickets/${ticketId}`)
                if (res.ok) {
                    const data = await res.json()
                    const ticket = data.ticket || data

                    // Si el ticket tiene un técnico asignado, pre-seleccionarlo
                    if (ticket.tecnico?.usuario) {
                        const nombreCompleto = `${ticket.tecnico.usuario.nombre} ${ticket.tecnico.usuario.apellidos || ''}`.trim()
                        setTecnicoId(ticket.tecnico.usuario.id || '')
                        setTecnicoNombre(nombreCompleto)
                        console.log('Técnico del ticket cargado:', nombreCompleto, ticket.tecnico.usuario.id)
                    }
                }
            } catch (error) {
                console.error('Error al cargar técnico del ticket:', error)
            }
        }

        cargarTecnicoDelTicket()
    }, [ticketId, initialValues])


    // Funciones para manejar arrays
    const agregarPrueba = () => {
        setPruebasRealizadas([...pruebasRealizadas, ''])
    }

    const eliminarPrueba = (index: number) => {
        setPruebasRealizadas(pruebasRealizadas.filter((_, i) => i !== index))
    }

    const actualizarPrueba = (index: number, valor: string) => {
        const nuevas = [...pruebasRealizadas]
        nuevas[index] = valor
        setPruebasRealizadas(nuevas)
    }

    const agregarComponente = () => {
        setComponentesDefectuosos([...componentesDefectuosos, ''])
    }

    const eliminarComponente = (index: number) => {
        setComponentesDefectuosos(componentesDefectuosos.filter((_, i) => i !== index))
    }

    const actualizarComponente = (index: number, valor: string) => {
        const nuevos = [...componentesDefectuosos]
        nuevos[index] = valor
        setComponentesDefectuosos(nuevos)
    }

    const agregarRepuesto = () => {
        setRepuestos([...repuestos, { codigo: '', descripcion: '', cantidad: 0, precioUnitario: 0, subtotal: 0 }])
    }

    const eliminarRepuesto = (index: number) => {
        setRepuestos(repuestos.filter((_, i) => i !== index))
    }

    const actualizarRepuesto = (index: number, campo: keyof ItemRepuesto, valor: any) => {
        const nuevos = [...repuestos]
        nuevos[index] = { ...nuevos[index], [campo]: valor }

        // Calcular subtotal automáticamente
        if (campo === 'cantidad' || campo === 'precioUnitario') {
            nuevos[index].subtotal = nuevos[index].cantidad * nuevos[index].precioUnitario
        }

        setRepuestos(nuevos)
    }

    const agregarManoObra = () => {
        setManoObra([...manoObra, { descripcion: '', horasEstimadas: 0, precioHora: 0, subtotal: 0 }])
    }

    const eliminarManoObra = (index: number) => {
        setManoObra(manoObra.filter((_, i) => i !== index))
    }

    const actualizarManoObra = (index: number, campo: keyof ActividadManoObra, valor: any) => {
        const nuevas = [...manoObra]
        nuevas[index] = { ...nuevas[index], [campo]: valor }

        // Calcular subtotal automáticamente
        if (campo === 'horasEstimadas' || campo === 'precioHora') {
            nuevas[index].subtotal = nuevas[index].horasEstimadas * nuevas[index].precioHora
        }

        setManoObra(nuevas)
    }

    const agregarCostoAdicional = () => {
        setCostosAdicionales([...costosAdicionales, { descripcion: '', monto: 0 }])
    }

    const eliminarCostoAdicional = (index: number) => {
        setCostosAdicionales(costosAdicionales.filter((_, i) => i !== index))
    }

    const actualizarCostoAdicional = (index: number, campo: 'descripcion' | 'monto', valor: any) => {
        const nuevos = [...costosAdicionales]
        nuevos[index] = { ...nuevos[index], [campo]: valor }
        setCostosAdicionales(nuevos)
    }

    // Calcular totales
    const calcularTotales = () => {
        const costoRepuestos = repuestos.reduce((sum, r) => sum + r.subtotal, 0)
        const costoManoObra = manoObra.reduce((sum, m) => sum + m.subtotal, 0)
        const otrosCostos = costosAdicionales.reduce((sum, c) => sum + c.monto, 0)
        const subtotal = costoRepuestos + costoManoObra + otrosCostos
        const iva = subtotal * 0.21 // 21% IVA
        const total = subtotal + iva

        return {
            costoRepuestos,
            costoManoObra,
            costosAdicionales: costosAdicionales.length > 0 ? costosAdicionales : undefined,
            subtotal,
            iva,
            total,
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validación: Si se define un repuesto (cantidad > 0 o código o precio), la descripción es obligatoria
        const repuestoInvalido = repuestos.find(r =>
            (r.cantidad > 0 || r.codigo.trim() !== '' || r.precioUnitario > 0) && r.descripcion.trim() === ''
        )

        if (repuestoInvalido) {
            alert('Por favor, indique la descripción para todos los repuestos definidos.')
            return
        }

        const totales = calcularTotales()

        const metadatos: MetadatosDiagnosticoPresupuesto = {
            tecnicoAsignado: {
                id: tecnicoId, // ID real del técnico seleccionado
                nombre: tecnicoNombre,
            },
            diagnostico: {
                pruebasRealizadas: pruebasRealizadas.filter(p => p.trim() !== ''),
                resultadosObtenidos,
                componentesDefectuosos: componentesDefectuosos.filter(c => c.trim() !== ''),
                causaRaiz,
            },
            reparacionPropuesta: {
                descripcionTrabajos,
                repuestosNecesarios: repuestos.filter(r => r.descripcion.trim() !== ''),
                manoObra: manoObra.filter(m => m.descripcion.trim() !== ''),
            },
            costos: totales,
            tiempoEstimadoReparacion: tiempoEstimado,
            garantiaOfrecida: {
                repuestos: garantiaRepuestos,
                manoObra: garantiaManoObra,
            },
            validezPresupuesto,
            alternativasReparacion: alternativas.filter(a => a.trim() !== ''),
            recomendacionesAdicionales: recomendaciones || undefined,
        }

        console.log('Enviando metadatos Diagnóstico:', metadatos)
        onSubmit(metadatos)
    }

    const totales = calcularTotales()

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Técnico Asignado */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Técnico Asignado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <Label htmlFor="tecnico">Seleccionar Técnico</Label>
                        <TecnicoSelector
                            value={tecnicoId}
                            onChange={(id, nombre) => {
                                setTecnicoId(id)
                                setTecnicoNombre(nombre)
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Diagnóstico */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Diagnóstico Detallado
                    </CardTitle>
                    <CardDescription>
                        Describe el proceso de diagnóstico y los resultados obtenidos
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Pruebas Realizadas */}
                    <div>
                        <Label>Pruebas Realizadas</Label>
                        {pruebasRealizadas.map((prueba, index) => (
                            <div key={index} className="flex gap-2 mt-2">
                                <Input
                                    value={prueba}
                                    onChange={(e) => actualizarPrueba(index, e.target.value)}
                                    placeholder="Descripción de la prueba"
                                />
                                {pruebasRealizadas.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => eliminarPrueba(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={agregarPrueba}
                            className="mt-2"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Prueba
                        </Button>
                    </div>

                    {/* Resultados Obtenidos */}
                    <div>
                        <Label htmlFor="resultados">Resultados Obtenidos</Label>
                        <Textarea
                            id="resultados"
                            value={resultadosObtenidos}
                            onChange={(e) => setResultadosObtenidos(e.target.value)}
                            placeholder="Describe los resultados de las pruebas realizadas"
                            rows={4}
                            required
                        />
                    </div>

                    {/* Componentes Defectuosos */}
                    <div>
                        <Label>Componentes Defectuosos</Label>
                        {componentesDefectuosos.map((componente, index) => (
                            <div key={index} className="flex gap-2 mt-2">
                                <Input
                                    value={componente}
                                    onChange={(e) => actualizarComponente(index, e.target.value)}
                                    placeholder="Nombre del componente defectuoso"
                                />
                                {componentesDefectuosos.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => eliminarComponente(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={agregarComponente}
                            className="mt-2"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Componente
                        </Button>
                    </div>

                    {/* Causa Raíz */}
                    <div>
                        <Label htmlFor="causa">Causa Raíz del Problema</Label>
                        <Textarea
                            id="causa"
                            value={causaRaiz}
                            onChange={(e) => setCausaRaiz(e.target.value)}
                            placeholder="Explica la causa principal del problema detectado"
                            rows={3}
                            required
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Reparación Propuesta */}
            <Card>
                <CardHeader>
                    <CardTitle>Reparación Propuesta</CardTitle>
                    <CardDescription>
                        Detalla los trabajos a realizar para solucionar el problema
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="trabajos">Descripción de Trabajos</Label>
                        <Textarea
                            id="trabajos"
                            value={descripcionTrabajos}
                            onChange={(e) => setDescripcionTrabajos(e.target.value)}
                            placeholder="Describe detalladamente los trabajos a realizar"
                            rows={4}
                            required
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Repuestos Necesarios */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Repuestos Necesarios
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {repuestos.map((repuesto, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">Repuesto #{index + 1}</h4>
                                {repuestos.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => eliminarRepuesto(index)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Código</Label>
                                    <Input
                                        value={repuesto.codigo}
                                        onChange={(e) => actualizarRepuesto(index, 'codigo', e.target.value)}
                                        placeholder="Código del repuesto"
                                    />
                                </div>
                                <div>
                                    <Label>Descripción</Label>
                                    <Input
                                        value={repuesto.descripcion}
                                        onChange={(e) => actualizarRepuesto(index, 'descripcion', e.target.value)}
                                        placeholder="Descripción del repuesto"
                                    />
                                </div>
                                <div>
                                    <Label>Cantidad</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={repuesto.cantidad}
                                        onChange={(e) => actualizarRepuesto(index, 'cantidad', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <Label>Precio Unitario (€)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={repuesto.precioUnitario}
                                        onChange={(e) => actualizarRepuesto(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-sm text-gray-600">Subtotal: </span>
                                <span className="font-bold">{repuesto.subtotal.toFixed(2)} €</span>
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={agregarRepuesto}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Repuesto
                    </Button>
                </CardContent>
            </Card>

            {/* Mano de Obra */}
            <Card>
                <CardHeader>
                    <CardTitle>Mano de Obra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {manoObra.map((actividad, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">Actividad #{index + 1}</h4>
                                {manoObra.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => eliminarManoObra(index)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-3">
                                    <Label>Descripción</Label>
                                    <Input
                                        value={actividad.descripcion}
                                        onChange={(e) => actualizarManoObra(index, 'descripcion', e.target.value)}
                                        placeholder="Descripción del trabajo"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Horas Estimadas</Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={actividad.horasEstimadas}
                                        onChange={(e) => actualizarManoObra(index, 'horasEstimadas', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <Label>Precio/Hora (€)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={actividad.precioHora}
                                        onChange={(e) => actualizarManoObra(index, 'precioHora', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <div className="w-full">
                                        <Label>Subtotal</Label>
                                        <div className="font-bold text-lg">{actividad.subtotal.toFixed(2)} €</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={agregarManoObra}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Actividad
                    </Button>
                </CardContent>
            </Card>

            {/* Costos Adicionales */}
            <Card>
                <CardHeader>
                    <CardTitle>Costos Adicionales (Opcional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {costosAdicionales.map((costo, index) => (
                        <div key={index} className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    value={costo.descripcion}
                                    onChange={(e) => actualizarCostoAdicional(index, 'descripcion', e.target.value)}
                                    placeholder="Descripción del costo"
                                />
                            </div>
                            <div className="w-32">
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={costo.monto}
                                    onChange={(e) => actualizarCostoAdicional(index, 'monto', parseFloat(e.target.value) || 0)}
                                    placeholder="Monto (€)"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => eliminarCostoAdicional(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={agregarCostoAdicional}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Costo Adicional
                    </Button>
                </CardContent>
            </Card>

            {/* Resumen de Costos */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle>Resumen de Costos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>Costo Repuestos:</span>
                        <span className="font-medium">{totales.costoRepuestos.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Costo Mano de Obra:</span>
                        <span className="font-medium">{totales.costoManoObra.toFixed(2)} €</span>
                    </div>
                    {totales.costosAdicionales && totales.costosAdicionales.length > 0 && (
                        <div className="flex justify-between">
                            <span>Costos Adicionales:</span>
                            <span className="font-medium">
                                {totales.costosAdicionales.reduce((sum, c) => sum + c.monto, 0).toFixed(2)} €
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                        <span>Subtotal:</span>
                        <span className="font-medium">{totales.subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                        <span>IVA (21%):</span>
                        <span className="font-medium">{totales.iva.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-blue-300 pt-2 text-lg font-bold">
                        <span>TOTAL:</span>
                        <span className="text-blue-600">{totales.total.toFixed(2)} €</span>
                    </div>
                </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card>
                <CardHeader>
                    <CardTitle>Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="tiempo">Tiempo Estimado (horas)</Label>
                            <Input
                                id="tiempo"
                                type="number"
                                min="0"
                                step="0.5"
                                value={tiempoEstimado}
                                onChange={(e) => setTiempoEstimado(parseFloat(e.target.value) || 0)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="garantiaRep">Garantía Repuestos (meses)</Label>
                            <Input
                                id="garantiaRep"
                                type="number"
                                min="0"
                                value={garantiaRepuestos}
                                onChange={(e) => setGarantiaRepuestos(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="garantiaMO">Garantía Mano Obra (meses)</Label>
                            <Input
                                id="garantiaMO"
                                type="number"
                                min="0"
                                value={garantiaManoObra}
                                onChange={(e) => setGarantiaManoObra(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="validez">Validez del Presupuesto (días)</Label>
                        <Input
                            id="validez"
                            type="number"
                            min="1"
                            value={validezPresupuesto}
                            onChange={(e) => setValidezPresupuesto(parseInt(e.target.value) || 15)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="recomendaciones">Recomendaciones Adicionales</Label>
                        <Textarea
                            id="recomendaciones"
                            value={recomendaciones}
                            onChange={(e) => setRecomendaciones(e.target.value)}
                            placeholder="Recomendaciones o notas adicionales para el cliente"
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">
                    Generar Diagnóstico y Presupuesto
                </Button>
            </div>
        </form>
    )
}
