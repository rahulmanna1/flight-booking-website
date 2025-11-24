/**
 * Centralized Error Logging Service
 * 
 * Provides structured error logging with optional Sentry integration.
 * Works in both development and production environments.
 * 
 * Usage:
 *   import { logError, logWarning, logInfo } from '@/lib/services/errorLogger';
 *   
 *   try {
 *     // code
 *   } catch (error) {
 *     logError('Failed to process booking', error, { bookingId: 'abc123' });
 *   }
 */

import { createAuditLog } from './auditService';

// ============================================
// TYPES
// ============================================

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface LogContext {
  // User context
  userId?: string;
  userEmail?: string;
  userRole?: string;

  // Request context
  url?: string;
  method?: string;
  statusCode?: number;
  ip?: string;
  userAgent?: string;

  // Business context
  bookingId?: string;
  flightId?: string;
  paymentId?: string;
  orderId?: string;

  // Technical context
  component?: string;
  function?: string;
  line?: number;

  // Custom context
  [key: string]: any;
}

export interface ErrorLog {
  level: LogLevel;
  message: string;
  error?: Error | any;
  context?: LogContext;
  timestamp: Date;
  environment: string;
  stack?: string;
}

// ============================================
// CONFIGURATION
// ============================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const sentryDsn = process.env.SENTRY_DSN;
const sentryEnabled = isProduction && !!sentryDsn;

// ============================================
// SENTRY INTEGRATION (Optional)
// ============================================

/**
 * Initialize Sentry if configured
 * This is a placeholder - install @sentry/nextjs for full integration
 */
let SentryClient: any = null;

export function initializeSentry() {
  if (!sentryEnabled) {
    if (isDevelopment) {
      console.log('🔧 Sentry not initialized (development mode or DSN not configured)');
    }
    return;
  }

  try {
    // To enable Sentry:
    // 1. Run: npm install @sentry/nextjs
    // 2. Uncomment the following code:
    /*
    const Sentry = require('@sentry/nextjs');
    
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      debug: false,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });

    SentryClient = Sentry;
    */
    console.log('✅ Sentry initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error);
  }
}

// ============================================
// CORE LOGGING FUNCTIONS
// ============================================

/**
 * Main logging function
 */
function log(
  level: LogLevel,
  message: string,
  error?: Error | any,
  context?: LogContext
): void {
  const errorLog: ErrorLog = {
    level,
    message,
    error,
    context,
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'unknown',
    stack: error?.stack,
  };

  // Console logging (always in development, selective in production)
  if (isDevelopment || level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
    logToConsole(errorLog);
  }

  // Send to Sentry if enabled
  if (sentryEnabled && SentryClient) {
    logToSentry(errorLog);
  }

  // Log critical errors to audit log
  if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
    logToAudit(errorLog).catch(console.error);
  }

  // In development, also log to file (optional)
  if (isDevelopment && process.env.LOG_TO_FILE === 'true') {
    logToFile(errorLog).catch(console.error);
  }
}

/**
 * Log to console with formatting
 */
function logToConsole(errorLog: ErrorLog): void {
  const { level, message, error, context, timestamp } = errorLog;

  const emoji = {
    [LogLevel.DEBUG]: '🔍',
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.WARNING]: '⚠️',
    [LogLevel.ERROR]: '❌',
    [LogLevel.CRITICAL]: '🚨',
  }[level];

  const color = {
    [LogLevel.DEBUG]: '\x1b[36m', // Cyan
    [LogLevel.INFO]: '\x1b[34m',  // Blue
    [LogLevel.WARNING]: '\x1b[33m', // Yellow
    [LogLevel.ERROR]: '\x1b[31m',  // Red
    [LogLevel.CRITICAL]: '\x1b[35m', // Magenta
  }[level];

  const reset = '\x1b[0m';

  console.log(`${color}${emoji} [${level.toUpperCase()}]${reset} ${message}`);
  console.log(`   📅 ${timestamp.toISOString()}`);

  if (context && Object.keys(context).length > 0) {
    console.log('   📋 Context:', JSON.stringify(context, null, 2));
  }

  if (error) {
    if (error instanceof Error) {
      console.error('   💥 Error:', error.message);
      if (error.stack && isDevelopment) {
        console.error('   📚 Stack:', error.stack);
      }
    } else {
      console.error('   💥 Error:', error);
    }
  }

  console.log(''); // Empty line for readability
}

