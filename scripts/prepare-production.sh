#!/bin/bash

# Script para preparar el build de producción
# Este script debe ejecutarse DESPUÉS de 'bun run build'

set -e

echo "🚀 Preparando build de producción..."

# Verificar que existe el directorio standalone
if [ ! -d ".next/standalone" ]; then
  echo "❌ Error: No se encuentra .next/standalone"
  echo "   Ejecuta primero: bun run build"
  exit 1
fi

# Leer NEXTAUTH_SECRET del .env raíz si existe
if [ -f ".env" ]; then
  echo "🔐 Usando NEXTAUTH_SECRET del .env raíz..."
  NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" .env | cut -d '=' -f2 | tr -d '"')
  
  if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "⚠️  No se encontró NEXTAUTH_SECRET en .env, generando uno nuevo..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
  fi
else
  echo "🔐 Generando NEXTAUTH_SECRET seguro..."
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
fi

# Obtener ruta absoluta del directorio standalone
STANDALONE_DIR="$(cd .next/standalone && pwd)"
DB_PATH="${STANDALONE_DIR}/prisma/prod.db"

# Crear .env para producción en standalone
echo "📝 Creando .env de producción..."
cat > .next/standalone/.env << EOF
# Database (ruta absoluta para evitar problemas de resolución)
DATABASE_URL="file:${DB_PATH}"

# NextAuth
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
# Cambia esto por tu dominio real en producción
NEXTAUTH_URL="https://tudominio.com"

# Node Environment
NODE_ENV="production"
EOF

echo "✅ Archivo .env creado en .next/standalone/"

# Copiar la base de datos si existe, o crear directorio
mkdir -p .next/standalone/prisma
if [ -f "prisma/prod.db" ]; then
  echo "📦 Copiando base de datos existente (prod.db)..."
  cp prisma/prod.db .next/standalone/prisma/prod.db
elif [ -f "prisma/dev.db" ]; then
  echo "📦 Copiando base de datos inicial (dev.db -> prod.db)..."
  cp prisma/dev.db .next/standalone/prisma/prod.db
else
  echo "⚠️  No se encontró base de datos para copiar."
fi

# Copiar schema.prisma
echo "📋 Copiando schema.prisma..."
cp prisma/schema.prisma .next/standalone/prisma/schema.prisma

# Verificar permisos de la base de datos
echo "🔧 Verificando permisos..."
if [ -f ".next/standalone/prisma/prod.db" ]; then
  chmod 664 .next/standalone/prisma/prod.db
fi

echo ""
echo "✨ ¡Preparación completada!"
echo ""
echo "📌 NEXTAUTH_SECRET generado:"
echo "   ${NEXTAUTH_SECRET}"
echo ""
echo "🚀 Para ejecutar en producción:"
echo "   ./scripts/start-production.sh"
echo ""
echo "⚠️  IMPORTANTE: Guarda el NEXTAUTH_SECRET en un lugar seguro"
echo "   Si lo pierdes, todas las sesiones actuales serán invalidadas"
echo ""
