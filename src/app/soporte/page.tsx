import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MessageSquare, Clock } from 'lucide-react'
import Link from 'next/link'

export default function SoportePage() {
    return (
        <div className="container py-12 md:py-20">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Centro de Soporte</h1>
                    <p className="text-lg text-muted-foreground">
                        Estamos aquí para ayudarte. Elige el método que mejor se adapte a tus necesidades.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <CardTitle>Soporte Técnico (SAT)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-6">
                                ¿Tienes un problema con tu equipo? Abre un ticket de soporte y nuestros técnicos te contactarán.
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/sat/nuevo">Crear Nuevo Ticket</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                                <Phone className="h-6 w-6" />
                            </div>
                            <CardTitle>Atención Telefónica</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-6">
                                Llámanos directamente para consultas rápidas sobre tus pedidos o servicios técnicos.
                            </p>
                            <div className="flex flex-col gap-2">
                                <p className="text-xl font-bold">+34 912 345 678</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Lunes a Viernes, 9:00 - 18:00</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-muted/50 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">¿Prefieres escribirnos?</h2>
                    <p className="text-muted-foreground mb-6">
                        Envíanos un correo electrónico y te responderemos en menos de 24 horas laborables.
                    </p>
                    <Button variant="outline" asChild className="gap-2">
                        <a href="mailto:soporte@microinfo.es">
                            <Mail className="h-4 w-4" />
                            soporte@microinfo.es
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    )
}
