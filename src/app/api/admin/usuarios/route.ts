import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcrypt'

// GET /api/admin/usuarios - Listar usuarios con filtros
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'tecnico')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const rol = searchParams.get('rol')
    const busqueda = searchParams.get('busqueda')

    const where: any = { activo: true }

    if (rol && rol !== 'todos') {
      where.rol = rol
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda } },
        { apellidos: { contains: busqueda } },
        { email: { contains: busqueda } },
        { codigoPostal: { contains: busqueda } }
      ]
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        email: true,
        telefono: true,
        direccion: true,
        codigoPostal: true,
        ciudad: true,
        dni: true,
        rol: true,
      },
      orderBy: { nombre: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: { usuarios }
    })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// POST /api/admin/usuarios - Crear nuevo usuario
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'tecnico')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { nombre, apellidos, dni, email, telefono, direccion, codigoPostal, ciudad, rol = 'cliente' } = body

    if (!nombre || !email) {
      return NextResponse.json(
        { success: false, error: 'Nombre y email son obligatorios' },
        { status: 400 }
      )
    }

    const existe = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existe) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      )
    }

    const passwordHash = await hash('temporal123', 10)

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellidos,
        email,
        telefono,
        direccion,
        codigoPostal,
        ciudad,
        dni,
        rol,
        passwordHash,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        email: true,
        telefono: true,
        direccion: true,
        codigoPostal: true,
        ciudad: true,
        dni: true,
        rol: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: { usuario }
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
