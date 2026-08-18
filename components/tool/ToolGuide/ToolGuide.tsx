import React from 'react';
import { UploadCloud, Sliders, Download } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import styles from './ToolGuide.module.scss';

export interface ToolGuideProps {
  tool: ToolMetadata;
}

export const ToolGuide: React.FC<ToolGuideProps> = ({ tool }) => {
  return (
    <section className={styles.guideSection} aria-labelledby="how-it-works-title">
      <div className={styles.guideHeader}>
        <span className={styles.guideOverline}>Step-by-Step Guide</span>
        <h2 id="how-it-works-title" className={styles.guideTitle}>
          How to Use {tool.name} in 3 Easy Steps
        </h2>
        <p className={styles.guideSubtitle}>
          Fast, effortless in-browser processing with complete data confidentiality.
        </p>
      </div>

      <div className={styles.stepsGrid}>
        {/* Step 1 */}
        <div className={styles.stepCard}>
          <div className={styles.stepNumberBadge}>1</div>
          <div className={styles.iconWrapper}>
            <UploadCloud size={24} />
          </div>
          <h3 className={styles.stepTitle}>Select or Drop Files</h3>
          <p className={styles.stepDesc}>
            Choose files from your computer or drag them into the dropzone. Your files remain
            entirely on your device.
          </p>
        </div>

        {/* Step 2 */}
        <div className={styles.stepCard}>
          <div className={styles.stepNumberBadge}>2</div>
          <div className={styles.iconWrapper}>
            <Sliders size={24} />
          </div>
          <h3 className={styles.stepTitle}>Configure Settings</h3>
          <p className={styles.stepDesc}>
            Customize compression levels, crop bounds, aspect ratios, or target format presets to
            suit your exact needs.
          </p>
        </div>

        {/* Step 3 */}
        <div className={styles.stepCard}>
          <div className={styles.stepNumberBadge}>3</div>
          <div className={styles.iconWrapper}>
            <Download size={24} />
          </div>
          <h3 className={styles.stepTitle}>Instant Download</h3>
          <p className={styles.stepDesc}>
            Click process to generate your transformed files locally and download them immediately.
          </p>
        </div>
      </div>
    </section>
  );
};
