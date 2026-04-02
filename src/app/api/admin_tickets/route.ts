import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// Mock data para tickets SAT del admin
interface TicketMock {
  id: string
  numeroTicket: string
  clienteId: string
  clienteNombre: string
  tecnicoId: string | null
  tecnicoNombre: string | null
  prioridad: string
  tipo: string
  asunto: string
  descripcion: string
  categoria: string
  estado: string
  notasInternas: any[]
  seguimientos: any[]
  diagnostico?: string
  solucion?: string | null
  fechaCreacion: string
  fechaAsignacion: string | null
  fechaResolucion: string | null
  satisfaccion: number | null
  valoracion: string | null
  tiempoEstimado: number
  tiempoReal: number | null
}

let ticketsAdminMock: TicketMock[] = [
  {
    id: '1',
    numeroTicket: 'SAT-2023-0045',
    clienteId: 'cliente-1',
    clienteNombre: 'Pedro Sánchez',
    tecnicoId: 'tecnico-1',
    tecnicoNombre: 'Carlos García',
    prioridad: 'urgente',
    tipo: 'incidencia',
    asunto: 'Portátil no enciende',
    descripcion: 'El portátil no enciende al presionar el botón de encendido. No hace ningun ruido ni muestra señal de vida.',
    categoria: 'Hardware',
    estado: 'pendiente',
    notasInternas: [
      {
        id: 'n1',
        tecnicoId: 'tecnico-1',
        tecnicoNombre: 'Carlos García',
        nota: 'Ticket recibido. Pendiente de revisión.',
        fecha: '2023-12-30T08:00:00Z',
        esInterna: true
      }
    ],
    seguimientos: [
      {
        id: 's1',
        usuarioId: 'cliente-1',
        tecnicoId: null,
        tipo: 'cambio_estado',
        contenido: 'Ticket creado. Estado: Pendiente',
        esInterna: false,
        fechaCreacion: '2023-12-30T08:00:00Z'
      }
    ],
    fechaCreacion: '2023-12-30T08:00:00Z',
    fechaAsignacion: null,
    fechaResolucion: null,
    satisfaccion: null,
    valoracion: null,
    tiempoEstimado: 24,
    tiempoReal: null
  },
  {
    id: '2',
    numeroTicket: 'SAT-2023-0044',
    clienteId: 'cliente-2',
    clienteNombre: 'Laura Rodríguez',
    tecnicoId: 'tecnico-1',
    tecnicoNombre: 'Carlos García',
    prioridad: 'alta',
    tipo: 'reparacion',
    asunto: 'SSD corrupto',
    descripcion: 'El SSD muestra errores aleatorios y se bloquea. Necesito ayuda para recuperar los datos.',
    categoria: 'Almacenamiento',
    estado: 'en_progreso',
    diagnostico: 'El SSD tiene sectores dañados. Se va a realizar recuperación de datos y clonación.',
    solucion: null,
    notasInternas: [
      {
        id: 'n1',
        tecnicoId: 'tecnico-1',
        tecnicoNombre: 'Carlos García',
        nota: 'Técnico asignado. Estado: Asignado',
        fecha: '2023-12-30T07:30:00Z',
        esInterna: true
      },
      {
        id: 'n2',
        tecnicoId: 'tecnico-1',
        tecnicoNombre: 'Carlos García',
        nota: 'Diagnóstico inicial: SSD con sectores dañados. Recomendado clonación.',
        fecha: '2023-12-30T09:00:00Z',
        esInterna: true
      }
    ],
    seguimientos: [
      {
        id: 's1',
        usuarioId: 'cliente-2',
        tecnicoId: null,
        tipo: 'cambio_estado',
        contenido: 'Ticket creado. Estado: Abierto',
        esInterna: false,
        fechaCreacion: '2023-12-30T07:30:00Z'
      },
      {
        id: 's2',
        usuarioId: 'tecnico-1',
        tecnicoId: 'tecnico-1',
        tipo: 'asignacion',
        contenido: 'Técnico asignado. Estado: Asignado',
        esInterna: true,
        fechaCreacion: '2023-12-30T07:30:00Z'
      },
      {
        id: 's3',
        usuarioId: 'tecnico-1',
        tecnicoId: 'tecnico-1',
        tipo: 'comentario',
        contenido: 'Diagnóstico: SSD con sectores dañados. Recomendado clonación.',
        esInterna: true,
        fechaCreacion: '2023-12-30T09:00:00Z'
      }
    ],
    fechaCreacion: '2023-12-30T07:30:00Z',
    fechaAsignacion: '2023-12-30T07:30:00Z',
    fechaResolucion: null,
    satisfaccion: null,
    valoracion: null,
    tiempoEstimado: 24,
    tiempoReal: null
  }
]

