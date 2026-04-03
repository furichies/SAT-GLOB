import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Rutas exclusivas para admin/tecnico/superadmin
    const adminPaths = ['/admin']
    const isAdminRoute = adminPaths.some(p => path.startsWith(p))

    if (isAdminRoute) {
      const userRole = token?.role as string
      
      if (userRole !== 'admin' && userRole !== 'tecnico' && userRole !== 'superadmin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/mi-cuenta/:path*',
    '/mis-pedidos/:path*',
  ],
}
