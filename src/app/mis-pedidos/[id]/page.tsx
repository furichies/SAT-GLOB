'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Package,
    Truck,
    CheckCircle,
    MapPin,
    Clock,
    ChevronLeft,
    ShoppingBag,
    CreditCard,
    History
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'sonner'

export default function DetallePedidoPage() {
    const { id } = useParams()
    const { data: session, status } = useSession()
    const router = useRouter()
    const [pedido, setPedido] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login')
        } else if (status === 'authenticated') {
            fetchPedidoDetalle()
        }
    }, [status, id])

    const fetchPedidoDetalle = async () => {
        try {
            const res = await fetch(`/api/pedidos/${id}`)
            const data = await res.json()
            if (data.success) {
                setPedido(data.data.pedido)
            }
        } catch (error) {
            console.error('Error fetching pedido detalle:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!pedido) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
                <Button onClick={() => router.push('/mis-pedidos')}>Volver a Mis Pedidos</Button>
            </div>
        )
    }

    const direccion = pedido.direccionEnvio ? JSON.parse(pedido.direccionEnvio) : {}

    const pasos = [
        { key: 'pendiente', label: 'Pendiente', icon: Clock, desc: 'Recibido y a la espera de validación' },
        { key: 'procesando', label: 'Procesando', icon: Package, desc: 'Estamos preparando tu paquete' },
        { key: 'enviado', label: 'Enviado', icon: Truck, desc: 'El transportista tiene tu pedido' },
        { key: 'entregado', label: 'Entregado', icon: CheckCircle, desc: '¡Pedido recibido con éxito!' }
    ]

    const currentStepIndex = pasos.findIndex(p => p.key === pedido.estado)

    const generatePDF = () => {
        try {
            const doc = new jsPDF() as any

            // Header - Logo y Título
            doc.setFontSize(22)
            doc.setTextColor(20, 50, 150) // Azul Micro1475
            doc.text('MICRO1475 - RESISTENCIA TÉCNICA', 14, 22)

            doc.setFontSize(10)
            doc.setTextColor(100)
            doc.text('Soluciones tecnológicas y Servicio Técnico Especializado', 14, 28)
            doc.text('Calle Arcas del Agua, 2 (Sector 3), 28905 Getafe, Madrid', 14, 33)
            doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 150, 28)

            // Línea divisoria
            doc.setDrawColor(230)
            doc.line(14, 38, 196, 38)

            // Información del Pedido
            doc.setFontSize(14)
            doc.setTextColor(0)
            doc.text(`FACTURA: ${pedido.numeroPedido}`, 14, 48)
            doc.setFontSize(10)
            doc.text(`Estado del Pedido: ${pedido.estado.toUpperCase()}`, 14, 55)
            doc.text(`Método de Pago: ${pedido.metodoPago.toUpperCase()}`, 14, 61)

            // Datos del Cliente y Envío
            doc.setFillColor(245, 245, 245)
            doc.rect(14, 68, 182, 35, 'F')

            doc.setFontSize(11)
            doc.setTextColor(0)
            doc.text('DATOS DE FACTURACIÓN Y ENVÍO', 20, 75)
            doc.setFontSize(9)
            doc.setTextColor(80)
            doc.text(`Cliente: ${direccion.nombre} ${direccion.apellidos || ''}`, 20, 82)
            doc.text(`Dirección: ${direccion.direccion}`, 20, 87)
            doc.text(`${direccion.codigoPostal}, ${direccion.ciudad} (${direccion.provincia})`, 20, 92)
            doc.text(`Teléfono: ${direccion.telefono}`, 140, 82)

            // Tabla de Productos
            const tableData = (pedido.detalles || []).map((d: any) => [
                d.producto?.nombre || 'Producto / Pack Personalizado',
                `${d.cantidad} ud`,
                `${d.precioUnitario.toFixed(2)}€`,
                `${(d.cantidad * d.precioUnitario).toFixed(2)}€`
            ])

            autoTable(doc, {
                startY: 110,
                head: [['Descripción del Artículo', 'Cant.', 'Precio Ud.', 'Subtotal']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [20, 50, 150], fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 4 },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { halign: 'center' },
                    2: { halign: 'right' },
                    3: { halign: 'right' }
                }
            })

            const finalY = (doc as any).lastAutoTable.finalY || 150

            // Resumen de Totales
            const marginX = 140
            doc.setFontSize(10)
            doc.setTextColor(100)
            doc.text('Subtotal:', marginX, finalY + 15)
            doc.text(`${pedido.subtotal.toFixed(2)}€`, 185, finalY + 15, { align: 'right' })

            doc.text('IVA (21%):', marginX, finalY + 22)
            doc.text(`${pedido.iva.toFixed(2)}€`, 185, finalY + 22, { align: 'right' })

            doc.text('Gastos de Envío:', marginX, finalY + 29)
            doc.text(`${pedido.gastosEnvio.toFixed(2)}€`, 185, finalY + 29, { align: 'right' })

            // Línea de Total
            doc.setDrawColor(20, 50, 150)
            doc.setLineWidth(0.5)
            doc.line(marginX, finalY + 34, 196, finalY + 34)

            doc.setFontSize(14)
            doc.setTextColor(20, 50, 150)
            doc.text('TOTAL:', marginX, finalY + 42)
            doc.text(`${pedido.total.toFixed(2)}€`, 185, finalY + 42, { align: 'right' })

            // Pie de página
            doc.setFontSize(8)
            doc.setTextColor(150)
            doc.text('Gracias por confiar en Micro1475. Este documento sirve como comprobante de compra oficial.', 105, 280, { align: 'center' })
            doc.text('Micro1475 - Resistencia Técnica ante la Obsolescencia Programada.', 105, 285, { align: 'center' })

            doc.save(`Factura_Micro1475_${pedido.numeroPedido}.pdf`)
            toast.success("Factura generada y descargada con éxito")
        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("No se pudo generar la factura")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4">
            <div className="container max-w-5xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-8 hover:bg-white shadow-sm rounded-full">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Volver al Historial
                </Button>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Seguimiento Visual */}
                        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-primary text-primary-foreground p-8">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-primary-foreground/80 text-sm font-bold uppercase tracking-widest mb-1">Seguimiento en Tiempo Real</p>
                                        <CardTitle className="text-3xl font-black">{pedido.numeroPedido}</CardTitle>
                                    </div>
                                    <Badge className="bg-white text-primary px-6 py-2 rounded-full font-black text-lg">
                                        {pedido.estado.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10">
                                <div className="relative flex justify-between">
                                    <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 -z-0" />
                                    <div
                                        className="absolute top-6 left-0 h-1 bg-primary transition-all duration-1000 -z-0"
                                        style={{ width: `${(currentStepIndex / (pasos.length - 1)) * 100}%` }}
                                    />

                                    {pasos.map((paso, idx) => {
                                        const isCompleted = idx <= currentStepIndex
                                        const isCurrent = idx === currentStepIndex
                                        const Icon = paso.icon

                                        return (
                                            <div key={paso.key} className="relative z-10 flex flex-col items-center text-center max-w-[100px]">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCurrent ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' :
                                                    isCompleted ? 'bg-green-500 text-white' : 'bg-white text-gray-300 border-2'
                                                    }`}>
                                                    <Icon className="h-7 w-7" />
                                                </div>
                                                <p className={`mt-4 font-black transition-colors ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                                                    {paso.label}
                                                </p>
                                                <p className="text-[10px] leading-tight text-gray-500 mt-1 hidden sm:block">
                                                    {paso.desc}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Productos */}
                        <Card className="border-none shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-gray-50 p-8">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="h-6 w-6 text-primary" />
                                    <CardTitle className="text-xl font-bold">Artículos en este pedido</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-50">
                                    {pedido.detalles?.map((item: any) => (
                                        <div key={item.id} className="p-8 flex items-center gap-6 hover:bg-gray-50/50 transition-colors">
                                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex-shrink-0 border overflow-hidden">
                                                {item.producto?.imagenes?.[0] ? (
                                                    <img src={item.producto.imagenes[0]} alt={item.producto.nombre} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-gray-300" /></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg">{item.producto?.nombre}</h4>
                                                <p className="text-muted-foreground text-sm font-medium">{item.producto?.marca} {item.producto?.modelo}</p>
                                                <div className="mt-2 flex items-center gap-4">
                                                    <Badge variant="outline" className="font-bold">{item.cantidad} UDS</Badge>
                                                    <span className="font-bold text-primary">{item.precioUnitario.toFixed(2)}€ / ud</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black">{(item.precioUnitario * item.cantidad).toFixed(2)}€</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Detalles de Envío */}
                        <Card className="border-none shadow-sm rounded-3xl h-fit">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                                    <MapPin className="h-4 w-4" />
                                    Dirección de Envío
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-4">
                                <div>
                                    <p className="font-black text-xl">{direccion.nombre} {direccion.apellidos}</p>
                                    <p className="text-gray-600 font-medium mt-1">{direccion.direccion}</p>
                                    <p className="text-gray-600 font-medium">{direccion.codigoPostal}, {direccion.ciudad}</p>
                                    <p className="text-gray-600 font-medium">{direccion.provincia}</p>
                                </div>
                                <div className="pt-4 border-t border-dashed">
                                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Contacto</p>
                                    <p className="font-bold">{direccion.telefono}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resumen de Pago */}
                        <Card className="border-none shadow-xl rounded-3xl bg-gray-900 text-white h-fit overflow-hidden">
                            <div className="p-8 bg-primary/20">
                                <div className="flex items-center gap-2 text-primary-foreground font-black uppercase text-xs tracking-widest mb-6">
                                    <CreditCard className="h-4 w-4" />
                                    Resumen de Pago
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-primary-foreground/60 font-medium">Subtotal</span>
                                        <span className="font-bold">{pedido.subtotal.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-primary-foreground/60 font-medium">IVA (21%)</span>
                                        <span className="font-bold">{pedido.iva.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-primary-foreground/60 font-medium">Gastos Envío</span>
                                        <span className="font-bold">{pedido.gastosEnvio > 0 ? pedido.gastosEnvio.toFixed(2) + '€' : 'Gratis'}</span>
                                    </div>
                                    <div className="flex justify-between text-2xl font-black pt-4 border-t border-primary/30 mt-4">
                                        <span>TOTAL</span>
                                        <span className="text-primary">{pedido.total.toFixed(2)}€</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/10 p-2 rounded-lg">
                                        <History className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50 font-bold uppercase">Método de Pago</p>
                                        <p className="font-bold capitalize">{pedido.metodoPago}</p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-white text-gray-900 hover:bg-gray-100 font-black rounded-2xl h-14"
                                    onClick={generatePDF}
                                >
                                    DESCARGAR FACTURA
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
