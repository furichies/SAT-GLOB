import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const docs = await prisma.documento.findMany({
    orderBy: { fechaGeneracion: 'desc' },
    take: 5
  })
  
  console.log('--- ÚLTIMOS 5 DOCUMENTOS ---')
  if (docs.length === 0) {
      console.log('No hay documentos.')
  } else {
      docs.forEach(d => {
        console.log(`[${d.numeroDocumento}] Tipo: ${d.tipo} - ID: ${d.id} - TicketId: ${d.ticketId}`)
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
