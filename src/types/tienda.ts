import { ProductoTipo, PedidoEstado, MetodoPago } from './enums'
import { User } from './auth'

// ==================== CATEGORÍAS ====================

export interface Categoria {
  id: string
  nombre: string
  descripcion?: string | null
  imagenUrl?: string | null
  categoriaPadreId?: string | null
  orden: number
  activa: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
  subcategorias?: Categoria[]
  productos?: Producto[]
}

export interface CategoriaConSubcategorias extends Categoria {
  subcategorias: Categoria[]
}

// ==================== PRODUCTOS ====================

export interface Producto {
  id: string
  sku: string
  nombre: string
  descripcion?: string | null
  descripcionCorta?: string | null
  precio: number
  precioOferta?: number | null
  stock: number
  stockMinimo: number
  categoriaId?: string | null
  marca?: string | null
  modelo?: string | null
  tipo: ProductoTipo
  especificaciones?: string | null
  imagenes?: string | null
  peso?: number | null
  dimensiones?: string | null
  garantiaMeses: number
  activo: boolean
  destacado: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
  categoria?: Categoria
  valoracionMedia?: number
  totalValoraciones?: number
}

export interface ProductoConDetalles extends Producto {
  categoria: Categoria
  valoraciones: Valoracion[]
}

export interface ProductoFiltros {
  categoriaId?: string
  tipo?: ProductoTipo
  marca?: string
  precioMin?: number
  precioMax?: number
  enStock?: boolean
  enOferta?: boolean
  destacado?: boolean
  busqueda?: string
  page?: number
  limit?: number
  sortBy?: 'precio' | 'nombre' | 'valoracion' | 'novedad'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductoListResponse {
  productos: Producto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ==================== CARRITO ====================

export interface CarritoItem {
  id: string
  usuarioId?: string | null
  sessionId?: string | null
  productoId: string
  cantidad: number
  fechaAgregado: Date
  producto: Producto
}

export interface CarritoConDetalles extends CarritoItem {
  subtotal: number
}

export interface AddCarritoRequest {
  productoId: string
  cantidad: number
  sessionId?: string
}

export interface UpdateCarritoRequest {
  cantidad: number
}

export interface CarritoResumen {
  items: CarritoConDetalles[]
  subtotal: number
  iva: number
  total: number
}

// ==================== PEDIDOS ====================

export interface DireccionEnvio {
  nombre: string
  apellidos: string
  direccion: string
  codigoPostal: string
  ciudad: string
  provincia: string
  telefono: string
}

export interface Pedido {
  id: string
  numeroPedido: string
  usuarioId: string
  estado: PedidoEstado
  subtotal: number
  iva: number
  gastosEnvio: number
  total: number
  direccionEnvio: string
  metodoPago: MetodoPago
  referenciaPago?: string | null
  notas?: string | null
  fechaPedido: Date
  fechaEnvio?: Date | null
  fechaEntrega?: Date | null
  usuario?: User
  detalles?: DetallePedido[]
}

export interface DetallePedido {
  id: string
  pedidoId: string
  productoId: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
  producto: Producto
}

export interface PedidoConDetalles extends Pedido {
  detalles: DetallePedido[]
  usuario: User
}

export interface CreatePedidoRequest {
  direccionEnvio: DireccionEnvio
  metodoPago: MetodoPago
  notas?: string
  usarPuntos?: boolean
}

export interface PedidoFiltros {
  estado?: PedidoEstado
  fechaDesde?: Date
  fechaHasta?: Date
  page?: number
  limit?: number
}

export interface PedidoListResponse {
  pedidos: Pedido[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ==================== VALORACIONES ====================

export interface Valoracion {
  id: string
  productoId: string
  usuarioId: string
  pedidoId?: string | null
  puntuacion: number
  titulo?: string | null
  comentario?: string | null
  verificada: boolean
  fechaCreacion: Date
  producto: Producto
  usuario?: User
}

export interface CreateValoracionRequest {
  productoId: string
  pedidoId?: string
  puntuacion: number
  titulo?: string
  comentario?: string
}

export interface ValoracionResumen {
  media: number
  total: number
  distribucion: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}
