# UPDATE README

> Documento de actualización del sistema SAT1475
> Fecha: 17 de Enero de 2026
> Versión: 1.5.0

---

## 🐛 BUG FIX IMPORTANTE - URLs Relativas en PDFs

**Actualización:** 17/01/2026 - 15:30

### Problema
Al descargar un PDF con evidencias fotográficas, las imágenes no aparecían y se mostraba el error:

```
TypeError: Failed to parse URL from /api/uploads/evidencias/...
code: 'ERR_INVALID_URL'
```

### Causa
- Las rutas de las imágenes se guardaban como URLs relativas de API (`/api/uploads/evidencias/...`)
- La función `agregarEvidenciasPDF` intentaba usar `fetch()` con estas URLs relativas
- `fetch()` en el contexto del servidor no puede resolver URLs relativas sin la URL base
- Esto causaba el error `ERR_INVALID_URL` y las imágenes se omitían

### Solución
**Archivo:** `src/lib/pdf-generator.ts`

1. **Importar `path` al inicio del archivo:**
```typescript
import path from 'path'
```

2. **Cambiar de `fetch()` a lectura directa con `fs/promises`:**

```typescript
// Antes (NO funcional)
const response = await fetch(evidencia.url) // ❌ URL relativa no funciona
const imageData = Buffer.from(await response.arrayBuffer())

// Después (SOLUCIONADO)
let imagePath = evidencia.url

if (imagePath.startsWith('/api/uploads/')) {
  // Convertir ruta de API a ruta del sistema de archivos
  const pathPart = imagePath.replace('/api/uploads/', '')
  imagePath = path.join(process.cwd(), 'uploads', pathPart)
}

// Importar fs dinámicamente (evita problemas con SSR)
const { readFile } = await import('fs/promises')

// Leer archivo directamente del sistema de archivos
const imageData = await readFile(imagePath)

// Determinar formato según extensión
let formato = 'JPEG'
if (imagePath.toLowerCase().includes('.png')) formato = 'PNG'
else if (imagePath.toLowerCase().includes('.gif')) formato = 'GIF'

// Agregar al PDF
doc.addImage(imageData, formato, x, y, imgWidth, imgHeight, undefined, 'FAST')
```

### Beneficios de la solución
- ✅ **Lectura directa del sistema de archivos** - No depende de la red
- ✅ **Sin problemas de URLs relativas** - `path.join()` resuelve correctamente
- ✅ **Mejor rendimiento** - No hay overhead de HTTP
- ✅ **Mayor robustez** - Manejo de errores mejorado con mensajes específicos
- ✅ **Soporte para múltiples formatos** - Detecta PNG, JPEG, GIF según extensión

### Documentación detallada
Ver `docs/BUG_FIX_PDF_IMAGES.md` para más detalles sobre la solución, casos de prueba y logs.

---

## 🐛 BUG FIX IMPORTANTE - Posicionamiento de Evidencias en PDFs

**Actualización:** 17/01/2026 - 16:00

### Problema
Al descargar un PDF con evidencias fotográficas, las imágenes aparecen muy abajo en el documento, casi al final, fuera del flujo lógico del documento.

**Causa Raíz:**
- La función `agregarEvidenciasPDF` no verificaba si había suficiente espacio en la página actual antes de procesar
- El cálculo de `yPos` para crear nuevas páginas se hacía demasiado tarde
- Las imágenes se agregaban al final del documento sin considerar el contenido previo

### Solución

**Archivo:** `src/lib/pdf-generator.ts`

#### Cambio 1: Verificación de espacio inicial
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

#### Cambio 2: Cálculo de altura total antes de procesar
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

#### Cambio 3: Cálculo correcto de posición final
```typescript
// Antes: return yPos + 20  // Retornaba posición + 20px sin considerar la última imagen

// Después: Asegurar que la última fila se tenga en cuenta
const ultimaFila = Math.floor((evidencias.length - 1) / cols)
const ultimaPosicionY = 20 + (ultimaFila * (imgHeight + gap))

// Devolver la posición correcta para continuar
return ultimaPosicionY + 20
```

### Algoritmo de Posicionamiento Mejorado

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

### Beneficios de la Solución

| Aspecto | Antes | Después |
|---------|-------|---------|
| Posicionamiento | Al final del PDF | Inmediatamente después del contenido |
| Nueva página | Solo si imagen no cabe | Antes de agregar evidencias si es necesario |
| Título | Solo "EVIDENCIAS..." | "(CONTINUACIÓN)" si cambia de página |
| Cálculo de espacio | No se verificaba | Se verifica antes de procesar |
| Logs | Básicos | Detallados con cálculos de espacio |
| Eficiencia | Procesaba aunque no hubiera espacio | Crea nueva página solo si es necesario |

