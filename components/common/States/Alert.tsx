import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import styles from './States.module.scss';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className={cn(styles.alert, styles[`alert-${type}`], className)} role="alert">
      <div className={styles.alertIcon}>{renderIcon()}</div>
      <div className={styles.alertContent}>
        {title && <h5 className={styles.alertTitle}>{title}</h5>}
        <div className={styles.alertMessage}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className={styles.alertClose}
          onClick={onClose}
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
