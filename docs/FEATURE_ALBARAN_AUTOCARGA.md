# 🎯 IMPLEMENTACIÓN: Auto-carga de Datos en Albarán de Entrega

**Fecha:** 18 de Enero de 2026  
**Versión:** 1.7.0  
**Tipo:** Feature - Automatización de Flujo de Documentos

---

## 📋 RESUMEN EJECUTIVO

Se ha implementado la **carga automática de datos** en el formulario de Albarán de Entrega, que recupera información de todos los documentos asociados al ticket para generar automáticamente:
- Datos del equipo (desde Orden de Servicio)
- Reparaciones realizadas (desde Diagnóstico y Presupuesto + Extensiones)
- Repuestos utilizados (desde Diagnóstico y Presupuesto + Extensiones)
- Monto total a cobrar (suma de Presupuesto + Extensiones)
- Datos del cliente

Al completar el Albarán de Entrega, se **genera automáticamente una Factura** con todos los datos.

---

## 🎯 OBJETIVOS ALCANZADOS

✅ **Carga Automática de Datos**
- Recupera datos del ticket y sus documentos asociados
- Auto-rellena equipo, reparaciones, repuestos y monto
- Muestra indicador de carga mientras procesa

✅ **Integración con Documentos Previos**
- Orden de Servicio → Datos del equipo y cliente
- Diagnóstico y Presupuesto → Trabajos, repuestos y costos
- Extensiones de Presupuesto → Trabajos adicionales y costos extras

✅ **Generación Automática de Factura**
- Al guardar el Albarán, se crea automáticamente la Factura
- La factura incluye todos los datos del albarán
- Se relaciona la factura con el albarán

---

## 🔄 FLUJO DE TRABAJO ACTUALIZADO

### Flujo Completo de Reparación con Auto-carga

```
1. ORDEN DE SERVICIO
   ├─ Cliente entrega equipo
   ├─ Se registran datos del equipo
   ├─ Se crea ticket automáticamente
   └─ Datos guardados: equipo, cliente, problema

2. DIAGNÓSTICO Y PRESUPUESTO
   ├─ Técnico diagnostica el problema
   ├─ Define trabajos necesarios
   ├─ Define repuestos necesarios
   ├─ Calcula costos (repuestos + mano de obra)
   └─ Datos guardados: diagnóstico, trabajos, repuestos, costos

3. ACEPTACIÓN/RECHAZO
   ├─ Cliente acepta o rechaza presupuesto
   └─ Si acepta → continúa flujo

4. EXTENSIÓN (Opcional)
   ├─ Se descubren problemas adicionales
   ├─ Se definen trabajos adicionales
   ├─ Se definen repuestos adicionales
   ├─ Se calcula costo adicional
   └─ Datos guardados: trabajos extra, repuestos extra, costo extra

5. REPARACIÓN
   └─ Técnico realiza la reparación

6. ALBARÁN DE ENTREGA ⭐ AUTO-CARGA
   ├─ Al abrir formulario con ticketId:
   │   ├─ Carga datos del ticket
   │   ├─ Busca Orden de Servicio → extrae datos del equipo
   │   ├─ Busca Diagnóstico → extrae trabajos y repuestos
   │   ├─ Busca Extensiones → suma trabajos y repuestos adicionales
   │   ├─ Calcula monto total (Presupuesto + Extensiones)
   │   └─ Auto-rellena todos los campos
   ├─ Técnico verifica y ajusta si es necesario
   ├─ Registra pago recibido
   ├─ Cliente firma recepción
   └─ Al guardar:
       ├─ Se crea Albarán de Entrega
       └─ Se genera Factura automáticamente

7. FACTURA (Auto-generada)
   ├─ Número de factura único
   ├─ Datos del cliente
   ├─ Descripción del servicio
   ├─ Subtotal, IVA y Total
   ├─ Método de pago
   └─ Relacionada con el Albarán
```

