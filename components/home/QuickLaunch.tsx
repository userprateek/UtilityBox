import React from 'react';
import Link from 'next/link';
import { ToolIcon } from '@/components/common/ToolIcon/ToolIcon';
import { Bi } from '@/components/i18n/Bi';
import { getQuickLaunchTools } from '@/config/homepage/quickLaunch';
import { toolHindi } from '@/lib/i18n/catalog';
import styles from './QuickLaunch.module.scss';

export function QuickLaunch() {
  const tools = getQuickLaunchTools();

  return (
    <section className={styles.section} aria-labelledby="quick-launch-heading">
      <h2 id="quick-launch-heading" className={styles.heading}>
        <Bi en="Open a tool" hi="एक टूल खोलें" />
      </h2>
      <ul className={styles.grid}>
        {tools.map((tool) => (
          <li key={tool.slug}>
            <Link href={`/${tool.slug}`} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                <ToolIcon name={tool.iconName} size={22} />
              </span>
              <span className={styles.copy}>
                <span className={styles.name}>{tool.name}</span>
                <span className={styles.description}>
                  <Bi en={tool.shortDescription} hi={toolHindi(tool.slug)?.short ?? tool.shortDescription} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/tools" className={styles.viewAll}>
        <Bi en="View All Tools" hi="सभी टूल देखें" />
      </Link>
    </section>
  );
}
