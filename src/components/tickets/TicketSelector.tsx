'use client'

import { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Ticket } from '@/types/sat'

interface TicketSelectorProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function TicketSelector({ value, onChange, disabled }: TicketSelectorProps) {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [searching, setSearching] = useState(false)
    const [searchResult, setSearchResult] = useState<'found' | 'not-found' | null>(null)

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true)
            try {
                const res = await fetch('/api/sat/tickets')
                if (!res.ok) throw new Error('Error al cargar tickets')
                const data = await res.json()
                if (Array.isArray(data)) {
                    setTickets(data)
                } else if (data.tickets && Array.isArray(data.tickets)) {
                    setTickets(data.tickets)
                } else {
                    setTickets([])
                }
            } catch (err) {
                console.error(err)
                setError('No se pudieron cargar los tickets')
            } finally {
                setLoading(false)
            }
        }

        fetchTickets()
    }, [])

    useEffect(() => {
        if (!searchInput.trim()) {
            setSearchResult(null)
            return
        }

        const searchTimeout = setTimeout(async () => {
            setSearching(true)
            setSearchResult(null)
            
            try {
                const foundInList = tickets.find(
                    t => t.id === searchInput.trim() || 
                         t.numeroTicket.toLowerCase() === searchInput.trim().toLowerCase()
                )

                if (foundInList) {
                    onChange(foundInList.id)
                    setSearchResult('found')
                } else {
                    const res = await fetch(`/api/sat/tickets?search=${encodeURIComponent(searchInput.trim())}`)
                    if (res.ok) {
                        const data = await res.json()
                        const ticketsArray = Array.isArray(data) ? data : (data.tickets || [])
                        const found = ticketsArray.find(
                            (t: Ticket) => t.id === searchInput.trim() || 
                                         t.numeroTicket.toLowerCase() === searchInput.trim().toLowerCase()
                        )
                        
                        if (found) {
                            if (!tickets.find(t => t.id === found.id)) {
                                setTickets(prev => [...prev, found])
                            }
                            onChange(found.id)
                            setSearchResult('found')
                        } else {
                            setSearchResult('not-found')
                        }
                    } else {
                        setSearchResult('not-found')
                    }
                }
            } catch (err) {
                console.error('Error buscando ticket:', err)
                setSearchResult('not-found')
            } finally {
                setSearching(false)
            }
        }, 500)

        return () => clearTimeout(searchTimeout)
    }, [searchInput, tickets, onChange])

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <Label htmlFor="ticket-search" className="text-sm text-gray-600">
                    Buscar por ID o Número de Ticket
                </Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="ticket-search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Pega o escribe el ID o número del ticket..."
                        className="pl-10 pr-10"
                        disabled={disabled}
                    />
                    {searching && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
                    )}
                    {!searching && searchResult === 'found' && (
                        <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {!searching && searchResult === 'not-found' && (
                        <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                </div>
                {searchResult === 'not-found' && (
                    <p className="text-xs text-red-500">
                        No se encontró ningún ticket con ese identificador
                    </p>
                )}
            </div>

            <div className="space-y-1">
                <Label htmlFor="ticket-select" className="text-sm text-gray-600">
                    O selecciona de la lista
                </Label>
                <Select
                    value={value}
                    onValueChange={onChange}
                    disabled={disabled || loading || tickets.length === 0}
                >
                    <SelectTrigger id="ticket-select" className="w-full">
                        <SelectValue placeholder={
                            loading ? "Cargando tickets..." :
                                error ? "Error al cargar" :
                                    tickets.length === 0 ? "No hay tickets disponibles" :
                                        "Selecciona un ticket abierto"
                        } />
                    </SelectTrigger>
                    <SelectContent>
                        {tickets.map((ticket) => (
                            <SelectItem key={ticket.id} value={ticket.id}>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{ticket.numeroTicket}</span>
                                    <span className="text-gray-500 text-sm truncate max-w-[200px]">
                                        - {ticket.asunto}
                                    </span>
                                    <Badge variant="outline" className="text-xs ml-auto">
                                        {ticket.estado}
                                    </Badge>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {value && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                        ✓ Ticket seleccionado: {tickets.find(t => t.id === value)?.numeroTicket || value}
                    </p>
                    {tickets.find(t => t.id === value)?.asunto && (
                        <p className="text-xs text-green-600 mt-1">
                            {tickets.find(t => t.id === value)?.asunto}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
