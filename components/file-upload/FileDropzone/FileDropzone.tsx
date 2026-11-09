'use client';

import React, { useRef } from 'react';
import { UploadCloud, FileType, Shield } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/common/Button/Button';
import { Badge } from '@/components/common/Badge/Badge';
import { Bi } from '@/components/i18n/Bi';
import styles from './FileDropzone.module.scss';

export interface FileDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  acceptFormats?: string[];
  maxFiles?: number;
  maxFileSizeMB?: number;
  isDragging?: boolean;
  dragProps?: React.HTMLAttributes<HTMLDivElement>;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  privacyNote?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesSelected,
  acceptFormats = [],
  maxFiles = 20,
  maxFileSizeMB = 50,
  isDragging = false,
  dragProps,
  disabled = false,
  className,
  helperText,
  privacyNote,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTriggerClick();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input value so re-selecting the same file triggers change
      e.target.value = '';
    }
  };

  // Format accept string for native input
  const acceptAttribute = acceptFormats.join(',');

  // Format readable labels for badges
  const formatBadges = acceptFormats.map((f) => {
    if (f === 'application/pdf') return 'PDF';
    if (f.startsWith('image/')) return f.replace('image/', '').toUpperCase();
    if (f === 'application/json') return 'JSON';
    return f.toUpperCase();
  });

  return (
    <div
      className={cn(
        styles.dropzone,
        isDragging && styles.dragging,
        disabled && styles.disabled,
        className
      )}
      aria-label="Upload files by clicking or dragging and dropping"
      {...dragProps}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={(event) => {
        dragProps?.onClick?.(event);
        handleTriggerClick();
      }}
      onKeyDown={(event) => {
        dragProps?.onKeyDown?.(event);
        handleKeyDown(event);
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptAttribute}
        onChange={handleInputChange}
        className={styles.hiddenInput}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <UploadCloud size={40} className={styles.uploadIcon} />
        </div>

        <div className={styles.textContainer}>
          <h3 className={styles.mainTitle}>
            <Bi
              en={
                <>
                  Drop your files here, or <span className={styles.browseText}>browse</span>
                </>
              }
              hi={
                <>
                  फ़ाइल यहाँ छोड़ें, या <span className={styles.browseText}>चुनें</span>
                </>
              }
            />
          </h3>
          <p className={styles.subtitle}>
            {helperText || (
              <Bi
                en={`Select up to ${maxFiles} file${maxFiles > 1 ? 's' : ''} (Max ${maxFileSizeMB}MB each)`}
                hi={`अधिकतम ${maxFiles} फ़ाइल, हर एक ${maxFileSizeMB}MB तक`}
              />
            )}
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="primary"
            size="md"
            leftIcon={<FileType size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              handleTriggerClick();
            }}
            disabled={disabled}
          >
            <Bi en="Select Files" hi="फ़ाइल चुनें" />
          </Button>
        </div>

        {formatBadges.length > 0 && (
          <div className={styles.formatBadges}>
            <span className={styles.supportsLabel}>
              <Bi en="Supported:" hi="फ़ाइल प्रकार:" />
            </span>
            {formatBadges.slice(0, 6).map((fmt) => (
              <Badge key={fmt} variant="neutral" size="sm">
                {fmt}
              </Badge>
            ))}
            {formatBadges.length > 6 && (
              <Badge variant="neutral" size="sm">
                <Bi
                  en={`+${formatBadges.length - 6} more`}
                  hi={`+${formatBadges.length - 6} और`}
                />
              </Badge>
            )}
          </div>
        )}

        <div className={styles.securityNote}>
          <Shield size={13} className={styles.shieldIcon} />
          <span>
            {privacyNote || (
              <Bi
                en="Files stay strictly in your browser. Never uploaded to a server."
                hi="फ़ाइल आपके ब्राउज़र में रहती है। सर्वर पर नहीं जाती।"
              />
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
