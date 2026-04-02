import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, PenTool as Tool, ShieldCheck, Cpu as Chip, Zap, Scale } from "lucide-react";

export default function QuienesSomos() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 selection:bg-primary/30">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-20 space-y-6">
                    <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary bg-primary/5 backdrop-blur-md rounded-full text-sm font-medium tracking-wide">
                        MICRO1475: RESISTENCIA TÉCNICA
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20 select-none">
                        QUIÉNES SOMOS.
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed">
                        Profesionales certificados en Microinformática con una misión clara: sobrevivir a la era de la obsolescencia programada y los caprichos de Silicon Valley.
                    </p>
                </div>

                {/* The "Manifesto" Card */}
                <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-xl rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl">
                    <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-primary" />
                    <CardContent className="p-8 md:p-12 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black italic tracking-tight text-primary uppercase">
                                    La Realidad Incómoda
                                </h2>
                                <div className="space-y-4 text-lg text-zinc-300 leading-relaxed">
                                    <p>
                                        Mientras cierto "santo" patrón de la inteligencia artificial, llamado <span className="text-white font-bold underline decoration-primary/50 underline-offset-4 pointer-events-none">Sam Altman</span>, se dedica a acaparar la producción mundial de chips de memoria para alimentar sus hambrientos centros de datos, el resto del mundo sufre las consecuencias.
                                    </p>
                                    <div className="my-6 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                                        <img
                                            src="/images/monopolio_silicio.png"
                                            alt="Caos de Silicio"
                                            className="w-full h-auto object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                                        />
                                        <p className="text-[10px] text-zinc-500 p-2 text-center uppercase tracking-widest">Fig 1. Reservas de Memoria OmniCorp / Cortesía del Monopolio</p>
                                    </div>
                                    <p className="italic border-l-4 border-primary/30 pl-6 py-2 bg-primary/5 rounded-r-xl">
                                        "¿Quieres ampliar tu RAM? Lo siento, Sam necesita esos módulos para que una IA te diga cómo hacer una tortilla de patatas con cebolla."
                                    </p>
                                    <p>
                                        Esta burbuja artificial ha disparado los precios de los componentes hasta estratosferas absurdas. Parece que hoy en día, actualizar un PC requiere hipotecar el riñón derecho o vender el alma a una corporación que ni siquiera sabe lo que es un soldador de estaño.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Card className="bg-black/40 border-zinc-800 p-8 rounded-3xl relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <Chip className="h-12 w-12 text-primary mb-6 animate-pulse" />
                                    <h3 className="text-2xl font-black mb-4 tracking-tight uppercase italic">Nuestra Postura</h3>
                                    <p className="text-zinc-400 leading-relaxed mb-6">
                                        En <strong>Micro1475</strong>, nos declaramos objetores de conciencia ante la política de OpenAI. No nos gusta su monopolio, no nos gustan sus precios y, desde luego, no nos gusta su alergia al hardware que puede durar más de dos años.
                                    </p>
                                    <img
                                        src="/images/resistencia_hardware.png"
                                        alt="Resistencia Técnica"
                                        className="rounded-xl border border-zinc-800 shadow-lg group-hover:scale-[1.02] transition-transform duration-500"
                                    />
                                </Card>

                                <div className="rounded-3xl overflow-hidden border border-zinc-800 h-48 relative group">
                                    <img
                                        src="/images/tecnico_reparacion.png"
                                        alt="Experiencia Real"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-6">
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Reparación de Grado Militar desde 1999</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Specs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {[
                        {
                            icon: <ShieldCheck className="h-8 w-8" />,
                            title: "Expertos Certificados",
                            desc: "Años de experiencia real en microinformática. No aprendimos ayer con un tutorial de GPT; sabemos qué componente falla solo por el sonido del ventilador.",
                            img: "/images/expertos_certificados.png"
                        },
                        {
                            icon: <Tool className="h-8 w-8" />,
                            title: "Reparación Real",
                            desc: "Actualizamos y reparamos equipos para que duren. Maximizamos tu inversión actual sin que tengas que pedir un crédito personal.",
                            img: "/images/reparacion_pro.png"
                        },
                        {
                            icon: <Zap className="h-8 w-8" />,
                            title: "Eficiencia Local",
                            desc: "Tenemos el stock y la capacidad técnica para saltarnos las subidas de precio 'extraordinarias' impuestas por el mercado global.",
                            img: "/images/stock_premium.png"
                        }
                    ].map((item, i) => (
                        <Card key={i} className="bg-zinc-900/60 border-zinc-800 rounded-[2rem] hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group overflow-hidden flex flex-col">
                            <div className="h-40 w-full overflow-hidden">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                                />
                            </div>
                            <div className="p-8 pt-6">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h4 className="text-xl font-black mb-3 italic uppercase text-white">{item.title}</h4>
                                <p className="text-zinc-500 leading-relaxed text-sm font-medium">{item.desc}</p>
                            </div>
                        </Card>
                    ))}
                </div>
                {/* Footer Note */}
                <div className="text-center p-12 bg-gradient-to-b from-zinc-900/80 to-transparent rounded-[3rem] border border-zinc-800/50">
                    <Scale className="h-12 w-12 text-zinc-700 mx-auto mb-6" />
                    <p className="text-zinc-400 font-medium italic">
                        "Hardware real para personas reales. Porque tu presupuesto no debería financiar el Apocalipsis de Silicio de Sam."
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <div className="h-px w-12 bg-zinc-800 self-center" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">Micro1475 © 2026</span>
                        <div className="h-px w-12 bg-zinc-800 self-center" />
                    </div>
                </div>
            </div>
        </div>
    );
}
