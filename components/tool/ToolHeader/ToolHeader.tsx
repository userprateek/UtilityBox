import React from 'react';
import { ShieldCheck, Sparkles, HelpCircle, Languages } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Badge } from '@/components/common/Badge/Badge';
import { ToolIcon } from '@/components/common/ToolIcon/ToolIcon';
import { TOOL_CATEGORIES } from '@/config/tools/categories';
import { Bi } from '@/components/i18n/Bi';
import { categoryHindi, toolHindi } from '@/lib/i18n/catalog';
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
              <Bi en={category.label} hi={categoryHindi(tool.category).label} />
            </Badge>
          )}

          {tool.requiresExternalAi ? (
            <Badge variant="warning" size="sm" icon={<Languages size={12} />}>
              <Bi en="Uses AI — file sent for translation" hi="AI इस्तेमाल होता है — फ़ाइल अनुवाद के लिए जाती है" />
            </Badge>
          ) : (
            <Badge variant="success" size="sm" icon={<ShieldCheck size={12} />}>
              <Bi en="100% In-Browser Privacy" hi="पूरी तरह ब्राउज़र में, निजी" />
            </Badge>
          )}

          {tool.isPopular && (
            <Badge variant="warning" size="sm" icon={<Sparkles size={12} />}>
              <Bi en="Popular" hi="लोकप्रिय" />
            </Badge>
          )}

          <a href="#how-it-works-title" className={styles.helpButton}>
            <HelpCircle size={13} />
            <span>
              <Bi en={`How to use ${tool.name}`} hi={`${tool.name} कैसे चलाएँ`} />
            </span>
          </a>
        </div>
      </div>

      <h1 className={styles.title}>{tool.name}</h1>
      <p className={styles.description}>
        <Bi en={tool.description} hi={toolHindi(tool.slug)?.description ?? tool.description} />
      </p>
    </div>
  );
};
