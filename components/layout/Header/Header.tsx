'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Search,
  Menu,
  X,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Container } from '../Container/Container';
import { Badge } from '@/components/common/Badge/Badge';
import { ThemeToggle } from '@/components/common/ThemeToggle/ThemeToggle';
import { LanguageSwitch } from '@/components/i18n/LanguageSwitch';
import { Bi } from '@/components/i18n/Bi';
import { useWebsiteLanguage } from '@/components/i18n/WebsiteLanguageProvider';
import { categoryHindi } from '@/lib/i18n/catalog';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useWebsiteLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const triggerSearchFocus = React.useCallback(() => {
    setMobileMenuOpen(false);
    if (pathname === '/tools') {
      window.dispatchEvent(new Event('focus-search-input'));
    } else {
      router.push('/tools?focus=true');
    }
  }, [pathname, router]);

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerSearchFocus();
  };

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        triggerSearchFocus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSearchFocus]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'image':
        return <ImageIcon size={16} />;
      case 'pdf':
        return <FileText size={16} />;
      case 'converters':
        return <RefreshCw size={16} />;
      default:
        return <Sparkles size={16} />;
    }
  };

  return (
    <header className={cn(styles.header, mobileMenuOpen && styles.headerMobileOpen)}>
      <Container size="lg" className={styles.container}>
        {/* Brand Logo */}
        <Link href="/" className={styles.logo} onClick={() => setMobileMenuOpen(false)}>
          <div className={styles.logoIconWrapper}>
            <Box size={22} className={styles.logoIcon} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.brandName}>
              Docs<span className={styles.brandAccent}>Wala</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main Navigation">
          <Link
            href="/"
            className={cn(styles.navLink, isActive('/') && pathname === '/' && styles.active)}
          >
            <Bi en="Home" hi="होम" />
          </Link>

          <Link href="/tools" className={cn(styles.navLink, isActive('/tools') && styles.active)}>
            <Bi en="All Tools" hi="सभी टूल" />
          </Link>

          {/* Categories Dropdown */}
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => setCategoriesDropdownOpen(true)}
            onMouseLeave={() => setCategoriesDropdownOpen(false)}
          >
            <button
              type="button"
              className={styles.dropdownButton}
              aria-expanded={categoriesDropdownOpen}
              onClick={() => setCategoriesDropdownOpen((prev) => !prev)}
            >
              <span>
                <Bi en="Categories" hi="श्रेणियाँ" />
              </span>
              <ChevronDown
                size={14}
                className={cn(styles.chevron, categoriesDropdownOpen && styles.chevronRotated)}
              />
            </button>

            {categoriesDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {TOOL_CATEGORIES_LIST.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tools?category=${cat.id}`}
                    className={styles.dropdownItem}
                    onClick={() => setCategoriesDropdownOpen(false)}
                  >
                    <span className={styles.itemIcon}>{getCategoryIcon(cat.id)}</span>
                    <div className={styles.itemContent}>
                      <span className={styles.itemTitle}>
                        <Bi en={cat.label} hi={categoryHindi(cat.id).label} />
                      </span>
                      <span className={styles.itemDesc}>
                        <Bi en={cat.description} hi={categoryHindi(cat.id).description} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/about" className={cn(styles.navLink, isActive('/about') && styles.active)}>
            <Bi en="About" hi="हमारे बारे में" />
          </Link>

          <Link href="/help" className={cn(styles.navLink, isActive('/help') && styles.active)}>
            <Bi en="Help" hi="मदद" />
          </Link>
        </nav>

        {/* Right Actions */}
        <div className={styles.rightActions}>
          <div className={styles.privacyBadge}>
            <Badge variant="success" size="sm" icon={<Sparkles size={13} />}>
              <Bi en="100% Free • No Sign-up" hi="100% मुफ़्त • साइन-अप नहीं" />
            </Badge>
          </div>

          <button
            type="button"
            className={styles.searchButton}
            onClick={handleSearchClick}
            aria-label={language === 'hi' ? 'टूल खोजें' : 'Search tools'}
          >
            <Search size={16} />
            <span className={styles.searchLabel}>
              <Bi en="Search tools..." hi="टूल खोजें..." />
            </span>
            <kbd className={styles.searchKbd}>⌘K</kbd>
          </button>

          <div className={styles.desktopLang}>
            <LanguageSwitch />
          </div>
          <ThemeToggle />

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={
              language === 'hi'
                ? mobileMenuOpen
                  ? 'मेनू बंद करें'
                  : 'मेनू खोलें'
                : mobileMenuOpen
                  ? 'Close Menu'
                  : 'Open Menu'
            }
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNav}>
            <div className={styles.mobileThemeWrapper}>
              <LanguageSwitch />
              <ThemeToggle variant="row" />
            </div>

            <Link
              href="/"
              className={cn(styles.mobileNavLink, pathname === '/' && styles.active)}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Bi en="Home" hi="होम" />
            </Link>
            <Link
              href="/tools"
              className={cn(styles.mobileNavLink, isActive('/tools') && styles.active)}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Bi en="All Tools" hi="सभी टूल" />
            </Link>

            <div className={styles.mobileCategorySection}>
              <span className={styles.mobileCategoryTitle}>
                <Bi en="Categories" hi="श्रेणियाँ" />
              </span>
              <div className={styles.mobileCategoryGrid}>
                {TOOL_CATEGORIES_LIST.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tools?category=${cat.id}`}
                    className={styles.mobileCategoryItem}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className={styles.itemIcon}>{getCategoryIcon(cat.id)}</span>
                    <span>
                      <Bi en={cat.label} hi={categoryHindi(cat.id).label} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/about"
              className={cn(styles.mobileNavLink, isActive('/about') && styles.active)}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Bi en="About DocsWala" hi="DocsWala के बारे में" />
            </Link>
            <Link
              href="/help"
              className={cn(styles.mobileNavLink, isActive('/help') && styles.active)}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Bi en="Help" hi="मदद" />
            </Link>
            <Link
              href="/privacy"
              className={cn(styles.mobileNavLink, isActive('/privacy') && styles.active)}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Bi en="Privacy" hi="प्राइवेसी" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
