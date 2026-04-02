'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Eye,
  Trash2,
  FileText,
  Tag,
  Calendar,
  User,
  Clock,
  Heart,
  MessageSquare,
  CheckCircle,
  X,
  Settings,
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare as MessageIcon,
  ShoppingBag,
  ChevronRight,
  MoreHorizontal,
  FileUp
} from 'lucide-react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

// Mocks y utilidades
const categoriasMock = [
  'Almacenamiento', 'Redes', 'Reparación', 'Sistema', 'Hardware', 'Periféricos',
  'Software', 'Configuración', 'Troubleshooting', 'Seguridad', 'Garantía'
]

const estadosMock = {
  publicado: { label: 'Publicado', color: 'bg-green-100 text-green-800' },
  borrador: { label: 'Borrador', color: 'bg-yellow-100 text-yellow-800' },
  archivado: { label: 'Archivado', color: 'bg-gray-100 text-gray-800' }
}

export default function AdminConocimientoPage() {
  const [articulos, setArticulos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('todos')
  const [estado, setEstado] = useState('todos')
  const [autor, setAutor] = useState('todos')

  const [articuloSeleccionado, setArticuloSeleccionado] = useState<any>(null)
  const [isVerModalOpen, setIsVerModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [error, setError] = useState('')

  // Fetch articles on mount and when filters change
  const fetchArticulos = async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (busqueda) params.append('busqueda', busqueda)
      if (categoria !== 'todos') params.append('categoria', categoria)
      if (estado !== 'todos') params.append('estado', estado)
      // autor filter not fully supported in backend yet correctly, but passing it
      if (autor !== 'todos') params.append('autor', autor)

      console.log('Fetching articles with params:', params.toString())
      const res = await fetch(`/api/admin_conocimiento?${params.toString()}`)
      console.log('Response status:', res.status)

      const data = await res.json()
      console.log('Response data:', data)

      if (data.success) {
        setArticulos(data.data.articulos)
      } else {
        console.error('API Error:', data.error)
        setError(data.error || 'Error al cargar artículos')
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      setError('Error de conexión con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  // Use debounce or simple effect for now
  useEffect(() => {
    fetchArticulos()
  }, [categoria, estado, autor]) // Trigger reload on filter change. For search usually debounce is better but button is fine too. Let's add simple debounce or manual refresh.

  // Also debounced search triggers
  useEffect(() => {
    const handler = setTimeout(() => fetchArticulos(), 500)
    return () => clearTimeout(handler)
  }, [busqueda])

  // Estado para el formulario
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    categoria: '',
    estado: 'borrador',
    tags: ''
  })

  const handleReload = () => {
    // Reset author filter if needed, or just force fetch
    if (autor !== 'todos') setAutor('todos')
    else fetchArticulos()
  }

  const resetForm = () => {
    setFormData({
      titulo: '',
      contenido: '',
      categoria: '',
      estado: 'borrador',
      tags: ''
    })
    setArticuloSeleccionado(null)
    setIsEditing(false)

  }

  const handleNuevo = () => {
    resetForm()
    setIsEditing(false)
    setIsFormModalOpen(true)
  }

  const handleVer = (articulo: any) => {
    setArticuloSeleccionado(articulo)
    setIsVerModalOpen(true)
  }

  const handleEditar = (articulo: any) => {
    setArticuloSeleccionado(articulo)
    setFormData({
      titulo: articulo.titulo,
      contenido: articulo.contenido,
      categoria: articulo.categoria,
      estado: articulo.estado,
      tags: articulo.tags.join(', ')
    })
    setIsEditing(true)
    setIsFormModalOpen(true)
  }

  const handleBorrar = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
      try {
        const res = await fetch(`/api/admin_conocimiento?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          fetchArticulos()
        } else {
          alert('Error al eliminar')
        }
      } catch (e) {
        alert('Error de conexión')
      }
    }
  }

  const handleGuardar = async () => {
    if (!formData.titulo || !formData.contenido) {
      alert('Por favor, rellena los campos obligatorios (*)')
      return
    }

    try {
      if (isEditing && articuloSeleccionado) {
        // Update
        const res = await fetch(`/api/admin_conocimiento?id=${articuloSeleccionado.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: formData.titulo,
            contenido: formData.contenido,
            categoria: formData.categoria || 'General',
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
            estado: formData.estado
          })
        })
        if (res.ok) {
          fetchArticulos()
          setIsFormModalOpen(false)
          resetForm()
        } else {
          alert('Error al actualizar')
        }
      } else {
        // Create
        const res = await fetch('/api/admin_conocimiento', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: formData.titulo,
            contenido: formData.contenido,
            categoria: formData.categoria || 'General',
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
            estado: formData.estado
          })
        })
        if (res.ok) {
          fetchArticulos()
          setIsFormModalOpen(false)
          resetForm()
        } else {
          alert('Error al crear')
        }
      }
    } catch (e) {
      console.error(e)
      alert('Error de conexión')
    }
  }

  // Filtering is now handled by backend, but we keep the variable for display count
  const articulosFiltrados = articulos // Already filtered by API

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Base de Conocimiento</h1>
                <p className="text-gray-600">
                  Administra la base de conocimiento: crear, editar, archivar y gestionar artículos de soporte técnico.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReload} className="gap-2">
                <LayoutDashboard className="h-4 w-4" /> {/* Icon reused temporary */}
                Recargar
              </Button>
            </div>
          </div>

          {/* Buscar y Filtrar */}
          <div className="bg-white border-b p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar artículos por título, contenido o tags..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="w-40 p-2 border rounded"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="todos">Todas las categorías</option>
                {categoriasMock.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                className="w-40 p-2 border rounded"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="publicado">Publicado</option>
                <option value="borrador">Borrador</option>
                <option value="archivado">Archivado</option>
              </select>
              <select
                className="w-40 p-2 border rounded"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
              >
                <option value="todos">Todos los autores</option>
                <option value="carlos">Carlos García (Técnico)</option>
                <option value="maria">María Martínez (Técnica)</option>
                <option value="diego">Diego Fernández (Técnico)</option>
                <option value="ana">Ana Rodríguez (Admin)</option>
                <option value="admin">Admin Principal (Admin)</option>
              </select>
              <div className="text-sm text-gray-600">
                {articulosFiltrados.length} artículos
              </div>
            </div>
          </div>

          {/* Grid de Artículos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articulosFiltrados.map((articulo) => {
              const estadoInfo = estadosMock[articulo.estado as keyof typeof estadosMock]
              return (
                <Card key={articulo.id} className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">
                        {articulo.categoria}
                      </Badge>
                      <Badge className={estadoInfo.color}>
                        {estadoInfo.label}
                      </Badge>
                    </div>
                    <p className="font-semibold line-clamp-2">{articulo.titulo}</p>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {articulo.contenido}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {articulo.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{articulo.autor}</span>
                      </div>
                      <div className={`px-2 py-1 rounded ${articulo.rol === 'tecnico' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {articulo.rol === 'tecnico' ? 'Técnico' : 'Admin'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{articulo.vistas} vistas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{articulo.likes} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{articulo.comentarios} comentarios</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Creado: {articulo.fechaCreacion}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Actualizado: {articulo.fechaActualizacion}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleVer(articulo)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditar(articulo)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleBorrar(articulo.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditar(articulo)}>Editar artículo</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVer(articulo)}>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Duplicar borrador</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleBorrar(articulo.id)}>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Botón Nuevo */}
          <div className="fixed bottom-8 right-8">
            <Button onClick={handleNuevo} className="gap-2 shadow-lg">
              <Plus className="h-4 w-4" />
              Nuevo Artículo
            </Button>
          </div>
        </main>
      </div>

      {/* Modal Detalles */}
      <Dialog open={isVerModalOpen} onOpenChange={setIsVerModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
          <DialogTitle className="sr-only">Detalle del Artículo: {articuloSeleccionado?.titulo}</DialogTitle>
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal border-gray-300">
                {articuloSeleccionado?.id}
              </Badge>
              <Badge className={articuloSeleccionado ? estadosMock[articuloSeleccionado.estado as keyof typeof estadosMock]?.color : ''}>
                {articuloSeleccionado ? estadosMock[articuloSeleccionado.estado as keyof typeof estadosMock]?.label : ''}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                if (!articuloSeleccionado) return
                import('jspdf').then(module => {
                  const jsPDF = module.default || (module as any).jsPDF;
                  const doc = new jsPDF();

                  // Header
                  doc.setFontSize(24);
                  doc.setTextColor(20, 20, 20);
                  const titleLines = doc.splitTextToSize(articuloSeleccionado.titulo, 170);
                  doc.text(titleLines, 20, 20);

                  let yPos = 20 + (titleLines.length * 10);

                  // Meta
                  doc.setFontSize(10);
                  doc.setTextColor(100, 100, 100);
                  doc.text(`Categoría: ${articuloSeleccionado.categoria}`, 20, yPos);
                  doc.text(`Autor: ${articuloSeleccionado.autor} (${articuloSeleccionado.rol})`, 20, yPos + 5);
                  doc.text(`Fecha: ${articuloSeleccionado.fechaCreacion}`, 20, yPos + 10);

                  yPos += 20;
                  doc.setDrawColor(200, 200, 200);
                  doc.line(20, yPos - 5, 190, yPos - 5);

                  // Content
                  doc.setFontSize(11);
                  doc.setTextColor(40, 40, 40);
                  const contentLines = doc.splitTextToSize(articuloSeleccionado.contenido, 170);

                  // Simple pagination loop
                  let pageHeight = doc.internal.pageSize.height;

                  contentLines.forEach((line: string) => {
                    if (yPos > pageHeight - 20) {
                      doc.addPage();
                      yPos = 20;
                    }
                    doc.text(line, 20, yPos);
                    yPos += 7;
                  });

                  // Tags footer
                  if (yPos > pageHeight - 30) {
                    doc.addPage();
                    yPos = 20;
                  }

                  yPos += 10;
                  doc.setTextColor(0, 102, 204);
                  doc.setFontSize(10);
                  doc.text(`Tags: ${articuloSeleccionado.tags.join(', ')}`, 20, yPos);

                  doc.save(`KB-${articuloSeleccionado.id}-${articuloSeleccionado.titulo.slice(0, 20)}.pdf`);
                })
              }}>
                <FileUp className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsVerModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {articuloSeleccionado && (
              <>
                {/* Document Header */}
                <div className="space-y-4 pb-6 border-b">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {articuloSeleccionado.titulo}
                  </h1>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {articuloSeleccionado.autor ? articuloSeleccionado.autor.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{articuloSeleccionado.autor}</p>
                          <p className="text-xs">{articuloSeleccionado.rol === 'tecnico' ? 'Soporte Técnico' : 'Administrador'}</p>
                        </div>
                      </div>
                      <div className="h-8 w-[1px] bg-gray-200"></div>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Publicado: {articuloSeleccionado.fechaCreacion}
                        </p>
                        {articuloSeleccionado.fechaActualizacion !== articuloSeleccionado.fechaCreacion && (
                          <p className="flex items-center gap-2 text-gray-400">
                            <Clock className="h-3.5 w-3.5" />
                            Act: {articuloSeleccionado.fechaActualizacion}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {articuloSeleccionado.categoria}
                    </Badge>
                  </div>
                </div>

                {/* Document Content */}
                <div className="prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-blue-600">
                  {articuloSeleccionado.contenido.split('\n').map((paragraph: string, idx: number) => (
                    paragraph.trim() !== '' ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                  ))}
                </div>

                {/* Footer / Metadatos */}
                <div className="pt-8 border-t bg-gray-50/50 -mx-8 px-8 pb-8 mt-8">
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Etiquetas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {articuloSeleccionado.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-white hover:bg-gray-100 transition-colors cursor-pointer">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border shadow-sm">
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Impacto</p>
                      <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
                        <Eye className="h-5 w-5" />
                        {articuloSeleccionado.vistas}
                      </div>
                      <p className="text-xs text-gray-400">visualizaciones</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 text-center border-l border-r border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Utilidad</p>
                      <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                        <Heart className="h-5 w-5" />
                        {articuloSeleccionado.likes}
                      </div>
                      <p className="text-xs text-gray-400">personas les sirvió</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Feedback</p>
                      <div className="flex items-center gap-2 text-lg font-semibold text-purple-600">
                        <MessageSquare className="h-5 w-5" />
                        {articuloSeleccionado.comentarios}
                      </div>
                      <p className="text-xs text-gray-400">comentarios</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="sticky bottom-0 p-4 border-t bg-gray-50 flex justify-end gap-3 z-10">
            <Button variant="outline" onClick={() => setIsVerModalOpen(false)}>Cerrar</Button>
            <Button onClick={() => { setIsVerModalOpen(false); handleEditar(articuloSeleccionado); }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Contenido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Formulario (Crear/Editar) */}
      <Dialog open={isFormModalOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsFormModalOpen(open); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Artículo' : 'Crear Nuevo Artículo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                placeholder="Título del artículo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contenido *</Label>
              <Textarea
                placeholder="Escribe el contenido del artículo..."
                rows={8}
                value={formData.contenido}
                onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(v) => setFormData({ ...formData, categoria: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasMock.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(v) => setFormData({ ...formData, estado: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="publicado">Publicado</SelectItem>
                    <SelectItem value="archivado">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                placeholder="tag1, tag2, tag3..."
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <p className="text-xs text-gray-500">Separar por comas</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleGuardar}>
              {isEditing ? 'Actualizar Artículo' : 'Crear Artículo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
