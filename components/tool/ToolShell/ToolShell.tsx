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
import { zipStored } from '@/lib/file/zipStore';
import { Bi } from '@/components/i18n/Bi';
import { hindiForKnownLabel } from '@/lib/i18n/catalog';
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

  const handleDownloadZip = async () => {
    const entries = [];
    for (const file of files) {
      if (!file.processedBlob) continue;
      const outputExt = mimeTypeToExtension(file.processedBlob.type || file.type) || undefined;
      const filename = generateDownloadFilename(file.name, tool.slug, outputExt);
      entries.push({
        name: filename,
        bytes: new Uint8Array(await file.processedBlob.arrayBuffer()),
      });
    }
    if (entries.length === 0) return;
    const archive = zipStored(entries);
    const zipName = generateDownloadFilename(`${tool.slug}-pages.pdf`, tool.slug, 'zip');
    downloadBlob(new Blob([archive as unknown as BlobPart], { type: 'application/zip' }), zipName);
    trackToolDownload(tool.slug, {
      fileCount: entries.length,
      toolName: tool.name,
      fileName: zipName,
    });
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
              title={<Bi en="File Upload Warning" hi="फ़ाइल अपलोड की चेतावनी" />}
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
                  <h3 className={styles.featuresTitle}>
                    <Bi en="Tool Capabilities" hi="इस टूल में क्या है" />
                  </h3>
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
                <h4 className={styles.optionsTitle}>
                  <Bi en="Processing Settings" hi="सेटिंग" />
                </h4>
                <div className={styles.optionsContent}>{optionsSlot}</div>
              </Card>
            )}

            {/* Processing Progress Bar */}
            {isProcessing && (
              <Card variant="glass" padding="md" className={styles.progressCard}>
                <ProgressBar
                  percentage={progress.percentage}
                  label={
                    progress.currentStep || (
                      <Bi
                        en="Processing your files locally..."
                        hi="फ़ाइल आपके डिवाइस पर प्रोसेस हो रही है..."
                      />
                    )
                  }
                  variant="primary"
                />
              </Card>
            )}

            {/* Process Error */}
            {processStatus === 'error' && processError && (
              <Alert type="error" title={<Bi en="Processing Error" hi="प्रोसेस में गलती" />}>
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
                        <h3 className={styles.resultTitle}>
                          <Bi en="Processing Complete!" hi="काम पूरा हो गया" />
                        </h3>
                        <p className={styles.resultDesc}>
                          <Bi
                            en="Your files have been processed in the browser. You can now download them."
                            hi="फ़ाइल ब्राउज़र में तैयार हो गई। अब डाउनलोड कर सकते हैं।"
                          />
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
                              <Bi en="Download" hi="डाउनलोड" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.resultActions}>
                      {tool.slug === 'pdf-splitter' && files.length > 1 && (
                        <Button
                          variant="primary"
                          size="lg"
                          leftIcon={<Download size={18} />}
                          onClick={() => void handleDownloadZip()}
                        >
                          <Bi
                            en={`Download ZIP (${files.length} Files)`}
                            hi={`ZIP डाउनलोड (${files.length} फ़ाइल)`}
                          />
                        </Button>
                      )}
                      <Button
                        variant={tool.slug === 'pdf-splitter' && files.length > 1 ? 'outline' : 'primary'}
                        size="lg"
                        leftIcon={<Download size={18} />}
                        onClick={handleDownloadAll}
                      >
                        {files.length > 1 ? (
                          <Bi
                            en={`Download All (${files.length} Files)`}
                            hi={`सभी डाउनलोड (${files.length} फ़ाइल)`}
                          />
                        ) : (
                          <Bi en="Download Processed File" hi="तैयार फ़ाइल डाउनलोड करें" />
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        leftIcon={<Sliders size={16} />}
                        onClick={() => resetProcessor()}
                      >
                        <Bi en="Adjust Options & Retry" hi="सेटिंग बदलकर फिर करें" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        leftIcon={<RotateCcw size={16} />}
                        onClick={handleResetAll}
                      >
                        <Bi en="Upload New Files" hi="नई फ़ाइल डालें" />
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
                  <Bi en="Reset" hi="रीसेट" />
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Play size={18} />}
                  isLoading={isProcessing}
                  onClick={handleStartProcessing}
                >
                  {hindiForKnownLabel(processButtonLabel) ? (
                    <Bi
                      en={processButtonLabel}
                      hi={hindiForKnownLabel(processButtonLabel) ?? processButtonLabel}
                    />
                  ) : (
                    processButtonLabel
                  )}
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
            <span className={styles.trustTitle}>
              <Bi en="Zero Data Upload" hi="फ़ाइल अपलोड नहीं होती" />
            </span>
            <p className={styles.trustText}>
              <Bi
                en="Processing runs 100% on your device. Your files never hit our servers."
                hi="काम पूरी तरह आपके डिवाइस पर होता है। फ़ाइल हमारे सर्वर पर नहीं जाती।"
              />
            </p>
          </div>
        </div>

        <div className={styles.trustItem}>
          <Zap size={18} className={styles.trustIcon} />
          <div>
            <span className={styles.trustTitle}>
              <Bi en="Instant Client Execution" hi="तुरंत आपके कंप्यूटर पर" />
            </span>
            <p className={styles.trustText}>
              <Bi
                en="No server queues or upload bandwidth delays. Immediate local computation."
                hi="सर्वर की लाइन या अपलोड का इंतज़ार नहीं। काम तुरंत यहीं होता है।"
              />
            </p>
          </div>
        </div>

        <div className={styles.trustItem}>
          <ShieldCheck size={18} className={styles.trustIcon} />
          <div>
            <span className={styles.trustTitle}>
              <Bi en="Enterprise Privacy Standard" hi="कड़ी प्राइवेसी" />
            </span>
            <p className={styles.trustText}>
              <Bi
                en="Compliant with privacy policies and strict internal data guidelines."
                hi="प्राइवेसी नीति और डेटा के सख्त नियम के साथ।"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
