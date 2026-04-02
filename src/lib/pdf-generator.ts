import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import { DocumentoTipo, EstadoDocumento } from '@/types/enums'
import path from 'path'
import type {
    MetadatosOrdenServicio,
    MetadatosDiagnosticoPresupuesto,
    MetadatosAceptacionPresupuesto,
    MetadatosRechazoPresupuesto,
    MetadatosExtensionPresupuesto,
    MetadatosAlbaranEntrega,
    MetadatosFactura,
} from '@/types/documentos'
import type {
    MetadatosMantenimientoPreventivo,
    MetadatosInstalacionConfiguracion
} from '@/types/plantillas'

// Configuración de la empresa
const EMPRESA = {
    nombre: 'MicroInfo',
    direccion: 'Calle Principal, 123',
    ciudad: 'Ciudad, CP 12345',
    telefono: '+34 123 456 789',
    email: 'info@microinfo.es',
    web: 'www.microinfo.es',
}

// Colores corporativos
const COLORS = {
    primary: '#4f46e5', // Indigo
    secondary: '#64748b', // Slate
    success: '#10b981', // Green
    danger: '#ef4444', // Red
    warning: '#f59e0b', // Amber
    text: '#1f2937', // Gray-800
    textLight: '#6b7280', // Gray-500
}

/**
 * Función principal para generar PDF de un documento
 */
export async function generarPDFDocumento(documento: any): Promise<Buffer> {
    const doc = new jsPDF()

    // Parsear metadatos si existen
    let metadatos = null
    if (documento.metadatos) {
        try {
            metadatos = JSON.parse(documento.metadatos)
        } catch (e) {
            console.error('Error al parsear metadatos:', e)
        }
    }

    // Generar PDF según el tipo de documento
    switch (documento.tipo) {
        case DocumentoTipo.ORDEN_SERVICIO:
            await generarOrdenServicio(doc, documento, metadatos)
            break
        case DocumentoTipo.DIAGNOSTICO_PRESUPUESTO:
            await generarDiagnosticoPresupuesto(doc, documento, metadatos)
            break
        case DocumentoTipo.ACEPTACION_PRESUPUESTO:
            await generarAceptacionPresupuesto(doc, documento, metadatos)
            break
        case DocumentoTipo.RECHAZO_PRESUPUESTO:
            await generarRechazoPresupuesto(doc, documento, metadatos)
            break
        case DocumentoTipo.EXTENSION_PRESUPUESTO:
            await generarExtensionPresupuesto(doc, documento, metadatos)
            break
        case DocumentoTipo.ALBARAN_ENTREGA:
            await generarAlbaranEntrega(doc, documento, metadatos)
            break
        case DocumentoTipo.FACTURA:
            await generarFactura(doc, documento, metadatos)
            break
        case DocumentoTipo.ORDEN_INTERVENCION:
            await generarOrdenIntervencion(doc, documento, metadatos)
            break
        case DocumentoTipo.INFORME_MANTENIMIENTO:
            await generarInformeMantenimiento(doc, documento, metadatos)
            break
        case DocumentoTipo.ACTA_INSTALACION:
            await generarActaInstalacion(doc, documento, metadatos)
            break
        case DocumentoTipo.INFORME_ENTREGA:
            await generarInformeEntrega(doc, documento, metadatos)
            break
        case DocumentoTipo.AUTORIZACION_ACCESO_REMOTO:
            await generarAccesoRemoto(doc, documento, metadatos)
            break
        case DocumentoTipo.ENCUESTA_SATISFACCION:
            await generarEncuestaSatisfaccion(doc, documento, metadatos)
            break
        case DocumentoTipo.INFORME_MANTENIMIENTO_PREVENTIVO:
            await generarMantenimientoPreventivo(doc, documento, metadatos)
            break
        case DocumentoTipo.ACTA_INSTALACION_CONFIGURACION:
            await generarInstalacionConfiguracion(doc, documento, metadatos)
            break
        default:
            generarDocumentoGenerico(doc, documento)
    }

    // Convertir a buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    return pdfBuffer
}

/**
 * Agregar encabezado de la empresa
 */
function agregarEncabezado(doc: jsPDF, titulo: string, numeroDocumento: string) {
    const pageWidth = doc.internal.pageSize.getWidth()

    // Logo/Nombre de la empresa
    doc.setFontSize(20)
    doc.setTextColor(COLORS.primary)
    doc.setFont('helvetica', 'bold')
    doc.text(EMPRESA.nombre, 20, 20)

    // Información de contacto
    doc.setFontSize(9)
    doc.setTextColor(COLORS.textLight)
    doc.setFont('helvetica', 'normal')
    doc.text(EMPRESA.direccion, 20, 27)
    doc.text(`${EMPRESA.ciudad} | Tel: ${EMPRESA.telefono}`, 20, 32)
    doc.text(`${EMPRESA.email} | ${EMPRESA.web}`, 20, 37)

    // Título del documento
    doc.setFontSize(16)
    doc.setTextColor(COLORS.text)
    doc.setFont('helvetica', 'bold')
    const tituloWidth = doc.getTextWidth(titulo)
    doc.text(titulo, pageWidth - 20 - tituloWidth, 20)

    // Número de documento
    doc.setFontSize(10)
    doc.setTextColor(COLORS.textLight)
    doc.setFont('helvetica', 'normal')
    const numeroWidth = doc.getTextWidth(numeroDocumento)
    doc.text(numeroDocumento, pageWidth - 20 - numeroWidth, 27)

    // Línea separadora
    doc.setDrawColor(COLORS.primary)
    doc.setLineWidth(0.5)
    doc.line(20, 42, pageWidth - 20, 42)

    return 50 // Posición Y después del encabezado
}

/**
 * Verificar si necesitamos un salto de página
 * @param doc - Documento PDF
 * @param yPos - Posición Y actual
 * @param espacioNecesario - Espacio necesario en mm
 * @returns Nueva posición Y (20 si se agregó página, yPos si no)
 */
function checkPageBreak(doc: jsPDF, yPos: number, espacioNecesario: number = 20): number {
    const pageHeight = doc.internal.pageSize.getHeight()
    const margenInferior = 30 // Espacio para el pie de página

    if (yPos + espacioNecesario > pageHeight - margenInferior) {
        doc.addPage()
        return 20 // Margen superior de la nueva página
    }

    return yPos
}


/**
 * Agregar pie de página
 */
function agregarPiePagina(doc: jsPDF, numeroPagina: number = 1) {
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFontSize(8)
    doc.setTextColor(COLORS.textLight)
    doc.setFont('helvetica', 'italic')

    const texto = `Página ${numeroPagina} | Documento generado el ${new Date().toLocaleDateString('es-ES')}`
    const textoWidth = doc.getTextWidth(texto)
    doc.text(texto, (pageWidth - textoWidth) / 2, pageHeight - 10)
}

/**
 * Agrega evidencias fotográficas al PDF
 */
async function agregarEvidenciasPDF(
    doc: jsPDF,
    evidencias: any[],
    yPos: number
): Promise<number> {
    if (!evidencias || evidencias.length === 0) return yPos

    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Verificar si hay suficiente espacio para el título y al menos 2 imágenes
    // Título: 17px, primera imagen: 70px + descripción: 15px = ~102px
    const espacioNecesarioMinimo = 102
    const espacioDisponible = pageHeight - yPos - 20 // 20px de margen inferior

    if (espacioDisponible < espacioNecesarioMinimo) {
        doc.addPage()
        yPos = 20 // Reiniciar posición en nueva página
        console.log('[PDF] Nueva página para evidencias - Espacio disponible:', espacioDisponible, '<', espacioNecesarioMinimo)
    }

    // Agregar título
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('EVIDENCIAS FOTOGRÁFICAS', 20, yPos)
    yPos += 7

    const imgWidth = 70
    const imgHeight = 70
    const cols = 2
    const gap = 10
    const margin = 20

    // Calcular altura necesaria para todas las imágenes
    const filas = Math.ceil(evidencias.length / cols)
    const alturaTotalNecesaria = (filas * (imgHeight + gap)) + 10 // 10px extra

    // Si el espacio restante en la página actual no es suficiente para todas las imágenes,
    // agregar nueva página inmediatamente
    if (pageHeight - yPos - 20 < alturaTotalNecesaria && evidencias.length > 0) {
        doc.addPage()
        yPos = 20
        // Agregar título en la nueva página
        yPos += 10
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.primary)
        doc.text('EVIDENCIAS FOTOGRÁFICAS (CONTINUACIÓN)', 20, yPos)
        yPos += 7
        console.log('[PDF] Nueva página para evidencias completas - Altura necesaria:', alturaTotalNecesaria)
    }

    // Procesar cada imagen
    for (let i = 0; i < evidencias.length; i++) {
        const evidencia = evidencias[i]
        const col = i % cols
        const row = Math.floor(i / cols)

        const x = margin + (col * (imgWidth + gap))
        const y = yPos + (row * (imgHeight + gap))

        // Verificar si necesitamos nueva página
        if (y + imgHeight + 15 > pageHeight - 20) {
            doc.addPage()
            yPos = 20
            console.log('[PDF] Nueva página durante procesamiento de imagen', i)
        }

        try {
            // Extraer ruta de archivo de la URL
            let imagePath = evidencia.url

            if (imagePath.startsWith('/api/uploads/')) {
                // Convertir ruta de API a ruta del sistema de archivos
                const pathPart = imagePath.replace('/api/uploads/', '')
                imagePath = path.join(process.cwd(), 'uploads', pathPart)
            } else if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
                // Es otra ruta relativa, intentar resolver desde uploads
                imagePath = path.join(process.cwd(), 'uploads', imagePath)
            }

            console.log('[PDF] Leyendo imagen desde:', imagePath)

            // Importar fs dinámicamente
            const { readFile } = await import('fs/promises')

            // Leer archivo directamente del sistema de archivos
            const imageData = await readFile(imagePath)

            console.log('[PDF] Imagen leída, tamaño:', imageData.length, 'bytes')

            // Validar tamaño (máximo 4MB)
            if (imageData.length > 4 * 1024 * 1024) {
                console.warn('[PDF] Imagen excede 4MB, omitiendo:', imagePath)
                doc.setFontSize(8)
                doc.setFont('helvetica', 'italic')
                doc.setTextColor(COLORS.warning)
                doc.text(`Imagen omitida (excede 4MB, ${Math.round(imageData.length / 1024 / 1024)}MB)`, x, y + 30)
                continue
            }

            // Determinar formato de imagen
            let formato = 'JPEG'
            if (imagePath.toLowerCase().includes('.png')) {
                formato = 'PNG'
            } else if (imagePath.toLowerCase().includes('.gif')) {
                formato = 'GIF'
            }

            // Agregar imagen al PDF
            doc.addImage(
                imageData,
                formato,
                x,
                y,
                imgWidth,
                imgHeight,
                undefined,
                'FAST'
            )

            // Agregar descripción debajo de la imagen
            doc.setFontSize(7)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(COLORS.text)

            const descripcion = evidencia.descripcion || `Evidencia ${i + 1}`
            const fecha = new Date(evidencia.fechaCaptura).toLocaleDateString('es-ES')

            const descLines = doc.splitTextToSize(`${descripcion} (${fecha})`, imgWidth)
            doc.text(descLines, x, y + imgHeight + 3)

            // Actualizar yPos para siguiente fila
            if (col === cols - 1) {
                yPos = y + imgHeight + 15
            }
        } catch (error: any) {
            console.error('[PDF] Error al agregar imagen al PDF:', error)
            console.error('[PDF] Detalles:', {
                url: evidencia.url,
                error: error.message,
                code: error.code,
                cause: error.cause
            })

            doc.setFontSize(8)
            doc.setFont('helvetica', 'italic')
            doc.setTextColor(COLORS.warning)

            const errorMsg = error.cause?.code === 'ERR_INVALID_URL'
                ? 'URL inválida'
                : (error.message || 'Error al cargar imagen')

            doc.text(`Error: ${errorMsg}`, x, y + 20)
            doc.setFontSize(7)
            doc.setTextColor(COLORS.textLight)
            const urlShort = evidencia.url.length > 30
                ? evidencia.url.substring(0, 30) + '...'
                : evidencia.url
            doc.text(`URL: ${urlShort}`, x, y + 25)
        }
    }

    // Asegurar que la última fila se tenga en cuenta
    const ultimaFila = Math.floor((evidencias.length - 1) / cols)
    const ultimaPosicionY = 20 + (ultimaFila * (imgHeight + gap))

    // Devolver la posición correcta para continuar
    return ultimaPosicionY + 20
}

