import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  Scissors,
  Layers,
  QrCode,
  FileUp,
  Store,
  UserCheck,
} from 'lucide-react';
import { Container } from '@/components/layout/Container/Container';
import { ToolCard } from '@/components/tool/ToolCard/ToolCard';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';
import { AdSlot } from '@/components/ads/AdSlot';
import { JsonLd } from '@/components/seo/JsonLd';
import { getPopularTools, getAllTools, getToolsByCategory } from '@/config/tools/registry';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import { siteConfig } from '@/config/site';
import { generateSiteWebApplicationJsonLd } from '@/lib/seo/schema';
import { QuickLaunch } from '@/components/home/QuickLaunch';
import { Bi } from '@/components/i18n/Bi';
import { categoryHindi, SITE_HI, toolHindi } from '@/lib/i18n/catalog';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — Free in-browser photo, PDF, QR & calculator tools`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `${siteConfig.name} — Free in-browser photo, PDF, QR & calculator tools`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${siteConfig.name} — Free in-browser photo, PDF, QR & calculator tools`,
    description: siteConfig.description,
  },
};

export default function HomePage() {
  const popularTools = getPopularTools();
  const allTools = getAllTools();
  const webAppJsonLd = generateSiteWebApplicationJsonLd();

  return (
    <div className={styles.homePage}>
      <JsonLd schema={webAppJsonLd} />
      <Container size="lg">
        <QuickLaunch />
      </Container>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Container size="lg" className={styles.heroContainer}>
          <div className={styles.heroBadgeWrapper}>
            <Badge variant="success" size="md" icon={<Sparkles size={14} />}>
              <Bi en="100% Free • No Sign-up Required" hi="100% मुफ़्त • साइन-अप नहीं" />
            </Badge>
          </div>

          <h1 className={styles.heroTitle}>
            <Bi
              en={
                <>
                  DocsWala: free in-browser tools for{' '}
                  <span className={styles.heroGradientText}>photos, PDFs, QR codes & forms</span>
                </>
              }
              hi={
                <>
                  DocsWala: ब्राउज़र में मुफ़्त टूल —{' '}
                  <span className={styles.heroGradientText}>फोटो, PDF, QR कोड और फॉर्म</span>
                </>
              }
            />
          </h1>

          <p className={styles.heroSubtitle}>
            <Bi en={siteConfig.oneLiner} hi={SITE_HI.oneLiner} />
          </p>

          <div className={styles.heroActions}>
            <Link href="/tools">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                <Bi
                  en={`Explore All ${allTools.length} Tools`}
                  hi={`सभी ${allTools.length} टूल देखें`}
                />
              </Button>
            </Link>
            <Link href="/image-compressor">
              <Button size="lg" variant="secondary">
                <Bi en="Compress Photo for Forms" hi="फॉर्म के लिए फोटो छोटा करें" />
              </Button>
            </Link>
            <Link href="/qr-code-generator">
              <Button size="lg" variant="ghost" leftIcon={<QrCode size={16} />}>
                <Bi en="Create Shop QR Code" hi="दुकान का QR बनाएं" />
              </Button>
            </Link>
          </div>

          <div className={styles.trustBadgesRow}>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} className={styles.trustIcon} />
              <span>
                <Bi en="No Account or Sign-up" hi="अकाउंट या साइन-अप नहीं" />
              </span>
            </div>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} className={styles.trustIcon} />
              <span>
                <Bi en="No Watermarks" hi="वॉटरमार्क नहीं" />
              </span>
            </div>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} className={styles.trustIcon} />
              <span>
                <Bi en="Unlimited Daily Usage" hi="रोज़ जितना चाहें इस्तेमाल" />
              </span>
            </div>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} className={styles.trustIcon} />
              <span>
                <Bi en="100% Private (Runs on Device)" hi="निजी — आपके डिवाइस पर चलता है" />
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Common Tasks Quick-Launch for Cyber Cafes & Form Fillers */}
      <section className={styles.tasksSection}>
        <Container size="lg">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionOverline}>
              <Bi en="Easy Shortcuts" hi="आसान शॉर्टकट" />
            </span>
            <h2 className={styles.sectionTitle}>
              <Bi
                en="Common Tasks for Online Forms & Cyber Cafes"
                hi="ऑनलाइन फॉर्म और साइबर कैफ़े के आम काम"
              />
            </h2>
            <p className={styles.sectionSubtitle}>
              <Bi
                en="One-click access to the most frequent daily tasks for shop counters, CSCs, and students."
                hi="दुकान के काउंटर, CSC और छात्रों के रोज़ के काम एक क्लिक में।"
              />
            </p>
          </div>

          <div className={styles.tasksGrid}>
            {/* Task 1 */}
            <Link href="/compress-image-to-50kb" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <FileCheck2 size={24} />
              </div>
              <h3 className={styles.taskTitle}>
                <Bi en="Photo Under 50KB / 100KB" hi="फोटो 50KB / 100KB से कम" />
              </h3>
              <p className={styles.taskDesc}>
                <Bi
                  en="Shrink photos to fit strict government job, exam, and college admission upload limits."
                  hi="सरकारी नौकरी, परीक्षा और कॉलेज फॉर्म की फोटो सीमा में लाएं।"
                />
              </p>
              <div className={styles.taskBadge}>
                <Bi en="Sarkari & Exam Forms" hi="सरकारी और परीक्षा फॉर्म" />
              </div>
            </Link>

            {/* Task 2 */}
            <Link href="/passport-photo-maker" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <Scissors size={24} />
              </div>
              <h3 className={styles.taskTitle}>
                <Bi en="Passport Photo (35×45mm)" hi="पासपोर्ट फोटो (35×45mm)" />
              </h3>
              <p className={styles.taskDesc}>
                <Bi
                  en="Crop portrait photos to standard 35×45mm and 2×2 inch official dimensions."
                  hi="पोर्ट्रेट को 35×45mm और 2×2 इंच के आधिकारिक साइज़ में काटें।"
                />
              </p>
              <div className={styles.taskBadge}>
                <Bi en="Passport & Visa" hi="पासपोर्ट और वीज़ा" />
              </div>
            </Link>

            {/* Task 3 */}
            <Link href="/signature-cropper" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <Scissors size={24} />
              </div>
              <h3 className={styles.taskTitle}>
                <Bi en="Crop Signature (3:1)" hi="हस्ताक्षर काटें (3:1)" />
              </h3>
              <p className={styles.taskDesc}>
                <Bi
                  en="Extract crisp, clear signatures for SSC, UPSC, and banking portal upload."
                  hi="SSC, UPSC और बैंक फॉर्म के लिए साफ हस्ताक्षर काटें।"
                />
              </p>
              <div className={styles.taskBadge}>
                <Bi en="3:1 Aspect Ratio" hi="3:1 अनुपात" />
              </div>
            </Link>

            {/* Task 4 */}
            <Link href="/upi-qr-code-generator" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <QrCode size={24} />
              </div>
              <h3 className={styles.taskTitle}>
                <Bi en="Shop UPI QR Standee" hi="दुकान का UPI QR स्टैंडी" />
              </h3>
              <p className={styles.taskDesc}>
                <Bi
                  en="Generate printable GPay, PhonePe, Paytm payment QR standees for shop counters."
                  hi="GPay, PhonePe, Paytm का प्रिंट होने वाला भुगतान QR बनाएं।"
                />
              </p>
              <div className={styles.taskBadge}>
                <Bi en="Shop Counters" hi="दुकान का काउंटर" />
              </div>
            </Link>

            {/* Task 5 */}
            <Link href="/pdf-merger" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <Layers size={24} />
              </div>
              <h3 className={styles.taskTitle}>
                <Bi en="Merge IDs & Marksheets" hi="आईडी और मार्कशीट जोड़ें" />
              </h3>
              <p className={styles.taskDesc}>
                <Bi
                  en="Combine Front + Back of Aadhaar/Voter ID or multiple marksheets into a single PDF."
                  hi="आधार या वोटर आईडी के आगे-पीछे, या कई मार्कशीट, एक PDF में जोड़ें।"
                />
              </p>
              <div className={styles.taskBadge}>
                <Bi en="Multi-Page Documents" hi="कई पन्नों के दस्तावेज़" />
              </div>
            </Link>

            {/* Task 6 */}
            <Link href="/image-to-pdf" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <FileUp size={24} />
              </div>
              <h3 className={styles.taskTitle}>
                <Bi en="Photos to Clean PDF" hi="फोटो से साफ PDF" />
              </h3>
              <p className={styles.taskDesc}>
                <Bi
                  en="Convert phone camera photos of certificates and bills into a clean, formatted PDF."
                  hi="सर्टिफिकेट और बिल की फोटो को साफ PDF बनाएं।"
                />
              </p>
              <div className={styles.taskBadge}>
                <Bi en="A4 PDF Maker" hi="A4 PDF मेकर" />
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* AdSense Placement Space (Leaderboard / Responsive Banner) */}
      <Container size="lg">
        <AdSlot format="leaderboard" />
      </Container>

      {/* Popular Tools Grid Section */}
      <section className={styles.popularSection}>
        <Container size="lg">
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionOverline}>
                <Bi en="All Popular Tools" hi="लोकप्रिय टूल" />
              </span>
              <h2 className={styles.sectionTitle}>
                <Bi en="Browse Utilities Catalogue" hi="टूल की सूची देखें" />
              </h2>
            </div>
            <Link href="/tools" className={styles.viewAllLink}>
              <span>
                <Bi
                  en={`View all ${allTools.length} tools`}
                  hi={`सभी ${allTools.length} टूल देखें`}
                />
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.toolsGrid}>
            {popularTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </Container>
      </section>

      {/* Cyber Cafe & Shopkeeper Value Section */}
      <section className={styles.valueSection}>
        <Container size="lg">
          <div className={styles.valueHeader}>
            <span className={styles.sectionOverline}>
              <Bi en="Why People Choose DocsWala" hi="लोग DocsWala क्यों चुनते हैं" />
            </span>
            <h2 className={styles.sectionTitle}>
              <Bi
                en="Built for Cyber Cafes, Shopkeepers & Students"
                hi="साइबर कैफ़े, दुकानदार और छात्रों के लिए"
              />
            </h2>
            <p className={styles.valueSubtitle}>
              <Bi
                en="Unlike other websites that force you to register, add watermarks, or make you pay after 2 files, DocsWala is made for fast everyday work."
                hi="कई साइटें रजिस्टर करवाती हैं, वॉटरमार्क लगाती हैं, या दो फ़ाइल के बाद पैसे माँगती हैं। DocsWala रोज़ के तेज़ काम के लिए है।"
              />
            </p>
          </div>

          <div className={styles.valueGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIconWrapper}>
                <UserCheck size={28} className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>
                <Bi en="Zero Sign-Up Friction" hi="साइन-अप की झंझट नहीं" />
              </h3>
              <p className={styles.valueDesc}>
                <Bi
                  en="Open the website and start working immediately. No emails to enter, no OTPs, and no password setups."
                  hi="साइट खोलें और तुरंत काम शुरू करें। ईमेल, OTP या पासवर्ड नहीं।"
                />
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIconWrapper}>
                <ShieldCheck size={28} className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>
                <Bi en="Safe for Customer Documents" hi="ग्राहक के दस्तावेज़ सुरक्षित" />
              </h3>
              <p className={styles.valueDesc}>
                <Bi
                  en="Customer IDs, marksheets, and personal photos stay on your computer. Nothing is uploaded to any cloud server."
                  hi="ग्राहक की आईडी, मार्कशीट और फोटो आपके कंप्यूटर पर रहती हैं। ये क्लाउड पर नहीं जातीं।"
                />
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIconWrapper}>
                <Zap size={28} className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>
                <Bi en="Lightning Fast Local Speed" hi="कंप्यूटर पर तेज़ काम" />
              </h3>
              <p className={styles.valueDesc}>
                <Bi
                  en="Runs instantly using your computer’s processor. No waiting for slow uploads even on slow shop internet."
                  hi="आपके कंप्यूटर पर तुरंत चलता है। धीमे इंटरनेट पर भी अपलोड का इंतज़ार नहीं।"
                />
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIconWrapper}>
                <Store size={28} className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>
                <Bi en="Always 100% Free" hi="हमेशा 100% मुफ़्त" />
              </h3>
              <p className={styles.valueDesc}>
                <Bi
                  en="Unlimited daily use with zero subscription fees, hidden watermarks, or file lockouts."
                  hi="रोज़ बिना सीमा के इस्तेमाल। सब्सक्रिप्शन, छुपा वॉटरमार्क या फ़ाइल लॉक नहीं।"
                />
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Catalog Showcase */}
      <section className={styles.catalogSection} aria-labelledby="all-tools-heading">
        <Container size="lg">
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionOverline}>
                <Bi en="Full catalog" hi="पूरी सूची" />
              </span>
              <h2 id="all-tools-heading" className={styles.sectionTitle}>
                <Bi
                  en={`All ${allTools.length} DocsWala tools`}
                  hi={`DocsWala के सभी ${allTools.length} टूल`}
                />
              </h2>
              <p className={styles.sectionSubtitle}>
                <Bi
                  en="Every public tool on this site, grouped by category. Each page explains what the tool does, what files it accepts, and how to use it."
                  hi="इस साइट का हर टूल श्रेणी के हिसाब से। हर पेज बताता है कि टूल क्या करता है, कौन सी फ़ाइल लेता है, और कैसे चलाना है।"
                />
              </p>
            </div>
            <Link href="/tools" className={styles.viewAllLink}>
              <span>
                <Bi en="Open the searchable directory" hi="खोज वाली सूची खोलें" />
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.categoriesGrid}>
            {TOOL_CATEGORIES_LIST.map((cat) => (
              <Link key={cat.id} href={`/tools?category=${cat.id}`} className={styles.categoryCard}>
                <div className={styles.catCardContent}>
                  <h3 className={styles.catCardTitle}>
                    <Bi en={cat.label} hi={categoryHindi(cat.id).label} />
                  </h3>
                  <p className={styles.catCardDesc}>
                    <Bi en={cat.description} hi={categoryHindi(cat.id).description} />
                  </p>
                </div>
                <div className={styles.catCardFooter}>
                  <span>
                    <Bi en={`Browse ${cat.label}`} hi={`${categoryHindi(cat.id).label} देखें`} />
                  </span>
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.fullCatalog}>
            {TOOL_CATEGORIES_LIST.map((cat) => {
              const categoryTools = getToolsByCategory(cat.id);
              if (categoryTools.length === 0) return null;
              return (
                <div key={cat.id} className={styles.catalogGroup}>
                  <h3 className={styles.catalogGroupTitle}>
                    <Link href={`/tools?category=${cat.id}`}>
                      <Bi en={cat.label} hi={categoryHindi(cat.id).label} />
                    </Link>
                  </h3>
                  <ul className={styles.catalogList}>
                    {categoryTools.map((tool) => (
                      <li key={tool.slug}>
                        <Link href={`/${tool.slug}`}>{tool.name}</Link>
                        <span>
                          {' — '}
                          <Bi
                            en={tool.shortDescription}
                            hi={toolHindi(tool.slug)?.short ?? tool.shortDescription}
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <nav className={styles.siteLinks} aria-label="About DocsWala">
            <Link href="/about">
              <Bi en="About DocsWala" hi="DocsWala के बारे में" />
            </Link>
            <Link href="/help">
              <Bi en="How the tools work" hi="टूल कैसे चलते हैं" />
            </Link>
            <Link href="/privacy">
              <Bi en="Privacy" hi="प्राइवेसी" />
            </Link>
            <Link href="/terms">
              <Bi en="Terms" hi="नियम" />
            </Link>
          </nav>
        </Container>
      </section>
    </div>
  );
}
