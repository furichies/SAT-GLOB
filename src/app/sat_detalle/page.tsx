'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Package,
  Settings,
  Star
} from 'lucide-react'

// Mock data
const ticketMock = {
  id: '1',
  numeroTicket: 'SAT-2023-0001',
  asunto: 'Portátil Gaming Pro X15 no enciende',
  estado: 'en_progreso',
  tipo: 'incidencia',
  prioridad: 'alta',
  descripcion: 'El portátil no enciende al presionar el botón. He intentado con diferentes cables.',
  tecnico: 'Carlos García - Experto',
  producto: {
    nombre: 'Portátil Gaming Pro X15',
    sku: 'LAP-GAM-X15',
    imagen: '/images/producto_laptop_gaming.png'
  }
}

const seguimientosMock = [
  { id: '1', usuario: 'YO', tipo: 'mensaje', contenido: 'Ticket creado', interno: false, fecha: '2023-12-28 10:30' },
  { id: '2', usuario: 'TC', tipo: 'asignacion', contenido: 'Técnico asignado', interno: true, fecha: '2023-12-28 11:00' },
  { id: '3', usuario: 'TC', tipo: 'diagnostico', contenido: 'Problema en placa base', interno: true, fecha: '2023-12-29 09:15' }
]

const prioridades = {
  alta: 'bg-orange-100 text-orange-800 border-orange-200',
  media: 'bg-blue-100 text-blue-800 border-blue-200',
  urgente: 'bg-red-100 text-red-800 border-red-200'
}

export default function SatDetallePage() {
  const router = useRouter()
  const [mensaje, setMensaje] = useState('')

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock: enviar comentario
    console.log('Mensaje enviado:', mensaje)
    setMensaje('')
  }

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container max-w-7xl">
        <Link href="/sat" className="inline-flex items-center gap-2 mb-6 text-sm hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Volver a Mis Tickets
        </Link>

        <h1 className="text-3xl font-bold mb-2">{ticketMock.numeroTicket}</h1>
        <p className="text-xl mb-8">{ticketMock.asunto}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: info ticket */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Estado</Label>
                  <Badge className="bg-purple-100 text-purple-800">En Progreso</Badge>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <p className="capitalize">{ticketMock.tipo}</p>
                </div>
                <div>
                  <Label>Prioridad</Label>
                  <Badge className={prioridades[ticketMock.prioridad as keyof typeof prioridades]}>
                    {ticketMock.prioridad.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label>Descripción</Label>
                  <p className="text-sm">{ticketMock.descripcion}</p>
                </div>
              </CardContent>
            </Card>

            {ticketMock.producto && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Producto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{ticketMock.producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">SKU: {ticketMock.producto.sku}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Técnico Asignado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    C
                  </div>
                  <p className="font-semibold">{ticketMock.tecnico}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha: seguimiento */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <CardTitle className="text-xl">Seguimiento</CardTitle>
                  </div>
                  <Badge variant="secondary">{seguimientosMock.length} mensajes</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timeline de seguimientos */}
                <div className="space-y-4">
                  {seguimientosMock.map((seg, idx) => (
                    <div key={seg.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        {seg.interno ? (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold">
                            TC
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            YO
                          </div>
                        )}
                      </div>
                      <div className={`flex-1 ${seg.interno ? 'bg-muted/30' : ''} p-4 rounded-lg`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm mb-1">
                              {seg.tipo === 'mensaje' && 'Tu comentario'}
                              {seg.tipo === 'asignacion' && 'Asignación de técnico'}
                              {seg.tipo === 'diagnostico' && 'Diagnóstico'}
                            </p>
                            <p className="text-xs text-muted-foreground">{seg.fecha}</p>
                          </div>
                          {seg.interno && (
                            <Badge variant="secondary">Interno</Badge>
                          )}
                        </div>
                        <p className="text-sm">{seg.contenido}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Formulario de nuevo comentario */}
                <div className="space-y-3">
                  <Label>Añadir Comentario</Label>
                  <Textarea
                    placeholder="Escribe un mensaje al técnico..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{mensaje.length}/500 caracteres</span>
                    <Button size="sm" onClick={handleEnviar}>
                      Enviar
                    </Button>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/sat">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Resuelto
                    </Link>
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Cerrar Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
