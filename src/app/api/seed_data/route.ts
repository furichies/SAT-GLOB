import { NextResponse } from 'next/server'

// Datos de seed para poblar la base de datos

// Usuarios de prueba
import { usuariosSeed, productosSeed, pedidosSeed, ticketsSeed, articulosSeed } from '@/lib/seed-data'
// GET /api/seed_data - Generar y retornar datos de seed
export async function GET(req: Request) {
  try {
    // Generar respuesta con todos los datos de seed
    return NextResponse.json({
      success: true,
      data: {
        usuarios: usuariosSeed,
        productos: productosSeed,
        pedidos: pedidosSeed,
        tickets: ticketsSeed,
        articulos: articulosSeed,
        metadata: {
          fechaGeneracion: new Date().toISOString(),
          totalUsuarios: usuariosSeed.length,
          totalProductos: productosSeed.length,
          totalPedidos: pedidosSeed.length,
          totalTickets: ticketsSeed.length,
          totalArticulos: articulosSeed.length,
          totalRegistros: usuariosSeed.length + productosSeed.length + pedidosSeed.length + ticketsSeed.length + articulosSeed.length
        },
        descripcion: 'Datos de prueba completos para poblar la base de datos SQLite. Incluye usuarios (clientes, técnicos, admins), productos, pedidos, tickets SAT y artículos de la base de conocimiento.',
        notas: {
          usuarios: `${usuariosSeed.length} usuarios de prueba (5 clientes, 4 técnicos, 2 admins)`,
          productos: `${productosSeed.length} productos de prueba (ordenadores, componentes, almacenamiento, RAM, periféricos)`,
          pedidos: `${pedidosSeed.length} pedidos de prueba (pendiente, en proceso, enviado, entregado, cancelado)`,
          tickets: `${ticketsSeed.length} tickets SAT de prueba (incidencias, reparaciones, con notas técnicas)`,
          articulos: `${articulosSeed.length} artículos de base de conocimiento de prueba (publicados, borradores, archivados)`
        }
      }
    })
  } catch (error) {
    console.error('Error en GET /api/seed_data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar datos de seed',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
