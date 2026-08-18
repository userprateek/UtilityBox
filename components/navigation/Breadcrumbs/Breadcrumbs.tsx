import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/lib/seo/schema';
import styles from './Breadcrumbs.module.scss';

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumbs" className={styles.breadcrumbsNav}>
      <ol className={styles.breadcrumbsList}>
        <li className={styles.crumbItem}>
          <Link href="/" className={styles.crumbLink}>
            <Home size={14} className={styles.homeIcon} />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.url} className={styles.crumbItem}>
              <ChevronRight size={13} className={styles.separator} />
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className={styles.crumbLink}>
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
