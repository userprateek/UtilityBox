import React from 'react';
import Link from 'next/link';
import { Box, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Container } from '../Container/Container';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import { Bi } from '@/components/i18n/Bi';
import { categoryHindi } from '@/lib/i18n/catalog';
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
              <Bi
                en="100% Free Forever • No Sign-Up • Customer Files Stay Safe"
                hi="हमेशा मुफ़्त • साइन-अप नहीं • ग्राहक की फ़ाइल सुरक्षित"
              />
            </h4>
            <p className={styles.privacyDesc}>
              <Bi
                en="Most DocsWala tools process files in your browser, and those files stay on your computer. Document translation is different: the file is uploaded to the DocsWala server and sent to Google Gemini. DocsWala does not keep that file after the response."
                hi="ज़्यादातर टूल आपके ब्राउज़र में चलते हैं और फ़ाइल आपके कंप्यूटर पर रहती है। दस्तावेज़ अनुवाद अलग है: फ़ाइल DocsWala सर्वर पर जाती है और Google Gemini को भेजी जाती है। जवाब के बाद DocsWala उसे नहीं रखता।"
              />
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
              <Bi
                en="Free tools for photos, PDFs, QR codes, text, developer utilities, and calculators. No sign-up. Browser tools keep files on your device."
                hi="फोटो, PDF, QR, टेक्स्ट, डेवलपर टूल और कैलकुलेटर। साइन-अप नहीं। ब्राउज़र टूल फ़ाइल आपके डिवाइस पर रखते हैं।"
              />
            </p>
            <div className={styles.badgePill}>
              <Sparkles size={13} className={styles.dot} />
              <span>
                <Bi en="100% Free • No Sign-up • No Limits" hi="100% मुफ़्त • साइन-अप नहीं • बिना सीमा" />
              </span>
            </div>
          </div>

          {/* Categories Column */}
          <div className={styles.linksCol}>
            <h5 className={styles.colTitle}>
              <Bi en="Categories" hi="श्रेणियाँ" />
            </h5>
            <ul className={styles.linksList}>
              {TOOL_CATEGORIES_LIST.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/tools?category=${cat.id}`} className={styles.footerLink}>
                    <Bi en={cat.label} hi={categoryHindi(cat.id).label} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools Column */}
          <div className={styles.linksCol}>
            <h5 className={styles.colTitle}>
              <Bi en="Popular Tools" hi="लोकप्रिय टूल" />
            </h5>
            <ul className={styles.linksList}>
              <li>
                <Link href="/image-compressor" className={styles.footerLink}>
                  <Bi en="Photo Compressor (Under 50KB)" hi="फोटो कंप्रेसर (50KB से कम)" />
                </Link>
              </li>
              <li>
                <Link href="/image-cropper" className={styles.footerLink}>
                  <Bi en="Passport Photo & Sign Cropper" hi="पासपोर्ट फोटो और हस्ताक्षर" />
                </Link>
              </li>
              <li>
                <Link href="/pdf-merger" className={styles.footerLink}>
                  <Bi en="Merge Marksheets & IDs" hi="मार्कशीट और आईडी जोड़ें" />
                </Link>
              </li>
              <li>
                <Link href="/qr-code-generator" className={styles.footerLink}>
                  <Bi en="Shop UPI & WhatsApp QR Maker" hi="दुकान UPI और WhatsApp QR" />
                </Link>
              </li>
              <li>
                <Link href="/pdf-splitter" className={styles.footerLink}>
                  <Bi en="Split PDF Pages" hi="PDF के पन्ने अलग करें" />
                </Link>
              </li>
              <li>
                <Link href="/image-to-pdf" className={styles.footerLink}>
                  <Bi en="Photos to Clean PDF" hi="फोटो से साफ PDF" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Column */}
          <div className={styles.linksCol}>
            <h5 className={styles.colTitle}>
              <Bi en="Trust & About" hi="भरोसा और जानकारी" />
            </h5>
            <ul className={styles.linksList}>
              <li>
                <Link href="/about" className={styles.footerLink}>
                  <Bi en="About DocsWala" hi="DocsWala के बारे में" />
                </Link>
              </li>
              <li>
                <Link href="/help" className={styles.footerLink}>
                  <Bi en="How the tools work" hi="टूल कैसे चलते हैं" />
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.footerLink}>
                  <Bi en="Privacy Policy" hi="प्राइवेसी नीति" />
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.footerLink}>
                  <Bi en="Terms of Service" hi="सेवा की शर्तें" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            <Bi
              en={`© ${new Date().getFullYear()} DocsWala. 100% Free & Private. No sign-up required.`}
              hi={`© ${new Date().getFullYear()} DocsWala. 100% मुफ़्त और निजी। साइन-अप नहीं।`}
            />
          </p>
          <div className={styles.madeWith}>
            <span>
              <Bi en="Crafted for cyber cafes & everyday work" hi="साइबर कैफ़े और रोज़ के काम के लिए" />
            </span>
            <Heart size={14} className={styles.heartIcon} />
          </div>
        </div>
      </Container>
    </footer>
  );
};
