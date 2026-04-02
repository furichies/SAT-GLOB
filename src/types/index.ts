// Re-exportar todos los tipos
export * from './auth'
export * from './tienda'
export * from './sat'
export * from './enums'

// Exportar tipos específicos de documentos para evitar conflictos
export type {
  DocumentoExtendido,
  EvidenciaFotografica,
  MetadatosOrdenServicio,
  MetadatosDiagnosticoPresupuesto,
  MetadatosAceptacionPresupuesto,
  MetadatosRechazoPresupuesto,
  MetadatosExtensionPresupuesto,
  MetadatosAceptacionExtension,
  MetadatosOrdenTrabajoInterna,
  MetadatosHojaRuta,
  MetadatosAlbaranEntrega,
  DocumentoMetadatos,
  ItemRepuesto,
  ActividadManoObra,
  TareaInterna,
  MovimientoEquipo,
  CrearDocumentoInput,
  ActualizarDocumentoInput,
  FirmarDocumentoInput,
  FiltrosDocumento,
  DocumentoConRelaciones,
  DocumentoResponse,
  DocumentosListResponse,
  GenerarPDFResponse
} from './documentos'

// Tipos generales adicionales

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginacionParams {
  page: number
  limit: number
}

export interface PaginacionResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FiltrosComunes {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type FileUpload = File | { file: File; preview?: string }

export interface NotificationData {
  id: string
  tipo: 'info' | 'success' | 'warning' | 'error'
  titulo: string
  mensaje: string
  fecha: Date
  leida: boolean
  accion?: {
    label: string
    url: string
  }
}
