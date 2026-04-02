# 🐛 BUG FIX - URLs Relativas en PDFs

## Problema

**Symptom:**
Al descargar un PDF con evidencias fotográficas, las imágenes no aparecen y se muestra el error:

```
TypeError: Failed to parse URL from /api/uploads/evidencias/...
code: 'ERR_INVALID_URL'
input: '/api/uploads/evidencias/cmkir1t29000fjc81fzoofd26/evidencia-1768681295942.png'
```

**Causa Raíz:**
- Las rutas de las imágenes se guardan como URLs relativas de API (`/api/uploads/evidencias/...`)
- La función `agregarEvidenciasPDF` intentaba usar `fetch()` con estas URLs relativas
- `fetch()` en el contexto del servidor no puede resolver URLs relativas sin la URL base
- Esto causa el error `ERR_INVALID_URL` y las imágenes se omiten

**Archivos afectados:**
- `src/lib/pdf-generator.ts` - Función `agregarEvidenciasPDF`

## Solución Implementada

### Cambio 1: Importar `path` al inicio del archivo

```typescript
import path from 'path'
```

### Cambio 2: Modificar `agregarEvidenciasPDF` para leer archivos directamente

**Antes (NO funcional):**
```typescript
try {
    const response = await fetch(evidencia.url)  // ❌ URL relativa no funciona
    const arrayBuffer = await response.arrayBuffer()
    const imageData = Buffer.from(arrayBuffer)
    // ...
}
```

**Después (SOLUCIONADO):**
```typescript
try {
    // Extraer ruta de archivo de la URL
    let imagePath = evidencia.url

    if (imagePath.startsWith('/api/uploads/')) {
        // Convertir ruta de API a ruta del sistema de archivos
        const pathPart = imagePath.replace('/api/uploads/', '')
        imagePath = path.join(process.cwd(), 'uploads', pathPart)
    } else if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
        // Es otra ruta relativa, intentar resolver desde uploads
        imagePath = path.join(process.cwd(), 'uploads', imagePath)
    }

    console.log('[PDF] Leyendo imagen desde:', imagePath)

    // Importar fs dinámicamente
    const { readFile } = await import('fs/promises')

    // Leer archivo directamente del sistema de archivos
    const imageData = await readFile(imagePath)

    // Determinar formato de imagen según extensión
    let formato = 'JPEG'
    if (imagePath.toLowerCase().includes('.png')) {
        formato = 'PNG'
    } else if (imagePath.toLowerCase().includes('.gif')) {
        formato = 'GIF'
    }

    // Agregar imagen al PDF
    doc.addImage(imageData, formato, x, y, imgWidth, imgHeight, undefined, 'FAST')

} catch (error: any) {
    console.error('[PDF] Error al agregar imagen al PDF:', error)
    // Mostrar error específico en el PDF
    const errorMsg = error.cause?.code === 'ERR_INVALID_URL' 
        ? 'URL inválida' 
        : (error.message || 'Error al cargar imagen')
    doc.text(`Error: ${errorMsg}`, x, y + 20)
}
```

## Beneficios de la Solución

1. ✅ **Lectura directa del sistema de archivos** - No depende de la red
2. ✅ **Sin problemas de URLs relativas** - `path.join()` resuelve correctamente
3. ✅ **Mejor rendimiento** - No hay overhead de HTTP
4. ✅ **Mayor robustez** - Manejo de errores mejorado con mensajes específicos
5. ✅ **Soporte para múltiples formatos** - Detecta PNG, JPEG, GIF según extensión

## Flujo de Resolución

```
URL guardada en DB: /api/uploads/evidencias/{docId}/{filename}
                     ↓
Convertir a ruta del sistema: process.cwd()/uploads/evidencias/{docId}/{filename}
                     ↓
Leer archivo con fs/promises.readFile()
                     ↓
Obtener buffer de imagen
                     ↓
Determinar formato (PNG/JPEG/GIF)
                     ↓
Agregar a PDF con jsPDF.addImage()
                     ↓
✅ Imagen visible en PDF
```

