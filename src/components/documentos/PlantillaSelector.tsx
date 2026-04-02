'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    FileText,
    Monitor,
    PackageCheck,
    ShieldCheck,
    Star,
    PlusCircle
} from 'lucide-react'
import { MantenimientoForm } from './plantillas/MantenimientoForm'
import { InstalacionForm } from './plantillas/InstalacionForm'
import { EntregaForm } from './plantillas/EntregaForm'
import { AccesoRemotoForm } from './plantillas/AccesoRemotoForm'
import { EncuestaForm } from './plantillas/EncuestaForm'
import { MantenimientoPreventivoForm } from './plantillas/MantenimientoPreventivoForm'
import { InstalacionConfiguracionForm } from './plantillas/InstalacionConfiguracionForm'

interface PlantillaSelectorProps {
    ticket: any
    onDocumentGenerated?: () => void
}

type TipoPlantilla =
    | 'mantenimiento'
    | 'instalacion'
    | 'entrega'
    | 'acceso_remoto'
    | 'encuesta'
    | 'mantenimiento_preventivo'
    | 'instalacion_configuracion'
    | null

export function PlantillaSelector({ ticket, onDocumentGenerated }: PlantillaSelectorProps) {
    const [open, setOpen] = useState(false)
    const [selectedTipo, setSelectedTipo] = useState<TipoPlantilla>(null)

    const handleSuccess = (doc: any) => {
        setOpen(false)
        setSelectedTipo(null)
        if (onDocumentGenerated) onDocumentGenerated()
    }

    const handleCancel = () => {
        if (selectedTipo) {
            setSelectedTipo(null)
        } else {
            setOpen(false)
        }
    }

    const renderFormulario = () => {
        switch (selectedTipo) {
            case 'mantenimiento':
                return <MantenimientoForm ticket={ticket} onSuccess={handleSuccess} onCancel={handleCancel} />
            case 'instalacion':
                return <InstalacionForm ticket={ticket} onSuccess={handleSuccess} onCancel={handleCancel} />
            case 'entrega':
                return <EntregaForm ticket={ticket} onSuccess={handleSuccess} onCancel={handleCancel} />
            case 'acceso_remoto':
                return <AccesoRemotoForm ticket={ticket} onSuccess={handleSuccess} onCancel={handleCancel} />
            case 'encuesta':
                return <EncuestaForm ticket={ticket} onSuccess={handleSuccess} onCancel={handleCancel} />
            case 'mantenimiento_preventivo':
                return <MantenimientoPreventivoForm ticket={ticket} onSuccess={handleSuccess} onCancel={handleCancel} />
            case 'instalacion_configuracion':
                return <InstalacionConfiguracionForm ticket={ticket} onSuccess={handleSuccess} onCancel={handleCancel} />
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold shadow-sm mt-3">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Generar Documentación Técnica
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {selectedTipo ? 'Completar Documento' : 'Seleccionar Tipo de Documento'}
                    </DialogTitle>
                </DialogHeader>

                {!selectedTipo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group"
                            onClick={() => setSelectedTipo('mantenimiento')}
                        >
                            <FileText className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-center">
                                <span className="font-bold block text-lg">Mantenimiento Preventivo</span>
                                <span className="text-xs text-muted-foreground">Informe de revisión periódica</span>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group"
                            onClick={() => setSelectedTipo('instalacion')}
                        >
                            <Monitor className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-center">
                                <span className="font-bold block text-lg">Acta de Instalación</span>
                                <span className="text-xs text-muted-foreground">Despliegue y configuración</span>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group"
                            onClick={() => setSelectedTipo('entrega')}
                        >
                            <PackageCheck className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-center">
                                <span className="font-bold block text-lg">Informe de Entrega</span>
                                <span className="text-xs text-muted-foreground">Post-reparación y garantías</span>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group"
                            onClick={() => setSelectedTipo('acceso_remoto')}
                        >
                            <ShieldCheck className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-center">
                                <span className="font-bold block text-lg">Acceso Remoto</span>
                                <span className="text-xs text-muted-foreground">Autorización legal</span>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group"
                            onClick={() => setSelectedTipo('encuesta')}
                        >
                            <Star className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-center">
                                <span className="font-bold block text-lg">Encuesta de Satisfacción</span>
                                <span className="text-xs text-muted-foreground">Valoración del cliente</span>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group"
                            onClick={() => setSelectedTipo('mantenimiento_preventivo')}
                        >
                            <FileText className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-center">
                                <span className="font-bold block text-lg">Informe Mantenimiento Preventivo</span>
                                <span className="text-xs text-muted-foreground">Revisión completa de hardware y software</span>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 group md:col-span-2"
                            onClick={() => setSelectedTipo('instalacion_configuracion')}
                        >
                            <Monitor className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-center">
                                <span className="font-bold block text-lg">Acta Instalación y Configuración</span>
                                <span className="text-xs text-muted-foreground">Instalación completa de equipos y sistemas</span>
                            </div>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-4">
                        {renderFormulario()}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
