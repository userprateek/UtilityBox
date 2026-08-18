import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import styles from './States.module.scss';

export interface LoadingStateProps {
  message?: string;
  description?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  description,
  className,
}) => {
  return (
    <div className={cn(styles.stateContainer, styles.loadingState, className)}>
      <div className={styles.spinnerWrapper}>
        <Loader2 size={36} className={styles.spinner} />
      </div>
      <h4 className={styles.title}>{message}</h4>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
};
