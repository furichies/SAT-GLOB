import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.usuario.findMany({
    select: { id: true, nombre: true, email: true, rol: true, activo: true }
  })
  
  console.log('--- USUARIOS EN DB ---')
  users.forEach(u => {
    console.log(`ID: ${u.id} - Nombre: ${u.nombre} - Email: ${u.email} - Rol: ${u.rol} - Activo: ${u.activo}`)
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
