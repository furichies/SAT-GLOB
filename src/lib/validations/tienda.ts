import { z } from 'zod'
import { ProductoTipo, PedidoEstado, MetodoPago } from '@/types/enums'

export const createCategoriaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  imagenUrl: z.string().url('URL inválida').optional(),
  categoriaPadreId: z.string().optional(),
  orden: z.number().int().min(0).default(0),
  activa: z.boolean().default(true)
})

export const updateCategoriaSchema = createCategoriaSchema.partial()

export const createProductoSchema = z.object({
  sku: z.string().min(1, 'SKU es requerido'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  descripcionCorta: z.string().max(500, 'Máximo 500 caracteres').optional(),
  precio: z.number().positive('El precio debe ser positivo'),
  precioOferta: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  stockMinimo: z.number().int().min(0).default(5),
  categoriaId: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  tipo: z.nativeEnum(ProductoTipo),
  especificaciones: z.string().optional(),
  imagenes: z.string().optional(),
  peso: z.number().positive().optional(),
  dimensiones: z.string().optional(),
  garantiaMeses: z.number().int().min(0).default(24),
  activo: z.boolean().default(true),
  destacado: z.boolean().default(false)
})

export const updateProductoSchema = createProductoSchema.partial()

export const addCarritoSchema = z.object({
  productoId: z.string().min(1, 'Producto ID es requerido'),
  cantidad: z.number().int().min(1, 'Cantidad mínima es 1').max(99, 'Cantidad máxima es 99'),
  sessionId: z.string().optional()
})

export const updateCarritoSchema = z.object({
  cantidad: z.number().int().min(1, 'Cantidad mínima es 1').max(99, 'Cantidad máxima es 99')
})

export const direccionEnvioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  codigoPostal: z.string().regex(/^\d{4,5}$/, 'Código postal inválido'),
  ciudad: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  provincia: z.string().min(2, 'La provincia debe tener al menos 2 caracteres'),
  telefono: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Teléfono inválido')
})

export const createPedidoSchema = z.object({
  direccionEnvio: direccionEnvioSchema,
  metodoPago: z.nativeEnum(MetodoPago),
  notas: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  usarPuntos: z.boolean().default(false)
})

export const updatePedidoSchema = z.object({
  estado: z.nativeEnum(PedidoEstado).optional(),
  notas: z.string().max(1000).optional(),
  fechaEnvio: z.date().optional(),
  fechaEntrega: z.date().optional()
})

export const createValoracionSchema = z.object({
  productoId: z.string().min(1, 'Producto ID es requerido'),
  pedidoId: z.string().optional(),
  puntuacion: z.number().int().min(1).max(5),
  titulo: z.string().min(2, 'El título debe tener al menos 2 caracteres').optional(),
  comentario: z.string().max(2000, 'Máximo 2000 caracteres').optional()
})

export const productoFiltrosSchema = z.object({
  categoriaId: z.string().optional(),
  tipo: z.nativeEnum(ProductoTipo).optional(),
  marca: z.string().optional(),
  precioMin: z.number().positive().optional(),
  precioMax: z.number().positive().optional(),
  enStock: z.boolean().optional(),
  enOferta: z.boolean().optional(),
  destacado: z.boolean().optional(),
  busqueda: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['precio', 'nombre', 'valoracion', 'novedad']).default('novedad'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const pedidoFiltrosSchema = z.object({
  estado: z.nativeEnum(PedidoEstado).optional(),
  fechaDesde: z.date().optional(),
  fechaHasta: z.date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
})
