import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container/Container';
import { siteConfig } from '@/config/site';
import { publicPageMetadata } from '@/lib/seo/pageMetadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbJsonLd } from '@/lib/seo/schema';
import { Bi } from '@/components/i18n/Bi';
import styles from '../info.module.scss';

export const metadata: Metadata = publicPageMetadata({
  title: 'Terms of Service',
  description: 'Terms for using the free DocsWala in-browser tools.',
  path: '/terms',
});

export default function TermsPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteConfig.url },
    { name: 'Terms', url: `${siteConfig.url}/terms` },
  ]);

  return (
    <Container size="lg">
      <JsonLd schema={breadcrumbJsonLd} />
      <div className={styles.infoContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <Bi en="Terms of Service" hi="सेवा की शर्तें" />
          </h1>
          <p className={styles.subtitle}>
            <Bi en="Last updated: August 2026." hi="आखिरी अपडेट: अगस्त 2026।" />
          </p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="1. Acceptance of Terms" hi="1. शर्तें मानना" />
            </h2>
            <p className={styles.text}>
              <Bi
                en="By accessing and using DocsWala, you agree to comply with and be bound by these Terms of Service."
                hi="DocsWala खोलकर और इस्तेमाल करके आप इन सेवा शर्तों को मानते हैं।"
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="2. Permitted Use" hi="2. इस्तेमाल की अनुमति" />
            </h2>
            <p className={styles.text}>
              <Bi
                en="You may use DocsWala for personal and commercial file and calculation tasks in accordance with applicable laws. Processing happens on your device; you keep ownership of your files."
                hi="आप DocsWala का निजी या दुकान के काम के लिए इस्तेमाल कर सकते हैं, कानून के अंदर। प्रोसेस आपके डिवाइस पर होता है। फ़ाइल आपकी ही रहती है।"
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="3. Disclaimer of Warranties" hi="3. वारंटी नहीं" />
            </h2>
            <p className={styles.text}>
              <Bi
                en='DocsWala is provided on an "as is" and "as available" basis without warranties of any kind. Always keep independent backups of important documents.'
                hi="DocsWala जैसा है वैसा उपलब्ध है। किसी तरह की वारंटी नहीं है। ज़रूरी दस्तावेज़ की अपनी कॉपी अलग रखें।"
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="4. Related pages" hi="4. जुड़े पेज" />
            </h2>
            <p className={styles.text}>
              <Bi
                en={
                  <>
                    See <Link href="/about">About DocsWala</Link> and the{' '}
                    <Link href="/privacy">Privacy Policy</Link>.
                  </>
                }
                hi={
                  <>
                    देखें <Link href="/about">DocsWala के बारे में</Link> और{' '}
                    <Link href="/privacy">प्राइवेसी नीति</Link>।
                  </>
                }
              />
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
