-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "codigoPostal" TEXT,
    "ciudad" TEXT,
    "provincia" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'cliente',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoAcceso" DATETIME
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagenUrl" TEXT,
    "categoriaPadreId" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" DATETIME NOT NULL,
    CONSTRAINT "Categoria_categoriaPadreId_fkey" FOREIGN KEY ("categoriaPadreId") REFERENCES "Categoria" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "descripcionCorta" TEXT,
    "precio" REAL NOT NULL,
    "precioOferta" REAL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 5,
    "categoriaId" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "tipo" TEXT NOT NULL,
    "especificaciones" TEXT,
    "imagenes" TEXT,
    "peso" REAL,
    "dimensiones" TEXT,
    "garantiaMeses" INTEGER NOT NULL DEFAULT 24,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" DATETIME NOT NULL,
    CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroPedido" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "subtotal" REAL NOT NULL,
    "iva" REAL NOT NULL,
    "gastosEnvio" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "direccionEnvio" TEXT NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "referenciaPago" TEXT,
    "notas" TEXT,
    "fechaPedido" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEnvio" DATETIME,
    "fechaEntrega" DATETIME,
    CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetallePedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    "subtotal" REAL NOT NULL,
    "descripcion" TEXT,
    CONSTRAINT "DetallePedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetallePedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tecnico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "especialidades" TEXT,
    "nivel" TEXT NOT NULL DEFAULT 'junior',
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "ticketsAsignados" INTEGER NOT NULL DEFAULT 0,
    "ticketsResueltos" INTEGER NOT NULL DEFAULT 0,
    "valoracionMedia" REAL NOT NULL DEFAULT 0,
    "fechaIncorporacion" DATETIME,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tecnico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroTicket" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tecnicoId" TEXT,
    "pedidoId" TEXT,
    "productoId" TEXT,
    "tipo" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL DEFAULT 'media',
    "estado" TEXT NOT NULL DEFAULT 'abierto',
    "asunto" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "numeroSerieProducto" TEXT,
    "diagnostico" TEXT,
    "solucion" TEXT,
    "tiempoEstimado" INTEGER,
    "tiempoReal" INTEGER,
    "costeReparacion" REAL,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaAsignacion" DATETIME,
    "fechaResolucion" DATETIME,
    "fechaCierre" DATETIME,
    "satisfaccion" INTEGER,
    "resolucionId" TEXT,
    CONSTRAINT "Ticket_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Tecnico" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_resolucionId_fkey" FOREIGN KEY ("resolucionId") REFERENCES "BaseConocimiento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeguimientoTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "esInterno" BOOLEAN NOT NULL DEFAULT false,
    "adjuntos" TEXT,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SeguimientoTicket_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SeguimientoTicket_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BaseConocimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "categoria" TEXT,
    "etiquetas" TEXT,
    "tipo" TEXT NOT NULL,
    "productoRelacionadoId" TEXT,
    "autorId" TEXT NOT NULL,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "utilSi" INTEGER NOT NULL DEFAULT 0,
    "utilNo" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" DATETIME NOT NULL,
    CONSTRAINT "BaseConocimiento_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BaseConocimiento_productoRelacionadoId_fkey" FOREIGN KEY ("productoRelacionadoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "entidadTipo" TEXT NOT NULL,
    "ticketId" TEXT,
    "pedidoId" TEXT,
    "productoId" TEXT,
    "usuarioGeneradorId" TEXT NOT NULL,
    "contenido" TEXT,
    "rutaArchivo" TEXT,
    "fechaGeneracion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadatos" TEXT,
    "estadoDocumento" TEXT NOT NULL DEFAULT 'borrador',
    "firmaCliente" TEXT,
    "firmaTecnico" TEXT,
    "evidenciasFotos" TEXT,
    "fechaVencimiento" DATETIME,
    "fechaFirma" DATETIME,
    "fechaEnvio" DATETIME,
    "documentoRelacionadoId" TEXT,
    CONSTRAINT "Documento_documentoRelacionadoId_fkey" FOREIGN KEY ("documentoRelacionadoId") REFERENCES "Documento" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Documento_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Documento_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Documento_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Documento_usuarioGeneradorId_fkey" FOREIGN KEY ("usuarioGeneradorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Carrito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT,
    "sessionId" TEXT,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "fechaAgregado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Carrito_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Carrito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Valoracion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "pedidoId" TEXT,
    "puntuacion" INTEGER NOT NULL,
    "titulo" TEXT,
    "comentario" TEXT,
    "verificada" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Valoracion_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Valoracion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Valoracion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");

-- CreateIndex
CREATE INDEX "Usuario_activo_idx" ON "Usuario"("activo");

-- CreateIndex
CREATE INDEX "Categoria_categoriaPadreId_idx" ON "Categoria"("categoriaPadreId");

-- CreateIndex
CREATE INDEX "Categoria_activa_idx" ON "Categoria"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_sku_key" ON "Producto"("sku");

-- CreateIndex
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");

-- CreateIndex
CREATE INDEX "Producto_tipo_idx" ON "Producto"("tipo");

-- CreateIndex
CREATE INDEX "Producto_activo_idx" ON "Producto"("activo");

-- CreateIndex
CREATE INDEX "Producto_destacado_idx" ON "Producto"("destacado");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numeroPedido_key" ON "Pedido"("numeroPedido");

-- CreateIndex
CREATE INDEX "Pedido_usuarioId_idx" ON "Pedido"("usuarioId");

-- CreateIndex
CREATE INDEX "Pedido_estado_idx" ON "Pedido"("estado");

-- CreateIndex
CREATE INDEX "Pedido_numeroPedido_idx" ON "Pedido"("numeroPedido");

-- CreateIndex
CREATE INDEX "DetallePedido_pedidoId_idx" ON "DetallePedido"("pedidoId");

-- CreateIndex
CREATE INDEX "DetallePedido_productoId_idx" ON "DetallePedido"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "Tecnico_usuarioId_key" ON "Tecnico"("usuarioId");

-- CreateIndex
CREATE INDEX "Tecnico_usuarioId_idx" ON "Tecnico"("usuarioId");

-- CreateIndex
CREATE INDEX "Tecnico_disponible_idx" ON "Tecnico"("disponible");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_numeroTicket_key" ON "Ticket"("numeroTicket");

-- CreateIndex
CREATE INDEX "Ticket_usuarioId_idx" ON "Ticket"("usuarioId");

-- CreateIndex
CREATE INDEX "Ticket_tecnicoId_idx" ON "Ticket"("tecnicoId");

-- CreateIndex
CREATE INDEX "Ticket_resolucionId_idx" ON "Ticket"("resolucionId");

-- CreateIndex
CREATE INDEX "Ticket_estado_idx" ON "Ticket"("estado");

-- CreateIndex
CREATE INDEX "Ticket_prioridad_idx" ON "Ticket"("prioridad");

-- CreateIndex
CREATE INDEX "Ticket_numeroTicket_idx" ON "Ticket"("numeroTicket");

-- CreateIndex
CREATE INDEX "SeguimientoTicket_ticketId_idx" ON "SeguimientoTicket"("ticketId");

-- CreateIndex
CREATE INDEX "BaseConocimiento_categoria_idx" ON "BaseConocimiento"("categoria");

-- CreateIndex
CREATE INDEX "BaseConocimiento_tipo_idx" ON "BaseConocimiento"("tipo");

-- CreateIndex
CREATE INDEX "BaseConocimiento_activo_idx" ON "BaseConocimiento"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "Documento_numeroDocumento_key" ON "Documento"("numeroDocumento");

-- CreateIndex
CREATE INDEX "Documento_ticketId_idx" ON "Documento"("ticketId");

-- CreateIndex
CREATE INDEX "Documento_pedidoId_idx" ON "Documento"("pedidoId");

-- CreateIndex
CREATE INDEX "Documento_productoId_idx" ON "Documento"("productoId");

-- CreateIndex
CREATE INDEX "Documento_tipo_idx" ON "Documento"("tipo");

-- CreateIndex
CREATE INDEX "Documento_estadoDocumento_idx" ON "Documento"("estadoDocumento");

-- CreateIndex
CREATE INDEX "Documento_documentoRelacionadoId_idx" ON "Documento"("documentoRelacionadoId");

-- CreateIndex
CREATE INDEX "Carrito_usuarioId_idx" ON "Carrito"("usuarioId");

-- CreateIndex
CREATE INDEX "Carrito_sessionId_idx" ON "Carrito"("sessionId");

-- CreateIndex
CREATE INDEX "Carrito_productoId_idx" ON "Carrito"("productoId");

-- CreateIndex
CREATE INDEX "Valoracion_productoId_idx" ON "Valoracion"("productoId");

-- CreateIndex
CREATE INDEX "Valoracion_usuarioId_idx" ON "Valoracion"("usuarioId");

-- CreateIndex
CREATE INDEX "Valoracion_pedidoId_idx" ON "Valoracion"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "Valoracion_productoId_usuarioId_pedidoId_key" ON "Valoracion"("productoId", "usuarioId", "pedidoId");
