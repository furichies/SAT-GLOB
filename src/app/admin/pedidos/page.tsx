'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Search,
  Package,
  Edit,
  Eye,
  Download,
  X,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ShoppingCart,
  FileText,
  Settings,
  LayoutDashboard,
  ShoppingBag,
  User,
  MoreHorizontal,
  Printer,
  FileDown
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminPedidosPage() {
  const searchParams = useSearchParams()
  const clienteId = searchParams.get('clienteId') || ''
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('todos')
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [pedidos, setPedidos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPedidos = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin_pedidos?estado=${estado !== 'todos' ? estado : ''}&busqueda=${busqueda}&clienteId=${clienteId}`)
      const data = await res.json()
      if (data.success) {
        setPedidos(data.data.pedidos)
      }
    } catch (error) {
      console.error('Error fetching admin pedidos:', error)
      toast.error("Error al cargar pedidos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPedidos()
  }, [estado, busqueda, clienteId])

  const handleUpdateEstado = async (id: string, nuevoEstado: string) => {
    try {
      const res = await fetch('/api/admin_pedidos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado })
      })
      const data = await res.json()
      if (data.success) {
        fetchPedidos()
        if (pedidoSeleccionado && pedidoSeleccionado.id === id) {
          setPedidoSeleccionado({ ...pedidoSeleccionado, estado: nuevoEstado })
        }
        toast.success(`Pedido ${nuevoEstado} correctamente`)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error("Error al actualizar estado")
    }
  }

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/admin_pedidos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pedidoSeleccionado.id,
          direccionEnvio: editData.direccion,
          notas: editData.notas,
          estado: editData.estado
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchPedidos()
        setPedidoSeleccionado({ ...pedidoSeleccionado, ...editData, direccion: editData.direccion })
        setIsEditing(false)
        toast.success("Pedido actualizado con éxito")
      }
    } catch (error) {
      toast.error("Error al guardar cambios")
    }
  }

  const parseDireccion = (dir: any) => {
    if (!dir) return { direccion: '', ciudad: '', codigoPostal: '' }
    if (typeof dir !== 'string') return dir
    try {
      // Try to parse as JSON (standard ecommerce orders)
      return JSON.parse(dir)
    } catch (e) {
      // Fallback for simple strings (repair orders or legacy)
      return {
        direccion: dir,
        ciudad: '',
        codigoPostal: '',
        telefono: ''
      }
    }
  }

  const generatePDF = (pedido: any) => {
    const doc = new jsPDF() as any

    // Header
    doc.setFontSize(22)
    doc.setTextColor(0, 48, 135)
    doc.text('MICROINFO SAT & SHOP', 14, 22)

    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text('Resumen de Pedido Oficial', 14, 30)
    doc.text('Calle Arcas del Agua, 2 (Sector 3), 28905 Getafe, Madrid', 14, 35)
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 30)

    // Order Info
    doc.setDrawColor(200)
    doc.line(14, 40, 196, 40)

    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text(`Número de Pedido: ${pedido.numeroPedido}`, 14, 50)
    doc.text(`Estado Actual: ${pedido.estado.toUpperCase()}`, 14, 57)

    // Client Info
    doc.setFontSize(12)
    doc.text('DATOS DEL CLIENTE', 14, 65)
    doc.setFontSize(10)
    doc.text(`Nombre: ${pedido.clienteNombre}`, 14, 72)
    doc.text(`Email: ${pedido.clienteEmail}`, 14, 78)

    const direccion = parseDireccion(pedido.direccion)
    doc.text('DIRECCIÓN DE ENVÍO:', 110, 65)
    doc.text(`${direccion.nombre || ''} ${direccion.apellidos || ''}`, 110, 72)
    doc.text(`${direccion.direccion || ''}`, 110, 78)
    doc.text(`${direccion.codigoPostal || ''} ${direccion.ciudad || ''}`, 110, 84)

    // Table
    const tableData = (pedido.detalles || []).map((d: any) => [
      d.descripcion || d.producto?.nombre || 'Producto',
      d.cantidad,
      `${d.precioUnitario.toFixed(2)}€`,
      `${(d.cantidad * d.precioUnitario).toFixed(2)}€`
    ])

    autoTable(doc, {
      startY: 95,
      head: [['Producto', 'Cant', 'Precio Ud.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 48, 135] }
    })

    const finalY = (doc as any).lastAutoTable.finalY || 150

    // Totals
    doc.setFontSize(12)
    doc.text(`Subtotal: ${pedido.subtotal.toFixed(2)}€`, 140, finalY + 10)
    doc.text(`IVA (21%): ${pedido.iva.toFixed(2)}€`, 140, finalY + 17)
    doc.setFontSize(14)
    doc.text(`TOTAL: ${pedido.total.toFixed(2)}€`, 140, finalY + 27)

    doc.save(`${pedido.numeroPedido}.pdf`)
  }

  const getEstadoInfo = (est: string) => {
    const estados = {
      pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      procesando: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800', icon: Package },
      enviado: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
      entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    return estados[est as keyof typeof estados] || { label: est, color: 'bg-gray-100', icon: Package }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 lg:ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Gestión de Pedidos</h1>
            <p className="text-gray-600">
              Panel de control avanzado para la administración de ventas y logística.
            </p>
            {clienteId && (
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  Filtrando por Cliente ID: {clienteId}
                </Badge>
                <Link href="/admin/pedidos">
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                    <X className="h-3 w-3 mr-1" /> Limpiar filtro
                  </Badge>
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white border p-6 rounded-2xl mb-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar pedido, cliente o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 h-10 rounded-xl"
                />
              </div>
              <select
                className="p-2 border rounded-xl text-sm font-medium"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="procesando">En Proceso</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {isLoading && (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-sm font-bold text-gray-400">CARGANDO BASE DE DATOS...</p>
              </div>
            )}

            {!isLoading && (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Pedido</th>
                    <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                    <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Estado</th>
                    <th className="text-right p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
                    <th className="text-right p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pedidos.map((pedido) => {
                    const estadoInfo = getEstadoInfo(pedido.estado)
                    return (
                      <tr key={pedido.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-black text-primary">{pedido.numeroPedido}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{new Date(pedido.fecha).toLocaleString()}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{pedido.clienteNombre}</div>
                          <div className="text-xs text-gray-500">{pedido.clienteEmail}</div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${estadoInfo.color} font-black text-[10px] rounded-full border-none px-3 py-1`}>
                            {estadoInfo.label.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-black text-lg">{pedido.total.toFixed(2)}€</div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                              setPedidoSeleccionado(pedido)
                              setIsEditing(false)
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase text-gray-400">Opciones Rápidas</DropdownMenuLabel>
                                <DropdownMenuItem className="gap-2 font-medium" onClick={() => generatePDF(pedido)}>
                                  <Download className="h-4 w-4" /> Descargar PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 font-medium" onClick={() => {
                                  setPedidoSeleccionado(pedido)
                                  setIsEditing(true)
                                  setEditData({
                                    direccion: parseDireccion(pedido.direccion),
                                    notas: pedido.notas || '',
                                    estado: pedido.estado
                                  })
                                }}>
                                  <Edit className="h-4 w-4" /> Editar Pedido
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 font-medium text-red-600"
                                  onClick={() => handleUpdateEstado(pedido.id, 'cancelado')}
                                >
                                  <XCircle className="h-4 w-4" /> Cancelar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border-none shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between p-8 bg-gray-900 text-white">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Detalle del Pedido</p>
                <CardTitle className="text-2xl font-black">{pedidoSeleccionado.numeroPedido}</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPedidoSeleccionado(null)} className="text-white hover:bg-white/10 rounded-full">
                <X className="h-6 w-6" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 pb-8 bg-white">
              {!isEditing ? (
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary font-black text-xs uppercase">
                        <User className="h-3 w-3" /> Información Cliente
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="font-black text-lg">{pedidoSeleccionado.clienteNombre}</p>
                        <p className="text-sm text-gray-500 font-medium">{pedidoSeleccionado.clienteEmail}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary font-black text-xs uppercase">
                        <Truck className="h-3 w-3" /> Logística de Envío
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        {(() => {
                          const d = parseDireccion(pedidoSeleccionado.direccion)
                          return (
                            <div className="text-sm font-medium text-gray-700">
                              <p>{d.direccion}</p>
                              {d.codigoPostal || d.ciudad ? (
                                <p>{d.codigoPostal} {d.ciudad}</p>
                              ) : null}
                              {d.telefono && (
                                <p className="text-xs text-gray-400 mt-2 font-black uppercase">Tel: {d.telefono}</p>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase">
                      <Package className="h-3 w-3" /> Artículos
                    </div>
                    <div className="border rounded-2xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b font-bold text-[10px] uppercase text-gray-400">
                          <tr>
                            <th className="text-left p-3">Producto</th>
                            <th className="text-center p-3">Cant</th>
                            <th className="text-right p-3">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(pedidoSeleccionado.detalles || []).map((det: any, i: number) => (
                            <tr key={i}>
                              <td className="p-3 font-bold">{det.descripcion || det.producto?.nombre || 'Producto'}</td>
                              <td className="p-3 text-center">{det.cantidad}</td>
                              <td className="p-3 text-right font-black">{(det.cantidad * det.precioUnitario).toFixed(2)}€</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <Button className="flex-1 h-12 rounded-xl font-bold gap-2" variant="outline" onClick={() => generatePDF(pedidoSeleccionado)}>
                      <Download className="h-4 w-4" /> DESCARGAR PDF
                    </Button>
                    <Button className="flex-1 h-12 rounded-xl font-bold bg-primary text-white" onClick={() => {
                      setEditData({
                        direccion: parseDireccion(pedidoSeleccionado.direccion),
                        notas: pedidoSeleccionado.notas || '',
                        estado: pedidoSeleccionado.estado
                      })
                      setIsEditing(true)
                    }}>
                      EDITAR DATOS / ESTADO
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-8 space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase text-gray-400">Estado del Pedido</Label>
                    <select
                      className="w-full p-3 border rounded-xl font-bold text-primary"
                      value={editData.estado}
                      onChange={(e) => setEditData({ ...editData, estado: e.target.value })}
                    >
                      <option value="pendiente">PENDIENTE</option>
                      <option value="procesando">EN PROCESO</option>
                      <option value="enviado">ENVIADO</option>
                      <option value="entregado">ENTREGADO</option>
                      <option value="cancelado">CANCELADO</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase text-gray-400">Dirección de Envío</Label>
                    <Input
                      value={editData.direccion.direccion}
                      onChange={(e) => setEditData({ ...editData, direccion: { ...editData.direccion, direccion: e.target.value } })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-black text-xs uppercase text-gray-400">Ciudad</Label>
                      <Input
                        value={editData.direccion.ciudad}
                        onChange={(e) => setEditData({ ...editData, direccion: { ...editData.direccion, ciudad: e.target.value } })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-xs uppercase text-gray-400">C.P.</Label>
                      <Input
                        value={editData.direccion.codigoPostal}
                        onChange={(e) => setEditData({ ...editData, direccion: { ...editData.direccion, codigoPostal: e.target.value } })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase text-gray-400">Notas Internas / Administrativas</Label>
                    <textarea
                      className="w-full p-3 border rounded-xl min-h-[100px] text-sm font-medium"
                      placeholder="Añadir notas sobre el envío, incidencias..."
                      value={editData.notas}
                      onChange={(e) => setEditData({ ...editData, notas: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsEditing(false)}>
                      CANCELAR
                    </Button>
                    <Button className="flex-1 h-12 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveEdit}>
                      GUARDAR CAMBIOS
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
