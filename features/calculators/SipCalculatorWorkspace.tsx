'use client';

import React, { useState } from 'react';
import { TrendingUp, Copy, Check, Sparkles, Coins, PieChart } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { Input } from '@/components/common/Input/Input';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import styles from './Calculators.module.scss';

export interface SipCalculatorWorkspaceProps {
  tool: ToolMetadata;
}

type SipMode = 'sip' | 'lumpsum';

export const SipCalculatorWorkspace: React.FC<SipCalculatorWorkspaceProps> = ({ tool }) => {
  const [mode, setMode] = useState<SipMode>('sip');
  const [amount, setAmount] = useState<string>('10000');
  const [returnRate, setReturnRate] = useState<string>('6');
  const [tenureYears, setTenureYears] = useState<string>('10');
  const [copied, setCopied] = useState<boolean>(false);

  const numAmount = parseFloat(amount) || 0;
  const numRate = parseFloat(returnRate) || 0;
  const numYears = parseFloat(tenureYears) || 0;

  let totalInvested = 0;
  let maturityValue = 0;
  let wealthGained = 0;

  if (mode === 'sip') {
    const monthlyRate = numRate / 12 / 100;
    const months = numYears * 12;
    totalInvested = numAmount * months;

    if (monthlyRate > 0 && months > 0) {
      maturityValue =
        numAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    } else {
      maturityValue = totalInvested;
    }
  } else {
    // Lumpsum
    totalInvested = numAmount;
    maturityValue = numAmount * Math.pow(1 + numRate / 100, numYears);
  }

  wealthGained = maturityValue - totalInvested;

  const investedPct =
    totalInvested <= 0
      ? 50
      : maturityValue <= 0
        ? 100
        : Math.min(100, Math.max(0, (totalInvested / Math.max(maturityValue, totalInvested)) * 100));
  const growthPct = Math.max(0, 100 - investedPct);

  const handleCopy = async () => {
    const summaryText = `UtilityBox ${mode === 'sip' ? 'SIP' : 'Lumpsum'} Investment Calculation:
Investment Mode: ${mode === 'sip' ? 'Monthly SIP' : 'One-Time Lumpsum'}
${mode === 'sip' ? 'Monthly SIP Amount' : 'Lumpsum Deposit'}: ₹${numAmount.toLocaleString('en-IN')}
Expected Return Rate: ${numRate}% p.a.
Investment Tenure: ${numYears} Years
----------------------------------------
Total Invested Amount: ₹${Math.round(totalInvested).toLocaleString('en-IN')}
Est. Wealth Growth (Returns): ₹${Math.round(wealthGained).toLocaleString('en-IN')}
----------------------------------------
TOTAL MATURITY VALUE: ₹${Math.round(maturityValue).toLocaleString('en-IN')}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className={styles.calcWrapper}>
      <ToolHeader tool={tool} />

      <div className={styles.calcGrid}>
        {/* Input Column */}
        <div className={styles.inputCol}>
          <Card variant="glass" padding="lg" className={styles.calcCard}>
            <div className={styles.modeToggle}>
              <button
                type="button"
                className={`${styles.modeBtn} ${mode === 'sip' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('sip')}
              >
                <TrendingUp size={16} />
                <span>Monthly SIP</span>
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${mode === 'lumpsum' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('lumpsum')}
              >
                <Coins size={16} />
                <span>Lumpsum</span>
              </button>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                {mode === 'sip' ? 'Monthly Investment Amount (₹)' : 'Lumpsum Investment Amount (₹)'}
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 10000"
              />
              <div className={styles.presetChipsRow}>
                {['2500', '5000', '10000', '25000', '50000'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`${styles.chipBtn} ${amount === v ? styles.chipBtnActive : ''}`}
                    onClick={() => setAmount(v)}
                  >
                    ₹{parseInt(v, 10).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelWithBadge}>
                <label className={styles.label}>Expected Return Rate (% p.a.)</label>
                <span className={styles.badgeVal}>{numRate}%</span>
              </div>
              <Input
                type="number"
                step="0.5"
                value={returnRate}
                onChange={(e) => setReturnRate(e.target.value)}
                placeholder="e.g. 6 or 12"
              />
              <div className={styles.presetChipsRow}>
                {[
                  { r: '6', label: '6% (Safe/Debt)' },
                  { r: '10', label: '10% (Balanced)' },
                  { r: '12', label: '12% (Equity SIP)' },
                  { r: '15', label: '15% (High Growth)' },
                ].map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    className={`${styles.chipBtn} ${returnRate === item.r ? styles.chipBtnActive : ''}`}
                    onClick={() => setReturnRate(item.r)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelWithBadge}>
                <label className={styles.label}>Investment Tenure (Years)</label>
                <span className={styles.badgeVal}>{numYears} Years</span>
              </div>
              <Input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                placeholder="e.g. 10"
              />
              <div className={styles.presetChipsRow}>
                {['3', '5', '10', '15', '20', '25'].map((y) => (
                  <button
                    key={y}
                    type="button"
                    className={`${styles.chipBtn} ${tenureYears === y ? styles.chipBtnActive : ''}`}
                    onClick={() => setTenureYears(y)}
                  >
                    {y} Yrs
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Output Column */}
        <div className={styles.outputCol}>
          <Card variant="glass" padding="lg" className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <PieChart size={22} className={styles.headerIcon} />
              <h3 className={styles.resultTitle}>
                {mode === 'lumpsum' ? 'Lumpsum Wealth Projection' : 'SIP Wealth Projection'}
              </h3>
            </div>

            <div className={styles.mrpHighlightCard}>
              <span className={styles.mrpLabel}>ESTIMATED MATURITY VALUE</span>
              <span className={styles.mrpValue}>
                ₹{Math.round(maturityValue).toLocaleString('en-IN')}
              </span>
              <span className={styles.mrpSubtext}>
                Total accumulated wealth after {numYears} years at {numRate}% yearly returns
              </span>
            </div>

            <div className={styles.breakdownGrid}>
              <div className={styles.breakdownItem}>
                <span className={styles.bdLabel}>Total Invested</span>
                <span className={styles.bdValue}>
                  ₹{Math.round(totalInvested).toLocaleString('en-IN')}
                </span>
              </div>

              <div className={styles.breakdownItem}>
                <span className={styles.bdLabel}>
                  {wealthGained < 0 ? 'Est. Loss' : 'Est. Wealth Growth'}
                </span>
                <span className={`${styles.bdValue} ${wealthGained < 0 ? '' : styles.greenText}`}>
                  {wealthGained < 0 ? '−' : '+'}₹
                  {Math.round(Math.abs(wealthGained)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Visual Bar Breakdown */}
            <div className={styles.visualBarContainer}>
              <div className={styles.barHeader}>
                <span>Principal ({investedPct.toFixed(1)}%)</span>
                <span>Growth ({growthPct.toFixed(1)}%)</span>
              </div>
              <div className={styles.barTrack}>
                <div className={styles.barFillPrimary} style={{ width: `${investedPct}%` }} />
                <div className={styles.barFillSuccess} style={{ width: `${growthPct}%` }} />
              </div>
            </div>

            <button type="button" className={styles.copyBtn} onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Summary Copied!' : 'Copy SIP Return Summary'}</span>
            </button>

            <div className={styles.tipBox}>
              <Sparkles size={14} />
              <span>
                <strong>Compounding Power</strong>: Investing ₹{numAmount.toLocaleString('en-IN')}
                {mode === 'sip' ? '/mo' : ' lumpsum'} at {numRate}% p.a. builds ₹
                {Math.round(maturityValue).toLocaleString('en-IN')} maturity wealth.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
