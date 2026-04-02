import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin' && session.user.role !== 'tecnico')) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const tecnicos = await prisma.usuario.findMany({
            where: {
                OR: [
                    { rol: 'tecnico' },
                    { rol: 'admin' }, // Los admins también pueden ser asignados
                    { rol: 'superadmin' }
                ],
                activo: true
            },
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                rol: true
            },
            orderBy: {
                nombre: 'asc'
            }
        })

        return NextResponse.json({
            success: true,
            data: { tecnicos }
        })
    } catch (error) {
        console.error('Error al obtener técnicos:', error)
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