---

## 🔧 DETALLES TÉCNICOS

### Algoritmo de Carga Automática

```typescript
async function cargarDatosDesdeTicket() {
    // 1. Obtener ticket
    const ticket = await fetch(`/api/sat/tickets/${ticketId}`)
    
    // 2. Obtener documentos del ticket
    const documentos = await fetch(`/api/admin/documentos?ticketId=${ticketId}`)
    
    // 3. Extraer datos del equipo (Orden de Servicio)
    const ordenServicio = documentos.find(d => d.tipo === 'orden_servicio')
    if (ordenServicio) {
        equipo = {
            tipo: ordenServicio.metadatos.equipo.tipoEquipo,
            marca: ordenServicio.metadatos.equipo.marca,
            modelo: ordenServicio.metadatos.equipo.modelo,
            numeroSerie: ordenServicio.metadatos.equipo.numeroSerie
        }
        clienteRecibe = {
            nombre: ordenServicio.metadatos.cliente.nombreCompleto,
            identificacion: ordenServicio.metadatos.cliente.dni
        }
    }
    
    // 4. Extraer trabajos y repuestos (Diagnóstico)
    const diagnostico = documentos.find(d => d.tipo === 'diagnostico_presupuesto')
    if (diagnostico) {
        reparaciones = diagnostico.metadatos.trabajosNecesarios.manoObra.map(mo => mo.descripcion)
        repuestos = diagnostico.metadatos.trabajosNecesarios.repuestos
        monto = diagnostico.metadatos.costos.total
    }
    
    // 5. Agregar trabajos y repuestos adicionales (Extensiones)
    const extensiones = documentos.filter(d => d.tipo === 'extension_presupuesto')
    extensiones.forEach(ext => {
        reparaciones.push(...ext.metadatos.nuevosTrabajos.manoObraExtra.map(mo => mo.descripcion))
        repuestos.push(...ext.metadatos.nuevosTrabajos.repuestosAdicionales)
        monto += ext.metadatos.costoAdicional.total
    })
}
```

### Datos Extraídos por Documento

| Documento | Datos Extraídos | Campos Afectados |
|-----------|-----------------|------------------|
| **Orden de Servicio** | - Tipo de equipo<br>- Marca<br>- Modelo<br>- Número de serie<br>- Nombre del cliente<br>- DNI del cliente | - `equipo.tipo`<br>- `equipo.marca`<br>- `equipo.modelo`<br>- `equipo.numeroSerie`<br>- `clienteRecibe.nombre`<br>- `clienteRecibe.identificacion` |
| **Diagnóstico y Presupuesto** | - Descripción de trabajos<br>- Mano de obra<br>- Repuestos necesarios<br>- Costo total | - `reparaciones[]`<br>- `repuestos[]`<br>- `pago.monto` |
| **Extensión de Presupuesto** | - Trabajos adicionales<br>- Repuestos adicionales<br>- Costo adicional | - `reparaciones[]` (suma)<br>- `repuestos[]` (suma)<br>- `pago.monto` (suma) |

---

## 📊 EJEMPLO DE DATOS CARGADOS

### Escenario: Reparación de Smartphone

**Orden de Servicio:**
```json
{
  "equipo": {
    "tipoEquipo": "Smartphone",
    "marca": "Samsung",
    "modelo": "Galaxy S21",
    "numeroSerie": "IMEI123456789"
  },
  "cliente": {
    "nombreCompleto": "Juan Pérez García",
    "dni": "12345678A"
  }
}
```

