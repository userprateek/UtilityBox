'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Download,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Maximize2,
  Image as ImageIcon,
  Sliders,
  TrendingDown,
} from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Button } from '@/components/common/Button/Button';
import { Card } from '@/components/common/Card/Card';
import { Select } from '@/components/common/Select/Select';
import { FileDropzone } from '@/components/file-upload/FileDropzone/FileDropzone';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import { NormalizedCropBox, CropResult, cropImageFile } from '@/lib/image/canvasCropper';
import { compressImageAdvanced } from '@/lib/image/clientImageCompressor';
import {
  formatBytes,
  calculateSavings,
  downloadBlob,
  generateDownloadFilename,
} from '@/lib/file/fileUtils';
import { trackToolUse, trackToolDownload } from '@/lib/analytics/gtag';
import styles from './ImageCropper.module.scss';

export interface ImageCropperWorkspaceProps {
  tool: ToolMetadata;
}

export type AspectRatioPreset =
  'free' | 'passport' | 'signature' | '1:1' | '16:9' | '4:3' | '3:2' | '9:16';

type HandleType = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';

/**
 * Calculates a centered crop box in normalized percentages (0 to 1) for a given aspect ratio preset.
 */
function computeCropBoxForRatio(
  ratio: AspectRatioPreset,
  naturalW: number,
  naturalH: number
): NormalizedCropBox {
  if (ratio === 'free' || naturalW === 0 || naturalH === 0) {
    return { x: 0.1, y: 0.1, width: 0.8, height: 0.8 };
  }

  let targetRatio = 1;
  switch (ratio) {
    case 'passport':
      targetRatio = 35 / 45; // ~0.777 standard passport photo
      break;
    case 'signature':
      targetRatio = 3 / 1; // 3:1 signature banner
      break;
    case '1:1':
      targetRatio = 1;
      break;
    case '16:9':
      targetRatio = 16 / 9;
      break;
    case '4:3':
      targetRatio = 4 / 3;
      break;
    case '3:2':
      targetRatio = 3 / 2;
      break;
    case '9:16':
      targetRatio = 9 / 16;
      break;
  }

  const imgAspect = naturalW / naturalH;
  let newW = 0.85;
  let newH = (newW * imgAspect) / targetRatio;

  if (newH > 0.85) {
    newH = 0.85;
    newW = (newH * targetRatio) / imgAspect;
  }

  newW = Math.min(0.95, Math.max(0.05, newW));
  newH = Math.min(0.95, Math.max(0.05, newH));

  return {
    x: Math.max(0, (1 - newW) / 2),
    y: Math.max(0, (1 - newH) / 2),
    width: newW,
    height: newH,
  };
}

