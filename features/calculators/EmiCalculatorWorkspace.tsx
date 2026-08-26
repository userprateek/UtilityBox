'use client';

import React, { useState } from 'react';
import { Coins, Calendar, Percent, IndianRupee } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { Input } from '@/components/common/Input/Input';
import { CopyButton } from '@/components/common/CopyButton/CopyButton';
import {
  CalculatorDetailRow,
  CalculatorHighlight,
  CalculatorShell,
  CalculatorSummaryCard,
  calculatorStyles as styles,
} from './CalculatorUi';

export interface EmiCalculatorWorkspaceProps {
  tool: ToolMetadata;
}

export const EmiCalculatorWorkspace: React.FC<EmiCalculatorWorkspaceProps> = ({ tool }) => {
  const [loanAmount, setLoanAmount] = useState<string>('500000');
  const [interestRate, setInterestRate] = useState<string>('10.5');
  const [tenure, setTenure] = useState<string>('5');
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');

  const P = parseFloat(loanAmount) || 0;
  const annualRate = parseFloat(interestRate) || 0;
  const r = annualRate / 12 / 100;
  const numTenure = parseFloat(tenure) || 0;
  const N = tenureType === 'years' ? numTenure * 12 : numTenure;

  let monthlyEmi = 0;
  let totalPayable = 0;
  let totalInterest = 0;

  if (P > 0 && r > 0 && N > 0) {
    const emiFactor = Math.pow(1 + r, N);
    monthlyEmi = (P * r * emiFactor) / (emiFactor - 1);
    totalPayable = monthlyEmi * N;
    totalInterest = totalPayable - P;
  } else if (P > 0 && N > 0 && r === 0) {
    monthlyEmi = P / N;
    totalPayable = P;
    totalInterest = 0;
  }

  const principalPercent = totalPayable > 0 ? Math.round((P / totalPayable) * 100) : 100;
  const interestPercent = 100 - principalPercent;

  const summaryText = `UtilityBox Loan EMI Calculation:
Loan Amount: ₹${P.toLocaleString('en-IN')}
Interest Rate: ${annualRate}% p.a.
Tenure: ${numTenure} ${tenureType} (${N} months)
----------------------------------------
MONTHLY EMI: ₹${monthlyEmi.toFixed(2)}
Total Interest Payable: ₹${totalInterest.toFixed(2)}
Total Amount Payable: ₹${totalPayable.toFixed(2)}`;

  return (
    <CalculatorShell tool={tool}>
      <div className={styles.formCol}>
        <Card variant="glass" padding="lg" className={styles.card}>
          <div className={styles.inputStack}>
            <Input
              label="Loan Amount (₹) *"
              type="number"
              placeholder="e.g. 500000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              leftIcon={<IndianRupee size={16} />}
            />

            <Input
              label="Interest Rate (% per annum) *"
              type="number"
              step="0.1"
              placeholder="e.g. 10.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              leftIcon={<Percent size={16} />}
            />

            <div className={styles.tenureGroup}>
              <Input
                label={`Loan Tenure (${tenureType === 'years' ? 'Years' : 'Months'}) *`}
                type="number"
                placeholder="e.g. 5"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                leftIcon={<Calendar size={16} />}
              />
              <div className={styles.tenureSwitch}>
                <button
                  type="button"
                  className={`${styles.tenureBtn} ${tenureType === 'years' ? styles.tenureBtnActive : ''}`}
                  onClick={() => {
                    if (tenureType === 'years') return;
                    const months = parseFloat(tenure) || 0;
                    const years = months / 12;
                    setTenure(
                      String(Number.isInteger(years) ? years : Math.round(years * 100) / 100)
                    );
                    setTenureType('years');
                  }}
                >
                  Yr
                </button>
                <button
                  type="button"
                  className={`${styles.tenureBtn} ${tenureType === 'months' ? styles.tenureBtnActive : ''}`}
                  onClick={() => {
                    if (tenureType === 'months') return;
                    const years = parseFloat(tenure) || 0;
                    setTenure(String(Math.round(years * 12)));
                    setTenureType('months');
                  }}
                >
                  Mo
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <CalculatorSummaryCard title="EMI Repayment Summary" icon={<Coins size={20} />}>
        <CalculatorHighlight
          label="MONTHLY EMI PAYABLE"
          value={`₹${monthlyEmi.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtext={`For ${N} equal monthly installments`}
        />

        <div className={styles.barSection}>
          <div className={styles.barHeader}>
            <span>Principal ({principalPercent}%)</span>
            <span>Interest ({interestPercent}%)</span>
          </div>
          <div className={styles.trackBar}>
            <div className={styles.principalFill} style={{ width: `${principalPercent}%` }} />
            <div className={styles.interestFill} style={{ width: `${interestPercent}%` }} />
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <CalculatorDetailRow
            label="Principal Loan Amount"
            value={`₹${P.toLocaleString('en-IN')}`}
          />
          <CalculatorDetailRow
            label="Total Interest Charges"
            value={`+ ₹${totalInterest.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            valueClassName={styles.detailValueHighlight}
          />
          <CalculatorDetailRow
            label="Total Amount Payable"
            value={`₹${totalPayable.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            valueClassName={styles.detailValueBold}
          />
        </div>

        <CopyButton
          className={styles.copyBtn}
          text={summaryText}
          idleLabel="Copy EMI Breakdown"
          copiedLabel="Copied EMI Breakdown!"
        />
      </CalculatorSummaryCard>
    </CalculatorShell>
  );
};
