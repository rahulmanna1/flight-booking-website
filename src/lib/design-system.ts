/**
 * Flight Booking Website - Design System Constants
 * 
 * This file contains all design tokens and consistent styling patterns
 * used throughout the application to ensure visual consistency.
 */

// Color Palette
export const colors = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Spacing Scale
export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

// Border Radius
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

// Component Patterns
export const components = {
  // Button styles
  button: {
    primary: {
      base: 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700',
      hover: 'hover:shadow-lg transform hover:scale-105 active:scale-95',
      focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    },
    secondary: {
      base: 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300',
      hover: 'hover:shadow-md transform hover:scale-105 active:scale-95',
      focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    },
    ghost: {
      base: 'bg-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50',
      hover: 'hover:shadow-sm transform hover:scale-105 active:scale-95',
      focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    },
  },
  
  // Card styles
  card: {
    base: 'bg-white border border-gray-200 rounded-xl shadow-sm',
    hover: 'hover:shadow-lg hover:border-blue-300 transform hover:scale-[1.02] hover:-translate-y-1',
    interactive: 'cursor-pointer transition-all duration-300',
    focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  },
  
  // Input styles
  input: {
    base: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    error: 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500',
    disabled: 'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
  },
  
  // Badge styles
  badge: {
    primary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    error: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    secondary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
  },
} as const;

// Animation presets
export const animations = {
  // Transition timing functions
  timing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Duration presets
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  // Common animation classes
  classes: {
    fadeIn: 'animate-fade-in',
    fadeInScale: 'animate-fade-in-scale',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    bounceIn: 'animate-bounce-in',
    hoverLift: 'hover-lift',
    hoverGlow: 'hover-glow',
    buttonPress: 'button-press',
    cardHover: 'card-hover',
    iconSpin: 'icon-spin',
    iconWiggle: 'icon-wiggle',
    iconBounce: 'icon-bounce',
  },
} as const;

// Layout constants
export const layout = {
  // Container widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    modal: 1050,
    tooltip: 1060,
    notification: 1070,
  },
  
  // Grid breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Utility functions for consistent styling
export const utils = {
  // Generate consistent button classes
  buttonClasses: (variant: keyof typeof components.button = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300';
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    return `${baseClasses} ${sizeClasses[size]} ${components.button[variant].base} ${components.button[variant].hover} ${components.button[variant].focus} ${components.button[variant].disabled}`;
  },
  
  // Generate consistent card classes
  cardClasses: (interactive: boolean = false) => {
    return `${components.card.base} ${interactive ? `${components.card.hover} ${components.card.interactive} ${components.card.focus}` : ''}`;
  },
  
  // Generate consistent input classes
  inputClasses: (state: 'default' | 'error' | 'success' = 'default') => {
    const stateClasses = {
      default: components.input.base,
      error: `${components.input.base} ${components.input.error}`,
      success: `${components.input.base} ${components.input.success}`,
    };
    
    return `${stateClasses[state]} ${components.input.focus} ${components.input.disabled} transition-all duration-200`;
  },
  
  // Generate consistent text classes
  textClasses: (variant: 'heading' | 'body' | 'caption' | 'label' = 'body') => {
    const variants = {
      heading: 'text-gray-900 font-semibold',
      body: 'text-gray-700',
      caption: 'text-gray-500 text-sm',
      label: 'text-gray-700 font-medium text-sm',
    };
    
    return variants[variant];
  },
} as const;

// Export default design system
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
  animations,
  layout,
  utils,
} as const;

export default designSystem;