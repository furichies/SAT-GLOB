'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Star,
  Calendar,
  Mail,
  Phone,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingCart,
  MessageSquare,
  FileText,
  ShoppingBag,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

const tecnicosMock = [
  {
    id: '1',
    nombre: 'Carlos García',
    apellidos: 'García Fernández',
    email: 'carlos.garcia@microinfo.es',
    telefono: '655-123-456',
    especialidades: ['Hardware', 'Portátiles', 'SSD', 'HDD'],
    nivel: 'experto',
    nivelExperiencia: 10,
    disponible: true,
    ticketsAsignados: 3,
    ticketsResueltos: 45,
    valoracionMedia: 4.8,
    valoraciones: 23,
    ultimaConexion: '2023-12-30 09:00',
    fechaCreacion: '2020-01-15'
  },
  {
    id: '2',
    nombre: 'María Martínez',
    apellidos: 'Martínez Sánchez',
    email: 'maria.martinez@microinfo.es',
    telefono: '655-234-567',
    especialidades: ['Monitores', 'Periféricos', 'Audio'],
    nivel: 'senior',
    nivelExperiencia: 7,
    disponible: true,
    ticketsAsignados: 2,
    ticketsResueltos: 38,
    valoracionMedia: 4.9,
    valoraciones: 20,
    ultimaConexion: '2023-12-30 08:30',
    fechaCreacion: '2021-06-20'
  },
  {
    id: '3',
    nombre: 'Diego Fernández',
    apellidos: 'Fernández López',
    email: 'diego.fernandez@microinfo.es',
    telefono: '655-345-678',
    especialidades: ['CPU', 'GPU', 'RAM'],
    nivel: 'senior',
    nivelExperiencia: 5,
    disponible: false,
    ticketsAsignados: 5,
    ticketsResueltos: 52,
    valoracionMedia: 4.7,
    valoraciones: 18,
    ultimaConexion: '2023-12-29 16:45',
    fechaCreacion: '2022-03-10'
  },
  {
    id: '4',
    nombre: 'Ana Rodríguez',
    apellidos: 'Rodríguez González',
    email: 'ana.rodriguez@microinfo.es',
    telefono: '655-456-789',
    especialidades: ['Almacenamiento', 'RAM'],
    nivel: 'junior',
    nivelExperiencia: 2,
    disponible: true,
    ticketsAsignados: 1,
    ticketsResueltos: 12,
    valoracionMedia: 4.5,
    valoraciones: 10,
    ultimaConexion: '2023-12-30 10:00',
    fechaCreacion: '2023-09-01'
  }
]

const especialidadesMock = [
  'Hardware', 'Portátiles', 'SSD', 'HDD', 'RAM',
  'CPU', 'GPU', 'Monitores', 'Periféricos', 'Audio',
  'Almacenamiento', 'Software', 'Redes', 'Impresoras'
]

const nivelesMock = [
  { value: 'junior', label: 'Junior (1-3 años)' },
  { value: 'senior', label: 'Senior (4-7 años)' },
  { value: 'experto', label: 'Experto (8+ años)' }
]

