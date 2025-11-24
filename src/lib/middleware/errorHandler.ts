/**
 * API Error Handler Middleware
 * 
 * Provides centralized error handling for API routes with automatic logging.
 * Converts errors to consistent API responses.
 */

import { NextResponse } from 'next/server';
import { logError, logWarning, createContextFromRequest, getErrorMessage } from '@/lib/services/errorLogger';

// ============================================
// ERROR TYPES
// ============================================

export class APIError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends APIError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends APIError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends APIError {
  constructor(message: string = 'External service error', service?: string) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}

// ============================================
// ERROR RESPONSE BUILDER
// ============================================

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

function buildErrorResponse(
  error: unknown,
  requestId?: string,
  includeStack: boolean = false
): ErrorResponse {
  let message = 'An unexpected error occurred';
  let code = 'INTERNAL_ERROR';
  let statusCode = 500;
  let details = undefined;

  if (error instanceof APIError) {
    message = error.message;
    code = error.code;
    statusCode = error.statusCode;
  } else if (error instanceof Error) {
    message = error.message;
    if (includeStack) {
      details = { stack: error.stack };
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  return {
    success: false,
    error: {
      message,
      code,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

// ============================================
// ERROR HANDLER WRAPPER
// ============================================

type RouteHandler = (request: Request, context?: any) => Promise<Response>;

/**
 * Wraps an API route handler with automatic error handling and logging
 * 
 * Usage:
 *   export const GET = withErrorHandler(async (request) => {
 *     // Your route logic
 *     return NextResponse.json({ data: ... });
 *   });
 */
export function withErrorHandler(
  handler: RouteHandler,
  options?: {
    component?: string;
    logErrors?: boolean;
    includeStackInResponse?: boolean;
  }
): RouteHandler {
  return async (request: Request, context?: any) => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      // Execute the handler
      const response = await handler(request, context);

      // Log successful request (info level)
      const duration = Date.now() - startTime;
      if (process.env.LOG_API_REQUESTS === 'true') {
        const logContext = createContextFromRequest(request, {
          component: options?.component,
          statusCode: response.status,
          duration,
          requestId,
        });
        
        // Only log if not 200 OK or if explicitly enabled
        if (response.status !== 200 || process.env.LOG_ALL_REQUESTS === 'true') {
          logWarning(
            `API ${request.method} ${new URL(request.url).pathname} - ${response.status}`,
            undefined,
            logContext
          );
        }
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Create log context
      const logContext = createContextFromRequest(request, {
        component: options?.component,
        duration,
        requestId,
      });

      // Determine status code for logging decision
      const statusCode = error instanceof APIError ? error.statusCode : 500;

      // Log the error (skip logging for expected 4xx errors unless critical)
      if (options?.logErrors !== false) {
        if (statusCode >= 500) {
          // Server errors - always log
          logError(
            `API Error: ${request.method} ${new URL(request.url).pathname}`,
            error,
            logContext
          );
        } else if (statusCode === 401 || statusCode === 403) {
          // Auth errors - log as warning
          logWarning(
            `Auth Error: ${request.method} ${new URL(request.url).pathname} - ${getErrorMessage(error)}`,
            undefined,
            logContext
          );
        }
        // Skip logging for other 4xx (validation, not found, etc.)
      }

      // Build error response
      const includeStack = 
        options?.includeStackInResponse && 
        process.env.NODE_ENV === 'development';

      const errorResponse = buildErrorResponse(error, requestId, includeStack);

      // Return error response
      return NextResponse.json(
        errorResponse,
        { status: errorResponse.error.statusCode }
      );
    }
  };
}

// ============================================
// ASYNC HANDLER (Alternative Pattern)
// ============================================

/**
 * Alternative pattern for handling async operations with error catching
 * 
 * Usage:
 *   const [data, error] = await asyncHandler(someAsyncOperation());
 *   if (error) {
 *     throw new APIError('Operation failed');
 *   }
 */
export async function asyncHandler<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate request body against a schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: { parse: (data: any) => T }
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw new ValidationError('Invalid request body: ' + error.message);
    }
    throw new ValidationError('Invalid request body');
  }
}

/**
 * Require authentication
 */
export function requireAuth(user: any): void {
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }
}

/**
 * Require specific role
 */
export function requireRole(user: any, allowedRoles: string[]): void {
  requireAuth(user);
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }
}

/**
 * Require resource ownership
 */
export function requireOwnership(userId: string, resourceOwnerId: string): void {
  if (userId !== resourceOwnerId) {
    throw new ForbiddenError('You do not have permission to access this resource');
  }
}

// ============================================
// EXPORTS
// ============================================

export {
  buildErrorResponse,
  type ErrorResponse,
  type RouteHandler,
};
