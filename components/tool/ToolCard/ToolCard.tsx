import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Badge } from '@/components/common/Badge/Badge';
import { ToolIcon } from '@/components/common/ToolIcon/ToolIcon';
import { TOOL_CATEGORIES } from '@/config/tools/categories';
import styles from './ToolCard.module.scss';

export interface ToolCardProps {
  tool: ToolMetadata;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const category = TOOL_CATEGORIES[tool.category];

  return (
    <Link href={`/${tool.slug}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapper} style={{ color: category?.accentColor }}>
            <ToolIcon name={tool.iconName} size={22} />
          </div>
          <div className={styles.headerBadges}>
            {tool.isNew && (
              <Badge variant="success" size="sm">
                New
              </Badge>
            )}
            {tool.isPopular && (
              <Badge variant="warning" size="sm" icon={<Sparkles size={11} />}>
                Popular
              </Badge>
            )}
            <div className={styles.arrowIcon}>
              <ArrowUpRight size={18} />
            </div>
          </div>
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.toolName}>{tool.name}</h3>
          <p className={styles.toolDesc}>{tool.shortDescription}</p>
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.categoryName} style={{ color: category?.accentColor }}>
            {category?.label || tool.category}
          </span>
          <span className={styles.formatsInfo}>
            {tool.supportedInputFormats.length > 0 &&
              tool.supportedInputFormats
                .map((f) => f.replace('image/', '').replace('application/', '').toUpperCase())
                .slice(0, 3)
                .join(', ')}
          </span>
        </div>
      </div>
    </Link>
  );
};
