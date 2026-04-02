'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Truck, Package, Clock, ChevronRight, Eye, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Mock data para pedidos
const pedidosMock = [
  {
    id: '1',
    numeroPedido: 'PED-2023-0001',
    estado: 'entregado',
    estadoLabel: 'Entregado',
    estadoColor: 'bg-green-100 text-green-800 border-green-200',
    subtotal: 2778.96,
    iva: 583.58,
    gastosEnvio: 0,
    total: 3362.54,
    fechaPedido: '2023-12-15',
    fechaEntrega: '2023-12-16',
    items: 3
  },
  {
    id: '2',
    numeroPedido: 'PED-2023-0002',
    estado: 'enviado',
    estadoLabel: 'Enviado',
    estadoColor: 'bg-blue-100 text-blue-800 border-blue-200',
    subtotal: 1099.99,
    iva: 230.90,
    gastosEnvio: 9.99,
    total: 1240.88,
    fechaPedido: '2023-12-20',
    fechaEnvio: '2023-12-21',
    items: 2
  },
  {
    id: '3',
    numeroPedido: 'PED-2023-0003',
    estado: 'pendiente',
    estadoLabel: 'Pendiente',
    estadoColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    subtotal: 599.99,
    iva: 125.90,
    gastosEnvio: 9.99,
    total: 735.88,
    fechaPedido: '2023-12-28',
    items: 1
  }
]

export default function MisPedidosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/mis-pedidos')
    } else if (status === 'authenticated') {
      fetchPedidos()
    }
  }, [status])

  const fetchPedidos = async () => {
    try {
      const res = await fetch('/api/pedidos')
      const data = await res.json()
      if (data.success) {
        setPedidos(data.data.pedidos)
      }
    } catch (error) {
      console.error('Error fetching pedidos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelarPedido = async (id: string) => {
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PUT'
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Pedido cancelado correctamente')
        fetchPedidos() // Recargar la lista
      } else {
        toast.error(data.error || 'No se pudo cancelar el pedido')
      }
    } catch (error) {
      console.error('Error canceling order:', error)
      toast.error('Error al cancelar el pedido')
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'entregado': return { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-200' }
      case 'enviado': return { label: 'Enviado', color: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'pendiente': return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
      case 'procesando': return { label: 'Procesando', color: 'bg-purple-100 text-purple-800 border-purple-200' }
      case 'cancelado': return { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' }
      default: return { label: estado, color: 'bg-gray-100' }
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-medium">Cargando tus pedidos...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Pedidos</h1>
            <p className="text-muted-foreground">
              Gestiona el historial de tus compras
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/tienda">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Nueva Compra
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const badge = getEstadoBadge(pedido.estado)
            const numItems = pedido.detalles?.length || 0

            return (
              <Card key={pedido.id} className="hover:shadow-lg transition-all border-none shadow-sm overflow-hidden">
                <div className={`h-1.5 w-full ${badge.color.split(' ')[0]}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl font-black">
                          {pedido.numeroPedido}
                        </CardTitle>
                        <Badge className={`${badge.color} px-4 py-1 rounded-full font-bold border-none`}>
                          {badge.label.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 font-medium">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>Pedido el {new Date(pedido.fechaPedido).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          <Package className="h-4 w-4 text-primary" />
                          <span>{numItems} {numItems === 1 ? 'producto' : 'productos'}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="rounded-full font-bold">
                      <Link href={`/mis-pedidos/${pedido.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        DETALLES
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between py-4 border-t border-dashed">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${pedido.fechaEnvio ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        <Truck className="h-6 w-6" />
                      </div>
                      <div className="text-sm">
                        {pedido.fechaEnvio ? (
                          <div className="space-y-0.5">
                            <p className="font-bold">Envío realizado el {new Date(pedido.fechaEnvio).toLocaleDateString()}</p>
                            {pedido.fechaEntrega && <p className="text-muted-foreground font-medium">Entrega estimada: {new Date(pedido.fechaEntrega).toLocaleDateString()}</p>}
                          </div>
                        ) : (
                          <p className="font-bold italic">
                            Tu pedido se está preparando con mimo...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Precio Total</p>
                      <p className="text-3xl font-black text-primary tracking-tight">{pedido.total.toFixed(2)}€</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t">
                    <div className="flex gap-2">
                      {pedido.estado === 'entregado' && (
                        <Button variant="secondary" size="sm" className="font-bold">
                          REPETIR COMPRA
                        </Button>
                      )}
                      {pedido.estado === 'pendiente' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
                          onClick={() => handleCancelarPedido(pedido.id)}
                        >
                          CANCELAR PEDIDO
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium italic">
                      ID Pago: {pedido.referenciaPago || 'Procesando...'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Estado vacío */}
        {pedidos.length === 0 && (
          <Card className="text-center py-20 border-none shadow-sm rounded-3xl">
            <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">PEDIDOS VACÍOS</h2>
            <p className="text-muted-foreground mb-8 text-lg font-medium px-4">
              Tu historial de compras está esperando a ser llenado. ¿Buscas algo nuevo?
            </p>
            <Button size="lg" asChild className="rounded-full px-10 h-14 font-bold shadow-xl">
              <Link href="/tienda">
                EXPLORAR LA TIENDA
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
