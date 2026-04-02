# 🎯 IMPLEMENTACIÓN: Selector de Presupuestos en Documentos

**Fecha:** 17 de Enero de 2026  
**Versión:** 1.6.0  
**Tipo:** Feature - Mejora de UX

---

## 📋 RESUMEN EJECUTIVO

Se ha implementado un **selector de presupuestos (combo)** en los formularios de seguimiento y documentación para:
- **Aceptación de Presupuesto**
- **Rechazo de Presupuesto**  
- **Extensión de Presupuesto**

El selector reemplaza el campo de texto manual "Número Presupuesto Referencia" y **auto-rellena automáticamente** el teléfono y email del cliente asociado al presupuesto seleccionado.

---

## 🎯 OBJETIVOS ALCANZADOS

✅ **API de Presupuestos**
- Endpoint GET `/api/admin/presupuestos` con filtros por ticketId y búsqueda
- Incluye información completa del cliente (teléfono, email, dirección, etc.)
- Devuelve solo presupuestos activos (excluye anulados y rechazados)

✅ **Componente PresupuestoSelector**
- Selector reutilizable similar a `TecnicoSelector` y `UsuarioSelector`
- Carga presupuestos desde la API
- Permite filtrar por ticket específico
- Muestra número de presupuesto, ticket y cliente

✅ **Integración en Formularios**
- Formulario de Aceptación: Auto-rellena teléfono y email
- Formulario de Rechazo: Selector de presupuesto
- Formulario de Extensión: Selector de presupuesto original

---

## 📁 ARCHIVOS MODIFICADOS Y CREADOS

### Archivos Nuevos

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `src/components/common/PresupuestoSelector.tsx` | Componente selector de presupuestos | 106 |

### Archivos Modificados

| Archivo | Cambios | Líneas Afectadas |
|---------|---------|------------------|
| `src/app/api/admin/presupuestos/route.ts` | Limpieza de código duplicado, corrección de tipos | 1-170 |
| `src/components/documentos/AceptacionRechazoForms.tsx` | Integración PresupuestoSelector en aceptación y rechazo | 1-18, 40-70, 90-103, 266-295, 310-333 |
| `src/components/documentos/ExtensionPresupuestoForm.tsx` | Integración PresupuestoSelector en extensión | 1-21, 37-69, 142-155 |

---

## 🔄 FLUJO DE TRABAJO ACTUALIZADO

### Flujo de Creación de Aceptación de Presupuesto

```
1. Admin navega a /admin/documentos/nuevo
2. Selecciona "Aceptación de Presupuesto"
3. En "Presupuesto a Aceptar":
   a. Se muestra combo con presupuestos disponibles
   b. Cada opción muestra: Número Presupuesto - Ticket - Cliente
4. Al seleccionar un presupuesto:
   a. Se auto-rellena el número de presupuesto (solo lectura)
   b. Se auto-rellena el teléfono del cliente
   c. Se auto-rellena el email del cliente
5. Completa el resto del formulario
6. Guarda el documento
```

### Flujo de Creación de Rechazo de Presupuesto

```
1. Admin navega a /admin/documentos/nuevo
2. Selecciona "Rechazo de Presupuesto"
3. En "Presupuesto a Rechazar":
   a. Se muestra combo con presupuestos disponibles
4. Al seleccionar un presupuesto:
   a. Se auto-rellena el número de presupuesto (solo lectura)
5. Completa motivo, instrucciones de devolución, etc.
6. Guarda el documento
```

### Flujo de Creación de Extensión de Presupuesto

```
1. Admin navega a /admin/documentos/nuevo
2. Selecciona "Extensión de Presupuesto"
3. En "Presupuesto Original":
   a. Se muestra combo con presupuestos disponibles
4. Al seleccionar un presupuesto:
   a. Se auto-rellena el número de presupuesto original (solo lectura)
5. Completa diagnóstico ampliado, nuevos trabajos, repuestos, etc.
6. Guarda el documento
```

