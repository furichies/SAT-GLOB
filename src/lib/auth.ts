import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciales incompletas')
        }

        const user = await db.usuario.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('Usuario o contraseña incorrectos')
        }

        if (!user.activo) {
          throw new Error('Usuario inactivo')
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          throw new Error('Usuario o contraseña incorrectos')
        }

        // Update last access
        await db.usuario.update({
          where: { id: user.id },
          data: { ultimoAcceso: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.rol,
          image: null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Si el token está vacío o corrupto, retornar sesión vacía
      if (!token || !token.id) {
        return session
      }

      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    }
  },
  events: {
    async signOut({ token }) {
      // Limpiar cualquier dato relacionado con la sesión
      console.log('Usuario desconectado:', token?.id)
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token-sat1475`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https')
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}
