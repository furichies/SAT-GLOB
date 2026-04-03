import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string
    
    if (role !== 'admin' && role !== 'tecnico' && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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
