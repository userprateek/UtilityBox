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
    description: 'Format JSON, encode/decode Base64, inspect headers, and generate hashes.',
    iconName: 'Code',
    accentColor: '#10b981',
  },
  utilities: {
    id: 'utilities',
    label: 'Daily Utilities',
    description: 'QR code generators, unit converters, password generators, and text tools.',
    iconName: 'Wrench',
    accentColor: '#f59e0b',
  },
  calculators: {
    id: 'calculators',
    label: 'Calculators',
    description: 'GST, tax, financial, and ratio calculation tools.',
    iconName: 'Calculator',
    accentColor: '#06b6d4',
  },
};

export const TOOL_CATEGORIES_LIST: ToolCategory[] = Object.values(TOOL_CATEGORIES);
