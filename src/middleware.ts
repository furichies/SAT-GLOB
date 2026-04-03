import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    
    console.log('[Middleware] Path:', path, 'Has token:', !!token, 'Role:', token?.role)
    
    // Just verify user is authenticated, role check is handled in layout
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + path, req.url))
    }
    
    return NextResponse.next()
  },
  {
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
