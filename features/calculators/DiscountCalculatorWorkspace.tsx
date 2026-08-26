'use client';

import React, { useState } from 'react';
import { Percent, Tag, IndianRupee } from 'lucide-react';
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

  const summaryText = `UtilityBox Discount Calculation:
Original MRP: ₹${price.toFixed(2)}
Discount: ${discountType === 'percentage' ? `${effectivePercent}%` : `₹${savingsAmount.toFixed(2)} off`}
----------------------------------------
YOU PAY: ₹${finalPrice.toFixed(2)}
TOTAL MONEY SAVED: ₹${savingsAmount.toFixed(2)} (${effectivePercent.toFixed(1)}% OFF)`;

  return (
    <CalculatorShell tool={tool}>
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
        <CalculatorSummaryCard title="Final Price & Savings" icon={<Tag size={20} />}>
            <CalculatorHighlight
              label="FINAL PRICE YOU PAY"
              value={`₹${finalPrice.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              subtext={
                <>
                  Saved <strong>₹{savingsAmount.toFixed(2)}</strong> ({effectivePercent.toFixed(1)}%
                  OFF)
                </>
              }
            />

            <div className={styles.detailsGrid}>
              <CalculatorDetailRow
                label="Original MRP"
                value={`₹${price.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              />
              <CalculatorDetailRow
                label="Total Savings"
                value={`- ₹${savingsAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                valueClassName={styles.detailValueHighlight}
              />
              <CalculatorDetailRow
                label="Effective Savings Rate"
                value={`${effectivePercent.toFixed(1)}% OFF`}
                valueClassName={styles.detailValueBold}
              />
            </div>

            <CopyButton
              className={styles.copyBtn}
              text={summaryText}
              idleLabel="Copy Discount Summary"
              copiedLabel="Copied Discount Summary!"
            />
        </CalculatorSummaryCard>
    </CalculatorShell>
  );
};
