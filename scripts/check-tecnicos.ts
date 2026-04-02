
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTecnicos() {
    try {
        const tecnicos = await prisma.tecnico.findMany({
            select: {
                id: true,
                especialidades: true,
                usuario: {
                    select: { nombre: true }
                }
            }
        })

        console.log('--- Técnicos encontrados ---')
        for (const t of tecnicos) {
            console.log(`Técnico: ${t.usuario.nombre}, ID: ${t.id}`)
            console.log(`Especialidades (raw): ${t.especialidades}`)
            try {
                if (t.especialidades) {
                    const parsed = JSON.parse(t.especialidades)
                    console.log(`Especialidades (parsed):`, parsed)
                } else {
                    console.log('Especialidades is null/empty')
                }
            } catch (e: any) {
                console.error(`ERROR PARSING JSON: ${e.message}`)
            }
            console.log('------------------------------')
        }
    } catch (error) {
        console.error('Error querying database:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkTecnicos()
