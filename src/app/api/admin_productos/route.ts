import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ProductoTipo } from '@prisma/client'

// GET /api/admin_productos - Obtener todos los productos
export async function GET() {
  try {
    const productos = await db.producto.findMany({
      include: {
        categoria: true
      },
      orderBy: {
        fechaCreacion: 'desc'
      }
    })

    const productosFormateados = productos.map(p => ({
      id: p.id,
      sku: p.sku,
      nombre: p.nombre,
      descripcionCorta: p.descripcionCorta || '',
      descripcionLarga: p.descripcion || '',
      precio: p.precio,
      precioOferta: p.precioOferta,
      stock: p.stock,
      stockMinimo: p.stockMinimo,
      categoria: p.categoria?.nombre || p.tipo || 'Sin categoría', // Fallback to type or generic
      categoriaId: p.categoriaId,
      marca: p.marca || '',
      modelo: p.modelo || '',
      imagen: (() => {
        if (!p.imagenes) return ''
        let mainImage = p.imagenes

        // Handle common JSON array format stored as string
        if (mainImage.startsWith('["')) {
          try {
            const parsed = JSON.parse(mainImage)
            mainImage = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : ''
          } catch (e) {
            // Fallback to simple clean
            mainImage = mainImage.replace(/[\[\]"]/g, '').split(',')[0]
          }
        } else {
          // Handle simple comma separation
          mainImage = mainImage.split(',')[0]
        }

        // Remove public prefix if inadvertently stored, so it maps to root
        return mainImage.replace(/^public\//, '/').replace(/^\/?images\//, '/images/')
      })(),
      enOferta: !!p.precioOferta && p.precioOferta < p.precio,
      destacado: p.destacado,
      enStock: p.stock > 0,
      estado: p.activo ? 'activo' : 'inactivo',
      fechaCreacion: p.fechaCreacion.toISOString(),
      fechaActualizacion: p.fechaActualizacion.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: productosFormateados
    })
  } catch (error) {
    console.error('Error en GET /api/admin_productos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

// POST /api/admin_productos - Crear producto
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sku, nombre, descripcionCorta, descripcionLarga, precio, precioOferta, stock, stockMinimo, categoria, marca, modelo, imagen, destacado } = body

    // Validation
    if (!sku || !nombre || !precio) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Determine category ID or create if not exists, or just fallback to null if using mapping logic not provided.
    // For simplicity, we search for category by name or just use null if not found.
    // Assuming 'categoria' coming from frontend is a string name (slug-like).

    let categoriaId: string | null = null
    const catNombre = categoria || 'componentes'

    const catDb = await db.categoria.findFirst({
      where: { nombre: { contains: catNombre } }
    })

    if (catDb) {
      categoriaId = catDb.id
    }

    // Determine Product Type based on category or default
    let tipo: ProductoTipo = 'componente'
    if (String(categoria).toLowerCase().includes('ordenador')) tipo = 'equipo_completo'
    else if (String(categoria).toLowerCase().includes('periferico')) tipo = 'periferico'
    else if (String(categoria).toLowerCase().includes('software')) tipo = 'software'


    const nuevoProducto = await db.producto.create({
      data: {
        sku,
        nombre,
        descripcion: descripcionLarga,
        descripcionCorta,
        precio: Number(precio),
        precioOferta: precioOferta ? Number(precioOferta) : null,
        stock: Number(stock),
        stockMinimo: Number(stockMinimo) || 5,
        categoriaId: categoriaId,
        marca,
        modelo,
        tipo,
        imagenes: imagen, // Storing single image for now
        destacado: Boolean(destacado),
        activo: true
      },
      include: {
        categoria: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        producto: {
          ...nuevoProducto,
          imagen: nuevoProducto.imagenes,
          categoria: nuevoProducto.categoria?.nombre || nuevoProducto.tipo,
          enOferta: !!nuevoProducto.precioOferta
        },
        mensaje: 'Producto creado correctamente'
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/admin_productos:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear producto'
      },
      { status: 500 }
    )
  }
}
