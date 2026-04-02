import { DocumentoTipo, EstadoDocumento, DocumentoEntidadTipo } from './enums'

// ============================================================================
// TIPOS BASE DE DOCUMENTOS
// ============================================================================

export interface DocumentoExtendido {
    id: string
    tipo: DocumentoTipo
    numeroDocumento: string
    entidadTipo: DocumentoEntidadTipo
    ticketId?: string | null
    pedidoId?: string | null
    productoId?: string | null
    usuarioGeneradorId: string
    contenido?: string | null
    rutaArchivo?: string | null
    fechaGeneracion: Date
    metadatos?: string | null
    estadoDocumento: EstadoDocumento
    firmaCliente?: string | null
    firmaTecnico?: string | null
    evidenciasFotos?: string | null
    fechaVencimiento?: Date | null
    fechaFirma?: Date | null
    fechaEnvio?: Date | null
    documentoRelacionadoId?: string | null
}

export interface EvidenciaFotografica {
    id: string
    url: string
    descripcion?: string
    fechaCaptura: Date
}

// ============================================================================
// METADATOS ESPECÍFICOS POR TIPO DE DOCUMENTO
// ============================================================================

// FASE 1: Orden de Servicio/Recibo de Entrega
export interface MetadatosOrdenServicio {
    // Datos del cliente
    cliente: {
        nombreCompleto: string
        identificacion: string // DNI/RUC
        telefono: string
        correoElectronico: string
        direccion: string
    }

    // Datos del equipo
    equipo: {
        tipoEquipo: string // smartphone, tablet, laptop, etc.
        marca: string
        modelo: string
        numeroSerie?: string
        imei?: string
        color?: string
        caracteristicasFisicas?: string
        accesoriosEntregados: string[] // cargador, funda, cables, etc.
    }

    // Descripción del problema
    problema: {
        sintomasReportados: string
        frecuenciaFallo?: string
        condicionesOcurrencia?: string
    }

    // Estado físico al ingreso
    estadoFisico: {
        golpes?: boolean
        rayones?: boolean
        danosVisibles?: string
        estadoPantalla?: string
        funcionalidadBotones?: string
    }

    // Observaciones y términos
    observacionesTecnico?: string
    terminosAceptados: boolean
    fechaEstimadaDiagnostico?: Date
}

// FASE 2: Informe de Diagnóstico y Presupuesto
export interface ItemRepuesto {
    codigo: string
    descripcion: string
    cantidad: number
    precioUnitario: number
    subtotal: number
}

export interface ActividadManoObra {
    descripcion: string
    horasEstimadas: number
    precioHora: number
    subtotal: number
}

export interface MetadatosDiagnosticoPresupuesto {
    // Técnico asignado
    tecnicoAsignado: {
        id: string
        nombre: string
    }

    // Diagnóstico detallado
    diagnostico: {
        pruebasRealizadas: string[]
        resultadosObtenidos: string
        componentesDefectuosos: string[]
        causaRaiz: string
    }

    // Reparación propuesta
    reparacionPropuesta: {
        descripcionTrabajos: string
        repuestosNecesarios: ItemRepuesto[]
        manoObra: ActividadManoObra[]
    }

    // Costos
    costos: {
        costoRepuestos: number
        costoManoObra: number
        costosAdicionales?: {
            descripcion: string
            monto: number
        }[]
        subtotal: number
        iva: number
        total: number
    }

    // Información adicional
    tiempoEstimadoReparacion: number // en horas
    garantiaOfrecida: {
        repuestos: number // meses
        manoObra: number // meses
    }
    validezPresupuesto: number // días
    alternativasReparacion?: string[]
    recomendacionesAdicionales?: string
}

// FASE 3: Aceptación del Presupuesto
export interface MetadatosAceptacionPresupuesto {
    presupuestoId: string
    numeroPresupuesto: string
    fechaAceptacion: Date
    formaAprobacion: 'firma_fisica' | 'email' | 'sms' | 'portal_web'
    metodoPagoAcordado: 'efectivo' | 'tarjeta' | 'transferencia'
    autorizaciones: {
        procederReparacion: boolean
        adquirirRepuestos: boolean
        trabajosAdicionalesHasta?: number // monto máximo
    }
    datosContactoConfirmados: {
        telefono: string
        email: string
    }
    fechaLimiteReparacion?: Date
    // Snapshot del presupuesto aceptado
    presupuestoSnapshot?: {
        repuestos: ItemRepuesto[]
        manoObra: ActividadManoObra[]
        costos: {
            subtotal: number
            iva: number
            total: number
        }
    }
}

