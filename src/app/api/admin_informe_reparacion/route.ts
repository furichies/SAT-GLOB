import { NextResponse } from 'next/server'

// Mock data para tickets de reparación
let ticketsReparacionMock = [
  {
    id: '1',
    numeroTicket: 'SAT-2023-0045',
    clienteNombre: 'Pedro Sánchez',
    clienteEmail: 'pedro.sanchez@email.com',
    tecnicoNombre: 'Carlos García',
    prioridad: 'urgente',
    tipo: 'incidencia',
    asunto: 'Portátil no enciende',
    descripcion: 'El portátil no enciende al presionar el botón de encendido. No hace ningun ruido ni muestra señal de vida.',
    categoria: 'Hardware',
    estado: 'resuelto',
    diagnostico: 'El portátil no enciende al presionar el botón de encendido. No hace ningun ruido ni muestra señal de vida. Posible fallo en la fuente de alimentación o en la placa base.',
    solucion: 'Reemplazado la fuente de alimentación del portátil. Se ha verificado que el portático enciende correctamente y funciona normalmente. Se ha realizado un test completo de todos los componentes.',
    notasTecnicas: [
      {
        id: 'n1',
        tecnico: 'Carlos García',
        fecha: '2023-12-30T08:00:00Z',
        nota: 'Diagnóstico inicial: Posible fallo en la fuente de alimentación o en la placa base.'
      },
      {
        id: 'n2',
        tecnico: 'Carlos García',
        fecha: '2023-12-30T09:30:00Z',
        nota: 'Diagnóstico confirmado: Fallo en la fuente de alimentación. Se va a proceder con el reemplazo.'
      },
      {
        id: 'n3',
        tecnico: 'Carlos García',
        fecha: '2023-12-30T11:00:00Z',
        nota: 'Fuente de alimentación reemplazada. Se va a realizar un test completo.'
      }
    ],
    satisfaccion: 5,
    valoracion: 'Excelente trabajo. Técnico muy profesional y rápido.',
    fechaCreacion: '2023-12-30T08:00:00Z',
    fechaAsignacion: '2023-12-30T07:30:00Z',
    fechaResolucion: '2023-12-30T14:00:00Z',
    tiempoEstimado: 24,
    tiempoReal: 6,
    costoReparacion: 149.99,
    piezasCambiadas: ['Fuente de alimentación', 'Thermal paste'],
    imagenes: ['/images/portatil_before.jpg', '/images/portatil_after.jpg'],
  },
  {
    id: '2',
    numeroTicket: 'SAT-2023-0044',
    clienteNombre: 'Laura Rodríguez',
    clienteEmail: 'laura.rodriguez@email.com',
    tecnicoNombre: 'María Martínez',
    prioridad: 'alta',
    tipo: 'reparacion',
    asunto: 'SSD corrupto',
    descripcion: 'El SSD muestra errores aleatorios y se bloquea. Necesito ayuda para recuperar los datos.',
    categoria: 'Almacenamiento',
    estado: 'resuelto',
    diagnostico: 'El SSD tiene sectores dañados. Se va a realizar recuperación de datos y clonación a un nuevo SSD.',
    solucion: 'Datos recuperados exitosamente (98% de los datos recuperados). Clonación del sistema completo al nuevo SSD. Se ha verificado que el sistema funciona correctamente y todos los datos están accesibles.',
    notasTecnicas: [
      {
        id: 'n1',
        tecnico: 'María Martínez',
        fecha: '2023-12-30T07:30:00Z',
        nota: 'Diagnóstico inicial: SSD con sectores dañados. Recomendado clonación.'
      },
      {
        id: 'n2',
        tecnico: 'María Martínez',
        fecha: '2023-12-30T10:00:00Z',
        nota: 'Recuperación de datos en progreso: 75% completado.'
      },
      {
        id: 'n3',
        tecnico: 'María Martínez',
        fecha: '2023-12-30T11:30:00Z',
        nota: 'Recuperación de datos completada: 98% de los datos recuperados. Procediendo con clonación.'
      },
      {
        id: 'n4',
        tecnico: 'María Martínez',
        fecha: '2023-12-30T13:00:00Z',
        nota: 'Clonación del sistema completada. Se va a realizar un test completo.'
      }
    ],
    satisfaccion: 5,
    valoracion: 'Increíble trabajo. María ha recuperado todos mis datos. ¡Gracias!',
    fechaCreacion: '2023-12-30T07:30:00Z',
    fechaAsignacion: '2023-12-30T07:30:00Z',
    fechaResolucion: '2023-12-30T14:30:00Z',
    tiempoEstimado: 24,
    tiempoReal: 7,
    costoReparacion: 229.99,
    piezasCambiadas: ['SSD nuevo', 'Cable SATA'],
    imagenes: ['/images/ssd_before.jpg', '/images/ssd_after.jpg']
  }
]

