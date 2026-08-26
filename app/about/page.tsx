import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container/Container';
import { siteConfig } from '@/config/site';
import { publicPageMetadata } from '@/lib/seo/pageMetadata';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import { getAllTools, getToolsByCategory } from '@/config/tools/registry';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbJsonLd } from '@/lib/seo/schema';
import styles from '../info.module.scss';

export const metadata: Metadata = publicPageMetadata({
  title: 'About DocsWala',
  description: siteConfig.oneLiner,
  path: '/about',
});

export default function AboutPage() {
  const allTools = getAllTools();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteConfig.url },
    { name: 'About', url: `${siteConfig.url}/about` },
  ]);

  return (
    <Container size="lg">
      <JsonLd schema={breadcrumbJsonLd} />
      <div className={styles.infoContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>About DocsWala</h1>
          <p className={styles.subtitle}>{siteConfig.oneLiner}</p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What DocsWala is</h2>
            <p className={styles.text}>
              DocsWala is a free website of document and utility tools that run in a web browser.
              You can compress and crop photos, merge or split PDFs, convert between images and
              PDF, generate UPI and other QR codes, format text, decode developer tokens, and
              calculate GST, EMI, SIP, FD, discount, and gratuity figures.
            </p>
            <p className={styles.text}>
              There are currently {allTools.length} public tools. No account is required. The tools
              do not add watermarks.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Who operates it</h2>
            <p className={styles.text}>
              DocsWala is operated by the DocsWala Team. There is no public company address or
              support email on this site. Legal pages:{' '}
              <Link href="/privacy">Privacy</Link> and <Link href="/terms">Terms</Link>.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Who it is for</h2>
            <p className={styles.text}>
              Cyber cafes, shop counters, students, and anyone filling online forms who needs
              passport photos, signature crops, ID PDFs, shop QR codes, or simple tax and loan
              calculations without signing up.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Supported platforms</h2>
            <p className={styles.text}>
              Any modern desktop or mobile browser on Windows, macOS, Linux, Android, or iOS. Tools
              are web pages, not installable apps.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Privacy model</h2>
            <p className={styles.text}>
              Interactive tools process files and values in your browser. DocsWala does not ask you
              to create an account. Files you add in the tool UI are not stored on DocsWala. Theme
              and similar preferences may be saved in your browser&apos;s localStorage. If Google
              Analytics is enabled, it may record page views. See the{' '}
              <Link href="/privacy">privacy page</Link> for details.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Main categories</h2>
            <ul className={styles.list}>
              {TOOL_CATEGORIES_LIST.map((cat) => {
                const count = getToolsByCategory(cat.id).length;
                return (
                  <li key={cat.id}>
                    <Link href={`/tools?category=${cat.id}`}>{cat.label}</Link>
                    {' — '}
                    {cat.description} ({count} tools)
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How to get started</h2>
            <p className={styles.text}>
              Open the <Link href="/tools">full tool directory</Link>, read{' '}
              <Link href="/help">how the tools work</Link>, or jump to a common task such as the{' '}
              <Link href="/image-compressor">image compressor</Link>,{' '}
              <Link href="/pdf-merger">PDF merger</Link>, or{' '}
              <Link href="/upi-qr-code-generator">UPI QR generator</Link>.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
