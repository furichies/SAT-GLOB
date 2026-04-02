# Corrección: Campos Faltantes en PDF de Diagnóstico

## Problema Identificado

El PDF del documento de "Diagnóstico y Presupuesto" no mostraba todos los campos, específicamente:
- **Reparación Propuesta** (sección completa)
- **Descripción de Trabajos** (campo crítico)

### Causa Raíz

El problema no era que los campos faltaran en el código, sino que **no había manejo de saltos de página**. Cuando el contenido del diagnóstico era extenso, las secciones se renderizaban fuera de los límites de la página y quedaban invisibles en el PDF generado.

## Solución Implementada

### 1. Nueva Función Helper: `checkPageBreak`

Se agregó una función auxiliar para verificar automáticamente si se necesita un salto de página:

```typescript
function checkPageBreak(doc: jsPDF, yPos: number, espacioNecesario: number = 20): number {
    const pageHeight = doc.internal.pageSize.getHeight()
    const margenInferior = 30 // Espacio para el pie de página
    
    if (yPos + espacioNecesario > pageHeight - margenInferior) {
        doc.addPage()
        return 20 // Margen superior de la nueva página
    }
    
    return yPos
}
```

**Parámetros:**
- `doc`: Documento PDF de jsPDF
- `yPos`: Posición Y actual en la página
- `espacioNecesario`: Espacio mínimo necesario en mm (por defecto 20mm)

**Retorna:**
- La posición Y actual si hay espacio suficiente
- 20 (margen superior) si se agregó una nueva página

### 2. Mejoras en `generarDiagnosticoPresupuesto`

Se aplicaron verificaciones de salto de página en puntos críticos:

#### Secciones Principales
- **Diagnóstico Detallado**: Verifica espacio antes de la sección (50mm)
- **Reparación Propuesta**: Verifica espacio antes de la sección (50mm)
- **Resumen de Costos**: Verifica espacio antes de la sección (60mm)

#### Contenido Dinámico
- **Pruebas Realizadas**: Verifica antes de cada ítem (10mm)
- **Resultados**: Verifica antes de cada línea (10mm)
- **Componentes Defectuosos**: Verifica antes de cada ítem (10mm)
- **Causa Raíz**: Verifica antes de cada línea (10mm)
- **Descripción de Trabajos**: Verifica antes de cada línea (10mm) ⭐ **CAMPO CRÍTICO**
- **Costos**: Verifica antes de cada línea (10mm)

#### Tablas
- **Tabla de Repuestos**: Verifica espacio antes de renderizar (40mm)
- **Tabla de Mano de Obra**: Verifica espacio antes de renderizar (40mm)

### 3. Mejora en la Presentación de "Descripción de Trabajos"

Se agregó un encabezado explícito para el campo más importante:

```typescript
// Descripción de trabajos - CAMPO CRÍTICO
doc.setFont('helvetica', 'bold')
doc.text('Descripción de Trabajos:', 20, yPos)
yPos += 6
doc.setFont('helvetica', 'normal')
const trabajosLines = doc.splitTextToSize(metadatos.reparacionPropuesta.descripcionTrabajos, 170)
trabajosLines.forEach((line: string) => {
    yPos = checkPageBreak(doc, yPos, 10)
    doc.text(line, 20, yPos)
    yPos += 5
})
```

## Campos Incluidos en el PDF de Diagnóstico

### ✅ Información General
- Número de documento
- Fecha de generación
- Técnico asignado

### ✅ Diagnóstico Detallado
- Pruebas realizadas (lista)
- Resultados obtenidos (texto largo)
- Componentes defectuosos (lista)
- Causa raíz (texto largo)

### ✅ Reparación Propuesta
- **Descripción de Trabajos** (texto largo) ⭐ **AHORA VISIBLE**
- Tabla de repuestos necesarios
- Tabla de mano de obra

### ✅ Costos
- Costo de repuestos
- Costo de mano de obra
- Costos adicionales (si existen)
- Subtotal
- IVA (21%)
- **TOTAL**

### ✅ Información Adicional
- Tiempo estimado de reparación
- Garantía ofrecida (repuestos y mano de obra)
- Validez del presupuesto

### ✅ Evidencias Fotográficas
- Imágenes adjuntas al documento (si existen)

## Beneficios de la Solución

1. **Visibilidad Completa**: Todos los campos ahora son visibles sin importar la longitud del contenido
2. **Profesionalidad**: El PDF se ve completo y profesional en múltiples páginas
3. **Escalabilidad**: El sistema maneja automáticamente documentos de cualquier longitud
4. **Mantenibilidad**: La función `checkPageBreak` es reutilizable en otros generadores de PDF

## Archivos Modificados

- `/src/lib/pdf-generator.ts`
  - Agregada función `checkPageBreak` (línea ~127)
  - Mejorada función `generarDiagnosticoPresupuesto` (línea ~559)

## Pruebas Recomendadas

1. Generar un PDF de diagnóstico con contenido corto (1 página)
2. Generar un PDF de diagnóstico con contenido extenso (múltiples páginas)
3. Verificar que la "Descripción de Trabajos" sea visible en ambos casos
4. Verificar que todas las secciones estén presentes y legibles
5. Verificar que los saltos de página sean naturales y no corten texto a la mitad

## Fecha de Implementación

2026-01-20
