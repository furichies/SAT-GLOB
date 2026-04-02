'use client'

import { signIn, signOut, getSession } from 'next-auth/react'

/**
 * Login with credentials
 */
export async function login(email: string, password: string) {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false
  })

  if (result?.error) {
    throw new Error(result.error)
  }

  return result
}

/**
 * Logout current user
 */
export async function logout() {
  await signOut({ redirect: true, callbackUrl: '/' })
}

/**
 * Get current session
 */
export async function getAuthSession() {
  return await getSession()
}

/**
 * Check if user is authenticated
 */
export async function checkAuth() {
  const session = await getAuthSession()
  return !!session?.user
}
