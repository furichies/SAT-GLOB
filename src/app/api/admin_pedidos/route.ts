import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PedidoEstado } from '@prisma/client'

// GET /api/admin_pedidos - Listar pedidos para admin (real desde DB)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin'
    const isTecnico = session?.user?.role === 'tecnico'

    if (!session || (!isAdmin && !isTecnico)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const estadoStr = searchParams.get('estado') || ''
    const busqueda = searchParams.get('busqueda') || ''
    const clienteId = searchParams.get('clienteId') || ''

    const pedidos = await db.pedido.findMany({
      include: {
        usuario: {
          select: {
            nombre: true,
            apellidos: true,
            email: true
          }
        },
        detalles: {
          include: {
            producto: true
          }
        }
      },
      orderBy: { fechaPedido: 'desc' }
    })

    // Mapeo al formato esperado por el frontend de admin
    let mappedPedidos = pedidos.map(p => ({
      id: p.id,
      numeroPedido: p.numeroPedido,
      clienteId: p.usuarioId,
      clienteNombre: `${p.usuario.nombre} ${p.usuario.apellidos || ''}`.trim(),
      clienteEmail: p.usuario.email,
      estado: p.estado,
      fecha: p.fechaPedido.toISOString(),
      subtotal: p.subtotal,
      iva: p.iva,
      gastosEnvio: p.gastosEnvio,
      total: p.total,
      metodoPago: p.metodoPago,
      // La dirección se guarda como JSON string en el pedido
      direccion: p.direccionEnvio,
      detalles: p.detalles,
      notas: p.notas
    }))

    // Filtrado adicional
    if (clienteId) {
      mappedPedidos = mappedPedidos.filter(p => p.clienteId === clienteId)
    }

    if (estadoStr && estadoStr !== 'todos') {
      mappedPedidos = mappedPedidos.filter(p => p.estado === estadoStr)
    }
    if (busqueda) {
      const query = busqueda.toLowerCase()
      mappedPedidos = mappedPedidos.filter(p =>
        p.numeroPedido.toLowerCase().includes(query) ||
        p.clienteNombre.toLowerCase().includes(query) ||
        p.clienteEmail.toLowerCase().includes(query)
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        pedidos: mappedPedidos,
        totalPedidos: mappedPedidos.length
      }
    })
  } catch (error) {
    console.error('Error en GET /api/admin_pedidos:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener pedidos del admin' }, { status: 500 })
  }
}

// PUT /api/admin_pedidos - Actualizar estado de pedido
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin'
    const isTecnico = session?.user?.role === 'tecnico'

    if (!session || (!isAdmin && !isTecnico)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { id, estado, direccionEnvio, notas } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID es requerido' }, { status: 400 })
    }

    const updated = await db.pedido.update({
      where: { id },
      data: {
        ...(estado ? { estado: estado as PedidoEstado } : {}),
        ...(direccionEnvio ? { direccionEnvio: typeof direccionEnvio === 'string' ? direccionEnvio : JSON.stringify(direccionEnvio) } : {}),
        ...(notas !== undefined ? { notas } : {}),
        ...(estado === PedidoEstado.enviado ? { fechaEnvio: new Date() } : {}),
        ...(estado === PedidoEstado.entregado ? { fechaEntrega: new Date() } : {})
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        pedido: updated,
        mensaje: 'Estado del pedido actualizado correctamente'
      }
    })
  } catch (error) {
    console.error('Error en PUT /api/admin_pedidos:', error)
    return NextResponse.json({ success: false, error: 'Error al actualizar el pedido' }, { status: 500 })
  }
}
