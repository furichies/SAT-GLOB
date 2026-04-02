'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CreateAdminPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nombre, setNombre] = useState('')
    const [rol, setRol] = useState('admin')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const res = await fetch('/api/create-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, nombre, rol })
            })

            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: `Usuario creado: ${data.user.email} (${data.user.rol})` })
                setEmail('')
                setPassword('')
                setNombre('')
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al crear usuario' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' })
        } finally {
            setLoading(false)
        }
    }

    const createPreset = async (presetEmail: string, presetPassword: string, presetNombre: string, presetRol: string) => {
        setLoading(true)
        setMessage(null)

        try {
            const res = await fetch('/api/create-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: presetEmail,
                    password: presetPassword,
                    nombre: presetNombre,
                    rol: presetRol
                })
            })

            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: `✅ ${presetNombre} creado: ${presetEmail} / ${presetPassword}` })
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al crear usuario' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-muted/30 py-12">
            <div className="container max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Crear Usuario Admin/Técnico</CardTitle>
                        <CardDescription>
                            Herramienta de desarrollo para crear usuarios con roles administrativos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Botones rápidos */}
                        <div className="space-y-3">
                            <Label>Crear usuarios predefinidos:</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => createPreset('admin@microinfo.es', 'admin123', 'Admin Principal', 'admin')}
                                    disabled={loading}
                                >
                                    👤 Admin Principal
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => createPreset('tecnico@microinfo.es', 'tecnico123', 'Carlos García', 'tecnico')}
                                    disabled={loading}
                                >
                                    🔧 Técnico
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => createPreset('superadmin@microinfo.es', 'super123', 'Super Admin', 'superadmin')}
                                    disabled={loading}
                                >
                                    ⚡ Super Admin
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => createPreset('cliente@test.com', 'cliente123', 'Cliente Test', 'cliente')}
                                    disabled={loading}
                                >
                                    👥 Cliente Test
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    O crear personalizado
                                </span>
                            </div>
                        </div>

                        {/* Formulario personalizado */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="usuario@microinfo.es"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Contraseña"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Nombre del usuario"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rol">Rol</Label>
                                <Select value={rol} onValueChange={setRol} disabled={loading}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cliente">Cliente</SelectItem>
                                        <SelectItem value="tecnico">Técnico</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="superadmin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear Usuario'}
                            </Button>
                        </form>

                        {/* Mensaje de resultado */}
                        {message && (
                            <div className={`p-4 rounded-lg ${message.type === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Información */}
                        <div className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-sm">
                            <p className="font-semibold mb-2">💡 Credenciales predefinidas:</p>
                            <ul className="space-y-1 text-xs">
                                <li>• <strong>Admin:</strong> admin@microinfo.es / admin123</li>
                                <li>• <strong>Técnico:</strong> tecnico@microinfo.es / tecnico123</li>
                                <li>• <strong>Super Admin:</strong> superadmin@microinfo.es / super123</li>
                                <li>• <strong>Cliente:</strong> cliente@test.com / cliente123</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
