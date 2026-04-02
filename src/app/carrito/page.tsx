'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Trash2,
  ShoppingBag,
  Truck,
  Shield,
  ArrowRight,
  Minus,
  Plus,
  CreditCard
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/use-cart-store'
import { productosMock } from '@/lib/data/productos'

const gastosEnvio = {
  standard: 0,
  express: 9.99,
  premium: 19.99
}

const impuestoIVA = 0.21

function PayPalOverlay({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  const triggered = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((v) => {
        if (v >= 100) {
          clearInterval(interval)
          if (!triggered.current) {
            triggered.current = true
            setTimeout(onComplete, 500)
          }
          return 100
        }
        return v + 2
      })
    }, 50)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-3xl">
        <div className="bg-[#003087] p-8 flex flex-col items-center">
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-[#009cde] border-t-transparent animate-spin"
              style={{ animationDuration: '1s' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-black text-2xl italic tracking-tighter">Pay<span className="text-[#009cde]">Pal</span></span>
            </div>
          </div>
          <h3 className="text-white text-2xl font-black mb-2 tracking-tight">Procesando Pago Seguro</h3>
          <p className="text-white/60 text-sm font-medium">Estamos conectando con los servidores de PayPal...</p>
        </div>
        <CardContent className="p-10 space-y-8 bg-white">
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-black uppercase text-gray-400">Progreso de la transacción</span>
              <span className="text-primary font-black text-lg">{progress}%</span>
            </div>
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden border">
              <div
                className="h-full bg-gradient-to-r from-[#003087] to-[#009cde] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`h-2 w-full rounded-full ${progress > (i * 30) ? 'bg-green-500' : 'bg-gray-100'}`} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Paso {i}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CarritoPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPayPal, setShowPayPal] = useState(false)
  const [dbProducts, setDbProducts] = useState<any[]>([])

  const cartItems = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)

  const [metodoEnvio, setMetodoEnvio] = useState('standard')
  const [datosEnvio, setDatosEnvio] = useState({
    nombre: '',
    apellidos: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    provincia: '',
    telefono: ''
  })

  useEffect(() => {
    setIsMounted(true)
    fetch('/api/productos?porPagina=100')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDbProducts(data.data.productos)
      })
  }, [])

  useEffect(() => {
    const fetchProfileData = async () => {
      if (session?.user) {
        try {
          const res = await fetch('/api/auth/profile')
          const data = await res.json()

          if (data.success && data.data.user) {
            setDatosEnvio({
              nombre: data.data.user.nombre || session.user.name || '',
              apellidos: data.data.user.apellidos || '',
              direccion: data.data.user.direccion || '',
              codigoPostal: data.data.user.codigoPostal || '',
              ciudad: data.data.user.ciudad || '',
              provincia: data.data.user.provincia || '',
              telefono: data.data.user.telefono || ''
            })
          } else {
            // Fallback to session data if API fails
            setDatosEnvio({
              nombre: session.user.name || '',
              apellidos: (session.user as any).apellidos || '',
              direccion: (session.user as any).direccion || '',
              codigoPostal: (session.user as any).codigoPostal || '',
              ciudad: (session.user as any).ciudad || '',
              provincia: (session.user as any).provincia || '',
              telefono: (session.user as any).telefono || ''
            })
          }
        } catch (error) {
          console.error("Error fetching profile for cart:", error)
        }
      }
    }

    if (session?.user) {
      fetchProfileData()
    }
  }, [session])

  const enrichedItems = cartItems.map(item => {
    const productDetail = dbProducts.find(p => p.id === item.id) || productosMock.find(p => p.id === item.id)
    return {
      ...item,
      producto: productDetail || {
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        stock: 99,
        imagenes: [item.imagen]
      }
    }
  })

  const calcularTotal = () => {
    const subtotal = enrichedItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    const iva = subtotal * impuestoIVA
    const envio = gastosEnvio[metodoEnvio as keyof typeof gastosEnvio] || 0
    const total = subtotal + iva + envio
    return { subtotal, iva, envio, total }
  }

  const total = calcularTotal()

  const handleCantidadChange = (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return
    const product = dbProducts.find(p => p.id === id) || productosMock.find(p => p.id === id)
    if (product && nuevaCantidad > product.stock) return
    updateQuantity(id, nuevaCantidad)
  }

  const handleEliminarItem = (id: string) => removeItem(id)
  const handleMetodoEnvioChange = (metodo: string) => setMetodoEnvio(metodo)
  const handleDatosEnvioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatosEnvio({ ...datosEnvio, [e.target.name]: e.target.value })
  }

  const finalizarCompra = async () => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/carrito')
      return
    }
    if (!datosEnvio.nombre || !datosEnvio.direccion || !datosEnvio.codigoPostal || !datosEnvio.telefono) {
      alert('Por favor, completa los datos de envío obligatorios.')
      return
    }
    setShowPayPal(true)
  }

  const procesarPedidoReal = useCallback(async () => {
    if (isSubmitting) return
    setShowPayPal(false)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(i => {
            const fresh = dbProducts.find(p => p.id === i.id)
            return {
              ...i,
              nombre: fresh?.nombre || i.nombre,
              precio: fresh?.precioOferta || fresh?.precio || i.precio
            }
          }),
          direccionEnvio: datosEnvio,
          metodoEnvio: metodoEnvio,
          metodoPago: 'paypal',
          subtotal: total.subtotal,
          iva: total.iva,
          gastosEnvio: total.envio,
          total: total.total
        })
      })

      const data = await res.json()
      if (data.success) {
        clearCart()
        router.push('/mis-pedidos')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error finalizando compra:', error)
      alert('Ha ocurrido un error al procesar tu pedido.')
    } finally {
      setIsSubmitting(false)
    }
  }, [cartItems, dbProducts, datosEnvio, metodoEnvio, total, clearCart, router, isSubmitting])

  if (!isMounted) return null

  if (enrichedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Tu Carrito Está Vacío</h1>
          <p className="text-gray-600 mb-6">No tienes productos en tu carrito.</p>
          <Button onClick={() => router.push('/')} className="w-full">Volver a la Tienda</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      {showPayPal && <PayPalOverlay onComplete={procesarPedidoReal} />}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Volver a la Tienda
          </Button>
          <h1 className="text-3xl font-bold">Mi Carrito</h1>
          <p className="text-gray-600">{enrichedItems.length} artículos</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {enrichedItems.map((item) => {
              const producto = item.producto
              const itemImage = producto.imagenes?.[0] || '/placeholder.png'
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="relative h-24 w-24 bg-gray-100 rounded overflow-hidden flex-shrink-0 border">
                            <Image src={itemImage} alt={item.nombre} fill className="object-cover" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-lg">{item.nombre}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Marca: {producto.marca || 'N/A'}</span>
                              <span className={producto.stock < 5 ? 'text-red-600 font-bold' : 'text-green-600'}>Stock: {producto.stock} uds</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-4">
                        <p className="text-xl font-bold">{item.precio.toFixed(2)}€</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleCantidadChange(item.id, item.cantidad - 1)} className="w-8 h-8 border rounded">-</button>
                          <span>{item.cantidad}</span>
                          <button onClick={() => handleCantidadChange(item.id, item.cantidad + 1)} className="w-8 h-8 border rounded">+</button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleEliminarItem(item.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Resumen del Pedido</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Método de Envío</Label>
                  <button onClick={() => handleMetodoEnvioChange('standard')} className={`w-full p-4 border rounded-lg text-left ${metodoEnvio === 'standard' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Estándar</span>
                      <span>Gratis</span>
                    </div>
                    <p className="text-xs text-muted-foreground">3-5 días laborables</p>
                  </button>
                  <button onClick={() => handleMetodoEnvioChange('express')} className={`w-full p-4 border rounded-lg text-left ${metodoEnvio === 'express' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Express (24h)</span>
                      <span>9.99€</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Entrega mañana</p>
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Dirección de Envío</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input name="nombre" placeholder="Nombre" value={datosEnvio.nombre} onChange={handleDatosEnvioChange} />
                    <Input name="apellidos" placeholder="Apellidos" value={datosEnvio.apellidos} onChange={handleDatosEnvioChange} />
                  </div>
                  <Input name="direccion" placeholder="Dirección completa" value={datosEnvio.direccion} onChange={handleDatosEnvioChange} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input name="codigoPostal" placeholder="C.P." value={datosEnvio.codigoPostal} onChange={handleDatosEnvioChange} />
                    <Input name="ciudad" placeholder="Ciudad" value={datosEnvio.ciudad} onChange={handleDatosEnvioChange} />
                  </div>
                  <Input name="telefono" placeholder="Teléfono" value={datosEnvio.telefono} onChange={handleDatosEnvioChange} />
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span>{total.subtotal.toFixed(2)}€</span></div>
                  <div className="flex justify-between text-sm"><span>IVA (21%)</span><span>{total.iva.toFixed(2)}€</span></div>
                  <div className="flex justify-between text-sm"><span>Envío</span><span>{total.envio.toFixed(2)}€</span></div>
                  <div className="flex justify-between text-xl font-black text-primary pt-2"><span>TOTAL</span><span>{total.total.toFixed(2)}€</span></div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full h-14 text-lg font-black rounded-2xl" onClick={finalizarCompra} disabled={isSubmitting}>
                  {isSubmitting ? 'PROCESANDO...' : 'FINALIZAR Y PAGAR'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
