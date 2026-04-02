# Guía de Pruebas - Sistema de Tickets de Incidencia

## Cambios Implementados

Se ha actualizado el sistema de tickets para permitir la creación de tickets de incidencia con campos específicos y generación automática de Órdenes de Intervención.

### 1. Formulario de Creación de Tickets Actualizado

**Ubicación**: `/sat/nuevo`

**Cambios realizados**:
- ✅ Eliminados campos: Número de Serie, Identificador de Pedido
- ✅ Añadidos campos específicos para incidencias:
  - **Tipo de Incidencia** (checkboxes múltiples):
    - Hardware
    - Software
    - Red
    - Seguridad
    - Otro
  - **Descripción Detallada y Síntomas Observados** (textarea)
  - **Acceso Remoto/Presencial** (radio buttons):
    - Acceso remoto autorizado por: [nombre del usuario]
      - Si se selecciona, muestra enlace a https://anydesk.com/es/downloads/linux
    - Intervención presencial - Dirección: [dirección del usuario]
  - **Horario Preferido**:
    - Selector de fecha (inicia en el día actual)
    - Selector de hora

### 2. Nuevo Documento: Orden de Intervención

**Tipo de documento**: `orden_intervencion`
**Estado inicial**: `pendiente_firma` (Sin asignar - esperando técnico)

**Contenido del documento**:
- Información del ticket (número, asunto, prioridad, estado)
- Tipos de incidencia seleccionados
- Descripción y síntomas observados
- Tipo de acceso (remoto/presencial)
- Información de contacto y dirección
- Horario preferido
- Enlace a AnyDesk (si es acceso remoto)

### 3. Cambios en la Base de Datos

**Archivo modificado**: `prisma/schema.prisma`
- Añadido nuevo tipo de documento: `orden_intervencion`

**Comando ejecutado**:
```bash
bun prisma generate
```

## Cómo Probar

### Paso 1: Crear un Ticket de Incidencia

1. Inicia sesión como usuario (no admin)
2. Navega a `/sat/nuevo`
3. Selecciona "Incidencia" como tipo de ticket
4. Rellena los campos obligatorios:
   - Asunto (mínimo 5 caracteres)
   - Descripción (mínimo 10 caracteres)
   - Prioridad (selecciona una)
5. Rellena los campos específicos de incidencia:
   - Marca al menos un tipo de incidencia (Hardware, Software, etc.)
   - Describe los síntomas observados (mínimo 10 caracteres)
   - Selecciona tipo de acceso (remoto o presencial)
   - Selecciona fecha y hora preferida
6. Haz clic en "Crear Ticket"

### Paso 2: Verificar la Creación del Ticket

1. Serás redirigido a `/sat`
2. Deberías ver tu nuevo ticket en la lista
3. La descripción del ticket incluirá:
   - TIPO DE INCIDENCIA: [tipos seleccionados]
   - DESCRIPCIÓN: [tu descripción]
   - SÍNTOMAS OBSERVADOS: [síntomas descritos]

### Paso 3: Verificar la Orden de Intervención (Como Admin)

1. Inicia sesión como administrador
2. Navega a `/admin/documentos`
3. Busca el documento con número `OI-YYYYMMDD-XXXX`
4. El documento debería tener:
   - Tipo: "Orden de Intervención"
   - Estado: "Pendiente de Firma" (Sin asignar)
   - Ticket relacionado: el ticket que acabas de crear

### Paso 4: Ver Detalles de la Orden de Intervención

1. Haz clic en la orden de intervención
2. Verifica que se muestren todos los datos:
   - Información del ticket
   - Tipos de incidencia
   - Descripción y síntomas
   - Tipo de acceso seleccionado
   - Horario preferido
   - Información del cliente
   - Si es acceso remoto: enlace a AnyDesk

### Paso 5: Descargar PDF (Opcional)

1. En la página de detalles de la orden de intervención
2. Haz clic en "Descargar PDF"
3. Verifica que el PDF se genera correctamente con toda la información

## Validaciones Implementadas

El formulario valida:
- ✅ Tipo de ticket seleccionado
- ✅ Asunto (mínimo 5 caracteres)
- ✅ Descripción (mínimo 10 caracteres)
- ✅ Para incidencias:
  - Al menos un tipo de incidencia seleccionado
  - Síntomas observados (mínimo 10 caracteres)
  - Tipo de acceso seleccionado
  - Fecha y hora preferida seleccionadas

## Archivos Modificados

1. **Frontend**:
   - `/src/app/sat/nuevo/page.tsx` - Formulario de creación de tickets
   - `/src/components/documentos/OrdenIntervencionForm.tsx` - Nuevo componente (creado)
   - `/src/app/admin/documentos/[id]/page.tsx` - Visualización de documentos

2. **Backend**:
   - `/src/app/api/sat/tickets/route.ts` - API de creación de tickets
   - `/prisma/schema.prisma` - Schema de base de datos
   - `/src/types/enums.ts` - Enums TypeScript

## Notas Importantes

- El enlace a AnyDesk solo se muestra si se selecciona "Acceso remoto"
- La dirección del usuario se obtiene de su perfil (si no está disponible, muestra "Por especificar")
- El estado inicial de la orden de intervención es "pendiente_firma" que representa "Sin asignar (esperando técnico)"
- La fecha mínima para el horario preferido es el día actual

## Próximos Pasos Sugeridos

1. Implementar la asignación de técnicos a las órdenes de intervención
2. Añadir notificaciones cuando se crea una orden de intervención
3. Implementar el cambio de estado de la orden cuando se asigna un técnico
4. Añadir generación de PDF para las órdenes de intervención
