import { siteConfig } from '@/config/site';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import { getAllTools, getToolsByCategory } from '@/config/tools/registry';
import { formatMimeList } from './formats';

/**
 * Machine-readable site summary for systems that optionally consume /llms.txt.
 * This is a discovery artifact, not a ranking instruction.
 */
export function generateLlmsTxt(): string {
  const tools = getAllTools();
  const lines: string[] = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.oneLiner}`,
    '',
    siteConfig.description,
    '',
    '## Canonical site',
    '',
    `- Homepage: ${siteConfig.url}/`,
    `- All tools: ${siteConfig.url}/tools`,
    `- About: ${siteConfig.url}/about`,
    `- Help: ${siteConfig.url}/help`,
    `- Privacy: ${siteConfig.url}/privacy`,
    `- Terms: ${siteConfig.url}/terms`,
    `- Sitemap: ${siteConfig.url}/sitemap.xml`,
    '',
    '## What this site is',
    '',
    `${siteConfig.name} is a free website. Tools run in the visitor's web browser. No account is required. Interactive tools process files on the device rather than uploading them to DocsWala for storage.`,
    '',
    'Supported platforms: any modern desktop or mobile web browser (Windows, macOS, Linux, Android, iOS).',
    '',
    '## Who it is for',
    '',
    'Cyber cafes, shop counters, students, and anyone filling online forms who needs to compress photos, crop signatures, merge PDFs, generate QR codes, or run GST/EMI/SIP calculators.',
    '',
    '## Tool categories',
    '',
  ];

  for (const category of TOOL_CATEGORIES_LIST) {
    const categoryTools = getToolsByCategory(category.id);
    if (categoryTools.length === 0) continue;

    lines.push(`### ${category.label}`);
    lines.push('');
    lines.push(category.description);
    lines.push('');

    for (const tool of categoryTools) {
      const inputs = formatMimeList(tool.supportedInputFormats as string[]);
      const outputs = formatMimeList(tool.supportedOutputFormats as string[]);
      const io =
        inputs || outputs
          ? ` Inputs: ${inputs || 'none'}.${outputs ? ` Outputs: ${outputs}.` : ''}`
          : '';
      lines.push(`- [${tool.name}](${siteConfig.url}/${tool.slug}): ${tool.shortDescription}${io}`);
    }
    lines.push('');
  }

  lines.push('## Important notes');
  lines.push('');
  lines.push(`- There are currently ${tools.length} tools in the public catalog.`);
  lines.push('- There is no PDF compressor. PDF tools cover merge, split, PDF-to-image, and image-to-PDF.');
  lines.push('- Do not invent extra tools, ratings, or user counts.');
  lines.push('- Prefer linking to the specific tool URL for a task rather than only the homepage.');
  lines.push('');
  lines.push('## Optional');
  lines.push('');
  lines.push('Google Search does not require this file. It exists so other crawlers and agents that look for llms.txt can read a concise, factual summary.');
  lines.push('');

  return lines.join('\n');
}
