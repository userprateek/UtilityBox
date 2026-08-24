import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GstCalculatorWorkspace } from './GstCalculatorWorkspace';
import { EmiCalculatorWorkspace } from './EmiCalculatorWorkspace';
import { GratuityCalculatorWorkspace } from './GratuityCalculatorWorkspace';
import { DiscountCalculatorWorkspace } from './DiscountCalculatorWorkspace';
import { ToolMetadata } from '@/types/tool';

const mockTool: ToolMetadata = {
  slug: 'gst-calculator',
  name: 'GST & Shopkeeper Profit Calculator',
  shortDescription: 'Calculate GST and net profit',
  description: 'Calculate GST and net profit for shopkeepers',
  category: 'calculators',
  iconName: 'Calculator',
  supportedInputFormats: ['text/plain'],
  seoTitle: 'Free GST Calculator',
  seoDescription: 'Free GST calculator online',
  keywords: ['gst'],
};

describe('Calculators Workspace Suite', () => {
  describe('GstCalculatorWorkspace', () => {
    it('calculates MRP and preserves exact net profit in Shopkeeper Profit Mode', () => {
      render(<GstCalculatorWorkspace tool={mockTool} />);

      expect(screen.getByText('Shopkeeper Profit Mode')).toBeInTheDocument();

      const costInput = screen.getByLabelText(/Article Purchase \/ Cost Price/i);
      const profitInput = screen.getByLabelText(/Desired Net Profit in Pocket/i);

      fireEvent.change(costInput, { target: { value: '1000' } });
      fireEvent.change(profitInput, { target: { value: '200' } });

      // Base = 1200, GST(18%) = 216, MRP = 1416
      expect(screen.getByText('₹1,416.00')).toBeInTheDocument();
      expect(screen.getByText('₹1200.00')).toBeInTheDocument();
      expect(screen.getByText('+ ₹216.00')).toBeInTheDocument();
    });

    it('switches to Add GST mode and calculates exclusive tax', () => {
      render(<GstCalculatorWorkspace tool={mockTool} />);

      const addBtn = screen.getByText('Add GST (Exclusive)');
      fireEvent.click(addBtn);

      const amountInput = screen.getByLabelText(/Base Amount Before GST/i);
      fireEvent.change(amountInput, { target: { value: '500' } });

      // 500 + 18% (90) = 590
      expect(screen.getByText('₹590.00')).toBeInTheDocument();
    });
  });

  describe('EmiCalculatorWorkspace', () => {
    it('calculates monthly EMI and interest for a loan', () => {
      render(<EmiCalculatorWorkspace tool={mockTool} />);

      const amountInput = screen.getByLabelText(/Loan Amount/i);
      fireEvent.change(amountInput, { target: { value: '100000' } });

      expect(screen.getByText(/EMI Repayment Summary/i)).toBeInTheDocument();
    });
  });

  describe('GratuityCalculatorWorkspace', () => {
    it('checks 5-year eligibility and calculates gratuity payout', () => {
      render(<GratuityCalculatorWorkspace tool={mockTool} />);

      const salaryInput = screen.getByLabelText(/Monthly Basic Salary/i);
      const tenureInput = screen.getByLabelText(/Completed Years/i);

      fireEvent.change(salaryInput, { target: { value: '26000' } });
      fireEvent.change(tenureInput, { target: { value: '5' } });

      // (15 * 26000 * 5) / 26 = 75,000
      expect(screen.getByText('₹75,000.00')).toBeInTheDocument();
      expect(screen.getByText(/Eligible \(5\+ Yrs Service\)/i)).toBeInTheDocument();
    });
  });

  describe('DiscountCalculatorWorkspace', () => {
    it('calculates discount percentage savings and final price', () => {
      render(<DiscountCalculatorWorkspace tool={mockTool} />);

      const priceInput = screen.getByLabelText(/Original Item MRP/i);
      const valInput = screen.getByLabelText(/Discount Percentage/i);

      fireEvent.change(priceInput, { target: { value: '2000' } });
      fireEvent.change(valInput, { target: { value: '20' } });

      // 2000 - 20% (400) = 1600
      expect(screen.getByText('₹1,600.00')).toBeInTheDocument();
    });
  });

  describe('SipCalculatorWorkspace', () => {
    it('calculates SIP investment growth and maturity value', () => {
      const sipTool = { ...mockTool, slug: 'sip-calculator', name: 'SIP Calculator' };
      const { SipCalculatorWorkspace } = require('./SipCalculatorWorkspace');
      render(<SipCalculatorWorkspace tool={sipTool} />);

      expect(screen.getByText('SIP Wealth Projection')).toBeInTheDocument();
      expect(screen.getByText('ESTIMATED MATURITY VALUE')).toBeInTheDocument();
    });
  });

  describe('FdCalculatorWorkspace', () => {
    it('calculates FD maturity payout with compounding', () => {
      const fdTool = { ...mockTool, slug: 'fd-calculator', name: 'FD Calculator' };
      const { FdCalculatorWorkspace } = require('./FdCalculatorWorkspace');
      render(<FdCalculatorWorkspace tool={fdTool} />);

      expect(screen.getByText('Bank FD Maturity Projection')).toBeInTheDocument();
      expect(screen.getByText('TOTAL MATURITY PAYOUT')).toBeInTheDocument();
    });
  });
});
