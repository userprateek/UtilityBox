'use client';

import React, { useState } from 'react';
import { Select } from '@/components/common/Select/Select';
import { DimensionScaleMode, DimensionPreset } from '@/lib/image/types';
import { DIMENSION_PRESETS } from '@/lib/image/canvasCompressor';
import styles from './options.module.scss';

export interface ImageCompressorSettings {
  targetSizeEnabled: boolean;
  targetKb: number;
  scaleMode: DimensionScaleMode;
  scalePercentage: number;
  dimensionPreset?: DimensionPreset;
  customWidth?: number;
  customHeight?: number;
  maintainAspectRatio: boolean;
  quality: number;
  outputFormat: 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
  removeMetadata: boolean;
}

export interface ImageCompressorOptionsProps {
  initialSettings?: Partial<ImageCompressorSettings>;
  onChange?: (settings: ImageCompressorSettings) => void;
}

const TARGET_SIZE_PRESETS = [
  { kb: 20, title: '20 KB', desc: 'Signatures (SSC/UPSC)' },
  { kb: 50, title: '50 KB', desc: 'Sarkari Photo / UPSC' },
  { kb: 100, title: '100 KB', desc: 'Govt ID & Job Forms' },
  { kb: 200, title: '200 KB', desc: 'Web & Documents' },
  { kb: 500, title: '500 KB', desc: 'High Resolution' },
];

