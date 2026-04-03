import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import sharp from 'sharp';
import { uploadToStorage, getPublicUrl } from '@/lib/supabase-storage';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No se ha proporcionado ningún archivo' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Procesar imagen con sharp (ajustar tamaño y formato)
        const processedBuffer = await sharp(buffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toBuffer();

        // Generar nombre de archivo único
        const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;

        // Subir a Supabase Storage (bucket público: products)
        await uploadToStorage('products', fileName, processedBuffer, 'image/webp');

        // Obtener URL pública
        const publicUrl = getPublicUrl('products', fileName);

        return NextResponse.json({ path: publicUrl });
    } catch (error) {
        console.error('Error en la subida de imagen:', error);
        return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
    }
}
