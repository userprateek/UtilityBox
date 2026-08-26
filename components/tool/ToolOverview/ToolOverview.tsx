import React from 'react';
import Link from 'next/link';
import { ToolMetadata } from '@/types/tool';
import { formatMimeList } from '@/lib/seo/formats';
import { getToolAudience } from '@/lib/seo/schema';
import { TOOL_CATEGORIES } from '@/config/tools/categories';
import styles from './ToolOverview.module.scss';

export interface ToolOverviewProps {
  tool: ToolMetadata;
}

export function ToolOverview({ tool }: ToolOverviewProps) {
  const category = TOOL_CATEGORIES[tool.category];
  const inputs = formatMimeList(tool.supportedInputFormats as string[]);
  const outputs = formatMimeList(tool.supportedOutputFormats as string[]);
  const takesFiles = Boolean(tool.maxFiles && tool.maxFiles > 0);
  const helpHref = `/${tool.slug}#how-it-works-title`;

  return (
    <section className={styles.overview} aria-labelledby="tool-overview-heading">
      <h2 id="tool-overview-heading" className={styles.heading}>
        About {tool.name}
      </h2>
      <p className={styles.lead}>{tool.description}</p>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>What it does</dt>
          <dd>{tool.shortDescription}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Who it is for</dt>
          <dd>{getToolAudience(tool.category)}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Category</dt>
          <dd>
            {category ? (
              <Link href={`/tools?category=${tool.category}`}>{category.label}</Link>
            ) : (
              tool.category
            )}
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>Input</dt>
          <dd>
            {takesFiles
              ? inputs || 'Files listed on this page'
              : 'Values or text you type on this page (no file upload)'}
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>Output</dt>
          <dd>{outputs || 'A download or on-screen result you can copy'}</dd>
        </div>
        <div className={styles.fact}>
          <dt>How to use it</dt>
          <dd>
            Follow the{' '}
            <a href={helpHref}>step-by-step guide for {tool.name}</a> further down this page.
            {takesFiles
              ? ' Add your files, adjust settings, then process and download.'
              : ' Fill in the fields, then read or copy the result.'}
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>Cost</dt>
          <dd>Free. No account. No watermark.</dd>
        </div>
        <div className={styles.fact}>
          <dt>Limits</dt>
          <dd>
            {takesFiles
              ? `Up to ${tool.maxFiles} file${tool.maxFiles === 1 ? '' : 's'} at a time${
                  tool.maxFileSizeMB ? `, ${tool.maxFileSizeMB} MB each` : ''
                }.`
              : 'No file-size limit; you enter numbers or text in the form.'}
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>Privacy</dt>
          <dd>
            {tool.privacyNotice ||
              'This tool runs in your browser. Files you add are processed on your device and are not stored on DocsWala.'}
          </dd>
        </div>
        {tool.features && tool.features.length > 0 && (
          <div className={styles.fact}>
            <dt>Compared with doing it manually</dt>
            <dd>
              <ul className={styles.featureList}>
                {tool.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
