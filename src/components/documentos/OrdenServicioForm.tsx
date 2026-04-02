'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, X, Save } from 'lucide-react'
import type { MetadatosOrdenServicio } from '@/types/documentos'
import { UsuarioSelector } from '@/components/common/UsuarioSelector'
import { TicketSelector } from '@/components/tickets/TicketSelector'

interface OrdenServicioFormProps {
    initialValues?: MetadatosOrdenServicio
    readOnly?: boolean
    onSubmit: (metadatos: MetadatosOrdenServicio, ticketId?: string) => void
    onCancel: () => void
    isSubmitting?: boolean
    ticketIdProp?: string // Ticket TKT pasado desde props (ej: desde página de tickets)
}

export function OrdenServicioForm({
    initialValues,
    readOnly = false,
    onSubmit,
    onCancel,
    isSubmitting = false,
    ticketIdProp
}: OrdenServicioFormProps) {
    const defaultValues: MetadatosOrdenServicio = {
        cliente: {
            nombreCompleto: '',
            identificacion: '',
            telefono: '',
            correoElectronico: '',
            direccion: '',
        },
        equipo: {
            tipoEquipo: '',
            marca: '',
            modelo: '',
            numeroSerie: '',
            imei: '',
            color: '',
            caracteristicasFisicas: '',
            accesoriosEntregados: [],
        },
        problema: {
            sintomasReportados: '',
            frecuenciaFallo: '',
            condicionesOcurrencia: '',
        },
        estadoFisico: {
            golpes: false,
            rayones: false,
            danosVisibles: '',
            estadoPantalla: '',
            funcionalidadBotones: '',
        },
        observacionesTecnico: '',
        terminosAceptados: false,
    }

    const [ordenServicio, setOrdenServicio] = useState<MetadatosOrdenServicio>(initialValues || defaultValues)
    const [nuevoAccesorio, setNuevoAccesorio] = useState('')
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null)
    const [ticketTKTId, setTicketTKTId] = useState<string>(ticketIdProp || '')

    const handleAgregarAccesorio = () => {
        if (nuevoAccesorio.trim()) {
            setOrdenServicio({
                ...ordenServicio,
                equipo: {
                    ...ordenServicio.equipo,
                    accesoriosEntregados: [...ordenServicio.equipo.accesoriosEntregados, nuevoAccesorio.trim()],
                },
            })
            setNuevoAccesorio('')
        }
    }

    const handleEliminarAccesorio = (index: number) => {
        setOrdenServicio({
            ...ordenServicio,
            equipo: {
                ...ordenServicio.equipo,
                accesoriosEntregados: ordenServicio.equipo.accesoriosEntregados.filter((_, i) => i !== index),
            },
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(ordenServicio, ticketTKTId || undefined)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulario principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Vincular a Ticket TKT Existente (Opcional) */}
                    {!ticketIdProp && (
                        <Card className="border-blue-200 bg-blue-50/30">
                            <CardHeader>
                                <CardTitle className="text-base">Vincular a Ticket TKT Existente (Opcional)</CardTitle>
                                <CardDescription>
                                    Si deseas vincular esta orden a un ticket TKT existente, selecciónalo aquí.
                                    Si no seleccionas ninguno, se creará automáticamente un ticket SAT nuevo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TicketSelector
                                    value={ticketTKTId}
                                    onChange={setTicketTKTId}
                                    disabled={readOnly}
                                />
                                {ticketTKTId && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                                        <span className="font-medium">✓ Vinculado:</span> Este documento se asociará al ticket seleccionado.
                                    </div>
                                )}
                                {!ticketTKTId && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                                        <span className="font-medium">ℹ️ Info:</span> Sin ticket seleccionado, se creará un nuevo ticket SAT automáticamente.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {ticketIdProp && (
                        <Card className="border-green-200 bg-green-50/30">
                            <CardContent className="py-4">
                                <div className="flex items-center gap-2 text-sm text-green-800">
                                    <span className="font-medium">✓ Vinculado a Ticket:</span>
                                    <span className="font-mono font-bold">{ticketIdProp}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Datos del Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos del Cliente</CardTitle>
                            <CardDescription>
                                Selecciona un cliente existente o crea uno nuevo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Selector de Cliente Existente */}
                            <div className="space-y-2">
                                <Label htmlFor="clienteSelector">Seleccionar Cliente Existente</Label>
                                <UsuarioSelector
                                    value={usuarioSeleccionado?.id || ''}
                                    onChange={(usuario) => {
                                        setUsuarioSeleccionado(usuario)
                                        setOrdenServicio({
                                            ...ordenServicio,
                                            cliente: {
                                                nombreCompleto: `${usuario.nombre} ${usuario.apellidos || ''}`.trim(),
                                                identificacion: usuario.dni || '',
                                                telefono: usuario.telefono || '',
                                                correoElectronico: usuario.email,
                                                direccion: usuario.direccion || '',
                                            }
                                        })
                                    }}
                                    filtroRol="cliente"
                                    placeholder="Buscar cliente por nombre, email o código postal..."
                                    permitirCrear={true}
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-muted-foreground">
                                        o editar manualmente
                                    </span>
                                </div>
                            </div>

                            {/* Campos manuales (se rellenan automáticamente) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
                                    <Input
                                        id="nombreCompleto"
                                        required
                                        disabled={readOnly}
                                        value={ordenServicio.cliente.nombreCompleto}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                cliente: { ...ordenServicio.cliente, nombreCompleto: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="identificacion">DNI/RUC *</Label>
                                    <Input
                                        id="identificacion"
                                        required
                                        disabled={readOnly}
                                        value={ordenServicio.cliente.identificacion}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                cliente: { ...ordenServicio.cliente, identificacion: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="telefono">Teléfono *</Label>
                                    <Input
                                        id="telefono"
                                        type="tel"
                                        required
                                        disabled={readOnly}
                                        value={ordenServicio.cliente.telefono}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                cliente: { ...ordenServicio.cliente, telefono: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label htmlFor="correoElectronico">Email *</Label>
                                    <Input
                                        id="correoElectronico"
                                        type="email"
                                        required
                                        disabled={readOnly}
                                        value={ordenServicio.cliente.correoElectronico}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                cliente: { ...ordenServicio.cliente, correoElectronico: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label htmlFor="direccion">Dirección</Label>
                                    <Input
                                        id="direccion"
                                        disabled={readOnly}
                                        value={ordenServicio.cliente.direccion}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                cliente: { ...ordenServicio.cliente, direccion: e.target.value },
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Datos del Equipo */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos del Equipo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="tipoEquipo">Tipo de Equipo *</Label>
                                    <Select
                                        disabled={readOnly}
                                        value={ordenServicio.equipo.tipoEquipo}
                                        onValueChange={(value) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                equipo: { ...ordenServicio.equipo, tipoEquipo: value },
                                            })
                                        }
                                    >
                                        <SelectTrigger id="tipoEquipo">
                                            <SelectValue placeholder="Selecciona..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="smartphone">Smartphone</SelectItem>
                                            <SelectItem value="tablet">Tablet</SelectItem>
                                            <SelectItem value="laptop">Laptop</SelectItem>
                                            <SelectItem value="desktop">PC de Escritorio</SelectItem>
                                            <SelectItem value="consola">Consola</SelectItem>
                                            <SelectItem value="otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="marca">Marca *</Label>
                                    <Input
                                        id="marca"
                                        required
                                        disabled={readOnly}
                                        value={ordenServicio.equipo.marca}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                equipo: { ...ordenServicio.equipo, marca: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="modelo">Modelo *</Label>
                                    <Input
                                        id="modelo"
                                        required
                                        disabled={readOnly}
                                        value={ordenServicio.equipo.modelo}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                equipo: { ...ordenServicio.equipo, modelo: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="numeroSerie">Número de Serie</Label>
                                    <Input
                                        id="numeroSerie"
                                        disabled={readOnly}
                                        value={ordenServicio.equipo.numeroSerie}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                equipo: { ...ordenServicio.equipo, numeroSerie: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="imei">IMEI</Label>
                                    <Input
                                        id="imei"
                                        disabled={readOnly}
                                        value={ordenServicio.equipo.imei}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                equipo: { ...ordenServicio.equipo, imei: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="color">Color</Label>
                                    <Input
                                        id="color"
                                        disabled={readOnly}
                                        value={ordenServicio.equipo.color}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                equipo: { ...ordenServicio.equipo, color: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label htmlFor="caracteristicasFisicas">Características Físicas</Label>
                                    <Textarea
                                        id="caracteristicasFisicas"
                                        disabled={readOnly}
                                        value={ordenServicio.equipo.caracteristicasFisicas}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                equipo: { ...ordenServicio.equipo, caracteristicasFisicas: e.target.value },
                                            })
                                        }
                                        placeholder="Ej: Pegatinas, fundas, etc."
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label>Accesorios Entregados</Label>
                                    {!readOnly && (
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                value={nuevoAccesorio}
                                                onChange={(e) => setNuevoAccesorio(e.target.value)}
                                                placeholder="Ej: Cargador, funda, cables..."
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        handleAgregarAccesorio()
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAgregarAccesorio}
                                                variant="outline"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    {ordenServicio.equipo.accesoriosEntregados.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {ordenServicio.equipo.accesoriosEntregados.map((accesorio, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                                >
                                                    <span>{accesorio}</span>
                                                    {!readOnly && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEliminarAccesorio(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Descripción del Problema */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Descripción del Problema</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="sintomasReportados">Síntomas Reportados *</Label>
                                <Textarea
                                    id="sintomasReportados"
                                    required
                                    disabled={readOnly}
                                    rows={4}
                                    value={ordenServicio.problema.sintomasReportados}
                                    onChange={(e) =>
                                        setOrdenServicio({
                                            ...ordenServicio,
                                            problema: { ...ordenServicio.problema, sintomasReportados: e.target.value },
                                        })
                                    }
                                    placeholder="Describe detalladamente el problema reportado por el cliente..."
                                />
                            </div>

                            <div>
                                <Label htmlFor="frecuenciaFallo">Frecuencia del Fallo</Label>
                                <Input
                                    id="frecuenciaFallo"
                                    disabled={readOnly}
                                    value={ordenServicio.problema.frecuenciaFallo}
                                    onChange={(e) =>
                                        setOrdenServicio({
                                            ...ordenServicio,
                                            problema: { ...ordenServicio.problema, frecuenciaFallo: e.target.value },
                                        })
                                    }
                                    placeholder="Ej: Siempre, a veces, raramente..."
                                />
                            </div>

                            <div>
                                <Label htmlFor="condicionesOcurrencia">Condiciones en que Ocurre</Label>
                                <Textarea
                                    id="condicionesOcurrencia"
                                    disabled={readOnly}
                                    value={ordenServicio.problema.condicionesOcurrencia}
                                    onChange={(e) =>
                                        setOrdenServicio({
                                            ...ordenServicio,
                                            problema: { ...ordenServicio.problema, condicionesOcurrencia: e.target.value },
                                        })
                                    }
                                    placeholder="Ej: Al encender, al usar una app específica, etc."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estado Físico */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado Físico al Ingreso</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="golpes"
                                        disabled={readOnly}
                                        checked={ordenServicio.estadoFisico.golpes}
                                        onCheckedChange={(checked) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                estadoFisico: { ...ordenServicio.estadoFisico, golpes: checked as boolean },
                                            })
                                        }
                                    />
                                    <Label htmlFor="golpes">Golpes</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="rayones"
                                        disabled={readOnly}
                                        checked={ordenServicio.estadoFisico.rayones}
                                        onCheckedChange={(checked) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                estadoFisico: { ...ordenServicio.estadoFisico, rayones: checked as boolean },
                                            })
                                        }
                                    />
                                    <Label htmlFor="rayones">Rayones</Label>
                                </div>

                                <div className="col-span-2">
                                    <Label htmlFor="danosVisibles">Daños Visibles</Label>
                                    <Textarea
                                        id="danosVisibles"
                                        disabled={readOnly}
                                        value={ordenServicio.estadoFisico.danosVisibles}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                estadoFisico: { ...ordenServicio.estadoFisico, danosVisibles: e.target.value },
                                            })
                                        }
                                        placeholder="Describe cualquier daño visible..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="estadoPantalla">Estado de la Pantalla</Label>
                                    <Input
                                        id="estadoPantalla"
                                        disabled={readOnly}
                                        value={ordenServicio.estadoFisico.estadoPantalla}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                estadoFisico: { ...ordenServicio.estadoFisico, estadoPantalla: e.target.value },
                                            })
                                        }
                                        placeholder="Ej: Normal, rayada, rota..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="funcionalidadBotones">Funcionalidad de Botones</Label>
                                    <Input
                                        id="funcionalidadBotones"
                                        disabled={readOnly}
                                        value={ordenServicio.estadoFisico.funcionalidadBotones}
                                        onChange={(e) =>
                                            setOrdenServicio({
                                                ...ordenServicio,
                                                estadoFisico: {
                                                    ...ordenServicio.estadoFisico,
                                                    funcionalidadBotones: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="Ej: Todos funcionan, algunos no responden..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Observaciones */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Observaciones del Técnico</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="observacionesTecnico"
                                disabled={readOnly}
                                rows={4}
                                value={ordenServicio.observacionesTecnico}
                                onChange={(e) =>
                                    setOrdenServicio({
                                        ...ordenServicio,
                                        observacionesTecnico: e.target.value,
                                    })
                                }
                                placeholder="Observaciones adicionales del técnico receptor..."
                            />
                        </CardContent>
                    </Card>

                    {/* Términos y Condiciones */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Términos y Condiciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="terminosAceptados"
                                    required
                                    disabled={readOnly}
                                    checked={ordenServicio.terminosAceptados}
                                    onCheckedChange={(checked) =>
                                        setOrdenServicio({
                                            ...ordenServicio,
                                            terminosAceptados: checked as boolean,
                                        })
                                    }
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="terminosAceptados" className="font-normal">
                                        El cliente acepta los términos y condiciones del servicio de reparación *
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        El equipo será diagnosticado y se enviará un presupuesto en un plazo máximo de
                                        48-72 horas.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar de acciones */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Acciones</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {!readOnly && (
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            )}
                            <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                                Cancelar
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Información</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-600 space-y-2">
                            <p>
                                Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                            </p>
                            <p>
                                Modifica los datos necesarios y guarda los cambios para actualizar el documento.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
