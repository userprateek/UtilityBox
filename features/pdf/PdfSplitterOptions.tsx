'use client';

import React, { useState } from 'react';
import { SplitMode, SplitPdfOptions } from '@/lib/pdf/pdfSplitter';
import styles from '@/features/image/options.module.scss';

export interface PdfSplitterOptionsProps {
  initialSettings?: Partial<SplitPdfOptions>;
  onChange?: (settings: SplitPdfOptions) => void;
}

export const PdfSplitterOptions: React.FC<PdfSplitterOptionsProps> = ({
  initialSettings,
  onChange,
}) => {
  const [mode, setMode] = useState<SplitMode>(initialSettings?.mode || 'all_pages');
  const [pageRange, setPageRange] = useState<string>(initialSettings?.pageRange || '1-3');
  const [fixedInterval, setFixedInterval] = useState<number>(initialSettings?.fixedInterval || 2);

  const notifyChange = (updated: Partial<SplitPdfOptions>) => {
    const current: SplitPdfOptions = {
      mode: updated.mode ?? mode,
      pageRange: updated.pageRange ?? pageRange,
      fixedInterval: updated.fixedInterval ?? fixedInterval,
    };
    onChange?.(current);
  };

  return (
    <div className={styles.optionsGrid}>
      {/* SECTION 1: Splitting Mode */}
      <div className={styles.optionGroup}>
        <label className={styles.groupTitle}>✂️ Choose How to Split PDF</label>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'all_pages' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setMode('all_pages');
              notifyChange({ mode: 'all_pages' });
            }}
          >
            Extract All Pages (1 Page / File)
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'range' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setMode('range');
              notifyChange({ mode: 'range' });
            }}
          >
            Custom Page Range
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'fixed_interval' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setMode('fixed_interval');
              notifyChange({ mode: 'fixed_interval' });
            }}
          >
            Split Every N Pages
          </button>
        </div>
      </div>

      {/* SECTION 2: Range Mode Configuration */}
      {mode === 'range' && (
        <div className={styles.optionGroup}>
          <label className={styles.label}>Enter Page Numbers or Ranges</label>
          <div className={styles.customDimRow}>
            <div className={styles.dimInputGroup} style={{ gridColumn: '1 / -1' }}>
              <input
                type="text"
                placeholder="e.g. 1-3, 5, 8-10"
                value={pageRange}
                onChange={(e) => {
                  setPageRange(e.target.value);
                  notifyChange({ pageRange: e.target.value });
                }}
                className={styles.customInput}
              />
            </div>
          </div>
          <div className={styles.quickPctRow} style={{ marginTop: '8px' }}>
            <span
              style={{ fontSize: '11px', color: 'var(--color-text-muted)', alignSelf: 'center' }}
            >
              Quick Examples:
            </span>
            {['1-2', '1-3', '1, 3, 5', '2-4'].map((example) => (
              <button
                key={example}
                type="button"
                className={styles.quickPctBtn}
                onClick={() => {
                  setPageRange(example);
                  notifyChange({ pageRange: example });
                }}
              >
                {example}
              </button>
            ))}
          </div>
          <p className={styles.dimPresetDesc} style={{ marginTop: '6px' }}>
            💡 Creates a new PDF document containing only the selected pages.
          </p>
        </div>
      )}

      {/* SECTION 3: Fixed Interval Configuration */}
      {mode === 'fixed_interval' && (
        <div className={styles.optionGroup}>
          <div className={styles.sliderHeader}>
            <span className={styles.label}>Split Interval (Pages per File)</span>
            <span className={styles.valueBadge}>Every {fixedInterval} Pages</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={fixedInterval}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setFixedInterval(val);
              notifyChange({ fixedInterval: val });
            }}
            className={styles.rangeInput}
          />
          <div className={styles.quickPctRow}>
            {[1, 2, 3, 5].map((num) => (
              <button
                key={num}
                type="button"
                className={`${styles.quickPctBtn} ${fixedInterval === num ? styles.quickPctBtnActive : ''}`}
                onClick={() => {
                  setFixedInterval(num);
                  notifyChange({ fixedInterval: num });
                }}
              >
                Every {num} Page{num > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'all_pages' && (
        <div className={styles.optionGroup}>
          <p className={styles.dimPresetDesc}>
            📄 <strong>Extract All Pages</strong>: Every single page of your PDF will be extracted
            into its own separate PDF document (e.g. <code>page_1.pdf</code>,{' '}
            <code>page_2.pdf</code>), ready for individual or batch download.
          </p>
        </div>
      )}
    </div>
  );
};
