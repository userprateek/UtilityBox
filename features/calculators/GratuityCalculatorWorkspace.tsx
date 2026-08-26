'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  AlertCircle,
  HelpCircle,
  IndianRupee,
  Calendar,
} from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { Input } from '@/components/common/Input/Input';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import { CopyButton } from '@/components/common/CopyButton/CopyButton';
import styles from './Calculators.module.scss';

export interface GratuityCalculatorWorkspaceProps {
  tool: ToolMetadata;
}

export const GratuityCalculatorWorkspace: React.FC<GratuityCalculatorWorkspaceProps> = ({
  tool,
}) => {
  const [basicSalary, setBasicSalary] = useState<string>('45000');
  const [tenureYears, setTenureYears] = useState<string>('7');

  const salary = parseFloat(basicSalary) || 0;
  const years = parseFloat(tenureYears) || 0;

  const isEligible = years >= 5;

  // Formula under Payment of Gratuity Act: (15 * Basic * Years) / 26
  let gratuityAmount = 0;
  if (isEligible && salary > 0) {
    gratuityAmount = (15 * salary * years) / 26;
  }

  const taxExemptLimit = 2000000; // ₹20 Lakhs
  const isTaxExempt = gratuityAmount <= taxExemptLimit;

  const summaryText = `UtilityBox Gratuity Settlement Calculation:
Monthly Basic + DA: ₹${salary.toLocaleString('en-IN')}
Completed Service: ${years} Years
Eligibility Status: ${isEligible ? 'Eligible (5+ Years)' : 'Not Eligible (Less than 5 Years)'}
----------------------------------------
TOTAL GRATUITY PAYABLE: ₹${gratuityAmount.toFixed(2)}
Tax Status: ${isTaxExempt ? '100% Tax Free (Under ₹20 Lakhs limit)' : 'Taxable above ₹20 Lakhs'}`;

  return (
    <div className={styles.calcWrapper}>
      <ToolHeader tool={tool} />

      <div className={styles.grid}>
        {/* Input Column */}
        <div className={styles.formCol}>
          <Card variant="glass" padding="lg" className={styles.card}>
            <div className={styles.inputStack}>
              <Input
                label="Monthly Basic Salary + DA (₹) *"
                type="number"
                placeholder="e.g. 45000"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                leftIcon={<IndianRupee size={16} />}
                helperText="Enter last drawn basic salary plus Dearness Allowance"
              />

              <Input
                label="Completed Years of Continuous Service *"
                type="number"
                placeholder="e.g. 7"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                leftIcon={<Calendar size={16} />}
                helperText="Minimum 5 years continuous service required by law"
              />
            </div>

            <div className={styles.formulaNoteBox}>
              <HelpCircle size={16} className={styles.infoIcon} />
              <span>
                Official Formula: <strong>(15 × Last Drawn Basic Salary × Years) ÷ 26</strong>
              </span>
            </div>
          </Card>
        </div>

        {/* Output Summary Column */}
        <div className={styles.outputCol}>
          <Card variant="glass" padding="lg" className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h3 className={styles.summaryTitle}>Gratuity Payout Summary</h3>
              <Briefcase size={20} className={styles.headerIcon} />
            </div>

            {/* Eligibility Banner */}
            {!isEligible && (
              <div className={styles.eligibilityWarning}>
                <AlertCircle size={18} />
                <span>Minimum 5 years of service required for Gratuity eligibility.</span>
              </div>
            )}

            {/* Big Highlight Gratuity Box */}
            <div className={styles.mrpHighlightCard}>
              <span className={styles.mrpLabel}>ESTIMATED GRATUITY PAYOUT</span>
              <span className={styles.mrpValue}>
                ₹
                {gratuityAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className={styles.mrpSubtext}>
                {isEligible
                  ? 'Payable upon resignation, retirement, or termination'
                  : 'Enter 5 or more years of service'}
              </span>
            </div>

            {/* Detailed Key Value Rows */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Eligibility Status</span>
                <span className={isEligible ? styles.statusSuccess : styles.statusWarning}>
                  {isEligible ? 'Eligible (5+ Yrs Service)' : 'Not Eligible (< 5 Yrs)'}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tax Exemption Limit</span>
                <span className={styles.detailValue}>Up to ₹20 Lakhs</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Taxability</span>
                <span className={styles.detailValueHighlight}>
                  {isTaxExempt ? '100% Tax Free' : 'Taxable Amount Above ₹20L'}
                </span>
              </div>
            </div>

            <CopyButton
              className={styles.copyBtn}
              text={summaryText}
              idleLabel="Copy Gratuity Summary"
              copiedLabel="Copied Gratuity Summary!"
              disabled={!isEligible}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
