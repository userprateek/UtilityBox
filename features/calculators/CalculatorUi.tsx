import React from 'react';
import { ToolMetadata } from '@/types/tool';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import { Card } from '@/components/common/Card/Card';
import styles from './Calculators.module.scss';

export function CalculatorShell({
  tool,
  children,
}: {
  tool: ToolMetadata;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.calcWrapper}>
      <ToolHeader tool={tool} />
      <div className={styles.grid}>{children}</div>
    </div>
  );
}

export function CalculatorHighlight({
  label,
  value,
  subtext,
}: {
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
}) {
  return (
    <div className={styles.mrpHighlightCard}>
      <span className={styles.mrpLabel}>{label}</span>
      <span className={styles.mrpValue}>{value}</span>
      {subtext != null && <span className={styles.mrpSubtext}>{subtext}</span>}
    </div>
  );
}

export function CalculatorDetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={valueClassName ?? styles.detailValue}>{value}</span>
    </div>
  );
}

export function CalculatorSummaryCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.outputCol}>
      <Card variant="glass" padding="lg" className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <h3 className={styles.summaryTitle}>{title}</h3>
          <span className={styles.headerIcon}>{icon}</span>
        </div>
        {children}
      </Card>
    </div>
  );
}

export { styles as calculatorStyles };
