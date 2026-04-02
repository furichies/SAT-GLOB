'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { MetadatosAceptacionPresupuesto, MetadatosRechazoPresupuesto, MetadatosDiagnosticoPresupuesto } from '@/types/documentos'
import { PresupuestoSelector } from '@/components/common/PresupuestoSelector'

// ============================================================================
// FORMULARIO DE ACEPTACIÓN
// ============================================================================

interface AceptacionPresupuestoFormProps {
    presupuestoId?: string
    initialValues?: MetadatosAceptacionPresupuesto
    readOnly?: boolean
    onSubmit: (metadatos: MetadatosAceptacionPresupuesto) => void
    onCancel: () => void
    isSubmitting?: boolean
}

export function AceptacionPresupuestoForm({
    presupuestoId = '',
    initialValues,
    readOnly = false,
    onSubmit,
    onCancel,
    isSubmitting = false
}: AceptacionPresupuestoFormProps) {
    // Estado
    const [presupuestoSeleccionadoId, setPresupuestoSeleccionadoId] = useState(presupuestoId || '')
    const [numeroPresupuesto, setNumeroPresupuesto] = useState(initialValues?.numeroPresupuesto || '')
    const [fechaAceptacion, setFechaAceptacion] = useState<Date>(initialValues?.fechaAceptacion ? new Date(initialValues.fechaAceptacion) : new Date())
    const [formaAprobacion, setFormaAprobacion] = useState<'firma_fisica' | 'email' | 'sms' | 'portal_web'>(initialValues?.formaAprobacion || 'firma_fisica')
    const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>(initialValues?.metodoPagoAcordado || 'efectivo')

    // Snapshot del presupuesto (para guardarlo en el documento de aceptación)
    const [presupuestoSnapshot, setPresupuestoSnapshot] = useState<any>(initialValues?.presupuestoSnapshot || null)
    const [loadingPresupuesto, setLoadingPresupuesto] = useState(false)

    // Autorizaciones
    const [authReparacion, setAuthReparacion] = useState<boolean>(initialValues?.autorizaciones?.procederReparacion ?? true)
    const [authRepuestos, setAuthRepuestos] = useState<boolean>(initialValues?.autorizaciones?.adquirirRepuestos ?? true)
    const [limiteMonto, setLimiteMonto] = useState(initialValues?.autorizaciones?.trabajosAdicionalesHasta?.toString() || '')

    // Contacto
    const [telefono, setTelefono] = useState(initialValues?.datosContactoConfirmados.telefono || '')
    const [email, setEmail] = useState(initialValues?.datosContactoConfirmados.email || '')

    // Fecha límite
    const [fechaLimite, setFechaLimite] = useState<Date | undefined>(initialValues?.fechaLimiteReparacion ? new Date(initialValues.fechaLimiteReparacion) : undefined)

    // Efecto para auto-rellenar datos cuando se selecciona un presupuesto
    const handlePresupuestoChange = async (presupuesto: any) => {
        setPresupuestoSeleccionadoId(presupuesto.id)
        setNumeroPresupuesto(presupuesto.numeroDocumento)

        // Auto-rellenar teléfono y email del cliente
        if (presupuesto.cliente) {
            setTelefono(presupuesto.cliente.telefono || '')
            setEmail(presupuesto.cliente.email || '')
        }

        // Cargar detalles completos del presupuesto para el snapshot
        setLoadingPresupuesto(true)
        try {
            const res = await fetch(`/api/admin/documentos/${presupuesto.id}`)
            if (res.ok) {
                const data = await res.json()
                if (data.success && data.data && data.data.metadatos) {
                    const meta = JSON.parse(data.data.metadatos) as MetadatosDiagnosticoPresupuesto
                    // Crear snapshot con lo relevante
                    const snapshot = {
                        repuestos: meta.reparacionPropuesta.repuestosNecesarios,
                        manoObra: meta.reparacionPropuesta.manoObra,
                        costos: {
                            subtotal: meta.costos.subtotal,
                            iva: meta.costos.iva,
                            total: meta.costos.total
                        }
                    }
                    setPresupuestoSnapshot(snapshot)
                }
            }
        } catch (error) {
            console.error("Error cargando detalles del presupuesto:", error)
        } finally {
            setLoadingPresupuesto(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const metadatos: MetadatosAceptacionPresupuesto = {
            presupuestoId: presupuestoSeleccionadoId,
            numeroPresupuesto,
            fechaAceptacion,
            formaAprobacion,
            metodoPagoAcordado: metodoPago,
            autorizaciones: {
                procederReparacion: authReparacion,
                adquirirRepuestos: authRepuestos,
                trabajosAdicionalesHasta: limiteMonto ? parseFloat(limiteMonto) : undefined
            },
            datosContactoConfirmados: {
                telefono,
                email
            },
            fechaLimiteReparacion: fechaLimite,
            presupuestoSnapshot
        }

        onSubmit(metadatos)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Aceptación de Presupuesto</CardTitle>
                    <CardDescription>Confirmación del cliente para proceder con la reparación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Presupuesto a Aceptar</Label>
                            <PresupuestoSelector
                                value={presupuestoSeleccionadoId}
                                onChange={handlePresupuestoChange}
                                disabled={readOnly}
                            />
                            {numeroPresupuesto && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Número: {numeroPresupuesto}
                                </p>
                            )}

                            {/* Resumen del presupuesto cargado */}
                            {loadingPresupuesto && <p className="text-xs text-blue-500">Cargando detalles...</p>}
                            {presupuestoSnapshot && !loadingPresupuesto && (
                                <div className="mt-2 p-2 bg-slate-50 border rounded text-xs text-slate-700">
                                    <p className="font-semibold">Resumen del Presupuesto:</p>
                                    <div className="flex justify-between mt-1">
                                        <span>Repuestos ({presupuestoSnapshot.repuestos?.length || 0}):</span>
                                        <span>{Number(presupuestoSnapshot.repuestos?.reduce((a: any, b: any) => a + b.subtotal, 0) || 0).toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Mano de Obra ({presupuestoSnapshot.manoObra?.length || 0}):</span>
                                        <span>{Number(presupuestoSnapshot.manoObra?.reduce((a: any, b: any) => a + b.subtotal, 0) || 0).toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between font-bold border-t border-slate-200 mt-1 pt-1">
                                        <span>Total:</span>
                                        <span>{Number(presupuestoSnapshot.costos?.total || 0).toFixed(2)}€</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de Aceptación</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !fechaAceptacion && "text-muted-foreground"
                                        )}
                                        disabled={readOnly}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {fechaAceptacion ? format(fechaAceptacion, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={fechaAceptacion}
                                        onSelect={(date) => date && setFechaAceptacion(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Forma de Aprobación</Label>
                            <Select
                                value={formaAprobacion}
                                onValueChange={(v: any) => setFormaAprobacion(v)}
                                disabled={readOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="firma_fisica">Firma Física</SelectItem>
                                    <SelectItem value="email">Correo Electrónico</SelectItem>
                                    <SelectItem value="sms">SMS / WhatsApp</SelectItem>
                                    <SelectItem value="portal_web">Portal Web</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Método de Pago Acordado</Label>
                            <Select
                                value={metodoPago}
                                onValueChange={(v: any) => setMetodoPago(v)}
                                disabled={readOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="efectivo">Efectivo</SelectItem>
                                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                    <SelectItem value="transferencia">Transferencia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border rounded-md p-4 space-y-4 bg-gray-50">
                        <h4 className="font-medium text-sm">Autorizaciones Expresas</h4>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="authReparacion"
                                checked={authReparacion}
                                onCheckedChange={(c) => !readOnly && setAuthReparacion(!!c)}
                                disabled={readOnly}
                            />
                            <Label htmlFor="authReparacion">Autorizo a proceder con la reparación según presupuesto</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="authRepuestos"
                                checked={authRepuestos}
                                onCheckedChange={(c) => !readOnly && setAuthRepuestos(!!c)}
                                disabled={readOnly}
                            />
                            <Label htmlFor="authRepuestos">Autorizo la adquisición de repuestos necesarios</Label>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label htmlFor="limiteMonto">Autorización Trabajos Adicionales (Opcional)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Hasta:</span>
                                <Input
                                    id="limiteMonto"
                                    type="number"
                                    value={limiteMonto}
                                    onChange={(e) => setLimiteMonto(e.target.value)}
                                    disabled={readOnly}
                                    placeholder="0.00"
                                    className="w-32"
                                />
                                <span className="text-sm text-gray-500">€ sin consultar nuevamente</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Teléfono de Contacto (Confirmado)</Label>
                            <Input
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                disabled={readOnly}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email (Para notificaciones)</Label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={readOnly}
                                type="email"
                                required
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
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Aceptación'}
                    </Button>
                )}
            </div>
        </form>
    )
}


// ============================================================================
// FORMULARIO DE RECHAZO
// ============================================================================

interface RechazoPresupuestoFormProps {
    presupuestoId?: string
    initialValues?: MetadatosRechazoPresupuesto
    readOnly?: boolean
    onSubmit: (metadatos: MetadatosRechazoPresupuesto) => void
    onCancel: () => void
    isSubmitting?: boolean
}

export function RechazoPresupuestoForm({
    presupuestoId = '',
    initialValues,
    readOnly = false,
    onSubmit,
    onCancel,
    isSubmitting = false
}: RechazoPresupuestoFormProps) {
    const [presupuestoSeleccionadoId, setPresupuestoSeleccionadoId] = useState(presupuestoId || '')
    const [numeroPresupuesto, setNumeroPresupuesto] = useState(initialValues?.numeroPresupuesto || '')
    const [fechaRechazo, setFechaRechazo] = useState<Date>(initialValues?.fechaRechazo ? new Date(initialValues.fechaRechazo) : new Date())
    const [motivo, setMotivo] = useState<'costo_elevado' | 'tiempo_reparacion' | 'decidio_no_reparar' | 'otra_empresa' | 'otro'>(initialValues?.motivoRechazo || 'costo_elevado')
    const [motivoDetalle, setMotivoDetalle] = useState(initialValues?.motivoDetalle || '')
    const [formaRechazo, setFormaRechazo] = useState<'firma_fisica' | 'email' | 'sms' | 'portal_web'>(initialValues?.formaRechazo || 'firma_fisica')

    // Instrucciones
    const [retiroEquipo, setRetiroEquipo] = useState<boolean>(initialValues?.instrucciones?.retiroEquipo ?? true)
    const [fechaLimiteRetiro, setFechaLimiteRetiro] = useState<Date | undefined>(initialValues?.instrucciones.fechaLimiteRetiro ? new Date(initialValues.instrucciones.fechaLimiteRetiro) : undefined)
    const [costoDiagnostico, setCostoDiagnostico] = useState(initialValues?.instrucciones.costoDiagnostico?.toString() || '')

    const [estadoEquipo, setEstadoEquipo] = useState(initialValues?.estadoEquipo || 'Devuelto en el mismo estado en que ingresó')

    // Handler para cambio de presupuesto
    const handlePresupuestoChange = (presupuesto: any) => {
        setPresupuestoSeleccionadoId(presupuesto.id)
        setNumeroPresupuesto(presupuesto.numeroDocumento)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const metadatos: MetadatosRechazoPresupuesto = {
            presupuestoId,
            numeroPresupuesto,
            fechaRechazo,
            motivoRechazo: motivo,
            motivoDetalle,
            formaRechazo,
            instrucciones: {
                retiroEquipo,
                fechaLimiteRetiro,
                costoDiagnostico: costoDiagnostico ? parseFloat(costoDiagnostico) : 0
            },
            estadoEquipo
        }

        onSubmit(metadatos)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-red-200 bg-red-50/10">
                <CardHeader>
                    <CardTitle className="text-red-900">Rechazo de Presupuesto</CardTitle>
                    <CardDescription>Documentación de la no aceptación de la propuesta de reparación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Presupuesto a Rechazar</Label>
                            <PresupuestoSelector
                                value={presupuestoSeleccionadoId}
                                onChange={handlePresupuestoChange}
                                disabled={readOnly}
                            />
                            {numeroPresupuesto && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Número: {numeroPresupuesto}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de Rechazo</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !fechaRechazo && "text-muted-foreground"
                                        )}
                                        disabled={readOnly}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {fechaRechazo ? format(fechaRechazo, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={fechaRechazo}
                                        onSelect={(date) => date && setFechaRechazo(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Motivo del Rechazo</Label>
                        <Select
                            value={motivo}
                            onValueChange={(v: any) => setMotivo(v)}
                            disabled={readOnly}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="costo_elevado">Costo Muy Elevado</SelectItem>
                                <SelectItem value="tiempo_reparacion">Tiempo de Reparación Excesivo</SelectItem>
                                <SelectItem value="decidio_no_reparar">Decidió No Reparar (Inviable)</SelectItem>
                                <SelectItem value="otra_empresa">Otra Empresa / Servicio</SelectItem>
                                <SelectItem value="otro">Otro Motivo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Detalle del Motivo / Observaciones</Label>
                        <Textarea
                            value={motivoDetalle}
                            onChange={(e) => setMotivoDetalle(e.target.value)}
                            disabled={readOnly}
                            rows={3}
                        />
                    </div>

                    <div className="border rounded-md p-4 space-y-4 bg-white">
                        <h4 className="font-medium text-sm">Instrucciones de Devolución</h4>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="retiroEquipo"
                                checked={retiroEquipo}
                                onCheckedChange={(c) => !readOnly && setRetiroEquipo(!!c)}
                                disabled={readOnly}
                            />
                            <Label htmlFor="retiroEquipo">El cliente retirará el equipo personalmente</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha Límite para Retiro</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !fechaLimiteRetiro && "text-muted-foreground"
                                        )}
                                        disabled={readOnly}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {fechaLimiteRetiro ? format(fechaLimiteRetiro, "PPP", { locale: es }) : <span>Sin fecha límite</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={fechaLimiteRetiro}
                                        onSelect={(date) => date && setFechaLimiteRetiro(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Costo de Diagnóstico a Cobrar</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={costoDiagnostico}
                                    onChange={(e) => setCostoDiagnostico(e.target.value)}
                                    disabled={readOnly}
                                    className="w-32"
                                />
                                <span className="text-sm font-medium">€</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Estado del Equipo a la Devolución</Label>
                        <Input
                            value={estadoEquipo}
                            onChange={(e) => setEstadoEquipo(e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                {!readOnly && (
                    <Button type="submit" variant="destructive" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Confirmar Rechazo'}
                    </Button>
                )}
            </div>
        </form>
    )
}
