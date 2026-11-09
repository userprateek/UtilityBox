import React from 'react';
import { getRelatedTools } from '@/config/tools/registry';
import { ToolCard } from '@/components/tool/ToolCard/ToolCard';
import { Bi } from '@/components/i18n/Bi';
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
    <section className={styles.relatedSection} aria-labelledby="related-tools-title">
      <div className={styles.header}>
        <span className={styles.overline}>
          <Bi en="Complementary Tools" hi="साथ के टूल" />
        </span>
        <h2 id="related-tools-title" className={styles.title}>
          <Bi en="Related tools" hi="मिलते-जुलते टूल" />
        </h2>
        <p className={styles.subtitle}>
          <Bi
            en="Other DocsWala tools in the same category, plus popular tools from other categories."
            hi="इसी श्रेणी के और टूल, और दूसरी श्रेणियों के लोकप्रिय टूल।"
          />
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