// FASE 3: Rechazo del Presupuesto
export interface MetadatosRechazoPresupuesto {
    presupuestoId: string
    numeroPresupuesto: string
    fechaRechazo: Date
    motivoRechazo: 'costo_elevado' | 'tiempo_reparacion' | 'decidio_no_reparar' | 'otra_empresa' | 'otro'
    motivoDetalle?: string
    formaRechazo: 'firma_fisica' | 'email' | 'sms' | 'portal_web'
    instrucciones: {
        retiroEquipo: boolean
        fechaLimiteRetiro?: Date
        costoDiagnostico?: number
    }
    estadoEquipo: string
}

// FASE 4: Extensión de Presupuesto
export interface MetadatosExtensionPresupuesto {
    presupuestoOriginalId: string
    numeroPresupuestoOriginal: string
    fechaDescubrimiento: Date
    motivoExtension: 'danos_adicionales' | 'componentes_adicionales' | 'problemas_colaterales' | 'otro'
    diagnosticoAmpliado: {
        descripcion: string
        evidencias?: string[] // URLs de fotos/documentos
    }
    nuevosTrabajos: {
        descripcionDetallada: string
        repuestosAdicionales: ItemRepuesto[]
        manoObraExtra: ActividadManoObra[]
    }
    costoAdicional: {
        repuestos: number
        manoObra: number
        otros?: number
        total: number
    }
    nuevoTiempoEstimado: number // horas adicionales
    impactoGarantia?: string
    fechaLimiteRespuesta?: Date
}

// FASE 4: Aceptación de la Extensión
export interface MetadatosAceptacionExtension {
    extensionId: string
    numeroExtension: string
    fechaAceptacion: Date
    aceptacionEspecifica: {
        trabajosAdicionales: boolean
        costoExtra: boolean
        tiempoAdicional: boolean
    }
    nuevoTotalAprobado: number
    nuevaFechaEstimadaEntrega?: Date
    formaAprobacion: 'firma_fisica' | 'email' | 'sms' | 'portal_web'
}

// Orden de Trabajo Interna
export interface TareaInterna {
    id: string
    descripcion: string
    tecnicoAsignado: string
    horasEstimadas: number
    prioridad: 'baja' | 'media' | 'alta' | 'urgente'
    estado: 'pendiente' | 'en_progreso' | 'completada'
    fechaInicio?: Date
    fechaFin?: Date
}

export interface MetadatosOrdenTrabajoInterna {
    ticketId: string
    numeroTicket: string
    tareas: TareaInterna[]
    repuestosUtilizar: {
        codigo: string
        descripcion: string
        cantidad: number
        ubicacionAlmacen?: string
    }[]
    horasTotalesEstimadas: number
    prioridad: 'baja' | 'media' | 'alta' | 'urgente'
    notas?: string
}

// Hoja de Ruta del Equipo
export interface MovimientoEquipo {
    id: string
    departamento: string
    ubicacion: string
    responsable: string
    fechaHoraEntrada: Date
    fechaHoraSalida?: Date
    accionRealizada?: string
    observaciones?: string
}

export interface MetadatosHojaRuta {
    ticketId: string
    numeroTicket: string
    equipoId: string
    movimientos: MovimientoEquipo[]
    ubicacionActual: string
    responsableActual: string
}

