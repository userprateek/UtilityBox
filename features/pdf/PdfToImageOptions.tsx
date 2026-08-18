'use client';

import React, { useState } from 'react';
import { Select } from '@/components/common/Select/Select';
import { PdfToImageOptions } from '@/lib/pdf/pdfToImage';
import styles from '@/features/image/options.module.scss';

export interface PdfToImageOptionsProps {
  initialSettings?: Partial<PdfToImageOptions>;
  onChange?: (settings: PdfToImageOptions) => void;
}

export const PdfToImageOptionsComponent: React.FC<PdfToImageOptionsProps> = ({
  initialSettings,
  onChange,
}) => {
  const [format, setFormat] = useState<PdfToImageOptions['format']>(
    initialSettings?.format || 'image/jpeg'
  );
  const [dpi, setDpi] = useState<number>(initialSettings?.dpi || 150);
  const [pageSelection, setPageSelection] = useState<PdfToImageOptions['pageSelection']>(
    initialSettings?.pageSelection || 'all'
  );
  const [customPages, setCustomPages] = useState<string>(initialSettings?.customPages || '1-3');

  const notifyChange = (updated: Partial<PdfToImageOptions>) => {
    const current: PdfToImageOptions = {
      format: updated.format ?? format,
      dpi: updated.dpi ?? dpi,
      pageSelection: updated.pageSelection ?? pageSelection,
      customPages: updated.customPages ?? customPages,
    };
    onChange?.(current);
  };

  return (
    <div className={styles.optionsGrid}>
      {/* SECTION 1: Format & Quality */}
      <div className={styles.optionGroup}>
        <Select
          label="Output Image Format"
          value={format || 'image/jpeg'}
          onChange={(e) => {
            const val = e.target.value as PdfToImageOptions['format'];
            setFormat(val);
            notifyChange({ format: val });
          }}
          options={[
            { value: 'image/jpeg', label: 'JPEG (.jpg) — Best for Scans & Documents' },
            { value: 'image/png', label: 'PNG (.png) — Lossless / Crisp Text' },
            { value: 'image/webp', label: 'WebP (.webp) — Modern High Efficiency' },
          ]}
        />
      </div>

      {/* SECTION 2: DPI Resolution */}
      <div className={styles.optionGroup}>
        <Select
          label="Render Resolution (DPI)"
          value={String(dpi)}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setDpi(val);
            notifyChange({ dpi: val });
          }}
          options={[
            { value: '300', label: '300 DPI — High Resolution (Crisp Text & Print Ready)' },
            { value: '150', label: '150 DPI — Standard Quality (Balanced Size)' },
            { value: '72', label: '72 DPI — Screen Resolution (Smallest Size)' },
          ]}
        />
      </div>

      {/* SECTION 3: Page Selection Mode */}
      <div className={styles.optionGroup}>
        <label className={styles.groupTitle}>📑 Pages to Convert</label>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${pageSelection === 'all' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setPageSelection('all');
              notifyChange({ pageSelection: 'all' });
            }}
          >
            All Pages
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${pageSelection === 'custom' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setPageSelection('custom');
              notifyChange({ pageSelection: 'custom' });
            }}
          >
            Specific Pages
          </button>
        </div>

        {pageSelection === 'custom' && (
          <div style={{ marginTop: '8px' }}>
            <input
              type="text"
              placeholder="e.g. 1-3, 5, 8"
              value={customPages}
              onChange={(e) => {
                setCustomPages(e.target.value);
                notifyChange({ customPages: e.target.value });
              }}
              className={styles.customInput}
            />
          </div>
        )}
      </div>
    </div>
  );
};
