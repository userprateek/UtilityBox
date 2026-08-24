'use client';

import React, { useState } from 'react';
import { Select } from '@/components/common/Select/Select';
import { DimensionPreset } from '@/lib/image/types';
import styles from './options.module.scss';

export type ResizeUnit = 'px' | 'percentage' | 'mm' | 'cm' | 'inch';

export interface ImageResizerSettings {
  unit: ResizeUnit;
  width: number;
  height: number;
  percentage: number;
  maintainAspectRatio: boolean;
  dpi: number; // 72, 150, 300
  preset?: string;
  outputFormat: 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
}

export interface ImageResizerOptionsProps {
  initialSettings?: Partial<ImageResizerSettings>;
  onChange?: (settings: ImageResizerSettings) => void;
}

const RESIZE_PRESETS = [
  { id: 'passport', name: 'Passport (35×45mm)', w: 413, h: 531, desc: '35x45mm at 300 DPI' },
  { id: 'signature', name: 'Signature (3:1)', w: 300, h: 100, desc: 'Govt & Exam Forms' },
  { id: 'instagram_sq', name: 'Square (1:1)', w: 1080, h: 1080, desc: 'Instagram / Avatar' },
  { id: 'story', name: 'Story / Reel (9:16)', w: 1080, h: 1920, desc: 'Full Screen Mobile' },
  { id: 'fhd', name: 'Full HD (16:9)', w: 1920, h: 1080, desc: 'Desktop / Wallpapers' },
  { id: 'postcard', name: 'Postcard (4×6 in)', w: 1200, h: 1800, desc: 'Admit Card & Print' },
];