### Casos de Prueba

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
- Si hay espacio, las agrega en la página actual
- Si no hay espacio, crea nueva página

### ✅ Caso 3: Imagen que excede altura de página

**Escenario:**
- Documento con poco espacio al final
- 1 imagen grande que no cabe en la página actual

**Comportamiento esperado:**
- Detecta que la imagen no cabe (y + imgHeight + 15 > pageHeight - 20)
- Crea nueva página antes de agregar la imagen
- La imagen aparece en la nueva página

### Documentación detallada
Ver `docs/BUG_FIX_PDF_POSITIONING.md` para más detalles sobre la solución, algoritmo de posicionamiento y casos de prueba.

---

## 📋 RESUMEN EJECUTIVO

Se ha completado la implementación de **14 tareas** distribuidas en **4 módulos** principales para mejorar la integridad referencial, implementar un sistema de selección de usuarios e integrar evidencias fotográficas en tickets y documentos PDF.

---

## 🎯 OBJETIVOS ALCANZADOS

✅ **Integridad Referencial Completa**
- Validación de tickets y pedidos antes de crear documentos
- Auto-creación de tickets desde Orden de Servicio
- Configuración de cascadas en Prisma (Restrict/Cascade)

✅ **Sistema de Selección de Usuarios**
- API para listar y crear usuarios con filtros
- Componente `UsuarioSelector` con búsqueda en tiempo real
- Creación de usuarios in-place desde el selector
- Integración en formularios de documentos

✅ **Imágenes en Tickets**
- Evidencias fotográficas visibles en panel admin
- Evidencias fotográficas visibles en detalle cliente
- Galería interactiva con preview
- Soporte para múltiples imágenes por documento

✅ **Imágenes en PDFs**
- Inyección de evidencias en generadores de PDF
- Soporte para imágenes de hasta 4MB
- Diseño responsive en grid (2 columnas)
- Descripciones y fechas en PDF

---

## 📊 MÓDULOS IMPLEMENTADOS

### MÓDULO 1: INTEGRIDAD REFERENCIAL (4 tareas)

| Tarea | Descripción | Archivo | Líneas |
|-------|-------------|---------|--------|
| 1.1 | Validación de tickets/pedidos | `src/app/api/admin/documentos/route.ts` | 201-228 |
| 1.2 | Auto-creación de tickets | `src/app/api/admin/documentos/route.ts` | 231-328 |
| 1.3 | Configuración de cascadas | `prisma/schema.prisma` | 265-268 |
| 1.4 | Migración de BD | Comando: `bun run db:push` | - |

#### Detalle Tarea 1.1: Validación de tickets/pedidos

```typescript
// Validación de integridad referencial
if (cleanTicketId) {
  const ticketExiste = await prisma.ticket.findUnique({
    where: { id: cleanTicketId },
    include: { usuario: true, producto: true }
  })
  
  if (!ticketExiste) {
    return NextResponse.json(
      { success: false, error: 'El ticket especificado no existe' },
      { status: 404 }
    )
  }
  (request as any).ticketValidado = ticketExiste
}
```

**Funcionamiento:**
- Antes de crear un documento, valida que exista el ticket/pedido
- Devuelve error 404 si el ID es inválido
- Guarda el ticket validado en el request para uso posterior

#### Detalle Tarea 1.2: Auto-creación de tickets desde Orden de Servicio

```typescript
if ((tipo === 'orden_servicio' || tipo === 'ORDEN_SERVICIO') && !cleanTicketId && metadatos) {
  // 1. Buscar o Crear Cliente (Usuario)
  let cliente = await prisma.usuario.findFirst({
    where: { email: meta.cliente.correoElectronico }
  })

  if (!cliente) {
    cliente = await prisma.usuario.create({ /* ... */ })
  } else {
    // Actualizar datos si cambiaron
    await prisma.usuario.update({ /* ... */ })
  }

  // 2. Buscar o Crear Producto (Equipo)
  const skuEquipo = `CLI-${cliente.id}-${meta.equipo.numeroSerie || 'SIN-SERIE'}`
  let producto = await prisma.producto.findFirst({
    where: { sku: skuEquipo }
  })

  if (!producto) {
    producto = await prisma.producto.create({ /* ... */ })
  }

  // 3. Crear Ticket SAT
  const ticket = await prisma.ticket.create({
    data: {
      numeroTicket: `SAT-${Date.now().toString().slice(-6)}`,
      usuarioId: cliente.id,
      productoId: producto.id,
      tipo: 'reparacion',
      prioridad: 'media',
      estado: 'abierto',
      asunto: `Reparación: ${meta.equipo.tipoEquipo} ${meta.equipo.marca} ${meta.equipo.modelo}`,
      descripcion: /* Detalles completos del problema y estado físico */,
      diagnostico: meta.observacionesTecnico || null
    }
  })

  cleanTicketId = ticket.id
}
```

