'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ChevronRight,
  MoreHorizontal,
  MessageSquare,
  Settings,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  LayoutDashboard,
  Menu,
  ShoppingBag,
  XCircle,
  CheckCircle,
  Wrench,
  ThumbsUp
} from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

// Mock data para métricas
const kpiMock = [
  {
    id: 'ventas',
    titulo: 'Ventas Totales',
    valor: 45678,
    valorAnterior: 38542,
    cambio: 18.5,
    moneda: true,
    icon: DollarSign,
    color: 'text-green-600',
    trend: 'up'
  },
  {
    id: 'pedidos',
    titulo: 'Pedidos',
    valor: 234,
    valorAnterior: 198,
    cambio: 18.2,
    icon: ShoppingCart,
    color: 'text-blue-600',
    trend: 'up'
  },
  {
    id: 'clientes',
    titulo: 'Clientes Nuevos',
    valor: 56,
    valorAnterior: 42,
    cambio: 33.3,
    icon: Users,
    color: 'text-purple-600',
    trend: 'up'
  },
  {
    id: 'ingresos',
    titulo: 'Ingresos del Mes',
    valor: 156789,
    valorAnterior: 134521,
    cambio: 16.5,
    moneda: true,
    icon: TrendingUp,
    color: 'text-green-600',
    trend: 'up'
  },
  {
    id: 'tasaConversion',
    titulo: 'Tasa de Conversión',
    valor: 3.2,
    valorAnterior: 2.8,
    cambio: 14.3,
    porcentaje: true,
    icon: Activity,
    color: 'text-orange-600',
    trend: 'up'
  },
  {
    id: 'valorMedio',
    titulo: 'Valor Medio del Pedido',
    valor: 654,
    valorAnterior: 623,
    cambio: 5.0,
    moneda: true,
    icon: Package,
    color: 'text-blue-600',
    trend: 'up'
  },
  {
    id: 'stock',
    titulo: 'Productos en Stock',
    valor: 1234,
    valorAnterior: 1289,
    cambio: -4.3,
    icon: Package,
    color: 'text-yellow-600',
    trend: 'down'
  },
  {
    id: 'ticketsPendientes',
    titulo: 'Tickets Pendientes',
    valor: 12,
    valorAnterior: 15,
    cambio: -20.0,
    icon: MessageSquare,
    color: 'text-red-600',
    trend: 'down'
  }
]

const ventasPorDiaMock = [
  { dia: 'Lun', valor: 4520, progreso: 75, pedidos: 12 },
  { dia: 'Mar', valor: 6230, progreso: 100, pedidos: 18 },
  { dia: 'Mie', valor: 5180, progreso: 85, pedidos: 15 },
  { dia: 'Jue', valor: 4890, progreso: 80, pedidos: 14 },
  { dia: 'Vie', valor: 5780, progreso: 92, pedidos: 20 },
  { dia: 'Sáb', valor: 4120, progreso: 68, pedidos: 10 },
  { dia: 'Dom', valor: 3890, progreso: 64, pedidos: 8 }
]

// Mock data para tickets y técnicos
const ticketsStatusData = [
  { name: 'Abierto', value: 15, color: '#EF4444' }, // red
  { name: 'En Progreso', value: 25, color: '#3B82F6' }, // blue
  { name: 'Esperando Pieza', value: 10, color: '#F59E0B' }, // yellow
  { name: 'Resuelto', value: 45, color: '#10B981' }, // green
  { name: 'Cerrado', value: 30, color: '#6B7280' }, // gray
]

const tecnicoPerformanceData = [
  { name: 'Bembibre D.', asignados: 25, resueltos: 22, satisfaccion: 4.8 },
  { name: 'Bermejo J.', asignados: 30, resueltos: 28, satisfaccion: 4.9 },
  { name: 'Brañuelas P.', asignados: 18, resueltos: 15, satisfaccion: 4.5 },
  { name: 'Bucarito J.', asignados: 22, resueltos: 20, satisfaccion: 4.7 },
  { name: 'Domingo J.I.', asignados: 28, resueltos: 25, satisfaccion: 4.6 },
  { name: 'Escaleras L.', asignados: 20, resueltos: 19, satisfaccion: 4.9 },
  { name: 'Guzmán G.', asignados: 15, resueltos: 12, satisfaccion: 4.2 },
]

