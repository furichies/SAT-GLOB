import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hash } from 'bcryptjs'

// POST /api/admin_clientes - Crear nuevo cliente (admin)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin'

        if (!session || !isAdmin) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const body = await req.json()
        const { nombre, apellidos, email, telefono, direccion, ciudad, provincia, password } = body

        if (!nombre || !email) {
            return NextResponse.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 })
        }

        // Verificar si existe email
        const existingUser = await db.usuario.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ success: false, error: 'El email ya está registrado' }, { status: 400 })
        }

        // Hash password (default: 123456 si no se provee, aunque idealmente debería proveerse)
        const passwordToHash = password || '123456'
        const passwordHash = await hash(passwordToHash, 12)

        const nuevoCliente = await db.usuario.create({
            data: {
                nombre,
                apellidos,
                email,
                telefono,
                direccion,
                ciudad,
                provincia,
                passwordHash,
                rol: 'cliente',
                activo: true
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                cliente: {
                    id: nuevoCliente.id,
                    nombre: nuevoCliente.nombre,
                    email: nuevoCliente.email
                },
                mensaje: 'Cliente creado correctamente'
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Error en POST /api/admin_clientes:', error)
        return NextResponse.json({ success: false, error: 'Error al crear cliente' }, { status: 500 })
    }
}

// DELETE /api/admin_clientes - Eliminar cliente (admin)
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin'

        if (!session || !isAdmin) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
        }

        // Verificar si es cliente
        const usersToDelete = await db.usuario.findUnique({
            where: { id }
        })

        if (!usersToDelete) {
            return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
        }

        if (usersToDelete.rol !== 'cliente') {
            // Optional safety check: prevent deleting admins/techs from this specific endpoint if desired,
            // but strictly speaking, if it's admin_clientes, maybe we should enforce rol='cliente'.
            // Let's enforce it to be safe.
            return NextResponse.json({ success: false, error: 'Este endpoint solo permite eliminar clientes' }, { status: 403 })
        }

        await db.usuario.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            data: {
                mensaje: 'Cliente eliminado correctamente'
            }
        })

    } catch (error) {
        console.error('Error en DELETE /api/admin_clientes:', error)
        // Handle constraint violations (e.g. user has orders)
        if ((error as any).code === 'P2003') {
            return NextResponse.json({ success: false, error: 'No se puede eliminar el cliente porque tiene pedidos o datos asociados.' }, { status: 400 })
        }
        return NextResponse.json({ success: false, error: 'Error al eliminar cliente' }, { status: 500 })
    }
}


// GET /api/admin_clientes - Listar clientes para admin
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin'

        if (!session || !isAdmin) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const busqueda = searchParams.get('busqueda') || ''

        // Construir where clause
        const whereClause: any = {
            rol: 'cliente' // Por defecto solo clientes, opcionalmente podríamos incluir todos
        }

        if (busqueda) {
            const query = busqueda.toLowerCase()
            whereClause.OR = [
                { nombre: { contains: query } },
                { apellidos: { contains: query } },
                { email: { contains: query } },
                { telefono: { contains: query } }
            ]
        }

        const clientes = await db.usuario.findMany({
            where: whereClause,
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                telefono: true,
                ciudad: true,
                provincia: true,
                direccion: true,
                rol: true,
                activo: true,
                fechaRegistro: true,
                ultimoAcceso: true,
                _count: {
                    select: { pedidos: true }
                }
            },
            orderBy: { fechaRegistro: 'desc' }
        })

        const mappedClientes = clientes.map(c => ({
            ...c,
            totalPedidos: c._count.pedidos
        }))

        return NextResponse.json({
            success: true,
            data: {
                clientes: mappedClientes,
                count: mappedClientes.length
            }
        })
    } catch (error) {
        console.error('Error en GET /api/admin_clientes:', error)
        return NextResponse.json({ success: false, error: 'Error al obtener clientes' }, { status: 500 })
    }
}
