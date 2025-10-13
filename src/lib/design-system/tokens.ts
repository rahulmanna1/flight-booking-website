/**
 * Design System Tokens
 * Production-ready design tokens for FlightBooker
 * Version: 1.0.0
 * 
 * Usage:
 * import { tokens } from '@/lib/design-system/tokens';
 * className={`bg-${tokens.colors.primary[500]}`}
 */

export const tokens = {
  /**
   * COLOR SYSTEM
   * Based on Tailwind's color palette with custom brand colors
   */
  colors: {
    // Primary Brand Color (Blue)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Main brand color
      600: '#2563eb',  // Hover state
      700: '#1d4ed8',  // Active/pressed state
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary/Neutral Grays
    gray: {
      50: '#f9fafb',   // Page backgrounds
      100: '#f3f4f6',  // Card backgrounds
      200: '#e5e7eb',  // Borders
      300: '#d1d5db',  // Dividers
      400: '#9ca3af',  // Disabled text
      500: '#6b7280',  // Secondary text
      600: '#4b5563',  // Body text
      700: '#374151',  // Headings
      800: '#1f2937',  // Dark headings
      900: '#111827',  // Primary text
    },
    
    // Success States (Green)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      500: '#22c55e',  // Success buttons
      600: '#16a34a',  // Success hover
      700: '#15803d',
    },
    
    // Error States (Red)
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      500: '#ef4444',  // Error text/buttons
      600: '#dc2626',  // Error hover
      700: '#b91c1c',
    },
    
    // Warning States (Amber)
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      500: '#f59e0b',  // Warning indicators
      600: '#d97706',  // Warning hover
      700: '#b45309',
    },
    
    // Info States (Sky Blue)
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      500: '#0ea5e9',  // Info indicators
      600: '#0284c7',
      700: '#0369a1',
    },
    
    // Semantic Colors
    semantic: {
      background: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6',
      },
      text: {
        primary: '#111827',
        secondary: '#4b5563',
        tertiary: '#6b7280',
        inverse: '#ffffff',
        disabled: '#9ca3af',
      },
      border: {
        default: '#e5e7eb',
        hover: '#d1d5db',
        focus: '#3b82f6',
      },
    },
  },

  /**
   * SPACING SYSTEM
   * Based on 8px grid system for consistency
   * Use rem units for accessibility (respects user font size preferences)
   */
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px  - xs
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px - sm
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px - md
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px - lg
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px - xl
    16: '4rem',     // 64px - 2xl
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    
    // Semantic spacing
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    '2xl': '4rem',  // 64px
    '3xl': '6rem',  // 96px
  },

  /**
   * TYPOGRAPHY SYSTEM
   * Responsive font sizes with proper line heights
   */
  typography: {
    // Font Families
    fontFamily: {
      sans: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
      mono: 'var(--font-geist-mono), ui-monospace, monospace',
    },
    
    // Font Sizes (with responsive scaling)
    fontSize: {
      xs: {
        size: '0.75rem',    // 12px
        lineHeight: '1rem', // 16px
      },
      sm: {
        size: '0.875rem',   // 14px
        lineHeight: '1.25rem', // 20px
      },
      base: {
        size: '1rem',       // 16px
        lineHeight: '1.5rem', // 24px
      },
      lg: {
        size: '1.125rem',   // 18px
        lineHeight: '1.75rem', // 28px
      },
      xl: {
        size: '1.25rem',    // 20px
        lineHeight: '1.75rem', // 28px
      },
      '2xl': {
        size: '1.5rem',     // 24px
        lineHeight: '2rem', // 32px
      },
      '3xl': {
        size: '1.875rem',   // 30px
        lineHeight: '2.25rem', // 36px
      },
      '4xl': {
        size: '2.25rem',    // 36px
        lineHeight: '2.5rem', // 40px
      },
      '5xl': {
        size: '3rem',       // 48px
        lineHeight: '1',    // Tight for hero text
      },
      '6xl': {
        size: '3.75rem',    // 60px
        lineHeight: '1',
      },
    },
    
    // Font Weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Line Heights
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    
    // Letter Spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  /**
   * BORDER RADIUS SYSTEM
   * Consistent rounding for all components
   */
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px - Subtle
    md: '0.5rem',    // 8px - Default
    lg: '0.75rem',   // 12px - Cards
    xl: '1rem',      // 16px - Modals
    '2xl': '1.5rem', // 24px - Large containers
    '3xl': '2rem',   // 32px - Extra large
    full: '9999px',  // Pills, circles
  },

  /**
   * SHADOW SYSTEM
   * Elevation hierarchy for depth perception
   */
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    
    // Semantic shadows
    card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    cardHover: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    modal: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },

  /**
   * ANIMATION / TRANSITION SYSTEM
   * Consistent timing and easing for all animations
   */
  animation: {
    // Timing Functions
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // Duration
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    
    // Common transitions
    transition: {
      fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      colors: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  /**
   * COMPONENT-SPECIFIC TOKENS
   * Standardized sizes for common components
   */
  components: {
    // Button Sizes
    button: {
      height: {
        sm: '2rem',      // 32px - Compact UI
        md: '2.5rem',    // 40px - Standard
        lg: '3rem',      // 48px - Prominent
        xl: '3.5rem',    // 56px - Hero sections
      },
      padding: {
        sm: '0.5rem 0.75rem',   // 8px 12px
        md: '0.625rem 1rem',    // 10px 16px
        lg: '0.75rem 2rem',     // 12px 32px
        xl: '1rem 2.5rem',      // 16px 40px
      },
      fontSize: {
        sm: '0.875rem',  // 14px
        md: '1rem',      // 16px
        lg: '1.125rem',  // 18px
        xl: '1.25rem',   // 20px
      },
    },
    
    // Input Sizes
    input: {
      height: {
        sm: '2rem',      // 32px
        md: '2.75rem',   // 44px - Mobile touch target
        lg: '3rem',      // 48px
      },
      padding: {
        sm: '0.5rem 0.75rem',
        md: '0.75rem 1rem',
        lg: '1rem 1.25rem',
      },
      fontSize: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
      },
    },
    
    // Card Sizes
    card: {
      padding: {
        sm: '1rem',      // 16px
        md: '1.5rem',    // 24px - Standard
        lg: '2rem',      // 32px
        xl: '3rem',      // 48px
      },
      gap: {
        sm: '0.75rem',   // 12px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
      },
    },
    
    // Icon Sizes
    icon: {
      xs: '1rem',      // 16px - Inline with text
      sm: '1.25rem',   // 20px - Small buttons
      md: '1.5rem',    // 24px - Default UI
      lg: '2rem',      // 32px - Prominent
      xl: '3rem',      // 48px - Hero sections
      '2xl': '4rem',   // 64px - Large features
    },
    
    // Avatar Sizes
    avatar: {
      xs: '1.5rem',    // 24px
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px
      lg: '3rem',      // 48px
      xl: '4rem',      // 64px
    },
  },

  /**
   * BREAKPOINTS
   * Responsive design breakpoints
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * Z-INDEX SCALE
   * Consistent layering system
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  },
} as const;

/**
 * TYPE-SAFE COLOR GETTER
 * Get color value with TypeScript autocomplete
 */
export const getColor = (
  category: keyof typeof tokens.colors,
  shade?: keyof typeof tokens.colors.primary
): string => {
  const colorCategory = tokens.colors[category];
  
  if (!shade) {
    return (colorCategory as any)[500] || '#000000';
  }
  
  return (colorCategory as any)[shade] || '#000000';
};

/**
 * TYPE-SAFE SPACING GETTER
 */
export const getSpacing = (size: keyof typeof tokens.spacing): string => {
  return tokens.spacing[size];
};

/**
 * TYPE-SAFE RADIUS GETTER
 */
export const getRadius = (size: keyof typeof tokens.radius): string => {
  return tokens.radius[size];
};

/**
 * TYPE-SAFE SHADOW GETTER
 */
export const getShadow = (size: keyof typeof tokens.shadows): string => {
  return tokens.shadows[size];
};

/**
 * CSS VARIABLES
 * Generate CSS custom properties for runtime theming
 */
export const generateCSSVariables = (): string => {
  return `
    :root {
      /* Colors */
      --color-primary-50: ${tokens.colors.primary[50]};
      --color-primary-100: ${tokens.colors.primary[100]};
      --color-primary-500: ${tokens.colors.primary[500]};
      --color-primary-600: ${tokens.colors.primary[600]};
      --color-primary-700: ${tokens.colors.primary[700]};
      
      --color-gray-50: ${tokens.colors.gray[50]};
      --color-gray-100: ${tokens.colors.gray[100]};
      --color-gray-200: ${tokens.colors.gray[200]};
      --color-gray-600: ${tokens.colors.gray[600]};
      --color-gray-700: ${tokens.colors.gray[700]};
      --color-gray-900: ${tokens.colors.gray[900]};
      
      --color-success-500: ${tokens.colors.success[500]};
      --color-error-500: ${tokens.colors.error[500]};
      --color-warning-500: ${tokens.colors.warning[500]};
      
      /* Spacing */
      --spacing-xs: ${tokens.spacing.xs};
      --spacing-sm: ${tokens.spacing.sm};
      --spacing-md: ${tokens.spacing.md};
      --spacing-lg: ${tokens.spacing.lg};
      --spacing-xl: ${tokens.spacing.xl};
      
      /* Radius */
      --radius-sm: ${tokens.radius.sm};
      --radius-md: ${tokens.radius.md};
      --radius-lg: ${tokens.radius.lg};
      --radius-xl: ${tokens.radius.xl};
      
      /* Shadows */
      --shadow-sm: ${tokens.shadows.sm};
      --shadow-md: ${tokens.shadows.md};
      --shadow-lg: ${tokens.shadows.lg};
      --shadow-xl: ${tokens.shadows.xl};
      
      /* Transitions */
      --transition-fast: ${tokens.animation.transition.fast};
      --transition-normal: ${tokens.animation.transition.normal};
      --transition-slow: ${tokens.animation.transition.slow};
    }
  `;
};

/**
 * EXPORT DEFAULT
 */
export default tokens;
