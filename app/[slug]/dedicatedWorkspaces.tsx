'use client';

import React, { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { ToolMetadata } from '@/types/tool';
import { LoadingState } from '@/components/common/States/LoadingState';

function workspaceLoading(message: string) {
  function WorkspaceLoading() {
    return (
      <div style={{ padding: '3rem 0' }}>
        <LoadingState message={message} />
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
  { loading: workspaceLoading('Loading Image Cropper...') }
);

const QrCodeGeneratorWorkspace = dynamic(
  () => import('@/features/qr/QrCodeGeneratorWorkspace').then((m) => m.QrCodeGeneratorWorkspace),
  { loading: workspaceLoading('Loading QR Code Generator...') }
);

const PassportSheetWorkspace = dynamic(
  () => import('@/features/image/PassportSheetWorkspace').then((m) => m.PassportSheetWorkspace),
  { loading: workspaceLoading('Loading Passport Photo Sheet Generator...') }
);

const GstCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/GstCalculatorWorkspace').then((m) => m.GstCalculatorWorkspace),
  { loading: workspaceLoading('Loading GST Calculator...') }
);

const EmiCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/EmiCalculatorWorkspace').then((m) => m.EmiCalculatorWorkspace),
  { loading: workspaceLoading('Loading EMI Calculator...') }
);

const GratuityCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/GratuityCalculatorWorkspace').then(
      (m) => m.GratuityCalculatorWorkspace
    ),
  { loading: workspaceLoading('Loading Gratuity Calculator...') }
);

const DiscountCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/DiscountCalculatorWorkspace').then(
      (m) => m.DiscountCalculatorWorkspace
    ),
  { loading: workspaceLoading('Loading Discount Calculator...') }
);

const SipCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/SipCalculatorWorkspace').then((m) => m.SipCalculatorWorkspace),
  { loading: workspaceLoading('Loading SIP Calculator...') }
);

const FdCalculatorWorkspace = dynamic(
  () =>
    import('@/features/calculators/FdCalculatorWorkspace').then((m) => m.FdCalculatorWorkspace),
  { loading: workspaceLoading('Loading FD Calculator...') }
);

const TextToolsWorkspace = dynamic(
  () => import('@/features/text/TextToolsWorkspace').then((m) => m.TextToolsWorkspace),
  { loading: workspaceLoading('Loading Text Workspace...') }
);

const DevToolsWorkspace = dynamic(
  () => import('@/features/developer/DevToolsWorkspace').then((m) => m.DevToolsWorkspace),
  { loading: workspaceLoading('Loading Developer Utility Workspace...') }
);

const JsonFormatterWorkspace = dynamic(
  () => import('@/features/developer/JsonFormatterWorkspace').then((m) => m.JsonFormatterWorkspace),
  { loading: workspaceLoading('Loading JSON Formatter...') }
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
};

export function DedicatedToolWorkspace({ tool }: { tool: ToolMetadata }) {
  const Workspace = DEDICATED_WORKSPACES[tool.slug];
  if (!Workspace) return null;
  return <Workspace tool={tool} />;
}

export function hasDedicatedWorkspace(slug: string): boolean {
  return Boolean(DEDICATED_WORKSPACES[slug]);
}
