'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Star, MessageSquare } from 'lucide-react'
import { MetadatosEncuesta } from '@/types/plantillas'
import { DocumentoTipo } from '@/types/enums'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface EncuestaFormProps {
    ticket: any
    onSuccess?: (documento: any) => void
    onCancel?: () => void
}

export function EncuestaForm({ ticket, onSuccess, onCancel }: EncuestaFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState<MetadatosEncuesta>({
        valoracionTecnica: {
            tiempoRespuesta: 5,
            profesionalidad: 5,
            claridad: 5,
            resolucion: 5,
            tiempoTotal: 5
        },
        valoracionGlobal: {
            recomendaria: true,
            volveriaSolicitar: true,
            requiereSeguimiento: false
        },
        comentarios: {
            positivos: '',
            mejorar: '',
            adicionales: ''
        },
        autorizaTestimonio: false
    })

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/admin/documentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: DocumentoTipo.ENCUESTA_SATISFACCION,
                    ticketId: ticket.id,
                    metadatos: JSON.stringify(formData)
                })
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Encuesta guardada",
                    description: "La encuesta de satisfacción se ha registrado correctamente.",
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

    const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b last:border-0 hover:bg-muted/20 px-2 rounded">
            <Label className="mb-2 sm:mb-0 text-sm font-medium">{label}</Label>
            <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex flex-col items-center cursor-pointer" onClick={() => onChange(rating as any)}>
                        <div className={`p-1 rounded-full ${value >= rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                            <Star className={`h-6 w-6 ${value >= rating ? 'fill-yellow-500' : ''}`} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{rating}</span>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
            <CardHeader className="bg-primary/5 border-b mb-6">
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    Encuesta de Satisfacción
                </CardTitle>
                <CardDescription>
                    Ticket #{ticket.numeroTicket} - Valoración del Servicio
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* 1. Valoración Técnica */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary bg-primary/5 p-2 rounded">Valoración Técnica</h3>
                    <div className="space-y-1">
                        <StarRating
                            label="1. Tiempo de respuesta inicial"
                            value={formData.valoracionTecnica.tiempoRespuesta}
                            onChange={(v) => setFormData(p => ({ ...p, valoracionTecnica: { ...p.valoracionTecnica, tiempoRespuesta: v as any } }))}
                        />
                        <StarRating
                            label="2. Profesionalidad del técnico"
                            value={formData.valoracionTecnica.profesionalidad}
                            onChange={(v) => setFormData(p => ({ ...p, valoracionTecnica: { ...p.valoracionTecnica, profesionalidad: v as any } }))}
                        />
                        <StarRating
                            label="3. Claridad en la explicación"
                            value={formData.valoracionTecnica.claridad}
                            onChange={(v) => setFormData(p => ({ ...p, valoracionTecnica: { ...p.valoracionTecnica, claridad: v as any } }))}
                        />
                        <StarRating
                            label="4. Resolución efectiva del problema"
                            value={formData.valoracionTecnica.resolucion}
                            onChange={(v) => setFormData(p => ({ ...p, valoracionTecnica: { ...p.valoracionTecnica, resolucion: v as any } }))}
                        />
                        <StarRating
                            label="5. Tiempo total de resolución"
                            value={formData.valoracionTecnica.tiempoTotal}
                            onChange={(v) => setFormData(p => ({ ...p, valoracionTecnica: { ...p.valoracionTecnica, tiempoTotal: v as any } }))}
                        />
                    </div>
                </div>

                {/* 2. Valoración Global */}
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-semibold mb-4 text-blue-900">Valoración Global</h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="rec"
                                checked={formData.valoracionGlobal.recomendaria}
                                onCheckedChange={(c) => setFormData(p => ({ ...p, valoracionGlobal: { ...p.valoracionGlobal, recomendaria: c as boolean } }))}
                            />
                            <Label htmlFor="rec" className="text-base cursor-pointer">Recomendaría el servicio a otros</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="vol"
                                checked={formData.valoracionGlobal.volveriaSolicitar}
                                onCheckedChange={(c) => setFormData(p => ({ ...p, valoracionGlobal: { ...p.valoracionGlobal, volveriaSolicitar: c as boolean } }))}
                            />
                            <Label htmlFor="vol" className="text-base cursor-pointer">Volvería a solicitar soporte con nosotros</Label>
                        </div>
                        <div className="flex items-center space-x-2 text-amber-700">
                            <Checkbox
                                id="seg"
                                className="border-amber-400 data-[state=checked]:bg-amber-500"
                                checked={formData.valoracionGlobal.requiereSeguimiento}
                                onCheckedChange={(c) => setFormData(p => ({ ...p, valoracionGlobal: { ...p.valoracionGlobal, requiereSeguimiento: c as boolean } }))}
                            />
                            <Label htmlFor="seg" className="text-base cursor-pointer font-bold">El caso NO está cerrado / Requiere seguimiento</Label>
                        </div>
                    </div>
                </div>

                {/* 3. Comentarios */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Comentarios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-green-700 font-semibold">Aspectos Positivos</Label>
                            <Textarea
                                placeholder="¿Qué es lo que más le ha gustado?"
                                className="border-green-200 bg-green-50/30 min-h-[100px]"
                                value={formData.comentarios.positivos}
                                onChange={(e) => setFormData(p => ({ ...p, comentarios: { ...p.comentarios, positivos: e.target.value } }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-orange-700 font-semibold">Aspectos a Mejorar</Label>
                            <Textarea
                                placeholder="¿En qué podemos mejorar?"
                                className="border-orange-200 bg-orange-50/30 min-h-[100px]"
                                value={formData.comentarios.mejorar}
                                onChange={(e) => setFormData(p => ({ ...p, comentarios: { ...p.comentarios, mejorar: e.target.value } }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/20">
                    <Checkbox
                        id="testimonio"
                        checked={formData.autorizaTestimonio}
                        onCheckedChange={(c) => setFormData(p => ({ ...p, autorizaTestimonio: c as boolean }))}
                    />
                    <Label htmlFor="testimonio" className="cursor-pointer text-sm text-muted-foreground">
                        Autorizo a utilizar mis comentarios positivos como testimonio público (web, redes sociales, etc.)
                    </Label>
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
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Registrar Encuesta
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
