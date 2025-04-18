import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge class names together. Ensures that multiple
 * Tailwind class names will not conflict with each other.
 * @see {@link https://github.com/dcastil/tailwind-merge}
 * @see {@link https://github.com/lukeed/clsx}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
