'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'

export function useAuth() {
  const { data: session, status, update } = useSession()

  console.log('[useAuth] Session:', session)
  console.log('[useAuth] Status:', status)

  return {
    user: session?.user,
    session,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    update
  }
}

export function useHasRole(role: UserRole) {
  const { user, isLoading } = useAuth()
  console.log('[useHasRole] user:', user, 'role:', role)
  return {
    hasRole: user?.role === role,
    isLoading
  }
}

export function useHasAnyRole(roles: UserRole[]) {
  const { user, isLoading } = useAuth()
  console.log('[useHasAnyRole] user:', user, 'roles:', roles)
  console.log('[useHasAnyRole] user?.role:', user?.role)
  console.log('[useHasAnyRole] includes:', user?.role ? roles.includes(user.role) : false)
  return {
    hasAnyRole: user?.role ? roles.includes(user.role) : false,
    isLoading
  }
}

export function useIsAdmin() {
  return useHasAnyRole([UserRole.admin, UserRole.superadmin])
}

export function useIsStaff() {
  return useHasAnyRole([UserRole.tecnico, UserRole.admin, UserRole.superadmin])
}

export function useIsCliente() {
  return useHasRole(UserRole.cliente)
}

export function useIsTecnico() {
  return useHasRole(UserRole.tecnico)
}
