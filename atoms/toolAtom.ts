import { atom } from 'jotai';
import { ToolCategoryId } from '@/types/tool';

/**
 * Filter atom for the tools directory page
 */
export const selectedCategoryAtom = atom<ToolCategoryId | 'all'>('all');

/**
 * Search query atom for the global and directory search
 */
export const searchQueryAtom = atom<string>('');

/**
 * Quick search modal open/close atom
 */
export const isSearchModalOpenAtom = atom<boolean>(false);