---

## 🔧 DETALLES TÉCNICOS

### API de Presupuestos

**Endpoint:** `GET /api/admin/presupuestos`

**Query Parameters:**
- `ticketId` (opcional): Filtrar presupuestos de un ticket específico
- `busqueda` (opcional): Buscar por número de documento o número de ticket

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "presupuestos": [
      {
        "id": "string",
        "numeroDocumento": "string",
        "numeroTicket": "string",
        "fechaGeneracion": "ISO Date",
        "estadoDocumento": "string",
        "ticketId": "string",
        "tecnicoAsignado": {
          "id": "string",
          "nombre": "string"
        },
        "cliente": {
          "id": "string",
          "nombre": "string",
          "apellidos": "string",
          "email": "string",
          "telefono": "string",
          "direccion": "string",
          "codigoPostal": "string",
          "ciudad": "string"
        },
        "equipo": {
          "id": "string",
          "nombre": "string",
          "marca": "string",
          "modelo": "string"
        },
        "presupuesto": {
          "id": "string",
          "numeroPresupuesto": "string",
          "validezPresupuesto": "number",
          "total": "number",
          "tecnicoAsignado": "string",
          "tecnicoAsignadoId": "string"
        }
      }
    ]
  }
}
```

### Componente PresupuestoSelector

**Props:**
```typescript
interface PresupuestoSelectorProps {
    value: string                          // ID del presupuesto seleccionado
    onChange: (presupuesto: Presupuesto) => void  // Callback al seleccionar
    disabled?: boolean
    ticketId?: string                      // Filtrar por ticket específico
}
```

**Uso básico:**
```tsx
<PresupuestoSelector
  value={presupuestoSeleccionadoId}
  onChange={(presupuesto) => {
    setPresupuestoSeleccionadoId(presupuesto.id)
    setNumeroPresupuesto(presupuesto.numeroDocumento)
    
    // Auto-rellenar datos del cliente
    if (presupuesto.cliente) {
      setTelefono(presupuesto.cliente.telefono || '')
      setEmail(presupuesto.cliente.email || '')
    }
  }}
  disabled={readOnly}
