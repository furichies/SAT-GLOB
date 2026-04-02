import { NextResponse } from 'next/server'

/**
 * API endpoint para limpiar cookies de sesión corruptas
 * Útil cuando hay errores de descifrado JWT por cambios en NEXTAUTH_SECRET
 */
export async function GET() {
    const response = NextResponse.json({
        success: true,
        message: 'Cookies de sesión eliminadas. Por favor, inicia sesión nuevamente.'
    })

    // Eliminar todas las cookies de next-auth
    response.cookies.delete('next-auth.session-token-sat1475')
    response.cookies.delete('next-auth.session-token')
    response.cookies.delete('__Secure-next-auth.session-token')
    response.cookies.delete('next-auth.csrf-token')
    response.cookies.delete('__Host-next-auth.csrf-token')
    response.cookies.delete('next-auth.callback-url')
    response.cookies.delete('__Secure-next-auth.callback-url')

    return response
}
