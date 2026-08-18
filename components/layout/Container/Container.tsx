import React from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './Container.module.scss';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  size = 'lg',
  ...props
}) => {
  return (
    <div className={cn(styles.container, styles[size], className)} {...props}>
      {children}
    </div>
  );
};
