import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// Helper to check admin/tecnico role
const isStaff = (role?: string) => ['admin', 'tecnico', 'superadmin'].includes(role || '')

// GET /api/admin_conocimiento - Listar artículos (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isStaff(session.user?.role)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const busqueda = searchParams.get('busqueda') || ''
    const categoria = searchParams.get('categoria') || ''
    const estado = searchParams.get('estado') || ''
    const autor = searchParams.get('autor') || ''

    // Build where clause
    const where: Prisma.BaseConocimientoWhereInput = {}

    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda } },
        { contenido: { contains: busqueda } },
        { etiquetas: { contains: busqueda } }
      ]
    }

    if (categoria && categoria !== 'todos') {
      where.categoria = categoria
    }

    if (estado && estado !== 'todos') {
      if (estado === 'publicado') where.activo = true
      if (estado === 'borrador') where.activo = false
      // 'archivado' is not directly mapped to boolean, assume active=false + maybe another tag? 
      // For now, let's map borrador -> active=false, publicado -> active=true. 
      // Archivados might just be active=false too.
    }

    // Autor filter is tricky as we store autorId. Filter by string matching on name is harder with relation.
    // We will skip autor filter for now or implement if needed by relation.

    const articulos = await db.baseConocimiento.findMany({
      where,
      orderBy: { fechaActualizacion: 'desc' },
      include: {
        autor: {
          select: { nombre: true, rol: true }
        }
      }
    })

    // Map to expected format
    const formatted = articulos.map(a => ({
      id: a.id,
      titulo: a.titulo,
      contenido: a.contenido,
      categoria: a.categoria || 'General',
      tags: a.etiquetas ? a.etiquetas.split(',').map(t => t.trim()) : [],
      autor: a.autor.nombre,
      autorId: a.autorId,
      autorRol: a.autor.rol,
      estado: a.activo ? 'publicado' : 'borrador', // Simplification
      vistas: a.vistas,
      likes: a.utilSi,
      comentarios: 0, // No table for comments yet
      fechaCreacion: a.fechaCreacion.toISOString().split('T')[0],
      fechaActualizacion: a.fechaActualizacion.toISOString().split('T')[0]
    }))

    return NextResponse.json({
      success: true,
      data: {
        articulos: formatted,
        totalArticulos: formatted.length
      }
    })
  } catch (error) {
    console.error('Error en GET /api/admin_conocimiento:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener artículos de la base de conocimiento'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin_conocimiento - Crear artículo (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isStaff(session.user?.role)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await req.json()
    const { titulo, contenido, categoria, tags, estado } = body

    // Create in DB
    const nueva = await db.baseConocimiento.create({
      data: {
        titulo,
        contenido,
        categoria,
        etiquetas: Array.isArray(tags) ? tags.join(', ') : tags,
        activo: estado === 'publicado',
        tipo: 'solucion', // Default
        autorId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        articulo: nueva,
        mensaje: 'Artículo creado correctamente'
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/admin_conocimiento:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear artículo',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin_conocimiento - Actualizar artículo (admin)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isStaff(session.user?.role)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const body = await req.json()
    const { titulo, contenido, categoria, tags, estado, archivar } = body

    if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })

    const updated = await db.baseConocimiento.update({
      where: { id },
      data: {
        titulo,
        contenido,
        categoria,
        etiquetas: Array.isArray(tags) ? tags.join(', ') : tags,
        activo: archivar ? false : (estado === 'publicado' ? true : (estado === 'borrador' ? false : undefined))
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        articulo: updated,
        mensaje: 'Artículo actualizado correctamente'
      }
    })
  } catch (error) {
    console.error('Error en PUT /api/admin_conocimiento/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar artículo',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin_conocimiento - Eliminar artículo (admin)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !isStaff(session.user?.role)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })

    await db.baseConocimiento.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      data: {
        mensaje: 'Artículo eliminado correctamente'
      }
    })
  } catch (error) {
    console.error('Error en DELETE /api/admin_conocimiento/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar artículo',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
