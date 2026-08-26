'use client';

import React, { useState } from 'react';
import { Select } from '@/components/common/Select/Select';
import styles from './options.module.scss';

export type ImageConverterFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ImageConverterSettings {
  outputFormat: ImageConverterFormat;
  quality: number;
}

export interface ImageConverterOptionsProps {
  initialSettings?: Partial<ImageConverterSettings>;
  onChange?: (settings: ImageConverterSettings) => void;
}

export const ImageConverterOptions: React.FC<ImageConverterOptionsProps> = ({
  initialSettings,
  onChange,
}) => {
  const [outputFormat, setOutputFormat] = useState<ImageConverterFormat>(
    initialSettings?.outputFormat || 'image/jpeg'
  );
  const [quality, setQuality] = useState<number>(initialSettings?.quality ?? 90);

  const notifyChange = (updated: Partial<ImageConverterSettings>) => {
    onChange?.({
      outputFormat: updated.outputFormat ?? outputFormat,
      quality: updated.quality ?? quality,
    });
  };

  return (
    <div className={styles.optionsGrid}>
      <div className={styles.optionGroup}>
        <Select
          label="Convert To"
          value={outputFormat}
          onChange={(e) => {
            const val = e.target.value as ImageConverterFormat;
            setOutputFormat(val);
            notifyChange({ outputFormat: val });
          }}
          options={[
            { value: 'image/jpeg', label: 'JPEG (.jpg) — Photos, forms, and email' },
            { value: 'image/png', label: 'PNG (.png) — Transparency / lossless' },
            { value: 'image/webp', label: 'WebP (.webp) — Smallest modern files' },
          ]}
        />
      </div>

      {outputFormat !== 'image/png' && (
        <div className={styles.optionGroup}>
          <div className={styles.sliderHeader}>
            <span className={styles.label}>Quality</span>
            <span className={styles.valueBadge}>{quality}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={quality}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setQuality(val);
              notifyChange({ quality: val });
            }}
            className={styles.rangeInput}
          />
        </div>
      )}
    </div>
  );
};
