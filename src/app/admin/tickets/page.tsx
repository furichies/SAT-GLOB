'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  User,
  Clock,
  CheckCircle,
  X,
  Eye,
  Edit,
  Trash2,
  Package,
  Settings,
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  ShoppingBag,
  FileText,
  Calendar,
  Tag,
  BookOpen, // New icon for KB
  Share, // New icon for sharing to KB
  Download, // For files
  Printer, // New icon for printing labels
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import Image from 'next/image'
import { PlantillaSelector } from '@/components/documentos/PlantillaSelector'

const ticketsMock = [
  { id: '1', numero: 'SAT-2023-0045', cliente: 'Pedro Sánchez', asunto: 'Portátil no enciende', prioridad: 'urgente', tipo: 'incidencia', tecnico: 'Carlos García', tecnicoId: 'mock-tech-1', fecha: '2023-12-30 08:00', estado: 'pendiente', descripcion: 'El equipo no da señal de vida tras una subida de tensión.' },
  { id: '2', numero: 'SAT-2023-0044', cliente: 'Laura Rodríguez', asunto: 'SSD corrupto', prioridad: 'alta', tipo: 'reparacion', tecnico: 'María Martínez', tecnicoId: 'mock-tech-2', fecha: '2023-12-30 07:30', estado: 'asignado', descripcion: 'Errores constantes de lectura/escritura en el disco principal.' },
  { id: '3', numero: 'SAT-2023-0043', cliente: 'Diego Fernández', asunto: 'Instalación de software', prioridad: 'media', tipo: 'consulta', tecnico: 'Carlos García', tecnicoId: 'mock-tech-1', fecha: '2023-12-29 15:00', estado: 'en_progreso', descripcion: 'Necesita instalar suite Adobe y configurar drivers.' },
  { id: '4', numero: 'SAT-2023-0042', cliente: 'Carmen Vázquez', asunto: 'Garantía monitor', prioridad: 'baja', tipo: 'garantia', tecnico: 'María Martínez', tecnicoId: 'mock-tech-2', fecha: '2023-12-28 10:30', estado: 'resuelto', descripcion: 'Píxeles muertos en la zona central superior.' }
]