**Diagnóstico y Presupuesto:**
```json
{
  "trabajosNecesarios": {
    "descripcionDetallada": "Sustitución de pantalla y batería",
    "manoObra": [
      { "descripcion": "Desmontaje y limpieza", "horas": 1, "precio": 40 },
      { "descripcion": "Instalación de pantalla nueva", "horas": 1.5, "precio": 60 }
    ],
    "repuestos": [
      { "codigo": "PANT-S21", "descripcion": "Pantalla AMOLED Samsung S21", "cantidad": 1, "precio": 150 },
      { "codigo": "BAT-S21", "descripcion": "Batería Samsung S21", "cantidad": 1, "precio": 40 }
    ]
  },
  "costos": {
    "repuestos": 190,
    "manoObra": 100,
    "total": 290
  }
}
```

**Extensión de Presupuesto:**
```json
{
  "nuevosTrabajos": {
    "descripcionDetallada": "Sustitución de cámara trasera dañada",
    "manoObraExtra": [
      { "descripcion": "Instalación de cámara", "horas": 0.5, "precio": 20 }
    ],
    "repuestosAdicionales": [
      { "codigo": "CAM-S21", "descripcion": "Cámara trasera Samsung S21", "cantidad": 1, "precio": 80 }
    ]
  },
  "costoAdicional": {
    "repuestos": 80,
    "manoObra": 20,
    "total": 100
  }
}
```

**Albarán de Entrega (Auto-cargado):**
```json
{
  "equipoEntregado": {
    "tipo": "Smartphone",
    "marca": "Samsung",
    "modelo": "Galaxy S21",
    "numeroSerie": "IMEI123456789"
  },
  "reparacionesRealizadas": [
    "Sustitución de pantalla y batería",
    "Desmontaje y limpieza",
    "Instalación de pantalla nueva",
    "Sustitución de cámara trasera dañada",
    "Instalación de cámara"
  ],
  "repuestosUtilizados": [
    { "codigo": "PANT-S21", "descripcion": "Pantalla AMOLED Samsung S21", "cantidad": 1, "garantiaMeses": 6 },
    { "codigo": "BAT-S21", "descripcion": "Batería Samsung S21", "cantidad": 1, "garantiaMeses": 6 },
    { "codigo": "CAM-S21", "descripcion": "Cámara trasera Samsung S21", "cantidad": 1, "garantiaMeses": 6 }
  ],
  "pagoRecibido": {
    "metodo": "tarjeta",
    "monto": 390,  // 290 (presupuesto) + 100 (extensión)
    "referencia": ""
  },
  "clienteRecibe": {
    "nombre": "Juan Pérez García",
    "identificacion": "12345678A"
  }
}
```

---

## 🧪 PLAN DE PRUEBAS

### Prueba 1: Carga Automática Básica
1. Crear Orden de Servicio con datos del equipo
2. Crear Diagnóstico y Presupuesto con trabajos y repuestos
3. Crear Albarán de Entrega con el ticketId
4. **Resultado esperado:**
   - Equipo auto-rellenado
   - Reparaciones auto-rellenadas
   - Repuestos auto-rellenados
   - Monto auto-calculado

### Prueba 2: Carga con Extensión
1. Crear Orden de Servicio
2. Crear Diagnóstico (monto: 200€)
3. Crear Extensión (monto adicional: 100€)
4. Crear Albarán de Entrega
5. **Resultado esperado:**
   - Monto total: 300€
   - Trabajos incluyen los de diagnóstico + extensión
   - Repuestos incluyen los de diagnóstico + extensión

### Prueba 3: Carga con Múltiples Extensiones
1. Crear Orden de Servicio
2. Crear Diagnóstico (monto: 200€)
3. Crear Extensión 1 (monto adicional: 50€)
4. Crear Extensión 2 (monto adicional: 75€)
5. Crear Albarán de Entrega
6. **Resultado esperado:**
   - Monto total: 325€
   - Todos los trabajos y repuestos incluidos

### Prueba 4: Generación Automática de Factura
1. Crear Albarán de Entrega completo
2. Guardar el albarán
3. **Resultado esperado:**
   - Albarán creado correctamente
   - Factura generada automáticamente
   - Factura relacionada con el albarán
   - Factura con estado "firmado"

