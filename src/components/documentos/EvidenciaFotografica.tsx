'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, X, Image as ImageIcon, Trash2, Eye } from 'lucide-react'
import Image from 'next/image'

interface EvidenciaFotografica {
    id: string
    url: string
    descripcion?: string
    fechaCaptura: Date | string
}

interface EvidenciaFotograficaProps {
    documentoId: string
    evidencias: EvidenciaFotografica[]
    onEvidenciasChange?: (evidencias: EvidenciaFotografica[]) => void
    readOnly?: boolean
}

export function EvidenciaFotografica({
    documentoId,
    evidencias: evidenciasIniciales,
    onEvidenciasChange,
    readOnly = false,
}: EvidenciaFotograficaProps) {
    const [evidencias, setEvidencias] = useState<EvidenciaFotografica[]>(evidenciasIniciales || [])
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [descripcion, setDescripcion] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setSelectedFiles(files)
        }
    }

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            selectedFiles.forEach((file) => {
                formData.append('files', file)
            })
            if (descripcion) {
                formData.append('descripcion', descripcion)
            }

            const response = await fetch(`/api/admin/documentos/${documentoId}/evidencias`, {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (data.success) {
                const nuevasEvidencias = [...evidencias, ...data.data.evidencias]
                setEvidencias(nuevasEvidencias)
                onEvidenciasChange?.(nuevasEvidencias)
                setSelectedFiles([])
                setDescripcion('')
                setDialogOpen(false)
            } else {
                alert('Error al subir evidencias: ' + data.error)
            }
        } catch (error) {
            console.error('Error al subir evidencias:', error)
            alert('Error al subir evidencias')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (evidenciaId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta evidencia?')) return

        try {
            const response = await fetch(`/api/admin/documentos/${documentoId}/evidencias`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ evidenciaId }),
            })

            const data = await response.json()

            if (data.success) {
                const nuevasEvidencias = evidencias.filter((e) => e.id !== evidenciaId)
                setEvidencias(nuevasEvidencias)
                onEvidenciasChange?.(nuevasEvidencias)
            } else {
                alert('Error al eliminar evidencia: ' + data.error)
            }
        } catch (error) {
            console.error('Error al eliminar evidencia:', error)
            alert('Error al eliminar evidencia')
        }
    }

    const formatearFecha = (fecha: Date | string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Evidencias Fotográficas
                        </CardTitle>
                        <CardDescription>
                            {evidencias.length} evidencia(s) adjunta(s)
                        </CardDescription>
                    </div>
                    {!readOnly && (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Subir Evidencias
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Subir Evidencias Fotográficas</DialogTitle>
                                    <DialogDescription>
                                        Selecciona las imágenes que deseas adjuntar al documento
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="files">Archivos</Label>
                                        <Input
                                            id="files"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileSelect}
                                            disabled={isUploading}
                                        />
                                        {selectedFiles.length > 0 && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                {selectedFiles.length} archivo(s) seleccionado(s)
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="descripcion">Descripción (opcional)</Label>
                                        <Input
                                            id="descripcion"
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                            placeholder="Descripción de las evidencias..."
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setDialogOpen(false)}
                                            disabled={isUploading}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={handleUpload}
                                            disabled={isUploading || selectedFiles.length === 0}
                                        >
                                            {isUploading ? 'Subiendo...' : 'Subir'}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {evidencias.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No hay evidencias fotográficas adjuntas</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {evidencias.map((evidencia) => (
                            <div
                                key={evidencia.id}
                                className="relative group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="aspect-square relative bg-gray-100">
                                    <Image
                                        src={evidencia.url}
                                        alt={evidencia.descripcion || 'Evidencia'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    />
                                </div>
                                <div className="p-2 bg-white">
                                    <p className="text-xs text-gray-600 truncate">
                                        {evidencia.descripcion || 'Sin descripción'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatearFecha(evidencia.fechaCaptura)}
                                    </p>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setPreviewImage(evidencia.url)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {!readOnly && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleDelete(evidencia.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Preview Dialog */}
                {previewImage && (
                    <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Vista Previa</DialogTitle>
                            </DialogHeader>
                            <div className="relative w-full h-[600px]">
                                <Image
                                    src={previewImage}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                    sizes="100vw"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    )
}
