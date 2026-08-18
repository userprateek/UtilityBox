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
} from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Button } from '@/components/common/Button/Button';
import { Card } from '@/components/common/Card/Card';
import { Select } from '@/components/common/Select/Select';
import { FileDropzone } from '@/components/file-upload/FileDropzone/FileDropzone';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import { NormalizedCropBox, CropResult, cropImageFile } from '@/lib/image/canvasCropper';
import { formatBytes, downloadBlob, generateDownloadFilename } from '@/lib/file/fileUtils';
import { trackToolUse, trackToolDownload } from '@/lib/analytics/gtag';
import styles from './ImageCropper.module.scss';

export interface ImageCropperWorkspaceProps {
  tool: ToolMetadata;
}

type AspectRatioPreset =
  | 'free'
  | 'passport'
  | 'signature'
  | '1:1'
  | '16:9'
  | '4:3'
  | '3:2'
  | '9:16';

type HandleType = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';

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
    'image/png'
  );
  const [quality, setQuality] = useState<number>(90);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cropResult, setCropResult] = useState<CropResult | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
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
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    // Center crop box to 80%
    setCropBox({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  };

  // Adjust crop box when aspect ratio preset changes
  const applyAspectRatio = useCallback(
    (ratio: AspectRatioPreset) => {
      setAspectRatio(ratio);
      if (ratio === 'free') return;

      let targetRatio = 1;
      switch (ratio) {
        case 'passport':
          targetRatio = 35 / 45; // Standard 35x45mm passport ratio (~0.777)
          break;
        case 'signature':
          targetRatio = 3 / 1; // Standard 3:1 signature ratio
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

      setCropBox((prev) => {
        if (naturalSize.width === 0 || naturalSize.height === 0) return prev;
        const imgAspect = naturalSize.width / naturalSize.height;

        // Calculate normalized width and height to match aspect ratio
        let newW = 0.8;
        let newH = (newW * imgAspect) / targetRatio;

        if (newH > 0.9) {
          newH = 0.8;
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
      });
    },
    [naturalSize]
  );

  // Global window listeners for drag & resize
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!activeDragRef.current || !imgRef.current) return;

      const { handle, startX, startY, startCrop } = activeDragRef.current;
      const rect = imgRef.current.getBoundingClientRect();

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

        // East (Right side)
        if (handle.includes('e')) {
          width = Math.max(0.05, Math.min(1 - startCrop.x, startCrop.width + deltaX));
        }

        // South (Bottom side)
        if (handle.includes('s')) {
          height = Math.max(0.05, Math.min(1 - startCrop.y, startCrop.height + deltaY));
        }

        // West (Left side)
        if (handle.includes('w')) {
          const maxLeft = startCrop.x + startCrop.width - 0.05;
          const newX = Math.max(0, Math.min(maxLeft, startCrop.x + deltaX));
          width = startCrop.width + (startCrop.x - newX);
          x = newX;
        }

        // North (Top side)
        if (handle.includes('n')) {
          const maxTop = startCrop.y + startCrop.height - 0.05;
          const newY = Math.max(0, Math.min(maxTop, startCrop.y + deltaY));
          height = startCrop.height + (startCrop.y - newY);
          y = newY;
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
  }, []);

  // Pointer start on handle or side line
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

  // Perform crop action
  const handleExecuteCrop = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const result = await cropImageFile(selectedFile, {
        cropBox,
        rotation,
        flipHorizontal: flipH,
        flipVertical: flipV,
        format: outputFormat,
        quality: quality / 100,
      });

      trackToolUse(tool.slug, 'crop_execute', {
        aspect_ratio: aspectRatio,
        output_format: outputFormat,
        width: result.width,
        height: result.height,
      });

      setCropResult(result);
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
    setAspectRatio('free');
  };

  // Projected pixel dimensions
  const approxCroppedWidth = Math.round(cropBox.width * naturalSize.width);
  const approxCroppedHeight = Math.round(cropBox.height * naturalSize.height);

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
              <p className={styles.resultMeta}>
                {cropResult.width} × {cropResult.height} px • {formatBytes(cropResult.size)} •{' '}
                {outputFormat.replace('image/', '').toUpperCase()}
              </p>
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
              leftIcon={<Crop size={16} />}
              onClick={() => setCropResult(null)}
            >
              Adjust Crop
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
                  [
                    'free',
                    'passport',
                    'signature',
                    '1:1',
                    '4:3',
                    '16:9',
                  ] as AspectRatioPreset[]
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
              <div className={styles.imageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imageSrc!}
                  alt="Original to crop"
                  className={styles.sourceImg}
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  }}
                  onLoad={handleImageLoaded}
                  draggable={false}
                />

                {/* Dark Vignette Overlay Mask & Crop Boundary */}
                <div
                  className={styles.cropBox}
                  style={{
                    left: `${cropBox.x * 100}%`,
                    top: `${cropBox.y * 100}%`,
                    width: `${cropBox.width * 100}%`,
                    height: `${cropBox.height * 100}%`,
                  }}
                >
                  {/* Center Move Area */}
                  <div
                    className={styles.moveArea}
                    onPointerDown={(e) => handlePointerDown(e, 'move')}
                    title="Drag to reposition crop area"
                  />

                  {/* Rule of Thirds Guidelines */}
                  <div className={styles.gridLineH1} />
                  <div className={styles.gridLineH2} />
                  <div className={styles.gridLineV1} />
                  <div className={styles.gridLineV2} />

                  {/* Full Edge Drag Hitboxes */}
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
                  onClick={() => setCropBox({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 })}
                >
                  Reset Box
                </Button>
              </div>
            </div>
          </Card>

          {/* Options & Execute Sidebar */}
          <div className={styles.sidebar}>
            <Card variant="glass" padding="md" className={styles.settingsCard}>
              <h3 className={styles.sidebarTitle}>Export Settings</h3>

              <div className={styles.settingsGroup}>
                <Select
                  label="Target Format"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as typeof outputFormat)}
                  options={[
                    { value: 'image/png', label: 'PNG (Lossless / Transparent)' },
                    { value: 'image/jpeg', label: 'JPEG (Standard photo)' },
                    { value: 'image/webp', label: 'WebP (Modern, compact)' },
                  ]}
                />
              </div>

              {outputFormat !== 'image/png' && (
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
                <span>100% In-Browser Lossless Canvas Crop</span>
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
                  Crop Image Now
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
