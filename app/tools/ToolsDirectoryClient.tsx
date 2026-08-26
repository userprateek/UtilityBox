'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { ToolMetadata, ToolCategoryId } from '@/types/tool';
import { ToolCard } from '@/components/tool/ToolCard/ToolCard';
import { Input } from '@/components/common/Input/Input';
import { EmptyState } from '@/components/common/States/EmptyState';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import { cn } from '@/lib/utils/cn';
import styles from './page.module.scss';

export interface ToolsDirectoryClientProps {
  initialTools: ToolMetadata[];
}

export const ToolsDirectoryClient: React.FC<ToolsDirectoryClientProps> = ({ initialTools }) => {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as ToolCategoryId | null;

  const [selectedCategory, setSelectedCategory] = useState<ToolCategoryId | 'all'>(
    categoryParam || 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchHighlighted, setIsSearchHighlighted] = useState<boolean>(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const focusAndHighlightSearch = React.useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchInputRef.current.focus();
      setIsSearchHighlighted(true);
      setTimeout(() => {
        setIsSearchHighlighted(false);
      }, 2200);
    }
  }, []);

  // Handle URL ?focus=true parameter
  React.useEffect(() => {
    const focusParam = searchParams.get('focus') === 'true';
    if (!focusParam) return;

    const timer = setTimeout(() => {
      focusAndHighlightSearch();
    }, 100);
    return () => clearTimeout(timer);
  }, [searchParams, focusAndHighlightSearch]);

  // Handle custom window focus event triggered from top header search
  React.useEffect(() => {
    const handleCustomFocus = () => {
      focusAndHighlightSearch();
    };

    window.addEventListener('focus-search-input', handleCustomFocus);
    return () => {
      window.removeEventListener('focus-search-input', handleCustomFocus);
    };
  }, [focusAndHighlightSearch]);

  // Sync category state when URL searchParams changes (e.g. from header navigation)
  React.useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('all');
    }
  }, [categoryParam]);

  const filteredTools = useMemo(() => {
    return initialTools.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;

      const normalizedSearch = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !normalizedSearch ||
        tool.name.toLowerCase().includes(normalizedSearch) ||
        tool.shortDescription.toLowerCase().includes(normalizedSearch) ||
        tool.keywords.some((k) => k.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesSearch;
    });
  }, [initialTools, selectedCategory, searchQuery]);

  return (
    <div className={styles.directoryWrapper}>
      {/* Search & Category Filter Controls */}
      <div className={styles.controlsBar}>
        <div
          className={cn(
            styles.searchWrapper,
            isSearchHighlighted && styles.searchWrapperHighlighted
          )}
        >
          <Input
            ref={searchInputRef}
            placeholder="Search all utilities (e.g. compress jpg, merge pdf)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
            className={cn(isSearchHighlighted && styles.inputHighlighted)}
          />
        </div>

        {/* Category Filter Pills */}
        <div className={styles.categoryTabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            className={cn(styles.tabBtn, selectedCategory === 'all' && styles.activeTab)}
            onClick={() => setSelectedCategory('all')}
          >
            All Tools ({initialTools.length})
          </button>

          {TOOL_CATEGORIES_LIST.map((cat) => {
            const count = initialTools.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                className={cn(styles.tabBtn, selectedCategory === cat.id && styles.activeTab)}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Info */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          Showing <strong>{filteredTools.length}</strong>{' '}
          {filteredTools.length === 1 ? 'utility' : 'utilities'}
        </span>
      </div>

      {/* Grid of Tools */}
      {filteredTools.length > 0 ? (
        <div className={styles.toolsGrid}>
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No utilities match your search"
          description={`We couldn't find any tools matching "${searchQuery}". Try a different keyword or category.`}
          action={
            <button
              type="button"
              className={styles.resetSearchBtn}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </button>
          }
        />
      )}
    </div>
  );
};
