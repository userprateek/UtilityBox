import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '../Button/Button';
import styles from './States.module.scss';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while processing. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div className={cn(styles.stateContainer, styles.errorState, className)}>
      <div className={cn(styles.iconWrapper, styles.errorIcon)}>
        <AlertTriangle size={36} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{message}</p>
      {onRetry && (
        <div className={styles.actionContainer}>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
