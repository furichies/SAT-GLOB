import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No se ha proporcionado ningún archivo' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Crear el directorio de subida si no existe
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        await mkdir(uploadDir, { recursive: true });

        // Generar nombre de archivo único
        const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
        const filePath = path.join(uploadDir, fileName);

        // Procesar imagen con sharp (ajustar tamaño y formato)
        await sharp(buffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toFile(filePath);

        // Ruta pública para acceder a la imagen
        const publicPath = `/uploads/products/${fileName}`;

        return NextResponse.json({ path: publicPath });
    } catch (error) {
        console.error('Error en la subida de imagen:', error);
        return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
    }
}
