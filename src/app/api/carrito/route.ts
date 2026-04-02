import { NextResponse } from 'next/server'
import { PedidoEstado, MetodoPago } from '@prisma/client'

// Mock data en memoria para carrito
interface CartItem {
  id: string
  productoId: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
  producto: any
  fechaAgregado?: Date
}

let carritoMock: { items: CartItem[], usuarioId: string | null } = {
  items: [],
  usuarioId: null
}

// Mock data para pedidos
const pedidosMock = [
  {
    id: '1',
    numeroPedido: 'PED-2023-0001',
    usuarioId: 'demo-user-1',
    estado: 'entregado' as PedidoEstado, // Fix Enum usage
    subtotal: 2778.96,
    iva: 583.58,
    gastosEnvio: 0,
    total: 3362.54,
    direccionEnvio: {
      nombre: 'Juan Pérez',
      apellidos: 'García López',
      direccion: 'Calle Mayor, 123',
      codigoPostal: '28001',
      ciudad: 'Madrid',
      provincia: 'Madrid',
      telefono: '+34 600 123 456'
    },
    metodoPago: 'tarjeta' as MetodoPago, // Fix Enum usage
    referenciaPago: 'TXN-20231230-001',
    notas: '',
    fechaPedido: new Date('2023-12-15T10:30:00Z'),
    fechaEnvio: new Date('2023-12-15T16:00:00Z'),
    fechaEntrega: new Date('2023-12-16T14:00:00Z'),
    items: [
      {
        id: '1',
        productoId: '1',
        cantidad: 1,
        precioUnitario: 1299,
        descuento: 200,
        subtotal: 1299,
        producto: {
          id: '1',
          sku: 'LAP-GAM-X15',
          nombre: 'Portátil Gaming Pro X15',
          descripcionCorta: 'Intel Core i7-13700H, RTX 4070, 32GB RAM DDR5',
          precio: 1499,
          precioOferta: 1299,
          imagen: '/images/producto_laptop_gaming.png',
          marca: 'Asus',
          modelo: 'ROG Strix G15'
        }
      },
      {
        id: '2',
        productoId: '3',
        cantidad: 2,
        precioUnitario: 109.99,
        descuento: 20,
        subtotal: 219.98,
        producto: {
          id: '3',
          sku: 'RAM-COR-DD5-32',
          nombre: 'Memoria RAM DDR5 32GB Corsair',
          descripcionCorta: '6000MHz CL36 RGB',
          precio: 129.99,
          precioOferta: 109.99,
          imagen: '/images/producto_ram.png',
          marca: 'Corsair',
          modelo: 'Vengeance DDR5'
        }
      },
      {
        id: '3',
        productoId: '5',
        cantidad: 1,
        precioUnitario: 479.99,
        descuento: 70,
        subtotal: 479.99,
        producto: {
          id: '5',
          sku: 'MON-SAM-32-4K',
          nombre: 'Monitor Curvo 32" 4K Samsung',
          descripcionCorta: '165Hz, 1ms, HDR10+',
          precio: 549.99,
          precioOferta: 479.99,
          imagen: '/images/producto_monitor.png',
          marca: 'Samsung',
          modelo: 'Odyssey G7'
        }
      }
    ]
  }
]

// ============================================
// CARROTO - ITEMS
// ============================================

