import { z } from 'zod'
import { TecnicoNivel, TicketTipo, TicketPrioridad, TicketEstado, ConocimientoTipo, DocumentoTipo, DocumentoEntidadTipo } from '@/types/enums'

export const createTecnicoSchema = z.object({
  usuarioId: z.string().min(1, 'Usuario ID es requerido'),
  especialidades: z.array(z.string()).optional(),
  nivel: z.nativeEnum(TecnicoNivel).default(TecnicoNivel.JUNIOR),
  fechaIncorporacion: z.date().optional()
})

export const updateTecnicoSchema = createTecnicoSchema.partial()

export const createTicketSchema = z.object({
  tipo: z.nativeEnum(TicketTipo),
  prioridad: z.nativeEnum(TicketPrioridad).default(TicketPrioridad.MEDIA),
  asunto: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  pedidoId: z.string().optional(),
  productoId: z.string().optional(),
  numeroSerieProducto: z.string().optional(),
  adjuntos: z.array(z.string()).optional()
})

export const updateTicketSchema = z.object({
  tecnicoId: z.string().optional(),
  prioridad: z.nativeEnum(TicketPrioridad).optional(),
  estado: z.nativeEnum(TicketEstado).optional(),
  diagnostico: z.string().optional(),
  solucion: z.string().optional(),
  tiempoEstimado: z.number().int().positive().optional(),
  tiempoReal: z.number().int().positive().optional(),
  costeReparacion: z.number().positive().optional()
})

export const asignarTecnicoSchema = z.object({
  tecnicoId: z.string().min(1, 'Técnico ID es requerido')
})

export const addComentarioSchema = z.object({
  contenido: z.string().min(1, 'El comentario no puede estar vacío').max(2000, 'Máximo 2000 caracteres'),
  adjuntos: z.array(z.string()).optional()
})

export const addNotaInternaSchema = z.object({
  contenido: z.string().min(1, 'La nota no puede estar vacía').max(2000, 'Máximo 2000 caracteres'),
  adjuntos: z.array(z.string()).optional()
})

export const valorarTicketSchema = z.object({
  puntuacion: z.number().int().min(1).max(5),
  comentario: z.string().max(500).optional()
})

export const cerrarTicketSchema = z.object({
  motivo: z.string().optional(),
  solucion: z.string().optional()
})

export const ticketFiltrosSchema = z.object({
  usuarioId: z.string().optional(),
  tecnicoId: z.string().optional(),
  tipo: z.nativeEnum(TicketTipo).optional(),
  prioridad: z.nativeEnum(TicketPrioridad).optional(),
  estado: z.nativeEnum(TicketEstado).optional(),
  fechaDesde: z.date().optional(),
  fechaHasta: z.date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
})

export const createConocimientoSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  contenido: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  categoria: z.string().optional(),
  etiquetas: z.array(z.string()).optional(),
  tipo: z.nativeEnum(ConocimientoTipo),
  productoRelacionadoId: z.string().optional()
})

export const updateConocimientoSchema = createConocimientoSchema.partial()

export const marcarUtilSchema = z.object({
  util: z.boolean()
})

export const conocimientoFiltrosSchema = z.object({
  categoria: z.string().optional(),
  tipo: z.nativeEnum(ConocimientoTipo).optional(),
  busqueda: z.string().optional(),
  productoId: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
})

export const generarDocumentoSchema = z.object({
  tipo: z.nativeEnum(DocumentoTipo),
  entidadTipo: z.nativeEnum(DocumentoEntidadTipo),
  entidadId: z.string().min(1, 'Entidad ID es requerido')
})

export const documentoFiltrosSchema = z.object({
  tipo: z.nativeEnum(DocumentoTipo).optional(),
  entidadTipo: z.nativeEnum(DocumentoEntidadTipo).optional(),
  entidadId: z.string().optional(),
  fechaDesde: z.date().optional(),
  fechaHasta: z.date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
})