export default function AdminTecnicosPage() {
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [especialidad, setEspecialidad] = useState('todos')
  const [nivel, setNivel] = useState('todos')
  const [disponible, setDisponible] = useState('todos')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTecnicos = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin_tecnicos?especialidad=${especialidad}&nivel=${nivel}&disponible=${disponible}`)
      const data = await res.json()
      if (data.success && data.data.tecnicos.length > 0) {
        setTecnicos(data.data.tecnicos)
      } else {
        // Fallback a mock data para visualización si no hay datos en DB
        // Filtramos el mock localmente si es necesario
        setTecnicos(tecnicosMock.filter(t => {
          if (especialidad !== 'todos' && !t.especialidades.includes(especialidad)) return false
          if (nivel !== 'todos' && t.nivel !== nivel) return false
          if (disponible === 'si' && !t.disponible) return false
          if (disponible === 'no' && t.disponible) return false
          return true
        }))
      }
    } catch (error) {
      console.error('Error fetching tecnicos:', error)
      setTecnicos(tecnicosMock) // Fallback en error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTecnicos()
  }, [especialidad, nivel, disponible])

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    nivel: 'junior',
    especialidades: [] as string[],
    disponible: true,
    password: ''
  })

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      nivel: 'junior',
      especialidades: [],
      disponible: true,
      password: ''
    })
    setTecnicoSeleccionado(null)
    setIsEditing(false)
  }

  const handleNuevo = () => {
    resetForm()
    setIsEditing(false)
    setIsFormModalOpen(true)
  }

  const handleEditar = (tecnico: any) => {
    setTecnicoSeleccionado(tecnico)
    setFormData({
      nombre: tecnico.nombre,
      apellidos: tecnico.apellidos,
      email: tecnico.email,
      telefono: tecnico.telefono,
      nivel: tecnico.nivel,
      especialidades: [...tecnico.especialidades],
      disponible: tecnico.disponible,
      password: '' // Reset password field on edit
    })
    setIsEditing(true)
    setIsFormModalOpen(true)
  }

  const handleBorrar = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este técnico?')) {
      setTecnicos(tecnicos.filter(t => t.id !== id))
    }
  }

  const handleGuardar = async () => {
    if (!formData.nombre || !formData.email) {
      alert('Por favor, rellena los campos obligatorios (*)')
      return
    }

    setIsLoading(true)
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const body = isEditing ? { ...formData, id: tecnicoSeleccionado.id } : formData

      const res = await fetch('/api/admin_tecnicos', {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if (data.success) {
        await fetchTecnicos()
        setIsFormModalOpen(false)
        resetForm()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving tecnico:', error)
      alert('Error de conexión al guardar')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleEspecialidad = (esp: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(esp)
        ? prev.especialidades.filter(e => e !== esp)
        : [...prev.especialidades, esp]
    }))
  }

  const tecnicosFiltrados = tecnicos.filter(t => {
    if (busqueda && !t.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      !t.apellidos.toLowerCase().includes(busqueda.toLowerCase()) &&
      !t.email.toLowerCase().includes(busqueda.toLowerCase())) return false
    // Los otros filtros ya se aplican en el fetch/fallback, pero los mantenemos aquí por si acaso cambia la lógica
    return true
  })

  const getNivelInfo = (niv: string) => {
    const niveles = {
      junior: { label: 'Junior', color: 'bg-blue-100 text-blue-800' },
      senior: { label: 'Senior', color: 'bg-purple-100 text-purple-800' },
      experto: { label: 'Experto', color: 'bg-green-100 text-green-800' }
    }
    return niveles[niv as keyof typeof niveles] || niveles.junior
  }

  const getEstrellas = (valoracion: number) => {
    const estrellas = Math.round(valoracion)
    return Array(5).fill(0).map((_, idx) => (
      <Star key={idx} className={`h-4 w-4 ${idx < estrellas ? 'fill-current text-yellow-500' : 'text-gray-300'}`} />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />


      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestión de Técnicos</h1>
          <p className="text-gray-600">
            Administra el equipo de técnicos: crear, editar, ver estadísticas y disponibilidad.
          </p>
        </div>

        {/* Buscar y Filtrar */}
        <div className="bg-white border-b p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, apellido o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="p-2 border rounded w-40"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
            >
              <option value="todos">Todas las especialidades</option>
              {especialidadesMock.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
            <select
              className="p-2 border rounded w-40"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
            >
              <option value="todos">Todos los niveles</option>
              {nivelesMock.map(niv => (
                <option key={niv.value} value={niv.value}>{niv.label}</option>
              ))}
            </select>
            <select
              className="p-2 border rounded w-40"
              value={disponible}
              onChange={(e) => setDisponible(e.target.value)}
            >
              <option value="todos">Disponibilidad</option>
              <option value="si">Disponible</option>
              <option value="no">No disponible</option>
            </select>
            <div className="text-sm text-gray-600">
              {tecnicosFiltrados.length} técnicos
            </div>
          </div>
        </div>

        {/* Grid de Técnicos */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tecnicosFiltrados.map((tecnico) => {
              const nivelInfo = getNivelInfo(tecnico.nivel)
              return (
                <Card key={tecnico.id} className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                          {tecnico.nombre.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tecnico.nombre} {tecnico.apellidos}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={nivelInfo.color}>
                              {nivelInfo.label}
                            </Badge>
                            {tecnico.disponible ? (
                              <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">No disponible</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditar(tecnico)}>
                              <Edit className="h-4 w-4 mr-2" /> Editar técnico
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBorrar(tecnico.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{tecnico.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{tecnico.telefono}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">Especialidades:</div>
                      <div className="flex flex-wrap gap-1">
                        {tecnico.especialidades.map((esp, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {esp}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-gray-600">Resueltos</span>
                        </div>
                        <div className="font-bold text-lg">{tecnico.ticketsResueltos}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-gray-600">Asignados</span>
                        </div>
                        <div className="font-bold text-lg">{tecnico.ticketsAsignados}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Award className="h-4 w-4 text-purple-600" />
                          <span className="text-xs text-gray-600">Valoración</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          {getEstrellas(tecnico.valoracionMedia)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                      <Calendar className="h-3 w-3" />
                      <span>Última conexión: {tecnico.ultimaConexion}</span>
                      <span>•</span>
                      <span>Miembro desde: {tecnico.fechaCreacion}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}


        {/* Botón Crear */}
        <div className="fixed bottom-8 right-8">
          <Button onClick={handleNuevo} className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" />
            Nuevo Técnico
          </Button>
        </div>
      </main>


      {/* Modal de Crear/Editar Técnico */}
      <Dialog open={isFormModalOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsFormModalOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Técnico' : 'Crear Nuevo Técnico'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  placeholder="Carlos"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido(s) *</Label>
                <Input
                  placeholder="García Fernández"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="tecnico@microinfo.es"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono *</Label>
                <Input
                  type="tel"
                  placeholder="655-123-456"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}</Label>
              <Input
                type="password"
                placeholder={isEditing ? "Dejar en blanco para mantener actual" : "Contraseña segura"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {!isEditing && <p className="text-xs text-muted-foreground">Si se deja vacío, se usará 'MicroInfo2024!' por defecto.</p>}
            </div>
            <div className="space-y-2">
              <Label>Nivel de Experiencia *</Label>
              <Select
                value={formData.nivel}
                onValueChange={(v) => setFormData({ ...formData, nivel: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {nivelesMock.map(niv => (
                    <SelectItem key={niv.value} value={niv.value}>{niv.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Especialidades *</Label>
              <div className="grid grid-cols-3 gap-2 border rounded-md p-4 bg-gray-50">
                {especialidadesMock.map(esp => (
                  <div key={esp} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={esp}
                      checked={formData.especialidades.includes(esp)}
                      onChange={() => toggleEspecialidad(esp)}
                    />
                    <Label htmlFor={esp} className="text-sm cursor-pointer">{esp}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={formData.disponible}
                  onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                />
                <Label htmlFor="disponible" className="cursor-pointer">Disponible para asignar tickets</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleGuardar}>
              {isEditing ? 'Actualizar Técnico' : 'Crear Técnico'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