// POST /api/carrito/items - Añadir item al carrito
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productoId, cantidad = 1 } = body

    if (!productoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'productoId es requerido'
        },
        { status: 400 }
      )
    }

    if (cantidad < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'La cantidad debe ser al menos 1'
        },
        { status: 400 }
      )
    }

    // Mock: Obtener producto (en producción vendría de la base de datos)
    const productosMock = await getProductsMock()
    const producto = productosMock.find((p: any) => p.id === productoId)

    if (!producto) {
      return NextResponse.json(
        {
          success: false,
          error: 'Producto no encontrado'
        },
        { status: 404 }
      )
    }

    if (cantidad > producto.stock) {
      return NextResponse.json(
        {
          success: false,
          error: `Stock insuficiente. Solo hay ${producto.stock} disponibles`
        },
        { status: 400 }
      )
    }

    // Verificar si el item ya existe en el carrito
    const itemExistente = carritoMock.items.find(i => i.productoId === productoId)

    if (itemExistente) {
      // Actualizar cantidad
      itemExistente.cantidad += cantidad
      itemExistente.subtotal = (producto.precioOferta || producto.precio) * itemExistente.cantidad
    } else {
      // Añadir nuevo item
      carritoMock.items.push({
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productoId,
        cantidad,
        precioUnitario: producto.precioOferta || producto.precio,
        descuento: producto.precioOferta ? producto.precio - producto.precioOferta : 0,
        subtotal: (producto.precioOferta || producto.precio) * cantidad,
        producto,
        fechaAgregado: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        carrito: carritoMock,
        mensaje: 'Producto añadido al carrito correctamente'
      }
    })
  } catch (error) {
    console.error('Error en POST /api/carrito/items:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al añadir producto al carrito',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// GET /api/carrito/items - Obtener items del carrito
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        carrito: carritoMock,
        totalItems: carritoMock.items.reduce((acc, item) => acc + item.cantidad, 0),
        subtotal: carritoMock.items.reduce((acc, item) => acc + item.subtotal, 0)
      }
    })
  } catch (error) {
    console.error('Error en GET /api/carrito/items:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener carrito',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// PUT /api/carrito/items/[id] - Actualizar cantidad de item
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { cantidad } = body

    if (!cantidad || cantidad < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'La cantidad debe ser al menos 1'
        },
        { status: 400 }
      )
    }

    const item = carritoMock.items.find(i => i.id === id)

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item no encontrado en el carrito'
        },
        { status: 404 }
      )
    }

    // Verificar stock
    const productosMock = await getProductsMock()
    const producto = productosMock.find(p => p.id === item.productoId)

    if (producto && cantidad > producto.stock) {
      return NextResponse.json(
        {
          success: false,
          error: `Stock insuficiente. Solo hay ${producto.stock} disponibles`
        },
        { status: 400 }
      )
    }

    item.cantidad = cantidad
    item.subtotal = item.precioUnitario * cantidad

    return NextResponse.json({
      success: true,
      data: {
        carrito: carritoMock,
        mensaje: 'Cantidad actualizada correctamente'
      }
    })
  } catch (error) {
    console.error('Error en PUT /api/carrito/items/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar item del carrito',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE /api/carrito/items/[id] - Eliminar item del carrito
// export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const id = await params
//
//     const itemIndex = carritoMock.items.findIndex(i => i.id === id)
//
//     if (itemIndex === -1) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: 'Item no encontrado en el carrito'
//         },
//         { status: 404 }
//       )
//     }
//
//     carritoMock.items.splice(itemIndex, 1)
//
//     return NextResponse.json({
//       success: true,
//       data: {
//         carrito: carritoMock,
//         mensaje: 'Item eliminado del carrito'
//       }
//     })
//   } catch (error) {
//     console.error('Error en DELETE /api/carrito/items/[id]:', error)
//     return NextResponse.json(
//       {
//         success: false,
//         error: 'Error al eliminar item del carrito',
//         datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
//       },
//       { status: 500 }
//     )
//   }
// }

// DELETE /api/carrito - Vaciar carrito
export async function DELETE() {
  try {
    carritoMock.items = []

    return NextResponse.json({
      success: true,
      data: {
        carrito: carritoMock,
        mensaje: 'Carrito vaciado correctamente'
      }
    })
  } catch (error) {
    console.error('Error en DELETE /api/carrito:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al vaciar carrito',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// Helper para obtener productos mock
async function getProductsMock() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/productos`)
  const data = await res.json()
  return data.data.productos || []
}
