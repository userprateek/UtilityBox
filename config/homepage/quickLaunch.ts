import { getToolBySlug } from '@/config/tools/registry';
import { ToolMetadata } from '@/types/tool';

/** Slugs for the homepage quick-launch row. Names and routes come from the registry. */
export const QUICK_LAUNCH_SLUGS = [
  'image-compressor',
  'image-resizer',
  'pdf-merger',
  'pdf-splitter',
  'image-to-pdf',
  'qr-code-generator',
] as const;

export function getQuickLaunchTools(): ToolMetadata[] {
  return QUICK_LAUNCH_SLUGS.flatMap((slug) => {
    const tool = getToolBySlug(slug);
    return tool ? [tool] : [];
  });
}
