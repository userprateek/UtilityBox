'use client';

import React from 'react';
import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

export interface CopyButtonProps {
  text: string;
  idleLabel: string;
  copiedLabel: string;
  className?: string;
  disabled?: boolean;
  iconSize?: number;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  idleLabel,
  copiedLabel,
  className,
  disabled = false,
  iconSize = 16,
}) => {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={() => {
        void copy(text);
      }}
    >
      {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
      <span>{copied ? copiedLabel : idleLabel}</span>
    </button>
  );
};
