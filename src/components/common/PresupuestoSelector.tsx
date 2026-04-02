'use client'

import { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Cliente {
    id: string
    nombre: string
    apellidos: string
    email: string
    telefono: string
    direccion: string
    codigoPostal: string
    ciudad: string
}

interface Presupuesto {
    id: string
    numeroDocumento: string
    numeroTicket: string
    fechaGeneracion: string
    estadoDocumento: string
    ticketId: string
    cliente: Cliente | null
}

interface PresupuestoSelectorProps {
    value: string
    onChange: (presupuesto: Presupuesto) => void
    disabled?: boolean
    ticketId?: string // Filtrar por ticket específico
}

export function PresupuestoSelector({ value, onChange, disabled, ticketId }: PresupuestoSelectorProps) {
    const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchPresupuestos = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (ticketId) {
                    params.append('ticketId', ticketId)
                }

                const res = await fetch(`/api/admin/presupuestos?${params.toString()}`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.success && data.data?.presupuestos) {
                        setPresupuestos(data.data.presupuestos)
                    }
                }
            } catch (error) {
                console.error('Error cargando presupuestos:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPresupuestos()
    }, [ticketId])

    const handleValueChange = (id: string) => {
        const presupuesto = presupuestos.find(p => p.id === id)
        if (presupuesto) {
            onChange(presupuesto)
        }
    }

    return (
        <Select
            value={value}
            onValueChange={handleValueChange}
            disabled={disabled || loading}
        >
            <SelectTrigger>
                <SelectValue placeholder={loading ? "Cargando presupuestos..." : "Seleccionar presupuesto"} />
            </SelectTrigger>
            <SelectContent>
                {presupuestos.length === 0 && !loading && (
                    <div className="p-2 text-sm text-gray-500 text-center">
                        No hay presupuestos disponibles
                    </div>
                )}
                {presupuestos.map((presupuesto) => (
                    <SelectItem key={presupuesto.id} value={presupuesto.id}>
                        {presupuesto.numeroDocumento} - Ticket: {presupuesto.numeroTicket}
                        {presupuesto.cliente && ` - ${presupuesto.cliente.nombre} ${presupuesto.cliente.apellidos || ''}`}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