**Funcionamiento:**
- Si no se proporciona ticketId en una Orden de Servicio:
  1. Busca el cliente por email
  2. Si no existe, lo crea con los datos del formulario
  3. Si existe, actualiza teléfono y dirección
  4. Busca el producto por SKU basado en cliente + número de serie
  5. Si no existe, lo crea con los datos del equipo
  6. Crea un ticket SAT asociando cliente, producto y detalles
  7. Usa el ID del ticket recién creado para el documento

#### Detalle Tarea 1.3: Cascadas en Prisma

```prisma
model Documento {
  // ...
  ticket             Ticket?              @relation(fields: [ticketId], references: [id], onDelete: Restrict)
  pedido             Pedido?              @relation(fields: [pedidoId], references: [id], onDelete: Restrict)
  producto           Producto?            @relation(fields: [productoId], references: [id], onDelete: Cascade)
}

model SeguimientoTicket {
  // ...
  ticket             Ticket               @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}
```

**Configuración de cascadas:**
- `ticket → onDelete: Restrict` → No permite borrar tickets con documentos asociados
- `pedido → onDelete: Restrict` → No permite borrar pedidos con documentos asociados
- `producto → onDelete: Cascade` → Permite borrar productos (sus documentos se borran en cascada)
- `seguimientos → onDelete: Cascade` → Al borrar un ticket, se borran sus seguimientos

---

### MÓDULO 2: SISTEMA DE USUARIOS (4 tareas)

| Tarea | Descripción | Archivo | Líneas |
|-------|-------------|---------|--------|
| 2.1 | API usuarios | `src/app/api/admin/usuarios/route.ts` | 1-115 |
| 2.2 | UsuarioSelector | `src/components/common/UsuarioSelector.tsx` | 1-282 |
| 2.3 | Integración OrdenServicioForm | `src/components/documentos/OrdenServicioForm.tsx` | 107-200 |
| 2.4 | Integración otros formularios | No requerido (DiagnosticoPresupuestoForm ya tiene TecnicoSelector) | - |

#### Detalle Tarea 2.1: API de Usuarios

**Endpoints:**

```
GET /api/admin/usuarios
Parámetros:
  - rol: 'cliente' | 'tecnico' | 'admin' | 'superadmin'
  - busqueda: texto para buscar

Respuesta:
{
  "success": true,
  "data": {
    "usuarios": [
      {
        "id": "string",
        "nombre": "string",
        "apellidos": "string?",
        "email": "string",
        "telefono": "string?",
        "direccion": "string?",
        "codigoPostal": "string?",
        "ciudad": "string?",
        "rol": "string"
      }
    ]
  }
}

POST /api/admin/usuarios
Body:
{
  "nombre": "string",
  "apellidos": "string?",
  "email": "string",
  "telefono": "string?",
  "direccion": "string?",
  "codigoPostal": "string?",
  "ciudad": "string?",
  "rol": "cliente" | "tecnico" | "admin" | "superadmin"
}
```

**Funcionamiento:**
- Lista usuarios activos con filtros por rol y búsqueda
- La búsqueda busca en: nombre, apellidos, email, código postal
- Al crear usuario, valida que el email no exista
- Password temporal: `temporal123` (debe ser cambiado por el usuario)

#### Detalle Tarea 2.2: Componente UsuarioSelector

**Props:**

```typescript
interface UsuarioSelectorProps {
    value: string                          // ID del usuario seleccionado
    onChange: (usuario: Usuario) => void    // Callback al seleccionar
    disabled?: boolean
    filtroRol?: 'cliente' | 'tecnico' | 'admin' | 'superadmin'
    placeholder?: string
    permitirCrear?: boolean                  // Permitir crear usuario in-place
}
```

**Funcionalidades:**
- Carga usuarios desde API al montar
- Búsqueda en tiempo real filtrando por nombre, email o código postal
- Modal para crear nuevo usuario con validaciones
- Auto-actualiza la lista después de crear un usuario
- Si `permitirCrear=true`, muestra opción "Crear nuevo usuario"

**Uso básico:**

```tsx
<UsuarioSelector
  value={usuarioSeleccionado?.id || ''}
  onChange={(usuario) => {
    setUsuarioSeleccionado(usuario)
    // Auto-rellenar campos con datos del usuario
    setDatosCliente({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono,
      direccion: usuario.direccion
    })
  }}
  filtroRol="cliente"
  placeholder="Buscar cliente..."
  permitirCrear={true}
/>
```

