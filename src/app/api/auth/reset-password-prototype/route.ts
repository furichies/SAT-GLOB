import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcrypt'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'El email es obligatorio' },
                { status: 400 }
            )
        }

        // Buscar usuario
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        })

        if (!usuario) {
            return NextResponse.json(
                { success: false, error: 'No se encontró ningún usuario con ese email' },
                { status: 404 }
            )
        }

        // Generar contraseña aleatoria
        // 8 caracteres alfanuméricos
        const tempPassword = crypto.randomBytes(4).toString('hex')

        // Hashear password
        const passwordHash = await hash(tempPassword, 10)

        // Actualizar usuario
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { passwordHash }
        })

        console.log(`[PROTOTYPE] Password reset for ${email}: ${tempPassword}`)

        return NextResponse.json({
            success: true,
            email: email,
            newPassword: tempPassword,
            message: 'Contraseña actualizada correctamente'
        })

    } catch (error) {
        console.error('Error reset password prototype:', error)
        return NextResponse.json(
            { success: false, error: 'Error interno al resetear contraseña' },
            { status: 500 }
        )
    }
}
