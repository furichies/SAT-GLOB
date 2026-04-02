# Documentación de la API - Micro1475

Esta guía detalla los endpoints principales de la aplicación Micro1475. Todos los endpoints devuelven un objeto JSON con la estructura base `{ success: boolean, data?: any, error?: string }`.

## 1. Autenticación (`/api/auth`)

### Registro
- **Endpoint**: `POST /api/auth/register`
- **Cuerpo**: `{ email, password, nombre, apellidos, telefono, direccion, ciudad, codigoPostal }`
- **Descripción**: Registra un nuevo cliente en el sistema.

### Inicio de Sesión
- Autenticación gestionada por NextAuth.js en `/api/auth/callback/credentials`.

---

## 2. Tienda y Catálogo (`/api/productos`)

### Listar Productos
- **Endpoint**: `GET /api/productos`
- **Parámetros**: `categoria` (opcional), `busqueda` (opcional).
- **Descripción**: Devuelve los productos activos del catálogo.

### Detalle de Producto
- **Endpoint**: `GET /api/productos/[id]`
- **Descripción**: Datos completos de un producto específico.

---

## 3. Gestión de Pedidos (`/api/pedidos`)

### Crear Pedido
- **Endpoint**: `POST /api/pedidos`
- **Cuerpo**: `{ items: [{ id, cantidad }], direccionEnvio, metodoPago }`
- **Descripción**: Crea un nuevo pedido para el usuario autenticado.

---

## 4. Sistema SAT (Tickets) (`/api/sat/tickets`)

### Listar Tickets
- **Endpoint**: `GET /api/sat/tickets`
- **Descripción**: Lista los tickets del usuario autenticado.

### Crear Ticket
- **Endpoint**: `POST /api/sat/tickets`
- **Cuerpo**: FormData (soporta adjuntos).
- **Campos**: `tipo`, `prioridad`, `asunto`, `descripcion`, `adjuntos` (archivos).

### Comentarios y Seguimiento
- **Endpoint**: `POST /api/sat/tickets/[id]/seguimiento`
- **Cuerpo**: `{ contenido, tipo }`

---

## 5. Administración (`/api/admin_*`)

### Gestión de Pedidos (Admin)
- **Endpoint**: `GET /api/admin_pedidos` -> Listar pedidos.
- **Endpoint**: `PUT /api/admin_pedidos` -> Actualizar estado o datos de envío.

### Gestión de Tickets (Admin)
- **Endpoint**: `GET /api/admin_tickets` -> Listar tickets globales.
- **Endpoint**: `PUT /api/admin_tickets` -> Asignar técnico o resolver.

### Conversión Técnica (SAT -> Pedido)
- **Endpoint**: `POST /api/sat/tickets/[id]/convertir-pedido`
- **Cuerpo**: `{ laborHours, parts: [{ name, cost }] }`
- **Descripción**: Genera un pedido formal y factura a partir de una reparación técnica.
