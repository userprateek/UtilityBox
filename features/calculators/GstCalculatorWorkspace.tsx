'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Store,
  PlusCircle,
  MinusCircle,
  Copy,
  Check,
  HelpCircle,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { Input } from '@/components/common/Input/Input';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import styles from './Calculators.module.scss';

export interface GstCalculatorWorkspaceProps {
  tool: ToolMetadata;
}

type GstMode = 'shopkeeper' | 'add' | 'remove';

const GST_SLABS = [5, 12, 18, 28];

export const GstCalculatorWorkspace: React.FC<GstCalculatorWorkspaceProps> = ({ tool }) => {
  const [mode, setMode] = useState<GstMode>('shopkeeper');
  const [gstRate, setGstRate] = useState<number>(18);

  // Shopkeeper Profit Mode Fields
  const [costPrice, setCostPrice] = useState<string>('1000');
  const [desiredProfit, setDesiredProfit] = useState<string>('200');

  // Add / Remove GST Fields
  const [amount, setAmount] = useState<string>('1000');

  const [copied, setCopied] = useState<boolean>(false);

  // Calculate outputs based on active mode
  const numCost = parseFloat(costPrice) || 0;
  const numProfit = parseFloat(desiredProfit) || 0;
  const numAmount = parseFloat(amount) || 0;

  let basePrice = 0;
  let gstAmount = 0;
  let finalMrp = 0;
  let netProfitKept = 0;

  if (mode === 'shopkeeper') {
    // Businessman Logic: Desired Profit (X) + Cost (Y) = Base Selling Price
    basePrice = numCost + numProfit;
    gstAmount = basePrice * (gstRate / 100);
    finalMrp = basePrice + gstAmount;
    netProfitKept = numProfit;
  } else if (mode === 'add') {
    // Exclusive GST: Amount + GST%
    basePrice = numAmount;
    gstAmount = numAmount * (gstRate / 100);
    finalMrp = numAmount + gstAmount;
  } else {
    // Inclusive GST: Amount already includes GST%
    finalMrp = numAmount;
    basePrice = numAmount / (1 + gstRate / 100);
    gstAmount = finalMrp - basePrice;
  }

  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  const handleCopySummary = async () => {
    const summaryText =
      mode === 'shopkeeper'
        ? `UtilityBox GST & Profit Calculation:
Cost Price: ₹${numCost.toFixed(2)}
Desired Profit: ₹${netProfitKept.toFixed(2)}
Base Selling Price: ₹${basePrice.toFixed(2)}
GST (${gstRate}%): ₹${gstAmount.toFixed(2)} (CGST: ₹${cgst.toFixed(2)}, SGST: ₹${sgst.toFixed(2)})
----------------------------------------
FINAL MRP / BILLING PRICE: ₹${finalMrp.toFixed(2)}`
        : `UtilityBox GST Calculation (${mode === 'add' ? 'Exclusive' : 'Inclusive'}):
Base Amount: ₹${basePrice.toFixed(2)}
GST (${gstRate}%): ₹${gstAmount.toFixed(2)} (CGST: ₹${cgst.toFixed(2)}, SGST: ₹${sgst.toFixed(2)})
----------------------------------------
TOTAL BILL AMOUNT: ₹${finalMrp.toFixed(2)}`;

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
            {/* Mode Switcher Pills */}
            <div className={styles.modeNav}>
              <button
                type="button"
                className={`${styles.modeBtn} ${mode === 'shopkeeper' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('shopkeeper')}
              >
                <Store size={16} />
                <span>Shopkeeper Profit Mode</span>
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${mode === 'add' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('add')}
              >
                <PlusCircle size={16} />
                <span>Add GST (Exclusive)</span>
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${mode === 'remove' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('remove')}
              >
                <MinusCircle size={16} />
                <span>Remove GST (Inclusive)</span>
              </button>
            </div>

            {/* Mode Explainer Banner */}
            <div className={styles.infoBanner}>
              <HelpCircle size={16} className={styles.infoIcon} />
              <span>
                {mode === 'shopkeeper'
                  ? 'Shopkeeper Mode: Enter your purchase cost and how much net profit you want to keep. We calculate the exact MRP to charge customers.'
                  : mode === 'add'
                    ? 'Add GST Mode: Calculates total price by adding GST tax on top of your base price.'
                    : 'Remove GST Mode: Extracts original base price and tax collected from a total GST-inclusive bill.'}
              </span>
            </div>

            {/* GST Rate Selector Pills */}
            <div className={styles.rateSection}>
              <label className={styles.inputLabel}>Select GST Tax Rate (%)</label>
              <div className={styles.ratePills}>
                {GST_SLABS.map((slab) => (
                  <button
                    key={slab}
                    type="button"
                    className={`${styles.ratePill} ${gstRate === slab ? styles.ratePillActive : ''}`}
                    onClick={() => setGstRate(slab)}
                  >
                    {slab}%
                  </button>
                ))}
                <div className={styles.customRateInput}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={gstRate}
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                    className={styles.miniRateInput}
                  />
                  <span>% Custom</span>
                </div>
              </div>
            </div>

            {/* Dynamic Inputs Based on Mode */}
            <div className={styles.inputStack}>
              {mode === 'shopkeeper' ? (
                <>
                  <Input
                    label="Article Purchase / Cost Price (₹Y) *"
                    type="number"
                    placeholder="e.g. 1000"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    helperText="How much you paid to buy or produce the article"
                  />
                  <Input
                    label="Desired Net Profit in Pocket (₹X) *"
                    type="number"
                    placeholder="e.g. 200"
                    value={desiredProfit}
                    onChange={(e) => setDesiredProfit(e.target.value)}
                    helperText="Net profit amount you want to keep after paying GST"
                  />
                </>
              ) : (
                <Input
                  label={
                    mode === 'add'
                      ? 'Base Amount Before GST (₹) *'
                      : 'Total Billed Amount Incl. GST (₹) *'
                  }
                  type="number"
                  placeholder="e.g. 1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Output Column */}
        <div className={styles.outputCol}>
          <Card variant="glass" padding="lg" className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h3 className={styles.summaryTitle}>GST Calculation Breakdown</h3>
              <Receipt size={20} className={styles.headerIcon} />
            </div>

            {/* Big Highlight MRP Box */}
            <div className={styles.mrpHighlightCard}>
              <span className={styles.mrpLabel}>
                {mode === 'shopkeeper' ? 'RECOMMENDED CUSTOMER MRP' : 'TOTAL BILL AMOUNT'}
              </span>
              <span className={styles.mrpValue}>
                ₹
                {finalMrp.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {mode === 'shopkeeper' && (
                <span className={styles.mrpSubtext}>
                  Charge this MRP to keep exact <strong>₹{netProfitKept.toFixed(2)}</strong> profit
                </span>
              )}
            </div>

            {/* Detailed Key Value Rows */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Base Selling Price (excl. GST)</span>
                <span className={styles.detailValue}>₹{basePrice.toFixed(2)}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total GST Tax ({gstRate}%)</span>
                <span className={styles.detailValueHighlight}>+ ₹{gstAmount.toFixed(2)}</span>
              </div>

              <div className={styles.splitRow}>
                <div className={styles.splitBox}>
                  <span className={styles.splitLabel}>CGST ({gstRate / 2}%)</span>
                  <span className={styles.splitVal}>₹{cgst.toFixed(2)}</span>
                </div>
                <div className={styles.splitBox}>
                  <span className={styles.splitLabel}>SGST ({gstRate / 2}%)</span>
                  <span className={styles.splitVal}>₹{sgst.toFixed(2)}</span>
                </div>
              </div>

              {mode === 'shopkeeper' && (
                <div className={styles.profitResultCard}>
                  <div className={styles.profitTitleRow}>
                    <TrendingUp size={16} className={styles.profitIcon} />
                    <span>Your Net Profit Kept</span>
                  </div>
                  <span className={styles.profitVal}>₹{netProfitKept.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button type="button" className={styles.copyBtn} onClick={handleCopySummary}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied Calculation Summary!' : 'Copy Calculation Summary'}</span>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};
