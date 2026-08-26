import React from 'react';
import { getRelatedTools } from '@/config/tools/registry';
import { ToolCard } from '@/components/tool/ToolCard/ToolCard';
import styles from './RelatedTools.module.scss';

export interface RelatedToolsProps {
  currentSlug: string;
  limit?: number;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ currentSlug, limit = 3 }) => {
  const related = getRelatedTools(currentSlug, limit);

  if (related.length === 0) {
    return null;
  }

  return (
    <section className={styles.relatedSection} aria-label="Related Tools">
      <div className={styles.header}>
        <span className={styles.overline}>Complementary Tools</span>
        <h2 className={styles.title}>Related tools</h2>
        <p className={styles.subtitle}>
          Other DocsWala tools in the same category, plus popular tools from other categories.
        </p>
      </div>

      <div className={styles.grid}>
        {related.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
};
