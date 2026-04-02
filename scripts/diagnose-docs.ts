import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking Document IDs...')
    const docs = await prisma.documento.findMany({
        select: {
            id: true,
            numeroDocumento: true,
            tipo: true
        }
    })

    console.log(`Total documents: ${docs.length}`)

    const suspectDocs = docs.filter(d => d.id === 'nuevo' || !d.id || d.id === 'undefined' || d.id === 'null')

    if (suspectDocs.length > 0) {
        console.warn('Found documents with suspicious IDs:', suspectDocs)
    } else {
        console.log('No suspicious IDs found.')
        console.log('First 5 documents:', docs.slice(0, 5))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
