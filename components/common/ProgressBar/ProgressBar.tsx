import React from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './ProgressBar.module.scss';

export interface ProgressBarProps {
  percentage: number;
  label?: string;
  sublabel?: string;
  showPercentageText?: boolean;
  variant?: 'primary' | 'success' | 'accent';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  sublabel,
  showPercentageText = true,
  variant = 'primary',
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className={cn(styles.wrapper, className)}>
      {(label || showPercentageText) && (
        <div className={styles.header}>
          <div className={styles.titles}>
            {label && <span className={styles.label}>{label}</span>}
            {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
          </div>
          {showPercentageText && (
            <span className={styles.percentageText}>{Math.round(clamped)}%</span>
          )}
        </div>
      )}
      <div className={styles.track}>
        <div
          className={cn(styles.fill, styles[variant])}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
