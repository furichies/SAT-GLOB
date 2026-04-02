'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Slider,
  SliderSingleThumb,
} from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Star,
  ShoppingCart,
  Filter,
  Search,
  Grid,
  List,
  X,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import { useCartStore } from '@/store/use-cart-store'
import { useToast } from '@/hooks/use-toast'

const marcas = ['Asus', 'Samsung', 'Corsair', 'Logitech', 'Razer', 'Intel', 'NVIDIA', 'Sennheiser', 'Seagate', 'Kingston']

const tiposProductos = [
  { value: 'equipo_completo', label: 'Equipos Completos' },
  { value: 'componente', label: 'Componentes' },
  { value: 'periferico', label: 'Periféricos' },
]

const ordenarPor = [
  { value: 'novedad', label: 'Novedad' },
  { value: 'precio_asc', label: 'Precio: Menor a Mayor' },
  { value: 'precio_desc', label: 'Precio: Mayor a Menor' },
  { value: 'valoracion', label: 'Mejor Valorados' },
  { value: 'nombre', label: 'Nombre A-Z' },
]

export default function TiendaPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [precioMax, setPrecioMax] = useState([2000])
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('')
  const [enStock, setEnStock] = useState(false)
  const [enOferta, setEnOferta] = useState(false)
  const [ordenar, setOrdenar] = useState('novedad')
  const [vista, setVista] = useState<'grid' | 'list'>('grid')
  const [pagina, setPagina] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProductos()
  }, [pagina, busqueda, tipoSeleccionado, enStock, enOferta, ordenar, precioMax])

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: '12',
        busqueda,
        tipo: tipoSeleccionado,
        ordenar,
        precioMax: precioMax[0].toString(),
        ...(enStock ? { enStock: 'true' } : {}),
        ...(enOferta ? { enOferta: 'true' } : {}),
      })
      const res = await fetch(`/api/productos?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setProductos(data.data.productos)
        setTotalItems(data.data.paginacion.totalItems)
        setTotalPages(data.data.paginacion.totalPages)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setPrecioMax([2000])
    setTipoSeleccionado('')
    setEnStock(false)
    setEnOferta(false)
    setPagina(1)
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Catálogo SAT</h1>
          <p className="text-muted-foreground">
            {totalItems} productos disponibles con garantía técnica.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, marca o especificación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 h-12 rounded-xl border-primary/20 bg-background/50 backdrop-blur-sm"
            />
          </div>

          <div className="flex gap-2">
            <Select value={ordenar} onValueChange={setOrdenar}>
              <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                {ordenarPor.map((opcion) => (
                  <SelectItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={vista === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setVista('grid')}
              className="h-12 w-12 rounded-xl"
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant={vista === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setVista('list')}
              className="h-12 w-12 rounded-xl"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <Card className="sticky top-24 border-primary/10 shadow-xl rounded-2xl overflow-hidden">
              <div className="p-6 bg-primary/5 border-b border-primary/10 flex justify-between items-center">
                <h3 className="font-bold">Filtros Avanzados</h3>
                <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="h-8 text-xs">Reset</Button>
              </div>
              <CardContent className="p-6 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categoría</h4>
                  <div className="grid gap-2">
                    {tiposProductos.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTipoSeleccionado(tipoSeleccionado === t.value ? '' : t.value)}
                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${tipoSeleccionado === t.value ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-primary/10'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Precio Máximo</h4>
                  <Slider value={precioMax} onValueChange={setPrecioMax} max={3000} step={100} />
                  <div className="text-center font-bold text-primary">{precioMax[0]}€</div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-primary/10 hover:bg-primary/5 transition-colors cursor-pointer">
                    <Checkbox checked={enStock} onCheckedChange={(v) => setEnStock(!!v)} />
                    <span className="text-sm font-medium">Solo en Stock</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-primary/10 hover:bg-primary/5 transition-colors cursor-pointer">
                    <Checkbox checked={enOferta} onCheckedChange={(v) => setEnOferta(!!v)} />
                    <span className="text-sm font-medium">Solo Ofertas</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Sincronizando inventario...</p>
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-20 bg-background/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-primary/10">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-bold mb-2">Sin resultados</p>
                <p className="text-muted-foreground mb-6">No hay productos que coincidan con tus filtros.</p>
                <Button onClick={limpiarFiltros} variant="outline">Limpiar todo</Button>
              </div>
            ) : (
              <div className={vista === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {productos.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} vista={vista} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setPagina(n => Math.max(1, n - 1))} />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink onClick={() => setPagina(i + 1)} isActive={pagina === i + 1}>
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => setPagina(n => Math.min(totalPages, n + 1))} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ producto, vista }: { producto: any, vista: 'grid' | 'list' }) {
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()

  const handleAddToCart = () => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precioOferta || producto.precio,
      imagen: producto.imagenes?.[0] || '',
      cantidad: 1
    })
    toast({
      title: "¡Añadido!",
      description: `${producto.nombre} está en tu carrito.`
    })
  }

  const descuento = producto.precioOferta ? Math.round((1 - producto.precioOferta / producto.precio) * 100) : 0

  if (vista === 'list') {
    return (
      <Card className="group hover:shadow-2xl transition-all rounded-2xl overflow-hidden border-primary/10 bg-background/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-48 h-48 bg-muted group-hover:bg-primary/5 transition-colors">
              <Image src={producto.imagenes?.[0] || '/placeholder.png'} alt={producto.nombre} fill className="object-cover transition-transform group-hover:scale-105" />
              {descuento > 0 && <Badge className="absolute top-2 left-2 bg-destructive">-{descuento}%</Badge>}
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <Link href={`/producto/${producto.id}`} className="hover:text-primary transition-colors">
                  <h3 className="text-xl font-black mb-1">{producto.nombre}</h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{producto.descripcionCorta}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-primary">{(producto.precioOferta || producto.precio).toFixed(2)}€</span>
                  {descuento > 0 && <span className="text-sm text-muted-foreground line-through">{producto.precio.toFixed(2)}€</span>}
                </div>
                <Button onClick={handleAddToCart} size="sm" className="rounded-xl px-6 font-bold">Añadir</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-2xl transition-all rounded-3xl overflow-hidden border-primary/10 bg-background/50 backdrop-blur-sm flex flex-col h-full">
      <div className="relative aspect-[4/5] bg-muted group-hover:bg-primary/5 transition-colors overflow-hidden">
        <Image src={producto.imagenes?.[0] || '/placeholder.png'} alt={producto.nombre} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {descuento > 0 && <Badge className="absolute top-4 left-4 bg-destructive text-white font-bold h-7 animate-bounce">-{descuento}%</Badge>}
        {producto.stock < 5 && producto.stock > 0 && <Badge variant="outline" className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-destructive border-destructive font-black">Últimas!</Badge>}
      </div>
      <CardContent className="p-6 flex-1 flex flex-col">
        <Link href={`/producto/${producto.id}`} className="hover:text-primary transition-colors flex-1">
          <h3 className="font-black text-lg mb-2 leading-tight uppercase tracking-tighter">{producto.nombre}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{producto.descripcionCorta}</p>
        </Link>
        <div className="flex items-center gap-1 mb-4">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-black">4.9</span>
          <span className="text-xs text-muted-foreground">(24)</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-primary">{(producto.precioOferta || producto.precio).toFixed(2)}€</span>
          {descuento > 0 && <span className="text-sm text-muted-foreground line-through font-medium">{producto.precio.toFixed(2)}€</span>}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button onClick={handleAddToCart} className="w-full h-12 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Añadir al Carrito
        </Button>
      </CardFooter>
    </Card>
  )
}
