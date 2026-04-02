'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, UnlockKeyhole, ShieldCheck, Plus, Trash2 } from 'lucide-react'
import { MetadatosAccesoRemoto } from '@/types/plantillas'
import { DocumentoTipo } from '@/types/enums'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface AccesoRemotoFormProps {
    ticket: any
    onSuccess?: (documento: any) => void
    onCancel?: () => void
}

export function AccesoRemotoForm({ ticket, onSuccess, onCancel }: AccesoRemotoFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Datos iniciales
    const [formData, setFormData] = useState<MetadatosAccesoRemoto>({
        equiposAutorizados: [],
        tipoAcceso: {
            soportePuntual: true,
            mantenimientoProgramado: false,
            monitorizacionContinua: false,
            instalacionSoftware: false,
            resolucionIncidencia: ticket.numeroTicket
        },
        limitaciones: {
            horario: { desde: '09:00', hasta: '18:00', dias: 'Lunes a Viernes' }
        },
        vigencia: {
            desde: new Date().toISOString().split('T')[0],
        },
        autorizante: {
            nombre: ticket.usuario?.nombre || '',
            cargo: '',
            empresa: '',
            cif: ticket.usuario?.dni || '', // Usamos DNI como CIF temporal si está disponible
            telefono: ticket.usuario?.telefono || '',
            email: ticket.usuario?.email || ''
        }
    })

    // Estado temporal para añadir equipos
    const [nuevoEquipo, setNuevoEquipo] = useState({
        nombreId: '',
        ipIdRemoto: '',
        sistema: ''
    })

    const agregarEquipo = () => {
        if (!nuevoEquipo.nombreId) return
        setFormData(prev => ({
            ...prev,
            equiposAutorizados: [...prev.equiposAutorizados, nuevoEquipo]
        }))
        setNuevoEquipo({ nombreId: '', ipIdRemoto: '', sistema: '' })
    }

    const eliminarEquipo = (index: number) => {
        setFormData(prev => ({
            ...prev,
            equiposAutorizados: prev.equiposAutorizados.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/admin/documentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: DocumentoTipo.AUTORIZACION_ACCESO_REMOTO,
                    ticketId: ticket.id,
                    metadatos: JSON.stringify(formData)
                })
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Autorización generada",
                    description: "El documento de autorización se ha creado correctamente.",
                })
                if (onSuccess) onSuccess(data.data)
            } else {
                throw new Error(data.error || "Error al crear documento")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <CardHeader className="bg-primary/5 border-b mb-6">
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <ShieldCheck className="h-5 w-5" />
                    Autorización de Acceso Remoto
                </CardTitle>
                <CardDescription>
                    Documento contractual para cumplimiento GDPR/LOPD
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* 1. Datos del Autorizante */}
                <div className="bg-slate-50 p-4 rounded-lg border">
                    <h3 className="text-md font-semibold mb-3">Datos del Autorizante (Cliente)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Nombre Completo</Label>
                            <Input
                                value={formData.autorizante.nombre}
                                onChange={(e) => setFormData(p => ({ ...p, autorizante: { ...p.autorizante, nombre: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Empresa</Label>
                            <Input
                                value={formData.autorizante.empresa}
                                onChange={(e) => setFormData(p => ({ ...p, autorizante: { ...p.autorizante, empresa: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>CIF / NIF</Label>
                            <Input
                                value={formData.autorizante.cif}
                                onChange={(e) => setFormData(p => ({ ...p, autorizante: { ...p.autorizante, cif: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Cargo / Relación</Label>
                            <Input
                                placeholder="Gerente / Propietario IT / etc."
                                value={formData.autorizante.cargo}
                                onChange={(e) => setFormData(p => ({ ...p, autorizante: { ...p.autorizante, cargo: e.target.value } }))}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Equipos Autorizados */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Equipos y Sistemas Autorizados</h3>

                    <div className="bg-muted/30 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
                        <div className="md:col-span-3 space-y-1">
                            <Label className="text-xs">Identificador Equipo</Label>
                            <Input
                                placeholder="PC-CONTABILIDAD-01"
                                value={nuevoEquipo.nombreId}
                                onChange={(e) => setNuevoEquipo(p => ({ ...p, nombreId: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs">IP / AnyDesk ID</Label>
                            <Input
                                placeholder="192.168.1.50 / 123 456 789"
                                value={nuevoEquipo.ipIdRemoto}
                                onChange={(e) => setNuevoEquipo(p => ({ ...p, ipIdRemoto: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-1 space-y-1">
                            <Label className="text-xs">Sistema</Label>
                            <Input
                                placeholder="Win 11"
                                value={nuevoEquipo.sistema}
                                onChange={(e) => setNuevoEquipo(p => ({ ...p, sistema: e.target.value }))}
                            />
                        </div>
                        <Button variant="secondary" onClick={agregarEquipo} disabled={!nuevoEquipo.nombreId}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {formData.equiposAutorizados.length > 0 ? (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Equipo</TableHead>
                                        <TableHead>ID Acceso</TableHead>
                                        <TableHead>Sistema</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.equiposAutorizados.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{item.nombreId}</TableCell>
                                            <TableCell className="font-mono">{item.ipIdRemoto}</TableCell>
                                            <TableCell>{item.sistema}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => eliminarEquipo(i)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/5">
                            <UnlockKeyhole className="h-10 w-10 text-muted-foreground/50 mb-2" />
                            <p>Añada los equipos donde se permitirá el acceso remoto</p>
                        </div>
                    )}
                </div>

                {/* 3. Tipo y Limitaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-md font-semibold mb-3">Tipo de Acceso</h3>
                        <div className="space-y-3">
                            {[
                                { k: 'soportePuntual', l: 'Soporte técnico puntual (sesión)' },
                                { k: 'mantenimientoProgramado', l: 'Mantenimiento programado' },
                                { k: 'monitorizacionContinua', l: 'Monitorización continua' },
                                { k: 'instalacionSoftware', l: 'Instalación de software' },
                            ].map((item: any) => (
                                <div key={item.k} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={item.k}
                                        checked={formData.tipoAcceso[item.k as keyof typeof formData.tipoAcceso] as boolean}
                                        onCheckedChange={(c) => setFormData(p => ({
                                            ...p,
                                            tipoAcceso: { ...p.tipoAcceso, [item.k]: c }
                                        }))}
                                    />
                                    <Label htmlFor={item.k} className="cursor-pointer">{item.l}</Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2 pt-2 border-t mt-2">
                                <Label className="text-xs text-muted-foreground">Vinculado a Ticket:</Label>
                                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{formData.tipoAcceso.resolucionIncidencia}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-semibold mb-3">Vigencia y Horario</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>Desde</Label>
                                    <Input
                                        type="date"
                                        value={formData.vigencia.desde}
                                        onChange={(e) => setFormData(p => ({ ...p, vigencia: { ...p.vigencia, desde: e.target.value } }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Hasta (Opcional)</Label>
                                    <Input
                                        type="date"
                                        value={formData.vigencia.hasta || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, vigencia: { ...p.vigencia, hasta: e.target.value } }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 p-3 bg-amber-50 rounded border border-amber-100">
                                <Label className="text-amber-900">Horario Permitido</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input
                                        placeholder="09:00"
                                        value={formData.limitaciones.horario?.desde}
                                        onChange={(e) => setFormData(p => ({
                                            ...p, limitaciones: { ...p.limitaciones, horario: { ...p.limitaciones.horario!, desde: e.target.value } }
                                        }))}
                                    />
                                    <Input
                                        placeholder="18:00"
                                        value={formData.limitaciones.horario?.hasta}
                                        onChange={(e) => setFormData(p => ({
                                            ...p, limitaciones: { ...p.limitaciones, horario: { ...p.limitaciones.horario!, hasta: e.target.value } }
                                        }))}
                                    />
                                    <Input
                                        placeholder="L-V"
                                        value={formData.limitaciones.horario?.dias}
                                        onChange={(e) => setFormData(p => ({
                                            ...p, limitaciones: { ...p.limitaciones, horario: { ...p.limitaciones.horario!, dias: e.target.value } }
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-100 p-4 rounded text-xs text-muted-foreground">
                    <p className="font-bold mb-1">CLÁUSULA DE CONFIDENCIALIDAD AUTOMÁTICA:</p>
                    <p>
                        El técnico se compromete a no acceder a datos personales sin autorización, no copiar ni divulgar información,
                        y registrar únicamente las actividades técnicas necesarias. Esta autorización puede revocarse en cualquier momento.
                    </p>
                </div>

            </CardContent>
            <CardFooter className="flex justify-between border-t p-6 bg-muted/5">
                <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[200px]">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Generar Autorización
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