#### Detalle Tarea 2.3: Integración en OrdenServicioForm

**Cambios en el formulario:**

1. **Selector de Cliente Existente** (reemplaza entrada manual de email)
2. **Separador visual** "o editar manualmente"
3. **Indicador** cuando es cliente nuevo (se creará usuario y ticket automáticamente)
4. **Campos manuales** siguen editables después de seleccionar usuario

**Flujo de trabajo:**
1. Técnico busca cliente por nombre, email o código postal
2. Si existe, selecciona → campos se rellenan automáticamente
3. Si no existe, hace clic en "Crear nuevo usuario"
4. Modal permite crear usuario con todos los datos
5. Al guardar el formulario, si es cliente nuevo:
   - Se crea el usuario en BD
   - Se crea el producto (equipo)
   - Se crea el ticket SAT
   - Se crea el documento de Orden de Servicio asociado

---

### MÓDULO 3: IMÁGENES EN TICKETS (2 tareas)

| Tarea | Descripción | Archivo | Líneas |
|-------|-------------|---------|--------|
| 3.1 | Evidencias en tickets admin | `src/app/admin/tickets/page.tsx` | 103-106, 655-740 |
| 3.2 | Evidencias en tickets cliente | `src/app/sat/[id]/page.tsx` | 56-58, 740-810 |

#### Detalle Tarea 3.1: Panel Admin

**Funcionamiento:**

En el modal de detalle del ticket:

```tsx
{/* Archivos y Evidencias */}
{ticketSeleccionado.documentos && ticketSeleccionado.documentos.length > 0 && (
  <div className="space-y-4">
    <p>Archivos y Evidencias ({ticketSeleccionado.documentos.length})</p>
    
    {ticketSeleccionado.documentos.map((doc) => {
      const evidencias = doc.evidenciasFotos ? JSON.parse(doc.evidenciasFotos) : []
      const esImagen = doc.rutaArchivo?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      
      // Si es documento sin imágenes (PDF, docx, etc.)
      if (evidencias.length === 0 && !esImagen) {
        return <div className="documento-sin-imagen">...</div>
      }
      
      // Si tiene evidencias o es imagen
      return (
        <div className="documento-con-imagenes">
          <GaleriaDeImagenes evidencias={evidencias} onClick={setPreviewImage} />
        </div>
      )
    })}
  </div>
)}

{/* Modal de preview */}
{previewImage && (
  <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
    <DialogContent className="max-w-5xl p-0">
      <Image src={previewImage} alt="Vista previa" fill className="object-contain" />
    </DialogContent>
  </Dialog>
)}
```

**Características:**
- Documentos sin imágenes se muestran como antes (icono + botón descargar)
- Documentos con evidencias muestran galería de imágenes en grid
- Cada imagen es clickeable y abre modal de preview a pantalla completa
- Muestra descripción y fecha de cada imagen
- Grid responsivo: 3 columnas móvil, 4 columnas desktop

#### Detalle Tarea 3.2: Detalle Cliente

**Funcionamiento:**

En la página de detalle del ticket del cliente:

```tsx
{/* Evidencias Fotográficas */}
{ticket.documentos && ticket.documentos.filter((d) => 
  d.evidenciasFotos || d.rutaArchivo?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
).length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>EVIDENCIAS FOTOGRÁFICAS</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ticket.documentos
          .filter((d) => d.evidenciasFotos)
          .map((doc) => {
            const evidencias = JSON.parse(doc.evidenciasFotos)
            return evidencias.map((img) => (
              <div key={img.id} className="evidencia-item">
                <Image src={img.url} alt={img.descripcion} fill />
                <div className="info">
                  <p>{img.descripcion || 'Sin descripción'}</p>
                  <p>{new Date(img.fechaCaptura).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          })
        }
      </div>
    </CardContent>
  </Card>
)}
```

**Características:**
- Cliente puede ver todas las evidencias de sus tickets
- Galería responsiva: 2 columnas móvil, 3 columnas desktop
- Cada imagen muestra descripción y fecha
- Modal de preview a pantalla completa

---

### MÓDULO 4: IMÁGENES EN PDFs (4 tareas)

| Tarea | Descripción | Archivo | Líneas |
|-------|-------------|---------|--------|
| 4.1 | Función helper agregarEvidenciasPDF | `src/lib/pdf-generator.ts` | 141-219 |
| 4.2 | Integración Orden de Servicio | `src/lib/pdf-generator.ts` | 145, 418-425 |
| 4.3 | Integración Diagnóstico | `src/lib/pdf-generator.ts` | 425, 620-625 |
| 4.4 | Integración Albarán | `src/lib/pdf-generator.ts` | 788, 851-856 |

