'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ToolMetadata, ProcessingProgress } from '@/types/tool';
import { ManagedFile } from '@/types/file';
import { ToolShell } from '@/components/tool/ToolShell/ToolShell';
import { LoadingState } from '@/components/common/States/LoadingState';
import { ImageCompressorSettings } from '@/features/image/ImageCompressorOptions';
import { compressImageFile } from '@/lib/image/canvasCompressor';

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
  // Option states for tools with options
  const [compressorSettings, setCompressorSettings] = useState<ImageCompressorSettings>({
    quality: 80,
    outputFormat: 'original',
    removeMetadata: true,
  });

  // Dedicated standalone interactive workspaces
  if (tool.slug === 'image-cropper') {
    return <ImageCropperWorkspace tool={tool} />;
  }

  if (tool.slug === 'qr-code-generator') {
    return <QrCodeGeneratorWorkspace tool={tool} />;
  }

  // Render tool options slot connected to settings state
  const renderOptionsSlot = () => {
    switch (tool.slug) {
      case 'image-compressor':
        return <ImageCompressorOptions onChange={setCompressorSettings} />;
      default:
        return null;
    }
  };

  const handleProcess = async (
    files: ManagedFile[],
    onProgress: (progress: ProcessingProgress) => void
  ): Promise<ManagedFile[] | void> => {
    if (tool.slug === 'image-compressor') {
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
      onProcess={tool.slug === 'image-compressor' ? handleProcess : undefined}
      processButtonLabel={
        tool.slug === 'image-compressor'
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