const estados = {
  abierto: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  asignado: { label: 'Asignado', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: User },
  en_progreso: { label: 'En Progreso', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Package },
  pendiente_cliente: { label: 'Pendiente Cliente', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock },
  pendiente_pieza: { label: 'Esperando Pieza', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Package },
  resuelto: { label: 'Resuelto', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
}

const prioridades = {
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800 border-red-200' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  media: { label: 'Media', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  baja: { label: 'Baja', color: 'bg-green-100 text-green-800 border-green-200' }
}

const tipos = {
  incidencia: 'Incidencia',
  consulta: 'Consulta',
  reparacion: 'Reparación',
  garantia: 'Garantía',
  devolucion: 'Devolución',
  otro: 'Otro'
}

export default function AdminTicketsPage() {
  const searchParams = useSearchParams()
  const ticketIdParam = searchParams.get('ticketId')

  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [prioridad, setPrioridad] = useState('todos')
  const [tipo, setTipo] = useState('todos')
  const [tecnico, setTecnico] = useState('todos')
  const [ticketSeleccionado, setTicketSeleccionado] = useState<any>(null)
  const [isEdicion, setIsEdicion] = useState(false)
  const [isNuevo, setIsNuevo] = useState(false)
  const [tecnicosList, setTecnicosList] = useState<any[]>([])

  // Reply modal state
  const [isReplying, setIsReplying] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')

  // Repair Order state
  const [isConverting, setIsConverting] = useState(false)
  const [repairData, setRepairData] = useState<{
    laborHours: number,
    parts: { name: string, cost: number }[]
  }>({ laborHours: 1, parts: [] })
  const [newPart, setNewPart] = useState({ name: '', cost: '' })

  // Preview de imagen
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    if (tecnicosList.length === 0) {
      fetchTecnicos()
    }
  }, [tecnicosList.length])

  // Efeecto para deep linking desde documento
  useEffect(() => {
    if (ticketIdParam) {
      if (tickets.length > 0) {
        const found = tickets.find(t => t.id === ticketIdParam)
        if (found) {
          setTicketSeleccionado(found)
        } else {
          // Si no está en la lista cargada, lo buscamos individualmente
          fetchTicketById(ticketIdParam)
        }
      } else {
        // Si tickets no ha cargado aun, podemos esperar o intentar cargar individualmente tb.
        // fetchTickets cargará la lista, y este efecto correrá de nuevo.
        // Pero fetchTicketById es seguro.
        fetchTicketById(ticketIdParam)
      }
    }
  }, [ticketIdParam, tickets.length]) // Dependemos de tickets.length para re-ejecutar cuando carguen

  const fetchTicketById = async (id: string) => {
    try {
      const res = await fetch(`/api/sat/tickets/${id}`)
      const data = await res.json()
      if (data.success && data.ticket) {
        const t = data.ticket
        // Mapeo manual para coincidir con la estructura de la lista
        const mapped = {
          id: t.id,
          numero: t.numeroTicket,
          cliente: t.usuario?.nombre || 'Desconocido',
          asunto: t.asunto,
          prioridad: t.prioridad,
          tipo: t.tipo,
          tecnico: t.tecnico?.usuario?.nombre || 'Sin asignar',
          tecnicoId: t.tecnico?.id || null,
          fecha: new Date(t.fechaCreacion).toLocaleString(),
          estado: t.estado,
          descripcion: t.descripcion,
          diagnostico: t.diagnostico,
          solucion: t.solucion,
          documentos: t.documentos,
          pedidoId: t.pedidoId
        }
        setTicketSeleccionado(mapped)
      }
    } catch (e) {
      console.error("Error fetching single ticket", e)
    }
  }

  const fetchTecnicos = async () => {
    try {
      console.log('Fetching tecnicos list...')
      const res = await fetch('/api/admin_tecnicos')
      const data = await res.json()
      console.log('Tecnicos API response:', data)
      if (data.success) {
        console.log('Técnicos cargados:', data.data.tecnicos)
        setTecnicosList(data.data.tecnicos)
      } else {
        console.error('Error al cargar técnicos:', data.error)
      }
    } catch (error) {
      console.error('Error fetching tecnicos list:', error)
    }
  }

  const fetchTickets = async () => {
    try {
      // Usar un timestamp para evitar el caché de Next.js/Browser
      const res = await fetch(`/api/sat/tickets?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      })
      const data = await res.json()
      if (data.success && data.tickets && data.tickets.length > 0) {
        const mappedTickets = data.tickets.map((t: any) => ({
          id: t.id,
          numero: t.numeroTicket,
          cliente: t.usuario?.nombre || 'Desconocido',
          asunto: t.asunto,
          prioridad: t.prioridad,
          tipo: t.tipo,
          tecnico: t.tecnico?.usuario?.nombre || 'Sin asignar',
          tecnicoId: t.tecnico?.id || null,
          fecha: new Date(t.fechaCreacion).toLocaleString(),
          estado: t.estado,
          descripcion: t.descripcion,
          diagnostico: t.diagnostico, // Added
          solucion: t.solucion, // Added
          documentos: t.documentos // Added for attachments view
        }))
        setTickets(mappedTickets)
      } else {
        // Fallback a mock data si no hay tickets en la base de datos
        setTickets(ticketsMock.filter((t: any) => {
          if (busqueda && !t.asunto.toLowerCase().includes(busqueda.toLowerCase()) &&
            !t.numero.toLowerCase().includes(busqueda.toLowerCase()) &&
            !t.cliente.toLowerCase().includes(busqueda.toLowerCase())) return false
          if (prioridad !== 'todos' && t.prioridad !== prioridad) return false
          if (tipo !== 'todos' && t.tipo !== tipo) return false
          if (tecnico !== 'todos' && t.tecnicoId !== tecnico) return false
          return true
        }))
      }
    } catch (error) {
      console.error('Error fetching admin tickets:', error)
      setTickets(ticketsMock) // Fallback en error
    } finally {
      setIsLoading(false)
    }
  }

  const [formTicket, setFormTicket] = useState({
    asunto: '',
    descripcion: '',
    prioridad: 'media',
    tipo: 'incidencia',
    estado: 'abierto',
    tecnico: 'Sin asignar',
    cliente: '',
    diagnostico: '',
    solucion: '',
    guardarEnKB: false // Temporary state for UI
  })

  const handleGuardar = async () => {
    const backupTickets = [...tickets];
    setIsLoading(true)
    try {
      const res = await fetch(isNuevo ? '/api/sat/tickets' : `/api/sat/tickets/${ticketSeleccionado.id}`, {
        method: isNuevo ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formTicket,
          tecnicoId: formTicket.tecnico, // Send ID as tecnicoId
          guardarEnKB: undefined // Don't send this to ticket API
        })
      })

      const data = await res.json()
      if (data.success) {
        // Logica para guardar en KB si se solicitó
        if (formTicket.guardarEnKB && formTicket.solucion && formTicket.asunto) {
          console.log('Attempting to save to KB:', {
            titulo: `Solución: ${formTicket.asunto}`,
            solucion: formTicket.solucion
          })
          try {
            const resKB = await fetch('/api/admin_conocimiento', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                titulo: `Solución: ${formTicket.asunto} [Ticket ${ticketSeleccionado?.numero || ''} - ${new Date().toLocaleTimeString()}]`,
                contenido: `PROBLEMA:\n${formTicket.descripcion}\n\nDIAGNÓSTICO:\n${formTicket.diagnostico}\n\nSOLUCIÓN:\n${formTicket.solucion}`,
                categoria: 'Reparación', // Default category or could be improved
                estado: 'borrador', // Draft for review
                tags: ['ticket-resuelto', formTicket.tipo]
              })
            })

            const resultKB = await resKB.json()
            if (resKB.ok && resultKB.success) {
              alert('Solución guardada en Base de Conocimiento (Borrador)')
            } else {
              console.error('KB Save Failed:', resultKB)
              alert(`Ticket guardado, pero ERROR al guardar en KB: ${resultKB.error || 'Desconocido'}. Verifica si ya existe.`)
            }
          } catch (kbError) {
            console.error('Error saving to KB', kbError)
            alert('Ticket guardado, pero error de conexión al guardar en KB')
          }
        } else if (formTicket.guardarEnKB) {
          alert('Para guardar en KB necesitas completar Asunto y Solución')
        }

        // Forzamos actualización inmediata
        await fetchTickets()
      } else {
        alert('Error al guardar: ' + data.error)
        setTickets(backupTickets)
      }
      closeModals()
    } catch (error) {
      console.error('Error saving ticket:', error)
      alert('Error de conexión al guardar')
      setTickets(backupTickets)
    } finally {
      setIsLoading(false)
    }
  }

  const openEdicion = async (ticket: any) => {
    console.log('=== openEdicion llamado ===', ticket.numero)

    // IMPORTANTE: Recargar el ticket desde la API para obtener documentos actualizados
    let ticketCompleto = ticket
    try {
      console.log('🔄 Recargando ticket desde API...')
      const res = await fetch(`/api/sat/tickets/${ticket.id}`)
      const data = await res.json()
      if (data.success && data.ticket) {
        ticketCompleto = {
          id: data.ticket.id,
          numero: data.ticket.numeroTicket,
          cliente: data.ticket.usuario?.nombre || 'Desconocido',
          asunto: data.ticket.asunto,
          prioridad: data.ticket.prioridad,
          tipo: data.ticket.tipo,
          tecnico: data.ticket.tecnico?.usuario?.nombre || 'Sin asignar',
          tecnicoId: data.ticket.tecnico?.id || null,
          fecha: new Date(data.ticket.fechaCreacion).toLocaleString(),
          estado: data.ticket.estado,
          descripcion: data.ticket.descripcion,
          diagnostico: data.ticket.diagnostico,
          solucion: data.ticket.solucion,
          documentos: data.ticket.documentos
        }
        console.log('✅ Ticket recargado con', ticketCompleto.documentos?.length || 0, 'documentos')
      }
    } catch (e) {
      console.error('❌ Error recargando ticket:', e)
      console.log('⚠️ Usando datos del ticket original')
    }

    console.log('Documentos:', ticketCompleto.documentos)
    setTicketSeleccionado(ticketCompleto)

    // Valores iniciales
    let diagnosticoText = ticketCompleto.diagnostico || ''
    let solucionText = ticketCompleto.solucion || ''

    // Si el ticket tiene documentos, buscar el diagnóstico y albarán
    if (ticketCompleto.documentos && ticketCompleto.documentos.length > 0) {
      console.log('✓ Ticket tiene', ticketCompleto.documentos.length, 'documentos')
      try {
        // Buscar documento de diagnóstico (diagnostico_presupuesto)
        const docDiagnostico = ticketCompleto.documentos.find((doc: any) => {
          console.log('  - Documento:', doc.tipo)
          return doc.tipo === 'diagnostico_presupuesto'
        })

        // Buscar documento de albarán (albaran_entrega)
        const docAlbaran = ticketCompleto.documentos.find((doc: any) =>
          doc.tipo === 'albaran_entrega'
        )

        console.log('Diagnóstico encontrado:', !!docDiagnostico)
        console.log('Albarán encontrado:', !!docAlbaran)

        // Si existe diagnóstico y albarán, extraer información
        if (docDiagnostico && docAlbaran) {
          console.log('✅ Extrayendo información de documentos...')
          try {
            const metadatos = JSON.parse(docDiagnostico.metadatos || '{}')
            console.log('Metadatos:', metadatos)

            // Construir texto de diagnóstico desde los metadatos
            if (metadatos.diagnostico) {
              const diagParts: string[] = []

              // Pruebas realizadas
              if (metadatos.diagnostico.pruebasRealizadas && metadatos.diagnostico.pruebasRealizadas.length > 0) {
                diagParts.push('PRUEBAS REALIZADAS:')
                metadatos.diagnostico.pruebasRealizadas.forEach((prueba: string) => {
                  diagParts.push(`• ${prueba}`)
                })
                diagParts.push('')
              }

              // Resultados
              if (metadatos.diagnostico.resultadosObtenidos) {
                diagParts.push('RESULTADOS:')
                diagParts.push(metadatos.diagnostico.resultadosObtenidos)
                diagParts.push('')
              }

              // Componentes defectuosos
              if (metadatos.diagnostico.componentesDefectuosos && metadatos.diagnostico.componentesDefectuosos.length > 0) {
                diagParts.push('COMPONENTES DEFECTUOSOS:')
                metadatos.diagnostico.componentesDefectuosos.forEach((comp: string) => {
                  diagParts.push(`• ${comp}`)
                })
                diagParts.push('')
              }

              // Causa raíz
              if (metadatos.diagnostico.causaRaiz) {
                diagParts.push('CAUSA RAÍZ:')
                diagParts.push(metadatos.diagnostico.causaRaiz)
              }

              diagnosticoText = diagParts.join('\n')
              console.log('✓ Diagnóstico generado:', diagnosticoText.length, 'caracteres')
            }

            // Construir texto de solución desde reparación propuesta
            if (metadatos.reparacionPropuesta) {
              const solParts: string[] = []

              // Descripción de trabajos
              if (metadatos.reparacionPropuesta.descripcionTrabajos) {
                solParts.push('TRABAJOS REALIZADOS:')
                solParts.push(metadatos.reparacionPropuesta.descripcionTrabajos)
                solParts.push('')
              }

              // Repuestos utilizados
              if (metadatos.reparacionPropuesta.repuestosNecesarios && metadatos.reparacionPropuesta.repuestosNecesarios.length > 0) {
                solParts.push('REPUESTOS UTILIZADOS:')
                metadatos.reparacionPropuesta.repuestosNecesarios.forEach((rep: any) => {
                  solParts.push(`• ${rep.descripcion} (Cant: ${rep.cantidad})`)
                })
                solParts.push('')
              }

              // Mano de obra
              if (metadatos.reparacionPropuesta.manoObra && metadatos.reparacionPropuesta.manoObra.length > 0) {
                solParts.push('MANO DE OBRA:')
                metadatos.reparacionPropuesta.manoObra.forEach((mo: any) => {
                  solParts.push(`• ${mo.descripcion} (${mo.horasEstimadas}h)`)
                })
                solParts.push('')
              }

              // Tiempo estimado
              if (metadatos.tiempoEstimadoReparacion) {
                solParts.push(`Tiempo total de reparación: ${metadatos.tiempoEstimadoReparacion} horas`)
              }

              solucionText = solParts.join('\n')
              console.log('✓ Solución generada:', solucionText.length, 'caracteres')
            }
          } catch (e) {
            console.error('❌ Error parseando metadatos del diagnóstico:', e)
          }
        } else {
          console.log('⚠️ No se encontraron ambos documentos')
        }
      } catch (e) {
        console.error('❌ Error procesando documentos:', e)
      }
    } else {
      console.log('⚠️ Ticket sin documentos')
    }

    setFormTicket({
      asunto: ticketCompleto.asunto,
      descripcion: ticketCompleto.descripcion || '',
      prioridad: ticketCompleto.prioridad,
      tipo: ticketCompleto.tipo,
      estado: ticketCompleto.estado,
      tecnico: ticketCompleto.tecnicoId || 'Sin asignar',
      cliente: ticketCompleto.cliente,
      diagnostico: diagnosticoText,
      solucion: solucionText,
      guardarEnKB: false
    })
    setIsEdicion(true)
  }

  const openNuevo = () => {
    setIsNuevo(true)
    setTicketSeleccionado(null)
    setFormTicket({
      asunto: '',
      descripcion: '',
      prioridad: 'media',
      tipo: 'incidencia',
      estado: 'abierto',
      tecnico: 'Sin asignar',
      cliente: '',
      diagnostico: '',
      solucion: '',
      guardarEnKB: false
    })
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ticket pendiente?')) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/sat/tickets/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        await fetchTickets()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      alert('Error de conexión al eliminar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/sat/tickets/${ticketSeleccionado.id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: replyMessage })
      })

      const data = await res.json()
      if (data.success) {
        alert('Respuesta enviada correctamente al cliente.')
        setReplyMessage('')
        setIsReplying(false)
        // Optionally fetch tickets again if needed, or just keep the detail open
      } else {
        alert('Error al enviar respuesta: ' + data.error)
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Error de conexión al enviar respuesta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConvertirPedido = async () => {
    if (!ticketSeleccionado) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/sat/tickets/${ticketSeleccionado.id}/convertir-pedido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          laborHours: repairData.laborHours,
          parts: repairData.parts
        })
      })
      const data = await res.json()
      if (data.success) {
        alert('Pedido de reparación creado correctamente.')
        setIsConverting(false)
        fetchTickets() // Refresh to see updated status
        closeModals()
      } else {
        alert('Error al crear pedido: ' + data.error)
      }
    } catch (error) {
      console.error('Error converting to order:', error)
      alert('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImprimirEtiqueta = async () => {
    if (!ticketSeleccionado) return
    try {
      const response = await fetch(`/api/sat/tickets/${ticketSeleccionado.id}/etiqueta`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `etiqueta-${ticketSeleccionado.numero || 'ticket'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Error response:', await response.text())
        alert('Error al generar la etiqueta')
      }
    } catch (error) {
      console.error('Error al descargar etiqueta:', error)
      alert('Error de conexión')
    }
  }

  const addPart = () => {
    if (!newPart.name || !newPart.cost) return
    const cost = parseFloat(newPart.cost)
    if (isNaN(cost)) return
    setRepairData({
      ...repairData,
      parts: [...repairData.parts, { name: newPart.name, cost }]
    })
    setNewPart({ name: '', cost: '' })
  }

  const removePart = (index: number) => {
    const newParts = [...repairData.parts]
    newParts.splice(index, 1)
    setRepairData({ ...repairData, parts: newParts })
  }

  const calculateTotal = () => {
    const labor = repairData.laborHours * 80
    const parts = repairData.parts.reduce((acc, p) => acc + p.cost, 0)
    return (labor + parts) * 1.21 // IVA included estimate
  }

  const closeModals = () => {
    setTicketSeleccionado(null)
    setIsEdicion(false)
    setIsNuevo(false)
    setIsNuevo(false)
    setIsReplying(false)
    setIsConverting(false)
    setReplyMessage('')
  }

  const ticketsFiltrados = tickets.filter(t => {
    if (busqueda && !t.asunto.toLowerCase().includes(busqueda.toLowerCase()) &&
      !t.numero.toLowerCase().includes(busqueda.toLowerCase()) &&
      !t.cliente.toLowerCase().includes(busqueda.toLowerCase())) return false
    if (prioridad !== 'todos' && t.prioridad !== prioridad) return false
    if (tipo !== 'todos' && t.tipo !== tipo) return false
    if (tecnico !== 'todos' && t.tecnicoId !== tecnico) return false
    return true
  })

  const getPrioridadBadge = (prio: string) => {
    return prioridades[prio as keyof typeof prioridades] || prioridades.media
  }

  const getEstadoBadge = (est: string) => {
    return estados[est as keyof typeof estados] || estados.abierto
  }

  const getEstadoCardBackground = (est: string) => {
    const backgrounds: Record<string, string> = {
      abierto: 'bg-yellow-50 border-yellow-200',
      asignado: 'bg-blue-50 border-blue-200',
      en_progreso: 'bg-purple-100 border-purple-200',
      pendiente_cliente: 'bg-orange-100 border-orange-200',
      pendiente_pieza: 'bg-indigo-100 border-indigo-200',
      resuelto: 'bg-green-200 border-green-300',
      cancelado: 'bg-gray-200 border-gray-300'
    }
    return backgrounds[est] || 'bg-white border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Tickets SAT</h1>
            <p className="text-gray-600">
              Administra, asigna y gestiona todos los tickets de soporte técnico.
            </p>
          </div>
          <Button onClick={openNuevo} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Ticket
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Buscar y Filtrar */}
            <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por asunto, número o cliente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={prioridad} onValueChange={setPrioridad}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Prioridades</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    <SelectItem value="incidencia">Incidencia</SelectItem>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="reparacion">Reparación</SelectItem>
                    <SelectItem value="garantia">Garantía</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tecnico} onValueChange={setTecnico}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los técnicos</SelectItem>
                    <SelectItem value="Sin asignar">Sin asignar</SelectItem>
                    {tecnicosList.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nombre} {t.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(estados).map(([key, info]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                      <info.icon className="h-5 w-5 opacity-70" />
                      <h2 className="font-bold text-gray-700">{info.label}</h2>
                    </div>
                    <Badge variant="secondary">
                      {ticketsFiltrados.filter(t => t.estado === key).length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {ticketsFiltrados.filter(t => t.estado === key).map((ticket) => {
                      const prioBadge = getPrioridadBadge(ticket.prioridad)
                      const cardBg = getEstadoCardBackground(ticket.estado)
                      return (
                        <Card key={ticket.id} className={`hover:shadow-md transition-shadow cursor-pointer ${cardBg}`}>
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono text-muted-foreground font-bold">{ticket.numero}</span>
                              <Badge className={`${prioBadge.color} text-xs px-2 py-0.5`}>
                                {prioBadge.label}
                              </Badge>
                            </div>
                            <h3 className="font-bold text-base text-gray-800 line-clamp-3 leading-snug">{ticket.asunto}</h3>
                          </CardHeader>
                          <CardContent className="p-4 pt-2 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                              <User className="h-4 w-4" />
                              <span>{ticket.cliente}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{ticket.fecha}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Tag className="h-3.5 w-3.5" />
                                <span>{tipos[ticket.tipo as keyof typeof tipos]}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2 border-t">
                              <Button variant="ghost" size="sm" className="h-8 flex-1" onClick={() => setTicketSeleccionado(ticket)}>
                                <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 flex-1" onClick={() => openEdicion(ticket)}>
                                <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                              </Button>
                              {ticket.estado === 'abierto' && (
                                <Button variant="ghost" size="sm" className="h-8 flex-none text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleEliminar(ticket.id) }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal Detalle */}
        <Dialog open={ticketSeleccionado && !isEdicion} onOpenChange={(open) => !open && closeModals()}>
          <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Detalle de Ticket</DialogTitle>
              {ticketSeleccionado && <p className="text-sm font-mono text-muted-foreground mt-1">{ticketSeleccionado.numero}</p>}
            </DialogHeader>

            {ticketSeleccionado && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Estado</p>
                    <Badge className={getEstadoBadge(ticketSeleccionado.estado).color}>
                      {getEstadoBadge(ticketSeleccionado.estado).label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Prioridad</p>
                    <Badge className={getPrioridadBadge(ticketSeleccionado.prioridad).color}>
                      {getPrioridadBadge(ticketSeleccionado.prioridad).label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tipo</p>
                    <p className="text-sm font-medium">{tipos[ticketSeleccionado.tipo as keyof typeof tipos]}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Fecha Creación</p>
                    <p className="text-sm font-medium">{ticketSeleccionado.fecha}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Asunto</p>
                  <p className="text-lg font-semibold">{ticketSeleccionado.asunto}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Descripción</p>
                  <p className="text-base text-gray-800 leading-relaxed bg-gray-50 p-6 rounded-lg border shadow-sm">
                    {ticketSeleccionado.descripcion || "Sin descripción adicional."}
                  </p>
                </div>

                {/* Selector de Plantillas */}
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Generar Documentación</p>
                  <PlantillaSelector
                    ticket={ticketSeleccionado}
                    onDocumentGenerated={() => {
                      console.log('Documento generado, refrescando ticket...')
                      // Refresca la lista y el detalle
                      fetchTickets()
                      // Pequeño hack para refrescar el detalle sin parpadeo excesivo
                      setTimeout(() => fetchTicketById(ticketSeleccionado.id), 500)
                    }}
                  />
                </div>

                {/* Archivos Adjuntos y Evidencias */}
                {ticketSeleccionado.documentos && ticketSeleccionado.documentos.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                      Archivos y Evidencias ({ticketSeleccionado.documentos.length})
                    </p>

                    {ticketSeleccionado.documentos.map((doc: any) => {
                      // Verificar si tiene evidencias fotográficas
                      let evidencias: any[] = []
                      try {
                        evidencias = doc.evidenciasFotos ? JSON.parse(doc.evidenciasFotos) : []
                      } catch (e) {
                        console.error('Error parseando evidencias:', e)
                      }

                      const esImagen = doc.rutaArchivo?.match(/\.(jpg|jpeg|png|gif|webp)$/i)

                      // Si es documento sin imágenes
                      if (evidencias.length === 0 && !esImagen) {
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-md text-primary">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate max-w-[180px]">
                                  {doc.contenido?.replace('Adjunto: ', '') || 'Documento'}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {new Date(doc.fechaGeneracion).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={doc.rutaArchivo ? (doc.rutaArchivo.startsWith('/api') ? doc.rutaArchivo : `/api${doc.rutaArchivo}`) : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        )
                      }

                      // Documento con imágenes
                      return (
                        <div key={doc.id} className="bg-white border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {doc.contenido?.replace('Adjunto: ', '') || `Evidencias (${evidencias.length})`}
                              </p>
                              <span className="text-[10px] text-gray-500">
                                {new Date(doc.fechaGeneracion).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Galería de imágenes */}
                          {(evidencias.length > 0 || esImagen) && (
                            <div className={`grid gap-2 ${evidencias.length > 0 ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
                              {evidencias.map((img: any, idx: number) => (
                                <div
                                  key={`${doc.id}-${img.id}`}
                                  className="relative aspect-square rounded-md overflow-hidden border cursor-pointer hover:shadow-lg transition-shadow"
                                  onClick={() => setPreviewImage(img.url)}
                                >
                                  <Image
                                    src={img.url}
                                    alt={img.descripcion || `Evidencia ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="25vw"
                                  />
                                  {img.descripcion && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                                      <p className="text-[10px] text-white truncate px-1">
                                        {img.descripcion}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Si es rutaArchivo de imagen individual */}
                              {evidencias.length === 0 && esImagen && doc.rutaArchivo && (
                                <div
                                  className="aspect-square max-w-[200px] rounded-md overflow-hidden border cursor-pointer hover:shadow-lg"
                                  onClick={() => setPreviewImage(doc.rutaArchivo)}
                                >
                                  <Image
                                    src={doc.rutaArchivo}
                                    alt={doc.contenido || 'Evidencia'}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 border-t pt-4">
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Cliente</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {ticketSeleccionado.cliente?.charAt(0)}
                      </div>
                      <p className="font-medium text-sm">{ticketSeleccionado.cliente}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Técnico Asignado</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-sm">{ticketSeleccionado.tecnico || "Sin asignar"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button variant="outline" className="flex-1" onClick={handleImprimirEtiqueta}>
                    <Printer className="h-4 w-4 mr-2" /> Etiqueta QR
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => openEdicion(ticketSeleccionado)}>
                    <Edit className="h-4 w-4 mr-2" /> Editar Información
                  </Button>
                  <Button className="flex-1" onClick={() => setIsReplying(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Responder Cliente
                  </Button>
                </div>

                {/* Convert to Order Action */}
                {!ticketSeleccionado.pedidoId && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="secondary"
                      className="w-full bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200 border"
                      onClick={() => setIsConverting(true)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Crear Pedido de Reparación
                    </Button>
                    <p className="text-[10px] text-center text-gray-500 mt-2">
                      Genera un pedido formal con mano de obra y piezas para facturación.
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Edición / Nuevo */}
        <Dialog open={isEdicion || isNuevo} onOpenChange={(open) => !open && closeModals()}>
          <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{isEdicion ? 'Editar Ticket' : 'Crear Nuevo Ticket'}</DialogTitle>
              {isEdicion && ticketSeleccionado && (
                <p className="text-sm font-mono text-muted-foreground mt-1">{ticketSeleccionado.numero}</p>
              )}
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo de Ticket</label>
                  <Select value={formTicket.tipo} onValueChange={(v) => setFormTicket({ ...formTicket, tipo: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tipos).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prioridad</label>
                  <Select value={formTicket.prioridad} onValueChange={(v) => setFormTicket({ ...formTicket, prioridad: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(prioridades).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado Actual</label>
                  <Select value={formTicket.estado} onValueChange={(v) => setFormTicket({ ...formTicket, estado: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(estados).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asignar Técnico</label>
                  <Select value={formTicket.tecnico} onValueChange={(v) => setFormTicket({ ...formTicket, tecnico: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar técnico..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sin asignar">Sin asignar</SelectItem>
                      {tecnicosList.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nombre} {t.apellidos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {isEdicion && ticketSeleccionado && (
                    <div className="pt-1 text-right">
                      <Link
                        href={`/admin/documentos/nuevo?ticketId=${ticketSeleccionado.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-end gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        Generar Orden de Servicio
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente</label>
                <Input
                  value={formTicket.cliente}
                  onChange={(e) => setFormTicket({ ...formTicket, cliente: e.target.value })}
                  placeholder="Nombre completo del cliente"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asunto</label>
                <Input
                  value={formTicket.asunto}
                  onChange={(e) => setFormTicket({ ...formTicket, asunto: e.target.value })}
                  placeholder="Resumen corto del problema"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descripción Detallada</label>
                <Textarea
                  value={formTicket.descripcion}
                  onChange={(e) => setFormTicket({ ...formTicket, descripcion: e.target.value })}
                  placeholder="Explica el problema con detalle..."
                  rows={4}
                />
              </div>

              {/* Sección de Resolución (solo edición) */}
              {isEdicion && (
                <div className="space-y-4 pt-4 border-t bg-blue-50/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Resolución Técnica
                  </h3>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diagnóstico</Label>
                    <Textarea
                      value={formTicket.diagnostico}
                      onChange={(e) => setFormTicket({ ...formTicket, diagnostico: e.target.value })}
                      placeholder="Causa raíz del problema..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Solución Aplicada</Label>
                    <Textarea
                      value={formTicket.solucion}
                      onChange={(e) => setFormTicket({ ...formTicket, solucion: e.target.value })}
                      placeholder="Pasos realizados para resolver la incidencia..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="kb-save"
                      checked={formTicket.guardarEnKB}
                      onCheckedChange={(checked) => setFormTicket({ ...formTicket, guardarEnKB: checked as boolean })}
                    />
                    <Label htmlFor="kb-save" className="cursor-pointer font-medium text-blue-800">
                      Generar nuevo borrador en Base de Conocimiento
                      <span className="block text-xs text-blue-600 font-normal mt-0.5">
                        Guarda una nueva entrada independiente con esta información actual.
                      </span>
                    </Label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                {isEdicion && (
                  <Button type="button" variant="secondary" onClick={handleImprimirEtiqueta} className="bg-gray-100 hover:bg-gray-200 border-gray-300 border text-gray-700">
                    <Printer className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={closeModals}>Cancelar</Button>
                <Button className="flex-1" onClick={handleGuardar}>
                  {isEdicion ? 'Actualizar Ticket' : 'Crear Ticket'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Responder */}
        <Dialog open={isReplying} onOpenChange={(open) => !open && setIsReplying(false)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Responder al Cliente
              </DialogTitle>
              {ticketSeleccionado && (
                <p className="text-sm text-muted-foreground mt-1">
                  Ticket {ticketSeleccionado.numero} - {ticketSeleccionado.cliente}
                </p>
              )}
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <p className="font-medium">Información:</p>
                <p>El mensaje se enviará al cliente y quedará registrado en el historial del ticket. El cliente podrá verlo desde su panel.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-message" className="font-bold">Mensaje</Label>
                <Textarea
                  id="reply-message"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Escriba su respuesta aquí..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsReplying(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSendReply} disabled={!replyMessage.trim() || isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar Respuesta'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>


      {/* Modal Convertir a Pedido */}
      <Dialog open={isConverting} onOpenChange={(open) => !open && setIsConverting(false)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Crear Pedido de Reparación
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Agrega mano de obra y piezas para generar el pedido y la factura.
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">

            {/* Labor */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
              <Label className="font-bold flex justify-between">
                <span>Mano de Obra (80€/hora)</span>
                <span className="text-primary">{(repairData.laborHours * 80).toFixed(2)}€</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={repairData.laborHours}
                  onChange={(e) => setRepairData({ ...repairData, laborHours: parseFloat(e.target.value) || 0 })}
                  className="w-24 text-center font-mono"
                />
                <span className="text-sm text-gray-600">horas</span>
              </div>
            </div>

            {/* Parts */}
            <div className="space-y-3">
              <Label className="font-bold">Piezas y Repuestos</Label>

              <div className="space-y-2 mb-4">
                {repairData.parts.map((part, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white border rounded shadow-sm">
                    <span>{part.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono">{part.cost.toFixed(2)}€</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removePart(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {repairData.parts.length === 0 && <p className="text-sm text-gray-400 italic">No hay piezas agregadas</p>}
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <p className="text-xs mb-1 text-gray-500">Nombre de la pieza</p>
                  <Input
                    placeholder="Ej: Batería compatible..."
                    value={newPart.name}
                    onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  />
                </div>
                <div className="w-24">
                  <p className="text-xs mb-1 text-gray-500">Coste (€)</p>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newPart.cost}
                    onChange={(e) => setNewPart({ ...newPart, cost: e.target.value })}
                  />
                </div>
                <Button onClick={addPart} size="icon" className="shrink-0" disabled={!newPart.name || !newPart.cost}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Total Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500">Total Estimado (con IVA)</p>
                  <p className="text-3xl font-bold text-green-700">{calculateTotal().toFixed(2)}€</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsConverting(false)}>Cancelar</Button>
                  <Button onClick={handleConvertirPedido} className="bg-green-600 hover:bg-green-700">
                    Confirmar y Generar
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de preview de imagen */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-5xl p-0">
            <div className="relative w-full h-[80vh]">
              <Image
                src={previewImage}
                alt="Vista previa"
                fill
                className="object-contain bg-gray-100"
                sizes="100vw"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div >
  )
}
