import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container/Container';
import { siteConfig } from '@/config/site';
import { publicPageMetadata } from '@/lib/seo/pageMetadata';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import { getToolsByCategory } from '@/config/tools/registry';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbJsonLd } from '@/lib/seo/schema';
import { Bi } from '@/components/i18n/Bi';
import { categoryHindi, toolHindi } from '@/lib/i18n/catalog';
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
          <h1 className={styles.title}>
            <Bi en="How DocsWala tools work" hi="DocsWala के टूल कैसे चलते हैं" />
          </h1>
          <p className={styles.subtitle}>
            <Bi
              en="Each tool is a page you open in the browser. File tools ask you to add files, choose settings, then download the result. Calculators and text tools use form fields instead of uploads. Processing stays on your device."
              hi="हर टूल ब्राउज़र का एक पेज है। फ़ाइल वाले टूल में फ़ाइल डालें, सेटिंग चुनें, फिर नतीजा डाउनलोड करें। कैलकुलेटर और टेक्स्ट टूल में फ़ॉर्म भरें। काम आपके डिवाइस पर होता है।"
            />
          </p>
        </div>

        <div className={styles.contentCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="Typical file-tool steps" hi="फ़ाइल वाले टूल के कदम" />
            </h2>
            <ol className={styles.numberedList}>
              <li>
                <Bi
                  en="Open the tool page from the homepage, the directory, or the list below."
                  hi="होम, सूची, या नीचे की लिस्ट से टूल खोलें।"
                />
              </li>
              <li>
                <Bi
                  en="Add files with the file picker or by dropping them onto the page."
                  hi="फ़ाइल चुनें, या पेज पर छोड़ें।"
                />
              </li>
              <li>
                <Bi
                  en="Set quality, size, page range, or other options shown on that tool."
                  hi="क्वालिटी, साइज़, पेज रेंज या जो विकल्प दिखें, उन्हें चुनें।"
                />
              </li>
              <li>
                <Bi
                  en="Process, then download or copy the output."
                  hi="प्रोसेस करें, फिर डाउनलोड या कॉपी करें।"
                />
              </li>
            </ol>
            <p className={styles.text}>
              <Bi
                en="Calculator and QR tools skip the file step: you type values, then generate or copy the result."
                hi="कैलकुलेटर और QR टूल में फ़ाइल नहीं डालनी। वैल्यू लिखें, फिर नतीजा बनाएँ या कॉपी करें।"
              />
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Bi en="Privacy and limits" hi="प्राइवेसी और सीमा" />
            </h2>
            <p className={styles.text}>
              <Bi
                en={
                  <>
                    Tools are free and do not require an account. File tools list their file-count
                    and size limits on each page. DocsWala does not store the files you process in
                    the browser UI. Read the <Link href="/privacy">privacy page</Link> for analytics
                    and localStorage details.
                  </>
                }
                hi={
                  <>
                    टूल मुफ़्त हैं और अकाउंट नहीं माँगते। फ़ाइल की संख्या और साइज़ की सीमा हर पेज
                    पर लिखी है। ब्राउज़र वाले टूल की फ़ाइल DocsWala सेव नहीं करता। Analytics और
                    localStorage की जानकारी <Link href="/privacy">प्राइवेसी पेज</Link> पर है।
                  </>
                }
              />
            </p>
          </section>

          {TOOL_CATEGORIES_LIST.map((cat) => {
            const tools = getToolsByCategory(cat.id);
            if (tools.length === 0) return null;
            return (
              <section key={cat.id} className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Bi en={cat.label} hi={categoryHindi(cat.id).label} />
                </h2>
                <p className={styles.text}>
                  <Bi en={cat.description} hi={categoryHindi(cat.id).description} />
                </p>
                <ul className={styles.list}>
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link href={`/${tool.slug}`}>{tool.name}</Link>
                      {' — '}
                      <Bi
                        en={tool.shortDescription}
                        hi={toolHindi(tool.slug)?.short ?? tool.shortDescription}
                      />{' '}
                      <Link href={`/${tool.slug}#how-it-works-title`}>
                        <Bi en={`How to use ${tool.name}`} hi={`${tool.name} कैसे चलाएँ`} />
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
