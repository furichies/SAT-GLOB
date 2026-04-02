import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ProductoTipo } from '@prisma/client'

// PUT /api/admin_productos/[id] - Actualizar producto
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { sku, nombre, descripcionCorta, descripcionLarga, precio, precioOferta, stock, stockMinimo, categoria, marca, modelo, imagen, destacado, activo } = body

        // Validation basics
        if (!id) {
            return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
        }

        // Determine category ID update if categoria string is passed
        let categoriaId: string | undefined = undefined
        let tipo: ProductoTipo | undefined = undefined

        if (categoria) {
            const catNombre = categoria
            const catDb = await db.categoria.findFirst({
                where: { nombre: { contains: catNombre } }
            })

            if (catDb) {
                categoriaId = catDb.id
            } else {
                // Unlink if not found? Or keep previous? Assuming keep if not found or careful logic. 
                // For now, if user changes category string and we don't find it, we might ignore or set null.
                // Let's search loosely
            }

            if (String(categoria).toLowerCase().includes('ordenador')) tipo = 'equipo_completo'
            else if (String(categoria).toLowerCase().includes('periferico')) tipo = 'periferico'
            else if (String(categoria).toLowerCase().includes('software')) tipo = 'software'
            else tipo = 'componente'
        }

        const updatedProducto = await db.producto.update({
            where: { id },
            data: {
                ...(sku && { sku }),
                ...(nombre && { nombre }),
                ...(descripcionLarga !== undefined && { descripcion: descripcionLarga }),
                ...(descripcionCorta !== undefined && { descripcionCorta }),
                ...(precio !== undefined && { precio: Number(precio) }),
                ...(precioOferta !== undefined && { precioOferta: precioOferta ? Number(precioOferta) : null }),
                ...(stock !== undefined && { stock: Number(stock) }),
                ...(stockMinimo !== undefined && { stockMinimo: Number(stockMinimo) }),
                ...(categoriaId && { categoriaId }),
                ...(tipo && { tipo }),
                ...(marca !== undefined && { marca }),
                ...(modelo !== undefined && { modelo }),
                ...(imagen !== undefined && { imagenes: imagen }),
                ...(destacado !== undefined && { destacado: Boolean(destacado) }),
                ...(activo !== undefined && { activo: Boolean(activo) })
            }
        })

        return NextResponse.json({
            success: true,
            data: updatedProducto
        })
    } catch (error) {
        console.error('Error en PUT /api/admin_productos/[id]:', error)
        return NextResponse.json(
            { success: false, error: 'Error al actualizar producto' },
            { status: 500 }
        )
    }
}

// DELETE /api/admin_productos/[id] - Eliminar producto (soft delete or hard delete)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Hard delete
        await db.producto.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Producto eliminado correctamente'
        })
    } catch (error) {
        console.error('Error en DELETE /api/admin_productos/[id]:', error)
        // Fallback to soft delete if constraints fail
        try {
            const { id } = await params
            await db.producto.update({
                where: { id },
                data: { activo: false }
            })
            return NextResponse.json({
                success: true,
                message: 'Producto desactivado (tiene dependencias)'
            })
        } catch (e) {
            return NextResponse.json(
                { success: false, error: 'Error al eliminar producto' },
                { status: 500 }
            )
        }
    }
}
