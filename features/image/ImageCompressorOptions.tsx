'use client';

import React, { useState } from 'react';
import { Select } from '@/components/common/Select/Select';
import styles from './options.module.scss';

export interface ImageCompressorSettings {
  quality: number;
  outputFormat: 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
  removeMetadata: boolean;
}

export interface ImageCompressorOptionsProps {
  onChange?: (settings: ImageCompressorSettings) => void;
}

export const ImageCompressorOptions: React.FC<ImageCompressorOptionsProps> = ({ onChange }) => {
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<ImageCompressorSettings['outputFormat']>('original');
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(true);

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setQuality(val);
    onChange?.({ quality: val, outputFormat: format, removeMetadata });
  };

  return (
    <div className={styles.optionsGrid}>
      {/* Compression Level Slider */}
      <div className={styles.optionGroup}>
        <div className={styles.sliderHeader}>
          <label className={styles.label}>Image Quality Level</label>
          <span className={styles.valueBadge}>{quality}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={95}
          step={5}
          value={quality}
          onChange={handleQualityChange}
          className={styles.rangeInput}
        />
        <div className={styles.sliderLabels}>
          <span>Smaller File (High Compression)</span>
          <span>Best Quality</span>
        </div>
      </div>

      {/* Output Format Selection */}
      <div className={styles.optionGroup}>
        <Select
          label="Target Output Format"
          value={format}
          onChange={(e) => {
            const val = e.target.value as ImageCompressorSettings['outputFormat'];
            setFormat(val);
            onChange?.({ quality, outputFormat: val, removeMetadata });
          }}
          options={[
            { value: 'original', label: 'Match Original Format' },
            { value: 'image/webp', label: 'WebP (Modern, highly compressed)' },
            { value: 'image/jpeg', label: 'JPEG (Standard photo)' },
            { value: 'image/png', label: 'PNG (Lossless/Transparent)' },
          ]}
        />
      </div>

      {/* Checkbox Options */}
      <div className={styles.checkboxGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={removeMetadata}
            onChange={(e) => {
              setRemoveMetadata(e.target.checked);
              onChange?.({ quality, outputFormat: format, removeMetadata: e.target.checked });
            }}
            className={styles.checkbox}
          />
          <span>Strip EXIF metadata (Protects location & camera privacy)</span>
        </label>
      </div>
    </div>
  );
};
