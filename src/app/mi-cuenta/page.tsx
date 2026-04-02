'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingBag, User, MapPin, Phone, Mail, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { signOut, useSession } from 'next-auth/react'

interface UserProfile {
  nombre: string
  apellidos: string
  email: string
  telefono: string
  direccion: string
  codigoPostal: string
  ciudad: string
  provincia: string
}

export default function MiCuentaPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [datos, setDatos] = useState<UserProfile>({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    provincia: ''
  })

  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/profile')
        const data = await res.json()

        if (data.success && data.data.user) {
          setDatos({
            nombre: data.data.user.nombre || '',
            apellidos: data.data.user.apellidos || '',
            email: data.data.user.email || '',
            telefono: data.data.user.telefono || '',
            direccion: data.data.user.direccion || '',
            codigoPostal: data.data.user.codigoPostal || '',
            ciudad: data.data.user.ciudad || '',
            provincia: data.data.user.provincia || ''
          })
        } else {
          toast.error('No se pudieron cargar los datos del perfil')
        }
      } catch (error) {
        toast.error('Error al cargar el perfil')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchProfile()
    } else {
      // If no session locally yet, wait a bit or let middleware handle it. 
      // But if session is null/loading, useEffect dependency will trigger when loaded.
    }
  }, [session])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Remove email from payload as it shouldn't be updated here
      const { email, ...updateData } = datos

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Perfil actualizado correctamente')
        setIsEditing(false)
      } else {
        if (data.errors) {
          // Show first validation error
          const firstError = Object.values(data.errors).flat()[0] as string
          toast.error(firstError || 'Error de validación')
        } else {
          toast.error(data.error || 'Error al guardar cambios')
        }
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 8) { // Updated to match schema
      toast.error('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        })
      })

      console.log('ChangePassword Status:', res.status, res.statusText)

      const data = await res.json()
      console.log('ChangePassword Data:', JSON.stringify(data, null, 2))

      if (data.success) {
        toast.success('Contraseña actualizada correctamente')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        console.error('Password change error:', data)
        if (data.errors) {
          const firstError = Object.values(data.errors).flat()[0] as string
          toast.error(firstError || 'Error de validación')
        } else {
          toast.error(data.error || 'Error al cambiar la contraseña')
        }
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Error de conexión con el servidor')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reloading the page is a safe bet for a full revert:
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Menú lateral */}
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start bg-white shadow-sm hover:bg-gray-50">
              <User className="h-4 w-4 mr-2" />
              Mis Datos
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-gray-50">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Mis Pedidos
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-gray-50">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Mis Tickets
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Cerrar Sesión
            </Button>
          </div>

          {/* Columna Derecha: Datos personales */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Datos Personales</CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Editar
                    </Button>
                  ) : (
                    <div className='flex gap-2'>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={datos.nombre}
                      onChange={(e) => isEditing && setDatos({ ...datos, nombre: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellidos</Label>
                    <Input
                      value={datos.apellidos}
                      onChange={(e) => isEditing && setDatos({ ...datos, apellidos: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={datos.email}
                      disabled
                      type="email"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
                </div>

                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={datos.telefono}
                      onChange={(e) => isEditing && setDatos({ ...datos, telefono: e.target.value })}
                      disabled={!isEditing}
                      type="tel"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Contraseña Actual</Label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nueva Contraseña</Label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Nueva Contraseña</Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Actualizar Contraseña
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dirección de Envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={datos.direccion}
                      onChange={(e) => isEditing && setDatos({ ...datos, direccion: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Código Postal</Label>
                    <Input
                      value={datos.codigoPostal}
                      onChange={(e) => isEditing && setDatos({ ...datos, codigoPostal: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input
                      value={datos.ciudad}
                      onChange={(e) => isEditing && setDatos({ ...datos, ciudad: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Provincia</Label>
                    <Input
                      value={datos.provincia}
                      onChange={(e) => isEditing && setDatos({ ...datos, provincia: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
