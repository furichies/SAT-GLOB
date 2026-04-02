import { PrismaClient, UserRole, TecnicoNivel } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('--- SEEDING TECNICOS ---')

    const passwordHash = await hash('123456', 10)

    const tecnicos = [
        { nombre: 'Juan', apellidos: 'Técnico', email: 'juan@sat.com', rol: UserRole.tecnico },
        { nombre: 'Ana', apellidos: 'Experta', email: 'ana@sat.com', rol: UserRole.tecnico },
        { nombre: 'Pedro', apellidos: 'Reparaciones', email: 'pedro@sat.com', rol: UserRole.tecnico }
    ]

    for (const t of tecnicos) {
        const existe = await prisma.usuario.findUnique({
            where: { email: t.email }
        })

        if (!existe) {
            const user = await prisma.usuario.create({
                data: {
                    nombre: t.nombre,
                    apellidos: t.apellidos,
                    email: t.email,
                    rol: t.rol,
                    passwordHash,
                    activo: true
                }
            })
            console.log(`✅ Creado: ${t.nombre} (${t.email})`)

            // Crear perfil de Tecnico asociado
            await prisma.tecnico.create({
                data: {
                    usuarioId: user.id,
                    especialidades: 'Hardware, Laptops',
                    nivel: TecnicoNivel.senior,
                    disponible: true
                }
            })
        } else {
            console.log(`ℹ️ Ya existe: ${t.email}`)
            // Asegurar que el rol sea tecnico
            if (existe.rol !== UserRole.tecnico) {
                await prisma.usuario.update({
                    where: { id: existe.id },
                    data: { rol: UserRole.tecnico }
                })
                console.log(`  -> Rol corregido a 'tecnico'`)
            }
        }
    }

    console.log('--- SEED COMPLETADO ---')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
