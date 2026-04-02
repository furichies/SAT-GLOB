'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Monitor,
    Cpu,
    Database,
    HardDrive,
    Wind,
    Zap,
    Box,
    ChevronRight,
    ChevronLeft,
    ShoppingCart,
    CheckCircle2,
    AlertCircle,
    MemoryStick
} from "lucide-react"
import { useCartStore } from '@/store/use-cart-store'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

// Tipos
interface Componente {
    id: string;
    nombre: string;
    marca: string;
    precio: number;
    tipo: string;
    especificaciones?: string;
}

// Datos de Componentes
const COMPONENTES: Record<string, Componente[]> = {
    procesador: [
        { id: 'cpu-1', marca: 'Intel', nombre: 'Core i9-14900K 6.0GHz', precio: 629.90, tipo: 'procesador' },
        { id: 'cpu-2', marca: 'AMD', nombre: 'Ryzen 9 9950X 5.7GHz', precio: 749.00, tipo: 'procesador' },
        { id: 'cpu-3', marca: 'Intel', nombre: 'Core i7-14700K 5.6GHz', precio: 439.00, tipo: 'procesador' },
        { id: 'cpu-4', marca: 'AMD', nombre: 'Ryzen 7 9700X 5.5GHz', precio: 399.00, tipo: 'procesador' },
        { id: 'cpu-5', marca: 'Intel', nombre: 'Core i5-13400F 4.6GHz', precio: 219.00, tipo: 'procesador' },
        { id: 'cpu-6', marca: 'AMD', nombre: 'Ryzen 5 7600X 5.3GHz', precio: 229.00, tipo: 'procesador' },
    ],
    placa_base: [
        { id: 'mb-1', marca: 'ASUS', nombre: 'ROG MAXIMUS Z790 DARK HERO', precio: 719.00, tipo: 'placa_base' },
        { id: 'mb-2', marca: 'MSI', nombre: 'MPG X670E CARBON WIFI', precio: 459.00, tipo: 'placa_base' },
        { id: 'mb-3', marca: 'Gigabyte', nombre: 'Z790 AORUS ELITE AX', precio: 279.00, tipo: 'placa_base' },
        { id: 'mb-4', marca: 'ASRock', nombre: 'B650M Pro RS WiFi', precio: 159.00, tipo: 'placa_base' },
        { id: 'mb-5', marca: 'MSI', nombre: 'MAG B760 TOMAHAWK WIFI', precio: 199.00, tipo: 'placa_base' },
    ],
    memoria: [
        { id: 'ram-1', marca: 'Corsair', nombre: 'Vengeance RGB DDR5 6000MHz 32GB (2x16GB)', precio: 139.90, tipo: 'memoria' },
        { id: 'ram-2', marca: 'G.Skill', nombre: 'Trident Z5 Neo RGB DDR5 6400MHz 64GB (2x32GB)', precio: 259.00, tipo: 'memoria' },
        { id: 'ram-3', marca: 'Kingston', nombre: 'FURY Beast DDR5 5200MHz 16GB (2x8GB)', precio: 74.00, tipo: 'memoria' },
        { id: 'ram-4', marca: 'Corsair', nombre: 'Vengeance LPX DDR4 3200MHz 16GB (2x8GB)', precio: 45.00, tipo: 'memoria' },
    ],
    disco_m2: [
        { id: 'm2-1', marca: 'Samsung', nombre: '990 Pro 2TB NVMe PCIe 4.0', precio: 189.00, tipo: 'disco_m2' },
        { id: 'm2-2', marca: 'WD', nombre: 'Black SN850X 1TB NVMe PCIe 4.0', precio: 99.00, tipo: 'disco_m2' },
        { id: 'm2-3', marca: 'Crucial', nombre: 'T700 2TB NVMe PCIe 5.0 (Extreme Speed)', precio: 329.00, tipo: 'disco_m2' },
        { id: 'm2-4', marca: 'Kioxia', nombre: 'Exceria Plus G3 1TB NVMe', precio: 69.00, tipo: 'disco_m2' },
    ],
    disco_hdd: [
        { id: 'hdd-1', marca: 'Seagate', nombre: 'BarraCuda 2TB 3.5" 7200rpm', precio: 64.00, tipo: 'disco_hdd' },
        { id: 'hdd-2', marca: 'WD', nombre: 'Blue 4TB 3.5" 5400rpm', precio: 109.00, tipo: 'disco_hdd' },
        { id: 'hdd-3', marca: 'Seagate', nombre: 'IronWolf 8TB NAS 7200rpm', precio: 229.00, tipo: 'disco_hdd' },
        { id: 'hdd-4', marca: 'N/A', nombre: 'Sin disco mecánico adicional', precio: 0, tipo: 'disco_hdd' },
    ],
    fuente: [
        { id: 'psu-1', marca: 'Corsair', nombre: 'RM850e 850W 80+ Gold Modular ATX 3.0', precio: 124.00, tipo: 'fuente' },
        { id: 'psu-2', marca: 'Seasonical', nombre: 'Focus GX-1000 1000W 80+ Gold Full Modular', precio: 179.00, tipo: 'fuente' },
        { id: 'psu-3', marca: 'MSI', nombre: 'MAG A650BN 650W 80+ Bronze', precio: 59.00, tipo: 'fuente' },
        { id: 'psu-4', marca: 'Be Quiet!', nombre: 'Dark Power 13 1000W 80+ Titanium ATX 3.0', precio: 289.00, tipo: 'fuente' },
    ],
    caja: [
        { id: 'case-1', marca: 'Corsair', nombre: '4000D Airflow Tempered Glass Black', precio: 94.00, tipo: 'caja' },
        { id: 'case-2', marca: 'Lian Li', nombre: 'PC-O11 Dynamic EVO White', precio: 169.00, tipo: 'caja' },
        { id: 'case-3', marca: 'NZXT', nombre: 'H5 Flow Compact Mid-Tower', precio: 89.00, tipo: 'caja' },
        { id: 'case-4', marca: 'Phanteks', nombre: 'NV7 Showpiece Full Tower', precio: 219.00, tipo: 'caja' },
    ],
    cooler: [
        { id: 'cool-1', marca: 'Corsair', nombre: 'iCUE H150i ELITE CAPELLIX XT 360mm', precio: 194.00, tipo: 'cooler' },
        { id: 'cool-2', marca: 'NZXT', nombre: 'Kraken Elite 360 RGB LCD Display', precio: 299.00, tipo: 'cooler' },
        { id: 'cool-3', marca: 'DeepCool', nombre: 'LS720 360mm Liquid Cooler', precio: 129.00, tipo: 'cooler' },
        { id: 'cool-4', marca: 'Arctic', nombre: 'Liquid Freezer III 240mm', precio: 79.00, tipo: 'cooler' },
        { id: 'cool-5', marca: 'Cooler Master', nombre: 'Hyper 212 Halo Black (Aire)', precio: 39.00, tipo: 'cooler' },
    ],
}

