import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QrCodeGeneratorWorkspace } from './QrCodeGeneratorWorkspace';
import { ToolMetadata } from '@/types/tool';

// Mock canvas toDataURL
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock-qr-base64');

describe('QrCodeGeneratorWorkspace Component', () => {
  const mockQrTool: ToolMetadata = {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    shortDescription: 'Generate QR codes',
    description: 'Generate QR codes for UPI, WiFi, and links',
    category: 'utilities',
    iconName: 'QrCode',
    supportedInputFormats: ['text/plain'],
    seoTitle: 'Free QR Code Generator',
    seoDescription: 'Free QR maker online',
    keywords: ['qr code'],
  };

  it('renders with URL input tab by default and allows text entry', () => {
    render(<QrCodeGeneratorWorkspace tool={mockQrTool} />);

    expect(screen.getByText('Link / Text')).toBeInTheDocument();
    expect(screen.getByText('UPI Payment')).toBeInTheDocument();
    expect(screen.getByText('Shop WiFi')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Enter website link/i);
    fireEvent.change(textarea, { target: { value: 'https://myexamform.gov.in' } });

    expect(textarea).toHaveValue('https://myexamform.gov.in');
  });

  it('switches to UPI Payment tab and renders shop VPA fields', () => {
    render(<QrCodeGeneratorWorkspace tool={mockQrTool} />);

    const upiTab = screen.getByText('UPI Payment');
    fireEvent.click(upiTab);

    expect(screen.getByLabelText(/Your Shop UPI ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Shop \/ Payee Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fixed Amount/i)).toBeInTheDocument();

    const upiInput = screen.getByPlaceholderText(/yourshop@okhdfcbank/i);
    fireEvent.change(upiInput, { target: { value: 'sharmacafe@upi' } });

    expect(upiInput).toHaveValue('sharmacafe@upi');
  });

  it('switches to WhatsApp tab and renders phone number and pre-filled message inputs', () => {
    render(<QrCodeGeneratorWorkspace tool={mockQrTool} />);

    const waTab = screen.getAllByText('WhatsApp')[0]!;
    fireEvent.click(waTab);

    expect(screen.getByLabelText(/WhatsApp Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pre-filled Message/i)).toBeInTheDocument();
  });

  it('provides PNG download, Print Standee, and Copy Image buttons', () => {
    render(<QrCodeGeneratorWorkspace tool={mockQrTool} />);

    expect(screen.getByRole('button', { name: /download png image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /print standee/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy image/i })).toBeInTheDocument();
  });
});