// Mock data para técnicos
let tecnicosAdminMock = [
  {
    id: 'tecnico-1',
    nombre: 'Carlos García',
    apellidos: 'García Fernández',
    email: 'carlos.garcia@microinfo.es',
    especialidades: ['Hardware', 'Portátiles', 'SSD', 'HDD'],
    nivel: 'experto',
    disponible: true,
    valoracionMedia: 4.8,
    ticketsAsignados: 3,
    ticketsResueltos: 45
  },
  {
    id: 'tecnico-2',
    nombre: 'María Martínez',
    apellidos: 'Martínez Sánchez',
    email: 'maria.martinez@microinfo.es',
    especialidades: ['Monitores', 'Periféricos', 'Audio'],
    nivel: 'senior',
    disponible: true,
    valoracionMedia: 4.9,
    ticketsAsignados: 2,
    ticketsResueltos: 38
  }
]

// GET /api/admin_tickets - Listar tickets SAT (admin)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const estado = searchParams.get('estado') || ''
    const prioridad = searchParams.get('prioridad') || ''
    const tecnico = searchParams.get('tecnico') || ''
    const soloPendientes = searchParams.get('solo_pendientes') === 'true'

    let ticketsFiltrados = ticketsAdminMock.filter(t => {
      if (estado && t.estado !== estado) return false
      if (prioridad && t.prioridad !== prioridad) return false
      if (tecnico && t.tecnicoId !== tecnico) return false
      if (soloPendientes && (t.estado === 'resuelto' || t.estado === 'cerrado' || t.estado === 'cancelado')) return false
      return true
    })

    // Enrich con información del cliente y técnico
    const ticketsConInfo = ticketsFiltrados.map(ticket => {
      const tecnicoInfo = tecnicosAdminMock.find(t => t.id === ticket.tecnicoId)
      return {
        ...ticket,
        tecnico: tecnicoInfo ? {
          nombre: tecnicoInfo.nombre,
          especialidades: tecnicoInfo.especialidades,
          nivel: tecnicoInfo.nivel,
          valoracionMedia: tecnicoInfo.valoracionMedia
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        tickets: ticketsConInfo,
        totalTickets: ticketsConInfo.length
      }
    })
  } catch (error) {
    console.error('Error en GET /api/admin_tickets:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener tickets del admin'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin_tickets - Asignar técnico o cambiar estado
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const body = await req.json()
    const { tecnicoId, notaInterna, estado, diagnostico, solucion, motivo } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID es requerido' }, { status: 400 })
    }

    const ticket = ticketsAdminMock.find(t => t.id === id)

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket no encontrado' }, { status: 404 })
    }

    // LOGICA ASIGNAR TECNICO
    if (tecnicoId) {
      const tecnico = tecnicosAdminMock.find(t => t.id === tecnicoId)
      if (!tecnico) {
        return NextResponse.json({ success: false, error: 'Técnico no encontrado' }, { status: 404 })
      }

      // Actualizar ticket
      ticket.tecnicoId = tecnicoId
      ticket.tecnicoNombre = tecnico.nombre + ' ' + tecnico.apellidos
      ticket.estado = ticket.estado === 'pendiente' ? 'asignado' : ticket.estado
      ticket.fechaAsignacion = new Date().toISOString()

      // Crear nota interna
      if (notaInterna) {
        ticket.notasInternas.push({
          id: 'n' + randomUUID(),
          tecnicoId,
          tecnicoNombre: tecnico.nombre + ' ' + tecnico.apellidos,
          nota: `Asignación de técnico: ${notaInterna}`,
          fecha: new Date().toISOString(),
          esInterna: true
        })
      }

      // Crear seguimiento de asignación
      ticket.seguimientos.push({
        id: 's' + randomUUID(),
        usuarioId: tecnicoId,
        tecnicoId,
        tipo: 'asignacion',
        contenido: `Técnico asignado: ${tecnico.nombre} ${tecnico.apellidos}. Estado: ${ticket.estado}`,
        esInterna: true,
        fechaCreacion: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        data: {
          ticket,
          tecnico,
          mensaje: 'Técnico asignado correctamente'
        }
      })
    }

    // LOGICA CAMBIAR ESTADO
    if (estado) {
      // Actualizar ticket
      ticket.estado = estado

      if (diagnostico) {
        ticket.diagnostico = diagnostico
      }

      if (solucion) {
        ticket.solucion = solucion
      }

      if (motivo) {
        ticket.descripcion += `\n\nMotivo de cambio de estado: ${motivo}`
      }

      // Calcular tiempo real si el ticket se resuelve
      if (estado === 'resuelto') {
        const tiempoReal = Math.round((Date.now() - new Date(ticket.fechaCreacion).getTime()) / (1000 * 60 * 60))
        ticket.tiempoReal = tiempoReal
        ticket.fechaResolucion = new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: {
          ticket,
          mensaje: 'Estado del ticket actualizado correctamente'
        }
      })
    }

    return NextResponse.json({ success: false, error: 'Solicitud inválida: falta tecnicoId o estado' }, { status: 400 })

  } catch (error) {
    console.error('Error en PUT /api/admin_tickets:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar ticket',
        datos: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
