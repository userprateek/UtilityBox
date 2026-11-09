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
  title: 'Privacy Policy',
  description:
    'DocsWala processes files in your browser. This page explains what is and is not collected.',
  path: '/privacy',
});

export default function PrivacyPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteConfig.url },
    { name: 'Privacy', url: `${siteConfig.url}/privacy` },
  ]);

  return (
    <Container size="lg">
      <JsonLd schema={breadcrumbJsonLd} />
      <div className={styles.infoContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <Bi en="Privacy Policy" hi="प्राइवेसी नीति" />
          </h1>
          <p className={styles.subtitle}>
            <Bi en="Last updated: November 2026." hi="आखिरी अपडेट: नवंबर 2026।" />
          </p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="1. Files you process in the tools" hi="1. टूल में जो फ़ाइल आप प्रोसेस करते हैं" />
            </h2>
            <p className={styles.text}>
              <Bi
                en="Most interactive DocsWala tools run in your web browser. Photos, PDFs, and other files you add in those tool interfaces are processed on your device. DocsWala does not receive or store those files."
                hi="ज़्यादातर DocsWala टूल आपके वेब ब्राउज़र में चलते हैं। फोटो, PDF और दूसरी फ़ाइलें आपके डिवाइस पर प्रोसेस होती हैं। DocsWala उन्हें न लेता है, न सेव करता है।"
              />
            </p>
            <p className={styles.text}>
              <Bi
                en={
                  <>
                    The <Link href="/document-translator">AI Document Translator</Link> works
                    differently. The file is uploaded to the DocsWala server. The server sends that
                    file to Google Gemini so it can be translated, then returns the translated PDF
                    or image. DocsWala does not write the document to disk or a database, and the
                    in-memory copy is discarded when the response finishes. DocsWala does not
                    control whether Google keeps the document. Google&apos;s handling of that
                    content is covered by Google&apos;s own policies.
                  </>
                }
                hi={
                  <>
                    <Link href="/document-translator">AI Document Translator</Link> अलग काम करता है।
                    फ़ाइल DocsWala सर्वर पर जाती है। सर्वर उसे Google Gemini को भेजता है, फिर
                    अनुवादित PDF या इमेज लौटाता है। DocsWala दस्तावेज़ को डिस्क या डेटाबेस में नहीं
                    लिखता, और जवाब पूरा होते ही मेमोरी की कॉपी हटा देता है। Google दस्तावेज़ रखे या
                    नहीं, यह DocsWala तय नहीं करता। Google की अपनी नीति लागू होती है।
                  </>
                }
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="2. Accounts and personal profiles" hi="2. अकाउंट और प्रोफ़ाइल" />
            </h2>
            <p className={styles.text}>
              <Bi
                en="DocsWala does not require an account and does not ask you to create a user profile to use the tools."
                hi="DocsWala अकाउंट नहीं माँगता और टूल चलाने के लिए प्रोफ़ाइल नहीं बनवाता।"
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="3. Local storage" hi="3. लोकल स्टोरेज" />
            </h2>
            <p className={styles.text}>
              <Bi
                en="Preferences such as colour theme may be saved in your browser's localStorage. That data stays on your device and is not synced to a DocsWala user database."
                hi="रंग थीम जैसी पसंद ब्राउज़र के localStorage में रह सकती है। यह डेटा आपके डिवाइस पर रहता है और DocsWala के किसी यूज़र डेटाबेस में नहीं जाता।"
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="4. Analytics" hi="4. एनालिटिक्स" />
            </h2>
            <p className={styles.text}>
              <Bi
                en="The site loads Google Analytics. It may record page views and similar usage events. Analytics does not receive the contents of files you process in the tools."
                hi="साइट Google Analytics लोड करती है। यह पेज व्यू और ऐसा इस्तेमाल दर्ज कर सकता है। टूल में प्रोसेस की गई फ़ाइल का कंटेंट एनालिटिक्स को नहीं जाता।"
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="5. Related pages" hi="5. जुड़े पेज" />
            </h2>
            <p className={styles.text}>
              <Bi
                en={
                  <>
                    See <Link href="/about">About DocsWala</Link> and the{' '}
                    <Link href="/terms">Terms of Service</Link>. For how each tool works, see{' '}
                    <Link href="/help">Help</Link>.
                  </>
                }
                hi={
                  <>
                    देखें <Link href="/about">DocsWala के बारे में</Link> और{' '}
                    <Link href="/terms">सेवा की शर्तें</Link>। हर टूल कैसे चलता है, यह{' '}
                    <Link href="/help">मदद</Link> पर है।
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