export const ImageResizerOptions: React.FC<ImageResizerOptionsProps> = ({
  initialSettings,
  onChange,
}) => {
  const [unit, setUnit] = useState<ResizeUnit>(initialSettings?.unit || 'px');
  const [width, setWidth] = useState<string>(
    initialSettings?.width ? String(initialSettings.width) : '1080'
  );
  const [height, setHeight] = useState<string>(
    initialSettings?.height ? String(initialSettings.height) : '1080'
  );
  const [percentage, setPercentage] = useState<number>(initialSettings?.percentage || 100);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(
    initialSettings?.maintainAspectRatio ?? true
  );
  const [dpi, setDpi] = useState<number>(initialSettings?.dpi || 300);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [format, setFormat] = useState<ImageResizerSettings['outputFormat']>(
    initialSettings?.outputFormat || 'original'
  );
  const [quality, setQuality] = useState<number>(initialSettings?.quality || 90);

  const notifyChange = (updated: Partial<ImageResizerSettings>) => {
    const parsedW =
      parseInt(updated.width !== undefined ? String(updated.width) : width, 10) || 1080;
    const parsedH =
      parseInt(updated.height !== undefined ? String(updated.height) : height, 10) || 1080;

    const current: ImageResizerSettings = {
      unit: updated.unit ?? unit,
      width: parsedW,
      height: parsedH,
      percentage: updated.percentage ?? percentage,
      maintainAspectRatio: updated.maintainAspectRatio ?? maintainAspectRatio,
      dpi: updated.dpi ?? dpi,
      preset: updated.preset ?? selectedPreset,
      outputFormat: updated.outputFormat ?? format,
      quality: updated.quality ?? quality,
    };
    onChange?.(current);
  };

  const handlePresetSelect = (preset: (typeof RESIZE_PRESETS)[0]) => {
    setSelectedPreset(preset.id);
    setUnit('px');
    setWidth(String(preset.w));
    setHeight(String(preset.h));
    notifyChange({
      unit: 'px',
      width: preset.w,
      height: preset.h,
      preset: preset.id,
    });
  };

  return (
    <div className={styles.optionsGrid}>
      {/* SECTION 1: Resize Method Mode */}
      <div className={styles.optionGroup}>
        <label className={styles.groupTitle}>📐 Resize Method</label>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${unit === 'px' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setUnit('px');
              notifyChange({ unit: 'px' });
            }}
          >
            Pixels (px)
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${unit === 'percentage' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setUnit('percentage');
              notifyChange({ unit: 'percentage' });
            }}
          >
            Percentage (%)
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${unit === 'mm' || unit === 'cm' || unit === 'inch' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setUnit('mm');
              notifyChange({ unit: 'mm' });
            }}
          >
            Print Size (mm/cm/in)
          </button>
        </div>
      </div>

      {/* SECTION 2: Dimensions Inputs based on unit */}
      {unit === 'px' && (
        <div className={styles.optionGroup}>
          <div className={styles.customDimRow}>
            <div className={styles.dimInputGroup}>
              <label className={styles.dimInputLabel}>Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => {
                  setWidth(e.target.value);
                  setSelectedPreset('');
                  const w = parseInt(e.target.value, 10);
                  if (maintainAspectRatio && !isNaN(w) && w > 0) {
                    const ratio = (parseInt(height, 10) || 1080) / (parseInt(width, 10) || 1080);
                    const newH = Math.round(w * ratio);
                    setHeight(String(newH));
                    notifyChange({ width: w, height: newH });
                  } else {
                    notifyChange({ width: w || 1080 });
                  }
                }}
                className={styles.customInput}
              />
            </div>
            <span className={styles.multiplyIcon}>×</span>
            <div className={styles.dimInputGroup}>
              <label className={styles.dimInputLabel}>Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  setSelectedPreset('');
                  const h = parseInt(e.target.value, 10);
                  notifyChange({ height: h || 1080 });
                }}
                className={styles.customInput}
              />
            </div>
          </div>

          <div className={styles.checkboxGroup} style={{ marginTop: '8px' }}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={maintainAspectRatio}
                onChange={(e) => {
                  setMaintainAspectRatio(e.target.checked);
                  notifyChange({ maintainAspectRatio: e.target.checked });
                }}
                className={styles.checkbox}
              />
              <span>Lock Aspect Ratio 🔒 (Prevents stretching or distortion)</span>
            </label>
          </div>
        </div>
      )}

      {unit === 'percentage' && (
        <div className={styles.optionGroup}>
          <div className={styles.sliderHeader}>
            <span className={styles.label}>Resize Percentage</span>
            <span className={styles.valueBadge}>{percentage}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={300}
            step={5}
            value={percentage}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setPercentage(val);
              notifyChange({ percentage: val });
            }}
            className={styles.rangeInput}
          />
          <div className={styles.quickPctRow}>
            {[25, 50, 75, 100, 150, 200].map((pct) => (
              <button
                key={pct}
                type="button"
                className={`${styles.quickPctBtn} ${percentage === pct ? styles.quickPctBtnActive : ''}`}
                onClick={() => {
                  setPercentage(pct);
                  notifyChange({ percentage: pct });
                }}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      )}

      {(unit === 'mm' || unit === 'cm' || unit === 'inch') && (
        <div className={styles.optionGroup}>
          <div className={styles.customDimRow}>
            <div className={styles.dimInputGroup}>
              <label className={styles.dimInputLabel}>Unit</label>
              <Select
                value={unit}
                onChange={(e) => {
                  const u = e.target.value as ResizeUnit;
                  setUnit(u);
                  notifyChange({ unit: u });
                }}
                options={[
                  { value: 'mm', label: 'Millimeters (mm)' },
                  { value: 'cm', label: 'Centimeters (cm)' },
                  { value: 'inch', label: 'Inches (in)' },
                ]}
              />
            </div>
            <div className={styles.dimInputGroup}>
              <label className={styles.dimInputLabel}>Target DPI</label>
              <Select
                value={String(dpi)}
                onChange={(e) => {
                  const d = parseInt(e.target.value, 10);
                  setDpi(d);
                  notifyChange({ dpi: d });
                }}
                options={[
                  { value: '300', label: '300 DPI (Official Photo & Print)' },
                  { value: '150', label: '150 DPI (Medium Quality)' },
                  { value: '72', label: '72 DPI (Web Screen)' },
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Standard Dimension Presets */}
      <div className={styles.optionGroup}>
        <label className={styles.groupTitle}>⚡ Popular Dimension Presets</label>
        <div className={styles.dimensionPresetsGrid}>
          {RESIZE_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`${styles.dimPresetCard} ${isSelected ? styles.dimPresetCardActive : ''}`}
                onClick={() => handlePresetSelect(preset)}
              >
                <span className={styles.dimPresetName}>{preset.name}</span>
                <span className={styles.dimPresetDims}>
                  {preset.w} × {preset.h} px
                </span>
                <span className={styles.dimPresetDesc}>{preset.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Output Format & Quality */}
      <div className={styles.optionGroup}>
        <Select
          label="Output Image Format"
          value={format}
          onChange={(e) => {
            const val = e.target.value as ImageResizerSettings['outputFormat'];
            setFormat(val);
            notifyChange({ outputFormat: val });
          }}
          options={[
            { value: 'original', label: 'Match Original Format' },
            { value: 'image/jpeg', label: 'JPEG (.jpg) — Best for Photos' },
            { value: 'image/png', label: 'PNG (.png) — Lossless / Transparent' },
            { value: 'image/webp', label: 'WebP (.webp) — Modern High Efficiency' },
          ]}
        />
      </div>
    </div>
  );
};
