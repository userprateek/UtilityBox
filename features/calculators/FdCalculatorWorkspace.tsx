'use client';

import React, { useState } from 'react';
import { Coins, Sparkles, Building2 } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { Input } from '@/components/common/Input/Input';
import { Select } from '@/components/common/Select/Select';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import { CopyButton } from '@/components/common/CopyButton/CopyButton';
import styles from './Calculators.module.scss';

export interface FdCalculatorWorkspaceProps {
  tool: ToolMetadata;
}

type CompoundingFreq = 'quarterly' | 'monthly' | 'half_yearly' | 'annually';

export const FdCalculatorWorkspace: React.FC<FdCalculatorWorkspaceProps> = ({ tool }) => {
  const [depositAmount, setDepositAmount] = useState<string>('100000');
  const [interestRate, setInterestRate] = useState<string>('7.5');
  const [tenureYears, setTenureYears] = useState<string>('3');
  const [frequency, setFrequency] = useState<CompoundingFreq>('quarterly');

  const numPrincipal = parseFloat(depositAmount) || 0;
  const numRate = parseFloat(interestRate) || 0;
  const numYears = parseFloat(tenureYears) || 0;

  let compPerYear = 4; // default quarterly
  if (frequency === 'monthly') compPerYear = 12;
  if (frequency === 'half_yearly') compPerYear = 2;
  if (frequency === 'annually') compPerYear = 1;

  const totalCompPeriods = compPerYear * numYears;
  const ratePerPeriod = numRate / (compPerYear * 100);

  const maturityAmount =
    totalCompPeriods > 0 ? numPrincipal * Math.pow(1 + ratePerPeriod, totalCompPeriods) : numPrincipal;
  const totalInterest = Math.max(0, maturityAmount - numPrincipal);

  const freqLabel =
      frequency === 'quarterly'
        ? 'Quarterly (Standard Bank FD)'
        : frequency === 'monthly'
          ? 'Monthly'
          : frequency === 'half_yearly'
            ? 'Half-Yearly'
            : 'Annually';

  const summaryText = `UtilityBox Fixed Deposit (FD) Calculation:
Deposit Principal Amount: ₹${numPrincipal.toLocaleString('en-IN')}
Annual Bank Interest Rate: ${numRate}% p.a.
Tenure: ${numYears} Years
Compounding Frequency: ${freqLabel}
----------------------------------------
Total Interest Earned: ₹${Math.round(totalInterest).toLocaleString('en-IN')}
----------------------------------------
TOTAL MATURITY VALUE: ₹${Math.round(maturityAmount).toLocaleString('en-IN')}`;

  return (
    <div className={styles.calcWrapper}>
      <ToolHeader tool={tool} />

      <div className={styles.calcGrid}>
        {/* Input Column */}
        <div className={styles.inputCol}>
          <Card variant="glass" padding="lg" className={styles.calcCard}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Total FD Deposit Principal Amount (₹)</label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="e.g. 100000"
              />
              <div className={styles.presetChipsRow}>
                {['10000', '50000', '100000', '500000', '1000000'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`${styles.chipBtn} ${depositAmount === v ? styles.chipBtnActive : ''}`}
                    onClick={() => setDepositAmount(v)}
                  >
                    ₹{parseInt(v, 10).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelWithBadge}>
                <label className={styles.label}>Bank Interest Rate (% p.a.)</label>
                <span className={styles.badgeVal}>{numRate}%</span>
              </div>
              <Input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="e.g. 7.5"
              />
              <div className={styles.presetChipsRow}>
                {['6.5', '7.0', '7.5', '8.0', '8.5'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`${styles.chipBtn} ${interestRate === r ? styles.chipBtnActive : ''}`}
                    onClick={() => setInterestRate(r)}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelWithBadge}>
                <label className={styles.label}>Deposit Tenure (Years)</label>
                <span className={styles.badgeVal}>{numYears} Years</span>
              </div>
              <Input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                placeholder="e.g. 3"
              />
              <div className={styles.presetChipsRow}>
                {['1', '2', '3', '5', '10'].map((y) => (
                  <button
                    key={y}
                    type="button"
                    className={`${styles.chipBtn} ${tenureYears === y ? styles.chipBtnActive : ''}`}
                    onClick={() => setTenureYears(y)}
                  >
                    {y} {y === '1' ? 'Yr' : 'Yrs'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <Select
                label="Compounding Interest Frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as CompoundingFreq)}
                options={[
                  {
                    value: 'quarterly',
                    label: 'Quarterly Compounding (Standard Indian Bank FD)',
                  },
                  { value: 'monthly', label: 'Monthly Compounding' },
                  { value: 'half_yearly', label: 'Half-Yearly Compounding' },
                  { value: 'annually', label: 'Annual Compounding' },
                ]}
              />
            </div>
          </Card>
        </div>

        {/* Output Column */}
        <div className={styles.outputCol}>
          <Card variant="glass" padding="lg" className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <Building2 size={22} className={styles.headerIcon} />
              <h3 className={styles.resultTitle}>Bank FD Maturity Projection</h3>
            </div>

            <div className={styles.mrpHighlightCard}>
              <span className={styles.mrpLabel}>TOTAL MATURITY PAYOUT</span>
              <span className={styles.mrpValue}>
                ₹{Math.round(maturityAmount).toLocaleString('en-IN')}
              </span>
              <span className={styles.mrpSubtext}>
                Total maturity value after {numYears} years with{' '}
                {frequency === 'quarterly'
                  ? 'quarterly'
                  : frequency === 'monthly'
                    ? 'monthly'
                    : frequency === 'half_yearly'
                      ? 'half-yearly'
                      : 'annual'}{' '}
                compounding
              </span>
            </div>

            <div className={styles.breakdownGrid}>
              <div className={styles.breakdownItem}>
                <span className={styles.bdLabel}>Deposit Principal</span>
                <span className={styles.bdValue}>
                  ₹{Math.round(numPrincipal).toLocaleString('en-IN')}
                </span>
              </div>

              <div className={styles.breakdownItem}>
                <span className={styles.bdLabel}>Total Interest Earned</span>
                <span className={`${styles.bdValue} ${styles.greenText}`}>
                  +₹{Math.round(totalInterest).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <CopyButton
              className={styles.copyBtn}
              text={summaryText}
              idleLabel="Copy FD Summary"
              copiedLabel="Summary Copied!"
            />

            <div className={styles.tipBox}>
              <Sparkles size={14} />
              <span>
                <strong>Bank FD Tip</strong>: Indian commercial banks compound fixed deposit interest
                on a quarterly basis.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
