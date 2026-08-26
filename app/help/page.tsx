import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container/Container';
import { siteConfig } from '@/config/site';
import { publicPageMetadata } from '@/lib/seo/pageMetadata';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import { getToolsByCategory } from '@/config/tools/registry';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbJsonLd } from '@/lib/seo/schema';
import styles from '../info.module.scss';

export const metadata: Metadata = publicPageMetadata({
  title: 'Help — How DocsWala tools work',
  description:
    'How to use DocsWala image, PDF, QR, text, developer, and calculator tools in your browser. Links to each tool and its step-by-step guide.',
  path: '/help',
});

export default function HelpPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteConfig.url },
    { name: 'Help', url: `${siteConfig.url}/help` },
  ]);

  return (
    <Container size="lg">
      <JsonLd schema={breadcrumbJsonLd} />
      <div className={styles.infoContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>How DocsWala tools work</h1>
          <p className={styles.subtitle}>
            Each tool is a page you open in the browser. File tools ask you to add files, choose
            settings, then download the result. Calculators and text tools use form fields instead
            of uploads. Processing stays on your device.
          </p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Typical file-tool steps</h2>
            <ol className={styles.numberedList}>
              <li>Open the tool page from the homepage, the directory, or the list below.</li>
              <li>Add files with the file picker or by dropping them onto the page.</li>
              <li>Set quality, size, page range, or other options shown on that tool.</li>
              <li>Process, then download or copy the output.</li>
            </ol>
            <p className={styles.text}>
              Calculator and QR tools skip the file step: you type values, then generate or copy
              the result.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Privacy and limits</h2>
            <p className={styles.text}>
              Tools are free and do not require an account. File tools list their file-count and
              size limits on each page. DocsWala does not store the files you process in the
              browser UI. Read the <Link href="/privacy">privacy page</Link> for analytics and
              localStorage details.
            </p>
          </section>

          {TOOL_CATEGORIES_LIST.map((cat) => {
            const tools = getToolsByCategory(cat.id);
            if (tools.length === 0) return null;
            return (
              <section key={cat.id} className={styles.section}>
                <h2 className={styles.sectionTitle}>{cat.label}</h2>
                <p className={styles.text}>{cat.description}</p>
                <ul className={styles.list}>
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link href={`/${tool.slug}`}>{tool.name}</Link>
                      {' — '}
                      {tool.shortDescription}{' '}
                      <Link href={`/${tool.slug}#how-it-works-title`}>
                        How to use {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
