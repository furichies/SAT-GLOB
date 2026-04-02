'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Mail, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setNewPassword('')

        try {
            const res = await fetch('/api/auth/reset-password-prototype', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await res.json()

            if (res.ok && data.success) {
                setNewPassword(data.newPassword)
                setIsSubmitted(true)
            } else {
                setError(data.error || 'Error al procesar la solicitud')
            }
        } catch (e) {
            setError('Error de conexión')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">

                {/* Prototipo Warning Banner */}
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-900 p-4 rounded shadow-sm" role="alert">
                    <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 mr-3 text-amber-600" />
                        <div>
                            <p className="font-bold text-sm uppercase tracking-wide">Prototipo - Reseteo Directo</p>
                            <p className="text-xs mt-1">La contraseña será cambiada inmediatamente y mostrada en pantalla. Sin envío de emails.</p>
                        </div>
                    </div>
                </div>

                <Card className="border-t-4 border-t-primary shadow-xl">
                    <CardHeader className="text-center space-y-2 pb-6">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                            <Lock className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
                        <CardDescription>
                            Reseteo inmediato de credenciales.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded bg-red-100 text-red-800 text-sm font-medium">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-medium">Correo Electrónico</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="usuario@ejemplo.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full font-bold h-11"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Reseteando...' : 'Resetear Contraseña Ahora'}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                <div className="flex justify-center text-green-500 mb-4">
                                    <CheckCircle className="h-16 w-16" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">¡Contraseña Actualizada!</h3>
                                <p className="text-sm text-gray-500">
                                    La contraseña para <strong>{email}</strong> ha sido cambiada.
                                </p>
                                <div className="pt-4">
                                    <div className="bg-slate-100 p-3 rounded text-left mb-4 border space-y-2">
                                        <div className="text-xs font-mono text-slate-500 border-b pb-2 mb-2">
                                            [DEBUG_INFO]<br />
                                            To: {email}<br />
                                            Subject: Reset Password<br />
                                            Action: UPDATE_DB_SUCCESS
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground uppercase font-bold">Tu nueva contraseña es:</p>
                                            <p className="text-xl font-mono font-bold text-primary tracking-wider select-all bg-white p-2 rounded border mt-1">
                                                {newPassword}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="default"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href="/auth/login">Ir a Iniciar Sesión</Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => { setIsSubmitted(false); setEmail(''); setNewPassword('') }}
                                >
                                    Resetear otra cuenta
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="justify-center border-t py-4 bg-muted/10">
                        <Link href="/auth/login" className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver al inicio de sesión
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
