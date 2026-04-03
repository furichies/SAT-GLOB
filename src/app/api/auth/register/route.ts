import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validations/auth'
import { UserRole } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error de validación',
          errors: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { email, password, nombre, apellidos, telefono, direccion, codigoPostal, ciudad, provincia } = validation.data

    // Check if user already exists
    const existingUser = await db.usuario.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'El email ya está registrado'
        },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hash(password, 12)

    // Create user
    const user = await db.usuario.create({
      data: {
        email,
        passwordHash,
        nombre,
        apellidos,
        telefono,
        direccion,
        codigoPostal,
        ciudad,
        provincia
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario registrado correctamente',
        data: {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellidos: user.apellidos,
            rol: user.rol
          }
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al registrar usuario: ' + (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    )
  }
}
