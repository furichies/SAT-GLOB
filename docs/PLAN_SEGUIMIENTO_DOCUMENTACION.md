# Plan de Implementación: Sistema de Seguimiento y Documentación

## Objetivo
Implementar un sistema completo de gestión documental para el proceso de reparación de equipos microelectrónicos, siguiendo el flujo de trabajo definido por el usuario.

## Fases del Proyecto

### FASE 1: Extensión del Modelo de Datos

#### 1.1 Actualizar Schema de Prisma
- [x] Revisar modelo `Documento` existente
- [ ] Ampliar enum `DocumentoTipo` con nuevos tipos:
  - `orden_servicio` - Orden de Servicio/Recibo de Entrega
  - `diagnostico_presupuesto` - Informe de Diagnóstico y Presupuesto
  - `aceptacion_presupuesto` - Aceptación del Presupuesto
  - `rechazo_presupuesto` - Rechazo del Presupuesto
  - `extension_presupuesto` - Extensión de Presupuesto
  - `aceptacion_extension` - Aceptación de la Extensión
  - `orden_trabajo_interna` - Orden de Trabajo Interna
  - `hoja_ruta` - Hoja de Ruta del Equipo
  - `albaran_entrega` - Albarán de Entrega Reparado

- [ ] Agregar campos adicionales al modelo `Documento`:
  ```prisma
  model Documento {
    // ... campos existentes ...
    
    // Metadatos JSON para cada tipo de documento
    metadatos          String?  // JSON con datos específicos del documento
    estadoDocumento    EstadoDocumento @default(borrador)
    firmaCliente       String?  // Firma digital del cliente
    firmaTecnico       String?  // Firma digital del técnico
    evidenciasFotos    String?  // JSON array con URLs de fotos
    fechaVencimiento   DateTime? // Para presupuestos
    documentoRelacionadoId String? // Para extensiones/rechazos
    documentoRelacionado Documento? @relation("DocumentoRelacion", fields: [documentoRelacionadoId], references: [id])
    documentosHijos    Documento[] @relation("DocumentoRelacion")
  }
  
  enum EstadoDocumento {
    borrador
    pendiente_firma
    firmado
    enviado
    aceptado
    rechazado
    vencido
    anulado
  }
  ```

#### 1.2 Crear Tipos TypeScript
- [ ] Definir interfaces para cada tipo de documento
- [ ] Crear tipos para metadatos específicos
- [ ] Validaciones con Zod

### FASE 2: API Endpoints

#### 2.1 CRUD de Documentos
- [x] `GET /api/admin/documentos` - Listar todos los documentos
- [x] `GET /api/admin/documentos/[id]` - Obtener documento específico
- [x] `POST /api/admin/documentos` - Crear nuevo documento
- [x] `PUT /api/admin/documentos/[id]` - Actualizar documento
- [x] `DELETE /api/admin/documentos/[id]` - Eliminar documento

#### 2.2 Endpoints Especializados
- [ ] `POST /api/admin/documentos/generar-orden-servicio` - Generar Orden de Servicio
- [ ] `POST /api/admin/documentos/generar-diagnostico` - Generar Diagnóstico
- [ ] `POST /api/admin/documentos/generar-presupuesto` - Generar Presupuesto
- [ ] `POST /api/admin/documentos/aceptar-presupuesto` - Aceptar Presupuesto
- [ ] `POST /api/admin/documentos/rechazar-presupuesto` - Rechazar Presupuesto
- [ ] `POST /api/admin/documentos/generar-extension` - Generar Extensión
- [ ] `POST /api/admin/documentos/generar-albaran` - Generar Albarán

#### 2.3 Utilidades
- [ ] `POST /api/admin/documentos/[id]/firmar` - Firmar documento (POSPUESTO - sin firma digital)
- [ ] `POST /api/admin/documentos/[id]/enviar` - Enviar documento por email/SMS
- [x] `GET /api/admin/documentos/[id]/pdf` - Generar y descargar PDF
- [x] `POST /api/admin/documentos/[id]/evidencias` - Subir fotos
- [x] `DELETE /api/admin/documentos/[id]/evidencias` - Eliminar evidencia

### FASE 3: Interfaz de Usuario

#### 3.1 Panel de Administración
- [x] Crear `/admin/documentos/page.tsx`
  - Lista de documentos con filtros
  - Búsqueda avanzada
  - Acciones rápidas (ver, editar, eliminar, descargar PDF)
  
- [x] Crear `/admin/documentos/[id]/page.tsx`
  - Vista detallada del documento
  - Edición de metadatos
  - Cambio de estado del documento
  - Galería de evidencias fotográficas
  - Historial de cambios (pendiente)

- [x] Crear `/admin/documentos/nuevo/page.tsx`
  - Formulario para crear nuevo documento
  - Selección de tipo de documento
  - Wizard paso a paso según el tipo (solo Orden de Servicio implementado)

#### 3.2 Panel de Técnicos
- [ ] Crear `/tecnico/documentos/page.tsx` (similar al admin)
- [ ] Integrar generación de documentos en el flujo de tickets