export const ImageCropperWorkspace: React.FC<ImageCropperWorkspaceProps> = ({ tool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Default initial aspect ratio based on tool intent
  const initialRatio: AspectRatioPreset =
    tool.slug === 'passport-photo-maker'
      ? 'passport'
      : tool.slug === 'signature-cropper'
        ? 'signature'
        : 'free';

  const defaultTargetKb =
    tool.slug === 'signature-cropper' ? 20 : tool.slug === 'passport-photo-maker' ? 50 : 100;

  // Crop box in normalized percentages (0 to 1)
  const [cropBox, setCropBox] = useState<NormalizedCropBox>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  });

  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>(initialRatio);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>(
    'image/jpeg'
  );
  const [quality, setQuality] = useState<number>(90);

  // Optional target file size compression in same panel (enabled by default for signature & passport)
  const [targetSizeEnabled, setTargetSizeEnabled] = useState<boolean>(
    tool.slug === 'signature-cropper' || tool.slug === 'passport-photo-maker'
  );
  const [targetKb, setTargetKb] = useState<number>(defaultTargetKb);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cropResult, setCropResult] = useState<CropResult | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const activeDragRef = useRef<{
    handle: HandleType;
    startX: number;
    startY: number;
    startCrop: NormalizedCropBox;
  } | null>(null);

  // Load image when file is selected
  useEffect(() => {
    if (!selectedFile) {
      setImageSrc(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setImageSrc(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  // Clean up result URL on unmount or reset
  useEffect(() => {
    return () => {
      if (cropResult?.url) {
        URL.revokeObjectURL(cropResult.url);
      }
    };
  }, [cropResult]);

  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNaturalSize({ width: nw, height: nh });

    // Set initial crop box matching tool's selected aspect ratio (e.g. 3:1 signature or 35:45 passport)
    const initialBox = computeCropBoxForRatio(aspectRatio, nw, nh);
    setCropBox(initialBox);
  };

  const isQuarterTurn = rotation === 90 || rotation === 270;
  const orientedWidth = isQuarterTurn ? naturalSize.height : naturalSize.width;
  const orientedHeight = isQuarterTurn ? naturalSize.width : naturalSize.height;

  // Adjust crop box when aspect ratio preset changes
  const applyAspectRatio = useCallback(
    (ratio: AspectRatioPreset) => {
      setAspectRatio(ratio);
      const w = isQuarterTurn ? naturalSize.height : naturalSize.width;
      const h = isQuarterTurn ? naturalSize.width : naturalSize.height;
      if (w > 0 && h > 0) {
        setCropBox(computeCropBoxForRatio(ratio, w, h));
      }
    },
    [naturalSize, isQuarterTurn]
  );

  useEffect(() => {
    if (orientedWidth > 0 && orientedHeight > 0) {
      setCropBox(computeCropBoxForRatio(aspectRatio, orientedWidth, orientedHeight));
    }
    // Re-fit the crop window to the oriented canvas after rotate, not after flip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotation]);

  // Global window listeners for drag & resize
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!activeDragRef.current || !viewportRef.current) return;

      const { handle, startX, startY, startCrop } = activeDragRef.current;
      const rect = viewportRef.current.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) return;

      const deltaX = (e.clientX - startX) / rect.width;
      const deltaY = (e.clientY - startY) / rect.height;

      setCropBox(() => {
        let { x, y, width, height } = startCrop;

        if (handle === 'move') {
          x = Math.max(0, Math.min(1 - width, startCrop.x + deltaX));
          y = Math.max(0, Math.min(1 - height, startCrop.y + deltaY));
          return { x, y, width, height };
        }

        // When a fixed aspect ratio preset is active (e.g. signature 3:1, passport 35:45, 1:1, etc.)
        if (aspectRatio !== 'free' && naturalSize.width > 0 && naturalSize.height > 0) {
          let targetRatio = 1;
          switch (aspectRatio) {
            case 'signature':
              targetRatio = 3 / 1;
              break;
            case 'passport':
              targetRatio = 35 / 45;
              break;
            case '1:1':
              targetRatio = 1;
              break;
            case '16:9':
              targetRatio = 16 / 9;
              break;
            case '4:3':
              targetRatio = 4 / 3;
              break;
            case '3:2':
              targetRatio = 3 / 2;
              break;
            case '9:16':
              targetRatio = 9 / 16;
              break;
          }

          const imgAspect = orientedWidth / orientedHeight;

          if (handle === 'se' || handle === 'e' || handle === 's') {
            let newW = Math.max(0.05, Math.min(1 - startCrop.x, startCrop.width + deltaX));
            let newH = (newW * imgAspect) / targetRatio;
            if (startCrop.y + newH > 1) {
              newH = 1 - startCrop.y;
              newW = (newH * targetRatio) / imgAspect;
            }
            width = newW;
            height = newH;
          } else if (handle === 'sw' || handle === 'w') {
            let newW = Math.max(
              0.05,
              Math.min(startCrop.x + startCrop.width, startCrop.width - deltaX)
            );
            let newH = (newW * imgAspect) / targetRatio;
            if (startCrop.y + newH > 1) {
              newH = 1 - startCrop.y;
              newW = (newH * targetRatio) / imgAspect;
            }
            x = startCrop.x + (startCrop.width - newW);
            width = newW;
            height = newH;
          } else if (handle === 'ne') {
            let newW = Math.max(0.05, Math.min(1 - startCrop.x, startCrop.width + deltaX));
            let newH = (newW * imgAspect) / targetRatio;
            if (startCrop.y + startCrop.height - newH < 0) {
              newH = startCrop.y + startCrop.height;
              newW = (newH * targetRatio) / imgAspect;
            }
            y = startCrop.y + (startCrop.height - newH);
            width = newW;
            height = newH;
          } else if (handle === 'nw' || handle === 'n') {
            let newW = Math.max(
              0.05,
              Math.min(startCrop.x + startCrop.width, startCrop.width - deltaX)
            );
            let newH = (newW * imgAspect) / targetRatio;
            if (startCrop.y + startCrop.height - newH < 0) {
              newH = startCrop.y + startCrop.height;
              newW = (newH * targetRatio) / imgAspect;
            }
            x = startCrop.x + (startCrop.width - newW);
            y = startCrop.y + (startCrop.height - newH);
            width = newW;
            height = newH;
          }

          return { x, y, width, height };
        }

        // Freeform Dragging
        // East (Right side)
        if (handle.includes('e')) {
          width = Math.max(0.05, Math.min(1 - startCrop.x, startCrop.width + deltaX));
        }
        // West (Left side)
        if (handle.includes('w')) {
          const maxLeftShift = startCrop.x + startCrop.width - 0.05;
          x = Math.max(0, Math.min(maxLeftShift, startCrop.x + deltaX));
          width = startCrop.width + (startCrop.x - x);
        }
        // South (Bottom side)
        if (handle.includes('s')) {
          height = Math.max(0.05, Math.min(1 - startCrop.y, startCrop.height + deltaY));
        }
        // North (Top side)
        if (handle.includes('n')) {
          const maxTopShift = startCrop.y + startCrop.height - 0.05;
          y = Math.max(0, Math.min(maxTopShift, startCrop.y + deltaY));
          height = startCrop.height + (startCrop.y - y);
        }

        return { x, y, width, height };
      });
    };

    const handleGlobalPointerUp = () => {
      activeDragRef.current = null;
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [aspectRatio, naturalSize, orientedWidth, orientedHeight]);

  const handlePointerDown = (e: React.PointerEvent, handle: HandleType) => {
    e.preventDefault();
    e.stopPropagation();

    activeDragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...cropBox },
    };
  };

  // Perform crop action + optional Target KB compression
  const handleExecuteCrop = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      // 1. Perform lossless canvas cropping & rotation
      const croppedResult = await cropImageFile(selectedFile, {
        cropBox,
        rotation,
        flipHorizontal: flipH,
        flipVertical: flipV,
        format: outputFormat,
        quality: quality / 100,
      });

      let finalBlob = croppedResult.blob;
      let finalSize = croppedResult.size;

      // 2. If user requested Target KB size constraint, compress in same flow
      if (targetSizeEnabled && targetKb > 0) {
        const croppedFile = new File([croppedResult.blob], selectedFile.name, {
          type: outputFormat,
        });

        const compressed = await compressImageAdvanced(croppedFile, {
          targetMaxSizeBytes: targetKb * 1024,
          outputFormat,
          quality: quality / 100,
        });

        finalBlob = compressed.blob;
        finalSize = compressed.size;
      }

      const finalUrl = URL.createObjectURL(finalBlob);

      trackToolUse(tool.slug, 'crop_execute', {
        aspect_ratio: aspectRatio,
        output_format: outputFormat,
        target_kb: targetSizeEnabled ? targetKb : undefined,
        width: croppedResult.width,
        height: croppedResult.height,
        final_size: finalSize,
      });

      setCropResult({
        blob: finalBlob,
        url: finalUrl,
        width: croppedResult.width,
        height: croppedResult.height,
        size: finalSize,
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Crop failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImageSrc(null);
    setCropResult(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspectRatio(initialRatio);
    setTargetSizeEnabled(
      tool.slug === 'signature-cropper' || tool.slug === 'passport-photo-maker'
    );
  };

  // Projected pixel dimensions
  const approxCroppedWidth = Math.round(cropBox.width * (orientedWidth || naturalSize.width));
  const approxCroppedHeight = Math.round(cropBox.height * (orientedHeight || naturalSize.height));

  const savings =
    selectedFile && cropResult ? calculateSavings(selectedFile.size, cropResult.size) : null;

  return (
    <div className={styles.cropperWrapper}>
      <ToolHeader tool={tool} />

      {!selectedFile ? (
        // Dropzone when no file selected
        <div className={styles.uploadContainer}>
          <FileDropzone
            onFilesSelected={(files) => {
              const fileList = Array.from(files);
              if (fileList.length > 0 && fileList[0]) {
                setSelectedFile(fileList[0]);
              }
            }}
            acceptFormats={['image/jpeg', 'image/png', 'image/webp', 'image/avif']}
            maxFiles={1}
            maxFileSizeMB={50}
            helperText="Select or drop any JPG, PNG, or WebP photo to crop"
          />
        </div>
      ) : cropResult ? (
        // Crop Result View
        <Card variant="glass" padding="lg" className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div className={styles.successBadgeIcon}>
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className={styles.resultTitle}>Image Cropped Successfully!</h2>
              <div
                className={styles.resultMeta}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginTop: '4px',
                }}
              >
                <span>
                  {cropResult.width} × {cropResult.height} px • {formatBytes(cropResult.size)} •{' '}
                  {outputFormat.replace('image/', '').toUpperCase()}
                </span>
                {savings && savings.isReduced && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--color-success)',
                      background: 'var(--color-success-bg)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    <TrendingDown size={13} /> -{savings.percentage}% (from{' '}
                    {formatBytes(selectedFile.size)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Result Preview Box */}
          <div className={styles.resultPreviewWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cropResult.url} alt="Cropped Preview" className={styles.resultImage} />
          </div>

          <div className={styles.resultActions}>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Download size={18} />}
              onClick={() => {
                const ext =
                  outputFormat === 'image/jpeg'
                    ? 'jpg'
                    : outputFormat === 'image/webp'
                      ? 'webp'
                      : 'png';
                const filename = generateDownloadFilename(selectedFile.name, 'cropped', ext);
                trackToolDownload(tool.slug, {
                  fileName: filename,
                  fileExtension: ext,
                  fileSize: cropResult.size,
                  toolName: tool.name,
                });
                downloadBlob(cropResult.blob, filename);
              }}
            >
              Download Cropped Image
            </Button>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Sliders size={16} />}
              onClick={() => setCropResult(null)}
            >
              Adjust Crop / Size
            </Button>
            <Button
              variant="ghost"
              size="lg"
              leftIcon={<RotateCcw size={16} />}
              onClick={handleReset}
            >
              Crop Another Photo
            </Button>
          </div>
        </Card>
      ) : (
        // Active Cropper Workspace
        <div className={styles.workspaceGrid}>
          {/* Main Canvas Editor Area */}
          <Card variant="glass" padding="md" className={styles.canvasCard}>
            {/* Toolbar Header */}
            <div className={styles.toolbarHeader}>
              <div className={styles.aspectPills}>
                <span className={styles.aspectLabel}>Ratio:</span>
                {(
                  ['free', 'signature', 'passport', '1:1', '4:3', '16:9'] as AspectRatioPreset[]
                ).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`${styles.ratioBtn} ${aspectRatio === preset ? styles.ratioActive : ''}`}
                    onClick={() => applyAspectRatio(preset)}
                  >
                    {preset === 'free'
                      ? 'Freeform'
                      : preset === 'passport'
                        ? 'Passport 35×45'
                        : preset === 'signature'
                          ? 'Signature 3:1'
                          : preset}
                  </button>
                ))}
              </div>

              <div className={styles.transformActions}>
                <button
                  type="button"
                  className={styles.toolIconBtn}
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw size={16} />
                </button>
                <button
                  type="button"
                  className={`${styles.toolIconBtn} ${flipH ? styles.toolIconActive : ''}`}
                  onClick={() => setFlipH(!flipH)}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal size={16} />
                </button>
                <button
                  type="button"
                  className={`${styles.toolIconBtn} ${flipV ? styles.toolIconActive : ''}`}
                  onClick={() => setFlipV(!flipV)}
                  title="Flip Vertical"
                >
                  <FlipVertical size={16} />
                </button>
              </div>
            </div>

            {/* Interactive Crop Stage */}
            <div className={styles.stage}>
              <div
                ref={viewportRef}
                className={`${styles.imageWrapper} ${styles.orientedViewport}`}
                style={
                  orientedWidth > 0 && orientedHeight > 0
                    ? { aspectRatio: `${orientedWidth} / ${orientedHeight}` }
                    : undefined
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imageSrc || ''}
                  alt="Original to crop"
                  className={styles.sourceImage}
                  style={{
                    width:
                      orientedWidth > 0
                        ? `${(naturalSize.width / orientedWidth) * 100}%`
                        : '100%',
                    height:
                      orientedHeight > 0
                        ? `${(naturalSize.height / orientedHeight) * 100}%`
                        : '100%',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  }}
                  onLoad={handleImageLoaded}
                  draggable={false}
                />

                {/* Dark Mask Overlays Outside Crop Box */}
                <div
                  className={`${styles.maskOverlay} ${styles.maskTop}`}
                  style={{ height: `${cropBox.y * 100}%` }}
                />
                <div
                  className={`${styles.maskOverlay} ${styles.maskBottom}`}
                  style={{
                    top: `${(cropBox.y + cropBox.height) * 100}%`,
                    height: `${(1 - cropBox.y - cropBox.height) * 100}%`,
                  }}
                />
                <div
                  className={`${styles.maskOverlay} ${styles.maskLeft}`}
                  style={{
                    top: `${cropBox.y * 100}%`,
                    height: `${cropBox.height * 100}%`,
                    width: `${cropBox.x * 100}%`,
                  }}
                />
                <div
                  className={`${styles.maskOverlay} ${styles.maskRight}`}
                  style={{
                    top: `${cropBox.y * 100}%`,
                    height: `${cropBox.height * 100}%`,
                    left: `${(cropBox.x + cropBox.width) * 100}%`,
                    width: `${(1 - cropBox.x - cropBox.width) * 100}%`,
                  }}
                />

                {/* Interactive Crop Box Window */}
                <div
                  className={styles.cropWindow}
                  style={{
                    left: `${cropBox.x * 100}%`,
                    top: `${cropBox.y * 100}%`,
                    width: `${cropBox.width * 100}%`,
                    height: `${cropBox.height * 100}%`,
                  }}
                >
                  {/* Drag Window Area */}
                  <div
                    className={styles.moveArea}
                    onPointerDown={(e) => handlePointerDown(e, 'move')}
                    title="Drag to reposition crop area"
                  />

                  {/* Grid Lines (Rule of Thirds) */}
                  <div className={styles.gridLineH1} />
                  <div className={styles.gridLineH2} />
                  <div className={styles.gridLineV1} />
                  <div className={styles.gridLineV2} />

                  {/* 4 Interactive Edge Lines */}
                  <div
                    className={`${styles.edgeLine} ${styles.edgeTop}`}
                    onPointerDown={(e) => handlePointerDown(e, 'n')}
                    title="Drag top edge"
                  />
                  <div
                    className={`${styles.edgeLine} ${styles.edgeBottom}`}
                    onPointerDown={(e) => handlePointerDown(e, 's')}
                    title="Drag bottom edge"
                  />
                  <div
                    className={`${styles.edgeLine} ${styles.edgeLeft}`}
                    onPointerDown={(e) => handlePointerDown(e, 'w')}
                    title="Drag left edge"
                  />
                  <div
                    className={`${styles.edgeLine} ${styles.edgeRight}`}
                    onPointerDown={(e) => handlePointerDown(e, 'e')}
                    title="Drag right edge"
                  />

                  {/* Side Grip Buttons on the lines */}
                  <button
                    type="button"
                    className={`${styles.sideButton} ${styles.sideButtonTop}`}
                    onPointerDown={(e) => handlePointerDown(e, 'n')}
                    aria-label="Adjust top side"
                    title="Drag top side"
                  >
                    <span className={styles.gripBarH} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.sideButton} ${styles.sideButtonBottom}`}
                    onPointerDown={(e) => handlePointerDown(e, 's')}
                    aria-label="Adjust bottom side"
                    title="Drag bottom side"
                  >
                    <span className={styles.gripBarH} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.sideButton} ${styles.sideButtonLeft}`}
                    onPointerDown={(e) => handlePointerDown(e, 'w')}
                    aria-label="Adjust left side"
                    title="Drag left side"
                  >
                    <span className={styles.gripBarV} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.sideButton} ${styles.sideButtonRight}`}
                    onPointerDown={(e) => handlePointerDown(e, 'e')}
                    aria-label="Adjust right side"
                    title="Drag right side"
                  >
                    <span className={styles.gripBarV} />
                  </button>

                  {/* 4 Corner Handles */}
                  <button
                    type="button"
                    className={`${styles.cornerHandle} ${styles.handleNW}`}
                    onPointerDown={(e) => handlePointerDown(e, 'nw')}
                    aria-label="Resize top-left corner"
                    title="Resize top-left corner"
                  />
                  <button
                    type="button"
                    className={`${styles.cornerHandle} ${styles.handleNE}`}
                    onPointerDown={(e) => handlePointerDown(e, 'ne')}
                    aria-label="Resize top-right corner"
                    title="Resize top-right corner"
                  />
                  <button
                    type="button"
                    className={`${styles.cornerHandle} ${styles.handleSE}`}
                    onPointerDown={(e) => handlePointerDown(e, 'se')}
                    aria-label="Resize bottom-right corner"
                    title="Resize bottom-right corner"
                  />
                  <button
                    type="button"
                    className={`${styles.cornerHandle} ${styles.handleSW}`}
                    onPointerDown={(e) => handlePointerDown(e, 'sw')}
                    aria-label="Resize bottom-left corner"
                    title="Resize bottom-left corner"
                  />
                </div>
              </div>
            </div>

            {/* Stage Info Footer */}
            <div className={styles.stageFooter}>
              <div className={styles.dimBadge}>
                <Maximize2 size={13} />
                <span>
                  Target:{' '}
                  <strong>
                    {approxCroppedWidth} × {approxCroppedHeight} px
                  </strong>
                </span>
                <span className={styles.originalDim}>
                  (Original: {naturalSize.width} × {naturalSize.height} px)
                </span>
              </div>

              <div className={styles.stageControls}>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RotateCcw size={14} />}
                  onClick={() => applyAspectRatio(aspectRatio)}
                >
                  Reset Box
                </Button>
              </div>
            </div>
          </Card>

          {/* Options & Execute Sidebar */}
          <div className={styles.sidebar}>
            <Card variant="glass" padding="md" className={styles.settingsCard}>
              <h3 className={styles.sidebarTitle}>Crop & Compression Settings</h3>

              {/* Format Selection */}
              <div className={styles.settingsGroup}>
                <Select
                  label="Target Format"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as typeof outputFormat)}
                  options={[
                    { value: 'image/jpeg', label: 'JPEG (Standard Photo)' },
                    { value: 'image/png', label: 'PNG (Lossless / Transparent)' },
                    { value: 'image/webp', label: 'WebP (Modern, Compact)' },
                  ]}
                />
              </div>

              {/* Target File Size Control (Optional Compression in Same Panel) */}
              <div
                style={{
                  background: 'var(--color-surface-subtle)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <label
                    htmlFor="targetSizeToggle"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    🎯 Limit Target File Size
                  </label>
                  <input
                    id="targetSizeToggle"
                    type="checkbox"
                    checked={targetSizeEnabled}
                    onChange={(e) => setTargetSizeEnabled(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </div>

                {targetSizeEnabled && (
                  <div style={{ marginTop: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                      }}
                    >
                      <input
                        type="number"
                        min={5}
                        max={5000}
                        value={targetKb}
                        onChange={(e) =>
                          setTargetKb(Math.max(5, parseInt(e.target.value, 10) || 5))
                        }
                        style={{
                          width: '90px',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-surface)',
                          color: 'var(--color-text-main)',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        KB (Strict Ceiling)
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {[20, 50, 100, 200].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setTargetKb(size)}
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 500,
                            borderRadius: '4px',
                            border:
                              targetKb === size
                                ? '1px solid var(--color-primary)'
                                : '1px solid var(--color-border)',
                            background:
                              targetKb === size ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: targetKb === size ? '#ffffff' : 'var(--color-text-main)',
                            cursor: 'pointer',
                          }}
                        >
                          {size === 20
                            ? '≤ 20KB (Sign)'
                            : size === 50
                              ? '≤ 50KB (Photo)'
                              : `≤ ${size}KB`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!targetSizeEnabled && outputFormat !== 'image/png' && (
                <div className={styles.settingsGroup}>
                  <div className={styles.sliderHeader}>
                    <label className={styles.label}>Export Quality</label>
                    <span className={styles.valueBadge}>{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={5}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                    className={styles.rangeInput}
                  />
                </div>
              )}

              <div className={styles.privacyNote}>
                <Sparkles size={14} className={styles.sparkleIcon} />
                <span>
                  {targetSizeEnabled
                    ? `Auto-crops & compresses under ${targetKb} KB in browser`
                    : '100% In-Browser Lossless Canvas Crop'}
                </span>
              </div>

              <div className={styles.actionButtons}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<Crop size={18} />}
                  isLoading={isProcessing}
                  onClick={handleExecuteCrop}
                >
                  {targetSizeEnabled ? `Crop & Compress (≤ ${targetKb} KB)` : 'Crop Image Now'}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  leftIcon={<ImageIcon size={16} />}
                  onClick={handleReset}
                >
                  Choose Different Photo
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
