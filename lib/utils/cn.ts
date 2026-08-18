import { clsx, type ClassValue } from 'clsx';

/**
 * Clean utility for conditionally combining class names
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