#### 3.3 Componentes Reutilizables
- [ ] `DocumentoCard` - Tarjeta de documento
- [ ] `DocumentoForm` - Formulario genérico de documento
- [x] `OrdenServicioForm` - Formulario específico para Orden de Servicio (integrado en nuevo/page.tsx)
- [x] `DiagnosticoPresupuestoForm` - Formulario para Diagnóstico y Presupuesto
- [ ] `FirmaDigital` - Componente de firma digital (POSPUESTO - sin firma digital)
- [x] `EvidenciaFotografica` - Galería de fotos con upload
- [ ] `DocumentoViewer` - Visor de documentos
- [x] `DocumentoPDFGenerator` - Generador de PDFs (implementado en lib/pdf-generator.ts)

### FASE 4: Generación de PDFs

#### 4.1 Plantillas de Documentos
- [ ] Plantilla para Orden de Servicio
- [ ] Plantilla para Diagnóstico y Presupuesto
- [ ] Plantilla para Aceptación/Rechazo
- [ ] Plantilla para Extensión
- [ ] Plantilla para Albarán

#### 4.2 Librería de PDFs
- [ ] Integrar `jsPDF` o `react-pdf`
- [ ] Crear utilidades de generación
- [ ] Incluir logos y branding
- [ ] Códigos QR para verificación

### FASE 5: Notificaciones

#### 5.1 Email
- [ ] Plantillas de email para cada tipo de documento
- [ ] Envío automático al generar documento
- [ ] Adjuntar PDF al email

#### 5.2 SMS (Opcional)
- [ ] Integración con servicio de SMS
- [ ] Notificaciones de estado

### FASE 6: Búsqueda y Filtros

- [ ] Búsqueda por número de documento
- [ ] Filtro por tipo de documento
- [ ] Filtro por estado
- [ ] Filtro por fecha
- [ ] Filtro por cliente
- [ ] Filtro por técnico
- [ ] Filtro por ticket asociado

### FASE 7: Seguridad y Cumplimiento

- [ ] Protección de datos personales (GDPR)
- [ ] Encriptación de firmas digitales
- [ ] Auditoría de cambios
- [ ] Retención documental (5 años)
- [ ] Backup automático

### FASE 8: Testing

- [ ] Tests unitarios para API
- [ ] Tests de integración
- [ ] Tests E2E para flujo completo

## Flujo de Trabajo Implementado

```
Cliente entrega equipo
        ↓
[1] Orden de Servicio (FASE 1)
    - Datos del cliente
    - Datos del equipo
    - Descripción del problema
    - Estado físico
    - Evidencia fotográfica
    - Firmas
        ↓
Diagnóstico Técnico
        ↓
[2] Presupuesto (FASE 2)
    - Diagnóstico detallado
    - Reparación propuesta
    - Costos
    - Tiempo estimado
    - Garantía
        ↓
        ├──→ [3] Aceptación (FASE 3) → Reparación
        │           ↓
        │      ¿Problemas adicionales?
        │           ├──→ Sí → [5] Extensión (FASE 4)
        │           │         ↓
        │           │   [6] Aceptación Extensión
        │           │         ↓
        │           └──→ Continúa reparación
        │
        └──→ [4] Rechazo (FASE 3) → Devolución sin reparar
                    ↓
              Fin del proceso
        ↓
Control de Calidad
        ↓
[9] Entrega al Cliente (Albarán)
```

## Prioridades de Implementación

### Sprint 1 (Alta Prioridad)
1. Actualizar schema de Prisma
2. Crear tipos TypeScript
3. API básica de documentos
4. Panel de administración básico
5. Orden de Servicio completa

### Sprint 2 (Media Prioridad)
1. Diagnóstico y Presupuesto
2. Aceptación/Rechazo
3. Generación de PDFs básica
4. Firma digital

### Sprint 3 (Media Prioridad)
1. Extensión de Presupuesto
2. Evidencia fotográfica
3. Notificaciones por email
4. Búsqueda avanzada

### Sprint 4 (Baja Prioridad)
1. Albarán de Entrega
2. Orden de Trabajo Interna
3. Hoja de Ruta
4. Optimizaciones y mejoras

## Tecnologías a Utilizar

- **Backend**: Next.js API Routes
- **Base de Datos**: SQLite con Prisma
- **Generación de PDFs**: `jspdf` + `html2canvas` o `@react-pdf/renderer`
- **Firma Digital**: `signature_pad` o `react-signature-canvas`
- **Upload de Imágenes**: `uploadthing` o almacenamiento local
- **Validaciones**: Zod
- **Notificaciones**: Nodemailer (email)
- **UI**: Shadcn/ui + Tailwind CSS

## Estimación de Tiempo

- **Sprint 1**: 2-3 días
- **Sprint 2**: 2-3 días
- **Sprint 3**: 2 días
- **Sprint 4**: 1-2 días

**Total estimado**: 7-10 días de desarrollo

## Notas Importantes

1. **Cumplimiento Legal**: Todos los documentos deben cumplir con la ley de protección al consumidor
2. **Privacidad**: Implementar protección de datos personales (GDPR)
3. **Digitalización**: Sistema completamente digital con portal del cliente
4. **Retención**: Conservar documentos según requerimientos legales (5 años)
5. **Accesibilidad**: Interfaz accesible para todos los usuarios
