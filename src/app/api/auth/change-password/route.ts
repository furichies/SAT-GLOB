import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { compare, hash } from 'bcryptjs'
import { changePasswordSchema } from '@/lib/validations/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('[ChangePassword] Session:', session ? 'Found' : 'Null', session?.user?.id)

    if (!session?.user?.id) {
      console.log('[ChangePassword] No user ID in session')
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado'
        },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('[ChangePassword] Body received (masked):', { ...body, currentPassword: '***', newPassword: '***', confirmPassword: '***' })

    // Validate input
    const validation = changePasswordSchema.safeParse(body)
    if (!validation.success) {
      console.log('[ChangePassword] Validation failed:', validation.error.flatten())
      return NextResponse.json(
        {
          success: false,
          error: 'Error de validación',
          errors: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validation.data

    // Get user with password
    const user = await db.usuario.findUnique({
      where: { id: session.user.id }
    })
    console.log('[ChangePassword] User found:', user ? 'Yes' : 'No')

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado'
        },
        { status: 404 }
      )
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.passwordHash)
    console.log('[ChangePassword] Password valid:', isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'La contraseña actual es incorrecta'
        },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await hash(newPassword, 12)

    // Update password
    await db.usuario.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash }
    })
    console.log('[ChangePassword] Password updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Contraseña cambiada correctamente'
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al cambiar contraseña'
      },
      { status: 500 }
    )
  }
}