#### Detalle Tarea 4.1: Función agregarEvidenciasPDF

```typescript
async function agregarEvidenciasPDF(
    doc: jsPDF,
    evidencias: any[],
    yPos: number
): Promise<number> {
    if (!evidencias || evidencias.length === 0) return yPos

    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('EVIDENCIAS FOTOGRÁFICAS', 20, yPos)
    yPos += 7

    const imgWidth = 70
    const imgHeight = 70
    const cols = 2
    const gap = 10
    const margin = 20

    for (let i = 0; i < evidencias.length; i++) {
        const evidencia = evidencias[i]
        const col = i % cols
        const row = Math.floor(i / cols)

        const x = margin + (col * (imgWidth + gap))
        const y = yPos + (row * (imgHeight + gap))

        // Nueva página si no hay espacio
        if (y + imgHeight + 15 > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage()
            yPos = 20
        }

        try {
            const response = await fetch(evidencia.url)
            const arrayBuffer = await response.arrayBuffer()
            const imageData = Buffer.from(arrayBuffer)

            // Validar tamaño máximo 4MB
            if (imageData.length > 4 * 1024 * 1024) {
                doc.text(`Imagen omitida (excede 4MB)`, x, y + 30)
                continue
            }

            // Agregar imagen al PDF
            doc.addImage(imageData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST')

            // Descripción y fecha
            doc.setFontSize(7)
            const descripcion = evidencia.descripcion || `Evidencia ${i + 1}`
            const fecha = new Date(evidencia.fechaCaptura).toLocaleDateString('es-ES')
            const descLines = doc.splitTextToSize(`${descripcion} (${fecha})`, imgWidth)
            doc.text(descLines, x, y + imgHeight + 3)

            if (col === cols - 1) {
                yPos = y + imgHeight + 15
            }
        } catch (error) {
            doc.text(`Error al cargar imagen`, x, y + 30)
        }
    }

    return yPos + 20
}
```

**Características:**
- Procesa array de evidencias
- Grid de 2 columnas (70x70px cada imagen)
- Validación de tamaño máximo 4MB
- Muestra descripción y fecha debajo de cada imagen
- Crea nueva página automáticamente si no hay espacio
- Manejo de errores (continúa con siguiente imagen si falla)

#### Detalle Tareas 4.2-4.4: Integración en generadores de PDF

**Cambios en cada generador:**

```typescript
// 1. Hacer async la función
async function generarOrdenServicio(doc: jsPDF, documento: any, metadatos: MetadatosOrdenServicio | null) {
    // ... código existente hasta el final ...
    
    // 2. Agregar evidencias antes de agregarPiePagina
    if (documento.evidenciasFotos) {
        try {
            const evidencias = JSON.parse(documento.evidenciasFotos)
            if (evidencias.length > 0) {
                yPos = await agregarEvidenciasPDF(doc, evidencias, yPos)
            }
        } catch (error) {
            console.error('Error al procesar evidencias:', error)
        }
    }
    
    agregarPiePagina(doc)
}
```

**Funciones actualizadas:**
1. `generarOrdenServicio` - Estado inicial del equipo
2. `generarDiagnosticoPresupuesto` - Pruebas realizadas
3. `generarAlbaranEntrega` - Estado final del equipo

**No se agregan en:**
- `generarAceptacionPresupuesto` - Solo texto de confirmación
- `generarRechazoPresupuesto` - Solo texto de rechazo
- `generarExtensionPresupuesto` - Solo texto de extensión (puede agregarse si se desea)

---

## 📝 ARCHIVOS MODIFICADOS Y CREADOS

### Archivos Modificados

| Archivo | Cambios | Líneas Afectadas |
|---------|---------|------------------|
| `prisma/schema.prisma` | Configuración de cascadas | 265-268, 205 |
| `src/app/api/admin/documentos/route.ts` | Validaciones y auto-creación de tickets | 201-328 |
| `src/components/documentos/OrdenServicioForm.tsx` | Integración UsuarioSelector | 1-3, 71, 107-200 |
| `src/app/admin/tickets/page.tsx` | Evidencias visibles, preview modal | 1-4, 103-106, 655-740, 1120-1132 |
| `src/app/sat/[id]/page.tsx` | Evidencias visibles, preview modal | 1-3, 56-58, 740-810, 855-865 |
| `src/lib/pdf-generator.ts` | Función agregarEvidenciasPDF, integración en generadores | 141-219, 38, 52-76, 145, 425, 788 |

