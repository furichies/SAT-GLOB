'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import { useCartStore } from '@/store/use-cart-store'
import { useToast } from '@/hooks/use-toast'

export default function ProductoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const addItem = useCartStore((state) => state.addItem)

  const [producto, setProducto] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cantidad, setCantidad] = useState(1)
  const [imagenActiva, setImagenActiva] = useState(0)
  const [tabActiva, setTabActiva] = useState('descripcion')

  useEffect(() => {
    if (params.id) {
      fetch(`/api/productos/${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProducto(data.data.producto)
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="min-h-screen py-16 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <Button onClick={() => router.push('/tienda')}>Volver a la tienda</Button>
      </div>
    )
  }

  const especificaciones = typeof producto.especificaciones === 'string'
    ? JSON.parse(producto.especificaciones)
    : producto.especificaciones || {}

  const imagenes = Array.isArray(producto.imagenes)
    ? producto.imagenes
    : (typeof producto.imagenes === 'string' ? JSON.parse(producto.imagenes) : ['/placeholder.png'])

  const descuento = producto.precioOferta
    ? Math.round((1 - producto.precioOferta / producto.precio) * 100)
    : 0

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container px-4">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <nav className="flex items-center text-sm text-muted-foreground font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <span className="mx-2 opacity-50">/</span>
            <Link href="/tienda" className="hover:text-primary transition-colors">Tienda</Link>
            <span className="mx-2 opacity-50">/</span>
            <span className="text-foreground">{producto.nombre}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white shadow-2xl border border-primary/5 group">
              <Image
                src={imagenes[imagenActiva]}
                alt={producto.nombre}
                fill
                className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                priority
              />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/50 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
                {imagenes.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setImagenActiva(index)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${imagenActiva === index ? 'border-primary scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                  >
                    <Image src={img} alt={`Vista ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <Tabs value={tabActiva} onValueChange={setTabActiva} className="w-full">
              <TabsList className="w-full h-14 bg-background/50 backdrop-blur-sm p-1 rounded-2xl border border-primary/10">
                <TabsTrigger value="descripcion" className="flex-1 rounded-xl font-bold uppercase tracking-widest text-xs">Descripción</TabsTrigger>
                <TabsTrigger value="especificaciones" className="flex-1 rounded-xl font-bold uppercase tracking-widest text-xs">Especificaciones</TabsTrigger>
              </TabsList>

              <TabsContent value="descripcion" className="mt-8">
                <div className="prose prose-slate max-w-none bg-background/50 backdrop-blur-sm p-8 rounded-3xl border border-primary/5">
                  <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter">Sobre este equipo</h2>
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {producto.descripcion || producto.descripcionCorta}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="especificaciones" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(especificaciones).map(([clave, valor]) => (
                    <div key={clave} className="bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/5 group hover:border-primary/20 transition-all shadow-sm">
                      <h4 className="font-bold text-xs uppercase tracking-widest text-primary/60 mb-1">{clave}</h4>
                      <p className="font-medium">{valor as string}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-primary/10 shadow-2xl overflow-hidden bg-background/50 backdrop-blur-xl">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-primary/10 text-primary border-none font-bold px-4 py-1.5">{producto.marca}</Badge>
                    {descuento > 0 && <Badge className="bg-destructive text-white border-none font-black animate-pulse">-{descuento}%</Badge>}
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">{producto.nombre}</h1>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-4 w-4 ${i <= 5 ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />)}
                    </div>
                    <span className="text-sm font-bold">(128 opiniones)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {producto.precioOferta ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-muted-foreground line-through decoration-destructive decoration-2">{producto.precio.toFixed(2)}€</span>
                      <span className="text-5xl font-black text-primary tracking-tighter">{producto.precioOferta.toFixed(2)}€</span>
                    </div>
                  ) : (
                    <span className="text-5xl font-black text-primary tracking-tighter">{producto.precio.toFixed(2)}€</span>
                  )}
                </div>

                <Separator className="bg-primary/5" />

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${producto.stock > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      {producto.stock > 0 ? <Check className="h-4 w-4 text-green-600" /> : <Minus className="h-4 w-4 text-red-600" />}
                    </div>
                    <span className="font-bold">{producto.stock > 0 ? `${producto.stock} unidades en stock` : 'Agotado temporalmente'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10"><Truck className="h-4 w-4 text-primary" /></div>
                    <span className="font-bold">Envío Express Gratis <span className="text-muted-foreground font-normal">(24/48h)</span></span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-primary/5 p-2 rounded-2xl border border-primary/10">
                    <Button
                      variant="ghost" size="icon" className="h-12 w-12 rounded-xl"
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      disabled={cantidad <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-black w-12 text-center">{cantidad}</span>
                    <Button
                      variant="ghost" size="icon" className="h-12 w-12 rounded-xl"
                      onClick={() => setCantidad(cantidad + 1)}
                      disabled={cantidad >= (producto.stock || 99)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    size="lg" className="w-full h-20 rounded-3xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all"
                    disabled={producto.stock === 0}
                    onClick={() => {
                      addItem({
                        id: producto.id,
                        nombre: producto.nombre,
                        precio: producto.precioOferta || producto.precio,
                        imagen: imagenes[0],
                        cantidad: cantidad
                      });
                      toast({
                        title: "🛒 AÑADIDO AL CARRITO",
                        description: `Se han añadido ${cantidad} unidad(es) de ${producto.nombre}`
                      });
                    }}
                  >
                    <ShoppingCart className="h-6 w-6 mr-3" />
                    Comprar Ahora
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <div className="p-4 rounded-3xl bg-background/50 backdrop-blur-sm border border-primary/10 flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-primary/5 rounded-2xl"><Shield className="h-5 w-5 text-primary" /></div>
                <div className="text-xs uppercase font-black tracking-widest text-muted-foreground">3 Años de Garantía oficial</div>
              </div>
              <div className="p-4 rounded-3xl bg-background/50 backdrop-blur-sm border border-primary/10 flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-primary/5 rounded-2xl"><RotateCcw className="h-5 w-5 text-primary" /></div>
                <div className="text-xs uppercase font-black tracking-widest text-muted-foreground">Devolución gratuita 30 días</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
