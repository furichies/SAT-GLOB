'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function ClearSessionPage() {
    const router = useRouter()
    const [status, setStatus] = useState<'clearing' | 'success' | 'error'>('clearing')
    const [countdown, setCountdown] = useState(3)

    useEffect(() => {
        const clearCookies = async () => {
            try {
                const response = await fetch('/api/auth/clear-cookies')
                const data = await response.json()

                if (data.success) {
                    setStatus('success')

                    // Countdown antes de redirigir
                    const interval = setInterval(() => {
                        setCountdown((prev) => {
                            if (prev <= 1) {
                                clearInterval(interval)
                                router.push('/auth/login')
                                return 0
                            }
                            return prev - 1
                        })
                    }, 1000)
                } else {
                    setStatus('error')
                }
            } catch (error) {
                console.error('Error limpiando cookies:', error)
                setStatus('error')
            }
        }

        clearCookies()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        {status === 'clearing' && <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />}
                        {status === 'success' && <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />}
                        {status === 'error' && <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />}
                    </div>
                    <CardTitle>
                        {status === 'clearing' && 'Limpiando sesión...'}
                        {status === 'success' && '¡Sesión limpiada!'}
                        {status === 'error' && 'Error al limpiar'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'clearing' && 'Eliminando cookies de sesión corruptas'}
                        {status === 'success' && `Redirigiendo al login en ${countdown}...`}
                        {status === 'error' && 'No se pudieron eliminar las cookies'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'success' && (
                        <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-800 dark:text-green-200">
                            <p className="font-medium mb-1">✓ Cookies eliminadas correctamente</p>
                            <p className="text-xs">Ahora puedes iniciar sesión sin problemas.</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200">
                                <p className="font-medium mb-1">✗ Error al limpiar cookies</p>
                                <p className="text-xs">Por favor, intenta limpiar las cookies manualmente desde tu navegador.</p>
                            </div>
                            <Button
                                onClick={() => router.push('/auth/login')}
                                className="w-full"
                            >
                                Ir al Login
                            </Button>
                        </>
                    )}

                    {status === 'clearing' && (
                        <div className="space-y-2">
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 dark:bg-blue-400 animate-pulse" style={{ width: '60%' }} />
                            </div>
                            <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                                Esto solo tomará un momento...
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
