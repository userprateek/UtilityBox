import React from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './Badge.module.scss';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  icon,
  ...props
}) => {
  return (
    <span className={cn(styles.badge, styles[variant], styles[size], className)} {...props}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
    </span>
  );
};
