'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'

/**
 * Hook to get current session and user
 */
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

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: UserRole) {
  const { user, isLoading } = useAuth()
  return {
    hasRole: user?.role === role,
    isLoading
  }
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasAnyRole(roles: UserRole[]) {
  const { user, isLoading } = useAuth()
  return {
    hasAnyRole: user?.role ? roles.includes(user.role) : false,
    isLoading
  }
}

/**
 * Hook to check if user is admin or superadmin
 */
export function useIsAdmin() {
  return useHasAnyRole([UserRole.admin, UserRole.superadmin])
}

/**
 * Hook to check if user is staff (tecnico, admin or superadmin)
 */
export function useIsStaff() {
  return useHasAnyRole([UserRole.tecnico, UserRole.admin, UserRole.superadmin])
}

/**
 * Hook to check if user is cliente
 */
export function useIsCliente() {
  return useHasRole(UserRole.cliente)
}

/**
 * Hook to check if user is tecnico
 */
export function useIsTecnico() {
  return useHasRole(UserRole.tecnico)
}
