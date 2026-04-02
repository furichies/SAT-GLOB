import { PrismaClient, TecnicoNivel, UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'

const db = new PrismaClient()

const tecnicosRaw = [
    "BEMBIBRE GONZALEZ, DAVID",
    "BERMEJO ORDORICA, JULIO",
    "BRAÑUELAS CASTELLANO, PABLO",
    "BUCARITO VÁSQUEZ, JAHIR",
    "DOMINGO PLATERO, JOSÉ IGNACIO",
    "ESCALERAS BARRAGAN, LILIA",
    "GRADILLAS PEÑA, CARLA",
    "GUZMÁN GONZÁLEZ, GONZALO",
    "HERNÁNDEZ GARCÍA, JULÍAN",
    "LARA REMARTINEZ, MIGUEL",
    "MARTÍN MARTÍN , IVÁN",
    "MARTÍNEZ BOZA, ANDRÉS",
    "OLMOS FERNÁNDEZ, JOSÉ RICARDO",
    "ROMERO SÁNCHEZ, DANIEL",
    "TKACHUK KOLTSOVA, NELIA"
]

const NIVELES: TecnicoNivel[] = ['junior', 'senior', 'experto']

const ESPECIALIDADES_LIST = [
    'Hardware', 'Software', 'Redes', 'Seguridad', 'Servidores',
    'Recuperación de Datos', 'Cloud', 'Virtualización', 'Móviles', 'Impresoras'
]

function normalizeString(str: string) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

function generateEmail(nombreCompleto: string) {
    // Formato expects: "APELLIDO1 APELLIDO2, NOMBRE"
    const [apellidos, nombre] = nombreCompleto.split(',').map(s => s.trim())

    // Safety check in case split fails or structure is different
    if (!nombre) return `${normalizeString(apellidos.replace(/\s+/g, '.'))}@microinfo.es`

    const primerNombre = nombre.split(' ')[0]
    const primerApellido = apellidos.split(' ')[0]

    return `${normalizeString(primerNombre)}.${normalizeString(primerApellido)}@microinfo.es`
}

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomSpecialities() {
    // Pick 1 to 3 random specialities
    const num = Math.floor(Math.random() * 3) + 1
    const shuffled = [...ESPECIALIDADES_LIST].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, num)
}

function parseName(nombreCompleto: string) {
    const parts = nombreCompleto.split(',')

    let nombre = ""
    let apellidos = ""

    if (parts.length === 2) {
        apellidos = parts[0].trim()
        nombre = parts[1].trim()
    } else {
        // Fallback for names not in "SURNAME, NAME" format
        const words = nombreCompleto.split(' ')
        nombre = words.pop() || ""
        apellidos = words.join(' ')
    }

    // Capitalize properly
    const format = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

    // Handle composite names/surnames roughly
    const formattedNombre = nombre.split(' ').map(format).join(' ')
    const formattedApellidos = apellidos.split(' ').map(format).join(' ')

    return { nombre: formattedNombre, apellidos: formattedApellidos }
}

async function main() {
    console.log('🚀 Iniciando seed de técnicos...')

    // 0. Eliminar técnicos preexistentes (y sus usuarios asociados si son solo técnicos)
    console.log('🗑️  Eliminando técnicos existentes...')

    // Primero obtenemos los IDs de usuarios que son técnicos
    const usuariosTecnicos = await db.usuario.findMany({
        where: { rol: 'tecnico' },
        select: { id: true }
    })

    const ids = usuariosTecnicos.map(u => u.id)

    if (ids.length > 0) {
        console.log(`🔍 Encontrados ${ids.length} técnicos para limpiar. Procesando dependencias...`)

        // 1. Desasignar tickets asignados a estos técnicos
        // Necesitamos encontrar los IDs de tabla Tecnico correspondientes a estos usuarios
        const tecnicosRecords = await db.tecnico.findMany({
            where: { usuarioId: { in: ids } },
            select: { id: true }
        })
        const tecnicoIds = tecnicosRecords.map(t => t.id)

        if (tecnicoIds.length > 0) {
            await db.ticket.updateMany({
                where: { tecnicoId: { in: tecnicoIds } },
                data: { tecnicoId: null }
            })
        }

        // 2. Eliminar seguimientos (comentarios) hechos por estos técnicos
        await db.seguimientoTicket.deleteMany({
            where: { usuarioId: { in: ids } }
        })

        // 3. Eliminar documentos generados por estos técnicos
        await db.documento.deleteMany({
            where: { usuarioGeneradorId: { in: ids } }
        })

        // 4. Gestionar Base de Conocimiento (KB)
        // Primero desvincular resoluciones de tickets
        const kbArticles = await db.baseConocimiento.findMany({
            where: { autorId: { in: ids } },
            select: { id: true }
        })
        const kbIds = kbArticles.map(k => k.id)

        if (kbIds.length > 0) {
            await db.ticket.updateMany({
                where: { resolucionId: { in: kbIds } },
                data: { resolucionId: null }
            })

            // Eliminar artículos de KB
            await db.baseConocimiento.deleteMany({
                where: { autorId: { in: ids } }
            })
        }

        // 5. Eliminar perfil técnico
        await db.tecnico.deleteMany({
            where: { usuarioId: { in: ids } }
        })

        // 6. Eliminar usuarios
        await db.usuario.deleteMany({
            where: { id: { in: ids } }
        })

        console.log(`✅ Eliminados ${ids.length} técnicos anteriores y sus dependencias.`)
    }

    // Contraseña estándar
    const passwordHash = await bcrypt.hash('tecnico123', 10)

    for (const nombreRaw of tecnicosRaw) {
        const { nombre, apellidos } = parseName(nombreRaw)
        const email = generateEmail(nombreRaw)
        const nivel = TecnicoNivel.senior
        // const nivel = getRandomItem(NIVELES)
        const especialidades = getRandomSpecialities()

        console.log(`👤 Creando: ${nombre} ${apellidos} (${email}) - ${nivel}`)

        try {
            const user = await db.usuario.create({
                data: {
                    email,
                    nombre,
                    apellidos,
                    passwordHash,
                    rol: UserRole.tecnico
                }
            })

            await db.tecnico.create({
                data: {
                    usuarioId: user.id,
                    nivel: nivel,
                    especialidades: JSON.stringify(especialidades),
                    disponible: true
                }
            })
        } catch (error) {
            console.error(`❌ Error creando ${email}:`, error)
        }
    }

    console.log('✨ Seed de técnicos finalizado con éxito.')
}

main()
    .catch(e => {
        console.error('❌ Error en el seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
