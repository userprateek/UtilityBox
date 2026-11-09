'use client';

import React, { useState } from 'react';
import { Trash2, Plus, ArrowLeftRight } from 'lucide-react';
import { ManagedFile } from '@/types/file';
import { Button } from '@/components/common/Button/Button';
import { FileCard } from './FileCard';
import { Bi } from '@/components/i18n/Bi';
import styles from './FileList.module.scss';

export interface FileListProps {
  files: ManagedFile[];
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  onReorderFiles?: (fromIndex: number, toIndex: number) => void;
  onAddMoreClick?: () => void;
  maxFiles?: number;
  showProgress?: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  onClearAll,
  onReorderFiles,
  onAddMoreClick,
  maxFiles = 20,
  showProgress = false,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (files.length === 0) return null;

  return (
    <div className={styles.fileListWrapper}>
      <div className={styles.listHeader}>
        <div className={styles.titleInfo}>
          <h4 className={styles.listTitle}>
            <Bi en="Selected Files" hi="चुनी हुई फ़ाइलें" />
          </h4>
          <span className={styles.countBadge}>
            {files.length} / {maxFiles}
          </span>
          {files.length > 1 && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
              <Bi en="(Click arrows or drag to change sequence)" hi="(क्रम बदलने के लिए तीर दबाएँ या खींचें)" />
            </span>
          )}
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
              <Bi en="Add more" hi="और जोड़ें" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={onClearAll}
          >
            <Bi en="Clear all" hi="सब हटाएँ" />
          </Button>
        </div>
      </div>

      {/* Visual Sequence Order Strip */}
      {files.length > 1 && (
        <div className={styles.orderSequenceBar}>
          <span className={styles.orderSequenceLabel}>
            <Bi en="📄 Output Sequence:" hi="📄 आउटपुट का क्रम:" />
          </span>
          <div className={styles.orderSequenceList}>
            {files.map((file, i) => (
              <React.Fragment key={file.id}>
                <span className={styles.orderSequenceItem} title={file.name}>
                  <span className={styles.orderIndexBadge}>{i + 1}</span>
                  <span className={styles.orderFileName}>{file.name}</span>
                </span>
                {i < files.length - 1 && <span className={styles.orderArrow}>➔</span>}
              </React.Fragment>
            ))}
          </div>

          {files.length === 2 && onReorderFiles && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeftRight size={13} />}
              onClick={() => onReorderFiles(0, 1)}
              style={{ marginLeft: 'auto' }}
            >
              Swap Order
            </Button>
          )}
        </div>
      )}

      <div className={styles.cardsGrid}>
        {files.map((file, idx) => (
          <FileCard
            key={file.id}
            file={file}
            index={idx}
            totalFiles={files.length}
            onRemove={onRemoveFile}
            onMoveUp={(i) => onReorderFiles?.(i, i - 1)}
            onMoveDown={(i) => onReorderFiles?.(i, i + 1)}
            onDragStartItem={(i) => setDraggedIndex(i)}
            onDropItem={(targetIdx) => {
              if (draggedIndex !== null && draggedIndex !== targetIdx) {
                onReorderFiles?.(draggedIndex, targetIdx);
              }
              setDraggedIndex(null);
            }}
            showProgress={showProgress}
          />
        ))}
      </div>
    </div>
  );
};
