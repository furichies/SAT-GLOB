# Filtros de Seguimiento y Documentación

## Resumen de Cambios

Se han implementado dos nuevos filtros en el panel de administración de "Seguimiento y Documentación" para mejorar la búsqueda y filtrado de documentos:

### 1. Filtro por Usuario Generador
- **Ubicación**: Panel de filtros en `/admin/documentos`
- **Funcionalidad**: Permite filtrar documentos por el usuario que los generó
- **Implementación**: 
  - Nuevo dropdown "Generado por" que muestra todos los usuarios del sistema
  - Parámetro de API: `usuarioGeneradorId`

### 2. Filtro por Técnico Asignado
- **Ubicación**: Panel de filtros en `/admin/documentos`
- **Funcionalidad**: Permite buscar documentos por el técnico asignado al ticket asociado
- **Implementación**:
  - Nuevo dropdown "Técnico asignado" que muestra todos los técnicos disponibles
  - Parámetro de API: `tecnicoAsignado`
  - Nueva columna en la tabla que muestra el técnico asignado

## Archivos Modificados

### Backend (API)
1. **`/src/app/api/admin/documentos/route.ts`**
   - Añadidos parámetros `usuarioGeneradorId` y `tecnicoAsignado`
   - Implementada lógica de filtrado en la consulta Prisma
   - Incluida información del técnico en la respuesta (relación anidada)

2. **`/src/app/api/admin/tecnicos/route.ts`**
   - Actualizado formato de respuesta para consistencia con otros endpoints
   - Ahora retorna `{ success: true, data: { tecnicos } }`

### Frontend
3. **`/src/app/admin/documentos/page.tsx`**
   - Añadidos estados para los nuevos filtros
   - Implementadas funciones para cargar usuarios y técnicos
   - Añadidos dos nuevos dropdowns de filtro
   - Añadida columna "Técnico Asignado" en la tabla
   - Grid de filtros actualizado de 3 a 5 columnas

### Types
4. **`/src/types/documentos.ts`**
   - Actualizada interfaz `DocumentoConRelaciones`
   - Añadida información del técnico en la relación del ticket

## Características

### Filtro por Usuario Generador
```typescript
// Ejemplo de uso en la API
GET /api/admin/documentos?usuarioGeneradorId=cuid_del_usuario
```
- Filtra documentos creados por un usuario específico
- Útil para auditoría y seguimiento de quién generó cada documento

### Filtro por Técnico Asignado
```typescript
// Ejemplo de uso en la API
GET /api/admin/documentos?tecnicoAsignado=cuid_del_tecnico
```
- Filtra documentos cuyo ticket asociado tiene asignado un técnico específico
- Permite ver todos los documentos relacionados con el trabajo de un técnico

### Visualización en Tabla
- Nueva columna "Técnico Asignado" muestra:
  - Nombre completo del técnico si está asignado
  - "Sin asignar" si no hay técnico asignado al ticket
  - Solo se muestra para documentos asociados a tickets

## Uso

1. **Acceder al panel**: Navegar a `/admin/documentos`
2. **Filtrar por usuario generador**: 
   - Seleccionar un usuario del dropdown "Generado por"
   - La tabla se actualizará automáticamente
3. **Filtrar por técnico asignado**:
   - Seleccionar un técnico del dropdown "Técnico asignado"
   - Solo se mostrarán documentos de tickets asignados a ese técnico
4. **Combinar filtros**: 
   - Todos los filtros se pueden combinar
   - Búsqueda de texto + tipo + estado + usuario + técnico

## Notas Técnicas

- Los filtros se aplican en el backend mediante Prisma
- La paginación se mantiene funcional con los nuevos filtros
- Los filtros persisten durante la navegación entre páginas
- La información del técnico se carga mediante relaciones anidadas en Prisma
- Los dropdowns se cargan dinámicamente desde la base de datos

## Testing

Para verificar la funcionalidad:
1. Crear varios documentos con diferentes usuarios
2. Asignar técnicos a los tickets asociados
3. Probar cada filtro individualmente
4. Probar combinaciones de filtros
5. Verificar que la columna "Técnico Asignado" muestra la información correcta
