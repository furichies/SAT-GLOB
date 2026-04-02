import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

// POST /api/admin/documentos/[id]/evidencias - Subir evidencias fotográficas
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'tecnico' && session.user.role !== 'superadmin')) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Verificar que el documento existe
        const documento = await prisma.documento.findUnique({
            where: { id },
        })

        if (!documento) {
            return NextResponse.json(
                { success: false, error: 'Documento no encontrado' },
                { status: 404 }
            )
        }

        // Obtener el formData
        const formData = await request.formData()
        const files = formData.getAll('files') as File[]
        const descripcion = formData.get('descripcion') as string | null

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No se proporcionaron archivos' },
                { status: 400 }
            )
        }

        // Crear directorio para evidencias en la carpeta persistente 'uploads'
        // Esto evita depender de la carpeta 'public' que tiene problemas en standalone mode
        const uploadDir = path.join(process.cwd(), 'uploads', 'evidencias', id)
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Procesar cada archivo
        const evidencias: any[] = []
        for (const file of files) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Generar nombre único para el archivo
            const timestamp = Date.now()
            const extension = file.name.split('.').pop()
            const filename = `evidencia-${timestamp}.${extension}`
            const filepath = path.join(uploadDir, filename)

            // Guardar archivo
            await writeFile(filepath, buffer)

            // Agregar a la lista de evidencias - USAR RUTA DE API PARA SERVIR
            evidencias.push({
                id: `${timestamp}`,
                url: `/api/uploads/evidencias/${id}/${filename}`,
                descripcion: descripcion || file.name,
                fechaCaptura: new Date().toISOString(),
            })
        }

        // Obtener evidencias existentes
        const evidenciasExistentes = documento.evidenciasFotos
            ? JSON.parse(documento.evidenciasFotos)
            : []

        // Combinar evidencias existentes con las nuevas
        const todasEvidencias = [...evidenciasExistentes, ...evidencias]

        // Actualizar documento
        const documentoActualizado = await prisma.documento.update({
            where: { id },
            data: {
                evidenciasFotos: JSON.stringify(todasEvidencias),
            },
        })

        return NextResponse.json({
            success: true,
            data: {
                evidencias,
                total: todasEvidencias.length,
            },
        })
    } catch (error) {
        console.error('Error al subir evidencias:', error)
        return NextResponse.json(
            { success: false, error: 'Error al subir evidencias' },
            { status: 500 }
        )
    }
}

// DELETE /api/admin/documentos/[id]/evidencias - Eliminar una evidencia
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'tecnico' && session.user.role !== 'superadmin')) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            )
        }

        const { evidenciaId } = await request.json()

        if (!evidenciaId) {
            return NextResponse.json(
                { success: false, error: 'ID de evidencia requerido' },
                { status: 400 }
            )
        }

        // Obtener documento
        const documento = await prisma.documento.findUnique({
            where: { id },
        })

        if (!documento) {
            return NextResponse.json(
                { success: false, error: 'Documento no encontrado' },
                { status: 404 }
            )
        }

        // Obtener evidencias actuales
        const evidencias = documento.evidenciasFotos
            ? JSON.parse(documento.evidenciasFotos)
            : []

        // Filtrar la evidencia a eliminar
        const nuevasEvidencias = evidencias.filter(
            (e: any) => e.id !== evidenciaId
        )

        // Actualizar documento
        await prisma.documento.update({
            where: { id },
            data: {
                evidenciasFotos: JSON.stringify(nuevasEvidencias),
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Evidencia eliminada correctamente',
        })
    } catch (error) {
        console.error('Error al eliminar evidencia:', error)
        return NextResponse.json(
            { success: false, error: 'Error al eliminar evidencia' },
            { status: 500 }
        )
    }
}