### Prueba 5: Manejo de Errores
1. Crear Albarán con ticketId inválido
2. **Resultado esperado:**
   - Mensaje de error mostrado
   - Formulario permite entrada manual

---

## ⚠️ RESTRICCIONES Y LIMITACIONES

### Carga Automática
- **Requiere ticketId válido:** Si no se proporciona ticketId, no se carga automáticamente
- **Documentos previos necesarios:** Si no existen documentos previos, algunos campos quedan vacíos
- **Orden de documentos:** Se procesan en orden: Orden de Servicio → Diagnóstico → Extensiones

### Generación de Factura
- **Solo desde Albarán:** La factura solo se genera al crear un Albarán de Entrega
- **Factura única:** Solo se genera una factura por albarán
- **Estado inicial:** La factura se crea con estado "firmado" (cerrada)

---

## 📁 ARCHIVOS MODIFICADOS

| Archivo | Cambios | Líneas Afectadas |
|---------|---------|------------------|
| `src/components/documentos/AlbaranEntregaForm.tsx` | Implementación completa de carga automática | 1-450 |

---

## 🚀 INSTALACIÓN Y CONFIGURACIÓN

### No se requieren cambios en la base de datos

La funcionalidad utiliza las APIs y esquemas existentes.

### Reiniciar servidor

```bash
bun run dev
```

---

## 📖 DOCUMENTACIÓN DE USUARIO

### Para Técnicos

**Crear Albarán de Entrega:**
1. Navegar a `/admin/documentos/nuevo`
2. Seleccionar "Albarán de Entrega"
3. Seleccionar el ticket asociado
4. **Esperar a que se carguen los datos automáticamente** (indicador de carga visible)
5. Verificar que los datos sean correctos
6. Ajustar si es necesario (campos editables)
7. Registrar método de pago y monto (ya calculado)
8. Ingresar nombre y DNI de quien recibe
9. Guardar → Se crea Albarán y Factura automáticamente

**Campos Auto-rellenados:**
- ✅ Tipo, marca, modelo y número de serie del equipo
- ✅ Lista de reparaciones realizadas
- ✅ Lista de repuestos utilizados
- ✅ Monto total a cobrar
- ✅ Nombre del cliente

**Campos Manuales:**
- ⚙️ Método de pago
- ⚙️ Referencia de pago (opcional)
- ⚙️ DNI de quien recibe
- ⚙️ Observaciones de entrega
- ⚙️ Garantía (meses)

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Los datos no se cargan automáticamente
**Causa:** No se proporcionó ticketId o el ticket no existe  
**Solución:** Verificar que se seleccionó un ticket válido

### Faltan datos en el formulario
**Causa:** No existen documentos previos (Orden de Servicio, Diagnóstico)  
**Solución:** Crear los documentos previos antes del Albarán

### El monto no es correcto
**Causa:** Extensiones de presupuesto no se están sumando  
**Solución:** Verificar que las extensiones tengan `costoAdicional.total` definido

### La factura no se genera
**Causa:** Error en la API al crear la factura  
**Solución:** Revisar logs del servidor, verificar que el albarán tenga `pagoRecibido.monto`

---

## 🎓 LECCIONES APRENDIDAS

1. **Automatización reduce errores:** Auto-cargar datos evita errores de transcripción
2. **Flujo de documentos:** Es importante mantener el orden correcto de documentos
3. **Suma de costos:** Las extensiones deben sumarse al costo original
4. **Validación de datos:** Siempre validar que los datos cargados sean correctos
5. **Indicadores de carga:** Importante mostrar al usuario que se están cargando datos

---

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

1. **Vista previa de datos** antes de cargar
2. **Histórico de cambios** en el albarán
3. **Notificación al cliente** cuando se genera la factura
4. **Descarga automática** del PDF de la factura
5. **Integración con sistema de contabilidad** para enviar facturas automáticamente

---

**Fin del documento de implementación**
