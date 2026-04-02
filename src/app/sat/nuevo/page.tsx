'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  ArrowLeft,
  AlertTriangle,
  Package,
  Clock,
  Upload,
  FileText,
  Info,
  Lock,
  Calendar,
  MapPin,
  Monitor
} from 'lucide-react'
import { useSession } from 'next-auth/react'

const tipos = [
  { value: 'incidencia', label: 'Incidencia', icon: AlertTriangle },
  { value: 'consulta', label: 'Consulta', icon: FileText },
  { value: 'reparacion', label: 'Reparación', icon: Package },
  { value: 'garantia', label: 'Garantía', icon: Clock },
  { value: 'devolucion', label: 'Devolución', icon: Package },
  { value: 'otro', label: 'Otro', icon: AlertTriangle }
]

const prioridades = [
  { value: 'baja', label: 'Baja', tiempo: '72h', color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' },
  { value: 'media', label: 'Media', tiempo: '48h', color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200' },
  { value: 'alta', label: 'Alta', tiempo: '24h', color: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200' },
  { value: 'urgente', label: 'Urgente', tiempo: '4h', color: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200' }
]

const tiposIncidencia = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'red', label: 'Red' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'otro', label: 'Otro' }
]

export default function NuevoTicketPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tipo, setTipo] = useState('')
  const [prioridad, setPrioridad] = useState('media')
  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [adjuntos, setAdjuntos] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Nuevos campos para incidencias
  const [tiposIncidenciaSeleccionados, setTiposIncidenciaSeleccionados] = useState<string[]>([])
  const [sintomasObservados, setSintomasObservados] = useState('')
  const [tipoAcceso, setTipoAcceso] = useState<'remoto' | 'presencial' | ''>('')
  const [fechaPreferida, setFechaPreferida] = useState('')
  const [horaPreferida, setHoraPreferida] = useState('')

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    router.replace('/auth/login?callbackUrl=/sat/nuevo')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validaciones básicas
    if (!tipo) {
      setError('Debes seleccionar un tipo de ticket')
      setIsLoading(false)
      return
    }

    if (!asunto || asunto.trim().length < 5) {
      setError('El asunto debe tener al menos 5 caracteres')
      setIsLoading(false)
      return
    }

    if (!descripcion || descripcion.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres')
      setIsLoading(false)
      return
    }

    // Validaciones específicas para incidencias
    if (tipo === 'incidencia') {
      if (tiposIncidenciaSeleccionados.length === 0) {
        setError('Debes seleccionar al menos un tipo de incidencia')
        setIsLoading(false)
        return
      }

      if (!sintomasObservados || sintomasObservados.trim().length < 10) {
        setError('Debes describir los síntomas observados (mínimo 10 caracteres)')
        setIsLoading(false)
        return
      }

      if (!tipoAcceso) {
        setError('Debes seleccionar el tipo de acceso (remoto o presencial)')
        setIsLoading(false)
        return
      }

      if (!fechaPreferida || !horaPreferida) {
        setError('Debes seleccionar una fecha y hora preferida')
        setIsLoading(false)
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append('tipo', tipo)
      formData.append('prioridad', prioridad)
      formData.append('asunto', asunto)
      formData.append('descripcion', descripcion)

      // Campos específicos de incidencia
      if (tipo === 'incidencia') {
        formData.append('tiposIncidencia', JSON.stringify(tiposIncidenciaSeleccionados))
        formData.append('sintomasObservados', sintomasObservados)
        formData.append('tipoAcceso', tipoAcceso)
        formData.append('fechaPreferida', fechaPreferida)
        formData.append('horaPreferida', horaPreferida)
      }

      adjuntos.forEach(file => {
        formData.append('adjuntos', file)
      })

      const res = await fetch('/api/sat/tickets', {
        method: 'POST',
        // Do not set Content-Type header when sending FormData; browser sets it with boundary
        body: formData
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Error al crear ticket')
        return
      }

      // Redirigir a la página de tickets
      router.push('/sat')
      router.refresh()
    } catch (err) {
      console.error('Error al crear ticket:', err)
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setAdjuntos(Array.from(files))
    }
  }

  const handleTipoIncidenciaChange = (value: string, checked: boolean) => {
    if (checked) {
      setTiposIncidenciaSeleccionados([...tiposIncidenciaSeleccionados, value])
    } else {
      setTiposIncidenciaSeleccionados(tiposIncidenciaSeleccionados.filter(t => t !== value))
    }
  }

  // Obtener la fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen py-6 bg-muted/30">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/sat" className="inline-flex items-center gap-2 mb-3 text-sm hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver a Mis Tickets
          </Link>
          <h1 className="text-2xl font-bold mb-1">Crear Nuevo Ticket</h1>
          <p className="text-sm text-muted-foreground">
            Rellena el formulario para crear un nuevo ticket de soporte técnico.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulario Principal */}
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Información del Ticket</CardTitle>
                  <CardDescription className="text-sm">
                    Proporciona los detalles de tu solicitud de soporte.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Tipo y Prioridad en grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Tipo de ticket */}
                    <div className="space-y-2">
                      <Label htmlFor="tipo" className="text-sm">Tipo de Ticket *</Label>
                      <Select value={tipo} onValueChange={setTipo}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipos.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              <div className="flex items-center gap-2">
                                {t.icon && <t.icon className="h-4 w-4" />}
                                {t.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Prioridad */}
                    <div className="space-y-2">
                      <Label className="text-sm">Prioridad *</Label>
                      <div className="grid grid-cols-4 gap-1">
                        {prioridades.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setPrioridad(p.value)}
                            className={`p-2 rounded-md border text-xs font-medium transition-all ${prioridad === p.value
                              ? p.color + ' border-current'
                              : 'bg-white border-gray-200 hover:border-primary/50'
                              }`}
                          >
                            <div className="truncate">{p.label}</div>
                            <div className="text-[10px] opacity-70">{p.tiempo}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Asunto */}
                  <div className="space-y-2">
                    <Label htmlFor="asunto" className="text-sm">Asunto *</Label>
                    <Input
                      id="asunto"
                      type="text"
                      placeholder="Describe brevemente tu incidencia o consulta"
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      required
                      disabled={isLoading}
                      maxLength={100}
                      className="h-9"
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {asunto.length}/100
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm">Descripción *</Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Proporciona todos los detalles relevantes para resolver tu ticket..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                      disabled={isLoading}
                      rows={5}
                      maxLength={2000}
                      className="resize-none"
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {descripcion.length}/2000
                    </div>
                  </div>

                  {/* Campos específicos para incidencias */}
                  {tipo === 'incidencia' && (
                    <>
                      <Separator />

                      {/* Tipo de Incidencia */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Monitor className="h-4 w-4" />
                          Tipo de Incidencia *
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {tiposIncidencia.map((tipoInc) => (
                            <div key={tipoInc.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`tipo-${tipoInc.value}`}
                                checked={tiposIncidenciaSeleccionados.includes(tipoInc.value)}
                                onCheckedChange={(checked) =>
                                  handleTipoIncidenciaChange(tipoInc.value, checked as boolean)
                                }
                                disabled={isLoading}
                              />
                              <Label
                                htmlFor={`tipo-${tipoInc.value}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {tipoInc.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Síntomas Observados */}
                      <div className="space-y-2">
                        <Label htmlFor="sintomas" className="text-sm">
                          Descripción Detallada y Síntomas Observados *
                        </Label>
                        <Textarea
                          id="sintomas"
                          placeholder="Describe detalladamente los síntomas que has observado..."
                          value={sintomasObservados}
                          onChange={(e) => setSintomasObservados(e.target.value)}
                          required={tipo === 'incidencia'}
                          disabled={isLoading}
                          rows={4}
                          maxLength={1000}
                          className="resize-none"
                        />
                        <div className="text-xs text-muted-foreground text-right">
                          {sintomasObservados.length}/1000
                        </div>
                      </div>

                      <Separator />

                      {/* Acceso Remoto/Presencial */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4" />
                          Acceso Remoto/Presencial *
                        </div>
                        <RadioGroup
                          value={tipoAcceso}
                          onValueChange={(value) => setTipoAcceso(value as 'remoto' | 'presencial')}
                          disabled={isLoading}
                        >
                          <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="remoto" id="remoto" className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor="remoto" className="font-medium cursor-pointer">
                                Acceso remoto
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                Autorizado por: {session?.user?.name || 'Usuario'}
                              </p>
                              {tipoAcceso === 'remoto' && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                                  <p className="font-medium text-blue-900 mb-2">
                                    📥 Descarga necesaria
                                  </p>
                                  <p className="text-blue-700 mb-2">
                                    Para la asistencia remota, necesitarás descargar AnyDesk:
                                  </p>
                                  <a
                                    href="https://anydesk.com/es/downloads/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                                  >
                                    Descargar AnyDesk
                                  </a>
                                  <div className="mt-3 p-2 bg-white border border-blue-200 rounded">
                                    <p className="text-blue-800 font-medium mb-1">📝 Instrucciones:</p>
                                    <ol className="text-blue-700 space-y-1 ml-4 list-decimal">
                                      <li>Ejecuta el archivo descargado (no requiere instalación)</li>
                                      <li>Aparecerá un <span className="font-bold">número de 9 dígitos</span></li>
                                      <li><span className="font-bold">Envía ese número como mensaje</span> en la plataforma</li>
                                    </ol>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="presencial" id="presencial" className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor="presencial" className="font-medium cursor-pointer">
                                Intervención presencial
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                Dirección: Por especificar
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Horario Preferido */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4" />
                          Horario Preferido *
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fecha" className="text-sm">
                              Fecha
                            </Label>
                            <Input
                              id="fecha"
                              type="date"
                              value={fechaPreferida}
                              onChange={(e) => setFechaPreferida(e.target.value)}
                              min={getMinDate()}
                              required={tipo === 'incidencia'}
                              disabled={isLoading}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hora" className="text-sm">
                              Hora
                            </Label>
                            <Input
                              id="hora"
                              type="time"
                              value={horaPreferida}
                              onChange={(e) => setHoraPreferida(e.target.value)}
                              required={tipo === 'incidencia'}
                              disabled={isLoading}
                              className="h-9"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Adjuntos */}
                  <div className="space-y-2">
                    <Label htmlFor="adjuntos" className="text-sm">Adjuntos (opcional)</Label>
                    <div className="relative">
                      <Input
                        id="adjuntos"
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('adjuntos')?.click()}
                        disabled={isLoading}
                        className="w-full h-9"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {adjuntos.length > 0
                          ? `${adjuntos.length} archivo(s) seleccionado(s)`
                          : 'Subir archivos'}
                      </Button>
                    </div>
                    {adjuntos.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {adjuntos.map((file, index) => (
                          <Badge key={index} variant="secondary" className="gap-1 text-xs py-0.5">
                            <FileText className="h-3 w-3" />
                            <span className="max-w-[120px] truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setAdjuntos(adjuntos.filter((_, i) => i !== index))}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push('/sat')} className="h-9">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1 h-9">
                    {isLoading ? 'Creando...' : 'Crear Ticket'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Panel lateral de información */}
          <div className="space-y-4">
            {/* Tiempos de Respuesta */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tiempos de Respuesta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {prioridades.map((p) => (
                  <div key={p.value} className="flex items-start gap-2">
                    <Badge className={p.color + ' mt-0.5 text-xs'}>
                      {p.label}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{p.tiempo}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.value === 'urgente' && 'Incidencias críticas'}
                        {p.value === 'alta' && 'Reparaciones urgentes'}
                        {p.value === 'media' && 'Consultas generales'}
                        {p.value === 'baja' && 'Consultas no urgentes'}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2 text-sm">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="font-medium text-primary">Consejo</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Proporciona toda la información relevante en la descripción. Cuanto más detallado sea tu ticket, más rápido podremos ayudarte.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div >
    </div >
  )
}
