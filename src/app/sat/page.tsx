'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  ChevronRight,
  Eye,
  Download,
  Lock
} from 'lucide-react'
import { useSession } from 'next-auth/react'

// Mock data para tickets
const ticketsMock = [
  {
    id: '1',
    numeroTicket: 'SAT-2023-0001',
    usuarioId: 'demo-user-1',
    tipo: 'incidencia',
    prioridad: 'alta',
    estado: 'en_progreso',
    asunto: 'Portátil Gaming Pro X15 no enciende',
    descripcion: 'El portátil no enciende al presionar el botón de encendido. He intentado con diferentes cables y enchufes.',
    fechaCreacion: '2023-12-28',
    tecnicoId: null,
    tecnico: null,
    numeroSeguimientos: 3,
    ultimoSeguimiento: 'El técnico está revisando el problema de la placa base.'
  },
  {
    id: '2',
    numeroTicket: 'SAT-2023-0002',
    usuarioId: 'demo-user-1',
    tipo: 'reparacion',
    prioridad: 'media',
    estado: 'asignado',
    asunto: 'Instalación de SSD NVMe',
    descripcion: 'Necesito ayuda para instalar un SSD NVMe Samsung 980 Pro en mi portátil.',
    fechaCreacion: '2023-12-25',
    tecnicoId: 'tecnico-1',
    tecnico: {
      id: 'tecnico-1',
      nombre: 'Carlos',
      apellidos: 'García',
      especialidades: ['Hardware', 'SSD', 'HDD'],
      nivel: 'experto',
      valoracionMedia: 4.8
    },
    numeroSeguimientos: 2,
    ultimoSeguimiento: 'Técnico asignado. Esperando disponibilidad del cliente.'
  },
  {
    id: '3',
    numeroTicket: 'SAT-2023-0003',
    usuarioId: 'demo-user-1',
    tipo: 'garantia',
    prioridad: 'baja',
    estado: 'resuelto',
    asunto: 'Garantía del Monitor Curvo 32"',
    descripcion: 'El monitor tiene un píxel muerto en la esquina superior derecha.',
    fechaCreacion: '2023-12-20',
    tecnicoId: 'tecnico-2',
    tecnico: {
      id: 'tecnico-2',
      nombre: 'María',
      apellidos: 'Martínez',
      especialidades: ['Monitores', 'Hardware'],
      nivel: 'senior',
      valoracionMedia: 4.9
    },
    numeroSeguimientos: 8,
    ultimoSeguimiento: 'Se ha procedido a cambiar el monitor por una nueva unidad.',
    satisfaccion: 5,
    fechaResolucion: '2023-12-27'
  }
]

const tipos = [
  { value: 'incidencia', label: 'Incidencia' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'reparacion', label: 'Reparación' },
  { value: 'garantia', label: 'Garantía' },
  { value: 'devolucion', label: 'Devolución' },
  { value: 'otro', label: 'Otro' }
]

