'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingBag, ArrowRight, User, AlertCircle } from 'lucide-react'
import { Notification } from '@/components/ui/notification'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    passwordConfirm: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setFieldErrors({})
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      } else {
        if (data.errors) {
          setFieldErrors(data.errors)
        }
        setError(data.error || 'Error al registrar usuario')
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center p-4">
        <Notification
          message="¡Registro exitoso! Tu cuenta ha sido creada. Redirigiendo a la página de login..."
          type="success"
          duration={3000}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center p-4">
      {error && (
        <Notification
          message={error}
          type="error"
          onClose={() => setError('')}
          duration={5000}
        />
      )}

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <ShoppingBag className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-primary">Micro1475</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <User className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Únete a Micro1475 y empieza a comprar
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.nombre && (
                  <p className="text-xs text-destructive">{fieldErrors.nombre[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  type="text"
                  placeholder="Pérez"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.apellidos && (
                  <p className="text-xs text-destructive">{fieldErrors.apellidos[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan.perez@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {fieldErrors.password && (
                  <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirmar Contraseña *</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="•••••••"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {fieldErrors.passwordConfirm && (
                  <p className="text-xs text-destructive">{fieldErrors.passwordConfirm[0]}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" className="text-primary font-medium hover:underline">
                  Inicia sesión aquí
                  <ArrowRight className="inline h-4 w-4 ml-1" />
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
