'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

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
    <header className={styles.header}>
      <Container size="lg" className={styles.container}>
        {/* Brand Logo */}
        <Link href="/" className={styles.logo} onClick={() => setMobileMenuOpen(false)}>
          <div className={styles.logoIconWrapper}>
            <Box size={22} className={styles.logoIcon} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.brandName}>
              Utility<span className={styles.brandAccent}>Box</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main Navigation">
          <Link
            href="/"
            className={cn(styles.navLink, isActive('/') && pathname === '/' && styles.active)}
          >
            Home
          </Link>

          <Link href="/tools" className={cn(styles.navLink, isActive('/tools') && styles.active)}>
            All Tools
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
            >
              <span>Categories</span>
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
                      <span className={styles.itemTitle}>{cat.label}</span>
                      <span className={styles.itemDesc}>{cat.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/about" className={cn(styles.navLink, isActive('/about') && styles.active)}>
            About
          </Link>
        </nav>

        {/* Right Actions */}
        <div className={styles.rightActions}>
          <div className={styles.privacyBadge}>
            <Badge variant="success" size="sm" icon={<Sparkles size={13} />}>
              100% Free • No Sign-up
            </Badge>
          </div>

          <Link href="/tools" className={styles.searchButton} aria-label="Search tools">
            <Search size={16} />
            <span className={styles.searchLabel}>Search tools...</span>
            <kbd className={styles.searchKbd}>⌘K</kbd>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
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
            <Link
              href="/"
              className={cn(styles.mobileNavLink, pathname === '/' && styles.active)}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/tools"
              className={cn(styles.mobileNavLink, isActive('/tools') && styles.active)}
              onClick={() => setMobileMenuOpen(false)}
            >
              All Tools
            </Link>

            <div className={styles.mobileCategorySection}>
              <span className={styles.mobileCategoryTitle}>Categories</span>
              <div className={styles.mobileCategoryGrid}>
                {TOOL_CATEGORIES_LIST.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tools?category=${cat.id}`}
                    className={styles.mobileCategoryItem}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className={styles.itemIcon}>{getCategoryIcon(cat.id)}</span>
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/about"
              className={cn(styles.mobileNavLink, isActive('/about') && styles.active)}
              onClick={() => setMobileMenuOpen(false)}
            >
              About & Privacy Guarantee
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