const CATEGORIES = [
    { id: 'procesador', name: 'Procesador', icon: <Cpu className="h-5 w-5" /> },
    { id: 'placa_base', name: 'Placa Base', icon: <Box className="h-5 w-5" /> },
    { id: 'memoria', name: 'Memoria RAM', icon: <MemoryStick className="h-5 w-5" /> },
    { id: 'disco_m2', name: 'Disco M.2 NVMe', icon: <Zap className="h-5 w-5" /> },
    { id: 'disco_hdd', name: 'Disco HDD', icon: <HardDrive className="h-5 w-5" /> },
    { id: 'fuente', name: 'Fuente Alimentación', icon: <Zap className="h-5 w-5" /> },
    { id: 'caja', name: 'Caja / Torre', icon: <Monitor className="h-5 w-5" /> },
    { id: 'cooler', name: 'Refrigeración', icon: <Wind className="h-5 w-5" /> },
]

export default function ConfiguradorPC() {
    const [selected, setSelected] = useState<Record<string, Componente | null>>({
        procesador: null,
        placa_base: null,
        memoria: null,
        disco_m2: null,
        disco_hdd: null,
        fuente: null,
        caja: null,
        cooler: null,
    })

    const [activeStep, setActiveStep] = useState(0)
    const [isMounted, setIsMounted] = useState(false)

    const addItem = useCartStore((state) => state.addItem)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleSelect = (category: string, item: Componente) => {
        setSelected(prev => ({ ...prev, [category]: item }))
        if (activeStep < CATEGORIES.length - 1) {
            setTimeout(() => setActiveStep(activeStep + 1), 300)
        }
    }

    const totalPrice = useMemo(() => {
        return Object.values(selected).reduce((acc, curr) => acc + (curr?.precio || 0), 0)
    }, [selected])

    const handleFinalizeBuild = () => {
        if (!isComplete) {
            toast({
                title: "Configuración incompleta",
                description: "Por favor, selecciona todos los componentes antes de finalizar.",
                variant: "destructive"
            })
            return
        }

        // Crear un ID único para esta configuración basado en los componentes
        const configId = `custom-pc-${Object.values(selected).map(c => c?.id).join('-')}`

        // Crear el objeto del pack para el carrito
        const pack = {
            id: configId,
            nombre: "Configuración Personalizada Micro1475 (Pack)",
            precio: totalPrice,
            imagen: "/images/categoria_ordenadores.png", // Imagen genérica de PC
            cantidad: 1,
            descripcion: `PC Custom: ${Object.values(selected).map(c => c?.nombre).join(', ')}`
        }

        addItem(pack)

        toast({
            title: "¡Build Añadida!",
            description: "Tu configuración personalizada ha sido añadida al carrito.",
        })

        router.push('/carrito')
    }

    const currentCategory = CATEGORIES[activeStep]
    const isComplete = Object.values(selected).every(v => v !== null)

    if (!isMounted) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background pt-24 pb-12 px-4 selection:bg-primary/30">
            <div className="max-w-7xl mx-auto">

                {/* Header configurador */}
                <div className="mb-12 space-y-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-1 rounded-full font-black text-xs tracking-widest uppercase">
                        Build Assistant v2.5
                    </Badge>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                            Configura tu <span className="text-primary italic">Máquina</span>
                        </h1>
                        <p className="text-muted-foreground font-medium max-w-sm">
                            Selecciona componentes certificados por Micro1475. Garantía de compatibilidad total y montaje profesional incluido.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Sidebar - Pasos */}
                    <div className="lg:col-span-3 space-y-4 h-full">
                        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-28">
                            <div className="p-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Progreso</h3>
                                <div className="space-y-2">
                                    {CATEGORIES.map((cat, idx) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveStep(idx)}
                                            className={`w-full group flex items-center justify-between p-4 rounded-2xl transition-all duration-500 border-2 ${activeStep === idx
                                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                                : selected[cat.id]
                                                    ? 'bg-white/80 dark:bg-zinc-800/80 border-primary/20 text-foreground'
                                                    : 'bg-transparent border-transparent text-muted-foreground hover:bg-primary/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`transition-colors ${activeStep === idx ? 'text-primary-foreground' : (selected[cat.id] ? 'text-primary' : 'text-muted-foreground')}`}>
                                                    {cat.icon}
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-tight">{cat.name}</span>
                                            </div>
                                            {selected[cat.id] && <CheckCircle2 className={`h-4 w-4 ${activeStep === idx ? 'text-primary-foreground' : 'text-primary'}`} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Selection Area */}
                    <div className="lg:col-span-6 space-y-8 min-h-[600px]">
                        <div className="flex items-center gap-4 bg-white/30 dark:bg-zinc-800/30 backdrop-blur-md p-6 rounded-[2rem] border border-primary/10">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 shrink-0">
                                {currentCategory.icon}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Seleccionando</p>
                                <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{currentCategory.name}</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {COMPONENTES[currentCategory.id].map((item) => (
                                <Card
                                    key={item.id}
                                    onClick={() => handleSelect(currentCategory.id, item)}
                                    className={`cursor-pointer group relative overflow-hidden transition-all duration-500 rounded-[2rem] border-2 flex flex-col sm:flex-row sm:items-center justify-between shadow-xl ${selected[currentCategory.id]?.id === item.id
                                        ? 'bg-primary border-primary shadow-primary/20 scale-[1.02]'
                                        : 'bg-white/60 dark:bg-zinc-900/60 border-transparent hover:border-primary/30 backdrop-blur-sm'
                                        }`}
                                >
                                    <div className="p-8 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`px-4 py-1 rounded-full font-black text-[10px] tracking-widest uppercase border-primary/20 ${selected[currentCategory.id]?.id === item.id ? 'bg-primary-foreground/20 text-primary-foreground border-white/20' : 'text-muted-foreground'}`}>
                                                {item.marca}
                                            </Badge>
                                            {selected[currentCategory.id]?.id === item.id && (
                                                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                            )}
                                        </div>
                                        <h3 className={`text-xl font-black italic uppercase tracking-tighter leading-none transition-colors ${selected[currentCategory.id]?.id === item.id ? 'text-primary-foreground' : 'text-foreground'}`}>
                                            {item.nombre}
                                        </h3>
                                    </div>
                                    <div className={`p-8 w-full sm:w-auto flex flex-col items-start sm:items-end justify-center sm:border-l ${selected[currentCategory.id]?.id === item.id ? 'sm:border-white/10' : 'sm:border-primary/5'}`}>
                                        <span className={`text-4xl font-black tracking-tighter italic ${selected[currentCategory.id]?.id === item.id ? 'text-primary-foreground' : 'text-primary'}`}>
                                            {item.precio > 0 ? `${item.precio.toFixed(2)}€` : 'GRATIS'}
                                        </span>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ${selected[currentCategory.id]?.id === item.id ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                            IVA Incluido
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-8">
                            <Button
                                variant="ghost"
                                className="h-16 px-8 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary/5"
                                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                                disabled={activeStep === 0}
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" /> Regresar
                            </Button>
                            {activeStep < CATEGORIES.length - 1 ? (
                                <Button
                                    className="h-16 px-12 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/20"
                                    onClick={() => setActiveStep(prev => prev + 1)}
                                    disabled={!selected[currentCategory.id]}
                                >
                                    Continuar <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            ) : (
                                <Button
                                    className="h-16 px-12 rounded-2xl text-sm font-black uppercase tracking-widest bg-green-600 hover:bg-green-500 shadow-2xl shadow-green-900/20"
                                    disabled={!isComplete}
                                    onClick={handleFinalizeBuild}
                                >
                                    Finalizar Build <ShoppingCart className="ml-2 h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Resumen & Total */}
                    <div className="lg:col-span-3">
                        <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden sticky top-28">
                            <div className="h-3 bg-primary w-full shadow-lg shadow-primary/20" />
                            <div className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Configuración</h3>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Resumen</h2>
                                </div>

                                <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                                    {CATEGORIES.map(cat => (
                                        <div key={cat.id} className="group flex flex-col gap-1">
                                            <p className="text-[10px] uppercase font-black text-primary tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{cat.name}</p>
                                            <div className="flex justify-between items-start gap-4 leading-tight">
                                                <p className={`text-xs font-black uppercase tracking-tight ${selected[cat.id] ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                                                    {selected[cat.id]?.nombre || 'Pendiente...'}
                                                </p>
                                                {selected[cat.id] && (
                                                    <span className="text-xs font-black text-primary italic shrink-0">
                                                        {selected[cat.id]!.precio.toFixed(2)}€
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-primary/10 space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Presupuesto Estimado</span>
                                        <span className="text-5xl font-black text-primary tracking-tighter leading-none italic">{totalPrice.toFixed(2)}€</span>
                                    </div>

                                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-3">
                                        <div className="flex items-center gap-2 text-primary">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Sello Micro1475</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-wider">
                                            Montaje premium, ventilación optimizada y tests de estrés incluidos en el precio.
                                        </p>
                                    </div>

                                    <Button
                                        className="w-full h-16 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-transform active:scale-95"
                                        disabled={!isComplete}
                                        onClick={handleFinalizeBuild}
                                    >
                                        Confirmar Pack
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
