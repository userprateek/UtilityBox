'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ToolMetadata } from '@/types/tool';
import { ToolShell } from '@/components/tool/ToolShell/ToolShell';
import { LoadingState } from '@/components/common/States/LoadingState';
import { ImageCompressorSettings } from '@/features/image/ImageCompressorOptions';

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
  const [_compressorSettings, setCompressorSettings] = useState<ImageCompressorSettings>({
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

  return (
    <ToolShell
      tool={tool}
      optionsSlot={renderOptionsSlot()}
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
