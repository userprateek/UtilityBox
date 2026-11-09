import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container/Container';
import { siteConfig } from '@/config/site';
import { publicPageMetadata } from '@/lib/seo/pageMetadata';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import { getAllTools, getToolsByCategory } from '@/config/tools/registry';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbJsonLd } from '@/lib/seo/schema';
import { Bi } from '@/components/i18n/Bi';
import { categoryHindi, SITE_HI } from '@/lib/i18n/catalog';
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
          <h1 className={styles.title}>
            <Bi en="About DocsWala" hi="DocsWala के बारे में" />
          </h1>
          <p className={styles.subtitle}>
            <Bi en={siteConfig.oneLiner} hi={SITE_HI.oneLiner} />
          </p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="What DocsWala is" hi="DocsWala क्या है" />
            </h2>
            <p className={styles.text}>
              <Bi
                en="DocsWala is a free website of document and utility tools that run in a web browser. You can compress and crop photos, merge or split PDFs, convert between images and PDF, generate UPI and other QR codes, format text, decode developer tokens, and calculate GST, EMI, SIP, FD, discount, and gratuity figures."
                hi="DocsWala मुफ़्त वेबसाइट है। फोटो छोटा या काटें, PDF जोड़ें या अलग करें, इमेज और PDF बदलें, UPI और दूसरे QR बनाएं, टेक्स्ट ठीक करें, डेवलपर टोकन पढ़ें, और GST, EMI, SIP, FD, छूट और ग्रेच्युटी निकालें।"
              />
            </p>
            <p className={styles.text}>
              <Bi
                en={`There are currently ${allTools.length} public tools. No account is required. The tools do not add watermarks.`}
                hi={`अभी ${allTools.length} सार्वजनिक टूल हैं। अकाउंट नहीं चाहिए। वॉटरमार्क नहीं लगता।`}
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="Who operates it" hi="इसे कौन चलाता है" />
            </h2>
            <p className={styles.text}>
              <Bi
                en={
                  <>
                    DocsWala is operated by the DocsWala Team. There is no public company address
                    or support email on this site. Legal pages: <Link href="/privacy">Privacy</Link>{' '}
                    and <Link href="/terms">Terms</Link>.
                  </>
                }
                hi={
                  <>
                    DocsWala को DocsWala Team चलाती है। इस साइट पर कंपनी का पता या सपोर्ट ईमेल नहीं
                    है। कानूनी पेज: <Link href="/privacy">प्राइवेसी</Link> और{' '}
                    <Link href="/terms">नियम</Link>।
                  </>
                }
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="Who it is for" hi="किसके लिए है" />
            </h2>
            <p className={styles.text}>
              <Bi
                en="Cyber cafes, shop counters, students, and anyone filling online forms who needs passport photos, signature crops, ID PDFs, shop QR codes, or simple tax and loan calculations without signing up."
                hi="साइबर कैफ़े, दुकान का काउंटर, छात्र, और जो ऑनलाइन फॉर्म भरते हैं। पासपोर्ट फोटो, हस्ताक्षर, आईडी PDF, दुकान का QR, या GST और लोन का हिसाब — बिना साइन-अप।"
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="Supported platforms" hi="कहाँ चलता है" />
            </h2>
            <p className={styles.text}>
              <Bi
                en="Any modern desktop or mobile browser on Windows, macOS, Linux, Android, or iOS. Tools are web pages, not installable apps."
                hi="Windows, macOS, Linux, Android या iOS के आधुनिक ब्राउज़र पर। ये वेब पेज हैं, इंस्टॉल होने वाले ऐप नहीं।"
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="Privacy model" hi="प्राइवेसी" />
            </h2>
            <p className={styles.text}>
              <Bi
                en={
                  <>
                    Most interactive tools process files and values in your browser. DocsWala does
                    not ask you to create an account. Files you add in those tool UIs are not stored
                    on DocsWala. The <Link href="/document-translator">AI Document Translator</Link>{' '}
                    uploads the file to the DocsWala server, which sends it to Google Gemini and
                    does not keep a copy after the response. Google&apos;s retention of that content
                    is outside DocsWala&apos;s control. Theme and similar preferences may be saved
                    in your browser&apos;s localStorage. The site loads Google Analytics, which may
                    record page views. See the <Link href="/privacy">privacy page</Link> for
                    details.
                  </>
                }
                hi={
                  <>
                    ज़्यादातर टूल फ़ाइल और वैल्यू आपके ब्राउज़र में प्रोसेस करते हैं। अकाउंट नहीं
                    बनाना पड़ता। उन टूल की फ़ाइल DocsWala पर सेव नहीं होती।{' '}
                    <Link href="/document-translator">AI Document Translator</Link> फ़ाइल DocsWala
                    सर्वर पर भेजता है, सर्वर उसे Google Gemini को भेजता है, और जवाब के बाद कॉपी नहीं
                    रखता। Google उसे रखे या नहीं, यह DocsWala के हाथ में नहीं। थीम जैसी पसंद
                    localStorage में रह सकती है। साइट Google Analytics लोड करती है, जो पेज व्यू
                    दर्ज कर सकता है। विस्तार <Link href="/privacy">प्राइवेसी पेज</Link> पर है।
                  </>
                }
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="Main categories" hi="मुख्य श्रेणियाँ" />
            </h2>
            <ul className={styles.list}>
              {TOOL_CATEGORIES_LIST.map((cat) => {
                const count = getToolsByCategory(cat.id).length;
                return (
                  <li key={cat.id}>
                    <Link href={`/tools?category=${cat.id}`}>
                      <Bi en={cat.label} hi={categoryHindi(cat.id).label} />
                    </Link>
                    {' — '}
                    <Bi en={cat.description} hi={categoryHindi(cat.id).description} />{' '}
                    <Bi en={`(${count} tools)`} hi={`(${count} टूल)`} />
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="How to get started" hi="शुरू कैसे करें" />
            </h2>
            <p className={styles.text}>
              <Bi
                en={
                  <>
                    Open the <Link href="/tools">full tool directory</Link>, read{' '}
                    <Link href="/help">how the tools work</Link>, or jump to a common task such as
                    the <Link href="/image-compressor">image compressor</Link>,{' '}
                    <Link href="/pdf-merger">PDF merger</Link>, or{' '}
                    <Link href="/upi-qr-code-generator">UPI QR generator</Link>.
                  </>
                }
                hi={
                  <>
                    <Link href="/tools">पूरी टूल सूची</Link> खोलें,{' '}
                    <Link href="/help">टूल कैसे चलते हैं</Link> पढ़ें, या सीधे{' '}
                    <Link href="/image-compressor">Image Compressor</Link>,{' '}
                    <Link href="/pdf-merger">PDF Merger</Link>, या{' '}
                    <Link href="/upi-qr-code-generator">UPI QR</Link> पर जाएँ।
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
