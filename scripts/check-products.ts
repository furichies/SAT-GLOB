
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const count = await prisma.producto.count()
        console.log(`Total active products: ${count}`)

        if (count === 0) {
            console.log("No products found in database.")
        } else {
            const first = await prisma.producto.findFirst()
            console.log("First product sample:", first)
        }

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