// ... imports remain the same

export default function AdminDashboardPage() {
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d')
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/admin/dashboard?period=${periodo}`)
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [periodo])

  // Merge API data with KPI definitions to keep icons/styling
  const getKpis = () => {
    if (!data) return kpiMock

    return [
      {
        id: 'ventas',
        titulo: 'Ventas Totales',
        valor: data.kpis.ventas,
        valorAnterior: 0, // Not calculated yet for simplicity
        cambio: 0,
        moneda: true,
        icon: DollarSign,
        color: 'text-green-600',
        trend: 'neutral'
      },
      {
        id: 'pedidos',
        titulo: 'Pedidos',
        valor: data.kpis.pedidos,
        valorAnterior: 0,
        cambio: 0,
        icon: ShoppingCart,
        color: 'text-blue-600',
        trend: 'neutral'
      },
      {
        id: 'clientes',
        titulo: 'Clientes Nuevos',
        valor: data.kpis.clientes_nuevos,
        valorAnterior: 0,
        cambio: 0,
        icon: Users,
        color: 'text-purple-600',
        trend: 'neutral'
      },
      {
        id: 'ticketsPendientes',
        titulo: 'Tickets Pendientes',
        valor: data.kpis.tickets_pendientes,
        valorAnterior: 0,
        cambio: 0,
        icon: MessageSquare,
        color: 'text-red-600',
        trend: 'down'
      }
    ]
  }

  const kpis = getKpis()
  const salesData = data?.salesChart || ventasPorDiaMock
  const catData = data?.categoryChart || []
  const ticketsStatus = data?.ticketStatusChart || ticketsStatusData
  const techPerformance = data?.techPerformance || tecnicoPerformanceData


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar de navegación */}
        <AdminSidebar />


        {/* Contenido principal */}
        <main className="flex-1 lg:ml-64 p-8">
          {/* Header móvil */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">MicroInfo Admin</span>
            </div>
            <Button variant="outline" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Título del dashboard */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Bienvenido al panel de administración. Aquí tienes una vista general de tu negocio.
            </p>
          </div>

          {/* Selector de periodo */}
          <div className="mb-8">
            <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as '7d' | '30d' | '90d')}>
              <TabsList>
                <TabsTrigger value="7d">Últimos 7 días</TabsTrigger>
                <TabsTrigger value="30d">Últimos 30 días</TabsTrigger>
                <TabsTrigger value="90d">Últimos 90 días</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi) => (
              <Card key={kpi.id} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {kpi.titulo}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${kpi.color} bg-opacity-10`}>
                    <kpi.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">
                      {kpi.moneda && '€'}
                      {kpi.valor.toLocaleString()}
                      {kpi.porcentaje && '%'}
                    </div>
                    <div className={`flex items-center text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="ml-1 font-medium">
                        {Math.abs(kpi.cambio).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    vs {kpi.valorAnterior.toLocaleString()} {kpi.moneda ? '€' : ''} el mes anterior
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráficos y widgets existentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Ventas por día */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ventas vs Pedidos</CardTitle>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <CardDescription className="mt-2">
                  Comparativa diaria de facturación y volumen de pedidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="dia" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="valor" name="Ventas (€)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="pedidos" name="Pedidos" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribución por categoría */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Distribución por Categoría</CardTitle>
                  <PieChart className="h-5 w-5 text-gray-400" />
                </div>
                <CardDescription className="mt-2">
                  Ventas por categoría este mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {catData.length > 0 ? catData.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600 font-semibold">
                          {item.value.toLocaleString()}€
                        </span>
                      </div>
                      {/* Calculate percentage relative to total if possible, or just mock/skip */}
                      <Progress value={(item.value / catData.reduce((acc: number, curr: any) => acc + curr.value, 0)) * 100} className="h-2" />
                    </div>
                  )) : <p className="text-sm text-gray-500 text-center py-4">No hay datos de ventas por categoría.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* NUEVA SECCIÓN: Estadísticas de Soporte Técnico */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              Rendimiento de Soporte Técnico
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estado de los Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado de Tickets</CardTitle>
                  <CardDescription>Distribución actual de tickets por estado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={ticketsStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {ticketsStatus.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Rendimiento por Técnico */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rendimiento por Técnico</CardTitle>
                  <CardDescription>Tickets asignados vs. resueltos por técnico</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={techPerformance}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="asignados" name="Asignados" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="resueltos" name="Resueltos" fill="#10B981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Satisfacción del Cliente por Técnico */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-blue-500" />
                      Satisfacción Media por Técnico
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {techPerformance.map((tech: any, idx: number) => (
                      <div key={idx} className="bg-white border rounded-lg p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-gray-800">{tech.name}</span>
                          <Badge variant={tech.satisfaccion >= 4.5 ? "default" : "secondary"}>
                            {tech.satisfaccion} / 5
                          </Badge>
                        </div>
                        <Progress value={(tech.satisfaccion / 5) * 100} className="h-2 mt-1" />
                        <p className="text-xs text-gray-500 mt-1">Based on {tech.resueltos} tickets</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Widget de alertas */}
          <Card className="mb-8">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Alertas y Notificaciones</CardTitle>
              <Badge variant="destructive">4 nuevas</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { tipo: 'stock_bajo', titulo: 'Stock Bajo: Monitor Curvo 32"', descripcion: 'Solo 2 unidades disponibles (mínimo: 5)', severidad: 'alta', color: 'bg-orange-100 text-orange-800' },
                  { tipo: 'ticket_urgente', titulo: 'Ticket Urgente: Portátil no enciende', descripcion: 'Ticket SAT-2023-0045 sin asignar', severidad: 'alta', color: 'bg-red-100 text-red-800' },
                  { tipo: 'stock_bajo', titulo: 'Stock Bajo: CPU Intel Core i9', descripcion: 'Solo 1 unidad disponible (mínimo: 5)', severidad: 'media', color: 'bg-yellow-100 text-yellow-800' },
                  { tipo: 'ticket_pendiente', titulo: 'Tickets Pendientes de Asignación', descripcion: '2 tickets sin técnico asignado', severidad: 'media', color: 'bg-blue-100 text-blue-800' }
                ].map((alerta, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`p-2 rounded-lg ${alerta.color}`}>
                      {alerta.tipo === 'ticket_urgente' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : alerta.tipo === 'ticket_pendiente' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold mb-1">
                        {alerta.titulo}
                      </p>
                      <p className="text-xs text-gray-600">
                        {alerta.descripcion}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Hace {idx + 1}h
                      </p>
                    </div>
                    <XCircle className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Ver todas las alertas
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          {/* Widget de pedidos recientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pedidos Recientes</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/pedidos">
                    Ver todos
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <CardDescription className="mt-2">
                Últimos 5 pedidos recibidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: '1', numero: 'PED-2023-0123', cliente: 'Juan Pérez', estado: 'pendiente', total: 1254, fecha: new Date('2023-12-30T10:30:00Z') },
                  { id: '2', numero: 'PED-2023-0122', cliente: 'María García', estado: 'en_proceso', total: 678, fecha: new Date('2023-12-30T09:15:00Z') },
                  { id: '3', numero: 'PED-2023-0121', cliente: 'Carlos López', estado: 'enviado', total: 1890, fecha: new Date('2023-12-29T16:45:00Z') },
                  { id: '4', numero: 'PED-2023-0120', cliente: 'Ana Martínez', estado: 'entregado', total: 456, fecha: new Date('2023-12-29T14:20:00Z') },
                  { id: '5', numero: 'PED-2023-0119', cliente: 'Diego Fernández', estado: 'cancelado', total: 890, fecha: new Date('2023-12-28T11:30:00Z') }
                ].map((pedido) => (
                  <div key={pedido.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      {pedido.estado === 'pendiente' && (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      {pedido.estado === 'en_proceso' && (
                        <Activity className="h-4 w-4 text-blue-600" />
                      )}
                      {pedido.estado === 'enviado' && (
                        <ShoppingCart className="h-4 w-4 text-purple-600" />
                      )}
                      {pedido.estado === 'entregado' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {pedido.estado === 'cancelado' && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold line-clamp-1">
                          {pedido.numero}
                        </p>
                        <p className="text-xs text-gray-500">
                          Hace {Math.floor((Date.now() - pedido.fecha.getTime()) / (1000 * 60 * 60))}h
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">{pedido.cliente}</p>
                        <p className="text-sm font-bold text-gray-900">
                          {pedido.total.toLocaleString()}€
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
