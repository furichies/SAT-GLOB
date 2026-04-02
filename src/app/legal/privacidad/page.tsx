import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacidadPage() {
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
                <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>

                <p className="lead text-lg text-muted-foreground mb-8">
                    En MicroInfo, valoramos su privacidad y nos comprometemos a proteger sus datos personales.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Responsable del Tratamiento</h2>
                    <p>
                        El responsable del tratamiento de sus datos personales es MicroInfo Shop S.L., con NIF B-12345678
                        y domicilio en Calle Arcas del Agua, 2 (Sector 3) 28905 Getafe (Madrid).
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Finalidad del Tratamiento</h2>
                    <p>
                        Tratamos la información que nos facilita con el fin de prestarles el servicio solicitado y realizar
                        su facturación. Los datos proporcionados se conservarán mientras se mantenga la relación comercial
                        o durante los años necesarios para cumplir con las obligaciones legales.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Derechos</h2>
                    <p>
                        Usted tiene derecho a obtener confirmación sobre si en MicroInfo estamos tratando sus datos personales.
                        Por tanto, tiene derecho a acceder a sus datos personales, rectificar los datos inexactos o solicitar
                        su supresión cuando los datos ya no sean necesarios.
                    </p>
                </section>

                <section className="mb-12 text-sm text-muted-foreground">
                    <p>Última actualización: 31 de diciembre de 2025</p>
                </section>
            </div>
        </div>
    )
}
