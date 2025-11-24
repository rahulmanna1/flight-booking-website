/**
 * Unit Tests for Error Logger Service
 */

import {
  logError,
  logWarning,
  logInfo,
  logDebug,
  logCritical,
  getErrorMessage,
  isExpectedError,
  createContextFromRequest,
  LogLevel,
} from '../errorLogger'

describe('Error Logger Service', () => {
  // Mock console methods
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('Log Functions', () => {
    it('should log errors with context', () => {
      const error = new Error('Test error')
      const context = { userId: 'user123', bookingId: 'book456' }

      logError('Test error message', error, context)

      expect(consoleLogSpy).toHaveBeenCalled()
      const logOutput = consoleLogSpy.mock.calls[0][0]
      expect(logOutput).toContain('[ERROR]')
      expect(logOutput).toContain('Test error message')
    })

    it('should log warnings', () => {
      const context = { component: 'TestComponent' }

      logWarning('Warning message', undefined, context)

      expect(consoleLogSpy).toHaveBeenCalled()
      const logOutput = consoleLogSpy.mock.calls[0][0]
      expect(logOutput).toContain('[WARNING]')
      expect(logOutput).toContain('Warning message')
    })

    it('should log info messages', () => {
      logInfo('Info message', { action: 'test' })

      expect(consoleLogSpy).toHaveBeenCalled()
      const logOutput = consoleLogSpy.mock.calls[0][0]
      expect(logOutput).toContain('[INFO]')
      expect(logOutput).toContain('Info message')
    })

    it('should log critical errors', () => {
      const error = new Error('Critical error')

      logCritical('Critical message', error)

      expect(consoleLogSpy).toHaveBeenCalled()
      const logOutput = consoleLogSpy.mock.calls[0][0]
      expect(logOutput).toContain('[CRITICAL]')
      expect(logOutput).toContain('Critical message')
    })

    it('should only log debug in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      logDebug('Debug message')

      expect(consoleLogSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Utility Functions', () => {
    describe('getErrorMessage', () => {
      it('should extract message from Error object', () => {
        const error = new Error('Test error message')
        const message = getErrorMessage(error)
        expect(message).toBe('Test error message')
      })

      it('should handle string errors', () => {
        const message = getErrorMessage('String error')
        expect(message).toBe('String error')
      })

      it('should handle unknown error types', () => {
        const message = getErrorMessage({ custom: 'error' })
        expect(message).toBe('Unknown error occurred')
      })

      it('should handle null/undefined', () => {
        const message = getErrorMessage(null)
        expect(message).toBe('Unknown error occurred')
      })
    })

    describe('isExpectedError', () => {
      it('should identify ValidationError as expected', () => {
        const error = new Error('Validation failed')
        error.name = 'ValidationError'
        expect(isExpectedError(error)).toBe(true)
      })

      it('should identify NotFoundError as expected', () => {
        const error = new Error('Not found')
        error.name = 'NotFoundError'
        expect(isExpectedError(error)).toBe(true)
      })

      it('should identify UnauthorizedError as expected', () => {
        const error = new Error('Unauthorized')
        error.name = 'UnauthorizedError'
        expect(isExpectedError(error)).toBe(true)
      })

      it('should identify ForbiddenError as expected', () => {
        const error = new Error('Forbidden')
        error.name = 'ForbiddenError'
        expect(isExpectedError(error)).toBe(true)
      })

      it('should not identify generic Error as expected', () => {
        const error = new Error('Generic error')
        expect(isExpectedError(error)).toBe(false)
      })

      it('should return false for non-Error types', () => {
        expect(isExpectedError('string error')).toBe(false)
        expect(isExpectedError(null)).toBe(false)
      })
    })

    describe('createContextFromRequest', () => {
      it('should extract context from Request object', () => {
        const request = new Request('http://localhost:3000/api/test', {
          method: 'POST',
          headers: {
            'user-agent': 'Test Agent',
            'x-forwarded-for': '192.168.1.1',
          },
        })

        const context = createContextFromRequest(request, {
          userId: 'user123',
        })

        expect(context.url).toBe('http://localhost:3000/api/test')
        expect(context.method).toBe('POST')
        expect(context.userAgent).toBe('Test Agent')
        expect(context.ip).toBe('192.168.1.1')
        expect(context.userId).toBe('user123')
      })

      it('should handle requests without optional headers', () => {
        const request = new Request('http://localhost:3000/api/test', {
          method: 'GET',
        })

        const context = createContextFromRequest(request)

        expect(context.url).toBe('http://localhost:3000/api/test')
        expect(context.method).toBe('GET')
        expect(context.userAgent).toBeUndefined()
        expect(context.ip).toBeUndefined()
      })

      it('should merge additional context', () => {
        const request = new Request('http://localhost:3000/api/test')

        const context = createContextFromRequest(request, {
          bookingId: 'book123',
          component: 'BookingAPI',
        })

        expect(context.bookingId).toBe('book123')
        expect(context.component).toBe('BookingAPI')
      })
    })
  })

  describe('Error Context', () => {
    it('should include full context in logs', () => {
      const error = new Error('Test error')
      const context = {
        userId: 'user123',
        userEmail: 'user@test.com',
        bookingId: 'book456',
        component: 'BookingService',
        function: 'createBooking',
      }

      logError('Booking creation failed', error, context)

      expect(consoleLogSpy).toHaveBeenCalled()
      // Verify context is logged (it's in a separate console.log call)
      const contextLog = consoleLogSpy.mock.calls.find((call) =>
        call[0]?.includes('Context:')
      )
      expect(contextLog).toBeDefined()
    })
  })

  describe('Stack Traces', () => {
    it('should include stack trace for Error objects', () => {
      const error = new Error('Error with stack')
      error.stack = 'Error: Error with stack\n    at test.ts:123:45'

      logError('Test error', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})
