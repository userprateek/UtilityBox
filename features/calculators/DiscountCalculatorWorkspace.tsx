'use client';

import React, { useState } from 'react';
import { Percent, Copy, Check, Tag, TrendingDown, IndianRupee } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { Input } from '@/components/common/Input/Input';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import styles from './Calculators.module.scss';

export interface DiscountCalculatorWorkspaceProps {
  tool: ToolMetadata;
}

type DiscountType = 'percentage' | 'fixed';

export const DiscountCalculatorWorkspace: React.FC<DiscountCalculatorWorkspaceProps> = ({
  tool,
}) => {
  const [originalPrice, setOriginalPrice] = useState<string>('2499');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('25');

  const [copied, setCopied] = useState<boolean>(false);

  const price = parseFloat(originalPrice) || 0;
  const value = parseFloat(discountValue) || 0;

  let savingsAmount = 0;
  let finalPrice = 0;
  let effectivePercent = 0;

  if (price > 0) {
    if (discountType === 'percentage') {
      effectivePercent = Math.min(100, Math.max(0, value));
      savingsAmount = price * (effectivePercent / 100);
      finalPrice = price - savingsAmount;
    } else {
      savingsAmount = Math.min(price, Math.max(0, value));
      finalPrice = price - savingsAmount;
      effectivePercent = (savingsAmount / price) * 100;
    }
  }

  const handleCopySummary = async () => {
    const summaryText = `UtilityBox Discount Calculation:
Original MRP: ₹${price.toFixed(2)}
Discount: ${discountType === 'percentage' ? `${value}%` : `₹${value.toFixed(2)} off`}
----------------------------------------
YOU PAY: ₹${finalPrice.toFixed(2)}
TOTAL MONEY SAVED: ₹${savingsAmount.toFixed(2)} (${effectivePercent.toFixed(1)}% OFF)`;

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

      <div className={styles.grid}>
        {/* Input Column */}
        <div className={styles.formCol}>
          <Card variant="glass" padding="lg" className={styles.card}>
            {/* Mode Switcher */}
            <div className={styles.modeNav}>
              <button
                type="button"
                className={`${styles.modeBtn} ${discountType === 'percentage' ? styles.modeBtnActive : ''}`}
                onClick={() => setDiscountType('percentage')}
              >
                <Percent size={16} />
                <span>Percentage Off (%)</span>
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${discountType === 'fixed' ? styles.modeBtnActive : ''}`}
                onClick={() => setDiscountType('fixed')}
              >
                <Tag size={16} />
                <span>Fixed Amount Off (₹)</span>
              </button>
            </div>

            <div className={styles.inputStack}>
              <Input
                label="Original Item MRP / Price (₹) *"
                type="number"
                placeholder="e.g. 2499"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                leftIcon={<IndianRupee size={16} />}
              />

              <Input
                label={
                  discountType === 'percentage'
                    ? 'Discount Percentage (%) *'
                    : 'Fixed Discount Amount (₹) *'
                }
                type="number"
                placeholder={discountType === 'percentage' ? 'e.g. 25' : 'e.g. 500'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                leftIcon={
                  discountType === 'percentage' ? <Percent size={16} /> : <IndianRupee size={16} />
                }
              />
            </div>
          </Card>
        </div>

        {/* Output Summary Column */}
        <div className={styles.outputCol}>
          <Card variant="glass" padding="lg" className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h3 className={styles.summaryTitle}>Final Price & Savings</h3>
              <Tag size={20} className={styles.headerIcon} />
            </div>

            {/* Big Highlight Final Price Box */}
            <div className={styles.mrpHighlightCard}>
              <span className={styles.mrpLabel}>FINAL PRICE YOU PAY</span>
              <span className={styles.mrpValue}>
                ₹
                {finalPrice.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className={styles.mrpSubtext}>
                Saved <strong>₹{savingsAmount.toFixed(2)}</strong> ({effectivePercent.toFixed(1)}%
                OFF)
              </span>
            </div>

            {/* Detailed Key Value Rows */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Original MRP</span>
                <span className={styles.detailValue}>
                  ₹
                  {price.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total Savings</span>
                <span className={styles.detailValueHighlight}>
                  - ₹
                  {savingsAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Effective Savings Rate</span>
                <span className={styles.detailValueBold}>{effectivePercent.toFixed(1)}% OFF</span>
              </div>
            </div>

            <button type="button" className={styles.copyBtn} onClick={handleCopySummary}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied Discount Summary!' : 'Copy Discount Summary'}</span>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};
