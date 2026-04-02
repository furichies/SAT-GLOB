#!/bin/bash

# Script para iniciar el servidor de producción
# Uso: ./scripts/start-production.sh

set -e

echo "🚀 Iniciando servidor de producción SAT1475..."

# Verificar que existe el build
if [ ! -d ".next/standalone" ]; then
  echo "❌ Error: No se encuentra el build de producción"
  echo ""
  echo "Ejecuta primero:"
  echo "  1. bun run build"
  echo "  2. ./scripts/prepare-production.sh"
  exit 1
fi

# Verificar que existe el .env
if [ ! -f ".next/standalone/.env" ]; then
  echo "❌ Error: No se encuentra .env en .next/standalone/"
  echo ""
  echo "Ejecuta primero:"
  echo "  ./scripts/prepare-production.sh"
  exit 1
fi



echo "✅ Verificaciones completadas"
echo ""
echo "📍 Directorio: .next/standalone"
echo "🌐 URL: http://localhost:3000"
echo ""
echo "Para detener el servidor: Ctrl+C"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Usar ruta absoluta para la base de datos
# Prioridad 1: Base de datos en raíz del proyecto (Persistente)
# En producción usamos prod.db
DB_NAME="prod.db"
DB_PATH="$(pwd)/../../prisma/${DB_NAME}"

# Prioridad 2: Fallback si ejecutamos desde root
if [ ! -f "$DB_PATH" ]; then
    DB_PATH="$(pwd)/prisma/${DB_NAME}"
fi

# Prioridad 3: Fallback a dev.db si no existe prod.db (para facilitar transición)
if [ ! -f "$DB_PATH" ]; then
    echo "⚠️  No se encontró ${DB_NAME}, buscando dev.db..."
    DB_PATH="$(pwd)/../../prisma/dev.db"
    if [ ! -f "$DB_PATH" ]; then
        DB_PATH="$(pwd)/prisma/dev.db"
    fi
fi

# Prioridad 4: Base de datos empaquetada en standalone (No persistente entre builds)
if [ ! -f "$DB_PATH" ]; then
    echo "⚠️  No se encontró base de datos persistente en la raíz."
    echo "   Buscando en desplegable standalone..."
    
    # Check relative to standalone dir
    if [ -f "prisma/${DB_NAME}" ]; then
       DB_PATH="$(pwd)/.next/standalone/prisma/${DB_NAME}"
    elif [ -f "prisma/dev.db" ]; then
       DB_PATH="$(pwd)/.next/standalone/prisma/dev.db"
    fi
fi

if [ ! -f "$DB_PATH" ]; then
     echo "❌ Error CRÍTICO: No se puede encontrar el archivo de base de datos en ninguna ubicación estándar."
     echo "   Ubicaciones verificadas incluyen: prisma/prod.db, prisma/dev.db"
     exit 1
fi

echo "🗄️  Usando base de datos: $DB_PATH"

# Cambiar al directorio standalone e iniciar
cd .next/standalone
DATABASE_URL="file:${DB_PATH}" NODE_ENV=production node server.js