/**
 * Generar Orden de Servicio (FASE1)
 */
async function generarOrdenServicio(doc: jsPDF, documento: any, metadatos: MetadatosOrdenServicio | null) {
    let yPos = agregarEncabezado(doc, 'ORDEN DE SERVICIO', documento.numeroDocumento)

    // Fecha de recepción
    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.text(`Fecha de Recepción: ${new Date(documento.fechaGeneracion).toLocaleDateString('es-ES')}`, 20, yPos)

    if (!metadatos) {
        doc.text('No hay metadatos disponibles', 20, yPos + 10)
        agregarPiePagina(doc)
        return
    }

    // DATOS DEL CLIENTE
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('DATOS DEL CLIENTE', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const datosCliente = [
        ['Nombre Completo:', metadatos.cliente.nombreCompleto],
        ['Identificación:', metadatos.cliente.identificacion],
        ['Teléfono:', metadatos.cliente.telefono],
        ['Email:', metadatos.cliente.correoElectronico],
        ['Dirección:', metadatos.cliente.direccion],
    ]

    datosCliente.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, 20, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(value, 70, yPos)
        yPos += 6
    })

    // DATOS DEL EQUIPO
    yPos += 5
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('DATOS DEL EQUIPO', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const datosEquipo = [
        ['Tipo de Equipo:', metadatos.equipo.tipoEquipo],
        ['Marca:', metadatos.equipo.marca],
        ['Modelo:', metadatos.equipo.modelo],
        ['Número de Serie:', metadatos.equipo.numeroSerie || 'N/A'],
        ['IMEI:', metadatos.equipo.imei || 'N/A'],
        ['Color:', metadatos.equipo.color || 'N/A'],
    ]

    datosEquipo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, 20, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(value, 70, yPos)
        yPos += 6
    })

    // Accesorios entregados
    if (metadatos.equipo.accesoriosEntregados && metadatos.equipo.accesoriosEntregados.length > 0) {
        yPos += 2
        doc.setFont('helvetica', 'bold')
        doc.text('Accesorios Entregados:', 20, yPos)
        yPos += 6
        doc.setFont('helvetica', 'normal')
        metadatos.equipo.accesoriosEntregados.forEach(accesorio => {
            doc.text(`• ${accesorio}`, 25, yPos)
            yPos += 5
        })
    }

    // DESCRIPCIÓN DEL PROBLEMA
    yPos += 5
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('DESCRIPCIÓN DEL PROBLEMA', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    doc.text('Síntomas Reportados:', 20, yPos)
    yPos += 6
    const sintomasLines = doc.splitTextToSize(metadatos.problema.sintomasReportados, 170)
    doc.text(sintomasLines, 20, yPos)
    yPos += sintomasLines.length * 5

    if (metadatos.problema.frecuenciaFallo) {
        yPos += 3
        doc.text(`Frecuencia del Fallo: ${metadatos.problema.frecuenciaFallo}`, 20, yPos)
        yPos += 6
    }

    // ESTADO FÍSICO
    yPos += 5
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('ESTADO FÍSICO AL INGRESO', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const estadoFisico = [
        ['Golpes:', metadatos.estadoFisico.golpes ? 'Sí' : 'No'],
        ['Rayones:', metadatos.estadoFisico.rayones ? 'Sí' : 'No'],
        ['Estado de Pantalla:', metadatos.estadoFisico.estadoPantalla || 'Normal'],
        ['Funcionalidad de Botones:', metadatos.estadoFisico.funcionalidadBotones || 'Normal'],
    ]

    estadoFisico.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, 20, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(value, 70, yPos)
        yPos += 6
    })

    if (metadatos.estadoFisico.danosVisibles) {
        yPos += 2
        doc.setFont('helvetica', 'bold')
        doc.text('Daños Visibles:', 20, yPos)
        yPos += 6
        doc.setFont('helvetica', 'normal')
        const danosLines = doc.splitTextToSize(metadatos.estadoFisico.danosVisibles, 170)
        doc.text(danosLines, 20, yPos)
        yPos += danosLines.length * 5
    }

    // OBSERVACIONES
    if (metadatos.observacionesTecnico) {
        yPos += 5
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.primary)
        doc.text('OBSERVACIONES DEL TÉCNICO', 20, yPos)

        yPos += 7
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(COLORS.text)
        const obsLines = doc.splitTextToSize(metadatos.observacionesTecnico, 170)
        doc.text(obsLines, 20, yPos)
        yPos += obsLines.length * 5
    }

    // TÉRMINOS Y CONDICIONES
    yPos += 10
    doc.setFontSize(9)
    doc.setTextColor(COLORS.textLight)
    doc.setFont('helvetica', 'italic')
    const terminos = 'El cliente acepta los términos y condiciones del servicio de reparación. El equipo será diagnosticado y se enviará un presupuesto en un plazo máximo de 48-72 horas.'
    const terminosLines = doc.splitTextToSize(terminos, 170)
    doc.text(terminosLines, 20, yPos)

    // Fecha estimada de diagnóstico
    if (metadatos.fechaEstimadaDiagnostico) {
        yPos += terminosLines.length * 5 + 5
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.text)
        doc.text(`Fecha Estimada de Diagnóstico: ${new Date(metadatos.fechaEstimadaDiagnostico).toLocaleDateString('es-ES')}`, 20, yPos)
    }

    // === AGREGADO: EVIDENCIAS FOTOGRÁFICAS ===
    if (documento.evidenciasFotos) {
        try {
            const evidencias = JSON.parse(documento.evidenciasFotos)
            if (evidencias.length > 0) {
                yPos = await agregarEvidenciasPDF(doc, evidencias, yPos)
            }
        } catch (error) {
            console.error('Error al procesar evidencias:', error)
        }
    }

    agregarPiePagina(doc)
}

/**
 * Generar Diagnóstico y Presupuesto (FASE 2)
 */