/**
 * Log to Sentry (if configured)
 */
function logToSentry(errorLog: ErrorLog): void {
  if (!SentryClient) return;

  const { level, message, error, context } = errorLog;

  try {
    // Set context
    if (context?.userId) {
      SentryClient.setUser({
        id: context.userId,
        email: context.userEmail,
      });
    }

    if (context) {
      SentryClient.setContext('additional', context);
    }

    // Send to Sentry
    if (error instanceof Error) {
      SentryClient.captureException(error, {
        level: level as any,
        tags: {
          component: context?.component,
          function: context?.function,
        },
      });
    } else {
      SentryClient.captureMessage(message, level as any);
    }
  } catch (sentryError) {
    console.error('Failed to log to Sentry:', sentryError);
  }
}

/**
 * Log to audit system (for critical errors)
 */
async function logToAudit(errorLog: ErrorLog): Promise<void> {
  try {
    const { level, message, error, context } = errorLog;

    await createAuditLog({
      userId: context?.userId || 'SYSTEM',
      action: 'SYSTEM_ERROR',
      category: 'ERROR',
      severity: level === LogLevel.CRITICAL ? 'CRITICAL' : 'HIGH',
      description: message,
      metadata: {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
        context,
        level,
      },
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
    });
  } catch (auditError) {
    console.error('Failed to log to audit system:', auditError);
  }
}

/**
 * Log to file (development only)
 */
async function logToFile(errorLog: ErrorLog): Promise<void> {
  try {
    const fs = require('fs').promises;
    const path = require('path');

    const logDir = path.join(process.cwd(), 'logs');
    await fs.mkdir(logDir, { recursive: true });

    const logFile = path.join(
      logDir,
      `error-${new Date().toISOString().split('T')[0]}.log`
    );

    const logEntry = JSON.stringify(errorLog, null, 2) + '\n---\n';
    await fs.appendFile(logFile, logEntry);
  } catch (fileError) {
    console.error('Failed to log to file:', fileError);
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Log an error (something went wrong)
 */
export function logError(
  message: string,
  error?: Error | any,
  context?: LogContext
): void {
  log(LogLevel.ERROR, message, error, context);
}

/**
 * Log a critical error (requires immediate attention)
 */
export function logCritical(
  message: string,
  error?: Error | any,
  context?: LogContext
): void {
  log(LogLevel.CRITICAL, message, error, context);
}

/**
 * Log a warning (something might be wrong)
 */
export function logWarning(
  message: string,
  error?: Error | any,
  context?: LogContext
): void {
  log(LogLevel.WARNING, message, error, context);
}

/**
 * Log informational message
 */
export function logInfo(
  message: string,
  context?: LogContext
): void {
  log(LogLevel.INFO, message, undefined, context);
}

/**
 * Log debug information (development only)
 */
export function logDebug(
  message: string,
  context?: LogContext
): void {
  if (isDevelopment || process.env.DEBUG_MODE === 'true') {
    log(LogLevel.DEBUG, message, undefined, context);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create context from Next.js request
 */
export function createContextFromRequest(request: Request, additionalContext?: LogContext): LogContext {
  return {
    url: request.url,
    method: request.method,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        undefined,
    ...additionalContext,
  };
}

/**
 * Wrap async function with error logging
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  functionName: string,
  component?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(
        `Error in ${functionName}`,
        error,
        { function: functionName, component }
      );
      throw error;
    }
  }) as T;
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Check if error is a known/expected error
 */
export function isExpectedError(error: unknown): boolean {
  if (error instanceof Error) {
    // Add your custom error types here
    const expectedErrors = [
      'ValidationError',
      'NotFoundError',
      'UnauthorizedError',
      'ForbiddenError',
    ];
    return expectedErrors.includes(error.name);
  }
  return false;
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize Sentry on module load (server-side only)
if (typeof window === 'undefined') {
  initializeSentry();
}
