import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateProfileSchema } from '@/lib/validations/auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado'
        },
        { status: 401 }
      )
    }

    const user = await db.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidos: true,
        telefono: true,
        direccion: true,
        codigoPostal: true,
        ciudad: true,
        provincia: true,
        rol: true,
        activo: true,
        fechaRegistro: true,
        ultimoAcceso: true
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener perfil'
      },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado'
        },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Validate input
    const validation = updateProfileSchema.safeParse(body)
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

    const user = await db.usuario.update({
      where: { id: session.user.id },
      data: validation.data,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidos: true,
        telefono: true,
        direccion: true,
        codigoPostal: true,
        ciudad: true,
        provincia: true,
        rol: true,
        activo: true,
        fechaRegistro: true,
        ultimoAcceso: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: { user }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar perfil'
      },
      { status: 500 }
    )
  }
}
