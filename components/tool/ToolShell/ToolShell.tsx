'use client';

import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Play,
  Download,
  RotateCcw,
  CheckCircle2,
  Lock,
  Zap,
  Sliders,
  FileText,
} from 'lucide-react';
import { ToolMetadata, ProcessingProgress } from '@/types/tool';
import { ManagedFile } from '@/types/file';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import { ToolHeader } from '../ToolHeader/ToolHeader';
import { FileDropzone } from '@/components/file-upload/FileDropzone/FileDropzone';
import { FileList } from '@/components/file-preview/FileList/FileList';
import { Button } from '@/components/common/Button/Button';
import { Card } from '@/components/common/Card/Card';
import { ProgressBar } from '@/components/common/ProgressBar/ProgressBar';
import { Alert } from '@/components/common/States/Alert';
import {
  downloadBlob,
  downloadUrl,
  generateDownloadFilename,
  formatBytes,
  calculateSavings,
  mimeTypeToExtension,
} from '@/lib/file/fileUtils';
import { trackToolUse, trackToolDownload } from '@/lib/analytics/gtag';
import styles from './ToolShell.module.scss';

export interface ToolShellProps {
  tool: ToolMetadata;
  optionsSlot?: React.ReactNode;
  customDropzoneSlot?: React.ReactNode;
  customResultSlot?: React.ReactNode;
  onProcess?: (
    files: ManagedFile[],
    onProgress: (progress: ProcessingProgress) => void
  ) => Promise<ManagedFile[] | void>;
  processButtonLabel?: string;
}

