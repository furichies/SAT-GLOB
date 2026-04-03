# Microinfo - Tienda de Informática y Servicio Técnico

Aplicación web completa para la gestión de una tienda de informática con servicio técnico integrado (SAT). Desarrollada con **Next.js 15**, **TypeScript**, **TailwindCSS** y **Supabase** (PostgreSQL + Storage).

## 🌐 Acceso a la aplicación

- **Producción:** https://sat-glob-ogea.vercel.app
- **Stack:** Next.js 15 + Supabase + Vercel

## 🚀 Despliegue

### Vercel (Frontend + API Routes)

1. **Repositorio:** El proyecto se conecta a GitHub (rama `main`)
2. **Importación:** Se importó el repositorio desde el dashboard de Vercel
3. **Variables de entorno:** Configuradas en *Settings → Environment Variables*:
   - `DATABASE_URL` → Connection pooler de Supabase (puerto 6543)
   - `NEXTAUTH_SECRET` → Secreto JWT generado con `openssl rand -hex 32`
   - `NEXTAUTH_URL` → URL de producción en Vercel
   - `NEXT_PUBLIC_SUPABASE_URL` → URL del proyecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Clave pública de Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` → Clave de servicio para operaciones admin
4. **Build:** `npm run build` (Next.js App Router, serverless functions)
5. **Deploy automático:** Cada push a `main` genera un nuevo despliegue

### Supabase (Base de datos + Storage)

1. **Proyecto:** Creado en el dashboard de Supabase (región EU-North-1)
2. **Base de datos:** PostgreSQL. Esquema generado desde Prisma schema (12 tablas, 10 enums, 40+ índices, 20+ foreign keys)
3. **Migración:** SQL generado con `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` y ejecutado en el SQL Editor de Supabase
4. **Seed de datos:** Ejecutado con `npx tsx scripts/seed-productos.ts` (20 productos, 6 categorías, 11 usuarios, 5 pedidos, 2 tickets, 6 artículos de conocimiento)
5. **Storage:** 3 buckets creados vía API:
   - `products` (público) → Imágenes de productos
   - `tickets` (privado) → Adjuntos de tickets SAT
   - `evidencias` (privado) → Fotos de evidencia de reparaciones

## 👥 Acceso por roles

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super Admin | superadmin@microinfo.es | super123 |
| Admin | admin@microinfo.es | super123 |
| Técnico | carlos.garcia@microinfo.es | super123 |
| Cliente | juan.perez@email.com | (registrarse) |

## 📁 Estructura del proyecto

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── admin/        # Panel de administración
│   │   ├── api/          # API Routes (serverless)
│   │   ├── auth/         # Login / Registro
│   │   ├── tienda/       # Catálogo de productos
│   │   ├── sat/          # Servicio técnico
│   │   └── ...
│   ├── components/       # Componentes React
│   ├── hooks/            # Hooks personalizados
│   ├── lib/              # Utilidades (db, auth, supabase-storage, pdf-generator)
│   └── middleware.ts     # Protección de rutas
├── prisma/
│   └── schema.prisma     # Esquema de base de datos
├── scripts/              # Scripts de seed
└── docs/                 # Documentación técnica
```

## 🛠️ Tecnologías

- **Framework:** Next.js 15.3 (App Router, Server Components)
- **Autenticación:** NextAuth.js v4 (JWT, credentials)
- **Base de datos:** PostgreSQL (Supabase) + Prisma ORM
- **Storage:** Supabase Storage (buckets para archivos)
- **UI:** React 19 + TailwindCSS 4 + shadcn/ui
- **PDF:** jsPDF + jsPDF-autotable
- **Imágenes:** Sharp (procesamiento server-side)
- **Deploy:** Vercel (serverless functions)

## 📋 Funcionalidades

- **Tienda online:** Catálogo, carrito, pedidos, valoraciones
- **SAT (Servicio Técnico):** Tickets, seguimientos, órdenes de intervención
- **Documentación:** Facturas, albaranes, presupuestos, informes de reparación
- **Panel admin:** Dashboard, gestión de productos/pedidos/clientes/técnicos
- **Base de conocimiento:** Artículos de soporte técnico

## 🔐 Seguridad

- Contraseñas hasheadas con bcryptjs
- Autenticación JWT con NextAuth
- Rutas protegidas por middleware server-side
- Storage privado con URLs firmadas temporales
- Variables de entorno nunca expuestas en el repositorio
