'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  Sliders,
  Download,
  Crop,
  QrCode,
  Calculator,
  FileText,
  CheckCircle,
  Globe,
} from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { getToolGuide } from '@/config/tools/guides';
import styles from './ToolGuide.module.scss';

export interface ToolGuideProps {
  tool: ToolMetadata;
}

export const ToolGuide: React.FC<ToolGuideProps> = ({ tool }) => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const guideData = getToolGuide(tool.slug);

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crop':
        return <Crop size={24} />;
      case 'QrCode':
        return <QrCode size={24} />;
      case 'Calculator':
        return <Calculator size={24} />;
      case 'FileText':
        return <FileText size={24} />;
      case 'CheckCircle':
        return <CheckCircle size={24} />;
      case 'Sliders':
        return <Sliders size={24} />;
      case 'Download':
        return <Download size={24} />;
      case 'UploadCloud':
      default:
        return <UploadCloud size={24} />;
    }
  };

  return (
    <section className={styles.guideSection} aria-labelledby="how-it-works-title">
      <div className={styles.guideHeader}>
        <div className={styles.topControlRow}>
          <span className={styles.guideOverline}>
            {lang === 'en' ? 'Step-by-Step Guide' : 'चरण-दर-चरण निर्देश'}
          </span>

          <div className={styles.langToggleContainer}>
            <Globe size={14} className={styles.langIcon} />
            <button
              type="button"
              className={`${styles.langBtn} ${lang === 'en' ? styles.activeLang : ''}`}
              onClick={() => setLang('en')}
              aria-label="Switch to English guide"
            >
              English
            </button>
            <span className={styles.langDivider}>|</span>
            <button
              type="button"
              className={`${styles.langBtn} ${lang === 'hi' ? styles.activeLang : ''}`}
              onClick={() => setLang('hi')}
              aria-label="Switch to Hindi guide"
            >
              हिंदी
            </button>
          </div>
        </div>

        <h2 id="how-it-works-title" className={styles.guideTitle}>
          {guideData.title[lang]}
        </h2>
        <p className={styles.guideSubtitle}>{guideData.subtitle[lang]}</p>
      </div>

      <div className={styles.stepsGrid}>
        {guideData.steps.map((step) => (
          <div key={step.stepNumber} className={styles.stepCard}>
            <div className={styles.stepNumberBadge}>{step.stepNumber}</div>
            <div className={styles.iconWrapper}>{getStepIcon(step.iconName)}</div>
            <h3 className={styles.stepTitle}>{step.title[lang]}</h3>
            <p className={styles.stepDesc}>{step.description[lang]}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
