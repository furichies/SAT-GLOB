import { UserRole } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Get current session from server
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions)
}

/**
 * Get current user from server
 */
export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getCurrentSession()
  return !!session?.user
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole) {
  const user = await getCurrentUser()
  return user?.role === role
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: UserRole[]) {
  const user = await getCurrentUser()
  return user?.role ? roles.includes(user.role) : false
}

/**
 * Check if user is admin or superadmin
 */
export async function isAdmin() {
  return await hasAnyRole([UserRole.admin, UserRole.superadmin])
}

/**
 * Check if user is tecnico, admin or superadmin
 */
export async function isStaff() {
  return await hasAnyRole([UserRole.tecnico, UserRole.admin, UserRole.superadmin])
}

/**
 * Require authentication - throw error if not authenticated
 */
export async function requireAuth() {
  const session = await getCurrentSession()
  if (!session?.user) {
    throw new Error('No autenticado')
  }
  return session.user
}

/**
 * Require specific role - throw error if user doesn't have role
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error('Permisos insuficientes')
  }
  return user
}

/**
 * Require any of the specified roles
 */
export async function requireAnyRole(roles: UserRole[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    throw new Error('Permisos insuficientes')
  }
  return user
}

/**
 * Require admin or superadmin
 */
export async function requireAdmin() {
  return await requireAnyRole([UserRole.admin, UserRole.superadmin])
}

/**
 * Require staff (tecnico, admin or superadmin)
 */
export async function requireStaff() {
  return await requireAnyRole([UserRole.tecnico, UserRole.admin, UserRole.superadmin])
}