async function generarDiagnosticoPresupuesto(doc: jsPDF, documento: any, metadatos: MetadatosDiagnosticoPresupuesto | null) {
    let yPos = agregarEncabezado(doc, 'DIAGNÓSTICO Y PRESUPUESTO', documento.numeroDocumento)

    // Fecha
    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.text(`Fecha: ${new Date(documento.fechaGeneracion).toLocaleDateString('es-ES')}`, 20, yPos)

    if (!metadatos) {
        doc.text('No hay metadatos disponibles', 20, yPos + 10)
        agregarPiePagina(doc)
        return
    }

    // Técnico asignado
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Técnico Asignado:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(metadatos.tecnicoAsignado.nombre, 70, yPos)

    // DIAGNÓSTICO DETALLADO
    yPos = checkPageBreak(doc, yPos, 50)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('DIAGNÓSTICO DETALLADO', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    // Pruebas realizadas
    doc.setFont('helvetica', 'bold')
    doc.text('Pruebas Realizadas:', 20, yPos)
    yPos += 6
    doc.setFont('helvetica', 'normal')
    metadatos.diagnostico.pruebasRealizadas.forEach(prueba => {
        yPos = checkPageBreak(doc, yPos, 10)
        doc.text(`• ${prueba}`, 25, yPos)
        yPos += 5
    })

    // Resultados
    yPos = checkPageBreak(doc, yPos, 20)
    yPos += 3
    doc.setFont('helvetica', 'bold')
    doc.text('Resultados:', 20, yPos)
    yPos += 6
    doc.setFont('helvetica', 'normal')
    const resultadosLines = doc.splitTextToSize(metadatos.diagnostico.resultadosObtenidos, 170)
    resultadosLines.forEach((line: string) => {
        yPos = checkPageBreak(doc, yPos, 10)
        doc.text(line, 20, yPos)
        yPos += 5
    })

    // Componentes defectuosos
    yPos = checkPageBreak(doc, yPos, 20)
    yPos += 3
    doc.setFont('helvetica', 'bold')
    doc.text('Componentes Defectuosos:', 20, yPos)
    yPos += 6
    doc.setFont('helvetica', 'normal')
    metadatos.diagnostico.componentesDefectuosos.forEach(componente => {
        yPos = checkPageBreak(doc, yPos, 10)
        doc.text(`• ${componente}`, 25, yPos)
        yPos += 5
    })

    // Causa raíz
    yPos = checkPageBreak(doc, yPos, 20)
    yPos += 3
    doc.setFont('helvetica', 'bold')
    doc.text('Causa Raíz:', 20, yPos)
    yPos += 6
    doc.setFont('helvetica', 'normal')
    const causaLines = doc.splitTextToSize(metadatos.diagnostico.causaRaiz, 170)
    causaLines.forEach((line: string) => {
        yPos = checkPageBreak(doc, yPos, 10)
        doc.text(line, 20, yPos)
        yPos += 5
    })

    // REPARACIÓN PROPUESTA
    yPos = checkPageBreak(doc, yPos, 50)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('REPARACIÓN PROPUESTA', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    // Descripción de trabajos - CAMPO CRÍTICO
    doc.setFont('helvetica', 'bold')
    doc.text('Descripción de Trabajos:', 20, yPos)
    yPos += 6
    doc.setFont('helvetica', 'normal')
    const trabajosLines = doc.splitTextToSize(metadatos.reparacionPropuesta.descripcionTrabajos, 170)
    trabajosLines.forEach((line: string) => {
        yPos = checkPageBreak(doc, yPos, 10)
        doc.text(line, 20, yPos)
        yPos += 5
    })
    yPos += 5

    // Tabla de repuestos
    if (metadatos.reparacionPropuesta.repuestosNecesarios.length > 0) {
        yPos = checkPageBreak(doc, yPos, 40)

        const repuestosData = metadatos.reparacionPropuesta.repuestosNecesarios.map(r => [
            r.codigo,
            r.descripcion,
            r.cantidad.toString(),
            `${r.precioUnitario.toFixed(2)}€`,
            `${r.subtotal.toFixed(2)}€`,
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Código', 'Descripción', 'Cant.', 'P. Unit.', 'Subtotal']],
            body: repuestosData,
            theme: 'striped',
            headStyles: { fillColor: COLORS.primary },
            margin: { left: 20, right: 20 },
        })

        yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // Tabla de mano de obra
    if (metadatos.reparacionPropuesta.manoObra.length > 0) {
        yPos = checkPageBreak(doc, yPos, 40)

        const manoObraData = metadatos.reparacionPropuesta.manoObra.map(m => [
            m.descripcion,
            `${m.horasEstimadas}h`,
            `${m.precioHora.toFixed(2)}€/h`,
            `${m.subtotal.toFixed(2)}€`,
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Descripción', 'Horas', 'Precio/Hora', 'Subtotal']],
            body: manoObraData,
            theme: 'striped',
            headStyles: { fillColor: COLORS.secondary },
            margin: { left: 20, right: 20 },
        })

        yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // COSTOS TOTALES
    yPos = checkPageBreak(doc, yPos, 60)
    const pageWidth = doc.internal.pageSize.getWidth()
    yPos += 5

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN DE COSTOS', 20, yPos)
    yPos += 7

    const costos = [
        ['Repuestos:', `${metadatos.costos.costoRepuestos.toFixed(2)}€`],
        ['Mano de Obra:', `${metadatos.costos.costoManoObra.toFixed(2)}€`],
    ]

    if (metadatos.costos.costosAdicionales && metadatos.costos.costosAdicionales.length > 0) {
        metadatos.costos.costosAdicionales.forEach(ca => {
            costos.push([ca.descripcion, `${ca.monto.toFixed(2)}€`])
        })
    }

    costos.push(['Subtotal:', `${metadatos.costos.subtotal.toFixed(2)}€`])
    costos.push(['IVA (21%):', `${metadatos.costos.iva.toFixed(2)}€`])

    doc.setFontSize(10)
    costos.forEach(([label, value]) => {
        yPos = checkPageBreak(doc, yPos, 10)
        doc.setFont('helvetica', 'normal')
        doc.text(label, pageWidth - 80, yPos)
        doc.text(value, pageWidth - 40, yPos, { align: 'right' })
        yPos += 6
    })

    // Total
    yPos = checkPageBreak(doc, yPos, 15)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('TOTAL:', pageWidth - 80, yPos)
    doc.text(`${metadatos.costos.total.toFixed(2)}€`, pageWidth - 40, yPos, { align: 'right' })

    // Información adicional
    yPos = checkPageBreak(doc, yPos, 30)
    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tiempo Estimado de Reparación: ${metadatos.tiempoEstimadoReparacion} horas`, 20, yPos)
    yPos += 6
    doc.text(`Garantía: ${metadatos.garantiaOfrecida.repuestos} meses (repuestos) | ${metadatos.garantiaOfrecida.manoObra} meses (mano de obra)`, 20, yPos)
    yPos += 6
    doc.text(`Validez del Presupuesto: ${metadatos.validezPresupuesto} días`, 20, yPos)

    // === AGREGADO: EVIDENCIAS FOTOGRÁFICAS ===
    if (documento.evidenciasFotos) {
        try {
            const evidencias = JSON.parse(documento.evidenciasFotos)
            if (evidencias.length > 0) {
                yPos = await agregarEvidenciasPDF(doc, evidencias, yPos)
            }
        } catch (error) {
            console.error('Error al procesar evidencias:', error)
        }
    }

    agregarPiePagina(doc)
}

/**
 * Generar Orden de Intervención (para tickets de incidencia)
 */
async function generarOrdenIntervencion(doc: jsPDF, documento: any, metadatos: any) {
    let yPos = agregarEncabezado(doc, 'ORDEN DE INTERVENCIÓN', documento.numeroDocumento)

    // Fecha de generación
    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.text(`Fecha de Generación: ${new Date(documento.fechaGeneracion).toLocaleDateString('es-ES')}`, 20, yPos)

    if (!metadatos) {
        doc.text('No hay metadatos disponibles', 20, yPos + 10)
        agregarPiePagina(doc)
        return
    }

    // INFORMACIÓN DEL TICKET
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('INFORMACIÓN DEL TICKET', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    // Obtener información del ticket si está disponible
    const ticket = documento.ticket

    if (ticket) {
        const datosTicket = [
            ['Número de Ticket:', ticket.numeroTicket || 'N/A'],
            ['Asunto:', ticket.asunto || 'N/A'],
            ['Prioridad:', (ticket.prioridad || 'N/A').toUpperCase()],
            ['Estado:', (ticket.estado || 'N/A').replace(/_/g, ' ').toUpperCase()],
        ]

        datosTicket.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold')
            doc.text(label, 20, yPos)
            doc.setFont('helvetica', 'normal')
            doc.text(value, 70, yPos)
            yPos += 6
        })
    }

    // TIPO DE INCIDENCIA
    yPos += 5
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('TIPO DE INCIDENCIA', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    if (metadatos.tiposIncidencia && metadatos.tiposIncidencia.length > 0) {
        metadatos.tiposIncidencia.forEach((tipo: string) => {
            doc.text(`• ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`, 25, yPos)
            yPos += 5
        })
    } else {
        doc.text('No especificado', 25, yPos)
        yPos += 5
    }

    // DESCRIPCIÓN Y SÍNTOMAS
    yPos += 5
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('DESCRIPCIÓN Y SÍNTOMAS OBSERVADOS', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    if (ticket && ticket.descripcion) {
        doc.setFont('helvetica', 'bold')
        doc.text('Descripción:', 20, yPos)
        yPos += 6
        doc.setFont('helvetica', 'normal')
        const descripcionLines = doc.splitTextToSize(ticket.descripcion, 170)
        descripcionLines.forEach((line: string) => {
            yPos = checkPageBreak(doc, yPos, 10)
            doc.text(line, 20, yPos)
            yPos += 5
        })
    }

    if (metadatos.sintomasObservados) {
        yPos += 3
        doc.setFont('helvetica', 'bold')
        doc.text('Síntomas Observados:', 20, yPos)
        yPos += 6
        doc.setFont('helvetica', 'normal')
        const sintomasLines = doc.splitTextToSize(metadatos.sintomasObservados, 170)
        sintomasLines.forEach((line: string) => {
            yPos = checkPageBreak(doc, yPos, 10)
            doc.text(line, 20, yPos)
            yPos += 5
        })
    }

    // TIPO DE ACCESO
    yPos = checkPageBreak(doc, yPos, 50)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('TIPO DE ACCESO', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const tipoAcceso = metadatos.tipoAcceso === 'remoto' ? 'ACCESO REMOTO' : 'INTERVENCIÓN PRESENCIAL'
    doc.setFont('helvetica', 'bold')
    doc.text(tipoAcceso, 20, yPos)
    yPos += 6

    doc.setFont('helvetica', 'normal')
    doc.text(`Autorizado por: ${metadatos.autorizadoPor || 'N/A'}`, 20, yPos)
    yPos += 6

    if (metadatos.tipoAcceso === 'remoto') {
        // HORARIO DESTACADO PARA ACCESO REMOTO
        yPos += 5
        doc.setFillColor(255, 243, 205) // Color ámbar claro
        doc.rect(20, yPos - 5, 170, 20, 'F')
        doc.setDrawColor(245, 158, 11) // Borde ámbar
        doc.setLineWidth(1)
        doc.rect(20, yPos - 5, 170, 20)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(146, 64, 14) // Texto ámbar oscuro
        doc.text('⏰ HORARIO PROGRAMADO', 25, yPos)
        yPos += 7

        doc.setFontSize(12)
        if (metadatos.fechaHoraPreferida) {
            const fecha = new Date(metadatos.fechaHoraPreferida)
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            const horaFormateada = fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })
            doc.text(`${fechaFormateada} a las ${horaFormateada}`, 25, yPos)
        } else {
            doc.text('No especificado', 25, yPos)
        }
        yPos += 10

        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.text('⚠️ El cliente debe estar disponible en este horario', 25, yPos)
        yPos += 10

        // INSTRUCCIONES ANYDESK
        yPos = checkPageBreak(doc, yPos, 60)
        doc.setFillColor(239, 246, 255) // Azul claro
        doc.rect(20, yPos, 170, 55, 'F')
        doc.setDrawColor(59, 130, 246) // Borde azul
        doc.setLineWidth(0.5)
        doc.rect(20, yPos, 170, 55)

        yPos += 7
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 58, 138) // Azul oscuro
        doc.text('📥 INSTRUCCIONES PARA EL CLIENTE', 25, yPos)
        yPos += 7

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(29, 78, 216) // Azul

        const instrucciones = [
            '1. Descargar AnyDesk desde: https://anydesk.com/es/downloads/',
            '2. Ejecutar el archivo descargado (no requiere instalación)',
            '3. Al abrir AnyDesk, aparecerá un número grande de 9 dígitos',
            '4. Enviar ese número como mensaje en la plataforma para que el técnico pueda conectarse'
        ]

        instrucciones.forEach(instruccion => {
            const lines = doc.splitTextToSize(instruccion, 160)
            lines.forEach((line: string) => {
                doc.text(line, 25, yPos)
                yPos += 5
            })
        })

        yPos += 3
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(146, 64, 14)
        doc.text('⏰ IMPORTANTE: Tenga AnyDesk abierto en el horario programado arriba', 25, yPos)
        yPos += 10

    } else {
        // INTERVENCIÓN PRESENCIAL
        if (metadatos.direccion) {
            doc.text(`Dirección: ${metadatos.direccion}`, 20, yPos)
            yPos += 6
        }
        if (metadatos.ciudad) {
            doc.text(`Ciudad: ${metadatos.ciudad}`, 20, yPos)
            yPos += 6
        }
        if (metadatos.codigoPostal) {
            doc.text(`Código Postal: ${metadatos.codigoPostal}`, 20, yPos)
            yPos += 6
        }
        if (metadatos.telefono) {
            doc.text(`Teléfono: ${metadatos.telefono}`, 20, yPos)
            yPos += 6
        }

        // HORARIO PREFERIDO (solo para presencial)
        yPos += 5
        doc.setFont('helvetica', 'bold')
        doc.text('Horario Preferido:', 20, yPos)
        yPos += 6
        doc.setFont('helvetica', 'normal')
        if (metadatos.fechaHoraPreferida) {
            const fecha = new Date(metadatos.fechaHoraPreferida)
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            doc.text(fechaFormateada, 20, yPos)
        } else {
            doc.text('No especificado', 20, yPos)
        }
        yPos += 6
    }

    // INFORMACIÓN DEL CLIENTE
    yPos = checkPageBreak(doc, yPos, 40)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('INFORMACIÓN DEL CLIENTE', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const datosCliente = [
        ['Nombre:', metadatos.autorizadoPor || 'N/A'],
    ]

    if (metadatos.telefono) {
        datosCliente.push(['Teléfono:', metadatos.telefono])
    }

    datosCliente.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, 20, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(value, 70, yPos)
        yPos += 6
    })

    // ESTADO DEL DOCUMENTO
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('ESTADO', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const estadoTexto = documento.estadoDocumento === 'pendiente_firma'
        ? 'SIN ASIGNAR (Esperando asignación de técnico)'
        : documento.estadoDocumento.replace(/_/g, ' ').toUpperCase()

    doc.text(`Estado: ${estadoTexto}`, 20, yPos)

    agregarPiePagina(doc)
}

/**
 * Generar documento genérico para tipos no implementados
 */
function generarDocumentoGenerico(doc: jsPDF, documento: any) {
    let yPos = agregarEncabezado(doc, 'DOCUMENTO', documento.numeroDocumento)

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.text(`Tipo: ${documento.tipo}`, 20, yPos)
    yPos += 6
    doc.text(`Estado: ${documento.estadoDocumento}`, 20, yPos)
    yPos += 6
    doc.text(`Fecha: ${new Date(documento.fechaGeneracion).toLocaleDateString('es-ES')}`, 20, yPos)

    if (documento.contenido) {
        yPos += 10
        const contenidoLines = doc.splitTextToSize(documento.contenido, 170)
        doc.text(contenidoLines, 20, yPos)
    }

    agregarPiePagina(doc)
}

/**
 * Generar Aceptación de Presupuesto (FASE 3)
 */
function generarAceptacionPresupuesto(doc: jsPDF, documento: any, metadatos: MetadatosAceptacionPresupuesto | null) {
    let yPos = agregarEncabezado(doc, 'ACEPTACIÓN DE PRESUPUESTO', documento.numeroDocumento)

    if (!metadatos) {
        doc.text('No hay metadatos disponibles', 20, yPos + 10)
        agregarPiePagina(doc)
        return
    }

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.text(`Presupuesto: ${metadatos.numeroPresupuesto}`, 20, yPos)
    yPos += 6
    doc.text(`Fecha de Aceptación: ${new Date(metadatos.fechaAceptacion).toLocaleDateString('es-ES')}`, 20, yPos)
    yPos += 6
    doc.text(`Forma de Aprobación: ${metadatos.formaAprobacion}`, 20, yPos)
    yPos += 6
    doc.text(`Método de Pago: ${metadatos.metodoPagoAcordado}`, 20, yPos)

    // === AGREGADO: DATOS DEL DIAGNÓSTICO (SI ESTÁN DISPONIBLES) ===
    // Intentamos recuperar los datos del documento padre (Diagnóstico) si existen en la relación
    // Nota: Como 'metadatos' de Aceptación solo tiene el snapshot, si existe el documento relacionado (padre)
    // podríamos intentar extraer info, pero 'documento' que llega aquí es el objeto plano.
    // Asumiremos que si el usuario quiere ver esto, debemos intentar mostrar lo que tengamos o lo que el snapshot ofrezca.
    // Actualmente el Snapshot SOLO guarda estructura de costos.
    // FIX: Para mostrar diagnóstico completo, idealmente deberíamos haber guardado un snapshot del diagnóstico también en la aceptación
    // O bien, confiar en que el usuario vea el documento original.
    // PERO el usuario pide explícitamente "incluir todo lo referido en el Diagnóstico".

    // Si el documento tiene relación con el documento 'padre' (documentoRelacionado), y ese padre es el diagnóstico,
    // podríamos intentar acceder a los datos. Pero en esta función 'generarPDFDocumento',
    // 'documento' suele venir con include: { documentoRelacionado: true }.

    // Verificamos si existe el documento relacionado y tiene metadatos de diagnóstico
    const docDiagnostico = documento.documentoRelacionado
    let metadatosDiagnostico: MetadatosDiagnosticoPresupuesto | null = null

    if (docDiagnostico && docDiagnostico.tipo === DocumentoTipo.DIAGNOSTICO_PRESUPUESTO && docDiagnostico.metadatos) {
        try {
            metadatosDiagnostico = JSON.parse(docDiagnostico.metadatos)
        } catch (e) {
            console.error('Error parseando metadatos del documento relacionado (diagnóstico):', e)
        }
    }

    if (metadatosDiagnostico) {
        yPos = checkPageBreak(doc, yPos, 40)
        yPos += 10
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.primary)
        doc.text('RESUMEN DEL DIAGNÓSTICO', 20, yPos)
        yPos += 7
        doc.setFontSize(10)
        doc.setTextColor(COLORS.text)
        doc.setFont('helvetica', 'normal')

        // Resultados
        doc.setFont('helvetica', 'bold')
        doc.text('Resultados Diagnóstico:', 20, yPos)
        yPos += 5
        doc.setFont('helvetica', 'normal')
        const resultadosLines = doc.splitTextToSize(metadatosDiagnostico.diagnostico.resultadosObtenidos, 170)
        resultadosLines.forEach((line: string) => {
            yPos = checkPageBreak(doc, yPos, 10)
            doc.text(line, 20, yPos)
            yPos += 5
        })

        // Causa raíz
        yPos += 2
        doc.setFont('helvetica', 'bold')
        doc.text('Causa Raíz:', 20, yPos)
        yPos += 5
        doc.setFont('helvetica', 'normal')
        const causaLines = doc.splitTextToSize(metadatosDiagnostico.diagnostico.causaRaiz, 170)
        causaLines.forEach((line: string) => {
            yPos = checkPageBreak(doc, yPos, 10)
            doc.text(line, 20, yPos)
            yPos += 5
        })

        // Trabajos a realizar
        yPos += 2
        doc.setFont('helvetica', 'bold')
        doc.text('Trabajos a Realizar:', 20, yPos)
        yPos += 5
        doc.setFont('helvetica', 'normal')
        const trabajosLines = doc.splitTextToSize(metadatosDiagnostico.reparacionPropuesta.descripcionTrabajos, 170)
        trabajosLines.forEach((line: string) => {
            yPos = checkPageBreak(doc, yPos, 10)
            doc.text(line, 20, yPos)
            yPos += 5
        })
    }

    // === AGREGADO: DETALLE DEL PRESUPUESTO ===
    if (metadatos.presupuestoSnapshot) {
        yPos = checkPageBreak(doc, yPos, 30)
        yPos += 10
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.primary)
        doc.text('DETALLE DEL PRESUPUESTO APROBADO', 20, yPos)
        yPos += 5

        // Tabla de repuestos
        if (metadatos.presupuestoSnapshot.repuestos && metadatos.presupuestoSnapshot.repuestos.length > 0) {
            yPos = checkPageBreak(doc, yPos, 30)
            const repuestosData = metadatos.presupuestoSnapshot.repuestos.map(r => [
                r.codigo,
                r.descripcion,
                r.cantidad.toString(),
                `${r.precioUnitario.toFixed(2)}€`,
                `${r.subtotal.toFixed(2)}€`,
            ])

            autoTable(doc, {
                startY: yPos,
                head: [['Código', 'Descripción', 'Cant.', 'P. Unit.', 'Subtotal']],
                body: repuestosData,
                theme: 'striped',
                headStyles: { fillColor: COLORS.secondary },
                margin: { left: 20, right: 20 },
                styles: { fontSize: 8 }
            })

            yPos = (doc as any).lastAutoTable.finalY + 5
        }

        // Tabla de mano de obra
        if (metadatos.presupuestoSnapshot.manoObra && metadatos.presupuestoSnapshot.manoObra.length > 0) {
            yPos = checkPageBreak(doc, yPos, 30)
            const manoObraData = metadatos.presupuestoSnapshot.manoObra.map(m => [
                m.descripcion,
                `${m.horasEstimadas}h`,
                `${m.precioHora.toFixed(2)}€/h`,
                `${m.subtotal.toFixed(2)}€`,
            ])

            autoTable(doc, {
                startY: yPos,
                head: [['Mano de Obra', 'Horas', 'Precio/Hora', 'Subtotal']],
                body: manoObraData,
                theme: 'striped',
                headStyles: { fillColor: COLORS.secondary },
                margin: { left: 20, right: 20 },
                styles: { fontSize: 8 }
            })

            yPos = (doc as any).lastAutoTable.finalY + 10
        }

        // Resumen
        yPos = checkPageBreak(doc, yPos, 30)
        const pageWidth = doc.internal.pageSize.getWidth()
        const snapshotCostos = metadatos.presupuestoSnapshot.costos

        doc.setFontSize(10)
        doc.setTextColor(COLORS.text)

        doc.text('Subtotal:', pageWidth - 80, yPos)
        doc.text(`${snapshotCostos.subtotal.toFixed(2)}€`, pageWidth - 40, yPos, { align: 'right' })
        yPos += 5

        doc.text('IVA (21%):', pageWidth - 80, yPos)
        doc.text(`${snapshotCostos.iva.toFixed(2)}€`, pageWidth - 40, yPos, { align: 'right' })
        yPos += 5

        doc.setFont('helvetica', 'bold')
        doc.text('TOTAL:', pageWidth - 80, yPos)
        doc.text(`${snapshotCostos.total.toFixed(2)}€`, pageWidth - 40, yPos, { align: 'right' })
        yPos += 10
    }

    yPos = checkPageBreak(doc, yPos, 20)
    yPos += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.success)
    doc.text('✓ PRESUPUESTO ACEPTADO', 20, yPos)

    agregarPiePagina(doc)
}

/**
 * Generar Rechazo de Presupuesto (FASE 3)
 */
function generarRechazoPresupuesto(doc: jsPDF, documento: any, metadatos: MetadatosRechazoPresupuesto | null) {
    let yPos = agregarEncabezado(doc, 'RECHAZO DE PRESUPUESTO', documento.numeroDocumento)

    if (!metadatos) {
        doc.text('No hay metadatos disponibles', 20, yPos + 10)
        agregarPiePagina(doc)
        return
    }

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.text(`Presupuesto: ${metadatos.numeroPresupuesto}`, 20, yPos)
    yPos += 6
    doc.text(`Fecha de Rechazo: ${new Date(metadatos.fechaRechazo).toLocaleDateString('es-ES')}`, 20, yPos)
    yPos += 6
    doc.text(`Motivo: ${metadatos.motivoRechazo}`, 20, yPos)

    if (metadatos.motivoDetalle) {
        yPos += 6
        const detalleLines = doc.splitTextToSize(metadatos.motivoDetalle, 170)
        doc.text(detalleLines, 20, yPos)
        yPos += detalleLines.length * 5
    }

    yPos += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.danger)
    doc.text('✗ PRESUPUESTO RECHAZADO', 20, yPos)

    agregarPiePagina(doc)
}

/**
 * Generar Extensión de Presupuesto (FASE 4)
 */
function generarExtensionPresupuesto(doc: jsPDF, documento: any, metadatos: MetadatosExtensionPresupuesto | null) {
    let yPos = agregarEncabezado(doc, 'EXTENSIÓN DE PRESUPUESTO', documento.numeroDocumento)

    if (!metadatos) {
        doc.text('No hay metadatos disponibles', 20, yPos + 10)
        agregarPiePagina(doc)
        return
    }

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.text(`Presupuesto Original: ${metadatos.numeroPresupuestoOriginal}`, 20, yPos)
    yPos += 6
    doc.text(`Fecha de Descubrimiento: ${new Date(metadatos.fechaDescubrimiento).toLocaleDateString('es-ES')}`, 20, yPos)
    yPos += 6
    doc.text(`Motivo: ${metadatos.motivoExtension}`, 20, yPos)

    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('DIAGNÓSTICO AMPLIADO', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)
    const diagnosticoLines = doc.splitTextToSize(metadatos.diagnosticoAmpliado.descripcion, 170)
    doc.text(diagnosticoLines, 20, yPos)
    yPos += diagnosticoLines.length * 5 + 10

    // === AGREGADO: DETALLE DE NUEVOS TRABAJOS ===
    if (metadatos.nuevosTrabajos) {
        // Tabla de Repuestos Adicionales
        if (metadatos.nuevosTrabajos.repuestosAdicionales && metadatos.nuevosTrabajos.repuestosAdicionales.length > 0) {
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text('Repuestos Adicionales:', 20, yPos)
            yPos += 5

            const repuestosData = metadatos.nuevosTrabajos.repuestosAdicionales.map(r => [
                r.codigo,
                r.descripcion,
                r.cantidad.toString(),
                `${r.precioUnitario.toFixed(2)}€`,
                `${r.subtotal.toFixed(2)}€`,
            ])

            autoTable(doc, {
                startY: yPos,
                head: [['Código', 'Descripción', 'Cant.', 'P. Unit.', 'Subtotal']],
                body: repuestosData,
                theme: 'striped',
                headStyles: { fillColor: COLORS.secondary },
                margin: { left: 20, right: 20 },
                styles: { fontSize: 8 }
            })

            yPos = (doc as any).lastAutoTable.finalY + 5
        }

        // Tabla de Mano de Obra Extra
        if (metadatos.nuevosTrabajos.manoObraExtra && metadatos.nuevosTrabajos.manoObraExtra.length > 0) {
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text('Mano de Obra Extra:', 20, yPos)
            yPos += 5

            const manoObraData = metadatos.nuevosTrabajos.manoObraExtra.map(m => [
                m.descripcion,
                `${m.horasEstimadas}h`,
                `${m.precioHora.toFixed(2)}€/h`,
                `${m.subtotal.toFixed(2)}€`,
            ])

            autoTable(doc, {
                startY: yPos,
                head: [['Descripción', 'Horas', 'Precio/Hora', 'Subtotal']],
                body: manoObraData,
                theme: 'striped',
                headStyles: { fillColor: COLORS.secondary },
                margin: { left: 20, right: 20 },
                styles: { fontSize: 8 }
            })

            yPos = (doc as any).lastAutoTable.finalY + 10
        }
    }

    // Costo adicional
    const pageWidth = doc.internal.pageSize.getWidth()
    const labelX = pageWidth - 90
    const valueX = pageWidth - 25

    doc.setFont('helvetica', 'bold')
    doc.text('COSTO ADICIONAL', 20, yPos)
    yPos += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Repuestos:', labelX, yPos)
    doc.text(`${metadatos.costoAdicional.repuestos.toFixed(2)}€`, valueX, yPos, { align: 'right' })
    yPos += 6
    doc.text('Mano de Obra:', labelX, yPos)
    doc.text(`${metadatos.costoAdicional.manoObra.toFixed(2)}€`, valueX, yPos, { align: 'right' })
    yPos += 6

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('TOTAL ADICIONAL:', labelX, yPos)
    doc.text(`${metadatos.costoAdicional.total.toFixed(2)}€`, valueX, yPos, { align: 'right' })

    agregarPiePagina(doc)
}

/**
 * Generar Albarán de Entrega (FASE FINAL)
 */
async function generarAlbaranEntrega(doc: jsPDF, documento: any, metadatos: MetadatosAlbaranEntrega | null) {
    let yPos = agregarEncabezado(doc, 'ALBARÁN DE ENTREGA', documento.numeroDocumento)

    if (!metadatos) {
        doc.text('No hay metadatos disponibles', 20, yPos + 10)
        agregarPiePagina(doc)
        return
    }

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.text(`Ticket: ${metadatos.numeroTicket}`, 20, yPos)
    yPos += 6
    doc.text(`Fecha de Entrega: ${new Date(metadatos.fechaEntrega).toLocaleDateString('es-ES')}`, 20, yPos)
    yPos += 6

    // DATOS DEL CLIENTE
    yPos += 5
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('DATOS DEL CLIENTE', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)
    doc.text(`Nombre: ${metadatos.clienteRecibe.nombre}`, 20, yPos)
    yPos += 5
    doc.text(`Identificación/DNI: ${metadatos.clienteRecibe.identificacion}`, 20, yPos)
    yPos += 5

    // Equipo entregado
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('EQUIPO ENTREGADO', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)
    doc.text(`${metadatos.equipoEntregado.marca} ${metadatos.equipoEntregado.modelo}`, 20, yPos)
    yPos += 6
    doc.text(`Tipo: ${metadatos.equipoEntregado.tipo}`, 20, yPos)

    // Reparaciones realizadas
    yPos = checkPageBreak(doc, yPos, 30) // Verificar espacio antes de empezar sección
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('REPARACIONES REALIZADAS', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    if (metadatos.reparacionesRealizadas && metadatos.reparacionesRealizadas.length > 0) {
        metadatos.reparacionesRealizadas.forEach(reparacion => {
            // Manejar texto largo en reparaciones
            const lines = doc.splitTextToSize(`• ${reparacion}`, 170)

            // Verificar si cabe el bloque de texto
            yPos = checkPageBreak(doc, yPos, lines.length * 5)

            doc.text(lines, 25, yPos)
            yPos += (lines.length * 5) + 2 // Espacio entre items
        })
    } else {
        doc.text('• Sin reparaciones detalladas.', 25, yPos)
        yPos += 8
    }

    // === AGREGADO: REPUESTOS UTILIZADOS EN ALBARÁN ===
    if (metadatos.repuestosUtilizados && metadatos.repuestosUtilizados.length > 0) {
        yPos = checkPageBreak(doc, yPos, 40) // Espacio para cabecera tabla
        yPos += 5
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.primary)
        doc.text('REPUESTOS SUSTITUIDOS', 20, yPos)
        yPos += 7

        const repuestosData = metadatos.repuestosUtilizados.map(r => [
            r.codigo || '-',
            r.descripcion,
            r.cantidad.toString(),
            `${r.garantiaMeses || 0} meses`
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Código', 'Descripción', 'Cant.', 'Garantía']],
            body: repuestosData,
            theme: 'striped',
            headStyles: { fillColor: COLORS.secondary },
            margin: { left: 20, right: 20 },
            styles: { fontSize: 9 },
            didDrawPage: (data) => {
                // Actualizar yPos si la tabla salta de página
                yPos = data.cursor?.y || yPos
            }
        })

        yPos = (doc as any).lastAutoTable.finalY + 15 // Aumentar margen inferior tras tabla
    } else {
        yPos += 5
    }

    // Garantía
    yPos = checkPageBreak(doc, yPos, 40) // Asegurar espacio para bloque garantía

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.success)
    doc.text('GARANTÍA', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)
    doc.text(`Repuestos: ${metadatos.garantiaProporcionada.repuestos} meses`, 20, yPos)
    yPos += 6
    doc.text(`Mano de Obra: ${metadatos.garantiaProporcionada.manoObra} meses`, 20, yPos)

    if (metadatos.garantiaProporcionada.condiciones) {
        yPos += 6
        const condicionesLines = doc.splitTextToSize(`Condiciones: ${metadatos.garantiaProporcionada.condiciones}`, 170)

        // Verificar si cabe el texto de condiciones
        if (yPos + (condicionesLines.length * 5) > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage()
            yPos = 30 // Margen superior nueva página
        }

        doc.text(condicionesLines, 20, yPos)
        yPos += (condicionesLines.length * 5) + 5
    }

    // === AGREGADO: EVIDENCIAS FOTOGRÁFICAS ===
    if (documento.evidenciasFotos) {
        try {
            const evidencias = JSON.parse(documento.evidenciasFotos)
            if (evidencias.length > 0) {
                yPos = await agregarEvidenciasPDF(doc, evidencias, yPos)
            }
        } catch (error) {
            console.error('Error al procesar evidencias:', error)
        }
    }

    agregarPiePagina(doc)
}

/**
 * Generar Factura (FINAL/PAGO)
 */
function generarFactura(doc: jsPDF, documento: any, metadatos: MetadatosFactura | null) {
    let yPos = agregarEncabezado(doc, 'FACTURA', documento.numeroDocumento)

    if (!metadatos) {
        doc.text('No hay metadatos disponibles', 20, yPos + 10)
        agregarPiePagina(doc)
        return
    }

    // Información de emisión
    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.text(`Fecha de Emisión: ${new Date(metadatos.fechaEmision || documento.fechaGeneracion).toLocaleDateString('es-ES')}`, 20, yPos)

    if (metadatos.numeroTicket) {
        doc.text(`Ticket Ref: ${metadatos.numeroTicket}`, 120, yPos)
    }

    // DATOS DEL CLIENTE
    yPos += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('DATOS DE FACTURACIÓN', 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    doc.text(metadatos.cliente.nombre, 20, yPos)
    yPos += 5
    doc.text(`NIF/DNI: ${metadatos.cliente.identificacion}`, 20, yPos)
    yPos += 5
    if (metadatos.cliente.direccion) {
        doc.text(metadatos.cliente.direccion, 20, yPos)
        yPos += 5
    }
    if (metadatos.cliente.email || metadatos.cliente.telefono) {
        const contact = [metadatos.cliente.email, metadatos.cliente.telefono].filter(Boolean).join(' | ')
        doc.text(contact, 20, yPos)
        yPos += 5
    }

    // EQUIPO RELACIONADO
    if (metadatos.equipo) {
        yPos += 5
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.primary)
        doc.text('EQUIPO / SERVICIO', 20, yPos)
        yPos += 7
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(COLORS.text)
        doc.text(`${metadatos.equipo.tipo} ${metadatos.equipo.marca} ${metadatos.equipo.modelo}`, 20, yPos)
        if (metadatos.equipo.numeroSerie) {
            yPos += 5
            doc.text(`N/S: ${metadatos.equipo.numeroSerie}`, 20, yPos)
        }
        yPos += 5
    }

    // TABLA DE ITEMS
    yPos += 5
    const itemsData = metadatos.items.map(item => [
        item.descripcion,
        item.cantidad.toString(),
        `${item.precioUnitario.toFixed(2)}€`,
        `${item.subtotal.toFixed(2)}€`
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['Concepto / Descripción', 'Cant.', 'Precio', 'Subtotal']],
        body: itemsData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.primary },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 25, halign: 'right' },
            3: { cellWidth: 25, halign: 'right' }
        },
        margin: { left: 20, right: 20 }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
    const pageWidth = doc.internal.pageSize.getWidth()

    // TOTALES
    const totals = [
        ['Base Imponible:', `${metadatos.totales.subtotal.toFixed(2)}€`],
        ['I.V.A. (21%):', `${metadatos.totales.iva.toFixed(2)}€`],
    ]

    totals.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal')
        doc.text(label, pageWidth - 80, yPos)
        doc.text(value, pageWidth - 20, yPos, { align: 'right' })
        yPos += 6
    })

    // GRAN TOTAL
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('TOTAL FACTURA:', pageWidth - 80, yPos)
    doc.text(`${metadatos.totales.total.toFixed(2)}€`, pageWidth - 20, yPos, { align: 'right' })

    // PAGO
    yPos += 15
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.text('ESTADO DE PAGO:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`PAGADO mediante ${metadatos.pago.metodo}`, 60, yPos)

    if (metadatos.pago.referencia) {
        yPos += 6
        doc.text(`Referencia: ${metadatos.pago.referencia}`, 60, yPos)
    }

    agregarPiePagina(doc)
}

/**
 * Genera una etiqueta térmica (62x40mm) para un ticket con código QR
 */
export async function generarEtiquetaTicket(ticket: any): Promise<Buffer> {
    // Formato etiqueta estándar Brother/Dymo: 62mm x 40mm (landscape)
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [62, 40]
    })

    // Dimensiones de la etiqueta
    const width = 62
    const height = 40
    const margin = 2

    // Generar QR que apunte a la gestión del ticket
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const qrData = `${baseUrl}/admin/tickets?ticketId=${ticket.id}`

    // Generar QR como Data URL con mayor calidad
    const qrImage = await QRCode.toDataURL(qrData, {
        margin: 1,
        width: 200,
        errorCorrectionLevel: 'M'
    })

    // === LAYOUT MEJORADO: QR centrado a la derecha, info a la izquierda ===

    // Dimensiones del QR (más grande y centrado verticalmente)
    const qrSize = 28
    const qrX = width - qrSize - margin - 2
    const qrY = (height - qrSize) / 2

    // Agregar QR Code centrado verticalmente a la derecha
    doc.addImage(qrImage, 'PNG', qrX, qrY, qrSize, qrSize)

    // === INFORMACIÓN A LA IZQUIERDA (centrada verticalmente) ===

    const infoX = margin + 1
    const infoWidth = qrX - infoX - 2 // Espacio disponible para texto
    let yPos = 6 // Posición inicial

    // Título / Empresa
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 100, 100)
    doc.text('SAT - MicroInfo', infoX, yPos)
    yPos += 5

    // Número de Ticket (Grande y destacado)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const numeroTicket = ticket.numeroTicket || ticket.numero || '---'
    doc.text(numeroTicket, infoX, yPos)
    yPos += 5

    // Fecha
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const fechaVal = ticket.fechaCreacion || ticket.fecha || new Date()
    const fechaStr = new Date(fechaVal).toLocaleDateString('es-ES')
    doc.text(fechaStr, infoX, yPos)
    yPos += 4

    // Cliente (Truncado si es largo)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    const clienteNombre = ticket.usuario?.nombre || ticket.cliente || 'Desconocido'
    const clienteLines = doc.splitTextToSize(clienteNombre, infoWidth)
    // Mostrar solo primera línea si es muy largo
    doc.text(clienteLines[0], infoX, yPos)
    yPos += 4

    // Asunto / Tipo (máximo 2 líneas)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    const asunto = ticket.asunto || ticket.tipo || ''
    const asuntoLines = doc.splitTextToSize(asunto, infoWidth)
    // Limitar a 2 líneas
    const linesToShow = asuntoLines.slice(0, 2)
    linesToShow.forEach((line: string, index: number) => {
        if (yPos + (index * 3) < height - 3) { // Verificar que no se salga
            doc.text(line, infoX, yPos + (index * 3))
        }
    })

    // === PIE DE PÁGINA: ID del ticket (centrado en la parte inferior) ===
    doc.setFontSize(5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    const ticketId = ticket.id.substring(0, 12)
    const idWidth = doc.getTextWidth(ticketId)
    doc.text(ticketId, (width - idWidth) / 2, height - 2)

    return Buffer.from(doc.output('arraybuffer'))
}


// ==========================================
// NUEVAS PLANTILLAS DE DOCUMENTOS
// ==========================================

async function generarInformeMantenimiento(doc: jsPDF, documento: any, metadatos: any) {
    const ticket = documento.ticket
    const numero = documento.numeroDocumento || `MANT-${ticket.numeroTicket}`

    let yPos = agregarEncabezado(doc, 'INFORME DE MANTENIMIENTO PREVENTIVO', numero)

    // Datos del Cliente y Equipo
    const cliente = ticket.usuario?.nombre || 'Desconocido'
    const equipo = ticket.numeroSerieProducto || 'S/N Desconocido'

    autoTable(doc, {
        startY: yPos,
        head: [['DATOS GENERALES', '']],
        body: [
            ['Cliente:', cliente],
            ['Fecha:', new Date().toLocaleDateString()],
            ['Equipo:', equipo],
            ['Periodicidad:', (metadatos.periodicidad || 'N/A').toUpperCase()]
        ],
        theme: 'grid',
        headStyles: { fillColor: COLORS.primary },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Revisión Hardware
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('REVISIÓN HARDWARE', 20, yPos)
    yPos += 5

    const hardwareRows = Object.entries(metadatos.hardware || {}).map(([k, v]) => {
        // Formatear nombre camelCase a Texto Legible
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        return [label, v ? 'OK' : 'Revisar/KO']
    })

    autoTable(doc, {
        startY: yPos,
        head: [['Componente', 'Estado']],
        body: hardwareRows,
        theme: 'striped',
        headStyles: { fillColor: COLORS.secondary },
        columnStyles: { 1: { fontStyle: 'bold' } }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Limpieza y Observaciones
    if (metadatos.limpiezaFisica) {
        doc.setFontSize(10)
        doc.setTextColor(COLORS.success)
        doc.text('✔ Limpieza física interna y externa realizada', 20, yPos)
        doc.setTextColor(COLORS.text)
        yPos += 6
    }

    if (metadatos.observacionesHardware) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Observaciones Hardware:', 20, yPos)
        yPos += 5
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const splitText = doc.splitTextToSize(metadatos.observacionesHardware, 170)
        doc.text(splitText, 20, yPos)
        yPos += (splitText.length * 4) + 5
    }

    // Software y Rendimiento
    yPos = checkPageBreak(doc, yPos, 40)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SOFTWARE Y RENDIMIENTO', 20, yPos)
    yPos += 5

    const softwareRows = [
        ['Actualizaciones S.O.', (metadatos.software?.actualizacionesSo || '').toUpperCase()],
        ['Antivirus', (metadatos.software?.actualizacionesAntivirus || '').toUpperCase()],
        ['Espacio en Disco', `${metadatos.software?.espacioDiscoLibre || 0}% Libre`],
        ['Copia de Seguridad', metadatos.software?.copiasSeguridad?.estado ? 'VERIFICADA OK' : 'NO VERIFICADA'],
        ['Rendimiento Global', (metadatos.rendimiento?.testRendimiento || 'N/A').toUpperCase()]
    ]

    autoTable(doc, {
        startY: yPos,
        body: softwareRows,
        theme: 'grid',
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Recomendaciones
    doc.setFillColor(255, 247, 237) // Amber-50
    doc.rect(20, yPos, 170, 30, 'F')
    doc.setDrawColor(COLORS.warning)
    doc.rect(20, yPos, 170, 30, 'S')

    doc.setFontSize(11)
    doc.setTextColor(COLORS.warning)
    doc.text('RECOMENDACIONES', 25, yPos + 8)

    doc.setTextColor(COLORS.text)
    doc.setFontSize(9)
    let recY = yPos + 15
    if (metadatos.recomendaciones?.ampliacionRam) { doc.text('• Se recomienda ampliar memoria RAM', 25, recY); recY += 5 }
    if (metadatos.recomendaciones?.actualizacionSsd) { doc.text('• Se recomienda cambiar disco mecánico por SSD', 25, recY); recY += 5 }
    if (metadatos.recomendaciones?.otras) {
        doc.text(`• ${metadatos.recomendaciones.otras}`, 25, recY)
    }

    // Pie de firma
    agregarPiePagina(doc)
    agregarZonaFirma(doc, 'Técnico Responsable', 'Cliente (Conforme)')
}

async function generarActaInstalacion(doc: jsPDF, documento: any, metadatos: any) {
    const ticket = documento.ticket
    const numero = documento.numeroDocumento || `INST-${ticket.numeroTicket}`

    let yPos = agregarEncabezado(doc, 'ACTA DE INSTALACIÓN Y CONFIGURACIÓN', numero)

    // Detalle Proyecto
    doc.setFontSize(10)
    doc.text(`PROYECTO: ${metadatos.proyecto || ticket.asunto}`, 20, yPos)
    doc.text(`DURACIÓN: ${metadatos.duracionHoras} Horas`, 140, yPos)
    yPos += 10

    // Tabla Equipamiento
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('EQUIPAMIENTO INSTALADO', 20, yPos)
    yPos += 5

    const equiposData = (metadatos.equipamiento || []).map((eq: any) => [
        eq.descripcion,
        eq.ubicacion,
        eq.cantidad,
        eq.numSerie || '-'
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['Descripción', 'Ubicación', 'Cant.', 'S/N']],
        body: equiposData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.primary }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Configuración (Checklist visual)
    doc.text('CONFIGURACIÓN REALIZADA', 20, yPos)
    yPos += 8

    const configKeys = Object.keys(metadatos.configuracion || {})
    let col = 0
    let startYConfig = yPos

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    configKeys.forEach((key, i) => {
        if (typeof metadatos.configuracion[key] === 'boolean') {
            const check = metadatos.configuracion[key] ? '[ X ]' : '[   ]'
            // Convertir camelCase a texto
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())

            doc.text(`${check} ${label}`, 20 + (col * 80), yPos)

            if (col === 1) {
                col = 0
                yPos += 6
            } else {
                col = 1
            }
        }
    })
    if (col === 1) yPos += 6 // Salto final si quedó impar

    yPos += 5

    // Entregables
    doc.setFont('helvetica', 'bold')
    doc.text('DOCUMENTACIÓN Y ENTREGABLES', 20, yPos)
    yPos += 6
    doc.setFont('helvetica', 'normal')

    const docs = metadatos.documentacionEntregada || {}
    const docsList: string[] = []
    if (docs.manualUsuario) docsList.push('Manual de Usuario')
    if (docs.credenciales) docsList.push('Credenciales de Acceso')
    if (docs.garantias) docsList.push('Garantías y Licencias')

    doc.text(docsList.join(', ') || 'Ninguna documentación adicional', 20, yPos)
    yPos += 10

    // Cierre
    doc.setDrawColor(COLORS.success)
    doc.rect(20, yPos, 170, 20)
    doc.setFontSize(10)
    doc.setTextColor(COLORS.success)
    doc.text('El usuario confirma la recepción y el correcto funcionamiento.', 30, yPos + 12)
    doc.setTextColor(COLORS.text)

    agregarPiePagina(doc)
    agregarZonaFirma(doc, 'Técnico Instalador', 'Usuario / Cliente')
}

async function generarInformeEntrega(doc: jsPDF, documento: any, metadatos: any) {
    const ticket = documento.ticket
    const numero = documento.numeroDocumento || `ENT-${ticket.numeroTicket}`

    let yPos = agregarEncabezado(doc, 'INFORME DE ENTREGA POST-REPARACIÓN', numero)

    // Datos Equipo
    autoTable(doc, {
        startY: yPos,
        head: [['DATOS DEL EQUIPO', '']],
        body: [
            ['Marca/Modelo:', metadatos.equipo?.marcaModelo || ''],
            ['Número de Serie:', metadatos.equipo?.numSerie || ''],
            ['Accesorios Entregados:', metadatos.equipo?.accesorios || 'Ninguno']
        ],
        theme: 'grid',
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    })
    yPos = (doc as any).lastAutoTable.finalY + 10

    // Reparación
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DETALLE DE LA REPARACIÓN', 20, yPos)
    yPos += 5

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const desc = metadatos.reparacion?.descripcionTecnica || 'Sin descripción técnica.'
    const descLines = doc.splitTextToSize(desc, 170)
    doc.text(descLines, 20, yPos)
    yPos += (descLines.length * 4) + 5

    if (metadatos.reparacion?.componentes?.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Componentes Reemplazados:', 20, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(metadatos.reparacion.componentes.join(', '), 75, yPos)
        yPos += 6
    }

    // Garantía
    doc.setFillColor(240, 253, 244) // Green-50
    doc.rect(20, yPos, 170, 15, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.success)
    doc.text(`GARANTÍA DE LA REPARACIÓN: ${metadatos.reparacion?.garantiaMeses} Meses (Válida hasta ${metadatos.reparacion?.garantiaHasta})`, 25, yPos + 10)
    doc.setTextColor(COLORS.text)
    yPos += 25

    // Instrucciones
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('INSTRUCCIONES Y MANTENIMIENTO', 20, yPos)
    yPos += 6
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    metadatos.instrucciones?.forEach((inst: string) => {
        doc.text(`• ${inst}`, 20, yPos)
        yPos += 5
    })

    agregarPiePagina(doc)
    agregarZonaFirma(doc, 'Técnico Responsable', 'Cliente (Recibí Conforme)')
}

async function generarAccesoRemoto(doc: jsPDF, documento: any, metadatos: any) {
    const ticket = documento.ticket
    const numero = documento.numeroDocumento || `REM-${ticket.numeroTicket}`

    let yPos = agregarEncabezado(doc, 'AUTORIZACIÓN DE ACCESO REMOTO', numero)

    doc.setFontSize(9)
    doc.text('En cumplimiento de la normativa de Protección de Datos y Seguridad de la Información.', 20, yPos)
    yPos += 10

    // Autorizante
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('1. DATOS DEL AUTORIZANTE (CLIENTE)', 20, yPos)
    yPos += 5

    const authData = [
        ['Nombre:', metadatos.autorizante?.nombre],
        ['Empresa:', metadatos.autorizante?.empresa],
        ['CIF/NIF:', metadatos.autorizante?.cif],
        ['Cargo:', metadatos.autorizante?.cargo]
    ]

    autoTable(doc, {
        startY: yPos,
        body: authData,
        theme: 'plain',
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    })
    yPos = (doc as any).lastAutoTable.finalY + 5

    // Equipos
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('2. EQUIPOS AUTORIZADOS', 20, yPos)
    yPos += 5

    const equipos = (metadatos.equiposAutorizados || []).map((eq: any) => [
        eq.nombreId,
        eq.ipIdRemoto,
        eq.sistema
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['ID Equipo', 'IP / Acceso', 'Sistema Operativo']],
        body: equipos,
        headStyles: { fillColor: COLORS.secondary }
    })
    yPos = (doc as any).lastAutoTable.finalY + 10

    // Condiciones
    doc.setFontSize(11)
    doc.text('3. CONDICIONES DEL ACCESO', 20, yPos)
    yPos += 5

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const condiciones = [
        `• Propósito: ${metadatos.tipoAcceso?.soportePuntual ? 'Soporte Técnico Puntual' : 'Mantenimiento'}`,
        `• Horario Permitido: ${metadatos.limitaciones?.horario?.desde || '09:00'} - ${metadatos.limitaciones?.horario?.hasta || '18:00'} (${metadatos.limitaciones?.horario?.dias || 'L-V'})`,
        `• Vigencia: Desde ${metadatos.vigencia?.desde}`
    ]

    condiciones.forEach(c => {
        doc.text(c, 20, yPos)
        yPos += 5
    })

    yPos += 5
    doc.setFontSize(8)
    doc.setTextColor(COLORS.textLight)
    const clausula = "El cliente autoriza expresamente el acceso remoto a los equipos descritos para las finalidades técnicas indicadas. EL PROVEEDOR se compromete a mantener la confidencialidad de toda la información a la que pudiera tener acceso incidental."
    const clausulaLines = doc.splitTextToSize(clausula, 170)
    doc.text(clausulaLines, 20, yPos)

    doc.setTextColor(COLORS.text)
    agregarPiePagina(doc)
    agregarZonaFirma(doc, 'EL PROVEEDOR (Técnico)', 'EL CLIENTE (Autorizante)')
}

async function generarEncuestaSatisfaccion(doc: jsPDF, documento: any, metadatos: any) {
    const ticket = documento.ticket
    const numero = documento.numeroDocumento || `ENC-${ticket.numeroTicket}`

    let yPos = agregarEncabezado(doc, 'ENCUESTA DE SATISFACCIÓN', numero)

    doc.setFontSize(10)
    doc.text('Valoración del servicio recibido (1: Muy Insatisfecho - 5: Muy Satisfecho)', 20, yPos)
    yPos += 10

    // Valoraciones Técnicas
    const ratings = [
        ['Tiempo de respuesta', metadatos.valoracionTecnica?.tiempoRespuesta],
        ['Profesionalidad', metadatos.valoracionTecnica?.profesionalidad],
        ['Claridad explicación', metadatos.valoracionTecnica?.claridad],
        ['Resolución problema', metadatos.valoracionTecnica?.resolucion],
        ['Tiempo total', metadatos.valoracionTecnica?.tiempoTotal],
    ].map(([label, rate]) => [label, '★'.repeat(rate as number) + '☆'.repeat(5 - (rate as number))])

    autoTable(doc, {
        startY: yPos,
        head: [['Aspecto Evaluado', 'Valoración']],
        body: ratings,
        theme: 'striped',
        headStyles: { fillColor: COLORS.primary },
        columnStyles: { 1: { fontStyle: 'bold', textColor: COLORS.warning, fontSize: 14 } }
    })
    yPos = (doc as any).lastAutoTable.finalY + 15

    // Global
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('VALORACIÓN GLOBAL', 20, yPos)
    yPos += 8

    const globalChecks: string[] = []
    if (metadatos.valoracionGlobal?.recomendaria) globalChecks.push('✔ Recomendaría el servicio')
    if (metadatos.valoracionGlobal?.volveriaSolicitar) globalChecks.push('✔ Volvería a solicitar soporte')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    globalChecks.forEach(c => {
        doc.text(c, 20, yPos)
        yPos += 6
    })

    if (metadatos.comentarios?.positivos || metadatos.comentarios?.mejorar) {
        yPos += 5
        doc.setFont('helvetica', 'bold')
        doc.text('COMENTARIOS DEL CLIENTE:', 20, yPos)
        yPos += 6
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(9)

        if (metadatos.comentarios.positivos) {
            doc.text(`Positivo: "${metadatos.comentarios.positivos}"`, 20, yPos)
            yPos += doc.splitTextToSize(metadatos.comentarios.positivos, 170).length * 4 + 4
        }
        if (metadatos.comentarios.mejorar) {
            doc.text(`A mejorar: "${metadatos.comentarios.mejorar}"`, 20, yPos)
        }
    }

    yPos += 20
    doc.setFontSize(8)
    doc.text('Gracias por ayudarnos a mejorar.', 105, yPos, { align: 'center' })

    agregarPiePagina(doc)
}

function agregarZonaFirma(doc: jsPDF, etiqueta1: string, etiqueta2: string) {
    const pageHeight = doc.internal.pageSize.getHeight()
    const yPos = pageHeight - 50 // Posición fija al final

    doc.setLineWidth(0.5)
    doc.setDrawColor(COLORS.textLight)

    // Firma 1
    doc.line(30, yPos, 90, yPos)
    doc.setFontSize(8)
    doc.text(etiqueta1, 60, yPos + 5, { align: 'center' })

    // Firma 2
    doc.line(120, yPos, 180, yPos)
    doc.text(etiqueta2, 150, yPos + 5, { align: 'center' })
}

/**
 * Generar Informe de Mantenimiento Preventivo
 */
async function generarMantenimientoPreventivo(doc: jsPDF, documento: any, metadatos: MetadatosMantenimientoPreventivo | null) {
    let yPos = agregarEncabezado(doc, 'INFORME DE MANTENIMIENTO PREVENTIVO', documento.numeroDocumento)

    if (!metadatos) {
        doc.text('No hay metadatos disponibles', 20, yPos + 10)
        agregarPiePagina(doc)
        return
    }

    const pageWidth = doc.internal.pageSize.getWidth()

    // Datos generales
    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.text('CLIENTE:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(documento.ticket?.cliente?.nombre || 'N/A', 50, yPos)

    doc.setFont('helvetica', 'bold')
    doc.text('FECHA:', pageWidth - 80, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date(documento.fechaGeneracion).toLocaleDateString('es-ES'), pageWidth - 50, yPos)

    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('EQUIPO:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(metadatos.equipo, 50, yPos)

    doc.setFont('helvetica', 'bold')
    doc.text('PERIODICIDAD:', pageWidth - 80, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(metadatos.periodicidad.toUpperCase(), pageWidth - 50, yPos)

    // REVISIÓN HARDWARE
    yPos = checkPageBreak(doc, yPos, 80)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('REVISIÓN HARDWARE', 20, yPos)
    yPos += 7

    const componentesHardware = [
        ['Fuente alimentación', metadatos.revisionHardware.fuenteAlimentacion],
        ['Ventilación/cooling', metadatos.revisionHardware.ventilacion],
        ['Disco duro/SSD', metadatos.revisionHardware.discoDuro],
        ['Memoria RAM', metadatos.revisionHardware.memoriaRam],
        ['Tarjeta gráfica', metadatos.revisionHardware.tarjetaGrafica],
        ['Placa base', metadatos.revisionHardware.placaBase],
        ['Conectividad (RJ45)', metadatos.revisionHardware.conectividad],
        ['Periféricos', metadatos.revisionHardware.perifericos]
    ]

    const hardwareData = componentesHardware.map(([nombre, datos]: any) => [
        nombre,
        datos.estado === 'ok' ? '☑ OK  ☐ KO' : '☐ OK  ☑ KO',
        datos.accion || '-'
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['Componente', 'Estado', 'Acción realizada']],
        body: hardwareData,
        theme: 'grid',
        headStyles: { fillColor: COLORS.primary, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 35 },
            2: { cellWidth: 'auto' }
        },
        margin: { left: 20, right: 20 }
    })

    yPos = (doc as any).lastAutoTable.finalY + 5

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)
    doc.text(`Limpieza física realizada: ${metadatos.limpiezaFisica ? '☑ Sí  ☐ No' : '☐ Sí  ☑ No'}`, 20, yPos)
    yPos += 5

    if (metadatos.observacionesHardware) {
        doc.setFont('helvetica', 'bold')
        doc.text('Observaciones hardware:', 20, yPos)
        yPos += 4
        doc.setFont('helvetica', 'normal')
        const obsLines = doc.splitTextToSize(metadatos.observacionesHardware, 170)
        doc.text(obsLines, 20, yPos)
        yPos += obsLines.length * 4
    }

    // REVISIÓN SOFTWARE
    yPos = checkPageBreak(doc, yPos, 60)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('REVISIÓN SOFTWARE', 20, yPos)
    yPos += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const softwareItems = [
        ['Actualizaciones SO:', metadatos.revisionSoftware.actualizacionesSo === 'completas' ?
            '☑ Completas  ☐ Pendientes' :
            `☐ Completas  ☑ Pendientes: ${metadatos.revisionSoftware.detallesPendientes || ''}`],
        ['Actualizaciones antivirus:', metadatos.revisionSoftware.actualizacionesAntivirus === 'ok' ?
            '☑ OK  ☐ Requiere atención' : '☐ OK  ☑ Requiere atención'],
        ['Espacio en disco:', `${metadatos.revisionSoftware.espacioDiscoLibre}% libre (recomendado >20%)`],
        ['Fragmentación (HDD):', metadatos.revisionSoftware.fragmentacion === 'ok' ?
            '☑ OK  ☐ Desfragmentado' : '☐ OK  ☑ Desfragmentado'],
        ['Programas instalados:', metadatos.revisionSoftware.programasInstalados === 'revisado' ?
            '☑ Revisado  ☐ Limpieza realizada' : '☐ Revisado  ☑ Limpieza realizada'],
        ['Licencias vigentes:', metadatos.revisionSoftware.licenciasVigentes === 'ok' ?
            '☑ OK  ☐ Renovaciones' :
            `☐ OK  ☑ Renovaciones: ${metadatos.revisionSoftware.detallesRenovaciones || ''}`],
        ['Copias de seguridad:', `Última: ${metadatos.revisionSoftware.copiasSeguridad.ultimaCopia ?
            new Date(metadatos.revisionSoftware.copiasSeguridad.ultimaCopia).toLocaleDateString('es-ES') : 'N/A'}  ${metadatos.revisionSoftware.copiasSeguridad.estado ? '☑ OK' : '☐ OK'}`]
    ]

    softwareItems.forEach(([label, value]) => {
        yPos = checkPageBreak(doc, yPos, 6)
        doc.setFont('helvetica', 'bold')
        doc.text(`• ${label}`, 20, yPos)
        doc.setFont('helvetica', 'normal')
        const valueLines = doc.splitTextToSize(value, 140)
        doc.text(valueLines, 75, yPos)
        yPos += Math.max(5, valueLines.length * 4)
    })

    // RENDIMIENTO
    yPos = checkPageBreak(doc, yPos, 30)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('RENDIMIENTO', 20, yPos)
    yPos += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    doc.text(`Tiempo de arranque: ${metadatos.rendimiento.tiempoArranqueActual} seg`, 20, yPos)
    if (metadatos.rendimiento.tiempoArranqueAnterior) {
        doc.text(`(anterior: ${metadatos.rendimiento.tiempoArranqueAnterior} seg)`, 90, yPos)
    }
    yPos += 5

    const testRendimiento = metadatos.rendimiento.testRendimiento
    doc.text(`Test de rendimiento: ${testRendimiento === 'optimo' ? '☑ Óptimo  ☐ Aceptable  ☐ Mejorable' :
        testRendimiento === 'aceptable' ? '☐ Óptimo  ☑ Aceptable  ☐ Mejorable' :
            '☐ Óptimo  ☐ Aceptable  ☑ Mejorable'}`, 20, yPos)

    // RECOMENDACIONES
    yPos = checkPageBreak(doc, yPos, 50)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('RECOMENDACIONES', 20, yPos)
    yPos += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const recomendaciones = [
        [metadatos.recomendaciones.ampliacionRam, 'Ampliación de memoria RAM'],
        [metadatos.recomendaciones.actualizacionSsd, 'Actualización a SSD'],
        [metadatos.recomendaciones.renovacionEquipo,
        `Renovación de equipo${metadatos.recomendaciones.antiguedadEquipo ? ` (antigüedad: ${metadatos.recomendaciones.antiguedadEquipo} años)` : ''}`]
    ]

    recomendaciones.forEach(([checked, text]: any) => {
        yPos = checkPageBreak(doc, yPos, 5)
        doc.text(`${checked ? '☑' : '☐'} ${text}`, 20, yPos)
        yPos += 5
    })

    if (metadatos.recomendaciones.mejoraSeguridad) {
        yPos = checkPageBreak(doc, yPos, 8)
        doc.text(`☑ Mejora de seguridad: ${metadatos.recomendaciones.mejoraSeguridad}`, 20, yPos)
        yPos += 5
    }

    if (metadatos.recomendaciones.otras) {
        yPos = checkPageBreak(doc, yPos, 8)
        doc.text(`☑ Otras:`, 20, yPos)
        yPos += 4
        const otrasLines = doc.splitTextToSize(metadatos.recomendaciones.otras, 170)
        doc.text(otrasLines, 25, yPos)
        yPos += otrasLines.length * 4
    }

    if (metadatos.proximoMantenimiento) {
        yPos = checkPageBreak(doc, yPos, 10)
        yPos += 5
        doc.setFont('helvetica', 'bold')
        doc.text(`Próximo mantenimiento programado: ${new Date(metadatos.proximoMantenimiento).toLocaleDateString('es-ES')}`, 20, yPos)
    }

    // Firmas
    yPos = checkPageBreak(doc, yPos, 30)
    yPos += 15
    agregarZonaFirma(doc, 'Firma del Cliente', 'Firma del Técnico')

    agregarPiePagina(doc)
}

/**
 * Generar Acta de Instalación y Configuración
 */
async function generarInstalacionConfiguracion(doc: jsPDF, documento: any, metadatos: MetadatosInstalacionConfiguracion | null) {
    let yPos = agregarEncabezado(doc, 'ACTA DE INSTALACIÓN Y CONFIGURACIÓN', documento.numeroDocumento)

    if (!metadatos) {
        doc.text('No hay metadatos disponibles', 20, yPos + 10)
        agregarPiePagina(doc)
        return
    }

    const pageWidth = doc.internal.pageSize.getWidth()

    // Datos generales
    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.text('PROYECTO:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(metadatos.proyecto, 50, yPos)

    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('CLIENTE:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(documento.ticket?.cliente?.nombre || 'N/A', 50, yPos)

    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('FECHA:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date(documento.fechaGeneracion).toLocaleDateString('es-ES'), 50, yPos)

    doc.setFont('helvetica', 'bold')
    doc.text('DURACIÓN:', pageWidth - 80, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`${metadatos.duracionHoras} horas`, pageWidth - 50, yPos)

    // EQUIPAMIENTO INSTALADO
    if (metadatos.equipamiento.length > 0) {
        yPos = checkPageBreak(doc, yPos, 50)
        yPos += 10
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.primary)
        doc.text('EQUIPAMIENTO INSTALADO', 20, yPos)
        yPos += 7

        const equipamientoData = metadatos.equipamiento.map(eq => [
            eq.descripcion,
            eq.marcaModelo,
            eq.numSerie || '-',
            eq.cantidad.toString(),
            eq.ubicacion
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Descripción', 'Marca/Modelo', 'Nº Serie', 'Cant.', 'Ubicación']],
            body: equipamientoData,
            theme: 'striped',
            headStyles: { fillColor: COLORS.primary, fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 35 },
                2: { cellWidth: 30 },
                3: { cellWidth: 15 },
                4: { cellWidth: 'auto' }
            },
            margin: { left: 20, right: 20 }
        })

        yPos = (doc as any).lastAutoTable.finalY + 5
    }

    // CONFIGURACIÓN REALIZADA
    yPos = checkPageBreak(doc, yPos, 80)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('CONFIGURACIÓN REALIZADA', 20, yPos)
    yPos += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const configuraciones = [
        [metadatos.configuracion.sistemaOperativo, 'Instalación sistema operativo', metadatos.configuracion.detallesSo],
        [metadatos.configuracion.red, 'Configuración red (IP/DNS/DHCP)', metadatos.configuracion.detallesRed],
        [metadatos.configuracion.dominio, 'Unión a dominio/grupo trabajo', metadatos.configuracion.detalleDominio],
        [metadatos.configuracion.email, 'Configuración correo electrónico', metadatos.configuracion.detalleEmail],
        [metadatos.configuracion.impresoras, 'Configuración impresoras/dispositivos', metadatos.configuracion.detalleImpresoras],
        [metadatos.configuracion.seguridad, 'Configuración seguridad/antivirus', metadatos.configuracion.detalleSeguridad],
        [metadatos.configuracion.politicas, 'Políticas de grupo/permisos', metadatos.configuracion.detallePoliticas],
        [metadatos.configuracion.backup, 'Copia de seguridad automatizada', metadatos.configuracion.detalleBackup]
    ]

    configuraciones.forEach(([checked, label, detalle]: any) => {
        yPos = checkPageBreak(doc, yPos, 8)
        doc.text(`${checked ? '☑' : '☐'} ${label}`, 20, yPos)
        if (checked && detalle) {
            yPos += 4
            doc.setFont('helvetica', 'italic')
            const detalleLines = doc.splitTextToSize(`   ${detalle}`, 165)
            doc.text(detalleLines, 25, yPos)
            doc.setFont('helvetica', 'normal')
            yPos += detalleLines.length * 4
        } else {
            yPos += 5
        }
    })

    // Software específico
    if (metadatos.configuracion.softwareEspecifico.length > 0) {
        yPos = checkPageBreak(doc, yPos, 10)
        doc.text('☑ Instalación software específico:', 20, yPos)
        yPos += 4
        metadatos.configuracion.softwareEspecifico.forEach(sw => {
            yPos = checkPageBreak(doc, yPos, 5)
            doc.text(`   • ${sw}`, 25, yPos)
            yPos += 4
        })
        yPos += 2
    }

    // Migración de datos
    if (metadatos.configuracion.migracionDatos) {
        yPos = checkPageBreak(doc, yPos, 8)
        doc.text(`☑ Migración de datos desde: ${metadatos.configuracion.migracionDatos}`, 20, yPos)
        yPos += 5
    }

    // DOCUMENTACIÓN ENTREGADA
    yPos = checkPageBreak(doc, yPos, 30)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('DOCUMENTACIÓN ENTREGADA', 20, yPos)
    yPos += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const documentacion = [
        [metadatos.documentacionEntregada.manualUsuario, 'Manual de usuario básico'],
        [metadatos.documentacionEntregada.guiaPrimerosPasos, 'Guía de primeros pasos'],
        [metadatos.documentacionEntregada.credenciales, 'Credenciales de acceso (sobre cerrado)'],
        [metadatos.documentacionEntregada.licencias, 'Licencias/originales software'],
        [metadatos.documentacionEntregada.garantias, 'Garantías equipamiento']
    ]

    documentacion.forEach(([checked, label]: any) => {
        yPos = checkPageBreak(doc, yPos, 5)
        doc.text(`${checked ? '☑' : '☐'} ${label}`, 20, yPos)
        yPos += 5
    })

    // FORMACIÓN AL USUARIO
    if (metadatos.formacion.impartida) {
        yPos = checkPageBreak(doc, yPos, 40)
        yPos += 10
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(COLORS.primary)
        doc.text('FORMACIÓN AL USUARIO', 20, yPos)
        yPos += 7

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(COLORS.text)

        doc.text(`☑ Sesión de formación impartida: ${metadatos.formacion.duracionMinutos} minutos`, 20, yPos)
        yPos += 5

        if (metadatos.formacion.temas.length > 0) {
            doc.setFont('helvetica', 'bold')
            doc.text('Temas cubiertos:', 20, yPos)
            yPos += 4
            doc.setFont('helvetica', 'normal')
            metadatos.formacion.temas.forEach(tema => {
                yPos = checkPageBreak(doc, yPos, 5)
                doc.text(`• ${tema}`, 25, yPos)
                yPos += 4
            })
            yPos += 2
        }

        doc.text(`Nivel de comprensión usuario: `, 20, yPos)
        const nivel = metadatos.formacion.nivelComprension
        doc.text(nivel === 'alto' ? '☑ Alto  ☐ Medio  ☐ Bajo' :
            nivel === 'medio' ? '☐ Alto  ☑ Medio  ☐ Bajo' :
                '☐ Alto  ☐ Medio  ☑ Bajo', 80, yPos)
        yPos += 5
    }

    // PERÍODO DE PRUEBA
    yPos = checkPageBreak(doc, yPos, 30)
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('PERÍODO DE PRUEBA', 20, yPos)
    yPos += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.text)

    const periodo = metadatos.periodoPrueba
    doc.text(periodo === 7 ? '☑ 7 días  ☐ 15 días  ☐ 30 días' :
        periodo === 15 ? '☐ 7 días  ☑ 15 días  ☐ 30 días' :
            '☐ 7 días  ☐ 15 días  ☑ 30 días', 20, yPos)
    yPos += 5

    if (metadatos.contactoSoporte) {
        doc.text(`Contacto soporte durante pruebas: ${metadatos.contactoSoporte}`, 20, yPos)
        yPos += 5
    }

    yPos += 3
    doc.setFont('helvetica', 'bold')
    doc.text(`El usuario confirma funcionamiento correcto: ${metadatos.confirmacionUsuario ? '☑ Sí' : '☐ Sí'}`, 20, yPos)

    // Firmas
    yPos = checkPageBreak(doc, yPos, 30)
    yPos += 15
    agregarZonaFirma(doc, 'Firma del Cliente', 'Firma del Técnico')

    agregarPiePagina(doc)
}

export default generarPDFDocumento