// Albarán de Entrega Reparado
export interface MetadatosAlbaranEntrega {
    ticketId: string
    numeroTicket: string
    equipoEntregado: {
        tipo: string
        marca: string
        modelo: string
        numeroSerie?: string
    }
    reparacionesRealizadas: string[]
    repuestosUtilizados: {
        codigo: string
        descripcion: string
        cantidad: number
        garantiaMeses: number
    }[]
    garantiaProporcionada: {
        repuestos: number // meses
        manoObra: number // meses
        condiciones?: string
    }
    estadoEntrega: {
        funcionamientoVerificado: boolean
        pruebasRealizadas: string[]
        observaciones?: string
    }
    pagoRecibido: {
        metodo: 'efectivo' | 'tarjeta' | 'transferencia'
        monto: number
        referencia?: string
    }
    fechaEntrega: Date
    clienteRecibe: {
        nombre: string;
        identificacion: string;
    }
}

// Factura
export interface MetadatosFactura {
    ticketId?: string
    numeroTicket?: string
    pedidoId?: string
    numeroPedido?: string
    cliente: {
        nombre: string
        identificacion: string
        direccion?: string
        email?: string
        telefono?: string
    }
    equipo?: {
        tipo: string
        marca: string
        modelo: string
        numeroSerie?: string
    }
    items: {
        descripcion: string
        cantidad: number
        precioUnitario: number
        subtotal: number
    }[]
    totales: {
        subtotal: number
        iva: number
        total: number
    }
    pago: {
        metodo: string
        monto: number
        referencia?: string
    }
    fechaEmision: Date
}

// ============================================================================
// TIPOS UNIÓN PARA METADATOS
// ============================================================================

export type DocumentoMetadatos =
    | MetadatosOrdenServicio
    | MetadatosDiagnosticoPresupuesto
    | MetadatosAceptacionPresupuesto
    | MetadatosRechazoPresupuesto
    | MetadatosExtensionPresupuesto
    | MetadatosAceptacionExtension
    | MetadatosOrdenTrabajoInterna
    | MetadatosHojaRuta
    | MetadatosAlbaranEntrega
    | MetadatosFactura

// ============================================================================
// TIPOS PARA FORMULARIOS Y CREACIÓN
// ============================================================================

export interface CrearDocumentoInput {
    tipo: DocumentoTipo
    entidadTipo: DocumentoEntidadTipo
    ticketId?: string
    pedidoId?: string
    productoId?: string
    metadatos?: DocumentoMetadatos
    evidenciasFotos?: EvidenciaFotografica[]
}

export interface ActualizarDocumentoInput {
    id: string
    metadatos?: DocumentoMetadatos
    estadoDocumento?: EstadoDocumento
    firmaCliente?: string
    firmaTecnico?: string
    evidenciasFotos?: EvidenciaFotografica[]
}

export interface FirmarDocumentoInput {
    documentoId: string
    tipoFirma: 'cliente' | 'tecnico'
    firmaBase64: string
}

// ============================================================================
// TIPOS PARA BÚSQUEDA Y FILTROS
// ============================================================================

export interface FiltrosDocumento {
    tipo?: DocumentoTipo[]
    estado?: EstadoDocumento[]
    entidadTipo?: DocumentoEntidadTipo
    ticketId?: string
    pedidoId?: string
    productoId?: string
    usuarioGeneradorId?: string
    fechaDesde?: Date
    fechaHasta?: Date
    busqueda?: string // búsqueda en número de documento o contenido
}

export interface DocumentoConRelaciones extends DocumentoExtendido {
    ticket?: {
        id: string
        numeroTicket: string
        asunto: string
        tecnico?: {
            id: string
            usuario: {
                id: string
                nombre: string
                apellidos: string | null
            }
        } | null
    }
    pedido?: {
        id: string
        numeroPedido: string
    }
    producto?: {
        id: string
        nombre: string
    }
    usuarioGenerador: {
        id: string
        nombre: string
        email: string
    }
    documentoRelacionado?: DocumentoExtendido
    documentosHijos?: DocumentoExtendido[]
}

// ============================================================================
// TIPOS PARA RESPUESTAS DE API
// ============================================================================

export interface DocumentoResponse {
    success: boolean
    data?: DocumentoConRelaciones
    error?: string
}

export interface DocumentosListResponse {
    success: boolean
    data?: {
        documentos: DocumentoConRelaciones[]
        total: number
        pagina: number
        porPagina: number
    }
    error?: string
}

export interface GenerarPDFResponse {
    success: boolean
    data?: {
        url: string
        nombreArchivo: string
    }
    error?: string
}
