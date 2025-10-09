// Environment Variables Security Validator
// Validates required environment variables and prevents exposure of secrets

interface EnvValidationRule {
  key: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url' | 'email';
  minLength?: number;
  pattern?: RegExp;
  description: string;
  category: 'api' | 'auth' | 'database' | 'payment' | 'email' | 'monitoring' | 'feature';
}

const ENV_VALIDATION_RULES: EnvValidationRule[] = [
  // API Keys
  {
    key: 'AMADEUS_CLIENT_ID',
    required: false, // Optional for demo mode
    type: 'string',
    minLength: 10,
    description: 'Amadeus API Client ID',
    category: 'api'
  },
  {
    key: 'AMADEUS_CLIENT_SECRET',
    required: false,
    type: 'string',
    minLength: 20,
    description: 'Amadeus API Client Secret',
    category: 'api'
  },
  {
    key: 'AMADEUS_ENVIRONMENT',
    required: false,
    type: 'string',
    pattern: /^(test|production)$/,
    description: 'Amadeus API Environment',
    category: 'api'
  },
  
  // Authentication
  {
    key: 'NEXTAUTH_SECRET',
    required: true,
    type: 'string',
    minLength: 32,
    description: 'NextAuth.js Secret Key',
    category: 'auth'
  },
  {
    key: 'JWT_SECRET',
    required: true,
    type: 'string',
    minLength: 32,
    description: 'JWT Secret Key',
    category: 'auth'
  },
  {
    key: 'NEXTAUTH_URL',
    required: true,
    type: 'url',
    description: 'Application Base URL',
    category: 'auth'
  },
  
  // Database
  {
    key: 'DATABASE_URL',
    required: true,
    type: 'string',
    minLength: 20,
    pattern: /^postgresql:\/\/.+/,
    description: 'PostgreSQL Database Connection String',
    category: 'database'
  },
  
  // Payment (Optional but recommended for production)
  {
    key: 'STRIPE_SECRET_KEY',
    required: false,
    type: 'string',
    pattern: /^sk_(test|live)_/,
    minLength: 20,
    description: 'Stripe Secret Key',
    category: 'payment'
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false,
    type: 'string',
    pattern: /^pk_(test|live)_/,
    minLength: 20,
    description: 'Stripe Publishable Key',
    category: 'payment'
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    type: 'string',
    pattern: /^whsec_/,
    minLength: 20,
    description: 'Stripe Webhook Secret',
    category: 'payment'
  },
  
  // Email (Optional)
  {
    key: 'SENDGRID_API_KEY',
    required: false,
    type: 'string',
    pattern: /^SG\./,
    description: 'SendGrid API Key',
    category: 'email'
  },
  {
    key: 'SENDGRID_FROM_EMAIL',
    required: false,
    type: 'email',
    description: 'SendGrid From Email Address',
    category: 'email'
  }
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
  configured: string[];
  summary: {
    total: number;
    required: number;
    configured: number;
    missing: number;
    byCategory: Record<string, { configured: number; total: number }>;
  };
}

// Validate a single environment variable
const validateEnvVar = (rule: EnvValidationRule): {
  isValid: boolean;
  error?: string;
  warning?: string;
  isConfigured: boolean;
} => {
  const value = process.env[rule.key];
  
  if (!value || value.trim() === '') {
    if (rule.required) {
      return {
        isValid: false,
        isConfigured: false,
        error: `Required environment variable ${rule.key} is missing or empty`
      };
    }
    return {
      isValid: true,
      isConfigured: false,
      warning: `Optional environment variable ${rule.key} not configured - ${rule.description}`
    };
  }
  
  // Type validation
  switch (rule.type) {
    case 'url':
      try {
        new URL(value);
      } catch {
        return {
          isValid: false,
          isConfigured: true,
          error: `${rule.key} must be a valid URL`
        };
      }
      break;
    
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return {
          isValid: false,
          isConfigured: true,
          error: `${rule.key} must be a valid email address`
        };
      }
      break;
    
    case 'number':
      if (isNaN(Number(value))) {
        return {
          isValid: false,
          isConfigured: true,
          error: `${rule.key} must be a valid number`
        };
      }
      break;
    
    case 'boolean':
      if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
        return {
          isValid: false,
          isConfigured: true,
          error: `${rule.key} must be a boolean value (true/false)`
        };
      }
      break;
  }
  
  // Length validation
  if (rule.minLength && value.length < rule.minLength) {
    return {
      isValid: false,
      isConfigured: true,
      error: `${rule.key} must be at least ${rule.minLength} characters long`
    };
  }
  
  // Pattern validation
  if (rule.pattern && !rule.pattern.test(value)) {
    return {
      isValid: false,
      isConfigured: true,
      error: `${rule.key} format is invalid`
    };
  }
  
  return {
    isValid: true,
    isConfigured: true
  };
};

