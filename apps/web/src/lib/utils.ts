import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn/ui canonical `cn` helper — merges classnames with Tailwind-aware
 * dedup so later utility classes win over earlier ones.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
