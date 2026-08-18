export type ToolCategoryId =
  'image' | 'pdf' | 'converters' | 'utilities' | 'calculators' | 'developer';

export interface ToolCategory {
  id: ToolCategoryId;
  label: string;
  description: string;
  iconName: string;
  accentColor: string;
}

export type FileFormat =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/avif'
  | 'image/gif'
  | 'image/svg+xml'
  | 'application/pdf'
  | 'application/json'
  | 'text/plain'
  | 'text/csv'
  | '*/*';

export interface ToolMetadata {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ToolCategoryId;
  iconName: string;
  supportedInputFormats: FileFormat[] | string[];
  supportedOutputFormats?: FileFormat[] | string[];
  maxFiles?: number;
  maxFileSizeMB?: number;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  isPopular?: boolean;
  isNew?: boolean;
  features?: string[];
  privacyNotice?: string;
}

export type ProcessingStatus =
  'idle' | 'preparing' | 'processing' | 'completed' | 'error' | 'cancelled';

export interface ProcessingProgress {
  percentage: number;
  currentStep?: string;
  totalSteps?: number;
  currentStepIndex?: number;
}