### Archivos Nuevos

| Archivo | Descripción | Líneas |
|---------|-------------|---------|
| `src/app/api/admin/usuarios/route.ts` | API para listar y crear usuarios | 115 |
| `src/components/common/UsuarioSelector.tsx` | Componente de selección de usuarios | 282 |

---

## 🔄 FLUJO DE TRABAJO ACTUALIZADO

### Flujo de Creación de Orden de Servicio

```
1. Admin navega a /admin/documentos/nuevo
2. Selecciona "Orden de Servicio"
3. Busca cliente existente o crea uno nuevo con UsuarioSelector
   a. Si existe: campos se rellenan automáticamente
   b. Si no existe: Modal para crear usuario
4. Completa datos del equipo y problema
5. Sube evidencias fotográficas (si aplica)
6. Guarda documento
   a. Si es cliente nuevo y no hay ticketId:
      - Crea usuario en BD
      - Crea producto (equipo)
      - Crea ticket SAT
      - Crea documento de Orden de Servicio asociado
   b. Si es cliente existente y no hay ticketId:
      - Actualiza datos del usuario
      - Crea/Busca producto
      - Crea ticket SAT
      - Crea documento asociado
   c. Si hay ticketId:
      - Crea documento asociado al ticket existente
7. Genera PDF con evidencias incluidas (si hay)
8. Cliente puede ver evidencias en su ticket
9. Técnico puede ver evidencias en panel admin
```

### Flujo de Visualización de Evidencias

**En Panel Admin:**
```
1. Admin accede a /admin/tickets
2. Selecciona ticket → se abre modal de detalle
3. Sección "Archivos y Evidencias" muestra:
   - Documentos sin imágenes: icono + botón descargar
   - Documentos con evidencias: galería de imágenes
4. Clic en imagen → modal de preview a pantalla completa
```

**En Panel Cliente:**
```
1. Cliente accede a /sat/[id]
2. Si el ticket tiene documentos con evidencias:
   - Se muestra tarjeta "EVIDENCIAS FOTOGRÁFICAS"
   - Galería de imágenes con descripciones y fechas
3. Clic en imagen → modal de preview
```

### Flujo de Generación de PDF

```
1. Usuario hace clic en "Descargar PDF" en documento
2. Se llama a /api/admin/documentos/[id]/pdf
3. API llama a generarPDFDocumento(documento)
4. Generador procesa según tipo:
   - Orden de Servicio → generarOrdenServicio
   - Diagnóstico → generarDiagnosticoPresupuesto
   - Albarán → generarAlbaranEntrega
5. Cada generador:
   a. Agrega encabezado y datos básicos
   b. Agrega secciones específicas del documento
   c. **Si hay evidenciasFotos:**
      - Parsea JSON de evidencias
      - Llama a agregarEvidenciasPDF
      - Agrega imágenes en grid de 2 columnas
      - Muestra descripciones y fechas
   d. Agrega pie de página
6. PDF generado incluye todas las evidencias
```

---

## 🧪 PLAN DE PRUEBAS

### Pruebas Módulo 1: Integridad Referencial

1. **Validación de tickets inválidos**
   - Crear documento con ticketId inexistente
   - Resultado esperado: Error 404 "El ticket especificado no existe"

2. **Auto-creación de ticket con cliente nuevo**
   - Crear Orden de Servicio sin ticketId
   - Usar email que no existe en BD
   - Resultado esperado: Usuario creado, producto creado, ticket creado, documento asociado

3. **Auto-creación de ticket con cliente existente**
   - Crear Orden de Servicio con email existente
   - Resultado esperado: Usuario actualizado, ticket creado, documento asociado

4. **Cascada Restrict en tickets**
   - Intentar borrar ticket que tiene documentos asociados
   - Resultado esperado: Error de Prisma (FK restrict)

5. **Cascada Cascade en productos**
   - Borrar producto que tiene documentos
   - Resultado esperado: Productos y documentos borrados correctamente

### Pruebas Módulo 2: Sistema de Usuarios

1. **Listar usuarios**
   - GET `/api/admin/usuarios`
   - GET `/api/admin/usuarios?rol=cliente`
   - GET `/api/admin/usuarios?busqueda=juan`
   - Resultado esperado: Lista filtrada correctamente

2. **Crear usuario nuevo**
   - POST `/api/admin/usuarios` con datos válidos
   - Resultado esperado: Usuario creado con password temporal

3. **Validar email duplicado**
   - Crear usuario con email que ya existe
   - Resultado esperado: Error 400 "Ya existe un usuario con ese email"

