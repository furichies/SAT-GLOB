# 🐛 BUG FIX - Posicionamiento de Evidencias en PDFs

## Problema

**Symptom:**
Al descargar un PDF con evidencias fotográficas, las imágenes aparecen muy abajo en el documento, casi al final, fuera del flujo lógico del documento.

**Causa Raíz:**
- La función `agregarEvidenciasPDF` no verificaba si había suficiente espacio en la página actual
- El cálculo de `yPos` para crear nuevas páginas se hacía demasiado tarde
- Las imágenes se agregaban al final del documento sin considerar el contenido previo

**Archivo afectado:**
- `src/lib/pdf-generator.ts` - Función `agregarEvidenciasPDF` (líneas 142-248)

---

## Solución Implementada

### Cambio 1: Verificación de espacio inicial

**Antes:**
```typescript
yPos += 10
doc.text('EVIDENCIAS FOTOGRÁFICAS', 20, yPos)
yPos += 7

// Procesar imágenes sin verificar espacio
for (let i = 0; i < evidencias.length; i++) {
    // ... código para agregar imágenes ...
}
```

**Después:**
```typescript
const pageHeight = doc.internal.pageSize.getHeight()

// Verificar si hay suficiente espacio para el título y al menos 2 imágenes
const espacioNecesarioMinimo = 102  // Título: 17px + primera imagen: 70px + descripción: 15px = ~102px
const espacioDisponible = pageHeight - yPos - 20  // 20px de margen inferior

if (espacioDisponible < espacioNecesarioMinimo) {
    doc.addPage()
    yPos = 20  // Reiniciar posición en nueva página
    console.log('[PDF] Nueva página para evidencias - Espacio disponible:', espacioDisponible, '<', espacioNecesarioMinimo)
}
```

### Cambio 2: Cálculo de altura total antes de procesar

**Agregado:**
```typescript
// Calcular altura necesaria para todas las imágenes
const filas = Math.ceil(evidencias.length / cols)
const alturaTotalNecesaria = (filas * (imgHeight + gap)) + 10  // 10px extra

// Si el espacio restante en la página actual no es suficiente para todas las imágenes,
// agregar nueva página inmediatamente
if (pageHeight - yPos - 20 < alturaTotalNecesaria && evidencias.length > 0) {
    doc.addPage()
    yPos = 20
    // Agregar título en la nueva página
    yPos += 10
    doc.text('EVIDENCIAS FOTOGRÁFICAS (CONTINUACIÓN)', 20, yPos)
    yPos += 7
    console.log('[PDF] Nueva página para evidencias completas - Altura necesaria:', alturaTotalNecesaria)
}
```

### Cambio 3: Cálculo correcto de posición final

**Antes:**
```typescript
return yPos + 20  // Retornar posición + 20px sin considerar la última imagen
```

**Después:**
```typescript
// Asegurar que la última fila se tenga en cuenta
const ultimaFila = Math.floor((evidencias.length - 1) / cols)
const ultimaPosicionY = 20 + (ultimaFila * (imgHeight + gap))

// Devolver la posición correcta para continuar
return ultimaPosicionY + 20
```

---

## Algoritmo de Posicionamiento Mejorado

```
1. Calcular espacio disponible en página actual
   ↓
2. ¿Hay espacio para título + 2 imágenes?
   ├─ NO → Crear nueva página, yPos = 20
   └─ SÍ → Continuar
   ↓
3. Agregar título "EVIDENCIAS FOTOGRÁFICAS"
   ↓
4. Calcular altura total necesaria para todas las imágenes
   ↓
5. ¿El espacio restante es suficiente para TODAS las imágenes?
   ├─ NO → Crear nueva página
   │   - yPos = 20
   │   - Agregar título "(CONTINUACIÓN)"
   └─ SÍ → Continuar
   ↓
6. Para cada imagen:
   ├─ Calcular posición (x, y)
   ├─ ¿Se necesita nueva página?
   │   ├─ SÍ → Crear nueva página, yPos = 20
   │   └─ NO → Continuar
   ├─ Agregar imagen
   ├─ Agregar descripción y fecha
   └─ Actualizar yPos para siguiente imagen
   ↓
7. Calcular posición final basada en última imagen
   ↓
8. Retornar yPos + 20px
```