// Main validation function
export const validateEnvironmentVariables = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing: string[] = [];
  const configured: string[] = [];
  const categoryStats: Record<string, { configured: number; total: number }> = {};
  
  let requiredCount = 0;
  let configuredCount = 0;
  
  for (const rule of ENV_VALIDATION_RULES) {
    if (rule.required) {
      requiredCount++;
    }
    
    // Initialize category stats
    if (!categoryStats[rule.category]) {
      categoryStats[rule.category] = { configured: 0, total: 0 };
    }
    categoryStats[rule.category].total++;
    
    const result = validateEnvVar(rule);
    
    if (result.isConfigured) {
      configured.push(rule.key);
      configuredCount++;
      categoryStats[rule.category].configured++;
    } else {
      missing.push(rule.key);
    }
    
    if (!result.isValid && result.error) {
      errors.push(result.error);
    }
    
    if (result.warning) {
      warnings.push(result.warning);
    }
  }
  
  const isValid = errors.length === 0;
  
  return {
    isValid,
    errors,
    warnings,
    missing,
    configured,
    summary: {
      total: ENV_VALIDATION_RULES.length,
      required: requiredCount,
      configured: configuredCount,
      missing: missing.length,
      byCategory: categoryStats
    }
  };
};

// Check if critical services are configured
export const checkCriticalServices = (): {
  amadeus: boolean;
  database: boolean;
  authentication: boolean;
  payment: boolean;
  email: boolean;
} => {
  return {
    amadeus: !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET),
    database: !!process.env.DATABASE_URL,
    authentication: !!(process.env.NEXTAUTH_SECRET && process.env.JWT_SECRET),
    payment: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    email: !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL)
  };
};

// Security: Mask sensitive values for logging
export const maskSensitiveValue = (key: string, value: string): string => {
  const sensitivePatterns = [
    /secret/i,
    /key/i,
    /password/i,
    /token/i,
    /dsn/i
  ];
  
  const isSensitive = sensitivePatterns.some(pattern => pattern.test(key));
  
  if (!isSensitive) {
    return value;
  }
  
  if (value.length <= 8) {
    return '***';
  }
  
  const visibleChars = Math.min(4, Math.floor(value.length * 0.2));
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const middle = '*'.repeat(Math.max(3, value.length - (visibleChars * 2)));
  
  return `${start}${middle}${end}`;
};

// Get safe environment info for debugging
export const getSafeEnvironmentInfo = (): Record<string, any> => {
  const configuredVars: Record<string, string> = {};
  
  for (const rule of ENV_VALIDATION_RULES) {
    const value = process.env[rule.key];
    if (value) {
      configuredVars[rule.key] = maskSensitiveValue(rule.key, value);
    }
  }
  
  return {
    nodeEnv: process.env.NODE_ENV,
    platform: 'server', // Generic platform name to avoid Edge Runtime issues
    configuredVariables: Object.keys(configuredVars),
    values: configuredVars,
    criticalServices: checkCriticalServices()
  };
};

// Validate and log environment status on startup
export const initializeEnvironment = (): boolean => {
  const validation = validateEnvironmentVariables();
  
  console.log('🔧 Environment Configuration Status:');
  console.log(`📊 Total: ${validation.summary.total}, Configured: ${validation.summary.configured}, Missing: ${validation.summary.missing}`);
  
  // Log category breakdown
  for (const [category, stats] of Object.entries(validation.summary.byCategory)) {
    const percentage = Math.round((stats.configured / stats.total) * 100);
    console.log(`  ${category}: ${stats.configured}/${stats.total} (${percentage}%)`);
  }
  
  // Log errors
  if (validation.errors.length > 0) {
    console.error('❌ Environment Configuration Errors:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  // Log warnings
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Environment Configuration Warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  // Log critical services status
  const services = checkCriticalServices();
  console.log('🔗 Critical Services:');
  console.log(`  Database: ${services.database ? '✅' : '❌'}`);
  console.log(`  Authentication: ${services.authentication ? '✅' : '❌'}`);
  console.log(`  Amadeus API: ${services.amadeus ? '✅' : '⚠️ (Optional)'}`);
  console.log(`  Payment: ${services.payment ? '✅' : '⚠️ (Optional)'}`);
  console.log(`  Email: ${services.email ? '✅' : '⚠️ (Optional)'}`);
  
  return validation.isValid;
};

export default {
  validateEnvironmentVariables,
  checkCriticalServices,
  maskSensitiveValue,
  getSafeEnvironmentInfo,
  initializeEnvironment
};