/>
```

---

## 🧪 PLAN DE PRUEBAS

### Prueba 1: Selector de Presupuestos en Aceptación
1. Navegar a `/admin/documentos/nuevo`
2. Seleccionar "Aceptación de Presupuesto"
3. Verificar que el combo muestra presupuestos disponibles
4. Seleccionar un presupuesto
5. **Resultado esperado:**
   - Número de presupuesto se muestra debajo del selector
   - Teléfono del cliente se auto-rellena
   - Email del cliente se auto-rellena

### Prueba 2: Selector de Presupuestos en Rechazo
1. Navegar a `/admin/documentos/nuevo`
2. Seleccionar "Rechazo de Presupuesto"
3. Verificar que el combo muestra presupuestos disponibles
4. Seleccionar un presupuesto
5. **Resultado esperado:**
   - Número de presupuesto se muestra debajo del selector

### Prueba 3: Selector de Presupuestos en Extensión
1. Navegar a `/admin/documentos/nuevo`
2. Seleccionar "Extensión de Presupuesto"
3. Verificar que el combo muestra presupuestos disponibles
4. Seleccionar un presupuesto
5. **Resultado esperado:**
   - Número de presupuesto original se muestra debajo del selector

### Prueba 4: API de Presupuestos
1. Hacer request a `GET /api/admin/presupuestos`
2. **Resultado esperado:**
   - Lista de presupuestos con información del cliente
   - Solo presupuestos activos (no anulados ni rechazados)

### Prueba 5: Filtro por Ticket
1. Hacer request a `GET /api/admin/presupuestos?ticketId=xxx`
2. **Resultado esperado:**
   - Solo presupuestos del ticket especificado

---

## ⚠️ RESTRICCIONES Y LIMITACIONES

### Presupuestos
- **Solo presupuestos activos:** El selector excluye presupuestos anulados y rechazados
- **Orden:** Los presupuestos se muestran ordenados por fecha de generación (más recientes primero)

### Auto-relleno
- **Solo en Aceptación:** El auto-relleno de teléfono y email solo funciona en el formulario de aceptación
- **Datos opcionales:** Si el cliente no tiene teléfono o email, los campos quedan vacíos

---

## 🚀 INSTALACIÓN Y CONFIGURACIÓN

### Pasos para desplegar los cambios

1. **Verificar que el código está actualizado:**
   ```bash
   cd /home/richi/Documentos/SAT1475
   git status
   ```

2. **No se requieren migraciones de base de datos** (solo cambios en frontend y API)

3. **Reiniciar servidor de desarrollo:**
   ```bash
   bun run dev
   ```

   O para producción:
   ```bash
   ./scripts/start-pm2.sh
   ```

---

## 📖 DOCUMENTACIÓN DE USUARIO

### Para Administradores

**Crear Aceptación de Presupuesto:**
1. Navegar a `/admin/documentos/nuevo`
2. Seleccionar "Aceptación de Presupuesto"
3. En "Presupuesto a Aceptar", seleccionar el presupuesto del combo
4. Verificar que teléfono y email se auto-rellenan
5. Completar el resto del formulario
6. Guardar

**Crear Rechazo de Presupuesto:**
1. Navegar a `/admin/documentos/nuevo`
2. Seleccionar "Rechazo de Presupuesto"
3. En "Presupuesto a Rechazar", seleccionar el presupuesto del combo
4. Completar motivo y detalles
5. Guardar

**Crear Extensión de Presupuesto:**
1. Navegar a `/admin/documentos/nuevo`
2. Seleccionar "Extensión de Presupuesto"
3. En "Presupuesto Original", seleccionar el presupuesto del combo
4. Completar diagnóstico ampliado y nuevos trabajos
5. Guardar

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### No aparecen presupuestos en el selector
**Causa:** No hay presupuestos activos en la base de datos  
**Solución:** Crear al menos un presupuesto (Diagnóstico y Presupuesto) antes de usar el selector

### El teléfono y email no se auto-rellenan
**Causa:** El cliente asociado al presupuesto no tiene teléfono o email registrado  
**Solución:** Actualizar los datos del cliente en `/admin/usuarios`

### Error al cargar presupuestos
**Causa:** Problema de permisos o error en la API  
**Solución:** Verificar que el usuario tiene rol de admin, técnico o superadmin

---

## 📊 ESTADÍSTICAS DEL PROYECTO

### Métricas antes de la actualización
- Archivos TypeScript: 161
- Líneas de código: ~4,500
- Componentes de selección: 2 (UsuarioSelector, TecnicoSelector)

### Métricas después de la actualización
- Archivos TypeScript: 162 (+1 nuevo)
- Líneas de código: ~4,606 (+106 líneas)
- Componentes de selección: 3 (+PresupuestoSelector)
- Mejoras de UX: 3 formularios mejorados

---

## 🎓 LECCIONES APRENDIDAS

1. **Reutilización de componentes:** El patrón de selector es muy útil y reutilizable
2. **Auto-relleno de datos:** Mejora significativamente la UX y reduce errores
3. **Filtros en API:** Permitir filtrar por ticketId facilita la selección en contextos específicos
4. **Información del cliente:** Incluir datos del cliente en la respuesta de la API evita llamadas adicionales

---

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

1. **Búsqueda en tiempo real** en el selector de presupuestos
2. **Indicador visual** del estado del presupuesto (pendiente, aceptado, etc.)
3. **Previsualización** del presupuesto al pasar el mouse sobre una opción
4. **Filtro por estado** de presupuesto en el selector
5. **Auto-relleno de más campos** basados en el presupuesto seleccionado

---

**Fin del documento de implementación**
