/**
 * Unit Tests for Error Handler Middleware
 */

import { NextResponse } from 'next/server'
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
  requireAuth,
  requireRole,
  requireOwnership,
  asyncHandler,
} from '../errorHandler'

describe('Error Handler Middleware', () => {
  describe('Custom Error Types', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid email')
      expect(error.name).toBe('ValidationError')
      expect(error.message).toBe('Invalid email')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
    })

    it('should create NotFoundError with correct properties', () => {
      const error = new NotFoundError('Resource not found')
      expect(error.name).toBe('NotFoundError')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create UnauthorizedError with correct properties', () => {
      const error = new UnauthorizedError()
      expect(error.name).toBe('UnauthorizedError')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })

    it('should create ForbiddenError with correct properties', () => {
      const error = new ForbiddenError('Admin only')
      expect(error.name).toBe('ForbiddenError')
      expect(error.message).toBe('Admin only')
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('FORBIDDEN')
    })

    it('should create ConflictError with correct properties', () => {
      const error = new ConflictError('Duplicate entry')
      expect(error.statusCode).toBe(409)
      expect(error.code).toBe('CONFLICT')
    })

    it('should create RateLimitError with correct properties', () => {
      const error = new RateLimitError()
      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should create ExternalServiceError with correct properties', () => {
      const error = new ExternalServiceError('API down')
      expect(error.statusCode).toBe(502)
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR')
    })

    it('should create generic APIError with custom values', () => {
      const error = new APIError('Custom error', 418, 'TEAPOT')
      expect(error.message).toBe('Custom error')
      expect(error.statusCode).toBe(418)
      expect(error.code).toBe('TEAPOT')
    })
  })

  describe('withErrorHandler', () => {
    it('should return success response when no error', async () => {
      const handler = withErrorHandler(async (request) => {
        return NextResponse.json({ success: true, data: 'test' })
      })

      const request = new Request('http://localhost:3000/api/test')
      const response = await handler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true, data: 'test' })
    })

    it('should handle ValidationError correctly', async () => {
      const handler = withErrorHandler(async (request) => {
        throw new ValidationError('Email is required')
      })

      const request = new Request('http://localhost:3000/api/test')
      const response = await handler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.message).toBe('Email is required')
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.statusCode).toBe(400)
    })

    it('should handle NotFoundError correctly', async () => {
      const handler = withErrorHandler(async (request) => {
        throw new NotFoundError('Booking not found')
      })

      const request = new Request('http://localhost:3000/api/bookings/123')
      const response = await handler(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.message).toBe('Booking not found')
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should handle UnauthorizedError correctly', async () => {
      const handler = withErrorHandler(async (request) => {
        throw new UnauthorizedError('Invalid token')
      })

      const request = new Request('http://localhost:3000/api/test')
      const response = await handler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should handle generic Error as 500', async () => {
      const handler = withErrorHandler(async (request) => {
        throw new Error('Unexpected error')
      })

      const request = new Request('http://localhost:3000/api/test')
      const response = await handler(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.message).toBe('Unexpected error')
      expect(data.error.code).toBe('INTERNAL_ERROR')
    })

    it('should include requestId in error response', async () => {
      const handler = withErrorHandler(async (request) => {
        throw new ValidationError('Test')
      })

      const request = new Request('http://localhost:3000/api/test')
      const response = await handler(request)
      const data = await response.json()

      expect(data.error.requestId).toBeDefined()
      expect(typeof data.error.requestId).toBe('string')
    })

    it('should include timestamp in error response', async () => {
      const handler = withErrorHandler(async (request) => {
        throw new ValidationError('Test')
      })

      const request = new Request('http://localhost:3000/api/test')
      const response = await handler(request)
      const data = await response.json()

      expect(data.error.timestamp).toBeDefined()
      expect(new Date(data.error.timestamp).getTime()).toBeGreaterThan(0)
    })
  })

  describe('Helper Functions', () => {
    describe('requireAuth', () => {
      it('should not throw if user exists', () => {
        const user = { id: 'user123', role: 'USER' }
        expect(() => requireAuth(user)).not.toThrow()
      })

      it('should throw UnauthorizedError if user is null', () => {
        expect(() => requireAuth(null)).toThrow(UnauthorizedError)
      })

      it('should throw UnauthorizedError if user is undefined', () => {
        expect(() => requireAuth(undefined)).toThrow(UnauthorizedError)
      })
    })

    describe('requireRole', () => {
      it('should not throw if user has allowed role', () => {
        const user = { id: 'user123', role: 'ADMIN' }
        expect(() => requireRole(user, ['ADMIN', 'SUPER_ADMIN'])).not.toThrow()
      })

      it('should throw ForbiddenError if user does not have allowed role', () => {
        const user = { id: 'user123', role: 'USER' }
        expect(() => requireRole(user, ['ADMIN'])).toThrow(ForbiddenError)
      })

      it('should throw UnauthorizedError if user is null', () => {
        expect(() => requireRole(null, ['ADMIN'])).toThrow(UnauthorizedError)
      })
    })

    describe('requireOwnership', () => {
      it('should not throw if userId matches resourceOwnerId', () => {
        expect(() => requireOwnership('user123', 'user123')).not.toThrow()
      })

      it('should throw ForbiddenError if userId does not match', () => {
        expect(() => requireOwnership('user123', 'user456')).toThrow(
          ForbiddenError
        )
      })
    })

    describe('asyncHandler', () => {
      it('should return data and null error on success', async () => {
        const promise = Promise.resolve('success')
        const [data, error] = await asyncHandler(promise)

        expect(data).toBe('success')
        expect(error).toBeNull()
      })

      it('should return null data and error on failure', async () => {
        const promise = Promise.reject(new Error('failed'))
        const [data, error] = await asyncHandler(promise)

        expect(data).toBeNull()
        expect(error).toBeInstanceOf(Error)
        expect(error?.message).toBe('failed')
      })

      it('should convert non-Error rejections to Error', async () => {
        const promise = Promise.reject('string error')
        const [data, error] = await asyncHandler(promise)

        expect(data).toBeNull()
        expect(error).toBeInstanceOf(Error)
        expect(error?.message).toBe('string error')
      })
    })
  })

  describe('Error Response Format', () => {
    it('should have consistent error response structure', async () => {
      const handler = withErrorHandler(async (request) => {
        throw new ValidationError('Test error')
      })

      const request = new Request('http://localhost:3000/api/test')
      const response = await handler(request)
      const data = await response.json()

      expect(data).toHaveProperty('success', false)
      expect(data).toHaveProperty('error')
      expect(data.error).toHaveProperty('message')
      expect(data.error).toHaveProperty('code')
      expect(data.error).toHaveProperty('statusCode')
      expect(data.error).toHaveProperty('timestamp')
      expect(data.error).toHaveProperty('requestId')
    })
  })

  describe('Component Context', () => {
    it('should accept component name in options', async () => {
      const handler = withErrorHandler(
        async (request) => {
          return NextResponse.json({ success: true })
        },
        { component: 'TestComponent' }
      )

      const request = new Request('http://localhost:3000/api/test')
      const response = await handler(request)

      expect(response.status).toBe(200)
    })
  })
})
