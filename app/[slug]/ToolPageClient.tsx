'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ToolMetadata, ProcessingProgress } from '@/types/tool';
import { ManagedFile } from '@/types/file';
import { ToolShell } from '@/components/tool/ToolShell/ToolShell';
import { LoadingState } from '@/components/common/States/LoadingState';
import { ImageCompressorSettings } from '@/features/image/ImageCompressorOptions';
import { compressImageFile } from '@/lib/image/canvasCompressor';
import { trackToolView } from '@/lib/analytics/gtag';

// Dynamically import heavy tool workspaces for optimal code splitting & minimal initial bundle
const ImageCropperWorkspace = dynamic(
  () =>
    import('@/features/image/ImageCropper/ImageCropperWorkspace').then(
      (m) => m.ImageCropperWorkspace
    ),
  {
    loading: () => (
      <div style={{ padding: '3rem 0' }}>
        <LoadingState message="Loading Image Cropper..." />
      </div>
    ),
  }
);

const QrCodeGeneratorWorkspace = dynamic(
  () => import('@/features/qr/QrCodeGeneratorWorkspace').then((m) => m.QrCodeGeneratorWorkspace),
  {
    loading: () => (
      <div style={{ padding: '3rem 0' }}>
        <LoadingState message="Loading QR Code Generator..." />
      </div>
    ),
  }
);

const ImageCompressorOptions = dynamic(
  () => import('@/features/image/ImageCompressorOptions').then((m) => m.ImageCompressorOptions),
  {
    ssr: false,
  }
);

export interface ToolPageClientProps {
  tool: ToolMetadata;
}

export const ToolPageClient: React.FC<ToolPageClientProps> = ({ tool }) => {
  // Track individual tool route visit in Google Analytics
  useEffect(() => {
    trackToolView(tool.slug, tool.name, tool.category);
  }, [tool.slug, tool.name, tool.category]);

  // Option states for tools with options
  const defaultQuality =
    tool.slug === 'compress-image-to-50kb'
      ? 55
      : tool.slug === 'compress-image-to-100kb'
        ? 75
        : 80;

  const [compressorSettings, setCompressorSettings] = useState<ImageCompressorSettings>({
    quality: defaultQuality,
    outputFormat: 'original',
    removeMetadata: true,
  });

  // Dedicated standalone interactive workspaces
  const isCropper =
    tool.slug === 'image-cropper' ||
    tool.slug === 'passport-photo-maker' ||
    tool.slug === 'signature-cropper';

  if (isCropper) {
    return <ImageCropperWorkspace tool={tool} />;
  }

  const isQr =
    tool.slug === 'qr-code-generator' || tool.slug === 'upi-qr-code-generator';

  if (isQr) {
    return <QrCodeGeneratorWorkspace tool={tool} />;
  }

  const isCompressor =
    tool.slug === 'image-compressor' ||
    tool.slug === 'compress-image-to-50kb' ||
    tool.slug === 'compress-image-to-100kb';

  // Render tool options slot connected to settings state
  const renderOptionsSlot = () => {
    if (isCompressor) {
      return <ImageCompressorOptions onChange={setCompressorSettings} />;
    }
    return null;
  };

  const handleProcess = async (
    files: ManagedFile[],
    onProgress: (progress: ProcessingProgress) => void
  ): Promise<ManagedFile[] | void> => {
    if (isCompressor) {
      const total = files.length;
      for (let i = 0; i < total; i++) {
        const file = files[i];
        if (!file) continue;

        onProgress({
          percentage: Math.round(((i + 0.5) / total) * 100),
          currentStep: `Compressing ${file.name}...`,
        });

        const outputFormat =
          compressorSettings.outputFormat === 'original'
            ? undefined
            : compressorSettings.outputFormat;

        const res = await compressImageFile(file.originalFile, {
          quality: compressorSettings.quality / 100,
          outputFormat,
        });

        file.processedBlob = res.blob;
        file.processedSize = res.size;
        file.status = 'completed';
        file.progress = 100;
      }

      onProgress({
        percentage: 100,
        currentStep: 'All images compressed successfully!',
      });
      return files;
    }
    return files;
  };

  return (
    <ToolShell
      tool={tool}
      optionsSlot={renderOptionsSlot()}
      onProcess={isCompressor ? handleProcess : undefined}
      processButtonLabel={
        isCompressor
          ? 'Compress Images'
          : tool.slug === 'pdf-merger'
            ? 'Merge PDFs'
            : tool.slug === 'image-converter'
              ? 'Convert Format'
              : 'Process Files'
      }
    />
  );
};
