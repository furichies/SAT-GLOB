import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { email, password, nombre, rol } = await req.json()

        // Validar que se proporcionen los datos necesarios
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email y contraseña son obligatorios' },
                { status: 400 }
            )
        }

        // Verificar si el usuario ya existe
        const existingUser = await prisma.usuario.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'El usuario ya existe' },
                { status: 400 }
            )
        }

        // Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, 10)

        // Crear el usuario
        const user = await prisma.usuario.create({
            data: {
                email,
                passwordHash,
                nombre: nombre || 'Usuario',
                apellidos: 'Admin',
                rol: rol || 'admin',
                activo: true
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                rol: user.rol
            }
        })
    } catch (error) {
        console.error('Error al crear usuario:', error)
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