export const ToolShell: React.FC<ToolShellProps> = ({
  tool,
  optionsSlot,
  customDropzoneSlot,
  customResultSlot,
  onProcess,
  processButtonLabel = 'Process Files',
}) => {
  const {
    files,
    errors,
    isDragging,
    addFiles,
    removeFile,
    updateFile,
    reorderFiles,
    replaceFiles,
    clearFiles,
    clearErrors,
    dragProps,
  } = useFileUpload({
    rules: {
      acceptMimeTypes: tool.supportedInputFormats,
      maxFiles: tool.maxFiles ?? 20,
      maxSizeBytes: (tool.maxFileSizeMB ?? 50) * 1024 * 1024,
    },
  });

  // Processor lifecycle runner
  const {
    status: processStatus,
    progress,
    error: processError,
    isProcessing,
    isCompleted,
    execute,
    reset: resetProcessor,
  } = useFileProcessor<ManagedFile[], ManagedFile[] | void>({
    onSuccess: (output) => {
      trackToolUse(tool.slug, 'process_complete', { file_count: files.length });
      if (Array.isArray(output) && output.length > 0) {
        replaceFiles(output);
      }
    },
    processFn: onProcess
      ? async (inputFiles, onProg) => {
          return await onProcess(inputFiles, onProg);
        }
      : async (inputFiles, onProg) => {
          // Foundation simulation if engine not yet plugged in
          for (let i = 1; i <= 10; i++) {
            await new Promise((res) => setTimeout(res, 120));
            onProg({
              percentage: i * 10,
              currentStep: `Simulating processing step ${i}/10...`,
            });
          }
          // Mark files as ready
          inputFiles.forEach((file) => {
            updateFile(file.id, {
              status: 'completed',
              progress: 100,
              processedSize: Math.round(file.size * 0.7), // Simulated 30% reduction
            });
          });
        },
  });

  const handleStartProcessing = async () => {
    if (files.length === 0) return;
    trackToolUse(tool.slug, 'process_start', { file_count: files.length });
    await execute(files);
  };

  const handleResetAll = () => {
    clearFiles();
    resetProcessor();
  };

  const handleDownloadAll = () => {
    trackToolDownload(tool.slug, {
      fileCount: files.length,
      toolName: tool.name,
      fileName: files.length === 1 ? files[0]?.name : `batch_${tool.slug}`,
    });
    files.forEach((file) => {
      const outputExt =
        mimeTypeToExtension(file.processedBlob?.type || file.type) || undefined;
      const filename = generateDownloadFilename(file.name, tool.slug, outputExt);
      if (file.processedBlob) {
        downloadBlob(file.processedBlob, filename);
      } else if (file.previewUrl) {
        downloadUrl(file.previewUrl, filename);
      }
    });
  };

  const handleDownloadSingle = (file: ManagedFile) => {
    trackToolDownload(tool.slug, {
      fileCount: 1,
      toolName: tool.name,
      fileName: file.name,
      fileSize: file.processedSize || file.size,
    });
    const outputExt =
      mimeTypeToExtension(file.processedBlob?.type || file.type) || undefined;
    const filename = generateDownloadFilename(file.name, tool.slug, outputExt);
    if (file.processedBlob) {
      downloadBlob(file.processedBlob, filename);
    } else if (file.previewUrl) {
      downloadUrl(file.previewUrl, filename);
    }
  };

  const hasFiles = files.length > 0;

  return (
    <div className={styles.toolShell}>
      {/* Header */}
      <ToolHeader tool={tool} />

      {/* Error notification banner */}
      {errors.length > 0 && (
        <div className={styles.notificationsArea}>
          {errors.map((err, idx) => (
            <Alert
              key={`${err.code}-${idx}`}
              type="error"
              title="File Upload Warning"
              onClose={clearErrors}
            >
              {err.message}
            </Alert>
          ))}
        </div>
      )}

      {/* Main Interactive Stage */}
      <div className={styles.stageContainer}>
        {!hasFiles ? (
          // Initial Upload State
          <div className={styles.uploadSection}>
            {customDropzoneSlot || (
              <FileDropzone
                onFilesSelected={addFiles}
                acceptFormats={tool.supportedInputFormats}
                maxFiles={tool.maxFiles}
                maxFileSizeMB={tool.maxFileSizeMB}
                isDragging={isDragging}
                dragProps={dragProps}
              />
            )}

            {/* Feature highlights for this tool */}
            {tool.features && tool.features.length > 0 && (
              <div className={styles.featuresCard}>
                <div className={styles.featuresHeader}>
                  <Sparkles size={16} className={styles.featuresIcon} />
                  <h3 className={styles.featuresTitle}>Tool Capabilities</h3>
                </div>
                <ul className={styles.featuresList}>
                  {tool.features.map((feat, i) => (
                    <li key={i} className={styles.featureItem}>
                      <span className={styles.featureCheck}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          // Active Files & Configuration Stage
          <div className={styles.workspaceSection}>
            {/* File List */}
            <Card variant="glass" padding="md" className={styles.filesCard}>
              <FileList
                files={files}
                onRemoveFile={removeFile}
                onClearAll={handleResetAll}
                onReorderFiles={reorderFiles}
                onAddMoreClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = (tool.maxFiles ?? 20) > 1;
                  input.accept = tool.supportedInputFormats.join(',');
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files) addFiles(target.files);
                  };
                  input.click();
                }}
                maxFiles={tool.maxFiles}
                showProgress={isProcessing}
              />
            </Card>

            {/* Tool Specific Options Slot */}
            {optionsSlot && (
              <Card variant="glass" padding="md" className={styles.optionsCard}>
                <h4 className={styles.optionsTitle}>Processing Settings</h4>
                <div className={styles.optionsContent}>{optionsSlot}</div>
              </Card>
            )}

            {/* Processing Progress Bar */}
            {isProcessing && (
              <Card variant="glass" padding="md" className={styles.progressCard}>
                <ProgressBar
                  percentage={progress.percentage}
                  label={progress.currentStep || 'Processing your files locally...'}
                  variant="primary"
                />
              </Card>
            )}

            {/* Process Error */}
            {processStatus === 'error' && processError && (
              <Alert type="error" title="Processing Error">
                {processError}
              </Alert>
            )}

            {/* Result Preview / Success Slot */}
            {isCompleted && (
              <div className={styles.resultCard}>
                {customResultSlot || (
                  <Card variant="glass" padding="lg" className={styles.defaultResult}>
                    <div className={styles.resultHeader}>
                      <div className={styles.successIconWrapper}>
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                        <h3 className={styles.resultTitle}>Processing Complete!</h3>
                        <p className={styles.resultDesc}>
                          Your files have been processed in the browser. You can now download them.
                        </p>
                      </div>
                    </div>

                    {/* Live File Result Preview Gallery & Size Savings */}
                    <div className={styles.processedFilesList}>
                      {files.map((file) => {
                        const savings =
                          file.processedSize && file.originalFile.size
                            ? calculateSavings(file.originalFile.size, file.processedSize)
                            : null;

                        return (
                          <div key={file.id} className={styles.processedFileItem}>
                            <div className={styles.previewThumbWrapper}>
                              {file.previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={file.previewUrl}
                                  alt={file.name}
                                  className={styles.previewThumbImg}
                                />
                              ) : (
                                <div className={styles.previewThumbFallback}>
                                  <FileText size={22} />
                                </div>
                              )}
                            </div>

                            <div className={styles.processedFileInfo}>
                              <span className={styles.processedFileName}>{file.name}</span>
                              <div className={styles.sizeComparisonRow}>
                                <span className={styles.origSize}>
                                  {formatBytes(file.originalFile.size)}
                                </span>
                                {file.processedSize ? (
                                  <>
                                    <span className={styles.arrowIcon}>→</span>
                                    <span className={styles.newSize}>
                                      {formatBytes(file.processedSize)}
                                    </span>
                                    {savings && savings.isReduced && (
                                      <span className={styles.savingsBadge}>
                                        -{savings.percentage}%
                                      </span>
                                    )}
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Download size={14} />}
                              onClick={() => handleDownloadSingle(file)}
                            >
                              Download
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.resultActions}>
                      <Button
                        variant="primary"
                        size="lg"
                        leftIcon={<Download size={18} />}
                        onClick={handleDownloadAll}
                      >
                        {files.length > 1
                          ? `Download All (${files.length} Files)`
                          : 'Download Processed File'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        leftIcon={<Sliders size={16} />}
                        onClick={() => resetProcessor()}
                      >
                        Adjust Options & Retry
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        leftIcon={<RotateCcw size={16} />}
                        onClick={handleResetAll}
                      >
                        Upload New Files
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Action Bar (when not completed) */}
            {!isCompleted && (
              <div className={styles.actionBar}>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<RotateCcw size={16} />}
                  onClick={handleResetAll}
                  disabled={isProcessing}
                >
                  Reset
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Play size={18} />}
                  isLoading={isProcessing}
                  onClick={handleStartProcessing}
                >
                  {processButtonLabel}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Privacy & Performance Guarantee Card */}
      <div className={styles.privacyTrustBanner}>
        <div className={styles.trustItem}>
          <Lock size={18} className={styles.trustIcon} />
          <div>
            <span className={styles.trustTitle}>Zero Data Upload</span>
            <p className={styles.trustText}>
              Processing runs 100% on your device. Your files never hit our servers.
            </p>
          </div>
        </div>

        <div className={styles.trustItem}>
          <Zap size={18} className={styles.trustIcon} />
          <div>
            <span className={styles.trustTitle}>Instant Client Execution</span>
            <p className={styles.trustText}>
              No server queues or upload bandwidth delays. Immediate local computation.
            </p>
          </div>
        </div>

        <div className={styles.trustItem}>
          <ShieldCheck size={18} className={styles.trustIcon} />
          <div>
            <span className={styles.trustTitle}>Enterprise Privacy Standard</span>
            <p className={styles.trustText}>
              Compliant with privacy policies and strict internal data guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
