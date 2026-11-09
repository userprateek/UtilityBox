'use client';

import React, { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { ToolMetadata } from '@/types/tool';
import { LoadingState } from '@/components/common/States/LoadingState';
import { Bi } from '@/components/i18n/Bi';

function workspaceLoading(en: string, hi: string) {
  function WorkspaceLoading() {
    return (
      <div style={{ padding: '3rem 0' }}>
        <LoadingState message={<Bi en={en} hi={hi} />} />
      </div>
    );
  }
  WorkspaceLoading.displayName = 'WorkspaceLoading';
  return WorkspaceLoading;
}

type ToolWorkspace = ComponentType<{ tool: ToolMetadata }>;

const ImageCropperWorkspace = dynamic(
  () =>
    import('@/features/image/ImageCropper/ImageCropperWorkspace').then(
      (m) => m.ImageCropperWorkspace
    ),
  { loading: workspaceLoading('Loading Image Cropper...', 'Image Cropper लोड हो रहा है...') }
);

const QrCodeGeneratorWorkspace = dynamic(
  () => import('@/features/qr/QrCodeGeneratorWorkspace').then((m) => m.QrCodeGeneratorWorkspace),
  { loading: workspaceLoading('Loading QR Code Generator...', 'QR Code Generator लोड हो रहा है...') }
);

const PassportSheetWorkspace = dynamic(
  () => import('@/features/image/PassportSheetWorkspace').then((m) => m.PassportSheetWorkspace),
  { loading: workspaceLoading('Loading Passport Photo Sheet Generator...', 'पासपोर्ट फोटो शीट लोड हो रही है...') }
);

const GstCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/GstCalculatorWorkspace').then((m) => m.GstCalculatorWorkspace),
  { loading: workspaceLoading('Loading GST Calculator...', 'GST Calculator लोड हो रहा है...') }
);

const EmiCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/EmiCalculatorWorkspace').then((m) => m.EmiCalculatorWorkspace),
  { loading: workspaceLoading('Loading EMI Calculator...', 'EMI Calculator लोड हो रहा है...') }
);

const GratuityCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/GratuityCalculatorWorkspace').then(
      (m) => m.GratuityCalculatorWorkspace
    ),
  { loading: workspaceLoading('Loading Gratuity Calculator...', 'Gratuity Calculator लोड हो रहा है...') }
);

const DiscountCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/DiscountCalculatorWorkspace').then(
      (m) => m.DiscountCalculatorWorkspace
    ),
  { loading: workspaceLoading('Loading Discount Calculator...', 'Discount Calculator लोड हो रहा है...') }
);

const SipCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/SipCalculatorWorkspace').then((m) => m.SipCalculatorWorkspace),
  { loading: workspaceLoading('Loading SIP Calculator...', 'SIP Calculator लोड हो रहा है...') }
);

const FdCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/FdCalculatorWorkspace').then((m) => m.FdCalculatorWorkspace),
  { loading: workspaceLoading('Loading FD Calculator...', 'FD Calculator लोड हो रहा है...') }
);

const TextToolsWorkspace = dynamic(
  () => import('@/features/text/TextToolsWorkspace').then((m) => m.TextToolsWorkspace),
  { loading: workspaceLoading('Loading Text Workspace...', 'टेक्स्ट टूल लोड हो रहा है...') }
);

const DevToolsWorkspace = dynamic(
  () => import('@/features/developer/DevToolsWorkspace').then((m) => m.DevToolsWorkspace),
  { loading: workspaceLoading('Loading Developer Utility Workspace...', 'डेवलपर टूल लोड हो रहा है...') }
);

const JsonFormatterWorkspace = dynamic(
  () => import('@/features/developer/JsonFormatterWorkspace').then((m) => m.JsonFormatterWorkspace),
  { loading: workspaceLoading('Loading JSON Formatter...', 'JSON Formatter लोड हो रहा है...') }
);

const DocumentTranslatorWorkspace = dynamic(
  () =>
    import('@/features/translator/DocumentTranslatorWorkspace').then(
      (m) => m.DocumentTranslatorWorkspace
    ),
  { loading: workspaceLoading('Loading Document Translator...', 'Document Translator लोड हो रहा है...') }
);

const DEDICATED_WORKSPACES: Record<string, ToolWorkspace> = {
  'image-cropper': ImageCropperWorkspace,
  'passport-photo-maker': ImageCropperWorkspace,
  'signature-cropper': ImageCropperWorkspace,
  'qr-code-generator': QrCodeGeneratorWorkspace,
  'upi-qr-code-generator': QrCodeGeneratorWorkspace,
  'passport-sheet-maker': PassportSheetWorkspace,
  'gst-calculator': GstCalculatorWorkspace,
  'emi-calculator': EmiCalculatorWorkspace,
  'gratuity-calculator': GratuityCalculatorWorkspace,
  'discount-calculator': DiscountCalculatorWorkspace,
  'sip-calculator': SipCalculatorWorkspace,
  'fd-calculator': FdCalculatorWorkspace,
  'word-counter': TextToolsWorkspace,
  'case-converter': TextToolsWorkspace,
  'remove-duplicates': TextToolsWorkspace,
  uuid: DevToolsWorkspace,
  'url-encoder': DevToolsWorkspace,
  'jwt-decoder': DevToolsWorkspace,
  'base64-converter': DevToolsWorkspace,
  'json-formatter': JsonFormatterWorkspace,
  'document-translator': DocumentTranslatorWorkspace,
};

export function DedicatedToolWorkspace({ tool }: { tool: ToolMetadata }) {
  const Workspace = DEDICATED_WORKSPACES[tool.slug];
  if (!Workspace) return null;
  return <Workspace tool={tool} />;
}

export function hasDedicatedWorkspace(slug: string): boolean {
  return Boolean(DEDICATED_WORKSPACES[slug]);
}
