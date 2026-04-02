import { PrismaClient, ConocimientoTipo, ProductoTipo, TicketTipo, TicketPrioridad, TicketEstado, SeguimientoTipo } from '@prisma/client'
import { productosSeed, usuariosSeed, pedidosSeed, ticketsSeed, articulosSeed } from '../src/lib/seed-data'


const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando datos de productos y categorías...')

  // Crear categorías
  const categorias = [
    {
      nombre: 'Ordenadores',
      descripcion: 'Ordenadores de sobremesa y portátiles de alta gama',
      imagenUrl: '/images/categoria_ordenadores.png',
      orden: 1,
      activa: true
    },
    {
      nombre: 'Componentes',
      descripcion: 'Componentes informáticos: procesadores, tarjetas gráficas, RAM, almacenamiento',
      imagenUrl: '/images/categoria_componentes.png',
      orden: 2,
      activa: true
    },
    {
      nombre: 'Almacenamiento',
      descripcion: 'Discos duros, SSDs y unidades de almacenamiento',
      imagenUrl: '/images/categoria_almacenamiento.png',
      orden: 3,
      activa: true
    },
    {
      nombre: 'Memoria RAM',
      descripcion: 'Memoria RAM para todas las necesidades',
      imagenUrl: '/images/categoria_ram.png',
      orden: 4,
      activa: true
    },
    {
      nombre: 'Periféricos',
      descripcion: 'Teclados, ratones, monitores, auriculares y más',
      imagenUrl: '/images/categoria_perifericos.png',
      orden: 5,
      activa: true
    },
    {
      nombre: 'Audio',
      descripcion: 'Auriculares, altavoces y sistemas de audio',
      imagenUrl: '/images/categoria_audio.png',
      orden: 6,
      activa: true
    }
  ]

  console.log('📁 Creando/Actualizando categorías...')
  for (const categoria of categorias) {
    const existing = await prisma.categoria.findFirst({
      where: { nombre: categoria.nombre }
    })

    if (existing) {
      await prisma.categoria.update({
        where: { id: existing.id },
        data: categoria
      })
    } else {
      await prisma.categoria.create({
        data: categoria
      })
    }
  }
  console.log(`✅ ${categorias.length} categorías procesadas`)

  // Crear productos desde datos compartidos
  const productos = productosSeed.map(p => {
    // Inferir tipo de producto basado en categoría
    let tipo: ProductoTipo = ProductoTipo.componente
    const cat = p.categoria.toLowerCase()

    if (cat === 'ordenadores') tipo = ProductoTipo.equipo_completo
    else if (cat === 'perifericos' || cat === 'audio') tipo = ProductoTipo.periferico
    else if (cat === 'software') tipo = ProductoTipo.software
    else if (cat === 'accesorios') tipo = ProductoTipo.accesorio

    return {
      sku: p.sku,
      nombre: p.nombre,
      descripcion: p.descripcionLarga || p.descripcionCorta || '',
      descripcionCorta: p.descripcionCorta,
      precio: p.precio,
      precioOferta: p.precioOferta,
      stock: p.stock,
      stockMinimo: p.stockMinimo,
      marca: p.marca || 'Genérico',
      modelo: p.modelo || 'Genérico',
      tipo: tipo,
      especificaciones: JSON.stringify({}), // Datos simplificados desde api/seed_data
      imagenes: JSON.stringify(p.imagenes || [p.imagen]),
      peso: 1, // Valor por defecto
      dimensiones: '10x10x10 cm', // Valor por defecto
      garantiaMeses: 24,
      activo: p.estado === 'activo',
      destacado: p.destacado || false,
      categoriaNombre: p.categoria // Guardamos para usar en el mapeo posterior
    }
  })

  console.log('📦 Creando productos...')

  // Asociar productos con categorías
  const categoriaOrdenadores = await prisma.categoria.findFirst({
    where: { nombre: 'Ordenadores' }
  })
  const categoriaComponentes = await prisma.categoria.findFirst({
    where: { nombre: 'Componentes' }
  })
  const categoriaAlmacenamiento = await prisma.categoria.findFirst({
    where: { nombre: 'Almacenamiento' }
  })
  const categoriaRam = await prisma.categoria.findFirst({
    where: { nombre: 'Memoria RAM' }
  })
  const categoriaPerifericos = await prisma.categoria.findFirst({
    where: { nombre: 'Periféricos' }
  })
  const categoriaAudio = await prisma.categoria.findFirst({
    where: { nombre: 'Audio' }
  })

  for (const producto of productos) {
    let categoriaId: string | null = null

    // Asignar categoría según el tipo o nombre
    if (producto.categoriaNombre) {
      const catMap: Record<string, string | null> = {
        'ordenadores': categoriaOrdenadores?.id || null,
        'componentes': categoriaComponentes?.id || null,
        'almacenamiento': categoriaAlmacenamiento?.id || null,
        'ram': categoriaRam?.id || null,
        'perifericos': categoriaPerifericos?.id || null,
        'audio': categoriaAudio?.id || null
      }
      categoriaId = catMap[producto.categoriaNombre.toLowerCase()] || null
    }

    if (!categoriaId) {
      // Fallback lógica anterior si no hay match directo
      if (producto.tipo === ProductoTipo.equipo_completo) {
        categoriaId = categoriaOrdenadores?.id || null
      } else if (producto.tipo === ProductoTipo.componente) {
        if (producto.modelo.includes('SSD') || producto.modelo.includes('HDD')) {
          categoriaId = categoriaAlmacenamiento?.id || null
        } else if (producto.modelo.includes('RAM') || producto.modelo.includes('CPU') || producto.modelo.includes('GPU')) {
          categoriaId = categoriaComponentes?.id || null
        } else {
          categoriaId = categoriaComponentes?.id || null
        }
      } else if (producto.tipo === ProductoTipo.periferico) {
        if (producto.modelo.includes('Sennheiser')) {
          categoriaId = categoriaAudio?.id || null
        } else {
          categoriaId = categoriaPerifericos?.id || null
        }
      }
    }

    // Limpiamos propiedad temporal no existente en Schema
    const { categoriaNombre, ...productoData } = producto

    await prisma.producto.upsert({
      where: { sku: productoData.sku },
      update: {
        ...productoData,
        categoriaId
      },
      create: {
        ...productoData,
        categoriaId
      }
    })
  }

  console.log(`✅ ${productos.length} productos procesados`)

  // Obtener productos creados para valoraciones
  const productosCreados = await prisma.producto.findMany({
    where: { sku: { in: productos.slice(0, 3).map(p => p.sku) } }
  })

  // Crear algunas valoraciones de ejemplo
  console.log('⭐ Creando valoraciones de ejemplo...')

  // Crear usuarios desde datos compartidos
  const passwordHash = '$2b$12$LQv3c1yqBHqZK6zW3YJ7w5jOz0QIwYj4z7M0w1xY' // demo123 (hash válido)

  const usuariosProcesados = usuariosSeed.map(u => ({
    id: u.id,
    email: u.email,
    passwordHash: passwordHash, // Sobreescribimos con hash válido para poder hacer login
    nombre: u.nombre,
    apellidos: u.apellidos,
    telefono: u.telefono,
    direccion: u.direccion,
    codigoPostal: '28001', // Valor por defecto
    ciudad: 'Madrid', // Valor por defecto
    provincia: 'Madrid', // Valor por defecto
    rol: u.rol as any,
    activo: u.activo
  }))

  for (const usuario of usuariosProcesados) {
    const userExists = await prisma.usuario.findUnique({ where: { email: usuario.email } })
    let userId = usuario.id

    if (userExists) {
      // Actualizar si existe para asegurar sincronización
      const updated = await prisma.usuario.update({
        where: { email: usuario.email },
        data: usuario
      })
      userId = updated.id
    } else {
      const created = await prisma.usuario.create({
        data: usuario
      })
      userId = created.id
    }

    // Si es técnico, crear o actualizar perfil de técnico
    if (usuario.rol === 'tecnico') {
      const originalData = usuariosSeed.find(u => u.email === usuario.email) as any
      if (originalData) {
        // Mapear nivel de experiencia string a enum si es necesario
        // En schema.prisma: TecnicoNivel { junior, senior, experto }
        // En seed-data.ts: nivel: 'experto' | 'senior' | 'junior'
        const nivelMap: any = {
          'experto': 'experto',
          'senior': 'senior',
          'junior': 'junior'
        };
        const nivel = nivelMap[originalData.nivel] || 'junior';

        await prisma.tecnico.upsert({
          where: { usuarioId: userId },
          create: {
            usuarioId: userId,
            especialidades: JSON.stringify(originalData.especialidades || []),
            nivel: nivel,
            disponible: originalData.disponible ?? true,
            ticketsAsignados: originalData.ticketsAsignados || 0,
            ticketsResueltos: originalData.ticketsResueltos || 0,
            valoracionMedia: originalData.valoracionMedia || 0
          },
          update: {
            especialidades: JSON.stringify(originalData.especialidades || []),
            nivel: nivel, // Esto asegurará que se actualice si el seed data cambia
            disponible: originalData.disponible ?? true
          }
        })
      }
    }
  }
  console.log(`✅ ${usuariosProcesados.length} usuarios de demo creados/actualizados`)

  // --- PEDIDOS ---
  console.log('📦 Sembrando pedidos...')
  for (const pedido of pedidosSeed) {
    // Buscar usuario por email (ya que IDs pueden variar si se crearon frescos)
    const user = usuariosProcesados.find(u => u.email === pedido.clienteEmail)
    if (!user) {
      console.warn(`⚠️ Usuario no encontrado para pedido ${pedido.numeroPedido}: ${pedido.clienteEmail}`)
      continue
    }

    // Obtener ID real de base de datos
    const dbUser = await prisma.usuario.findUnique({ where: { email: user.email } })
    if (!dbUser) continue

    await prisma.pedido.upsert({
      where: { numeroPedido: pedido.numeroPedido },
      update: {}, // No actualizamos si ya existe para preservar estado
      create: {
        usuarioId: dbUser.id,
        numeroPedido: pedido.numeroPedido,
        estado: (pedido.estado === 'en_proceso' ? 'procesando' : pedido.estado) as any,
        total: pedido.total,
        subtotal: pedido.subtotal,
        iva: pedido.iva,
        direccionEnvio: pedido.direccion,
        metodoPago: pedido.metodoPago as any,
        fechaPedido: new Date(pedido.fecha),
        detalles: {
          create: await Promise.all(pedido.items.map(async (item) => {
            const prod = await prisma.producto.findFirst({ where: { sku: item.sku } })
            if (!prod) throw new Error(`Producto SKU ${item.sku} no encontrado para pedido`)
            return {
              productoId: prod.id,
              cantidad: item.cantidad,
              precioUnitario: item.precio,
              subtotal: item.subtotal
            }
          }))
        }
      }
    })

    // Intentar conectar items con productos reales buscando por SKU (seed data tiene SKU en items?)
    // En seed-data.ts items tiene 'sku'.
    // const dbPedido = await prisma.pedido.findUnique({where: {numeroPedido: pedido.numeroPedido}, include: {items: true}})
    // ... lógica adicional si fuera necesaria, por ahora create anidado es suficiente.
  }
  console.log(`✅ ${pedidosSeed.length} pedidos procesados`)

  // --- TICKETS ---
  console.log('🎫 Sembrando tickets...')
  for (const ticket of ticketsSeed) {
    // Buscar usuario cliente
    const clienteData = usuariosSeed.find(u => u.id === ticket.clienteId)
    const clienteEmail = clienteData?.email
    const dbCliente = clienteEmail ? await prisma.usuario.findUnique({ where: { email: clienteEmail } }) : null

    if (!dbCliente) {
      console.warn(`⚠️ Cliente no encontrado para ticket ${ticket.numeroTicket}`)
      continue
    }

    // Buscar técnico si está asignado
    let dbTecnicoId: string | null = null
    if (ticket.tecnicoId) {
      const tecnicoData = usuariosSeed.find(u => u.id === ticket.tecnicoId)
      const tecnicoEmail = tecnicoData?.email
      if (tecnicoEmail) {
        const dbTecnicoUser = await prisma.usuario.findUnique({ where: { email: tecnicoEmail } })
        if (dbTecnicoUser) {
          const dbTecnico = await prisma.tecnico.findUnique({ where: { usuarioId: dbTecnicoUser.id } })
          dbTecnicoId = dbTecnico?.id || null
        }
      }
    }

    await prisma.ticket.upsert({
      where: { numeroTicket: ticket.numeroTicket },
      update: {
        tecnicoId: dbTecnicoId, // Actualizar asignación
      },
      create: {
        numeroTicket: ticket.numeroTicket,
        usuarioId: dbCliente.id,
        tecnicoId: dbTecnicoId || undefined,
        tipo: ticket.tipo as any,
        prioridad: ticket.prioridad as any,
        estado: (ticket.estado === 'pendiente' ? 'abierto' : ticket.estado) as any,
        asunto: ticket.asunto,
        descripcion: ticket.descripcion,
        fechaCreacion: new Date(ticket.fechaCreacion),
        // Insertar seguimientos
        seguimientos: {
          create: ticket.seguimientos?.map((seg: any) => ({
            usuario: { connect: { id: dbCliente.id } },
            tipo: (['comentario', 'cambio_estado', 'asignacion', 'nota_interna', 'adjunto'].includes(seg.tipo) ? seg.tipo : 'comentario') as SeguimientoTipo,
            contenido: seg.contenido,
            esInterno: seg.esInterno || false,
            fechaCreacion: new Date(seg.fechaCreacion)
          }))
        }
      }
    })
  }
  console.log(`✅ ${ticketsSeed.length} tickets procesados`)

  // --- BASE DE CONOCIMIENTO ---
  console.log('📚 Sembrando base de conocimiento...')
  for (const articulo of articulosSeed) {
    // Buscar autor
    const autorData = usuariosSeed.find(u => u.id === articulo.autorId)
    const autorEmail = autorData?.email
    const dbAutor = autorEmail ? await prisma.usuario.findUnique({ where: { email: autorEmail } }) : null

    if (!dbAutor) continue

    await prisma.baseConocimiento.upsert({
      where: { id: articulo.id },
      update: {
        titulo: articulo.titulo,
        contenido: articulo.contenido,
        categoria: articulo.categoria,
        etiquetas: JSON.stringify(articulo.tags),
        tipo: 'manual' as ConocimientoTipo,
      },
      create: {
        id: articulo.id,
        titulo: articulo.titulo,
        contenido: articulo.contenido,
        categoria: articulo.categoria,
        etiquetas: JSON.stringify(articulo.tags),
        tipo: 'manual' as ConocimientoTipo,
        autorId: dbAutor.id,
        vistas: articulo.vistas,
        utilSi: articulo.likes,
        // El schema tiene default now() para fechaCreacion
      }
    })
  }
  console.log(`✅ ${articulosSeed.length} artículos procesados`)

  for (const producto of productosCreados) {
    const valoraciones = [
      {
        usuarioId: usuariosProcesados[0].id,
        puntuacion: 5,
        titulo: '¡Excelente producto!',
        comentario: 'He estado usando este producto durante 3 meses y el rendimiento es increíble. Los juegos corren fluidos en Ultra settings y la pantalla QHD es espectacular.',
        verificada: true
      },
      {
        usuarioId: usuariosProcesados[1].id,
        puntuacion: 5,
        titulo: 'Mejor compra del año',
        comentario: 'Increíble relación calidad-precio. El RGB de la tecla y el sistema de refrigeración funcionan perfectamente. Totalmente recomendado.',
        verificada: true
      }
    ]

    for (const valoracion of valoraciones) {
      await prisma.valoracion.create({
        data: {
          ...valoracion,
          productoId: producto.id
        }
      })
    }
  }

  console.log(`✅ ${productosCreados.length * 2} valoraciones creadas`)
  console.log('✅ Seed de productos completado!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
