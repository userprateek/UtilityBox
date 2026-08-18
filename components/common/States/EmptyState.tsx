import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import styles from './States.module.scss';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There is nothing to display here right now.',
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn(styles.stateContainer, styles.emptyState, className)}>
      <div className={styles.iconWrapper}>{icon || <Inbox size={36} />}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.actionContainer}>{action}</div>}
    </div>
  );
};
