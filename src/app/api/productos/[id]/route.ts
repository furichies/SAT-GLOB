import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const producto = await db.producto.findUnique({
            where: { id },
            include: {
                categoria: true
            }
        })

        if (!producto) {
            return NextResponse.json(
                { success: false, error: 'Producto no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                producto: {
                    ...producto,
                    imagenes: producto.imagenes ? JSON.parse(producto.imagenes) : []
                }
            }
        })
    } catch (error) {
        console.error('Error en GET /api/productos/[id]:', error)
        return NextResponse.json(
            { success: false, error: 'Error al obtener detalle del producto' },
            { status: 500 }
        )
    }
}
