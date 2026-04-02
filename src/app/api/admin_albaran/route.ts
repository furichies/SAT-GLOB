import { NextResponse } from 'next/server'

// Mock data para pedidos
let pedidosAlbaranMock = [
  {
    id: '1',
    numeroPedido: 'PED-2023-0123',
    clienteNombre: 'Juan Pérez',
    clienteEmail: 'juan.perez@email.com',
    clienteNIF: '12345678A',
    direccion: 'Calle Mayor 123, 28001 Madrid',
    fecha: '2023-12-30T10:30:00Z',
    estado: 'enviado',
    subtotal: 1099.99,
    iva: 230.90,
    gastosEnvio: 9.99,
    total: 1340.88,
    metodoPago: 'tarjeta',
    metodoEnvio: 'estandar',
    items: [
      {
        id: '1',
        nombre: 'Portátil Gaming Pro X15',
        sku: 'LAP-GAM-X15',
        descripcion: 'Intel Core i7-13700H, RTX 4070, 32GB RAM DDR5',
        cantidad: 1,
        precio: 1099.99,
        subtotal: 1099.99
      }
    ],
    tracking: 'ES1234567890',
    transportista: 'MRW (Moviendo el Mundo)'
  },
  {
    id: '3',
    numeroPedido: 'PED-2023-0121',
    clienteNombre: 'Carlos López',
    clienteEmail: 'carlos.lopez@email.com',
    clienteNIF: '87654321B',
    direccion: 'Calle San Juan 67, 41003 Sevilla',
    fecha: '2023-12-29T16:45:00Z',
    estado: 'enviado',
    subtotal: 599.99,
    iva: 125.90,
    gastosEnvio: 9.99,
    total: 735.88,
    metodoPago: 'transferencia',
    metodoEnvio: 'estandar',
    items: [
      {
        id: '1',
        nombre: 'Monitor Curvo 32" 4K Samsung Odyssey G7',
        sku: 'MON-SAM-32-4K',
        descripcion: '165Hz, 1ms, HDR10+, AMD FreeSync Premium Pro',
        cantidad: 1,
        precio: 599.99,
        subtotal: 599.99
      }
    ],
    tracking: 'ES9876543210',
    transportista: 'SEUR'
  }
]

// GET /api/admin_albaran/[pedidoId] - Generar albarán en PDF (admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const pedidoId = searchParams.get('pedidoId')
    const pedido = pedidosAlbaranMock.find(p => p.id === pedidoId)

    if (!pedido) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pedido no encontrado'
        },
        { status: 404 }
      )
    }

    if (pedido.estado !== 'enviado' && pedido.estado !== 'entregado') {
      return NextResponse.json(
        {
          success: false,
          error: 'El pedido debe estar en estado "Enviado" o "Entregado" para generar albarán'
        },
        { status: 400 }
      )
    }

    // Generar descripción del albarán en formato texto
    const albaranDescripcion = `
==================================================
ALBARÁN ${pedido.numeroPedido}
MicroInfo Shop S.L.
==================================================

DATOS DE ENVÍO
---------------
Transportista: ${pedido.transportista}
Tracking: ${pedido.tracking}
Fecha de envío: ${new Date(pedido.fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
Estado del pedido: ${pedido.estado === 'enviado' ? 'Enviado' : 'Entregado'}

DATOS DEL CLIENTE
----------------
Nombre: ${pedido.clienteNombre}
Email: ${pedido.clienteEmail}
NIF/CIF: ${pedido.clienteNIF}
Dirección de envío: ${pedido.direccion}

DETALLE DEL PEDIDO
------------------
Número de pedido: ${pedido.numeroPedido}
Fecha de pedido: ${new Date(pedido.fecha).toLocaleDateString('es-ES')}
Método de pago: ${pedido.metodoPago}
Método de envío: ${pedido.metodoEnvio}

ÍTEMS ENVIADOS
-------------------
${pedido.items.map((item, idx) => `
Item ${idx + 1}: ${item.nombre}
SKU: ${item.sku}
Descripción: ${item.descripcion}
Cantidad: ${item.cantidad}
Precio unitario: ${item.precio.toFixed(2)}€
Subtotal: ${item.subtotal.toFixed(2)}€
`).join('------------------')}

RESUMEN
------
Subtotal: ${pedido.subtotal.toFixed(2)}€
IVA (21%): ${pedido.iva.toFixed(2)}€
Gastos de envío: ${pedido.gastosEnvio > 0 ? pedido.gastosEnvio.toFixed(2) + '€' : 'Gratis'}
PESO TOTAL: ~${pedido.items.length * 2.5}kg
NÚMERO DE BULTOS: 1

==================================================
MicroInfo Shop S.L.
CIF: B12345678
Dirección: Calle Principal 89, 28002 Madrid
Teléfono: +34 900 123 456
Email: envios@microinfo.es
Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}
==================================================
    `.trim()

    return NextResponse.json({
      success: true,
      data: {
        pedido,
        albaran: {
          numeroAlbaran: `ALB-2023-${pedido.numeroPedido.split('-')[1]}`,
          descripcion: albaranDescripcion,
          mensaje: 'Albarán generado correctamente'
        }
      }
    })
  } catch (error) {
    console.error('Error en GET /api/admin_albaran/[pedidoId]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar albarán',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
