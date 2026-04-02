#!/bin/bash

# Script para iniciar el servidor de producción con PM2 (Alta Disponibilidad)
# Uso: ./scripts/start-pm2.sh

set -e

echo "🚀 Iniciando servidor de producción SAT1475 con PM2..."

# Verificar que existe el build
if [ ! -d ".next/standalone" ]; then
  echo "❌ Error: No se encuentra el build de producción"
  echo "Ejecuta primero: bun run build && ./scripts/prepare-production.sh"
  exit 1
fi

# Usar ruta absoluta para la base de datos
# En producción usamos prod.db por defecto
DB_NAME="prod.db"
DB_PATH="$(pwd)/../../prisma/${DB_NAME}"

# Fallback si ejecutamos desde root
if [ ! -f "$DB_PATH" ]; then
    DB_PATH="$(pwd)/prisma/${DB_NAME}"
fi

# Fallback a dev.db si no existe prod.db
if [ ! -f "$DB_PATH" ]; then
    DB_PATH="$(pwd)/../../prisma/dev.db"
    if [ ! -f "$DB_PATH" ]; then
        DB_PATH="$(pwd)/prisma/dev.db"
    fi
fi

if [ ! -f "$DB_PATH" ]; then
     echo "❌ Error CRÍTICO: No se puede encontrar el archivo de base de datos."
     exit 1
fi

echo "🗄️  Base de datos detectada en: $DB_PATH"

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 no está instalado globalmente."
    echo "Sugerencia: sudo npm install -g pm2"
    exit 1
fi

# Iniciar con PM2
# --update-env asegura que se recarguen las variables de entorno si el proceso ya existe
DATABASE_URL="file:${DB_PATH}" \
NODE_ENV=production \
PORT=3000 \
pm2 start .next/standalone/server.js \
    --name "sat1475-server" \
    --update-env \
    --wait-ready \
    --listen-timeout 10000

echo "✅ Proceso gestionado por PM2"
pm2 status "sat1475-server"
