import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { PedidoEstado, MetodoPago } from '@prisma/client'

// GET /api/pedidos - Listar pedidos del usuario autenticado
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const pedidos = await db.pedido.findMany({
      where: { usuarioId: session.user.id },
      include: {
        detalles: {
          include: {
            producto: {
              select: {
                nombre: true,
                imagenes: true,
                marca: true,
                modelo: true
              }
            }
          }
        }
      },
      orderBy: { fechaPedido: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        pedidos,
        totalPedidos: pedidos.length
      }
    })
  } catch (error) {
    console.error('Error en GET /api/pedidos:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener pedidos' }, { status: 500 })
  }
}

// POST /api/pedidos - Crear nuevo pedido real desde el carrito
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Debe iniciar sesión para realizar un pedido' }, { status: 401 })
    }

    const body = await req.json()
    const { items, direccionEnvio, metodoPago, notas, subtotal, iva, gastosEnvio, total } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'El carrito está vacío' }, { status: 400 })
    }

    // 1. Generar número de pedido único: PED-YYYYMMDD-XXXX (Random)
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
    const numeroPedido = `PED-${dateStr}-${randomStr}`

    // 2. Transacción de base de datos para crear pedido y detalles, y actualizar stock
    const result = await db.$transaction(async (tx) => {
      // A. Crear el pedido
      const pedido = await tx.pedido.create({
        data: {
          numeroPedido,
          usuarioId: session.user.id,
          estado: PedidoEstado.pendiente,
          subtotal: Number(subtotal),
          iva: Number(iva),
          gastosEnvio: Number(gastosEnvio),
          total: Number(total),
          direccionEnvio: JSON.stringify(direccionEnvio),
          metodoPago: (metodoPago as MetodoPago) || MetodoPago.tarjeta,
          notas: notas || '',
          fechaPedido: new Date(),
        }
      })

      // B. Crear detalles y actualizar stock de productos
      let notasAdicionales = ''

      for (const item of items) {
        let currentProductoId = item.id

        // Manejo especial para Configuraciones Personalizadas (Packs)
        if (item.id.startsWith('custom-pc-')) {
          // Buscamos o creamos el producto genérico para configuraciones
          let genericProduct = await tx.producto.findFirst({
            where: { sku: 'CONFIG-CUSTOM' }
          })

          if (!genericProduct) {
            genericProduct = await tx.producto.create({
              data: {
                sku: 'CONFIG-CUSTOM',
                nombre: 'Configuración Personalizada Micro1475',
                descripcion: 'Pack de componentes configurado a medida por el usuario.',
                precio: 0,
                stock: 9999,
                tipo: 'equipo_completo',
                activo: true,
                marca: 'Micro1475',
                modelo: 'Custom Build'
              }
            })
          }

          currentProductoId = genericProduct.id
          notasAdicionales += `\n--- DETALLE PACK CUSTOM PC ---\n${item.nombre}\nDetalles: ${item.descripcion}\n------------------------------\n`

          // No descontamos stock de este producto genérico (o lo hacemos de forma simbólica)
        } else {
          // Proceso normal para productos del catálogo
          const product = await tx.producto.findUnique({
            where: { id: item.id }
          })

          if (!product) {
            throw new Error(`Producto no encontrado en el catálogo: ${item.nombre} (ID: ${item.id})`)
          }

          if (product.stock < item.cantidad) {
            throw new Error(`Stock insuficiente para ${item.nombre}. Disponible: ${product.stock}, Solicitado: ${item.cantidad}`)
          }

          // Descontar stock solo de productos reales
          await tx.producto.update({
            where: { id: item.id },
            data: {
              stock: {
                decrement: item.cantidad
              }
            }
          })
        }

        // Crear detalle del pedido
        await tx.detallePedido.create({
          data: {
            pedidoId: pedido.id,
            productoId: currentProductoId,
            cantidad: item.cantidad,
            precioUnitario: Number(item.precio),
            descuento: 0,
            subtotal: Number(item.precio) * item.cantidad
          }
        })
      }

      // C. Actualizar notas del pedido si hubo items custom
      if (notasAdicionales) {
        await tx.pedido.update({
          where: { id: pedido.id },
          data: {
            notas: (notas || '') + notasAdicionales
          }
        })
      }

      // D. Opcional: Actualizar datos del usuario if se desea persistir la dirección
      if (direccionEnvio) {
        await tx.usuario.update({
          where: { id: session.user.id },
          data: {
            apellidos: direccionEnvio.apellidos,
            telefono: direccionEnvio.telefono,
            direccion: direccionEnvio.direccion,
            codigoPostal: direccionEnvio.codigoPostal,
            ciudad: direccionEnvio.ciudad,
            provincia: direccionEnvio.provincia
          }
        })
      }

      return pedido
    })

    return NextResponse.json({
      success: true,
      data: {
        pedido: result,
        mensaje: 'Pedido realizado con éxito'
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error en POST /api/pedidos:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al procesar el pedido'
    }, { status: 500 })
  }
}
