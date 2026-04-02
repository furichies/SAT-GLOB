'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
    Search,
    Users,
    Mail,
    Phone,
    MapPin,
    Calendar,
    MoreHorizontal,
    Shield,
    ShoppingBag,
    Plus,
    Trash,
    Loader2
} from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import Link from 'next/link'

export default function AdminClientesPage() {
    const [busqueda, setBusqueda] = useState('')
    const [clientes, setClientes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showNuevoClienteModal, setShowNuevoClienteModal] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [nuevoCliente, setNuevoCliente] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        password: ''
    })

    const fetchClientes = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin_clientes?busqueda=${busqueda}`)
            const data = await res.json()
            if (data.success) {
                setClientes(data.data.clientes)
            } else {
                toast.error(data.error || "Error al cargar clientes")
            }
        } catch (error) {
            console.error('Error fetching admin clientes:', error)
            toast.error("Error de conexión")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        // Debounce simple para la búsqueda
        const timeoutId = setTimeout(() => {
            fetchClientes()
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [busqueda])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNuevoCliente(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleCrearCliente = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)

        if (!nuevoCliente.nombre || !nuevoCliente.email) {
            toast.error("Nombre y Email son obligatorios")
            setIsCreating(false)
            return
        }

        try {
            const res = await fetch('/api/admin_clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoCliente)
            })
            const data = await res.json()

            if (data.success) {
                toast.success("Cliente creado correctamente")
                setShowNuevoClienteModal(false)
                setNuevoCliente({
                    nombre: '',
                    apellidos: '',
                    email: '',
                    telefono: '',
                    direccion: '',
                    ciudad: '',
                    provincia: '',
                    password: ''
                })
                fetchClientes()
            } else {
                toast.error(data.error || "Error al crear cliente")
            }
        } catch (error) {
            console.error('Error creating client:', error)
            toast.error("Error al crear cliente")
        } finally {
            setIsCreating(false)
        }
    }

    const handleEliminarCliente = async (id: string, nombre: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar al cliente ${nombre}? Esta acción no se puede deshacer.`)) {
            return
        }

        try {
            const res = await fetch(`/api/admin_clientes?id=${id}`, {
                method: 'DELETE'
            })
            const data = await res.json()

            if (data.success) {
                toast.success("Cliente eliminado correctamente")
                fetchClientes()
            } else {
                toast.error(data.error || "Error al eliminar cliente")
            }
        } catch (error) {
            console.error('Error deleting client:', error)
            toast.error("Error al eliminar cliente")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 lg:ml-64 p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 tracking-tight">Gestión de Clientes</h1>
                            <p className="text-gray-600">
                                Consulta y administra la información de los usuarios registrados.
                            </p>
                        </div>
                        <Button onClick={() => setShowNuevoClienteModal(true)} className="gap-2 bg-primary text-white hover:bg-primary/90">
                            <Plus className="h-4 w-4" />
                            Nuevo Cliente
                        </Button>
                    </div>

                    <div className="bg-white border p-6 rounded-2xl mb-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por nombre, email o teléfono..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="pl-10 h-10 rounded-xl"
                                />
                            </div>
                            <div className="text-sm text-gray-500 font-medium">
                                {clientes.length} clientes encontrados
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        {isLoading && (
                            <div className="p-20 flex flex-col items-center justify-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <p className="text-sm font-bold text-gray-400">CARGANDO CLIENTES...</p>
                            </div>
                        )}

                        {!isLoading && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-gray-50/50">
                                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Contacto</th>
                                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Ubicación</th>
                                            <th className="text-center p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Pedidos</th>
                                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Estado</th>
                                            <th className="text-right p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {clientes.map((cliente) => (
                                            <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                            {cliente.nombre.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{cliente.nombre} {cliente.apellidos}</div>
                                                            <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Reg: {new Date(cliente.fechaRegistro).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail className="h-3 w-3 text-gray-400" />
                                                            {cliente.email}
                                                        </div>
                                                        {cliente.telefono && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Phone className="h-3 w-3 text-gray-400" />
                                                                {cliente.telefono}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {cliente.ciudad || cliente.provincia ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <MapPin className="h-3 w-3 text-gray-400" />
                                                            <span>
                                                                {cliente.ciudad}{cliente.ciudad && cliente.provincia ? ', ' : ''}{cliente.provincia}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No especificada</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Badge variant="outline" className="gap-1 font-mono">
                                                        <ShoppingBag className="h-3 w-3" />
                                                        {cliente.totalPedidos || 0}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    {cliente.activo ? (
                                                        <Badge className="bg-green-100 text-green-700 border-none">Activo</Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Inactivo</Badge>
                                                    )}
                                                    <div className="text-[10px] text-gray-400 mt-1">
                                                        {cliente.ultimoAcceso ? `Visto: ${new Date(cliente.ultimoAcceso).toLocaleDateString()}` : 'Nunca accedió'}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem className="gap-2" asChild>
                                                                <Link href={`/admin/pedidos?clienteId=${cliente.id}`}>
                                                                    <ShoppingBag className="h-4 w-4" /> Ver Pedidos
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2 text-red-600" onClick={() => handleEliminarCliente(cliente.id, cliente.nombre)}>
                                                                <Trash className="h-4 w-4" /> Eliminar Cliente
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))}
                                        {clientes.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                                    No se encontraron clientes con los criterios de búsqueda.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal Crear Cliente */}
            <Dialog open={showNuevoClienteModal} onOpenChange={setShowNuevoClienteModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                        <DialogDescription>
                            Introduce los datos del nuevo cliente. Se le asignará una contraseña por defecto si no se especifica.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCrearCliente}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre *</Label>
                                    <Input id="nombre" name="nombre" value={nuevoCliente.nombre} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellidos">Apellidos</Label>
                                    <Input id="apellidos" name="apellidos" value={nuevoCliente.apellidos} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input id="email" name="email" type="email" value={nuevoCliente.email} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input id="telefono" name="telefono" value={nuevoCliente.telefono} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="direccion">Dirección</Label>
                                <Input id="direccion" name="direccion" value={nuevoCliente.direccion} onChange={handleInputChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ciudad">Ciudad</Label>
                                    <Input id="ciudad" name="ciudad" value={nuevoCliente.ciudad} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="provincia">Provincia</Label>
                                    <Input id="provincia" name="provincia" value={nuevoCliente.provincia} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña (Opcional - Default: 123456)</Label>
                                <Input id="password" name="password" type="password" value={nuevoCliente.password} onChange={handleInputChange} placeholder="******" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowNuevoClienteModal(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Cliente
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
