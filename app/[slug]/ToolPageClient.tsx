'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ToolMetadata, ProcessingProgress } from '@/types/tool';
import { ManagedFile } from '@/types/file';
import { ToolShell } from '@/components/tool/ToolShell/ToolShell';
import { LoadingState } from '@/components/common/States/LoadingState';
import { ImageCompressorSettings } from '@/features/image/ImageCompressorOptions';
import { ImageResizerSettings } from '@/features/image/ImageResizerOptions';
import { compressImageAdvanced } from '@/lib/image/clientImageCompressor';
import { mergePdfFiles } from '@/lib/pdf/pdfMerger';
import { splitPdfDocument, SplitPdfOptions } from '@/lib/pdf/pdfSplitter';
import { convertPdfToImages, PdfToImageOptions } from '@/lib/pdf/pdfToImage';
import { convertImagesToPdf, ImageToPdfOptions } from '@/lib/pdf/imageToPdf';
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

const ImageResizerOptions = dynamic(
  () => import('@/features/image/ImageResizerOptions').then((m) => m.ImageResizerOptions),
  {
    ssr: false,
  }
);

const PdfSplitterOptions = dynamic(
  () => import('@/features/pdf/PdfSplitterOptions').then((m) => m.PdfSplitterOptions),
  {
    ssr: false,
  }
);

const PdfToImageOptionsComponent = dynamic(
  () => import('@/features/pdf/PdfToImageOptions').then((m) => m.PdfToImageOptionsComponent),
  {
    ssr: false,
  }
);

