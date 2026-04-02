// Enums del sistema - exportados desde Prisma

export enum UserRole {
  CLIENTE = 'cliente',
  TECNICO = 'tecnico',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

export enum ProductoTipo {
  EQUIPO_COMPLETO = 'equipo_completo',
  COMPONENTE = 'componente',
  PERIFERICO = 'periferico',
  ACCESORIO = 'accesorio',
  SOFTWARE = 'software'
}

export enum PedidoEstado {
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  PROCESANDO = 'procesando',
  ENVIADO = 'enviado',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
  DEVUELTO = 'devuelto'
}

export enum MetodoPago {
  TARJETA = 'tarjeta',
  PAYPAL = 'paypal',
  TRANSFERENCIA = 'transferencia',
  CONTRAREEMBOLSO = 'contrareembolso'
}

export enum TecnicoNivel {
  JUNIOR = 'junior',
  SENIOR = 'senior',
  EXPERTO = 'experto'
}

export enum TicketTipo {
  INCIDENCIA = 'incidencia',
  CONSULTA = 'consulta',
  REPARACION = 'reparacion',
  GARANTIA = 'garantia',
  DEVOLUCION = 'devolucion',
  OTRO = 'otro'
}

export enum TicketPrioridad {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente'
}

export enum TicketEstado {
  ABIERTO = 'abierto',
  ASIGNADO = 'asignado',
  EN_PROGRESO = 'en_progreso',
  PENDIENTE_CLIENTE = 'pendiente_cliente',
  PENDIENTE_PIEZA = 'pendiente_pieza',
  RESUELTO = 'resuelto',
  CERRADO = 'cerrado',
  CANCELADO = 'cancelado'
}

export enum SeguimientoTipo {
  COMENTARIO = 'comentario',
  CAMBIO_ESTADO = 'cambio_estado',
  ASIGNACION = 'asignacion',
  NOTA_INTERNA = 'nota_interna',
  ADJUNTO = 'adjunto'
}

export enum ConocimientoTipo {
  SOLUCION = 'solucion',
  PROCEDIMIENTO = 'procedimiento',
  FAQ = 'faq',
  MANUAL = 'manual',
  TUTORIAL = 'tutorial'
}

export enum DocumentoTipo {
  FACTURA = 'factura',
  ALBARAN = 'albaran',
  PRESUPUESTO = 'presupuesto',
  INFORME_REPARACION = 'informe_reparacion',
  GARANTIA = 'garantia',
  MANUAL = 'manual',
  // Nuevos tipos para el flujo de reparación
  ORDEN_SERVICIO = 'orden_servicio',
  DIAGNOSTICO_PRESUPUESTO = 'diagnostico_presupuesto',
  ACEPTACION_PRESUPUESTO = 'aceptacion_presupuesto',
  RECHAZO_PRESUPUESTO = 'rechazo_presupuesto',
  EXTENSION_PRESUPUESTO = 'extension_presupuesto',
  ACEPTACION_EXTENSION = 'aceptacion_extension',
  ORDEN_TRABAJO_INTERNA = 'orden_trabajo_interna',
  HOJA_RUTA = 'hoja_ruta',
  ALBARAN_ENTREGA = 'albaran_entrega',
  ORDEN_INTERVENCION = 'orden_intervencion',
  // Nuevas plantillas de documentos
  INFORME_MANTENIMIENTO = 'informe_mantenimiento',
  ACTA_INSTALACION = 'acta_instalacion',
  INFORME_ENTREGA = 'informe_entrega',
  AUTORIZACION_ACCESO_REMOTO = 'autorizacion_acceso_remoto',
  ENCUESTA_SATISFACCION = 'encuesta_satisfaccion',
  INFORME_MANTENIMIENTO_PREVENTIVO = 'informe_mantenimiento_preventivo',
  ACTA_INSTALACION_CONFIGURACION = 'acta_instalacion_configuracion'
}

export enum DocumentoEntidadTipo {
  PEDIDO = 'pedido',
  TICKET = 'ticket',
  PRODUCTO = 'producto'
}

export enum EstadoDocumento {
  BORRADOR = 'borrador',
  PENDIENTE_FIRMA = 'pendiente_firma',
  FIRMADO = 'firmado',
  ENVIADO = 'enviado',
  ACEPTADO = 'aceptado',
  RECHAZADO = 'rechazado',
  VENCIDO = 'vencido',
  ANULADO = 'anulado'
}

