'use client';

import React, { useState } from 'react';
import { Select } from '@/components/common/Select/Select';
import {
  ImageToPdfOptions,
  PageSizeOption,
  PageOrientationOption,
  ImagesPerPageOption,
  MarginOption,
} from '@/lib/pdf/imageToPdf';
import styles from '@/features/image/options.module.scss';

export interface ImageToPdfOptionsProps {
  initialSettings?: Partial<ImageToPdfOptions>;
  onChange?: (settings: ImageToPdfOptions) => void;
}

export const ImageToPdfOptionsComponent: React.FC<ImageToPdfOptionsProps> = ({
  initialSettings,
  onChange,
}) => {
  const [imagesPerPage, setImagesPerPage] = useState<ImagesPerPageOption>(
    initialSettings?.imagesPerPage || 1
  );
  const [pageSize, setPageSize] = useState<PageSizeOption>(initialSettings?.pageSize || 'a4');
  const [orientation, setOrientation] = useState<PageOrientationOption>(
    initialSettings?.orientation || 'auto'
  );
  const [margin, setMargin] = useState<MarginOption>(initialSettings?.margin || 'standard');

  const notifyChange = (updated: Partial<ImageToPdfOptions>) => {
    const current: ImageToPdfOptions = {
      imagesPerPage: updated.imagesPerPage ?? imagesPerPage,
      pageSize: updated.pageSize ?? pageSize,
      orientation: updated.orientation ?? orientation,
      margin: updated.margin ?? margin,
    };
    onChange?.(current);
  };

  return (
    <div className={styles.optionsGrid}>
      {/* SECTION 1: Images per Page Layout */}
      <div className={styles.optionGroup}>
        <label className={styles.groupTitle}>🖼️ Images per PDF Page</label>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${imagesPerPage === 1 ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setImagesPerPage(1);
              notifyChange({ imagesPerPage: 1 });
            }}
          >
            1 Image / Page (Standard)
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${imagesPerPage === 2 ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setImagesPerPage(2);
              notifyChange({ imagesPerPage: 2 });
            }}
          >
            2 Images / Page
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${imagesPerPage === 4 ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setImagesPerPage(4);
              notifyChange({ imagesPerPage: 4 });
            }}
          >
            4 Images / Page (Grid)
          </button>
        </div>
        <p className={styles.dimPresetDesc} style={{ marginTop: '6px' }}>
          {imagesPerPage === 1 &&
            '📄 Each image gets its own clean, centered page in the output PDF.'}
          {imagesPerPage === 2 &&
            '📑 Fits 2 images per page without cutting or cropping (ideal for ID cards / receipts).'}
          {imagesPerPage === 4 &&
            '📑 Fits 4 images in a 2×2 grid per page without cutting or cropping.'}
        </p>
      </div>

      {/* SECTION 2: Page Size & Margins */}
      <div className={styles.optionGroup}>
        <Select
          label="PDF Page Size"
          value={pageSize}
          onChange={(e) => {
            const val = e.target.value as PageSizeOption;
            setPageSize(val);
            notifyChange({ pageSize: val });
          }}
          options={[
            { value: 'a4', label: 'A4 (210 × 297 mm) — Standard' },
            { value: 'letter', label: 'US Letter (8.5 × 11 in)' },
            { value: 'fit', label: 'Fit Page to Image (Original Dimensions)' },
          ]}
        />
      </div>

      {pageSize !== 'fit' && (
        <>
          <div className={styles.optionGroup}>
            <Select
              label="Page Orientation"
              value={orientation}
              onChange={(e) => {
                const val = e.target.value as PageOrientationOption;
                setOrientation(val);
                notifyChange({ orientation: val });
              }}
              options={[
                { value: 'auto', label: 'Auto (Match Image Orientation)' },
                { value: 'portrait', label: 'Portrait (Vertical)' },
                { value: 'landscape', label: 'Landscape (Horizontal)' },
              ]}
            />
          </div>

          <div className={styles.optionGroup}>
            <Select
              label="Page Margins"
              value={margin}
              onChange={(e) => {
                const val = e.target.value as MarginOption;
                setMargin(val);
                notifyChange({ margin: val });
              }}
              options={[
                { value: 'standard', label: 'Standard Margin (Balanced)' },
                { value: 'small', label: 'Small Margin (More Content Space)' },
                { value: 'none', label: 'No Margin (Edge-to-Edge / Borderless)' },
                { value: 'large', label: 'Large Margin (Extra White Space)' },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
};
