import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/productos - Listar productos desde la base de datos real
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const busqueda = searchParams.get('busqueda') || ''
    const categoriaId = searchParams.get('categoria') || ''
    const tipo = searchParams.get('tipo') || ''
    const enStock = searchParams.get('enStock') === 'true'
    const enOferta = searchParams.get('enOferta') === 'true'
    const ordenar = searchParams.get('ordenar') || 'novedad'
    const precioMax = parseFloat(searchParams.get('precioMax') || '999999')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const porPagina = parseInt(searchParams.get('porPagina') || '12')

    const where: any = {
      activo: true,
      precio: {
        gt: 0,
        lte: precioMax
      }
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
        { marca: { contains: busqueda, mode: 'insensitive' } }
      ]
    }

    if (categoriaId) {
      where.categoriaId = categoriaId
    }

    if (tipo) {
      where.tipo = tipo
    }

    if (enStock) {
      where.stock = { gt: 0 }
    }

    if (enOferta) {
      where.precioOferta = { not: null }
    }

    // Configurar ordenamiento
    let orderBy: any = { fechaCreacion: 'desc' }
    switch (ordenar) {
      case 'precio_asc':
        orderBy = { precio: 'asc' }
        break
      case 'precio_desc':
        orderBy = { precio: 'desc' }
        break
      case 'nombre':
        orderBy = { nombre: 'asc' }
        break
      case 'valoracion':
        // Por ahora usamos destacado como proxy de valoración
        orderBy = { destacado: 'desc' }
        break
      default:
        orderBy = { fechaCreacion: 'desc' }
    }

    const [productos, totalItems] = await Promise.all([
      db.producto.findMany({
        where,
        skip: (pagina - 1) * porPagina,
        take: porPagina,
        orderBy
      }),
      db.producto.count({ where })
    ])

    const totalPages = Math.ceil(totalItems / porPagina)

    return NextResponse.json({
      success: true,
      data: {
        productos: productos.map(p => ({
          ...p,
          imagenes: p.imagenes ? JSON.parse(p.imagenes) : []
        })),
        paginacion: {
          pagina,
          porPagina,
          totalItems,
          totalPages,
          tieneSiguiente: pagina < totalPages,
          tieneAnterior: pagina > 1
        }
      }
    })
  } catch (error) {
    console.error('Error en GET /api/productos:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener productos' }, { status: 500 })
  }
}


