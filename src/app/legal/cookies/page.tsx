import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CookiesPage() {
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
                <h1 className="text-4xl font-bold mb-8">Política de Cookies</h1>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">¿Qué son las cookies?</h2>
                    <p>
                        Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web.
                        Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre
                        los hábitos de navegación de un usuario o de su equipo.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Tipos de cookies que utiliza este sitio</h2>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li><strong>Cookies técnicas:</strong> Necesarias para el funcionamiento del sitio (ej. sesiones).</li>
                        <li><strong>Cookies de personalización:</strong> Permiten recordar preferencias como el idioma.</li>
                        <li><strong>Cookies de análisis:</strong> Permiten cuantificar el número de usuarios y realizar mediciones estadísticas.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Gestión de cookies</h2>
                    <p>
                        Usted puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración
                        de las opciones del navegador instalado en su ordenador.
                    </p>
                </section>

                <section className="mb-12 text-sm text-muted-foreground">
                    <p>Última actualización: 31 de diciembre de 2025</p>
                </section>
            </div>
        </div>
    )
}
