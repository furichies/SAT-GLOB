'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  Keyboard,
  Headphones,
  ArrowRight,
  ShoppingCart,
  Star,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import { useCartStore } from '@/store/use-cart-store'
import { useToast } from '@/hooks/use-toast'
import { SupportChatbot } from '@/components/SupportChatbot'

const categories = [
  { id: '1', nombre: 'Ordenadores', icon: Monitor, imagen: '/images/categoria_ordenadores.png', productos: 45 },
  { id: '2', nombre: 'Componentes', icon: Cpu, imagen: '/images/categoria_componentes.png', productos: 128 },
  { id: '3', nombre: 'Almacenamiento', icon: HardDrive, imagen: '/images/categoria_almacenamiento.png', productos: 56 },
  { id: '4', nombre: 'Memoria RAM', icon: MemoryStick, imagen: '/images/categoria_ram.png', productos: 34 },
  { id: '5', nombre: 'Periféricos', icon: Keyboard, imagen: '/images/categoria_perifericos.png', productos: 89 },
  { id: '6', nombre: 'Audio', icon: Headphones, imagen: '/images/categoria_audio.png', productos: 42 },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/productos?destacado=true&porPagina=4')
      .then(res => res.json())
      .then(data => {
        if (data.success) setFeaturedProducts(data.data.productos)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero_banner.png" alt="Tech Store" fill className="object-cover opacity-30 saturate-150" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl space-y-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase">Expertos en Tecnología</Badge>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
              Hardware de <span className="text-primary">Élite</span> para Profesionales
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl font-medium">
              Venta de equipos de alto rendimiento y servicio técnico especializado con certificado de calidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/20" asChild>
                <Link href="/tienda">Explorar Catálogo <ArrowRight className="ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest border-2" asChild>
                <Link href="/sat">Servicio Técnico</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-24 bg-white/40 backdrop-blur-md">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Categorías Premium</h2>
              <p className="text-muted-foreground font-medium">Equípate con lo mejor de cada segmento.</p>
            </div>
            <Button variant="ghost" className="font-bold uppercase tracking-widest" asChild>
              <Link href="/tienda">Ver todo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link key={cat.id} href={`/tienda?categoria=${cat.id}`}>
                  <Card className="group border-none shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
                    <div className="relative h-40">
                      <Image src={cat.imagen} alt={cat.nombre} fill className="object-cover transition-transform duration-700 group-hover:scale-125" />
                      <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/0 transition-colors" />
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-black uppercase tracking-tighter text-sm">{cat.nombre}</h3>
                      <p className="text-xs font-bold text-primary mt-1">{cat.productos} Artículos</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Destacados */}
      <section className="py-24">
        <div className="container px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="border-primary text-primary font-black px-4 py-1">Top Selling</Badge>
            <h2 className="text-5xl font-black uppercase tracking-tighter">Equipos Destacados</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-[2.5rem]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((p) => <ProductCard key={p.id} producto={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Servicios Banner */}
      <section className="container px-4 py-24">
        <div className="relative rounded-[3rem] overflow-hidden bg-primary text-white p-12 md:p-24">
          <div className="absolute inset-0 opacity-10">
            <Image src="/images/hero_banner.png" alt="SAT" fill className="object-cover" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-8">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Reparación <br /> <span className="text-secondary">Profesional</span> SAT
            </h2>
            <p className="text-xl font-medium opacity-80">
              ¿Tu equipo va lento? ¿Pantalla rota? Nuestros técnicos certificados te devuelven la potencia en tiempo récord.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest" asChild>
                <Link href="/sat">Solicitar Reparación</Link>
              </Button>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 rounded-2xl border border-white/20">
                <div className="font-black text-2xl uppercase tracking-tighter">99.9% <span className="text-xs block font-bold opacity-60">Éxito Reparaciones</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SupportChatbot />
    </div>
  )
}

function ProductCard({ producto }: { producto: any }) {
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()
  const imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : (typeof producto.imagenes === 'string' ? JSON.parse(producto.imagenes) : [])
  const descuento = producto.precioOferta ? Math.round((1 - producto.precioOferta / producto.precio) * 100) : 0

  return (
    <Card className="group rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white/50 backdrop-blur-sm flex flex-col h-full">
      <div className="relative aspect-square bg-muted overflow-hidden">
        <Image src={imagenes[0] || '/placeholder.png'} alt={producto.nombre} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        {descuento > 0 && <Badge className="absolute top-6 left-6 bg-destructive text-white font-black px-4 py-2 rounded-full shadow-lg">-{descuento}%</Badge>}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <Button variant="secondary" className="translate-y-4 group-hover:translate-y-0 transition-transform font-black rounded-xl">VER DETALLES</Button>
        </div>
      </div>
      <CardContent className="p-8 flex-1 flex flex-col">
        <Link href={`/producto/${producto.id}`} className="hover:text-primary transition-colors flex-1 mb-4">
          <h3 className="font-black text-xl leading-tight uppercase tracking-tighter">{producto.nombre}</h3>
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex flex-col">
            <span className="text-sm font-bold opacity-40 uppercase tracking-widest">Precio</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-primary tracking-tighter">{(producto.precioOferta || producto.precio).toFixed(2)}€</span>
              {descuento > 0 && <span className="text-sm text-muted-foreground line-through font-bold">{producto.precio.toFixed(2)}€</span>}
            </div>
          </div>
        </div>
        <Button onClick={() => {
          addItem({ id: producto.id, nombre: producto.nombre, precio: producto.precioOferta || producto.precio, imagen: imagenes[0], cantidad: 1 });
          toast({ title: "¡ELEGIDO!", description: `${producto.nombre} añadido.` });
        }} className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
          <ShoppingCart className="h-5 w-5 mr-3" />
          Añadir al Carrito
        </Button>
      </CardContent>
    </Card>
  )
}
