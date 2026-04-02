# Mejora: Auto-población de Resolución Técnica desde Documentos de Diagnóstico

## Problema Identificado

Cuando un ticket tiene un documento de "Diagnóstico y Presupuesto" y un "Albarán de Entrega", la información del diagnóstico y la solución aplicada no se transfería automáticamente al campo de "Resolución Técnica" del ticket.

Esto requería que el técnico copiara manualmente toda la información del documento al ticket, lo cual era:
- **Tedioso**: Copiar y pegar múltiples campos
- **Propenso a errores**: Posibilidad de omitir información importante
- **Ineficiente**: Duplicación de esfuerzo

## Solución Implementada

### Modificación de la Función `openEdicion`

La función `openEdicion` ahora es **asíncrona** y realiza las siguientes acciones automáticamente:

1. **Detecta documentos relevantes**: Busca si el ticket tiene:
   - Documento de tipo `DIAGNOSTICO_PRESUPUESTO`
   - Documento de tipo `ALBARAN_ENTREGA`

2. **Extrae información del diagnóstico**: Si ambos documentos existen, parsea los metadatos del diagnóstico y construye:

#### Campo "Diagnóstico"
```
PRUEBAS REALIZADAS:
• [Lista de pruebas realizadas]

RESULTADOS:
[Resultados obtenidos del diagnóstico]

COMPONENTES DEFECTUOSOS:
• [Lista de componentes defectuosos]

CAUSA RAÍZ:
[Descripción de la causa raíz del problema]
```

#### Campo "Solución Aplicada"
```
TRABAJOS REALIZADOS:
[Descripción detallada de los trabajos]

REPUESTOS UTILIZADOS:
• [Descripción del repuesto] (Cant: X)
• [...]

MANO DE OBRA:
• [Descripción del trabajo] (Xh)
• [...]

Tiempo total de reparación: X horas
```

### Código Implementado

```typescript
const openEdicion = async (ticket: any) => {
  setTicketSeleccionado(ticket)
  
  // Valores iniciales
  let diagnosticoText = ticket.diagnostico || ''
  let solucionText = ticket.solucion || ''
  
  // Si el ticket tiene documentos, buscar el diagnóstico y albarán
  if (ticket.documentos && ticket.documentos.length > 0) {
    try {
      // Buscar documento de diagnóstico (DIAGNOSTICO_PRESUPUESTO)
      const docDiagnostico = ticket.documentos.find((doc: any) => 
        doc.tipo === 'DIAGNOSTICO_PRESUPUESTO'
      )
      
      // Buscar documento de albarán (ALBARAN_ENTREGA)
      const docAlbaran = ticket.documentos.find((doc: any) => 
        doc.tipo === 'ALBARAN_ENTREGA'
      )
      
      // Si existe diagnóstico y albarán, extraer información
      if (docDiagnostico && docAlbaran) {
        const metadatos = JSON.parse(docDiagnostico.metadatos || '{}')
        
        // Construir texto de diagnóstico y solución...
        // [Ver código completo en el archivo]
      }
    } catch (e) {
      console.error('Error procesando documentos:', e)
    }
  }
  
  setFormTicket({
    // ... otros campos
    diagnostico: diagnosticoText,
    solucion: solucionText,
    // ...
  })
  setIsEdicion(true)
}
```

## Condiciones de Activación

La auto-población **solo ocurre** cuando se cumplen TODAS estas condiciones:

1. ✅ El ticket tiene documentos asociados
2. ✅ Existe un documento de tipo `DIAGNOSTICO_PRESUPUESTO`
3. ✅ Existe un documento de tipo `ALBARAN_ENTREGA`
4. ✅ El documento de diagnóstico tiene metadatos válidos

**Razón**: Solo cuando hay un diagnóstico Y un albarán significa que el trabajo se completó y la información es definitiva.

## Información Extraída

### Del Documento de Diagnóstico

#### Sección: `metadatos.diagnostico`
- ✅ **Pruebas Realizadas**: Array de strings con las pruebas
- ✅ **Resultados Obtenidos**: Texto descriptivo de los resultados
- ✅ **Componentes Defectuosos**: Array de componentes identificados
- ✅ **Causa Raíz**: Descripción de la causa del problema

#### Sección: `metadatos.reparacionPropuesta`
- ✅ **Descripción de Trabajos**: Texto detallado de los trabajos
- ✅ **Repuestos Necesarios**: Array con código, descripción y cantidad
- ✅ **Mano de Obra**: Array con descripción y horas estimadas
- ✅ **Tiempo Estimado de Reparación**: Horas totales

