'use client';

import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { ManagedFile } from '@/types/file';
import { formatBytes, calculateSavings } from '@/lib/file/fileUtils';
import { Badge } from '@/components/common/Badge/Badge';
import { ProgressBar } from '@/components/common/ProgressBar/ProgressBar';
import styles from './FileList.module.scss';

export interface FileCardProps {
  file: ManagedFile;
  index: number;
  totalFiles: number;
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onDragStartItem?: (index: number) => void;
  onDropItem?: (index: number) => void;
  showProgress?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  index,
  totalFiles,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStartItem,
  onDropItem,
  showProgress = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  const savings = file.processedSize ? calculateSavings(file.size, file.processedSize) : null;

  return (
    <div
      className={`${styles.fileCard} ${isDragOver ? styles.fileCardDragOver : ''}`}
      draggable={totalFiles > 1}
      onDragStart={() => onDragStartItem?.(index)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        onDropItem?.(index);
      }}
    >
      {/* Order Slot Badge for Multi-File Operations (e.g. PDF Merge) */}
      {totalFiles > 1 && (
        <span className={styles.slotBadge} title={`Position ${index + 1} in merged output`}>
          {index + 1}
        </span>
      )}

      {/* File Thumbnail or Icon */}
      <div className={styles.thumbnailWrapper}>
        {isImage && file.previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={file.previewUrl} alt={file.name} className={styles.thumbnailImg} />
        ) : isPdf ? (
          <FileText size={24} className={styles.pdfIcon} />
        ) : (
          <ImageIcon size={24} className={styles.genericIcon} />
        )}
      </div>

      {/* File Details */}
      <div className={styles.details}>
        <div className={styles.headerRow}>
          <span className={styles.fileName} title={file.name}>
            {file.name}
          </span>

          <div className={styles.reorderBtnGroup}>
            {totalFiles > 1 && (
              <>
                <button
                  type="button"
                  className={styles.reorderBtn}
                  onClick={() => onMoveUp?.(index)}
                  disabled={index === 0}
                  aria-label={`Move ${file.name} earlier`}
                  title="Move earlier in merged order"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className={styles.reorderBtn}
                  onClick={() => onMoveDown?.(index)}
                  disabled={index === totalFiles - 1}
                  aria-label={`Move ${file.name} later`}
                  title="Move later in merged order"
                >
                  <ArrowDown size={14} />
                </button>
              </>
            )}

            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => onRemove(file.id)}
              aria-label={`Remove file ${file.name}`}
              title="Remove file"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.fileSize}>{formatBytes(file.size)}</span>

          {file.status === 'processing' && (
            <Badge
              variant="primary"
              size="sm"
              icon={<Loader2 size={12} className={styles.spinner} />}
            >
              Processing
            </Badge>
          )}

          {file.status === 'completed' && (
            <Badge variant="success" size="sm" icon={<CheckCircle2 size={12} />}>
              Ready
            </Badge>
          )}

          {file.status === 'error' && (
            <Badge variant="error" size="sm" icon={<AlertCircle size={12} />}>
              Failed
            </Badge>
          )}

          {savings && savings.isReduced && (
            <div className={styles.savingsBadge}>
              <TrendingDown size={13} />
              <span>
                -{savings.percentage}% ({formatBytes(file.processedSize!)})
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && file.status === 'processing' && (
          <div className={styles.progressContainer}>
            <ProgressBar percentage={file.progress || 50} variant="primary" />
          </div>
        )}

        {/* Error message if any */}
        {file.status === 'error' && file.errorMessage && (
          <span className={styles.errorMessage}>{file.errorMessage}</span>
        )}
      </div>
    </div>
  );
};
