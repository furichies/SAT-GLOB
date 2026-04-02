import { NextResponse } from 'next/server'

// Mock data para pedidos
let pedidosPDFMock = [
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
        descripcion: 'Intel Core i7-13700H, RTX 4070, 32GB RAM DDR5, 1TB SSD NVMe',
        cantidad: 1,
        precio: 1099.99,
        subtotal: 1099.99
      }
    ]
  }
]

// GET /api/admin_factura - Generar factura en PDF (admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const pedidoId = searchParams.get('pedidoId')

    const pedido = pedidosPDFMock.find(p => p.id === pedidoId)

    if (!pedido) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pedido no encontrado'
        },
        { status: 404 }
      )
    }

    // Generar descripción de la factura en formato texto
    const facturaDescripcion = `
==================================================
FACTURA ${pedido.numeroPedido}
MicroInfo Shop S.L.
==================================================

DATOS DEL CLIENTE
----------------
Nombre: ${pedido.clienteNombre}
Email: ${pedido.clienteEmail}
NIF/CIF: ${pedido.clienteNIF}
Dirección: ${pedido.direccion}

DATOS DEL PEDIDO
-----------------
Número de pedido: ${pedido.numeroPedido}
Fecha: ${new Date(pedido.fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
Estado: ${pedido.estado}
Método de pago: ${pedido.metodoPago}
Método de envío: ${pedido.metodoEnvio}

DETALLE DEL PEDIDO
------------------
${pedido.items.map((item, idx) => `
Item ${idx + 1}: ${item.nombre}
SKU: ${item.sku}
Descripción: ${item.descripcion}
Cantidad: ${item.cantidad}
Precio unitario: ${item.precio.toFixed(2)}€
Subtotal: ${item.subtotal.toFixed(2)}€
`).join('---')}

RESUMEN
-------
Subtotal: ${pedido.subtotal.toFixed(2)}€
IVA (21%): ${pedido.iva.toFixed(2)}€
Gastos de envío: ${pedido.gastosEnvio > 0 ? pedido.gastosEnvio.toFixed(2) + '€' : 'Gratis'}
TOTAL: ${pedido.total.toFixed(2)}€

==================================================
MicroInfo Shop S.L.
CIF: B12345678
Dirección: Calle Principal 89, 28002 Madrid
Teléfono: +34 900 123 456
Email: facturacion@microinfo.es
Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}
==================================================
    `.trim()

    return NextResponse.json({
      success: true,
      data: {
        pedido,
        factura: {
          numeroFactura: `FAC-2023-${pedido.numeroPedido.split('-')[1]}`,
          descripcion: facturaDescripcion,
          mensaje: 'Factura generada correctamente'
        }
      }
    })
  } catch (error) {
    console.error('Error en GET /api/admin_factura/[pedidoId]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar factura'
      },
      { status: 500 }
    )
  }
}
