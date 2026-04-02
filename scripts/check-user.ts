import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userId = 'cmkbqbsmb0000jcg3sbywh6zu'
  console.log('Checking user:', userId)
  const user = await prisma.usuario.findUnique({
    where: { id: userId }
  })
  console.log('User found:', user)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