const ImageToPdfOptionsComponent = dynamic(
  () => import('@/features/pdf/ImageToPdfOptions').then((m) => m.ImageToPdfOptionsComponent),
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
  const defaultTargetKb =
    tool.slug === 'compress-image-to-50kb'
      ? 50
      : tool.slug === 'compress-image-to-100kb'
        ? 100
        : 100;

  const [compressorSettings, setCompressorSettings] = useState<ImageCompressorSettings>({
    targetSizeEnabled: true,
    targetKb: defaultTargetKb,
    scaleMode: 'original',
    scalePercentage: 100,
    maintainAspectRatio: true,
    quality: 80,
    outputFormat: 'original',
    removeMetadata: true,
  });

  const [resizerSettings, setResizerSettings] = useState<ImageResizerSettings>({
    unit: 'px',
    width: 1080,
    height: 1080,
    percentage: 100,
    maintainAspectRatio: true,
    dpi: 300,
    outputFormat: 'original',
    quality: 90,
  });

  const [splitterSettings, setSplitterSettings] = useState<SplitPdfOptions>({
    mode: 'all_pages',
    pageRange: '1-3',
    fixedInterval: 2,
  });

  const [pdfToImageSettings, setPdfToImageSettings] = useState<PdfToImageOptions>({
    format: 'image/jpeg',
    dpi: 150,
    pageSelection: 'all',
    customPages: '1-3',
  });

  const [imageToPdfSettings, setImageToPdfSettings] = useState<ImageToPdfOptions>({
    pageSize: 'a4',
    orientation: 'auto',
    imagesPerPage: 1,
    margin: 'standard',
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

  const isResizer = tool.slug === 'image-resizer';
  const isSplitter = tool.slug === 'pdf-splitter';
  const isPdfToImage = tool.slug === 'pdf-to-image';
  const isImageToPdf = tool.slug === 'image-to-pdf';

  // Render tool options slot connected to settings state
  const renderOptionsSlot = () => {
    if (isCompressor) {
      return (
        <ImageCompressorOptions
          initialSettings={{ targetKb: defaultTargetKb, targetSizeEnabled: true }}
          onChange={setCompressorSettings}
        />
      );
    }
    if (isResizer) {
      return <ImageResizerOptions onChange={setResizerSettings} />;
    }
    if (isSplitter) {
      return <PdfSplitterOptions onChange={setSplitterSettings} />;
    }
    if (isPdfToImage) {
      return <PdfToImageOptionsComponent onChange={setPdfToImageSettings} />;
    }
    if (isImageToPdf) {
      return <ImageToPdfOptionsComponent onChange={setImageToPdfSettings} />;
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

        const targetMaxSizeBytes =
          compressorSettings.targetSizeEnabled && compressorSettings.targetKb
            ? compressorSettings.targetKb * 1024
            : undefined;

        const res = await compressImageAdvanced(file.originalFile, {
          quality: compressorSettings.quality / 100,
          outputFormat,
          scaleMode: compressorSettings.scaleMode,
          scalePercentage: compressorSettings.scalePercentage,
          dimensionPreset: compressorSettings.dimensionPreset,
          customWidth: compressorSettings.customWidth,
          customHeight: compressorSettings.customHeight,
          maintainAspectRatio: compressorSettings.maintainAspectRatio,
          targetMaxSizeBytes,
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

    if (isResizer) {
      const total = files.length;
      for (let i = 0; i < total; i++) {
        const file = files[i];
        if (!file) continue;

        onProgress({
          percentage: Math.round(((i + 0.5) / total) * 100),
          currentStep: `Resizing ${file.name}...`,
        });

        const outputFormat =
          resizerSettings.outputFormat === 'original'
            ? undefined
            : resizerSettings.outputFormat;

        let scaleMode: 'custom' | 'percentage' = 'custom';
        let scalePercentage = 100;
        let customWidth: number | undefined = resizerSettings.width;
        let customHeight: number | undefined = resizerSettings.height;

        if (resizerSettings.unit === 'percentage') {
          scaleMode = 'percentage';
          scalePercentage = resizerSettings.percentage;
          customWidth = undefined;
          customHeight = undefined;
        } else if (resizerSettings.unit === 'mm') {
          scaleMode = 'custom';
          customWidth = Math.round((resizerSettings.width / 25.4) * resizerSettings.dpi);
          customHeight = Math.round((resizerSettings.height / 25.4) * resizerSettings.dpi);
        } else if (resizerSettings.unit === 'cm') {
          scaleMode = 'custom';
          customWidth = Math.round((resizerSettings.width / 2.54) * resizerSettings.dpi);
          customHeight = Math.round((resizerSettings.height / 2.54) * resizerSettings.dpi);
        } else if (resizerSettings.unit === 'inch') {
          scaleMode = 'custom';
          customWidth = Math.round(resizerSettings.width * resizerSettings.dpi);
          customHeight = Math.round(resizerSettings.height * resizerSettings.dpi);
        }

        const res = await compressImageAdvanced(file.originalFile, {
          quality: resizerSettings.quality / 100,
          outputFormat,
          scaleMode,
          scalePercentage,
          customWidth,
          customHeight,
          maintainAspectRatio: resizerSettings.maintainAspectRatio,
        });

        file.processedBlob = res.blob;
        file.processedSize = res.size;
        file.status = 'completed';
        file.progress = 100;
      }

      onProgress({
        percentage: 100,
        currentStep: 'All images resized successfully!',
      });
      return files;
    }

    if (tool.slug === 'pdf-merger') {
      const originalFiles = files.map((f) => f.originalFile);
      const merged = await mergePdfFiles(originalFiles, (cur, tot, msg) => {
        onProgress({
          percentage: Math.round((cur / tot) * 100),
          currentStep: msg,
        });
      });

      const mergedFile: ManagedFile = {
        id: `merged-${Date.now()}`,
        originalFile: new File([merged.blob], merged.filename, { type: 'application/pdf' }),
        name: merged.filename,
        size: merged.size,
        type: 'application/pdf',
        status: 'completed',
        progress: 100,
        processedBlob: merged.blob,
        processedSize: merged.size,
      };

      onProgress({
        percentage: 100,
        currentStep: `Successfully merged ${files.length} PDFs into 1 document (${merged.pageCount} pages)!`,
      });

      return [mergedFile];
    }

    if (tool.slug === 'image-to-pdf') {
      const originalFiles = files.map((f) => f.originalFile);
      const converted = await convertImagesToPdf(
        originalFiles,
        imageToPdfSettings,
        (cur, tot, msg) => {
          onProgress({
            percentage: Math.round((cur / tot) * 100),
            currentStep: msg,
          });
        }
      );

      const pdfFile: ManagedFile = {
        id: `img2pdf-${Date.now()}`,
        originalFile: new File([converted.blob], converted.filename, { type: 'application/pdf' }),
        name: converted.filename,
        size: converted.size,
        type: 'application/pdf',
        status: 'completed',
        progress: 100,
        processedBlob: converted.blob,
        processedSize: converted.size,
      };

      onProgress({
        percentage: 100,
        currentStep: `Successfully converted ${files.length} images into PDF document!`,
      });

      return [pdfFile];
    }

    if (tool.slug === 'image-converter') {
      const total = files.length;
      for (let i = 0; i < total; i++) {
        const file = files[i];
        if (!file) continue;

        onProgress({
          percentage: Math.round(((i + 0.5) / total) * 100),
          currentStep: `Converting ${file.name}...`,
        });

        const res = await compressImageAdvanced(file.originalFile, {
          outputFormat: 'image/webp',
          quality: 0.9,
        });

        file.processedBlob = res.blob;
        file.processedSize = res.size;
        file.status = 'completed';
        file.progress = 100;
      }

      onProgress({
        percentage: 100,
        currentStep: 'All images converted successfully!',
      });
      return files;
    }

    if (tool.slug === 'pdf-splitter') {
      const file = files[0];
      if (!file) return files;

      const splitItems = await splitPdfDocument(file.originalFile, splitterSettings, (cur, tot, msg) => {
        onProgress({
          percentage: Math.round((cur / tot) * 100),
          currentStep: msg,
        });
      });

      const outputFiles: ManagedFile[] = splitItems.map((item, idx) => ({
        id: `split-${idx}-${Date.now()}`,
        originalFile: new File([item.blob], item.filename, { type: 'application/pdf' }),
        name: item.filename,
        size: item.size,
        type: 'application/pdf',
        status: 'completed',
        progress: 100,
        processedBlob: item.blob,
        processedSize: item.size,
      }));

      onProgress({
        percentage: 100,
        currentStep: `Successfully split PDF into ${outputFiles.length} file${outputFiles.length > 1 ? 's' : ''}!`,
      });

      return outputFiles;
    }

    if (tool.slug === 'pdf-to-image') {
      const file = files[0];
      if (!file) return files;

      const imgResults = await convertPdfToImages(file.originalFile, pdfToImageSettings, (cur, tot, msg) => {
        onProgress({
          percentage: Math.round((cur / tot) * 100),
          currentStep: msg,
        });
      });

      const outputFiles: ManagedFile[] = imgResults.map((item, idx) => ({
        id: `pdfimg-${idx}-${Date.now()}`,
        originalFile: new File([item.blob], item.filename, { type: item.blob.type }),
        name: item.filename,
        size: item.size,
        type: item.blob.type,
        previewUrl: item.previewUrl,
        status: 'completed',
        progress: 100,
        processedBlob: item.blob,
        processedSize: item.size,
      }));

      onProgress({
        percentage: 100,
        currentStep: `Successfully converted PDF into ${outputFiles.length} image${outputFiles.length > 1 ? 's' : ''}!`,
      });

      return outputFiles;
    }

    return files;
  };

  const isActionTool =
    isCompressor ||
    isResizer ||
    tool.slug === 'pdf-merger' ||
    tool.slug === 'pdf-splitter' ||
    tool.slug === 'pdf-to-image' ||
    tool.slug === 'image-to-pdf' ||
    tool.slug === 'image-converter';

  return (
    <ToolShell
      tool={tool}
      optionsSlot={renderOptionsSlot()}
      onProcess={isActionTool ? handleProcess : undefined}
      processButtonLabel={
        isCompressor
          ? 'Compress Images'
          : isResizer
            ? 'Resize Images'
            : tool.slug === 'pdf-merger'
              ? 'Merge PDF Files'
              : tool.slug === 'pdf-splitter'
                ? 'Split PDF Document'
                : tool.slug === 'pdf-to-image'
                  ? 'Convert PDF to Images'
                  : tool.slug === 'image-to-pdf'
                    ? 'Convert to PDF'
                    : tool.slug === 'image-converter'
                      ? 'Convert Format'
                      : 'Process Files'
      }
    />
  );
};
