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
    const { isAuthenticated, isLoading: authLoading, user } = useAuth()
    const { hasAnyRole: isStaff, isLoading: roleLoading } = useIsStaff()
    const [showRestricted, setShowRestricted] = useState(false)

    console.log('[AdminLayout] user?.role:', user?.role, 'isStaff:', isStaff, 'authLoading:', authLoading, 'roleLoading:', roleLoading)

    useEffect(() => {
        if (authLoading || roleLoading) return
        
        if (!isAuthenticated) {
            router.push('/auth/login')
        } else if (isAuthenticated && !isStaff) {
            setShowRestricted(true)
            const timer = setTimeout(() => router.push('/'), 2000)
            return () => clearTimeout(timer)
        }
    }, [isAuthenticated, isStaff, authLoading, roleLoading, router])

    if (authLoading || roleLoading) {
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
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                        <Lock className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-black">Área Reservada</h1>
                    <p className="text-gray-600">No tienes permisos suficientes</p>
                </div>
            </div>
        )
    }

    if (isAuthenticated && isStaff) {
        return <>{children}</>
    }

    return null
}
