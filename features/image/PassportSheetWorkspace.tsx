'use client';

import React, { useState, useEffect } from 'react';
import { Download, Grid, Printer, RotateCcw, Sparkles } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Button } from '@/components/common/Button/Button';
import { Card } from '@/components/common/Card/Card';
import { FileDropzone } from '@/components/file-upload/FileDropzone/FileDropzone';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import {
  generatePassportPhotoSheet,
  SheetPaperSize,
} from '@/lib/image/passportSheetGenerator';
import { downloadBlob, generateDownloadFilename } from '@/lib/file/fileUtils';
import { trackToolUse, trackToolDownload } from '@/lib/analytics/gtag';
import styles from './PassportSheet.module.scss';

export interface PassportSheetWorkspaceProps {
  tool: ToolMetadata;
}

export const PassportSheetWorkspace: React.FC<PassportSheetWorkspaceProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [paperSize, setPaperSize] = useState<SheetPaperSize>('4x6');
  const [showCutLines, setShowCutLines] = useState<boolean>(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sheetBlob, setSheetBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleFilesSelected = (files: FileList | File[]) => {
    const selected = files[0];
    if (selected) {
      setFile(selected);
    }
  };

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setSheetBlob(null);
      return;
    }

    let active = true;
    setIsGenerating(true);

    generatePassportPhotoSheet(file, {
      paperSize,
      showCutLines,
      borderColor: '#999999',
    })
      .then((blob) => {
        if (!active) return;
        setSheetBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate sheet', err);
        if (active) setIsGenerating(false);
      });

    return () => {
      active = false;
    };
  }, [file, paperSize, showCutLines]);

  const handleDownload = () => {
    if (!sheetBlob || !file) return;
    trackToolDownload(tool.slug, {
      fileCount: 1,
      toolName: tool.name,
      fileName: file.name,
    });
    const filename = generateDownloadFilename(
      `passport_sheet_${paperSize}_${file.name}`,
      'jpg'
    );
    downloadBlob(sheetBlob, filename);
  };

  const handlePrint = () => {
    if (!previewUrl) return;
    trackToolUse(tool.slug, 'print_sheet', {});
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Passport Photo Sheet</title>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
              img { max-width: 100%; height: auto; page-break-inside: avoid; }
              @page { margin: 0; }
            </style>
          </head>
          <body>
            <img src="${previewUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWin.document.close();
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setSheetBlob(null);
  };

  return (
    <div className={styles.workspace}>
      <ToolHeader tool={tool} />

      {!file ? (
        <div className={styles.uploadStage}>
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            acceptFormats={['image/jpeg', 'image/png', 'image/webp']}
            maxFiles={1}
            maxFileSizeMB={50}
            helperText="Upload 1 cropped passport photo to generate a printable sheet grid"
          />

          <div className={styles.goalBadgesCard}>
            <div className={styles.goalTitle}>
              <Sparkles size={16} />
              <span>One-Click Printable Sheet Layouts</span>
            </div>
            <div className={styles.goalGrid}>
              <div className={styles.goalChip}>
                <Grid size={18} />
                <div>
                  <strong>8 Photos on 4×6" Paper</strong>
                  <p>Standard Photo Paper Size for Xerox & Print Shops</p>
                </div>
              </div>
              <div className={styles.goalChip}>
                <Grid size={18} />
                <div>
                  <strong>12 Photos on A4 Paper</strong>
                  <p>Standard Home & Office Printer Paper</p>
                </div>
              </div>
              <div className={styles.goalChip}>
                <Grid size={18} />
                <div>
                  <strong>16 Photos on A4 Paper</strong>
                  <p>Maximum Density Sheet Layout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.activeStage}>
          <Card variant="glass" padding="md" className={styles.controlsCard}>
            <h3 className={styles.controlsTitle}>⚙️ Paper Size & Sheet Options</h3>
            <div className={styles.presetButtonsRow}>
              <button
                type="button"
                className={`${styles.presetBtn} ${paperSize === '4x6' ? styles.presetBtnActive : ''}`}
                onClick={() => setPaperSize('4x6')}
              >
                📸 8 Photos (4×6" Paper)
              </button>
              <button
                type="button"
                className={`${styles.presetBtn} ${paperSize === 'a4_12' ? styles.presetBtnActive : ''}`}
                onClick={() => setPaperSize('a4_12')}
              >
                📄 12 Photos (A4 Paper)
              </button>
              <button
                type="button"
                className={`${styles.presetBtn} ${paperSize === 'a4_16' ? styles.presetBtnActive : ''}`}
                onClick={() => setPaperSize('a4_16')}
              >
                📄 16 Photos (A4 Paper)
              </button>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                />
                <span>Show Dashed Cutting Border Guidelines ✂️</span>
              </label>
            </div>
          </Card>

          <Card variant="glass" padding="md" className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <h4>Print Sheet Live Preview</h4>
              {isGenerating && <span className={styles.generatingBadge}>Rendering Sheet...</span>}
            </div>

            {previewUrl && (
              <div className={styles.previewImageContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Passport photo sheet preview" className={styles.previewImg} />
              </div>
            )}

            <div className={styles.actionsBar}>
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Printer size={18} />}
                onClick={handlePrint}
                disabled={isGenerating || !previewUrl}
              >
                Print Sheet Now
              </Button>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Download size={18} />}
                onClick={handleDownload}
                disabled={isGenerating || !previewUrl}
              >
                Download High-Res Sheet (JPG)
              </Button>
              <Button
                variant="ghost"
                size="lg"
                leftIcon={<RotateCcw size={16} />}
                onClick={handleReset}
              >
                Upload Different Photo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
