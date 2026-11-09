import React from 'react';
import Link from 'next/link';
import { ToolMetadata } from '@/types/tool';
import { formatMimeList } from '@/lib/seo/formats';
import { getToolAudience } from '@/lib/seo/schema';
import { TOOL_CATEGORIES } from '@/config/tools/categories';
import { Bi } from '@/components/i18n/Bi';
import { categoryHindi, toolHindi } from '@/lib/i18n/catalog';
import styles from './ToolOverview.module.scss';

export interface ToolOverviewProps {
  tool: ToolMetadata;
}

export function ToolOverview({ tool }: ToolOverviewProps) {
  const category = TOOL_CATEGORIES[tool.category];
  const inputs = formatMimeList(tool.supportedInputFormats as string[]);
  const outputs = formatMimeList(tool.supportedOutputFormats as string[]);
  const takesFiles = Boolean(tool.maxFiles && tool.maxFiles > 0);
  const helpHref = `/${tool.slug}#how-it-works-title`;

  return (
    <section className={styles.overview} aria-labelledby="tool-overview-heading">
      <h2 id="tool-overview-heading" className={styles.heading}>
        <Bi en={`About ${tool.name}`} hi={`${tool.name} के बारे में`} />
      </h2>
      <p className={styles.lead}>
        <Bi en={tool.description} hi={toolHindi(tool.slug)?.description ?? tool.description} />
      </p>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>
            <Bi en="What it does" hi="यह क्या करता है" />
          </dt>
          <dd>
            <Bi en={tool.shortDescription} hi={toolHindi(tool.slug)?.short ?? tool.shortDescription} />
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>
            <Bi en="Who it is for" hi="किसके लिए" />
          </dt>
          <dd>
            <Bi en={getToolAudience(tool.category)} hi={categoryHindi(tool.category).audience} />
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>
            <Bi en="Category" hi="श्रेणी" />
          </dt>
          <dd>
            {category ? (
              <Link href={`/tools?category=${tool.category}`}>
                <Bi en={category.label} hi={categoryHindi(tool.category).label} />
              </Link>
            ) : (
              tool.category
            )}
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>
            <Bi en="Input" hi="इनपुट" />
          </dt>
          <dd>
            {takesFiles ? (
              inputs || <Bi en="Files listed on this page" hi="इस पेज पर लिखी फ़ाइलें" />
            ) : (
              <Bi
                en="Values or text you type on this page (no file upload)"
                hi="इस पेज पर जो संख्या या टेक्स्ट लिखें (फ़ाइल अपलोड नहीं)"
              />
            )}
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>
            <Bi en="Output" hi="आउटपुट" />
          </dt>
          <dd>
            {outputs || (
              <Bi
                en="A download or on-screen result you can copy"
                hi="डाउनलोड, या स्क्रीन पर नतीजा जिसे कॉपी कर सकें"
              />
            )}
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>
            <Bi en="How to use it" hi="कैसे चलाएँ" />
          </dt>
          <dd>
            <Bi
              en={
                <>
                  Follow the <a href={helpHref}>step-by-step guide for {tool.name}</a> further down
                  this page.
                  {takesFiles
                    ? ' Add your files, adjust settings, then process and download.'
                    : ' Fill in the fields, then read or copy the result.'}
                </>
              }
              hi={
                <>
                  नीचे <a href={helpHref}>{tool.name} की स्टेप-बाय-स्टेप गाइड</a> देखें।
                  {takesFiles
                    ? ' फ़ाइल डालें, सेटिंग चुनें, फिर प्रोसेस करके डाउनलोड करें।'
                    : ' फ़ील्ड भरें, फिर नतीजा पढ़ें या कॉपी करें।'}
                </>
              }
            />
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>
            <Bi en="Cost" hi="कीमत" />
          </dt>
          <dd>
            <Bi en="Free. No account. No watermark." hi="मुफ़्त। अकाउंट नहीं। वॉटरमार्क नहीं।" />
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>
            <Bi en="Limits" hi="सीमा" />
          </dt>
          <dd>
            {takesFiles ? (
              <Bi
                en={`Up to ${tool.maxFiles} file${tool.maxFiles === 1 ? '' : 's'} at a time${
                  tool.maxFileSizeMB ? `, ${tool.maxFileSizeMB} MB each` : ''
                }.`}
                hi={`एक बार में ${tool.maxFiles} फ़ाइल${
                  tool.maxFileSizeMB ? `, हर एक ${tool.maxFileSizeMB} MB` : ''
                }।`}
              />
            ) : (
              <Bi
                en="No file-size limit; you enter numbers or text in the form."
                hi="फ़ाइल की सीमा नहीं। फॉर्म में संख्या या टेक्स्ट लिखें।"
              />
            )}
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>
            <Bi en="Privacy" hi="प्राइवेसी" />
          </dt>
          <dd>
            {tool.privacyNotice ? (
              <Bi
                en={tool.privacyNotice}
                hi="यह टूल फ़ाइल DocsWala सर्वर पर भेजता है, और सर्वर उसे Google Gemini को भेजता है। जवाब के बाद DocsWala फ़ाइल नहीं रखता। Google उसे रखे या नहीं, यह Google की नीति पर है।"
              />
            ) : (
              <Bi
                en="This tool runs in your browser. Files you add are processed on your device and are not stored on DocsWala."
                hi="यह टूल आपके ब्राउज़र में चलता है। फ़ाइल आपके डिवाइस पर प्रोसेस होती है और DocsWala उसे सेव नहीं करता।"
              />
            )}
          </dd>
        </div>
        {tool.features && tool.features.length > 0 && (
          <div className={styles.fact}>
            <dt>
              <Bi en="Compared with doing it manually" hi="हाथ से करने की तुलना में" />
            </dt>
            <dd>
              <ul className={styles.featureList}>
                {tool.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
