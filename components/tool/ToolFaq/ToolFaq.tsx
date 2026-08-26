import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FaqItem } from '@/lib/seo/schema';
import styles from './ToolFaq.module.scss';

export interface ToolFaqProps {
  toolName: string;
  faqs: FaqItem[];
}

export const ToolFaq: React.FC<ToolFaqProps> = ({ toolName, faqs }) => {
  return (
    <section className={styles.faqSection} aria-labelledby="faq-heading">

      <div className={styles.faqHeader}>
        <div className={styles.faqIconWrapper}>
          <HelpCircle size={24} />
        </div>
        <h2 id="faq-heading" className={styles.faqTitle}>
          Frequently Asked Questions about {toolName}
        </h2>
        <p className={styles.faqSubtitle}>
          Everything you need to know about privacy, performance, and supported formats.
        </p>
      </div>

      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <details key={index} className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              <span>{faq.question}</span>
              <ChevronDown size={18} className={styles.chevron} />
            </summary>
            <div className={styles.faqAnswer}>
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};
