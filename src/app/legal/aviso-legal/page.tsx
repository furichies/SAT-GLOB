import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AvisoLegalPage() {
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
                <h1 className="text-4xl font-bold mb-8">Aviso Legal</h1>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Datos Identificativos</h2>
                    <p>
                        En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio,
                        de Servicios de la Sociedad de la Información y del Comercio Electrónico, a continuación se reflejan
                        los siguientes datos:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li><strong>Titular:</strong> MicroInfo Shop S.L.</li>
                        <li><strong>NIF:</strong> B-12345678</li>
                        <li><strong>Domicilio Social:</strong> Calle Arcas del Agua, 2 (Sector 3) 28905 Getafe (Madrid)</li>
                        <li><strong>Correo electrónico:</strong> superadmin@microinfo.es</li>
                        <li><strong>Teléfono:</strong> +34 912 345 678</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Usuarios</h2>
                    <p>
                        El acceso y/o uso de este portal de MicroInfo atribuye la condición de USUARIO, que acepta, desde dicho
                        acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Uso del Portal</h2>
                    <p>
                        MicroInfo proporciona el acceso a multitud de informaciones, servicios, programas o datos en Internet
                        pertenecientes a MicroInfo o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO
                        asume la responsabilidad del uso del portal. Dicha responsabilidad se extiende al registro que fuese
                        necesario para acceder a determinados servicios o contenidos.
                    </p>
                </section>

                <section className="mb-12 text-sm text-muted-foreground">
                    <p>Última actualización: 31 de diciembre de 2025</p>
                </section>
            </div>
        </div>
    )
}