const prioridades = [
  { value: 'baja', label: 'Baja', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'media', label: 'Media', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800 border-red-200' }
]

const estados = {
  abierto: { label: 'Abierto', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  asignado: { label: 'Asignado', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
  en_progreso: { label: 'En Progreso', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Clock },
  pendiente_cliente: { label: 'Pendiente Cliente', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },
  resuelto: { label: 'Resuelto', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle }
}

export default function SatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [prioridadFiltro, setPrioridadFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [soloPendientes, setSoloPendientes] = useState(false)

  useEffect(() => {
    if (session) {
      fetchTickets()
    }
  }, [session])

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/sat/tickets')
      const data = await res.json()
      if (data.success) {
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen py-16 bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Identificación Necesaria</CardTitle>
            <CardDescription className="text-base mt-2">
              Para solicitar soporte técnico o gestionar tus tickets SAT, debes estar identificado como cliente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full py-6 text-lg" asChild>
              <Link href="/auth/login?callbackUrl=/sat">
                Iniciar Sesión
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">¿Nuevo en MicroInfo?</span>
              </div>
            </div>
            <Button variant="outline" className="w-full py-6 text-lg" asChild>
              <Link href="/auth/register">
                Crear una Cuenta de Cliente
              </Link>
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t py-4">
            <Link href="/" className="text-sm text-primary hover:underline">
              Volver a la Portada
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const ticketsFiltrados = tickets.filter((ticket) => {
    // 1. Filtro por Rol
    const role = session?.user?.role
    const isAdmin = role === 'admin' || role === 'superadmin'
    const isTecnico = role === 'tecnico'
    const userId = session?.user?.id

    let matchRol = false

    if (isAdmin) {
      matchRol = true // Admin ve todo
    } else if (isTecnico) {
      // Técnico ve lo asignado y lo suyo propio
      // Nota: ticket.tecnico puede ser null. Si existe, verificamos si su usuarioId coinicide.
      const isAssigned = ticket.tecnico?.usuarioId === userId
      const isOwner = ticket.usuarioId === userId
      matchRol = isAssigned || isOwner
    } else {
      // Cliente ve solo lo suyo
      matchRol = ticket.usuarioId === userId
    }

    if (!matchRol) return false

    // 2. Filtros de búsqueda y estado
    const matchBusqueda = !busqueda ||
      ticket.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
      ticket.numeroTicket.toLowerCase().includes(busqueda.toLowerCase())

    const matchTipo = !tipoFiltro || tipoFiltro === 'all' || ticket.tipo === tipoFiltro
    const matchPrioridad = !prioridadFiltro || prioridadFiltro === 'all' || ticket.prioridad === prioridadFiltro
    const matchEstado = !estadoFiltro || estadoFiltro === 'all' || ticket.estado === estadoFiltro
    const matchPendiente = !soloPendientes || (ticket.estado !== 'resuelto' && ticket.estado !== 'cancelado')

    return matchBusqueda && matchTipo && matchPrioridad && matchEstado && matchPendiente
  })

  const getBadgePrioridad = (prioridad: string) => {
    const p = prioridades.find(p => p.value === prioridad)
    return p ? p.color : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getBadgeEstado = (estado: string) => {
    const e = Object.entries(estados).find(([key]) => key === estado)
    if (e) {
      const [, val] = e
      return val.color
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getEstadoInfo = (estado: string) => {
    return Object.entries(estados).find(([key]) => key === estado)?.[1] || { label: estado, color: 'bg-gray-100', icon: AlertCircle }
  }

  const getEstadoCardBackground = (est: string) => {
    const backgrounds: Record<string, string> = {
      abierto: 'bg-yellow-50 border-yellow-200',
      asignado: 'bg-blue-50 border-blue-200',
      en_progreso: 'bg-purple-100 border-purple-200',
      pendiente_cliente: 'bg-orange-100 border-orange-200',
      pendiente_pieza: 'bg-indigo-100 border-indigo-200',
      resuelto: 'bg-green-200 border-green-300',
      cancelado: 'bg-gray-200 border-gray-300'
    }
    return backgrounds[est] || 'bg-white border-gray-200'
  }

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Tickets de Soporte</h1>
            <p className="text-muted-foreground">
              Gestiona y da seguimiento a tus tickets de soporte técnico
            </p>
          </div>
          <Button size="lg" onClick={() => router.push('/sat/nuevo')}>
            <Plus className="h-5 w-5 mr-2" />
            Crear Nuevo Ticket
          </Button>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Búsqueda */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar tickets..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro tipo */}
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {tipos.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro prioridad */}
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select value={prioridadFiltro} onValueChange={setPrioridadFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {prioridades.map((prio) => (
                      <SelectItem key={prio.value} value={prio.value}>
                        {prio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro estado */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(estados).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Solo pendientes */}
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="pendientes"
                  checked={soloPendientes}
                  onCheckedChange={(checked) => setSoloPendientes(checked as boolean)}
                />
                <label
                  htmlFor="pendientes"
                  className="text-sm font-normal cursor-pointer"
                >
                  Solo pendientes
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de tickets */}
        {ticketsFiltrados.length === 0 ? (
          <Card className="text-center py-16">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No se encontraron tickets</h2>
            <p className="text-muted-foreground mb-6">
              {busqueda || tipoFiltro || prioridadFiltro || estadoFiltro || soloPendientes
                ? 'Intenta con otros filtros de búsqueda'
                : 'No tienes tickets de soporte todavía'}
            </p>
            <Button size="lg" onClick={() => router.push('/sat/nuevo')}>
              <Plus className="h-5 w-5 mr-2" />
              Crear Primer Ticket
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ticketsFiltrados.map((ticket) => {
              const estadoInfo = getEstadoEstado(ticket.estado)
              const cardBg = getEstadoCardBackground(ticket.estado)
              return (
                <Card key={ticket.id} className={`hover:shadow-lg transition-all cursor-pointer ${cardBg}`} onClick={() => router.push(`/sat/${ticket.id}`)}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {ticket.numeroTicket}
                          </span>
                          <Badge className={getBadgePrioridad(ticket.prioridad)}>
                            {prioridades.find(p => p.value === ticket.prioridad)?.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 mb-1">
                          {ticket.asunto}
                        </CardTitle>
                      </div>
                      <Badge className={getBadgeEstado(ticket.estado)}>
                        <div className="flex items-center gap-1">
                          {estadoInfo?.icon && <estadoInfo.icon className="h-3 w-3" />}
                          {estadoInfo?.label}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-2 text-base">
                      {ticket.descripcion}
                    </CardDescription>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {ticket._count?.seguimientos || 0} mensajes
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(ticket.fechaCreacion).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {ticket.tecnico?.usuario && (
                      <div className="flex items-center gap-2 pt-3 border-t">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {ticket.tecnico.usuario.nombre.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {ticket.tecnico.usuario.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.tecnico.nivel.charAt(0).toUpperCase() + ticket.tecnico.nivel.slice(1)} • {ticket.tecnico.valoracionMedia} ⭐
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles y Seguimiento
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper para obtener información de estado
function getBadgeEstado(estado: string): string {
  const estados = {
    abierto: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    asignado: 'bg-blue-100 text-blue-800 border-blue-200',
    en_progreso: 'bg-purple-100 text-purple-800 border-purple-200',
    pendiente_cliente: 'bg-orange-100 text-orange-800 border-orange-200',
    resuelto: 'bg-green-100 text-green-800 border-green-200',
    cancelado: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return estados[estado as keyof typeof estados] || 'bg-gray-100 text-gray-800 border-gray-200'
}

function getEstadoEstado(estado: string): { label: string, color: string, icon?: any } {
  const infoEstados = {
    abierto: { label: 'Abierto', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
    asignado: { label: 'Asignado', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
    en_progreso: { label: 'En Progreso', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Clock },
    pendiente_cliente: { label: 'Pendiente Cliente', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },
    resuelto: { label: 'Resuelto', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle }
  }
  return infoEstados[estado as keyof typeof infoEstados] || { label: estado, color: 'bg-gray-100', icon: AlertCircle }
}
