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
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Container size="lg" className={styles.heroContainer}>
          <div className={styles.heroBadgeWrapper}>
            <Badge variant="success" size="md" icon={<Sparkles size={14} />}>
              100% Free • No Sign-up Required
            </Badge>
          </div>

          <h1 className={styles.heroTitle}>
            DocsWala: free in-browser tools for{' '}
            <span className={styles.heroGradientText}>photos, PDFs, QR codes & forms</span>
          </h1>

          <p className={styles.heroSubtitle}>{siteConfig.oneLiner}</p>

          <div className={styles.heroActions}>
            <Link href="/tools">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                Explore All {allTools.length} Tools
              </Button>
            </Link>
            <Link href="/image-compressor">
              <Button size="lg" variant="secondary">
                Compress Photo for Forms
              </Button>
            </Link>
            <Link href="/qr-code-generator">
              <Button size="lg" variant="ghost" leftIcon={<QrCode size={16} />}>
                Create Shop QR Code
              </Button>
            </Link>
          </div>

          {/* Value Highlights Pill Bar */}
          <div className={styles.trustBadgesRow}>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} className={styles.trustIcon} />
              <span>No Account or Sign-up</span>
            </div>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} className={styles.trustIcon} />
              <span>No Watermarks</span>
            </div>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} className={styles.trustIcon} />
              <span>Unlimited Daily Usage</span>
            </div>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} className={styles.trustIcon} />
              <span>100% Private (Runs on Device)</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Common Tasks Quick-Launch for Cyber Cafes & Form Fillers */}
      <section className={styles.tasksSection}>
        <Container size="lg">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionOverline}>Easy Shortcuts</span>
            <h2 className={styles.sectionTitle}>Common Tasks for Online Forms & Cyber Cafes</h2>
            <p className={styles.sectionSubtitle}>
              One-click access to the most frequent daily tasks for shop counters, CSCs, and
              students.
            </p>
          </div>

          <div className={styles.tasksGrid}>
            {/* Task 1 */}
            <Link href="/compress-image-to-50kb" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <FileCheck2 size={24} />
              </div>
              <h3 className={styles.taskTitle}>Photo Under 50KB / 100KB</h3>
              <p className={styles.taskDesc}>
                Shrink photos to fit strict government job, exam, and college admission upload
                limits.
              </p>
              <div className={styles.taskBadge}>Sarkari & Exam Forms</div>
            </Link>

            {/* Task 2 */}
            <Link href="/passport-photo-maker" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <Scissors size={24} />
              </div>
              <h3 className={styles.taskTitle}>Passport Photo (35×45mm)</h3>
              <p className={styles.taskDesc}>
                Crop portrait photos to standard 35×45mm and 2×2 inch official dimensions.
              </p>
              <div className={styles.taskBadge}>Passport & Visa</div>
            </Link>

            {/* Task 3 */}
            <Link href="/signature-cropper" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <Scissors size={24} />
              </div>
              <h3 className={styles.taskTitle}>Crop Signature (3:1)</h3>
              <p className={styles.taskDesc}>
                Extract crisp, clear signatures for SSC, UPSC, and banking portal upload.
              </p>
              <div className={styles.taskBadge}>3:1 Aspect Ratio</div>
            </Link>

            {/* Task 4 */}
            <Link href="/upi-qr-code-generator" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <QrCode size={24} />
              </div>
              <h3 className={styles.taskTitle}>Shop UPI QR Standee</h3>
              <p className={styles.taskDesc}>
                Generate printable GPay, PhonePe, Paytm payment QR standees for shop counters.
              </p>
              <div className={styles.taskBadge}>Shop Counters</div>
            </Link>

            {/* Task 5 */}
            <Link href="/pdf-merger" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <Layers size={24} />
              </div>
              <h3 className={styles.taskTitle}>Merge IDs & Marksheets</h3>
              <p className={styles.taskDesc}>
                Combine Front + Back of Aadhaar/Voter ID or multiple marksheets into a single PDF.
              </p>
              <div className={styles.taskBadge}>Multi-Page Documents</div>
            </Link>

            {/* Task 6 */}
            <Link href="/image-to-pdf" className={styles.taskCard}>
              <div className={styles.taskIconWrapper}>
                <FileUp size={24} />
              </div>
              <h3 className={styles.taskTitle}>Photos to Clean PDF</h3>
              <p className={styles.taskDesc}>
                Convert phone camera photos of certificates and bills into a clean, formatted PDF.
              </p>
              <div className={styles.taskBadge}>A4 PDF Maker</div>
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
              <span className={styles.sectionOverline}>All Popular Tools</span>
              <h2 className={styles.sectionTitle}>Browse Utilities Catalogue</h2>
            </div>
            <Link href="/tools" className={styles.viewAllLink}>
              <span>View all {allTools.length} tools</span>
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
            <span className={styles.sectionOverline}>Why People Choose DocsWala</span>
            <h2 className={styles.sectionTitle}>Built for Cyber Cafes, Shopkeepers & Students</h2>
            <p className={styles.valueSubtitle}>
              Unlike other websites that force you to register, add watermarks, or make you pay
              after 2 files, DocsWala is made for fast everyday work.
            </p>
          </div>

          <div className={styles.valueGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIconWrapper}>
                <UserCheck size={28} className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>Zero Sign-Up Friction</h3>
              <p className={styles.valueDesc}>
                Open the website and start working immediately. No emails to enter, no OTPs, and no
                password setups.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIconWrapper}>
                <ShieldCheck size={28} className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>Safe for Customer Documents</h3>
              <p className={styles.valueDesc}>
                Customer IDs, marksheets, and personal photos stay on your computer. Nothing is
                uploaded to any cloud server.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIconWrapper}>
                <Zap size={28} className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>Lightning Fast Local Speed</h3>
              <p className={styles.valueDesc}>
                Runs instantly using your computer’s processor. No waiting for slow uploads even on
                slow shop internet.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.valueIconWrapper}>
                <Store size={28} className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>Always 100% Free</h3>
              <p className={styles.valueDesc}>
                Unlimited daily use with zero subscription fees, hidden watermarks, or file
                lockouts.
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
              <span className={styles.sectionOverline}>Full catalog</span>
              <h2 id="all-tools-heading" className={styles.sectionTitle}>
                All {allTools.length} DocsWala tools
              </h2>
              <p className={styles.sectionSubtitle}>
                Every public tool on this site, grouped by category. Each page explains what the
                tool does, what files it accepts, and how to use it.
              </p>
            </div>
            <Link href="/tools" className={styles.viewAllLink}>
              <span>Open the searchable directory</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.categoriesGrid}>
            {TOOL_CATEGORIES_LIST.map((cat) => (
              <Link key={cat.id} href={`/tools?category=${cat.id}`} className={styles.categoryCard}>
                <div className={styles.catCardContent}>
                  <h3 className={styles.catCardTitle}>{cat.label}</h3>
                  <p className={styles.catCardDesc}>{cat.description}</p>
                </div>
                <div className={styles.catCardFooter}>
                  <span>Browse {cat.label}</span>
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
                    <Link href={`/tools?category=${cat.id}`}>{cat.label}</Link>
                  </h3>
                  <ul className={styles.catalogList}>
                    {categoryTools.map((tool) => (
                      <li key={tool.slug}>
                        <Link href={`/${tool.slug}`}>{tool.name}</Link>
                        <span> — {tool.shortDescription}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <nav className={styles.siteLinks} aria-label="About DocsWala">
            <Link href="/about">About DocsWala</Link>
            <Link href="/help">How the tools work</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </Container>
      </section>
    </div>
  );
}
