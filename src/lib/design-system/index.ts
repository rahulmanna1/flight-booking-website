/**
 * Design System - Main Export
 * Centralized access to all design system tokens and utilities
 * 
 * Usage:
 * import { tokens, cn, button } from '@/lib/design-system';
 */

// Export tokens
export { tokens, getColor, getSpacing, getRadius, getShadow, generateCSSVariables } from './tokens';
export { default as designTokens } from './tokens';

// Export utilities
export {
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
  ds,
} from './utils';

// Type exports for TypeScript
export type { ClassValue } from 'clsx';