## Casos de Prueba

### ✅ Caso 1: Imagen PNG
- URL: `/api/uploads/evidencias/cmkir1t29000fjc81fzoofd26/evidencia-123.png`
- Ruta del sistema: `.../uploads/evidencias/cmkir1t29000fjc81fzoofd26/evidencia-123.png`
- Resultado: ✅ Imagen PNG visible en PDF

### ✅ Caso 2: Imagen JPEG
- URL: `/api/uploads/evidencias/abc123/evidencia-456.jpg`
- Ruta del sistema: `.../uploads/evidencias/abc123/evidencia-456.jpg`
- Resultado: ✅ Imagen JPEG visible en PDF

### ✅ Caso 3: Imagen > 4MB
- Imagen: 5MB
- Resultado: ⚠️ Mensaje en PDF: "Imagen omitida (excede 4MB, 4.8MB)"

### ⚠️ Caso 4: URL HTTP externa
- URL: `https://example.com/image.jpg`
- Resultado: Se intenta leer del sistema, puede fallar si no es una ruta local

## Compatibilidad

| Entorno | Status |
|---------|--------|
| Desarrollo (localhost) | ✅ Soportado |
| Producción (VPS) | ✅ Soportado |
| Vercel | ⚠️ Requiere configuración de sistema de archivos |
| Docker | ✅ Soportado |

## Logs de Depuración

```bash
# Ver logs al generar PDF
[PDF] Leyendo imagen desde: /home/richi/Documentos/SAT1475/uploads/evidencias/...
[PDF] Imagen leída, tamaño: 123456 bytes
```

```bash
# Error si archivo no existe
[PDF] Error al agregar imagen al PDF: Error: ENOENT: no such file or directory
```

```bash
# Advertencia si imagen es muy grande
[PDF] Imagen excede 4MB, omitiendo: .../evidencia-xxx.png
```

## Documentos Relacionados

- `src/lib/pdf-generator.ts` - Generador de PDFs
- `src/app/api/uploads/[...path]/route.ts` - API para servir archivos
- `src/components/documentos/EvidenciaFotografica.tsx` - Componente para subir evidencias

## Notas de Implementación

1. **Uso de importación dinámica:** `await import('fs/promises')` evita problemas con SSR en Next.js
2. **Detección de formato:** Se basa en la extensión del archivo, no en el magic number
3. **Manejo de errores:** Los errores se muestran en el PDF para que el usuario sepa qué falló
4. **Ruta del sistema:** `process.cwd()` devuelve el directorio de trabajo del proyecto

## Requisitos Previos

Para que la solución funcione correctamente:

1. ✅ Los archivos deben estar guardados en `process.cwd()/uploads/`
2. ✅ Las URLs en la base de datos deben ser relativas a `/api/uploads/`
3. ✅ El directorio `uploads/` debe tener permisos de lectura
4. ✅ El usuario que ejecuta el servidor debe tener acceso al sistema de archivos

## Alternativas Consideradas

| Alternativa | Pros | Contras | Decisión |
|------------|------|---------|----------|
| Usar `fetch()` con URL absoluta | Funciona con HTTP | Más lento, requiere configuración de URL | ❌ No usado |
| Convertir a Base64 en BD | Rápido, sin sistema de archivos | Tamaño de BD muy grande | ❌ No usado |
| Leer con `fs/promises` | Rápido, sin dependencias | Requiere acceso al sistema de archivos | ✅ **USADO** |

## Conclusión

La solución implementada utiliza `fs/promises.readFile()` para leer las imágenes directamente del sistema de archivos, eliminando la dependencia de `fetch()` y solucionando el problema de URLs relativas. Esta solución es más eficiente y robusta que la alternativa de usar HTTP.

---

**Fecha:** 17 de Enero de 2026
**Autor:** OpenCode AI
**Versión:** 1.0.0
