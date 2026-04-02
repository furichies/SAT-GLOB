'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useIsStaff } from '@/hooks/use-auth'
import { Loader2, Lock } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()
    const { hasAnyRole: isStaff, isLoading: roleLoading } = useIsStaff()
    const [showRestricted, setShowRestricted] = useState(false)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login')
        } else if (!isLoading && isAuthenticated && !roleLoading && !isStaff) {
            setShowRestricted(true)
            const timer = setTimeout(() => {
                router.push('/')
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [isAuthenticated, isLoading, isStaff, roleLoading, router])

    if (isLoading || roleLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-gray-500">Verificando credenciales...</p>
                </div>
            </div>
        )
    }

    if (showRestricted) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                        <Lock className="h-10 w-10 text-red-600" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Área Reservada</h1>
                        <p className="text-gray-600 font-medium">
                            No tienes permisos suficientes para acceder a este panel. Serás redirigido en breve...
                        </p>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 animate-progress origin-left" style={{ animationDuration: '2s' }} />
                    </div>
                </div>
            </div>
        )
    }

    if (isAuthenticated && isStaff) {
        return <>{children}</>
    }

    return null
}
