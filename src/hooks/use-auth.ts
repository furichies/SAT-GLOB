'use client'

import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status, update } = useSession()

  return {
    user: session?.user,
    session,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    update
  }
}

export function useHasRole(role: string) {
  const { user, isLoading } = useAuth()
  return {
    hasRole: user?.role === role,
    isLoading
  }
}

export function useHasAnyRole(roles: string[]) {
  const { user, isLoading } = useAuth()
  return {
    hasAnyRole: user?.role ? roles.includes(user.role) : false,
    isLoading
  }
}

export function useIsAdmin() {
  return useHasAnyRole(['admin', 'superadmin'])
}

export function useIsStaff() {
  return useHasAnyRole(['tecnico', 'admin', 'superadmin'])
}

export function useIsCliente() {
  return useHasRole('cliente')
}

export function useIsTecnico() {
  return useHasRole('tecnico')
}
