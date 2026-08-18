import { NextRequest, NextResponse } from 'next/server';
import { processImageWithSharp } from '@/lib/image/sharpCompressor';
import { ImageCompressionOptions, DimensionPreset } from '@/lib/image/types';

export const runtime = 'nodejs';

/**
 * Server-Side Backend Image Compression API powered by sharp (libvips).
 * Supports:
 * - MozJPEG, WebP, AVIF, and 8-bit PNG palette quantization
 * - Target KB constraints
 * - Resolution downscaling & exam presets (Passport, Signature, Postcard)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Extract options from form data
    const targetKb = formData.get('targetKb') ? parseInt(formData.get('targetKb') as string, 10) : undefined;
    const quality = formData.get('quality') ? parseFloat(formData.get('quality') as string) : 0.8;
    const scaleMode = (formData.get('scaleMode') as ImageCompressionOptions['scaleMode']) || 'original';
    const scalePercentage = formData.get('scalePercentage') ? parseInt(formData.get('scalePercentage') as string, 10) : 100;
    const dimensionPreset = formData.get('dimensionPreset') as DimensionPreset | undefined;
    const customWidth = formData.get('width') ? parseInt(formData.get('width') as string, 10) : undefined;
    const customHeight = formData.get('height') ? parseInt(formData.get('height') as string, 10) : undefined;
    const format = (formData.get('format') as ImageCompressionOptions['outputFormat']) || 'image/jpeg';
    const keepMetadata = formData.get('keepMetadata') === 'true';

    const result = await processImageWithSharp(inputBuffer, {
      quality,
      targetMaxSizeBytes: targetKb ? targetKb * 1024 : undefined,
      scaleMode,
      scalePercentage,
      dimensionPreset,
      customWidth,
      customHeight,
      outputFormat: format,
      keepMetadata,
    });

    return new NextResponse(result.buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': result.format,
        'Content-Disposition': `attachment; filename="compressed_${file.name.replace(/\.[^.]+$/, '')}.${result.format.replace('image/', '')}"`,
        'X-Processed-Width': String(result.width),
        'X-Processed-Height': String(result.height),
        'X-Processed-Size': String(result.size),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
