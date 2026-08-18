import { atom } from 'jotai';
import { ManagedFile, FileValidationError } from '@/types/file';

/**
 * Shared atom for currently managed files across a tool workflow
 */
export const managedFilesAtom = atom<ManagedFile[]>([]);

/**
 * Shared atom for file validation error notifications
 */
export const fileErrorsAtom = atom<FileValidationError[]>([]);

/**
 * Atom for tracking batch processing state
 */
export const isProcessingAtom = atom<boolean>(false);

/**
 * Atom for tracking total progress percentage
 */
export const totalProgressAtom = atom<number>(0);
