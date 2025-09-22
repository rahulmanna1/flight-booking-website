// Design System Tokens for FlightBooker
// Ensures consistency across all components

export const designTokens = {
  // Color Palette
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main brand blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
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
      900: '#0f172a'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    }
  },

  // Spacing Scale
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    '4xl': '2.5rem',  // 40px
    '5xl': '3rem',    // 48px
    '6xl': '4rem'     // 64px
  },

  // Border Radius
  radius: {
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Typography Scale
  typography: {
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem'      // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '2rem',      // 32px
        md: '2.5rem',    // 40px
        lg: '3rem'       // 48px
      },
      padding: {
        sm: '0.5rem 0.75rem',    // 8px 12px
        md: '0.75rem 1rem',      // 12px 16px
        lg: '1rem 1.5rem'        // 16px 24px
      }
    },
    input: {
      height: {
        sm: '2rem',      // 32px
        md: '2.75rem',   // 44px
        lg: '3rem'       // 48px
      }
    },
    card: {
      padding: {
        sm: '1rem',      // 16px
        md: '1.5rem',    // 24px
        lg: '2rem'       // 32px
      }
    }
  },

  // Animation / Transitions
  animation: {
    transition: {
      fast: '150ms ease-in-out',
      normal: '200ms ease-in-out',
      slow: '300ms ease-in-out'
    }
  }
};

// Helper functions for consistent usage
export const getColor = (color: string, shade: number = 500) => {
  const [colorName] = color.split('-');
  return designTokens.colors[colorName as keyof typeof designTokens.colors]?.[shade as keyof typeof designTokens.colors.primary] || color;
};

export const getSpacing = (size: keyof typeof designTokens.spacing) => {
  return designTokens.spacing[size];
};

export const getRadius = (size: keyof typeof designTokens.radius) => {
  return designTokens.radius[size];
};

// CSS Variables for runtime usage
export const cssVariables = `
  :root {
    --color-primary-50: ${designTokens.colors.primary[50]};
    --color-primary-500: ${designTokens.colors.primary[500]};
    --color-primary-600: ${designTokens.colors.primary[600]};
    --color-primary-700: ${designTokens.colors.primary[700]};
    
    --spacing-sm: ${designTokens.spacing.sm};
    --spacing-md: ${designTokens.spacing.md};
    --spacing-lg: ${designTokens.spacing.lg};
    --spacing-xl: ${designTokens.spacing.xl};
    
    --radius-md: ${designTokens.radius.md};
    --radius-lg: ${designTokens.radius.lg};
    --radius-xl: ${designTokens.radius.xl};
    
    --shadow-sm: ${designTokens.shadows.sm};
    --shadow-md: ${designTokens.shadows.md};
    --shadow-lg: ${designTokens.shadows.lg};
    
    --transition-normal: ${designTokens.animation.transition.normal};
  }
`;