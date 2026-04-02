'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info, ArrowRight, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function WorkflowGuide() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    className="gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 shadow-sm font-medium"
                >
                    <Info className="h-5 w-5" />
                    Guía de Flujo
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Flujo de Documentación SAT</DialogTitle>
                    <DialogDescription>
                        Guía visual del proceso de generación de documentos y alertas.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Fase 1: Entrada */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="bg-blue-100 p-2 rounded-full mt-1">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900">1. Orden de Servicio</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Documento inicial al recibir el equipo.
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-sm font-medium text-blue-800">
                                <ArrowRight className="h-4 w-4" />
                                Siguiente paso: Diagnóstico y Presupuesto
                            </div>
                        </div>
                    </div>

                    {/* Fase 2: Diagnóstico */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
                        <div className="bg-amber-100 p-2 rounded-full mt-1">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900">2. Diagnóstico y Presupuesto</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Evaluación técnica y coste. El cliente debe decidir.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <div className="p-2 bg-green-50 rounded border border-green-100 text-sm">
                                    <span className="font-semibold text-green-700">Aceptación</span>
                                    <p className="text-xs text-green-600 mt-1">Procede a reparación</p>
                                </div>
                                <div className="p-2 bg-red-50 rounded border border-red-100 text-sm">
                                    <span className="font-semibold text-red-700">Rechazo</span>
                                    <p className="text-xs text-red-600 mt-1">Devolución sin reparación</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fase 3: Cierre */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="bg-slate-200 p-2 rounded-full mt-1">
                            <CheckCircle className="h-5 w-5 text-slate-700" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">3. Cierre y Entrega</h3>
                            <p className="text-sm text-slate-700 mt-1">
                                Proceso final obligatorio tras decisión del cliente.
                            </p>

                            <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-800 p-2 bg-white rounded border">
                                    <span className="font-bold text-xs uppercase bg-slate-100 px-2 py-0.5 rounded">Obligatorio</span>
                                    Albarán de Entrega
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-800 p-2 bg-white rounded border">
                                    <span className="font-bold text-xs uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Automático</span>
                                    Factura (Generada automáticamente)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-4 border-t pt-4">
                        * En caso de <strong>Extensión de Presupuesto</strong>, se requerirá una nueva aceptación antes de proceder al Albarán y Factura final.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
