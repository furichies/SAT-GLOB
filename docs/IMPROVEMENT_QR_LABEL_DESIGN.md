# Mejora: Diseño de Etiqueta QR para Tickets

## Problema Identificado

La etiqueta QR del ticket (62x40mm) tenía un diseño desbalanceado con el contenido mal distribuido y no centrado correctamente.

### Problemas Específicos:
- QR muy pequeño (20x20mm) y mal posicionado
- Texto alineado solo a la izquierda sin aprovechar el espacio
- Falta de balance visual entre el QR y la información
- ID del ticket en esquina sin centrar
- Colores todos en negro sin jerarquía visual

## Solución Implementada

### 1. Layout Mejorado y Centrado

#### QR Code
- **Tamaño aumentado**: De 20x20mm a 28x28mm (40% más grande)
- **Posición centrada verticalmente**: Calculado dinámicamente `(height - qrSize) / 2`
- **Mayor calidad**: Configuración mejorada con `width: 200` y `errorCorrectionLevel: 'M'`
- **Posición optimizada**: Alineado a la derecha con margen consistente

```typescript
const qrSize = 28
const qrX = width - qrSize - margin - 2
const qrY = (height - qrSize) / 2
doc.addImage(qrImage, 'PNG', qrX, qrY, qrSize, qrSize)
```

#### Información del Ticket (Izquierda)
- **Espacio calculado dinámicamente**: `infoWidth = qrX - infoX - 2`
- **Jerarquía visual mejorada**:
  - Empresa: Gris (100,100,100) - Tamaño 7pt
  - Número de ticket: Negro - Tamaño 12pt (destacado)
  - Fecha: Gris oscuro (80,80,80) - Tamaño 6pt
  - Cliente: Negro - Tamaño 7pt (negrita)
  - Asunto: Gris medio (60,60,60) - Tamaño 6pt

### 2. Mejoras de Presentación

#### Colores con Jerarquía
```typescript
// Empresa (secundario)
doc.setTextColor(100, 100, 100)

// Número de ticket (primario)
doc.setTextColor(0, 0, 0)

// Fecha (terciario)
doc.setTextColor(80, 80, 80)

// Asunto (terciario)
doc.setTextColor(60, 60, 60)

// ID del ticket (muy sutil)
doc.setTextColor(150, 150, 150)
```

#### Espaciado Vertical Optimizado
```typescript
let yPos = 6  // Inicio
yPos += 5     // Después de empresa
yPos += 5     // Después de número
yPos += 4     // Después de fecha
yPos += 4     // Después de cliente
```

### 3. ID del Ticket Centrado

El ID ahora está **centrado horizontalmente** en la parte inferior:

```typescript
const ticketId = ticket.id.substring(0, 12)
const idWidth = doc.getTextWidth(ticketId)
doc.text(ticketId, (width - idWidth) / 2, height - 2)
```

### 4. Manejo Inteligente de Texto

- **Cliente**: Usa `splitTextToSize` y muestra solo la primera línea si es muy largo
- **Asunto**: Limitado a 2 líneas con verificación de espacio disponible
- **Fecha**: Sin prefijo "Fecha:" para ahorrar espacio

## Comparación Antes/Después

### Antes:
```
┌─────────────────────────────────────────────────────┐
│ SAT - MicroInfo                                     │
│                                                     │
│ TK-2024-001                    ┌──────────┐        │
│                                │          │        │
│ Fecha: 20/01/2026              │    QR    │        │
│                                │  (20x20) │        │
│ Juan Pérez García              │          │        │
│                                └──────────┘        │
│ Reparación de portátil...                ID: abc   │
└─────────────────────────────────────────────────────┘
```

### Después:
```
┌─────────────────────────────────────────────────────┐
│ SAT - MicroInfo (gris)                              │
│                                                     │
│ TK-2024-001 (negro, grande)    ┌────────────┐      │
│                                │            │      │
│ 20/01/2026 (gris)              │            │      │
│                                │     QR     │      │
│ Juan Pérez García (negro)      │   (28x28)  │      │
│                                │  centrado  │      │
│ Reparación de portátil...      │            │      │
│ (gris, 2 líneas)               └────────────┘      │
│                    ID: abc123def (centrado, gris)   │
└─────────────────────────────────────────────────────┘
```

## Beneficios

1. **✅ Mejor Balance Visual**: QR más grande y centrado verticalmente
2. **✅ Jerarquía Clara**: Uso de colores y tamaños para destacar información importante
3. **✅ Aprovechamiento del Espacio**: Texto ajustado dinámicamente al espacio disponible
4. **✅ Profesionalidad**: Diseño más limpio y moderno
5. **✅ Legibilidad**: Tamaños de fuente optimizados para impresión térmica
6. **✅ Centrado**: ID del ticket centrado en la parte inferior

## Especificaciones Técnicas

### Dimensiones
- **Formato**: 62mm x 40mm (landscape)
- **QR Code**: 28mm x 28mm
- **Márgenes**: 2mm
- **Espacio para texto**: ~28mm de ancho

### Fuentes
- **Empresa**: Helvetica Bold, 7pt
- **Número de Ticket**: Helvetica Bold, 12pt
- **Fecha**: Helvetica Normal, 6pt
- **Cliente**: Helvetica Bold, 7pt
- **Asunto**: Helvetica Normal, 6pt
- **ID**: Helvetica Normal, 5pt

### QR Code
- **Margen**: 1 módulo
- **Ancho de renderizado**: 200px
- **Nivel de corrección**: M (15% de recuperación)
- **URL**: `{baseUrl}/admin/tickets?ticketId={id}`

## Archivos Modificados

- `/src/lib/pdf-generator.ts`
  - Función `generarEtiquetaTicket` (línea ~1270)

## Pruebas Recomendadas

1. ✅ Generar etiqueta con nombre de cliente corto
2. ✅ Generar etiqueta con nombre de cliente muy largo
3. ✅ Generar etiqueta con asunto corto (1 línea)
4. ✅ Generar etiqueta con asunto largo (2+ líneas)
5. ✅ Verificar que el QR escanea correctamente
6. ✅ Verificar que el ID está centrado
7. ✅ Imprimir en impresora térmica Brother/Dymo

## Fecha de Implementación

2026-01-20