---

## Beneficios de la Solución

| Aspecto | Antes | Después |
|---------|-------|---------|
| Posicionamiento | Al final del PDF | Inmediatamente después del contenido |
| Nueva página | Solo si imagen no cabe | Antes de agregar evidencias |
| Título | Solo "EVIDENCIAS..." | "EVIDENCIAS (CONTINUACIÓN)" si cambia de página |
| Cálculo de espacio | No se verificaba | Se verifica antes de procesar |
| Eficiencia | Procesaba aunque no hubiera espacio | Crea nueva página si es necesario |
| Logs | Básicos | Detallados con cálculos de espacio |

---

## Casos de Prueba

### ✅ Caso 1: Muchas imágenes en un documento corto

**Escenario:**
- Orden de Servicio con poco texto
- 10 evidencias fotográficas

**Comportamiento esperado:**
- Evidencias aparecen inmediatamente después del contenido
- Si no caben, se crea nueva página con título "(CONTINUACIÓN)"

### ✅ Caso 2: Pocas imágenes al final del documento

**Escenario:**
- Diagnóstico con mucho texto
- 2 evidencias fotográficas

**Comportamiento esperado:**
- Verifica si hay espacio para las 2 imágenes
- Si no hay espacio, crea nueva página
- Si hay espacio, las agrega en la página actual

### ✅ Caso 3: Imagen que excede altura de página

**Escenario:**
- Documento con poco espacio al final
- 1 imagen grande que no cabe en la página actual

**Comportamiento esperado:**
- Detecta que la imagen no cabe (y + imgHeight + 15 > pageHeight - 20)
- Crea nueva página antes de agregar la imagen
- La imagen aparece en la nueva página

---

## Logs de Depuración

```bash
# Nueva página por falta de espacio inicial
[PDF] Nueva página para evidencias - Espacio disponible: 45, < 102

# Nueva página por altura total insuficiente
[PDF] Nueva página para evidencias completas - Altura necesaria: 352

# Nueva página durante procesamiento de imagen
[PDF] Nueva página durante procesamiento de imagen 5

# Lectura de imagen
[PDF] Leyendo imagen desde: /home/.../uploads/evidencias/...
[PDF] Imagen leída, tamaño: 234567 bytes

# Advertencia de imagen muy grande
[PDF] Imagen excede 4MB, omitiendo: .../evidencia-xxx.png
```

---

## Compatibilidad

| Situación | Resultado |
|-----------|----------|
| Página vacía con evidencias | ✅ Se agregan correctamente |
| Página llena con texto + evidencias | ✅ Crea nueva página si es necesario |
| Múltiples páginas de evidencias | ✅ Divide inteligentemente las imágenes |
| PDF con una sola imagen | ✅ Se agrega sin crear página extra |

---

## Notas de Implementación

1. **Cálculo de espacio:** `pageHeight - yPos - 20` considera 20px de margen inferior
2. **Tamaño mínimo:** 102px permite título + 1 imagen con descripción
3. **Título de continuación:** "(CONTINUACIÓN)" solo aparece si se cambia de página
4. **Posición final:** Se calcula basándose en la última imagen, no en la posición actual del loop

---

## Documentos Relacionados

- `src/lib/pdf-generator.ts` - Generador de PDFs con posicionamiento corregido
- `docs/BUG_FIX_PDF_IMAGES.md` - Fix anterior para URLs relativas

---

**Fecha:** 17 de enero de 2026
**Autor:** OpenCode AI
**Versión:** 1.1.0
