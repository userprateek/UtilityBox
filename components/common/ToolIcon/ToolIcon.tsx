import React from 'react';
import {
  Minimize2,
  Maximize2,
  Crop,
  RefreshCw,
  FileMinus,
  Layers,
  Split,
  FileImage,
  FileUp,
  Braces,
  QrCode,
  Binary,
  Calculator,
  Percent,
  DollarSign,
  Coins,
  TrendingUp,
  Receipt,
  Briefcase,
  Wrench,
} from 'lucide-react';

export interface ToolIconProps {
  name: string;
  size?: number;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, size = 24, className }) => {
  switch (name) {
    case 'Minimize2':
      return <Minimize2 size={size} className={className} />;
    case 'Maximize2':
      return <Maximize2 size={size} className={className} />;
    case 'Crop':
      return <Crop size={size} className={className} />;
    case 'RefreshCw':
      return <RefreshCw size={size} className={className} />;
    case 'FileMinus':
      return <FileMinus size={size} className={className} />;
    case 'Layers':
      return <Layers size={size} className={className} />;
    case 'Split':
      return <Split size={size} className={className} />;
    case 'FileImage':
      return <FileImage size={size} className={className} />;
    case 'FileUp':
      return <FileUp size={size} className={className} />;
    case 'Braces':
      return <Braces size={size} className={className} />;
    case 'QrCode':
      return <QrCode size={size} className={className} />;
    case 'Binary':
      return <Binary size={size} className={className} />;
    case 'Calculator':
      return <Calculator size={size} className={className} />;
    case 'Percent':
      return <Percent size={size} className={className} />;
    case 'DollarSign':
      return <DollarSign size={size} className={className} />;
    case 'Coins':
      return <Coins size={size} className={className} />;
    case 'TrendingUp':
      return <TrendingUp size={size} className={className} />;
    case 'Receipt':
      return <Receipt size={size} className={className} />;
    case 'Briefcase':
      return <Briefcase size={size} className={className} />;
    default:
      return <Wrench size={size} className={className} />;
  }
};