// GET /api/admin_informe_reparacion - Generar informe de reparación en PDF (admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ticketId = searchParams.get('ticketId')

    const ticket = ticketsReparacionMock.find(t => t.id === ticketId)

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ticket no encontrado'
        },
        { status: 404 }
      )
    }

    if (ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado') {
      return NextResponse.json(
        {
          success: false,
          error: 'El ticket debe estar resuelto o cerrado para generar el informe de reparación'
        },
        { status: 400 }
      )
    }

    // Generar descripción del informe de reparación en formato texto
    // En un sistema real, usaríamos jsPDF para generar el PDF
    const informeDescripcion = `
==================================================
INFORME DE REPARACIÓN
MicroInfo Shop S.L.
==================================================

DATOS DEL TICKET
-----------------
Número de ticket: ${ticket.numeroTicket}
Tipo: ${ticket.tipo}
Prioridad: ${ticket.prioridad}
Categoría: ${ticket.categoria}
Asunto: ${ticket.asunto}

DATOS DEL CLIENTE
------------------
Nombre: ${ticket.clienteNombre}
Email: ${ticket.clienteEmail}

DATOS DEL TÉCNICO
--------------------
Técnico: ${ticket.tecnicoNombre}
Fecha de asignación: ${new Date(ticket.fechaAsignacion || ticket.fechaCreacion).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
Fecha de resolución: ${new Date(ticket.fechaResolucion).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
Tiempo real de reparación: ${ticket.tiempoReal ? ticket.tiempoReal + ' horas' : 'N/A'}
Tiempo estimado: ${ticket.tiempoEstimado + ' horas'}

DIAGNÓSTICO
-------------
${ticket.diagnostico || 'No disponible'}

SOLUCIÓN
----------
${ticket.solucion || 'No disponible'}

NOTAS TÉCNICAS
------------------
${ticket.notasTecnicas.map(nota => `
Fecha: ${new Date(nota.fecha).toLocaleString('es-ES')}
Técnico: ${nota.tecnico}
Nota: ${nota.nota}
`).join('------------------')}

COSTO DE REPARACIÓN
----------------------
Costo: ${ticket.costoReparacion ? ticket.costoReparacion.toFixed(2) + '€' : 'Incluido en garantía'}
Piezas cambiadas: ${ticket.piezasCambiadas ? ticket.piezasCambiadas.join(', ') : 'Ninguna'}

SATISFACCIÓN Y VALORACIÓN
---------------------------
Nivel de satisfacción: ${ticket.satisfaccion ? ticket.satisfaccion + '/5' : 'N/A'}
Valoración: ${ticket.valoracion || 'No disponible'}

==================================================
MicroInfo Shop S.L.
CIF: B12345678
Dirección: Calle Principal 89, 28002 Madrid
Teléfono: +34 900 123 456
Email: soporte@microinfo.es
Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}
==================================================
    `.trim()

    return NextResponse.json({
      success: true,
      data: {
        ticket,
        informe: {
          numeroInforme: `INF-REP-${ticket.numeroTicket.split('-')[1]}`,
          descripcion: informeDescripcion,
          mensaje: 'Informe de reparación generado correctamente'
        }
      }
    })
  } catch (error) {
    console.error('Error en GET /api/admin_informe_reparacion/[ticketId]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar informe de reparación',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
