'use client'

import { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Tecnico {
    id: string
    nombre: string
    apellidos: string
    rol: string
}

interface TecnicoSelectorProps {
    value: string
    onChange: (id: string, nombreCompleto: string) => void
    disabled?: boolean
}

export function TecnicoSelector({ value, onChange, disabled }: TecnicoSelectorProps) {
    const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchTecnicos = async () => {
            setLoading(true)
            try {
                const res = await fetch('/api/admin/tecnicos')
                if (res.ok) {
                    const data = await res.json()
                    // Manejar tanto el formato { success, data: { tecnicos } } como array directo
                    if (data.success && data.data?.tecnicos) {
                        setTecnicos(data.data.tecnicos)
                    } else if (Array.isArray(data)) {
                        setTecnicos(data)
                    }
                }
            } catch (error) {
                console.error('Error cargando técnicos:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTecnicos()
    }, [])

    const handleValueChange = (id: string) => {
        const tecnico = tecnicos.find(t => t.id === id)
        if (tecnico) {
            onChange(id, `${tecnico.nombre} ${tecnico.apellidos || ''}`.trim())
        }
    }

    return (
        <Select
            key={value} // Forzamos re-render si el valor cambia para asegurar sincronización visual
            value={value || ""}
            onValueChange={handleValueChange}
            disabled={disabled || loading}
        >
            <SelectTrigger>
                <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar técnico"} />
            </SelectTrigger>
            <SelectContent>
                {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id}>
                        {tecnico.nombre} {tecnico.apellidos} ({tecnico.rol})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
