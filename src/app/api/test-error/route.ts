/**
 * Test Error API Route
 * 
 * This route is for testing the error logging system.
 * Remove this file in production.
 * 
 * Test URLs:
 * - GET /api/test-error?type=validation
 * - GET /api/test-error?type=notfound
 * - GET /api/test-error?type=unauthorized
 * - GET /api/test-error?type=forbidden
 * - GET /api/test-error?type=conflict
 * - GET /api/test-error?type=ratelimit
 * - GET /api/test-error?type=external
 * - GET /api/test-error?type=generic
 * - GET /api/test-error (default: success)
 */

import { NextResponse } from 'next/server';
import { 
  withErrorHandler,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  APIError,
} from '@/lib/middleware/errorHandler';
import { logInfo, logWarning, logError, logCritical } from '@/lib/services/errorLogger';

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const errorType = searchParams.get('type');

  // Test logging functions
  if (errorType === 'logs') {
    logInfo('Test info log', { component: 'TestAPI' });
    logWarning('Test warning log', undefined, { component: 'TestAPI' });
    logError('Test error log', new Error('Test error'), { component: 'TestAPI' });
    
    return NextResponse.json({
      success: true,
      message: 'Check console for log outputs',
    });
  }

  // Test different error types
  switch (errorType) {
    case 'validation':
      throw new ValidationError('Email is required and must be valid');

    case 'notfound':
      throw new NotFoundError('Booking with ID "test123" not found');

    case 'unauthorized':
      throw new UnauthorizedError('Invalid or expired authentication token');

    case 'forbidden':
      throw new ForbiddenError('Admin access required to perform this action');

    case 'conflict':
      throw new ConflictError('A booking with this reference already exists');

    case 'ratelimit':
      throw new RateLimitError('Too many requests. Please try again in 60 seconds');

    case 'external':
      throw new ExternalServiceError('Amadeus API is temporarily unavailable');

    case 'generic':
      throw new APIError('Something went wrong', 500, 'GENERIC_ERROR');

    case 'critical':
      logCritical('Test critical error', new Error('Database connection lost'), {
        component: 'TestAPI',
        severity: 'CRITICAL',
      });
      throw new APIError('System error', 500, 'SYSTEM_ERROR');

    case 'unhandled':
      // This will trigger an unhandled error
      throw new Error('This is an unhandled error for testing');

    default:
      // Success case
      return NextResponse.json({
        success: true,
        message: 'Error logging system is working correctly',
        availableTests: [
          'GET /api/test-error?type=validation',
          'GET /api/test-error?type=notfound',
          'GET /api/test-error?type=unauthorized',
          'GET /api/test-error?type=forbidden',
          'GET /api/test-error?type=conflict',
          'GET /api/test-error?type=ratelimit',
          'GET /api/test-error?type=external',
          'GET /api/test-error?type=generic',
          'GET /api/test-error?type=critical',
          'GET /api/test-error?type=unhandled',
          'GET /api/test-error?type=logs',
        ],
      });
  }
}, {
  component: 'TestErrorAPI',
  logErrors: true,
});

export const POST = withErrorHandler(async (request) => {
  const body = await request.json();

  // Test validation
  if (!body.testField) {
    throw new ValidationError('testField is required');
  }

  return NextResponse.json({
    success: true,
    message: 'POST request successful',
    received: body,
  });
}, {
  component: 'TestErrorAPI',
});
