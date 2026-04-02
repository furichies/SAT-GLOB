'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    useEffect(() => {
        // Si el error es relacionado con JWT, redirigir automáticamente a limpiar cookies
        if (error === 'JWT_SESSION_ERROR' || error === 'SessionRequired') {
            router.push('/auth/clear-session')
        }
    }, [error, router])

    const getErrorMessage = () => {
        switch (error) {
            case 'Configuration':
                return 'Hay un problema con la configuración del servidor.'
            case 'AccessDenied':
                return 'No tienes permiso para acceder a este recurso.'
            case 'Verification':
                return 'El token de verificación ha expirado o ya fue usado.'
            case 'OAuthSignin':
            case 'OAuthCallback':
            case 'OAuthCreateAccount':
            case 'EmailCreateAccount':
            case 'Callback':
                return 'Error al intentar iniciar sesión. Por favor, intenta nuevamente.'
            case 'OAuthAccountNotLinked':
                return 'Esta cuenta ya está vinculada con otro proveedor.'
            case 'EmailSignin':
                return 'No se pudo enviar el correo de inicio de sesión.'
            case 'CredentialsSignin':
                return 'Credenciales incorrectas. Verifica tu email y contraseña.'
            case 'SessionRequired':
                return 'Debes iniciar sesión para acceder a esta página.'
            default:
                return 'Ha ocurrido un error de autenticación.'
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle>Error de Autenticación</CardTitle>
                    <CardDescription>
                        {getErrorMessage()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200">
                        <p className="font-medium mb-1">Código de error:</p>
                        <p className="text-xs font-mono">{error || 'UNKNOWN'}</p>
                    </div>

                    <div className="space-y-2">
                        <Button
                            onClick={() => router.push('/auth/login')}
                            className="w-full"
                        >
                            Volver al Login
                        </Button>
                        <Button
                            onClick={() => router.push('/auth/clear-session')}
                            variant="outline"
                            className="w-full"
                        >
                            Limpiar Sesión y Reintentar
                        </Button>
                    </div>

                    <div className="text-xs text-center text-slate-600 dark:text-slate-400">
                        <p>Si el problema persiste, contacta al administrador del sistema.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
