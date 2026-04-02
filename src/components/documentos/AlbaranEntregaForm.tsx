'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, CalendarIcon, CheckCircle2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { MetadatosAlbaranEntrega } from '@/types/documentos'

interface AlbaranEntregaFormProps {
    ticketId?: string
    initialValues?: MetadatosAlbaranEntrega
    readOnly?: boolean
    onSubmit: (metadatos: MetadatosAlbaranEntrega) => void
    onCancel: () => void
    isSubmitting?: boolean
}

export function AlbaranEntregaForm({
    ticketId = '',
    initialValues,
    readOnly = false,
    onSubmit,
    onCancel,
    isSubmitting = false
}: AlbaranEntregaFormProps) {
    const [loading, setLoading] = useState(false)
    const [autoLoadError, setAutoLoadError] = useState<string | null>(null)

    // Datos del Equipo
    const [equipo, setEquipo] = useState({
        tipo: initialValues?.equipoEntregado?.tipo || '',
        marca: initialValues?.equipoEntregado?.marca || '',
        modelo: initialValues?.equipoEntregado?.modelo || '',
        numeroSerie: initialValues?.equipoEntregado?.numeroSerie || '',
    })

    // Reparaciones y Repuestos
    const [reparaciones, setReparaciones] = useState<string[]>(initialValues?.reparacionesRealizadas || [''])
    const [repuestos, setRepuestos] = useState(initialValues?.repuestosUtilizados || [])

    // Garantía
    const [garantia, setGarantia] = useState({
        repuestos: initialValues?.garantiaProporcionada?.repuestos || 6,
        manoObra: initialValues?.garantiaProporcionada?.manoObra || 6,
        condiciones: initialValues?.garantiaProporcionada?.condiciones || 'La garantía cubre defectos de los componentes sustituidos y de la mano de obra realizada.',
    })

    // Estado Entrega
    const [verificado, setVerificado] = useState<boolean>(initialValues?.estadoEntrega?.funcionamientoVerificado ?? true)
    const [pruebas, setPruebas] = useState<string[]>(initialValues?.estadoEntrega?.pruebasRealizadas || ['Encendido correcto', 'Carga de batería', 'Prueba de pantalla'])
    const [observaciones, setObservaciones] = useState(initialValues?.estadoEntrega?.observaciones || '')

    // Pago
    const [pago, setPago] = useState({
        metodo: initialValues?.pagoRecibido?.metodo || 'tarjeta',
        monto: initialValues?.pagoRecibido?.monto || 0,
        referencia: initialValues?.pagoRecibido?.referencia || '',
    })

    // Entrega
    const [fechaEntrega, setFechaEntrega] = useState<Date>(initialValues?.fechaEntrega ? new Date(initialValues.fechaEntrega) : new Date())
    const [clienteRecibe, setClienteRecibe] = useState({
        nombre: initialValues?.clienteRecibe?.nombre || '',
        identificacion: initialValues?.clienteRecibe?.identificacion || '',
    })

    // Efecto para cargar datos automáticamente desde el ticket
    useEffect(() => {
        if (ticketId && !initialValues) {
            cargarDatosDesdeTicket()
        }
    }, [ticketId])

    const cargarDatosDesdeTicket = async () => {
        setLoading(true)
        setAutoLoadError(null)

        try {
            console.log('[AlbaranForm] 🔄 Iniciando carga de datos para ticketId:', ticketId)

            // 1. Obtener información del ticket
            console.log('[AlbaranForm] 📡 Solicitando ticket...')
            const ticketRes = await fetch(`/api/sat/tickets/${ticketId}`)
            console.log('[AlbaranForm] 📡 Respuesta ticket status:', ticketRes.status)

            if (!ticketRes.ok) {
                const errorText = await ticketRes.text()
                console.error('[AlbaranForm] ❌ Error al cargar ticket:', errorText)
                throw new Error(`No se pudo cargar el ticket (${ticketRes.status})`)
            }

            const ticketData = await ticketRes.json()
            // La API devuelve { success: true, ticket: {...} }
            const ticket = ticketData.ticket || ticketData.data || ticketData
            console.log('[AlbaranForm] ✅ Ticket cargado:', ticket?.numeroTicket || ticket?.id)
            console.log('[AlbaranForm] 📊 Estructura del ticket:', Object.keys(ticket || {}))

            if (!ticket || !ticket.id) {
                console.error('[AlbaranForm] ❌ Ticket inválido:', ticketData)
                throw new Error('El ticket no contiene datos válidos')
            }

            // 2. Obtener documentos asociados al ticket
            console.log('[AlbaranForm] 📡 Solicitando documentos del ticket...')
            const docsRes = await fetch(`/api/admin/documentos?ticketId=${ticketId}`)
            console.log('[AlbaranForm] 📡 Respuesta documentos status:', docsRes.status)

            if (!docsRes.ok) {
                const errorText = await docsRes.text()
                console.error('[AlbaranForm] ❌ Error al cargar documentos:', errorText)
                throw new Error(`No se pudieron cargar los documentos (${docsRes.status})`)
            }

            const docsData = await docsRes.json()
            const documentos = docsData.data?.documentos || []

            console.log('[AlbaranForm] 📄 Documentos encontrados:', documentos.length)
            console.log('[AlbaranForm] 📋 Tipos de documentos:', documentos.map((d: any) => `${d.tipo} (${d.numeroDocumento})`).join(', '))

            // 3. Extraer datos del equipo desde Orden de Servicio
            const ordenServicio = documentos.find((d: any) =>
                d.tipo === 'orden_servicio' || d.tipo === 'ORDEN_SERVICIO'
            )

            if (ordenServicio?.metadatos) {
                const metaOrden = typeof ordenServicio.metadatos === 'string'
                    ? JSON.parse(ordenServicio.metadatos)
                    : ordenServicio.metadatos

                setEquipo({
                    tipo: metaOrden.equipo?.tipoEquipo || ticket.producto?.nombre || '',
                    marca: metaOrden.equipo?.marca || ticket.producto?.marca || '',
                    modelo: metaOrden.equipo?.modelo || ticket.producto?.modelo || '',
                    numeroSerie: metaOrden.equipo?.numeroSerie || metaOrden.equipo?.imei || '',
                })

                // Auto-rellenar datos del cliente
                if (metaOrden.cliente) {
                    setClienteRecibe({
                        nombre: metaOrden.cliente.nombreCompleto || `${ticket.usuario?.nombre || ''} ${ticket.usuario?.apellidos || ''}`.trim(),
                        identificacion: metaOrden.cliente.identificacion || metaOrden.cliente.dni || '',
                    })
                }
            } else if (ticket.producto) {
                // Fallback: usar datos del producto del ticket
                console.log('[AlbaranForm] 🔄 Usando datos del producto del ticket')
                setEquipo({
                    tipo: ticket.producto.nombre || '',
                    marca: ticket.producto.marca || '',
                    modelo: ticket.producto.modelo || '',
                    numeroSerie: ticket.numeroSerieProducto || '',
                })
            } else {
                console.warn('[AlbaranForm] ⚠️ No se encontraron datos del equipo')
            }

            // 4. Extraer reparaciones y repuestos desde Diagnóstico y Presupuesto
            const diagnostico = documentos.find((d: any) =>
                d.tipo === 'diagnostico_presupuesto' || d.tipo === 'DIAGNOSTICO_PRESUPUESTO'
            )

            if (diagnostico?.metadatos) {
                const metaDiag = typeof diagnostico.metadatos === 'string'
                    ? JSON.parse(diagnostico.metadatos)
                    : diagnostico.metadatos

                // Extraer trabajos necesarios como reparaciones (usando reparacionPropuesta según tipo MetadatosDiagnosticoPresupuesto)
                const trabajos: string[] = []

                // Intento 1: reparacionPropuesta (Estructura correcta según tipos/documentos.ts)
                if (metaDiag.reparacionPropuesta) {
                    if (metaDiag.reparacionPropuesta.descripcionTrabajos) {
                        trabajos.push(metaDiag.reparacionPropuesta.descripcionTrabajos)
                    }
                    if (metaDiag.reparacionPropuesta.manoObra?.length > 0) {
                        metaDiag.reparacionPropuesta.manoObra.forEach((mo: any) => {
                            if (mo.descripcion) trabajos.push(mo.descripcion)
                        })
                    }
                }
                // Intento 2: fallback a estructura antigua solo por si acaso (trabajosNecesarios)
                else if (metaDiag.trabajosNecesarios) {
                    if (metaDiag.trabajosNecesarios.descripcionDetallada) {
                        trabajos.push(metaDiag.trabajosNecesarios.descripcionDetallada)
                    }
                    if (metaDiag.trabajosNecesarios.manoObra?.length > 0) {
                        metaDiag.trabajosNecesarios.manoObra.forEach((mo: any) => {
                            if (mo.descripcion) trabajos.push(mo.descripcion)
                        })
                    }
                }

                if (trabajos.length > 0) {
                    setReparaciones(trabajos)
                }

                // Extraer repuestos
                let repuestosData: any[] = []
                if (metaDiag.reparacionPropuesta?.repuestosNecesarios?.length > 0) {
                    repuestosData = metaDiag.reparacionPropuesta.repuestosNecesarios
                } else if (metaDiag.trabajosNecesarios?.repuestos?.length > 0) {
                    repuestosData = metaDiag.trabajosNecesarios.repuestos
                }

                if (repuestosData.length > 0) {
                    const repuestosFormateados = repuestosData.map((r: any) => ({
                        codigo: r.codigo || '',
                        descripcion: r.descripcion || '',
                        cantidad: r.cantidad || 1,
                        garantiaMeses: 6
                    }))
                    setRepuestos(repuestosFormateados)
                }

                // Calcular monto total desde el presupuesto
                if (metaDiag.costos?.total) {
                    setPago(prev => ({
                        ...prev,
                        monto: metaDiag.costos.total
                    }))
                }
            }

            // 5. Buscar extensiones de presupuesto
            const extensiones = documentos.filter((d: any) =>
                d.tipo === 'extension_presupuesto' || d.tipo === 'EXTENSION_PRESUPUESTO'
            )

            extensiones.forEach((ext: any) => {
                if (ext.metadatos) {
                    const metaExt = typeof ext.metadatos === 'string'
                        ? JSON.parse(ext.metadatos)
                        : ext.metadatos

                    // Agregar trabajos adicionales
                    if (metaExt.nuevosTrabajos?.descripcionDetallada) {
                        setReparaciones(prev => [...prev, metaExt.nuevosTrabajos.descripcionDetallada])
                    }
                    if (metaExt.nuevosTrabajos?.manoObraExtra?.length > 0) {
                        metaExt.nuevosTrabajos.manoObraExtra.forEach((mo: any) => {
                            if (mo.descripcion) {
                                setReparaciones(prev => [...prev, mo.descripcion])
                            }
                        })
                    }

                    // Agregar repuestos adicionales
                    if (metaExt.nuevosTrabajos?.repuestosAdicionales?.length > 0) {
                        const repuestosAdicionales = metaExt.nuevosTrabajos.repuestosAdicionales.map((r: any) => ({
                            codigo: r.codigo || '',
                            descripcion: r.descripcion || '',
                            cantidad: r.cantidad || 1,
                            garantiaMeses: 6
                        }))
                        setRepuestos(prev => [...prev, ...repuestosAdicionales])
                    }

                    // Sumar costo adicional
                    if (metaExt.costoAdicional?.total) {
                        setPago(prev => ({
                            ...prev,
                            monto: prev.monto + metaExt.costoAdicional.total
                        }))
                    }
                }
            })

            // 6. Auto-rellenar nombre del cliente si no se hizo antes
            if (!clienteRecibe.nombre && ticket.usuario) {
                console.log('[AlbaranForm] 👤 Auto-rellenando datos del cliente')
                setClienteRecibe(prev => ({
                    ...prev,
                    nombre: `${ticket.usuario.nombre} ${ticket.usuario.apellidos || ''}`.trim(),
                    identificacion: ticket.usuario.dni || prev.identificacion || ''
                }))
            } else if (!clienteRecibe.identificacion && ticket.usuario?.dni) {
                console.log('[AlbaranForm] 👤 Recuperando DNI del perfil de usuario')
                setClienteRecibe(prev => ({
                    ...prev,
                    identificacion: ticket.usuario.dni
                }))
            } else if (!clienteRecibe.nombre) {
                console.warn('[AlbaranForm] ⚠️ No se encontraron datos del cliente en el ticket')
            }

            console.log('[AlbaranForm] ✅ Datos cargados automáticamente exitosamente')

        } catch (error) {
            console.error('[AlbaranForm] ❌ Error cargando datos:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            setAutoLoadError(`Error: ${errorMessage}. Por favor, complete manualmente.`)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const metadatos: MetadatosAlbaranEntrega = {
            ticketId,
            numeroTicket: initialValues?.numeroTicket || '', // Se suele asignar en backend o por prop
            equipoEntregado: equipo,
            reparacionesRealizadas: reparaciones.filter(r => r.trim() !== ''),
            repuestosUtilizados: repuestos,
            garantiaProporcionada: garantia,
            estadoEntrega: {
                funcionamientoVerificado: verificado,
                pruebasRealizadas: pruebas,
                observaciones
            },
            pagoRecibido: pago,
            fechaEntrega,
            clienteRecibe
        }

        onSubmit(metadatos)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Albarán de Entrega / Certificado de Reparación</CardTitle>
                    <CardDescription>Documento final de entrega del equipo reparado al cliente</CardDescription>
                    {loading && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Cargando datos del ticket...</span>
                        </div>
                    )}
                    {autoLoadError && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                            ⚠️ {autoLoadError}
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Información del Equipo */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Datos del Equipo Entregado</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Input value={equipo.tipo} onChange={e => setEquipo({ ...equipo, tipo: e.target.value })} disabled={readOnly || loading} placeholder="Smartphone, Laptop..." required />
                            </div>
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Input value={equipo.marca} onChange={e => setEquipo({ ...equipo, marca: e.target.value })} disabled={readOnly || loading} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Modelo</Label>
                                <Input value={equipo.modelo} onChange={e => setEquipo({ ...equipo, modelo: e.target.value })} disabled={readOnly || loading} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Nº Serie / IMEI</Label>
                                <Input value={equipo.numeroSerie} onChange={e => setEquipo({ ...equipo, numeroSerie: e.target.value })} disabled={readOnly || loading} />
                            </div>
                        </div>
                    </div>

                    <hr />

                    {/* Trabajo Realizado */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Reparaciones Realizadas</h3>
                            {!readOnly && !loading && (
                                <Button type="button" variant="outline" size="sm" onClick={() => setReparaciones([...reparaciones, ''])}>
                                    <Plus className="h-4 w-4 mr-1" /> Añadir
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {reparaciones.map((rep, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        value={rep}
                                        onChange={e => {
                                            const newR = [...reparaciones]
                                            newR[idx] = e.target.value
                                            setReparaciones(newR)
                                        }}
                                        disabled={readOnly || loading}
                                        placeholder="Descripción del trabajo..."
                                    />
                                    {!readOnly && !loading && idx > 0 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => setReparaciones(reparaciones.filter((_, i) => i !== idx))}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Repuestos */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Repuestos Sustituidos</h3>
                            {!readOnly && !loading && (
                                <Button type="button" variant="outline" size="sm" onClick={() => setRepuestos([...repuestos, { codigo: '', descripcion: '', cantidad: 1, garantiaMeses: 6 }])}>
                                    <Plus className="h-4 w-4 mr-1" /> Añadir Repuesto
                                </Button>
                            )}
                        </div>
                        {repuestos.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Código</th>
                                            <th className="px-4 py-2 text-left">Descripción</th>
                                            <th className="px-4 py-2 text-center w-20">Cant.</th>
                                            <th className="px-4 py-2 text-center w-32">Garantía (meses)</th>
                                            {!readOnly && !loading && <th className="px-4 py-2 w-10"></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {repuestos.map((r, idx) => (
                                            <tr key={idx} className="border-b last:border-0">
                                                <td className="p-2"><Input className="h-8" value={r.codigo} onChange={e => {
                                                    const n = [...repuestos]; n[idx].codigo = e.target.value; setRepuestos(n)
                                                }} disabled={readOnly || loading} /></td>
                                                <td className="p-2"><Input className="h-8" value={r.descripcion} onChange={e => {
                                                    const n = [...repuestos]; n[idx].descripcion = e.target.value; setRepuestos(n)
                                                }} disabled={readOnly || loading} /></td>
                                                <td className="p-2"><Input type="number" className="h-8 text-center" value={r.cantidad} onChange={e => {
                                                    const n = [...repuestos]; n[idx].cantidad = parseInt(e.target.value); setRepuestos(n)
                                                }} disabled={readOnly || loading} /></td>
                                                <td className="p-2"><Input type="number" className="h-8 text-center" value={r.garantiaMeses} onChange={e => {
                                                    const n = [...repuestos]; n[idx].garantiaMeses = parseInt(e.target.value); setRepuestos(n)
                                                }} disabled={readOnly || loading} /></td>
                                                {!readOnly && !loading && (
                                                    <td className="p-2">
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRepuestos(repuestos.filter((_, i) => i !== idx))}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg">No se han registrado repuestos específicos.</p>
                        )}
                    </div>

                    <hr />

                    {/* Estado de Entrega */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Verificación de Calidad</h3>
                            <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-100">
                                <Checkbox id="verificado" checked={verificado} onCheckedChange={c => setVerificado(!!c)} disabled={readOnly || loading} />
                                <Label htmlFor="verificado" className="text-green-800 font-medium">Funcionamiento Correcto Verificado</Label>
                            </div>
                            <div className="space-y-2">
                                <Label>Observaciones de Entrega</Label>
                                <Textarea
                                    placeholder="Detalles sobre el estado final, recomendaciones al cliente..."
                                    value={observaciones}
                                    onChange={e => setObservaciones(e.target.value)}
                                    disabled={readOnly || loading}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Garantía Otorgada</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Meses Repuestos</Label>
                                    <Input type="number" value={garantia.repuestos} onChange={e => setGarantia({ ...garantia, repuestos: parseInt(e.target.value) })} disabled={readOnly || loading} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Meses Mano Obra</Label>
                                    <Input type="number" value={garantia.manoObra} onChange={e => setGarantia({ ...garantia, manoObra: parseInt(e.target.value) })} disabled={readOnly || loading} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Condiciones Especiales</Label>
                                <Textarea value={garantia.condiciones} onChange={e => setGarantia({ ...garantia, condiciones: e.target.value })} disabled={readOnly || loading} rows={2} />
                            </div>
                        </div>
                    </div>

                    <hr />

                    {/* Pago y Recepción */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Liquidación y Pago</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Método</Label>
                                    <Select value={pago.metodo} onValueChange={(v: any) => setPago({ ...pago, metodo: v })} disabled={readOnly || loading}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="efectivo">Efectivo</SelectItem>
                                            <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                            <SelectItem value="transferencia">Transferencia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Monto Total (€)</Label>
                                    <Input type="number" step="0.01" value={pago.monto} onChange={e => setPago({ ...pago, monto: parseFloat(e.target.value) })} disabled={readOnly || loading} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Referencia de Pago (Opcional)</Label>
                                <Input value={pago.referencia} onChange={e => setPago({ ...pago, referencia: e.target.value })} disabled={readOnly || loading} placeholder="Nº transacción, recibo..." />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Recepción Cliente</h3>
                            <div className="space-y-2">
                                <Label>Nombre de quien recibe</Label>
                                <Input value={clienteRecibe.nombre} onChange={e => setClienteRecibe({ ...clienteRecibe, nombre: e.target.value })} disabled={readOnly || loading} required />
                            </div>
                            <div className="space-y-2">
                                <Label>DNI / Identificación</Label>
                                <Input value={clienteRecibe.identificacion} onChange={e => setClienteRecibe({ ...clienteRecibe, identificacion: e.target.value })} disabled={readOnly || loading} required />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
                {!readOnly && (
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting || loading}>
                        {isSubmitting ? 'Guardando...' : 'Completar Entrega'}
                    </Button>
                )}
            </div>
        </form>
    )
}
