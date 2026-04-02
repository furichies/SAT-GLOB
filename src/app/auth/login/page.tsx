'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingBag, AlertCircle, Lock, ArrowRight } from 'lucide-react'
import { Notification } from '@/components/ui/notification'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [formData, setFormData] = useState({

    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      console.log('Login result:', result)

      if (result?.ok) {
        setSuccess(true)
        // Usar window.location para asegurar la redirección
        setTimeout(() => {
          window.location.href = callbackUrl
        }, 1500)
      } else {
        setError(result?.error || 'Error al iniciar sesión. Por favor, verifica tus credenciales.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Error de conexión con el servidor. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center p-4">
        <Notification
          message="¡Login exitoso! Redirigiendo a la página principal..."
          type="success"
          duration={2000}
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
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <ShoppingBag className="h-12 w-12 text-primary" />
            <span className="text-3xl font-bold text-primary">Micro1475</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@microinfo.es"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
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
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded"
                  />
                  <span>Recordarme</span>
                </label>
                <Link href="/auth/forgot-password" className="text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/register" className="text-primary font-medium hover:underline">
                  Regístrate aquí
                </Link>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Usuarios de prueba</h4>
                <div className="space-y-1 text-xs text-blue-800">
                  <p><strong>Email:</strong> cliente@microinfo.es</p>
                  <p><strong>Contraseña:</strong> cliente123</p>
                  <p className="text-blue-600 mt-1">O prueba con tu propio email</p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