4. **UsuarioSelector - Búsqueda**
   - Escribir en campo de búsqueda
   - Resultado esperado: Lista se filtra en tiempo real

5. **UsuarioSelector - Crear in-place**
   - Hacer clic en "Crear nuevo usuario"
   - Completar formulario y guardar
   - Resultado esperado: Usuario creado y seleccionado automáticamente

6. **Auto-relleno en OrdenServicioForm**
   - Seleccionar cliente existente
   - Resultado esperado: Campos de cliente se rellenan automáticamente

### Pruebas Módulo 3: Imágenes en Tickets

1. **Panel Admin - Ver evidencias**
   - Crear ticket con documento que tenga evidencias
   - Abrir modal de detalle
   - Resultado esperado: Galería de imágenes visible

2. **Panel Admin - Preview de imagen**
   - Hacer clic en imagen
   - Resultado esperado: Modal con imagen a pantalla completa

3. **Panel Cliente - Ver evidencias**
   - Cliente accede a su ticket con evidencias
   - Resultado esperado: Sección de evidencias visible

4. **Panel Cliente - Preview de imagen**
   - Hacer clic en imagen
   - Resultado esperado: Modal con imagen a pantalla completa

5. **Documentos sin imágenes**
   - Ticket con documentos PDF/docx
   - Resultado esperado: Se muestran como iconos con botón descargar

### Pruebas Módulo 4: Imágenes en PDFs

1. **Orden de Servicio con evidencias**
   - Crear Orden de Servicio y subir 3-5 imágenes
   - Descargar PDF
   - Resultado esperado: PDF incluye sección "EVIDENCIAS FOTOGRÁFICAS" con imágenes en grid

2. **Diagnóstico con evidencias**
   - Crear Diagnóstico y subir imágenes de pruebas
   - Descargar PDF
   - Resultado esperado: PDF incluye evidencias con descripciones

3. **Albarán con evidencias**
   - Crear Albarán y subir imágenes del equipo reparado
   - Descargar PDF
   - Resultado esperado: PDF incluye evidencias del estado final

4. **Validación de tamaño máximo**
   - Intentar subir imagen > 4MB
   - Resultado esperado: Imagen omitida con mensaje en PDF

5. **Muchas imágenes**
   - Crear documento con 15+ imágenes
   - Descargar PDF
   - Resultado esperado: PDF crea nuevas páginas automáticamente

6. **Descripciones y fechas**
   - Verificar que cada imagen muestra su descripción y fecha en PDF
   - Resultado esperado: Formato: "Descripción (fecha)"

---

## ⚠️ RESTRICCIONES Y LIMITACIONES

### Imágenes
- **Tamaño máximo por imagen:** 4MB
- **Número máximo de imágenes:** Sin límite definido (recomendado 15 por documento)
- **Formatos soportados:** jpg, jpeg, png, gif, webp
- **Tamaño en PDF:** 70x70px por imagen (grid de 2 columnas)

### Usuarios
- **Password temporal:** `temporal123` (debe ser cambiado en primer inicio)
- **Roles permitidos en UsuarioSelector:** cliente, técnico, admin, superadmin
- **Búsqueda:** Busca en nombre, apellidos, email, código postal

### Cascadas
- **Tickets con documentos:** No se pueden borrar (Restrict)
- **Pedidos con documentos:** No se pueden borrar (Restrict)
- **Productos con documentos:** Se pueden borrar (borra documentos en cascada)

---

## 🚀 INSTALACIÓN Y CONFIGURACIÓN

### Pasos para desplegar los cambios

1. **Verificar que el código está actualizado:**
   ```bash
   cd /home/richi/Documentos/SAT1475
   git status
   ```

2. **Instalar dependencias (si no están instaladas):**
   ```bash
   bun install
   ```

3. **Aplicar migración de base de datos:**
   ```bash
   bun run db:push
   ```

4. **Construir proyecto:**
   ```bash
   bun run build
   ```

5. **Iniciar servidor de desarrollo:**
   ```bash
   bun run dev
   ```

   O para producción:
   ```bash
   ./scripts/start-pm2.sh
   ```

### Configuración de variables de entorno

