import { siteConfig } from '@/config/site';

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || siteConfig.gaMeasurementId;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Tracks a pageview event in Google Analytics
 */
export function pageview(url: string) {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) {
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

/**
 * Tracks homepage visits explicitly for clean GA4 dashboard segmentation
 */
export function trackHomeVisit() {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'home_visit', {
    event_category: 'Navigation',
    event_label: 'Homepage Visit',
  });
}

/**
 * Tracks when a user visits any individual tool route
 */
export function trackToolView(toolSlug: string, toolName?: string, category?: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'tool_view', {
    tool_slug: toolSlug,
    tool_name: toolName || toolSlug,
    tool_category: category || 'general',
    event_category: 'Tool Page',
    event_label: `View: ${toolSlug}`,
  });
}

/**
 * Tracks when a user uses a tool by downloading the processed file or printing a standee
 */
export function trackToolDownload(
  toolSlug: string,
  metadata?: {
    fileName?: string;
    fileExtension?: string;
    fileCount?: number;
    fileSize?: number;
    toolName?: string;
  }
) {
  if (typeof window === 'undefined' || !window.gtag) return;

  // 1. Fire official GA4 standard 'file_download' event
  window.gtag('event', 'file_download', {
    file_name: metadata?.fileName || `${toolSlug}_download`,
    file_extension: metadata?.fileExtension || 'bin',
    tool_slug: toolSlug,
    file_count: metadata?.fileCount || 1,
    value: metadata?.fileSize,
  });

  // 2. Fire custom 'tool_use' action event
  window.gtag('event', 'tool_use', {
    tool_slug: toolSlug,
    tool_name: metadata?.toolName || toolSlug,
    action_type: 'download',
    event_category: 'Tool Conversion',
    event_label: `Download: ${toolSlug}`,
    file_name: metadata?.fileName,
    file_extension: metadata?.fileExtension,
    file_count: metadata?.fileCount,
    file_size: metadata?.fileSize,
  });
}

/**
 * Tracks custom tool execution events (e.g. compression, cropping, QR creation)
 */
export function trackToolUse(
  toolSlug: string,
  action: string,
  metadata?: Record<string, unknown>
) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'tool_use', {
    tool_slug: toolSlug,
    action_type: action,
    event_category: 'Tool Action',
    event_label: `${toolSlug}:${action}`,
    ...metadata,
  });
}

/**
 * Generic event tracker for Google Analytics
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, params);
}
