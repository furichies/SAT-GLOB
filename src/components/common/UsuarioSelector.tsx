'use client'

import { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Usuario {
    id: string
    nombre: string
    apellidos?: string
    email: string
    telefono?: string
    direccion?: string
    codigoPostal?: string
    ciudad?: string
    dni?: string
    rol?: string
}

interface UsuarioSelectorProps {
    value: string
    onChange: (usuario: Usuario) => void
    disabled?: boolean
    filtroRol?: 'cliente' | 'tecnico' | 'admin' | 'superadmin'
    placeholder?: string
    permitirCrear?: boolean
}

export function UsuarioSelector({
    value,
    onChange,
    disabled = false,
    filtroRol,
    placeholder = "Seleccionar usuario...",
    permitirCrear = false
}: UsuarioSelectorProps) {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newUsuario, setNewUsuario] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        direccion: '',
        codigoPostal: '',
        ciudad: '',
        dni: ''
    })
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        fetchUsuarios()
    }, [filtroRol])

    useEffect(() => {
        if (searchTerm) {
            const filtered = usuarios.filter(u =>
                u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.codigoPostal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.dni?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredUsuarios(filtered)
        } else {
            setFilteredUsuarios(usuarios)
        }
    }, [searchTerm, usuarios])

    const fetchUsuarios = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filtroRol) params.append('rol', filtroRol)

            const res = await fetch(`/api/admin/usuarios?${params}`)
            if (res.ok) {
                const data = await res.json()
                setUsuarios(data.data?.usuarios || [])
                setFilteredUsuarios(data.data?.usuarios || [])
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUsuario = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)
        try {
            const res = await fetch('/api/admin/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newUsuario,
                    rol: filtroRol || 'cliente'
                })
            })

            if (res.ok) {
                const data = await res.json()
                const creado = data.data.usuario
                onChange(creado)
                setIsCreateDialogOpen(false)
                setNewUsuario({
                    nombre: '',
                    apellidos: '',
                    email: '',
                    telefono: '',
                    direccion: '',
                    codigoPostal: '',
                    ciudad: '',
                    dni: ''
                })
                await fetchUsuarios()
            } else {
                const errorData = await res.json()
                alert('Error al crear usuario: ' + (errorData.error || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error al crear usuario:', error)
            alert('Error al crear usuario')
        } finally {
            setIsCreating(false)
        }
    }

    const handleValueChange = (id: string) => {
        const usuario = usuarios.find(u => u.id === id)
        if (usuario) {
            onChange(usuario)
        }
    }

    return (
        <div className="space-y-2">
            <Select
                value={value}
                onValueChange={handleValueChange}
                disabled={disabled || loading}
            >
                <SelectTrigger>
                    <SelectValue placeholder={loading ? "Cargando..." : placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <div className="p-2 sticky top-0 bg-white border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nombre, email o código postal..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    {filteredUsuarios.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id}>
                            <div className="flex flex-col">
                                <span className="font-medium">
                                    {usuario.nombre} {usuario.apellidos || ''}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {usuario.email} {usuario.telefono && `| ${usuario.telefono}`}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                    {filteredUsuarios.length === 0 && !loading && (
                        <div className="p-3 text-center text-sm text-gray-500">
                            No se encontraron usuarios
                        </div>
                    )}
                    {permitirCrear && (
                        <>
                            <div className="border-t my-2" />
                            <div
                                className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsCreateDialogOpen(true)
                                }}
                            >
                                <div className="flex items-center gap-2 text-sm text-primary">
                                    <UserPlus className="h-4 w-4" />
                                    Crear nuevo usuario
                                </div>
                            </div>
                        </>
                    )}
                </SelectContent>
            </Select>

            {permitirCrear && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateUsuario} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Nombre *</Label>
                                    <Input
                                        required
                                        value={newUsuario.nombre}
                                        onChange={(e) => setNewUsuario({ ...newUsuario, nombre: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Apellidos</Label>
                                    <Input
                                        value={newUsuario.apellidos}
                                        onChange={(e) => setNewUsuario({ ...newUsuario, apellidos: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>DNI / NIF</Label>
                                <Input
                                    value={newUsuario.dni}
                                    onChange={(e) => setNewUsuario({ ...newUsuario, dni: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    required
                                    value={newUsuario.email}
                                    onChange={(e) => setNewUsuario({ ...newUsuario, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Teléfono</Label>
                                    <Input
                                        value={newUsuario.telefono}
                                        onChange={(e) => setNewUsuario({ ...newUsuario, telefono: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Código Postal</Label>
                                    <Input
                                        value={newUsuario.codigoPostal}
                                        onChange={(e) => setNewUsuario({ ...newUsuario, codigoPostal: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Dirección</Label>
                                <Input
                                    value={newUsuario.direccion}
                                    onChange={(e) => setNewUsuario({ ...newUsuario, direccion: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Ciudad</Label>
                                <Input
                                    value={newUsuario.ciudad}
                                    onChange={(e) => setNewUsuario({ ...newUsuario, ciudad: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                    disabled={isCreating}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? 'Creando...' : 'Crear'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
