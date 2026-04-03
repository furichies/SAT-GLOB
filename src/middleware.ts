import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    
    console.log('[Middleware] Path:', path, 'Token role:', token?.role)
    
    // Allow access to /admin but let the layout handle the role check
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('[Middleware] Authorized:', !!token)
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
  ],
}
