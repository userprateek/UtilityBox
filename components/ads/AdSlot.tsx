'use client';

import React, { useEffect, useRef } from 'react';
import styles from './AdSlot.module.scss';

export interface AdSlotProps {
  format?: 'leaderboard' | 'rectangle' | 'banner';
  client?: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  slot?: string; // e.g. "1234567890"
  className?: string;
  showPlaceholder?: boolean;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  format = 'banner',
  client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT,
  className = '',
  showPlaceholder = false,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef<boolean>(false);

  useEffect(() => {
    // If real AdSense client and slot are provided and not yet loaded, push to adsbygoogle
    if (client && slot && !isLoaded.current && typeof window !== 'undefined') {
      try {
        const adsbygoogle =
          (window as unknown as { adsbygoogle: Array<unknown> }).adsbygoogle || [];
        adsbygoogle.push({});
        isLoaded.current = true;
      } catch (e) {
        console.warn('AdSense slot initialization failed:', e);
      }
    }
  }, [client, slot]);

  // If credentials are configured, render live AdSense element
  if (client && slot) {
    return (
      <div ref={adRef} className={`${styles.adContainer} ${styles[format]} ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // If no credentials and placeholder is disabled, render nothing
  if (!showPlaceholder) {
    return null;
  }

  // Fallback Placeholder for Preview/Design
  return (
    <aside
      className={`${styles.adContainer} ${styles[format]} ${styles.placeholder} ${className}`}
      aria-label="Sponsored Space"
    >
      <div className={styles.placeholderContent}>
        <span className={styles.placeholderLabel}>SPONSORED AD SPACE</span>
        <span className={styles.placeholderSub}>Google AdSense Ready ({format})</span>
      </div>
    </aside>
  );
};
