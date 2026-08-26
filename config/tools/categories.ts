import { ToolCategory } from '@/types/tool';

export const TOOL_CATEGORIES: Record<string, ToolCategory> = {
  image: {
    id: 'image',
    label: 'Image Tools',
    description: 'Compress, resize, crop, convert, and optimize images in your browser.',
    iconName: 'Image',
    accentColor: '#3b82f6',
  },
  pdf: {
    id: 'pdf',
    label: 'PDF Tools',
    description: 'Merge, split, compress, and convert PDF documents securely with zero uploads.',
    iconName: 'FileText',
    accentColor: '#ef4444',
  },
  qr: {
    id: 'qr',
    label: 'QR Code Generators',
    description: 'Create UPI shop counter payment QR, WhatsApp direct chat, WiFi, and link QRs.',
    iconName: 'QrCode',
    accentColor: '#ec4899',
  },
  text: {
    id: 'text',
    label: 'Text Tools',
    description: 'Count words, convert cases, clean duplicates, and compare text strings.',
    iconName: 'Type',
    accentColor: '#a855f7',
  },
  converters: {
    id: 'converters',
    label: 'Converters',
    description: 'Convert between popular image formats, documents, and data representations.',
    iconName: 'RefreshCw',
    accentColor: '#8b5cf6',
  },
  developer: {
    id: 'developer',
    label: 'Developer Utilities',
    description: 'Format JSON, encode/decode Base64, decode JWT, and generate UUIDs.',
    iconName: 'Code',
    accentColor: '#10b981',
  },
  calculators: {
    id: 'calculators',
    label: 'Calculators',
    description: 'GST, SIP compounding, loan EMI, gratuity, and profit calculators.',
    iconName: 'Calculator',
    accentColor: '#06b6d4',
  },
};

export const TOOL_CATEGORIES_LIST: ToolCategory[] = Object.values(TOOL_CATEGORIES);
