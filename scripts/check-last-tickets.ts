import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { fechaCreacion: 'desc' },
    take: 5,
    include: { usuario: true }
  })
  
  console.log('--- ÚLTIMOS 5 TICKETS ---')
  if (tickets.length === 0) {
      console.log('No hay tickets en la base de datos.')
  } else {
      tickets.forEach(t => {
        console.log(`[${t.numeroTicket}] ID: ${t.id} - Asunto: ${t.asunto} - Estado: ${t.estado} - Creado: ${t.fechaCreacion}`)
      })
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