## Beneficios

1. **✅ Automatización**: El técnico no necesita copiar manualmente
2. **✅ Consistencia**: La información siempre tiene el mismo formato
3. **✅ Completitud**: No se omite información importante
4. **✅ Trazabilidad**: Conexión clara entre documentos y resolución
5. **✅ Eficiencia**: Ahorro de tiempo significativo
6. **✅ Base de Conocimiento**: Información estructurada lista para KB

## Flujo de Trabajo

### Antes
```
1. Técnico crea Orden de Servicio
2. Técnico crea Diagnóstico y Presupuesto
3. Cliente acepta presupuesto
4. Técnico realiza reparación
5. Técnico crea Albarán de Entrega
6. Técnico edita ticket
7. ❌ Técnico copia manualmente diagnóstico
8. ❌ Técnico copia manualmente solución
9. Técnico guarda ticket
```

### Después
```
1. Técnico crea Orden de Servicio
2. Técnico crea Diagnóstico y Presupuesto
3. Cliente acepta presupuesto
4. Técnico realiza reparación
5. Técnico crea Albarán de Entrega
6. Técnico edita ticket
7. ✅ Sistema auto-completa diagnóstico
8. ✅ Sistema auto-completa solución
9. Técnico revisa y guarda ticket
```

## Manejo de Errores

El sistema incluye manejo robusto de errores:

```typescript
try {
  const metadatos = JSON.parse(docDiagnostico.metadatos || '{}')
  // ... procesamiento
} catch (e) {
  console.error('Error parseando metadatos del diagnóstico:', e)
  // Continúa con valores por defecto
}
```

Si hay algún error:
- ❌ No se interrumpe la edición del ticket
- ✅ Se usan los valores existentes del ticket
- ✅ Se registra el error en consola para debugging
- ✅ El técnico puede editar manualmente si es necesario

## Compatibilidad

### Tickets Existentes
- ✅ Tickets sin documentos: Funcionan normalmente
- ✅ Tickets con solo diagnóstico: No se auto-completa (falta albarán)
- ✅ Tickets con diagnóstico y albarán: Se auto-completa
- ✅ Tickets con diagnóstico/solución manual: Se sobrescribe con datos del documento

### Edición Manual
- ✅ El técnico puede editar los campos después de la auto-población
- ✅ Los cambios manuales se guardan normalmente
- ✅ No hay pérdida de funcionalidad

## Archivos Modificados

- `/src/app/admin/tickets/page.tsx`
  - Función `openEdicion` (línea ~308)
  - Cambio de función síncrona a asíncrona
  - Lógica de extracción de metadatos de diagnóstico
  - Construcción de texto estructurado para diagnóstico y solución

## Pruebas Recomendadas

1. ✅ Editar ticket sin documentos → Debe funcionar normalmente
2. ✅ Editar ticket solo con diagnóstico → No debe auto-completar
3. ✅ Editar ticket con diagnóstico y albarán → Debe auto-completar
4. ✅ Verificar formato del texto auto-completado
5. ✅ Editar manualmente después de auto-completar → Debe permitir cambios
6. ✅ Guardar ticket con información auto-completada
7. ✅ Verificar que se puede guardar en Base de Conocimiento

## Ejemplo de Resultado

### Campo "Diagnóstico" Auto-completado
```
PRUEBAS REALIZADAS:
• Prueba de arranque
• Diagnóstico de hardware
• Test de memoria RAM

RESULTADOS:
El equipo presenta fallos intermitentes en el arranque. 
Se detectaron errores en la memoria RAM mediante MemTest86.

COMPONENTES DEFECTUOSOS:
• Módulo RAM DDR4 8GB (Slot 1)
• Conector SATA principal

CAUSA RAÍZ:
Módulo de memoria RAM defectuoso causando errores de lectura/escritura 
y fallos en el POST del sistema.
```

### Campo "Solución Aplicada" Auto-completado
```
TRABAJOS REALIZADOS:
Sustitución de módulo RAM defectuoso, limpieza de contactos, 
verificación de todos los conectores SATA, reinstalación del sistema operativo 
y restauración de datos desde backup.

REPUESTOS UTILIZADOS:
• Memoria RAM DDR4 8GB 3200MHz (Cant: 1)
• Cable SATA III (Cant: 1)

MANO DE OBRA:
• Diagnóstico y reparación de hardware (2h)
• Reinstalación de sistema operativo (1.5h)

Tiempo total de reparación: 3.5 horas
```

## Fecha de Implementación

2026-01-21
