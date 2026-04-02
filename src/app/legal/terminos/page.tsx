import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TerminosPage() {
    return (
        <div className="container max-w-4xl py-12 md:py-20">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
            </Link>

            <div className="prose prose-slate max-w-none dark:prose-invert">
                <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Objeto</h2>
                    <p>
                        Las presentes condiciones generales regulan la venta de los productos presentados en este sitio web
                        por MicroInfo Shop S.L. Todo pedido realizado a MicroInfo implica necesariamente la aceptación
                        sin reservas por parte del cliente de estas condiciones.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Precios y Pagos</h2>
                    <p>
                        Los precios publicados son en Euros y son vigentes salvo error tipográfico. Todos los precios llevan
                        el IVA incluido aplicable en el día del pedido. Los métodos de pago aceptados incluyen tarjeta de crédito,
                        PayPal y transferencia bancaria.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Envíos y Devoluciones</h2>
                    <p>
                        Los plazos de entrega varían según el producto y la ubicación. El cliente tiene derecho a la devolución
                        del producto en un plazo de 14 días naturales desde la recepción del mismo, siempre que se encuentre
                        en perfecto estado y con su embalaje original.
                    </p>
                </section>

                <section className="mb-12 text-sm text-muted-foreground">
                    <p>Última actualización: 31 de diciembre de 2025</p>
                </section>
            </div>
        </div>
    )
}