export const ImageCompressorOptions: React.FC<ImageCompressorOptionsProps> = ({
  initialSettings,
  onChange,
}) => {
  const [targetSizeEnabled, setTargetSizeEnabled] = useState<boolean>(
    initialSettings?.targetSizeEnabled ?? true
  );
  const [targetKb, setTargetKb] = useState<number>(initialSettings?.targetKb || 100);
  const [customKb, setCustomKb] = useState<string>('');

  const [scaleMode, setScaleMode] = useState<DimensionScaleMode>(
    initialSettings?.scaleMode || 'original'
  );
  const [scalePercentage, setScalePercentage] = useState<number>(
    initialSettings?.scalePercentage || 100
  );
  const [dimensionPreset, setDimensionPreset] = useState<DimensionPreset>(
    initialSettings?.dimensionPreset || 'passport'
  );
  const [customWidth, setCustomWidth] = useState<string>(
    initialSettings?.customWidth ? String(initialSettings.customWidth) : ''
  );
  const [customHeight, setCustomHeight] = useState<string>(
    initialSettings?.customHeight ? String(initialSettings.customHeight) : ''
  );
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(
    initialSettings?.maintainAspectRatio ?? true
  );

  const [quality, setQuality] = useState<number>(initialSettings?.quality || 80);
  const [format, setFormat] = useState<ImageCompressorSettings['outputFormat']>(
    initialSettings?.outputFormat || 'original'
  );
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(
    initialSettings?.removeMetadata ?? true
  );

  const notifyChange = (updated: Partial<ImageCompressorSettings>) => {
    const parsedW = parseInt(
      updated.customWidth !== undefined ? String(updated.customWidth) : customWidth,
      10
    );
    const parsedH = parseInt(
      updated.customHeight !== undefined ? String(updated.customHeight) : customHeight,
      10
    );

    const current: ImageCompressorSettings = {
      targetSizeEnabled: updated.targetSizeEnabled ?? targetSizeEnabled,
      targetKb: updated.targetKb ?? targetKb,
      scaleMode: updated.scaleMode ?? scaleMode,
      scalePercentage: updated.scalePercentage ?? scalePercentage,
      dimensionPreset: updated.dimensionPreset ?? dimensionPreset,
      customWidth: isNaN(parsedW) ? undefined : parsedW,
      customHeight: isNaN(parsedH) ? undefined : parsedH,
      maintainAspectRatio: updated.maintainAspectRatio ?? maintainAspectRatio,
      quality: updated.quality ?? quality,
      outputFormat: updated.outputFormat ?? format,
      removeMetadata: updated.removeMetadata ?? removeMetadata,
    };
    onChange?.(current);
  };

  const handleTargetPresetClick = (kb: number) => {
    setTargetSizeEnabled(true);
    setTargetKb(kb);
    setCustomKb('');
    notifyChange({ targetSizeEnabled: true, targetKb: kb });
  };

  const handleCustomKbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, '');
    setCustomKb(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setTargetSizeEnabled(true);
      setTargetKb(parsed);
      notifyChange({ targetSizeEnabled: true, targetKb: parsed });
    }
  };

  return (
    <div className={styles.optionsGrid}>
      {/* SECTION 1: Target File Size (KB) */}
      <div className={styles.optionGroup}>
        <div className={styles.sliderHeader}>
          <label className={styles.groupTitle}>🎯 Target File Size (KB Criteria)</label>
          <span className={styles.valueBadge}>
            {targetSizeEnabled ? `Max ≤ ${targetKb} KB` : 'No KB Limit'}
          </span>
        </div>

        <div className={styles.presetGrid}>
          {TARGET_SIZE_PRESETS.map((preset) => {
            const isSelected = targetSizeEnabled && targetKb === preset.kb && !customKb;
            return (
              <button
                key={preset.kb}
                type="button"
                className={`${styles.presetCard} ${isSelected ? styles.presetCardActive : ''}`}
                onClick={() => handleTargetPresetClick(preset.kb)}
              >
                <span className={styles.presetKb}>{preset.title}</span>
                <span className={styles.presetLabel}>{preset.desc}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.customDimRow}>
          <div className={styles.dimInputGroup} style={{ gridColumn: '1 / -1' }}>
            <input
              type="text"
              placeholder="Or type custom size in KB (e.g. 75 or 150)"
              value={customKb}
              onChange={handleCustomKbChange}
              className={styles.customInput}
            />
          </div>
        </div>

        {targetSizeEnabled && targetKb <= 30 && (
          <div
            className={styles.dimPresetDesc}
            style={{ color: 'var(--color-primary)', marginTop: '4px', fontSize: '12px' }}
          >
            💡 <strong>Strict ≤ {targetKb} KB Mode</strong>: Resolution will automatically be
            optimized to max ~400–600px to guarantee your signature or thumbnail is strictly under{' '}
            {targetKb} KB with clear readability.
          </div>
        )}
      </div>

      {/* SECTION 2: Dimensions & Resolution Control */}
      <div className={styles.optionGroup}>
        <label className={styles.groupTitle}>📐 Resolution & Dimensions</label>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${scaleMode === 'original' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setScaleMode('original');
              notifyChange({ scaleMode: 'original' });
            }}
          >
            Keep Original (100%)
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${scaleMode === 'percentage' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setScaleMode('percentage');
              notifyChange({ scaleMode: 'percentage' });
            }}
          >
            Scale %
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${scaleMode === 'preset' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setScaleMode('preset');
              notifyChange({ scaleMode: 'preset' });
            }}
          >
            Govt / Form Presets
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${scaleMode === 'custom' ? styles.modeBtnActive : ''}`}
            onClick={() => {
              setScaleMode('custom');
              notifyChange({ scaleMode: 'custom' });
            }}
          >
            Custom W × H
          </button>
        </div>

        {/* Mode: Percentage Scaling */}
        {scaleMode === 'percentage' && (
          <div className={styles.optionGroup} style={{ marginTop: '8px' }}>
            <div className={styles.sliderHeader}>
              <span className={styles.label}>Scale Resolution</span>
              <span className={styles.valueBadge}>{scalePercentage}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={scalePercentage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setScalePercentage(val);
                notifyChange({ scalePercentage: val });
              }}
              className={styles.rangeInput}
            />
            <div className={styles.quickPctRow}>
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className={`${styles.quickPctBtn} ${scalePercentage === pct ? styles.quickPctBtnActive : ''}`}
                  onClick={() => {
                    setScalePercentage(pct);
                    notifyChange({ scalePercentage: pct });
                  }}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode: Govt / Exam Presets */}
        {scaleMode === 'preset' && (
          <div className={styles.dimensionPresetsGrid} style={{ marginTop: '8px' }}>
            {(Object.keys(DIMENSION_PRESETS) as DimensionPreset[]).map((key) => {
              const item = DIMENSION_PRESETS[key];
              const isSelected = dimensionPreset === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.dimPresetCard} ${isSelected ? styles.dimPresetCardActive : ''}`}
                  onClick={() => {
                    setDimensionPreset(key);
                    notifyChange({ dimensionPreset: key });
                  }}
                >
                  <span className={styles.dimPresetName}>{item.name}</span>
                  <span className={styles.dimPresetDims}>
                    {item.width} × {item.height} px
                  </span>
                  <span className={styles.dimPresetDesc}>{item.desc}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Mode: Custom Exact Dimensions */}
        {scaleMode === 'custom' && (
          <div style={{ marginTop: '8px' }}>
            <div className={styles.customDimRow}>
              <div className={styles.dimInputGroup}>
                <label className={styles.dimInputLabel}>Width (px)</label>
                <input
                  type="number"
                  placeholder="e.g. 600"
                  value={customWidth}
                  onChange={(e) => {
                    setCustomWidth(e.target.value);
                    const parsed = parseInt(e.target.value, 10);
                    notifyChange({ customWidth: isNaN(parsed) ? undefined : parsed });
                  }}
                  className={styles.customInput}
                />
              </div>
              <span className={styles.multiplyIcon}>×</span>
              <div className={styles.dimInputGroup}>
                <label className={styles.dimInputLabel}>Height (px)</label>
                <input
                  type="number"
                  placeholder="e.g. 800"
                  value={customHeight}
                  onChange={(e) => {
                    setCustomHeight(e.target.value);
                    const parsed = parseInt(e.target.value, 10);
                    notifyChange({ customHeight: isNaN(parsed) ? undefined : parsed });
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
                <span>Lock Aspect Ratio 🔒 (Preserves proportion without stretching)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Quality / Clarity Level */}
      <div className={styles.optionGroup}>
        <div className={styles.sliderHeader}>
          <label className={styles.groupTitle}>✨ Image Clarity & Quality</label>
          <span className={styles.valueBadge}>{quality}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={95}
          step={5}
          value={quality}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setQuality(val);
            notifyChange({ quality: val });
          }}
          className={styles.rangeInput}
        />
        <div className={styles.sliderLabels}>
          <span>Smaller File (High Compression)</span>
          <span>Maximum Sharpness</span>
        </div>
      </div>

      {/* SECTION 4: Output Format & Privacy */}
      <div className={styles.optionGroup}>
        <Select
          label="Target Output Format"
          value={format}
          onChange={(e) => {
            const val = e.target.value as ImageCompressorSettings['outputFormat'];
            setFormat(val);
            notifyChange({ outputFormat: val });
          }}
          options={[
            {
              value: 'original',
              label: 'Smart Auto Optimize (Best size & quality)',
            },
            { value: 'image/jpeg', label: 'JPEG (.jpg) — Standard for Forms & Photos' },
            { value: 'image/webp', label: 'WebP (.webp) — Modern High Compression' },
            { value: 'image/png', label: 'PNG (.png) — Lossless / Transparent' },
          ]}
        />
      </div>

      <div className={styles.checkboxGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={removeMetadata}
            onChange={(e) => {
              setRemoveMetadata(e.target.checked);
              notifyChange({ removeMetadata: e.target.checked });
            }}
            className={styles.checkbox}
          />
          <span>Strip EXIF metadata (Removes location, camera & device privacy info)</span>
        </label>
      </div>
    </div>
  );
};
