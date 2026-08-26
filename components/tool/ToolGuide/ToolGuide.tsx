import React from 'react';
import {
  UploadCloud,
  Sliders,
  Download,
  Crop,
  QrCode,
  Calculator,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { getToolGuide, ToolGuideData } from '@/config/tools/guides';
import { ToolGuideLangShell } from './ToolGuideLangShell';
import styles from './ToolGuide.module.scss';

export interface ToolGuideProps {
  tool: ToolMetadata;
}

function StepIcon({ iconName }: { iconName: string }) {
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
}

function GuideSteps({
  lang,
  guide,
  withStepIds,
}: {
  lang: 'en' | 'hi';
  guide: ToolGuideData;
  withStepIds?: boolean;
}) {
  return (
    <div className={styles.stepsGrid}>
      {guide.steps.map((step) => (
        <div
          key={step.stepNumber}
          className={styles.stepCard}
          id={withStepIds ? `howto-step-${step.stepNumber}` : undefined}
        >
          <div className={styles.stepNumberBadge}>{step.stepNumber}</div>
          <div className={styles.iconWrapper}>
            <StepIcon iconName={step.iconName} />
          </div>
          <h3 className={styles.stepTitle}>{step.title[lang]}</h3>
          <p className={styles.stepDesc}>{step.description[lang]}</p>
        </div>
      ))}
    </div>
  );
}

export const ToolGuide: React.FC<ToolGuideProps> = ({ tool }) => {
  const guide = getToolGuide(tool.slug);

  return (
    <ToolGuideLangShell
      titles={
        <>
          <div className={styles.langEn}>
            <h2 id="how-it-works-title" className={styles.guideTitle}>
              {guide.title.en}
            </h2>
            <p className={styles.guideSubtitle}>{guide.subtitle.en}</p>
          </div>
          <div className={styles.langHi}>
            <h2 className={styles.guideTitle}>{guide.title.hi}</h2>
            <p className={styles.guideSubtitle}>{guide.subtitle.hi}</p>
          </div>
        </>
      }
    >
      <div className={styles.langEn}>
        <GuideSteps lang="en" guide={guide} withStepIds />
      </div>
      <div className={styles.langHi}>
        <GuideSteps lang="hi" guide={guide} />
      </div>
    </ToolGuideLangShell>
  );
};
