import React from 'react';
import Link from 'next/link';
import { Box, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Container } from '../Container/Container';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <Container size="lg">
        {/* Privacy & Trust Banner */}
        <div className={styles.privacyBanner}>
          <div className={styles.privacyIconWrapper}>
            <ShieldCheck size={28} className={styles.privacyIcon} />
          </div>
          <div className={styles.privacyContent}>
            <h4 className={styles.privacyTitle}>
              100% Free Forever • No Sign-Up • Customer Files Stay Safe
            </h4>
            <p className={styles.privacyDesc}>
              Unlike other file conversion websites that upload confidential Aadhaar cards,
              marksheets, and signatures to remote cloud servers,
              <strong> DocsWala processes everything directly inside your browser</strong>. Your
              customer documents never leave your computer.
            </p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className={styles.footerGrid}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIconWrapper}>
                <Box size={20} />
              </div>
              <span className={styles.brandName}>
                Docs<span className={styles.brandAccent}>Wala</span>
              </span>
            </Link>
            <p className={styles.brandTagline}>
              Free, Fast in-browser file tools built for cyber cafes, small shops, students, and
              daily online form filling.
            </p>
            <div className={styles.badgePill}>
              <Sparkles size={13} className={styles.dot} />
              <span>100% Free • No Sign-up • No Limits</span>
            </div>
          </div>

          {/* Categories Column */}
          <div className={styles.linksCol}>
            <h5 className={styles.colTitle}>Categories</h5>
            <ul className={styles.linksList}>
              {TOOL_CATEGORIES_LIST.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/tools?category=${cat.id}`} className={styles.footerLink}>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools Column */}
          <div className={styles.linksCol}>
            <h5 className={styles.colTitle}>Popular Tools</h5>
            <ul className={styles.linksList}>
              <li>
                <Link href="/image-compressor" className={styles.footerLink}>
                  Photo Compressor (Under 50KB)
                </Link>
              </li>
              <li>
                <Link href="/image-cropper" className={styles.footerLink}>
                  Passport Photo & Sign Cropper
                </Link>
              </li>
              <li>
                <Link href="/pdf-merger" className={styles.footerLink}>
                  Merge Marksheets & IDs
                </Link>
              </li>
              <li>
                <Link href="/qr-code-generator" className={styles.footerLink}>
                  Shop UPI & WhatsApp QR Maker
                </Link>
              </li>
              <li>
                <Link href="/pdf-compressor" className={styles.footerLink}>
                  PDF Compressor (Under 200KB)
                </Link>
              </li>
              <li>
                <Link href="/image-to-pdf" className={styles.footerLink}>
                  Photos to Clean PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Column */}
          <div className={styles.linksCol}>
            <h5 className={styles.colTitle}>Trust & About</h5>
            <ul className={styles.linksList}>
              <li>
                <Link href="/about" className={styles.footerLink}>
                  About DocsWala
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.footerLink}>
                  Privacy Guarantee
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.footerLink}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} DocsWala. 100% Free & Private. No sign-up required.
          </p>
          <div className={styles.madeWith}>
            <span>Crafted for cyber cafes & everyday work</span>
            <Heart size={14} className={styles.heartIcon} />
          </div>
        </div>
      </Container>
    </footer>
  );
};
