/**
 * Design System Utilities
 * Helper functions for consistent styling across components
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with proper precedence
 * Prevents class conflicts and ensures correct overrides
 * 
 * @example
 * cn('px-4 py-2', 'px-6') // => 'py-2 px-6'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Conditional class names
 * Add classes based on conditions
 * 
 * @example
 * conditional('base-class', {
 *   'active': isActive,
 *   'disabled': isDisabled
 * })
 */
export function conditional(
  baseClasses: string,
  conditionalClasses: Record<string, boolean>
): string {
  const classes = [baseClasses];
  
  Object.entries(conditionalClasses).forEach(([className, condition]) => {
    if (condition) {
      classes.push(className);
    }
  });
  
  return cn(...classes);
}

/**
 * Variant class mapper
 * Map variant names to class strings
 * 
 * @example
 * const buttonVariants = variantClasses({
 *   primary: 'bg-blue-500 text-white',
 *   secondary: 'bg-gray-200 text-gray-900'
 * });
 * buttonVariants('primary') // => 'bg-blue-500 text-white'
 */
export function variantClasses<T extends string>(
  variants: Record<T, string>
) {
  return (variant: T, additionalClasses?: string) => {
    return cn(variants[variant], additionalClasses);
  };
}

/**
 * Focus ring styles
 * Consistent focus indicators for accessibility
 */
export const focusRing = {
  default: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  error: 'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  success: 'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
  none: 'focus:outline-none',
};

/**
 * Transition utilities
 * Pre-configured transitions for common use cases
 */
export const transitions = {
  default: 'transition-all duration-200 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  colors: 'transition-colors duration-200 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out',
};

/**
 * Shadow utilities
 * Pre-configured shadow classes
 */
export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
};

/**
 * Responsive utility
 * Generate responsive class names
 * 
 * @example
 * responsive('text', { base: 'base', sm: 'sm', md: 'lg' })
 * // => 'text-base sm:text-sm md:text-lg'
 */
export function responsive(
  property: string,
  values: {
    base?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }
): string {
  const classes: string[] = [];
  
  if (values.base) classes.push(`${property}-${values.base}`);
  if (values.sm) classes.push(`sm:${property}-${values.sm}`);
  if (values.md) classes.push(`md:${property}-${values.md}`);
  if (values.lg) classes.push(`lg:${property}-${values.lg}`);
  if (values.xl) classes.push(`xl:${property}-${values.xl}`);
  if (values['2xl']) classes.push(`2xl:${property}-${values['2xl']}`);
  
  return classes.join(' ');
}

/**
 * Screen reader only utility
 * Hide visually but keep accessible to screen readers
 */
export const srOnly = 'sr-only';

/**
 * Truncate text utility
 * Truncate text with ellipsis
 */
export const truncate = {
  single: 'truncate',
  multiLine: (lines: number) => `line-clamp-${lines}`,
};

/**
 * Aspect ratio utilities
 */
export const aspectRatio = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[21/9]',
  portrait: 'aspect-[3/4]',
};

/**
 * Grid utilities
 * Common grid layouts
 */
export const grid = {
  responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  auto: 'grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4',
  twoColumn: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  fourColumn: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
};

/**
 * Flex utilities
 * Common flex layouts
 */
export const flex = {
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between',
  start: 'flex items-center justify-start',
  end: 'flex items-center justify-end',
  col: 'flex flex-col',
  colCenter: 'flex flex-col items-center justify-center',
};

/**
 * Container utilities
 * Consistent container widths
 */
export const container = {
  default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  narrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  wide: 'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8',
  full: 'w-full px-4 sm:px-6 lg:px-8',
};

/**
 * Card utilities
 * Pre-configured card styles
 */
export const card = {
  default: 'bg-white rounded-lg border border-gray-200 p-6 shadow-sm',
  hover: 'bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow',
  interactive: 'bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer',
};

/**
 * Input utilities
 * Pre-configured input styles
 */
export const input = {
  base: 'w-full rounded-md border border-gray-200 px-4 py-2.5 text-gray-900 placeholder:text-gray-500',
  default: 'w-full rounded-md border-2 border-gray-200 px-4 h-11 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors',
  error: 'w-full rounded-md border-2 border-red-500 px-4 h-11 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0',
  success: 'w-full rounded-md border-2 border-green-500 px-4 h-11 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0',
};

/**
 * Button utilities
 * Pre-configured button styles
 */
export const button = {
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  outline: 'border-2 border-gray-200 bg-transparent hover:bg-gray-100 active:bg-gray-200',
  ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700',
  
  // Sizes
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-11 px-8 text-lg',
  icon: 'h-10 w-10 p-0',
};

/**
 * Badge utilities
 * Pre-configured badge styles
 */
export const badge = {
  base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  primary: 'bg-blue-100 text-blue-700',
  secondary: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-sky-100 text-sky-700',
};

/**
 * Typography utilities
 * Pre-configured text styles
 */
export const typography = {
  h1: 'text-5xl font-bold text-gray-900 leading-tight',
  h2: 'text-3xl font-bold text-gray-900 leading-tight',
  h3: 'text-2xl font-semibold text-gray-900 leading-tight',
  h4: 'text-xl font-semibold text-gray-900 leading-tight',
  h5: 'text-lg font-semibold text-gray-900 leading-tight',
  h6: 'text-base font-semibold text-gray-900 leading-tight',
  body: 'text-base text-gray-600 leading-normal',
  bodyLarge: 'text-lg text-gray-600 leading-relaxed',
  bodySmall: 'text-sm text-gray-600 leading-normal',
  caption: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700',
};

/**
 * Link utilities
 * Pre-configured link styles
 */
export const link = {
  default: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors',
  subtle: 'text-gray-600 hover:text-gray-900 transition-colors',
  nav: 'text-gray-700 hover:text-blue-600 transition-colors',
};

/**
 * Loading state utilities
 */
export const loading = {
  spinner: 'animate-spin',
  pulse: 'animate-pulse',
  shimmer: 'animate-shimmer',
};

/**
 * Accessibility utilities
 * ARIA and a11y helpers
 */
export const a11y = {
  visuallyHidden: 'sr-only',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600',
};

/**
 * Export all utilities as a single object
 */
export const ds = {
  cn,
  conditional,
  variantClasses,
  focusRing,
  transitions,
  shadows,
  responsive,
  srOnly,
  truncate,
  aspectRatio,
  grid,
  flex,
  container,
  card,
  input,
  button,
  badge,
  typography,
  link,
  loading,
  a11y,
} as const;

export default ds;
