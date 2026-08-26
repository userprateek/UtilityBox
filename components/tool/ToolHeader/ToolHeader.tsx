import React from 'react';
import { ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Badge } from '@/components/common/Badge/Badge';
import { ToolIcon } from '@/components/common/ToolIcon/ToolIcon';
import { TOOL_CATEGORIES } from '@/config/tools/categories';
import styles from './ToolHeader.module.scss';

export interface ToolHeaderProps {
  tool: ToolMetadata;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ tool }) => {
  const category = TOOL_CATEGORIES[tool.category];

  return (
    <div className={styles.headerContainer}>
      <div className={styles.topRow}>
        <div className={styles.iconBadge}>
          <ToolIcon name={tool.iconName} size={26} />
        </div>

        <div className={styles.badgesGroup}>
          {category && (
            <Badge variant="primary" size="sm">
              {category.label}
            </Badge>
          )}

          <Badge variant="success" size="sm" icon={<ShieldCheck size={12} />}>
            100% In-Browser Privacy
          </Badge>

          {tool.isPopular && (
            <Badge variant="warning" size="sm" icon={<Sparkles size={12} />}>
              Popular
            </Badge>
          )}

          <a href="#how-it-works-title" className={styles.helpButton}>
            <HelpCircle size={13} />
            <span>How to use {tool.name}</span>
          </a>
        </div>
      </div>

      <h1 className={styles.title}>{tool.name}</h1>
      <p className={styles.description}>{tool.description}</p>
    </div>
  );
};
