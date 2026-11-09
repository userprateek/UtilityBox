import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/lib/seo/schema';
import { Bi } from '@/components/i18n/Bi';
import styles from './Breadcrumbs.module.scss';

const CRUMB_HI: Record<string, string> = {
  Home: 'होम',
  'All Tools': 'सभी टूल',
  About: 'हमारे बारे में',
  Help: 'मदद',
  Privacy: 'प्राइवेसी',
  Terms: 'नियम',
};

function CrumbLabel({ name }: { name: string }) {
  const hindi = CRUMB_HI[name];
  if (!hindi) return name;
  return <Bi en={name} hi={hindi} />;
}

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
            <span>
              <CrumbLabel name="Home" />
            </span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.url} className={styles.crumbItem}>
              <ChevronRight size={13} className={styles.separator} />
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  <CrumbLabel name={item.name} />
                </span>
              ) : (
                <Link href={item.url} className={styles.crumbLink}>
                  <CrumbLabel name={item.name} />
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
