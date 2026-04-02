import { TecnicoNivel, TicketTipo, TicketPrioridad, TicketEstado, SeguimientoTipo, ConocimientoTipo, DocumentoTipo, DocumentoEntidadTipo } from './enums'
import { User } from './auth'
import { Producto, Categoria, Pedido, Valoracion } from './tienda'

// ==================== TÉCNICOS ====================

export interface Tecnico {
  id: string
  usuarioId: string
  especialidades?: string | null
  nivel: TecnicoNivel
  disponible: boolean
  ticketsAsignados: number
  ticketsResueltos: number
  valoracionMedia: number
  fechaIncorporacion?: Date | null
  fechaCreacion: Date
  usuario: User
}

export interface TecnicoConEstadisticas extends Tecnico {
  ticketsActivos: number
  tiempoMedioResolucion: number
}

export interface CreateTecnicoRequest {
  usuarioId: string
  especialidades?: string[]
  nivel?: TecnicoNivel
  fechaIncorporacion?: Date
}

export interface UpdateTecnicoRequest {
  especialidades?: string[]
  nivel?: TecnicoNivel
  disponible?: boolean
  fechaIncorporacion?: Date
}

// ==================== TICKETS SAT ====================

export interface Ticket {
  id: string
  numeroTicket: string
  usuarioId: string
  tecnicoId?: string | null
  pedidoId?: string | null
  productoId?: string | null
  tipo: TicketTipo
  prioridad: TicketPrioridad
  estado: TicketEstado
  asunto: string
  descripcion: string
  numeroSerieProducto?: string | null
  diagnostico?: string | null
  solucion?: string | null
  tiempoEstimado?: number | null
  tiempoReal?: number | null
  costeReparacion?: number | null
  fechaCreacion: Date
  fechaAsignacion?: Date | null
  fechaResolucion?: Date | null
  fechaCierre?: Date | null
  satisfaccion?: number | null
  usuario: User
  tecnico?: Tecnico | null
  pedido?: Pedido
  producto?: Producto
  seguimientos?: SeguimientoTicket[]
  documentos?: Documento[]
}

export interface CreateTicketRequest {
  tipo: TicketTipo
  prioridad?: TicketPrioridad
  asunto: string
  descripcion: string
  pedidoId?: string
  productoId?: string
  numeroSerieProducto?: string
  adjuntos?: string[]
}

export interface UpdateTicketRequest {
  tecnicoId?: string
  prioridad?: TicketPrioridad
  estado?: TicketEstado
  diagnostico?: string
  solucion?: string
  tiempoEstimado?: number
  tiempoReal?: number
  costeReparacion?: number
}

export interface AsignarTecnicoRequest {
  tecnicoId: string
}

export interface TicketFiltros {
  usuarioId?: string
  tecnicoId?: string
  tipo?: TicketTipo
  prioridad?: TicketPrioridad
  estado?: TicketEstado
  fechaDesde?: Date
  fechaHasta?: Date
  page?: number
  limit?: number
}

export interface TicketListResponse {
  tickets: Ticket[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TicketEstadisticas {
  total: number
  porEstado: Record<TicketEstado, number>
  porPrioridad: Record<TicketPrioridad, number>
  porTipo: Record<TicketTipo, number>
  resueltosEsteMes: number
  tiempoMedioResolucion: number
  satisfaccionMedia: number
}

// ==================== SEGUIMIENTO DE TICKETS ====================

export interface SeguimientoTicket {
  id: string
  ticketId: string
  usuarioId: string
  tipo: SeguimientoTipo
  contenido: string
  esInterno: boolean
  adjuntos?: string | null
  fechaCreacion: Date
  ticket: Ticket
  usuario: User
}

export interface AddComentarioRequest {
  contenido: string
  adjuntos?: string[]
}

export interface AddNotaInternaRequest {
  contenido: string
  adjuntos?: string[]
}

export interface ValorarTicketRequest {
  puntuacion: number
  comentario?: string
}

// ==================== BASE DE CONOCIMIENTO ====================

export interface BaseConocimiento {
  id: string
  titulo: string
  contenido: string
  categoria?: string | null
  etiquetas?: string | null
  tipo: ConocimientoTipo
  productoRelacionadoId?: string | null
  autorId: string
  vistas: number
  utilSi: number
  utilNo: number
  activo: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
  productoRelacionado?: Producto
  autor: User
}

export interface CreateConocimientoRequest {
  titulo: string
  contenido: string
  categoria?: string
  etiquetas?: string[]
  tipo: ConocimientoTipo
  productoRelacionadoId?: string
}

export interface UpdateConocimientoRequest {
  titulo?: string
  contenido?: string
  categoria?: string
  etiquetas?: string[]
  tipo?: ConocimientoTipo
  productoRelacionadoId?: string
  activo?: boolean
}

export interface MarcarUtilRequest {
  util: boolean
}

export interface ConocimientoFiltros {
  categoria?: string
  tipo?: ConocimientoTipo
  busqueda?: string
  productoId?: string
  page?: number
  limit?: number
}

export interface ConocimientoListResponse {
  articulos: BaseConocimiento[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ConocimientoEstadisticas {
  total: number
  porTipo: Record<ConocimientoTipo, number>
  masVistos: BaseConocimiento[]
  masUtiles: BaseConocimiento[]
  categoriaMasPopular: string
}

// ==================== DOCUMENTOS ====================

export interface Documento {
  id: string
  tipo: DocumentoTipo
  numeroDocumento: string
  entidadTipo: DocumentoEntidadTipo
  entidadId: string
  usuarioGeneradorId: string
  contenido?: string | null
  rutaArchivo?: string | null
  fechaGeneracion: Date
  usuarioGenerador: User
  pedido?: Pedido
  ticket?: Ticket
}

export interface DocumentoFiltros {
  tipo?: DocumentoTipo
  entidadTipo?: DocumentoEntidadTipo
  entidadId?: string
  fechaDesde?: Date
  fechaHasta?: Date
  page?: number
  limit?: number
}

// Re-exportar tipos necesarios
export type { User } from './auth'
export type { Producto, Categoria, Pedido, Valoracion } from './tienda'
