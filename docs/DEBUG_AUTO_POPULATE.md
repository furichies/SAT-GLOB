# Guía de Debugging: Auto-población de Resolución Técnica

## Estado Actual

Se ha implementado la funcionalidad de auto-población de los campos "Diagnóstico" y "Solución Aplicada" desde los documentos de diagnóstico, pero necesitamos verificar por qué no está funcionando.

## Logs de Debugging Agregados

Se han agregado logs de consola detallados para rastrear la ejecución. Cuando edites un ticket, verás en la consola del navegador:

### Logs Esperados

```
=== openEdicion llamado === TKT-XXXXXXX
Documentos: [Array de documentos]
✓ Ticket tiene X documentos
  - Documento: ORDEN_SERVICIO
  - Documento: DIAGNOSTICO_PRESUPUESTO
  - Documento: ALBARAN_ENTREGA
Diagnóstico encontrado: true
Albarán encontrado: true
✅ Extrayendo información de documentos...
Metadatos: {diagnostico: {...}, reparacionPropuesta: {...}}
✓ Diagnóstico generado: XXX caracteres
✓ Solución generada: XXX caracteres
```

### Posibles Escenarios de Error

#### Escenario 1: Ticket sin documentos
```
=== openEdicion llamado === TKT-XXXXXXX
Documentos: undefined (o [])
⚠️ Ticket sin documentos
```
**Causa**: El ticket no tiene documentos asociados
**Solución**: Crear documentos de diagnóstico y albarán para el ticket

#### Escenario 2: Faltan documentos
```
=== openEdicion llamado === TKT-XXXXXXX
Documentos: [...]
✓ Ticket tiene 1 documentos
  - Documento: DIAGNOSTICO_PRESUPUESTO
Diagnóstico encontrado: true
Albarán encontrado: false
⚠️ No se encontraron ambos documentos
```
**Causa**: Falta el documento de albarán (o el de diagnóstico)
**Solución**: Crear el documento faltante

#### Escenario 3: Metadatos vacíos o inválidos
```
=== openEdicion llamado === TKT-XXXXXXX
Documentos: [...]
✓ Ticket tiene 2 documentos
  - Documento: DIAGNOSTICO_PRESUPUESTO
  - Documento: ALBARAN_ENTREGA
Diagnóstico encontrado: true
Albarán encontrado: true
✅ Extrayendo información de documentos...
Metadatos: {}
```
**Causa**: El documento de diagnóstico no tiene metadatos o están vacíos
**Solución**: Verificar que el documento se creó correctamente con todos los campos

## Cómo Probar

### Paso 1: Abrir Consola del Navegador
1. Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Option+I` (Mac)
2. Ve a la pestaña "Console"

### Paso 2: Editar un Ticket
1. Ve a la página de tickets (`/admin/tickets`)
2. Busca un ticket que tenga:
   - ✅ Documento de tipo "Diagnóstico y Presupuesto"
   - ✅ Documento de tipo "Albarán de Entrega"
3. Haz clic en "Editar" en ese ticket

### Paso 3: Revisar los Logs
1. Observa los logs en la consola
2. Identifica en qué punto se detiene el proceso
3. Comparte los logs para diagnosticar el problema

## Verificaciones Necesarias

### 1. Verificar que la API devuelve documentos

Abre la consola y ejecuta:
```javascript
fetch('/api/sat/tickets')
  .then(r => r.json())
  .then(data => {
    console.log('Tickets:', data.tickets)
    const ticketConDocs = data.tickets.find(t => t.documentos && t.documentos.length > 0)
    if (ticketConDocs) {
      console.log('Ticket con documentos:', ticketConDocs)
      console.log('Documentos:', ticketConDocs.documentos)
    } else {
      console.log('No hay tickets con documentos')
    }
  })
```

### 2. Verificar tipos de documentos

Los tipos de documento deben ser exactamente:
- `DIAGNOSTICO_PRESUPUESTO` (para el diagnóstico)
- `ALBARAN_ENTREGA` (para el albarán)

**IMPORTANTE**: Los tipos son case-sensitive y deben coincidir exactamente.

### 3. Verificar estructura de metadatos

El documento de diagnóstico debe tener metadatos con esta estructura:
```json
{
  "diagnostico": {
    "pruebasRealizadas": ["..."],
    "resultadosObtenidos": "...",
    "componentesDefectuosos": ["..."],
    "causaRaiz": "..."
  },
  "reparacionPropuesta": {
    "descripcionTrabajos": "...",
    "repuestosNecesarios": [...],
    "manoObra": [...],
  },
  "tiempoEstimadoReparacion": 3.5
}
```

## Posibles Causas del Problema

### Causa 1: Documentos no se cargan desde la API
**Síntoma**: `Documentos: undefined` o `Documentos: []`
**Verificar**: 
- La API `/api/sat/tickets` incluye `documentos: true` en el include
- Los tickets realmente tienen documentos en la base de datos

### Causa 2: Tipos de documento incorrectos
**Síntoma**: Logs muestran tipos diferentes a `DIAGNOSTICO_PRESUPUESTO` o `ALBARAN_ENTREGA`
**Verificar**:
- Los documentos se crearon con los tipos correctos
- No hay errores de tipeo en los tipos

### Causa 3: Metadatos no se guardan
**Síntoma**: `Metadatos: {}` o `Metadatos: null`
**Verificar**:
- El formulario de diagnóstico guarda los metadatos correctamente
- Los metadatos se serializan como JSON string en la base de datos

### Causa 4: Estructura de metadatos incorrecta
**Síntoma**: Logs muestran metadatos pero no se genera texto
**Verificar**:
- Los metadatos tienen las propiedades `diagnostico` y `reparacionPropuesta`
- Las propiedades internas están correctamente nombradas

## Siguiente Paso

**Por favor, realiza la prueba y comparte los logs de la consola** para que pueda identificar exactamente dónde está el problema.

Específicamente necesito ver:
1. ✅ El log completo cuando haces clic en "Editar"
2. ✅ El contenido del array `Documentos`
3. ✅ Los tipos de documento que se encuentran
4. ✅ El contenido de `Metadatos` si se llega a ese punto

Con esta información podré identificar y corregir el problema específico.

## Comandos Útiles para Debugging

### Ver todos los tickets con sus documentos
```javascript
fetch('/api/sat/tickets')
  .then(r => r.json())
  .then(data => console.table(data.tickets.map(t => ({
    numero: t.numeroTicket,
    docs: t.documentos?.length || 0,
    tipos: t.documentos?.map(d => d.tipo).join(', ') || 'ninguno'
  }))))
```

### Ver metadatos de un documento específico
```javascript
fetch('/api/sat/tickets')
  .then(r => r.json())
  .then(data => {
    const ticket = data.tickets.find(t => t.numeroTicket === 'TKT-XXXXXXX') // Reemplazar con número real
    const doc = ticket?.documentos?.find(d => d.tipo === 'DIAGNOSTICO_PRESUPUESTO')
    if (doc) {
      console.log('Metadatos:', JSON.parse(doc.metadatos || '{}'))
    }
  })
```

## Fecha

2026-01-21
