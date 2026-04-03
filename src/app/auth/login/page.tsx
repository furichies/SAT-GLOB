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
import { signIn, useSession } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, update } = useSession()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'

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

      if (result?.ok) {
        setSuccess(true)
        // Force refresh session and check role
        await update()
        setTimeout(async () => {
          const { data: refreshedSession } = await fetch('/api/auth/session').then(r => r.json())
          const userRole = refreshedSession?.user?.role
          if (userRole === 'admin' || userRole === 'superadmin' || userRole === 'tecnico') {
            window.location.href = '/admin/dashboard'
          } else {
            window.location.href = callbackUrl
          }
        }, 500)
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
          message="¡Login exitoso! Redirigiendo..."
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Iniciar Sesión
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">¿No tienes cuenta? </span>
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Regístrate
              </Link>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Cuentas de prueba:</p>
              <p>Admin: superadmin@microinfo.es / super123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
