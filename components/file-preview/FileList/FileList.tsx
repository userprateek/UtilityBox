'use client';

import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { ManagedFile } from '@/types/file';
import { Button } from '@/components/common/Button/Button';
import { FileCard } from './FileCard';
import styles from './FileList.module.scss';

export interface FileListProps {
  files: ManagedFile[];
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  onAddMoreClick?: () => void;
  maxFiles?: number;
  showProgress?: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  onClearAll,
  onAddMoreClick,
  maxFiles = 20,
  showProgress = false,
}) => {
  if (files.length === 0) return null;

  return (
    <div className={styles.fileListWrapper}>
      <div className={styles.listHeader}>
        <div className={styles.titleInfo}>
          <h4 className={styles.listTitle}>Selected Files</h4>
          <span className={styles.countBadge}>
            {files.length} / {maxFiles}
          </span>
        </div>

        <div className={styles.headerActions}>
          {onAddMoreClick && files.length < maxFiles && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={onAddMoreClick}
            >
              Add more
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={onClearAll}
          >
            Clear all
          </Button>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        {files.map((file) => (
          <FileCard key={file.id} file={file} onRemove={onRemoveFile} showProgress={showProgress} />
        ))}
      </div>
    </div>
  );
};
