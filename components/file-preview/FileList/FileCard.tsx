'use client';

import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingDown,
} from 'lucide-react';
import { ManagedFile } from '@/types/file';
import { formatBytes, calculateSavings } from '@/lib/file/fileUtils';
import { Badge } from '@/components/common/Badge/Badge';
import { ProgressBar } from '@/components/common/ProgressBar/ProgressBar';
import styles from './FileList.module.scss';

export interface FileCardProps {
  file: ManagedFile;
  onRemove: (id: string) => void;
  showProgress?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onRemove, showProgress = false }) => {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  const savings = file.processedSize ? calculateSavings(file.size, file.processedSize) : null;

  return (
    <div className={styles.fileCard}>
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
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onRemove(file.id)}
            aria-label={`Remove file ${file.name}`}
          >
            <Trash2 size={16} />
          </button>
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