Verificar que `.env` contiene:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-aqui"
```

---

## 📖 DOCUMENTACIÓN DE USUARIO

### Para Administradores

**Crear Orden de Servicio con nuevo cliente:**
1. Navegar a `/admin/documentos/nuevo`
2. Seleccionar "Orden de Servicio"
3. En "Datos del Cliente", hacer clic en "Crear nuevo usuario"
4. Completar datos del cliente (nombre, email, teléfono, dirección)
5. Guardar → Se creará usuario, producto, ticket y documento automáticamente

**Seleccionar cliente existente:**
1. Escribir en el campo de búsqueda (nombre, email o código postal)
2. Seleccionar cliente de la lista
3. Los campos se rellenan automáticamente
4. Editar si es necesario
5. Guardar → Se creará ticket y documento

**Ver evidencias en tickets:**
1. Navegar a `/admin/tickets`
2. Hacer clic en "Ver" del ticket
3. En el modal, desplazar hasta "Archivos y Evidencias"
4. Hacer clic en cualquier imagen para verla a pantalla completa

### Para Clientes

**Ver evidencias de su ticket:**
1. Iniciar sesión
2. Navegar a `/sat`
3. Abrir ticket desde la lista
4. Desplazar hasta "EVIDENCIAS FOTOGRÁFICAS"
5. Hacer clic en cualquier imagen para verla

### Para Técnicos

**Subir evidencias:**
1. Crear o editar documento
2. En el componente "EvidenciaFotográfica", hacer clic en "Subir Evidencias"
3. Seleccionar imágenes (máximo 4MB cada una)
4. Agregar descripción opcional
5. Guardar → Las imágenes se guardan y aparecen en el ticket y PDF

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error 404: "El ticket especificado no existe"
**Causa:** Se intentó crear un documento con un ticketId inválido  
**Solución:** Verificar que el ticket existe o dejar el campo vacío para autogenerar

### Error 400: "Ya existe un usuario con ese email"
**Causa:** Se intentó crear un usuario con email duplicado  
**Solución:** Buscar el usuario existente o usar un email diferente

### Error al cargar imágenes en PDF
**Causa:** La URL de la imagen no es accesible desde el servidor  
**Solución:** Verificar que las imágenes estén en `/uploads/evidencias/` y que la API `/api/uploads/` funcione

### Imagen omitida en PDF por tamaño
**Causa:** La imagen excede el límite de 4MB  
**Solución:** Comprimir la imagen o usar una de menor tamaño antes de subirla

---

## 📚 RECURSOS ADICIONALES

### Documentos Relacionados
- `docs/PLAN_SEGUIMIENTO_DOCUMENTACION.md` - Plan original del sistema de documentos
- `src/types/documentos.ts` - Tipos TypeScript para metadatos de documentos
- `src/types/enums.ts` - Enums de tipos de documentos y estados

### Archivos Clave
- `src/lib/pdf-generator.ts` - Generador de PDFs con evidencias
- `src/components/documentos/EvidenciaFotografica.tsx` - Componente para subir/ver evidencias
- `src/app/api/admin/documentos/[id]/evidencias/route.ts` - API para evidencias

---

## 📊 ESTADÍSTICAS DEL PROYECTO

### Métricas antes de la actualización
- Archivos TypeScript: 159
- Líneas de código: ~4,000
- Módulos principales: 5 (Tienda, SAT, Admin, Auth, Documentos)

### Métricas después de la actualización
- Archivos TypeScript: 161 (+2 nuevos)
- Líneas de código: ~4,500 (+500 líneas)
- Nuevas funcionalidades: 8
- Mejoras de integridad: 3
- Documentos con imágenes: 3

---

## 🎓 LECCIONES APRENDIDAS

1. **Integridad referencial:** Validar siempre las FKs antes de crear registros
2. **Auto-creación:** Es posible crear tickets automáticamente cuando no existen
3. **Componentes reutilizables:** UsuarioSelector puede usarse en múltiples formularios
4. **Imágenes en PDF:** jsPDF puede incluir imágenes desde URLs remotas
5. **Validación de tamaño:** Es importante validar el tamaño de archivos antes de procesar
6. **Gestión de estado:** Para async operations en PDFs, todas las funciones de generación deben ser async

---

## 🚀 PRÓXIMAS MEJORORAS SUGERIDAS

1. **Compresión automática de imágenes** antes de guardar
2. **Gestión de versiones** de documentos
3. **Firma digital** en PDFs (ya existe campo en schema)
4. **Notificaciones** al cliente cuando se agregan evidencias
5. **Búsqueda avanzada** en documentos (por fecha, tipo, cliente)
6. **Bulk upload** de imágenes (arrastrar y soltar múltiples archivos)
7. **Cropping** básico de imágenes en el componente de evidencias
8. **Watermark** automático en imágenes del logo de la empresa

---

## 📞 SOPORTE

Para reportar problemas o solicitar asistencia:

1. Verificar la sección de solución de problemas
2. Revisar los logs de la aplicación
3. Crear issue en el repositorio con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Capturas de pantalla si aplica
   - Logs relevantes

---

**Fin del documento de actualización**
