
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generarEtiquetaTicket } from '@/lib/pdf-generator'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    try {
        const { id } = await params

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                usuario: true, // Datos del cliente
            }
        })

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
        }

        const pdfBuffer = await generarEtiquetaTicket(ticket)

        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="etiqueta-${ticket.numeroTicket}.pdf"`
            }
        })

    } catch (error) {
        console.error('Error generando etiqueta:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
