# Testing Guide

## 📋 Overview

The flight booking system uses **Jest** as the testing framework with the following test types:

- ✅ **Unit Tests** - Test individual functions and components
- ✅ **Integration Tests** - Test API endpoints and workflows
- ✅ **API Tests** - Test HTTP endpoints
- ⏳ **E2E Tests** - Test complete user flows (future)

---

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests for CI/CD
npm run test:ci
```

---

## 📁 Test Structure

```
flight-booking-website/
├── src/
│   └── lib/
│       ├── services/
│       │   ├── __tests__/
│       │   │   └── errorLogger.test.ts          # Unit tests
│       │   └── errorLogger.ts
│       └── middleware/
│           ├── __tests__/
│           │   └── errorHandler.test.ts         # Unit tests
│           └── errorHandler.ts
├── tests/
│   ├── api/
│   │   ├── auth.test.ts                         # API integration tests
│   │   ├── bookings.test.ts
│   │   └── payments.test.ts
│   └── e2e/
│       └── booking-flow.test.ts                 # E2E tests
├── jest.config.js                               # Jest configuration
└── jest.setup.js                                # Jest setup file
```

---

## ✍️ Writing Tests

### Unit Test Example

```typescript
// src/lib/services/__tests__/errorLogger.test.ts

import { logError, getErrorMessage } from '../errorLogger'

describe('Error Logger Service', () => {
  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error')
      const message = getErrorMessage(error)
      expect(message).toBe('Test error')
    })

    it('should handle string errors', () => {
      const message = getErrorMessage('String error')
      expect(message).toBe('String error')
    })

    it('should handle unknown error types', () => {
      const message = getErrorMessage({ custom: 'error' })
      expect(message).toBe('Unknown error occurred')
    })
  })
})
```

### API Test Example

```typescript
// tests/api/bookings.test.ts

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/bookings/[id]/route'

describe('API - Get Booking', () => {
  it('should return booking when found', async () => {
    const request = new NextRequest('http://localhost:3000/api/bookings/123')
    
    // Mock Prisma
    const mockBooking = {
      id: '123',
      userId: 'user1',
      status: 'CONFIRMED',
    }
    
    prisma.booking.findUnique = jest.fn().mockResolvedValue(mockBooking)
    
    const response = await GET(request, { params: { id: '123' } })
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('123')
  })

  it('should return 404 when booking not found', async () => {
    const request = new NextRequest('http://localhost:3000/api/bookings/999')
    
    prisma.booking.findUnique = jest.fn().mockResolvedValue(null)
    
    const response = await GET(request, { params: { id: '999' } })
    const data = await response.json()
    
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })
})
```

### Component Test Example

```typescript
// src/components/__tests__/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../Button'

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })
})
```

---

## 🧪 Test Patterns

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
it('should calculate booking total correctly', () => {
  // Arrange - Set up test data
  const booking = {
    basePrice: 500,
    taxes: 50,
    fees: 25,
  }

  // Act - Execute the function
  const total = calculateTotal(booking)

  // Assert - Verify the result
  expect(total).toBe(575)
})
```

### 2. Mocking External Dependencies

```typescript
// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

// Mock environment variables
beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
})
```

### 3. Testing Async Functions

```typescript
it('should fetch booking data', async () => {
  const mockData = { id: '123', status: 'CONFIRMED' }
  
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => mockData,
  })

  const result = await fetchBooking('123')
  
  expect(result).toEqual(mockData)
})
```

### 4. Testing Error Cases

```typescript
it('should throw error when booking not found', async () => {
  prisma.booking.findUnique = jest.fn().mockResolvedValue(null)

  await expect(getBooking('invalid')).rejects.toThrow(
    'Booking not found'
  )
})
```

---

## 📊 Coverage Reports

### Generate Coverage

```bash
npm run test:coverage
```

### Coverage Output

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   85.5  |   78.3   |   82.1  |   86.2  |
 errorLogger.ts       |   92.1  |   85.7   |   90.0  |   93.5  |
 errorHandler.ts      |   88.4  |   82.3   |   85.2  |   89.1  |
----------------------|---------|----------|---------|---------|
```

### Coverage Thresholds

Current thresholds (see `jest.config.js`):
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

Recommended for production: 80%+

---

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### Setup File (`jest.setup.js`)

```javascript
import '@testing-library/jest-dom'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret'
process.env.NODE_ENV = 'test'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))
```

---

## 🎯 What to Test

### High Priority

✅ **Business Logic**
- Booking calculations
- Payment processing
- Price calculations
- Discount/promo code validation
- Date validation

✅ **Error Handling**
- API error responses
- Validation errors
- Edge cases

✅ **Authentication & Authorization**
- Login/logout
- Token validation
- Role-based access

✅ **Data Validation**
- Input validation
- Schema validation
- Data transformations

### Medium Priority

⚠️ **API Endpoints**
- CRUD operations
- Query parameters
- Response formats

⚠️ **Services**
- Email sending
- Payment processing
- External API calls

### Lower Priority

📝 **UI Components**
- Rendering
- User interactions
- Styling (if critical)

---

## 🧩 Testing Best Practices

### 1. **Test Behavior, Not Implementation**

❌ **Bad:**
```typescript
it('should call fetchUser internally', () => {
  const spy = jest.spyOn(service, 'fetchUser')
  service.getUser('123')
  expect(spy).toHaveBeenCalled()
})
```

✅ **Good:**
```typescript
it('should return user data when user exists', async () => {
  const user = await service.getUser('123')
  expect(user.id).toBe('123')
  expect(user.email).toBeDefined()
})
```

### 2. **Keep Tests Independent**

✅ Each test should:
- Set up its own data
- Clean up after itself
- Not depend on other tests
- Be able to run in any order

### 3. **Use Descriptive Test Names**

❌ **Bad:**
```typescript
it('works', () => {})
it('test booking', () => {})
```

✅ **Good:**
```typescript
it('should create booking with valid flight and passenger data', () => {})
it('should throw ValidationError when passenger age is negative', () => {})
```

### 4. **Test Edge Cases**

```typescript
describe('calculateAge', () => {
  it('should handle leap year births', () => {})
  it('should handle same-day birthdays', () => {})
  it('should handle future dates', () => {})
  it('should handle invalid dates', () => {})
})
```

### 5. **Mock External Services**

Always mock:
- ✅ Database calls
- ✅ HTTP requests
- ✅ File system operations
- ✅ Third-party APIs (Stripe, SendGrid, Amadeus)
- ✅ Date/time (use `jest.useFakeTimers()`)

---

## 🔍 Debugging Tests

### Run Specific Test

```bash
# Run single test file
npm test -- errorLogger.test.ts

# Run specific test by name
npm test -- -t "should log errors"

# Run with verbose output
npm test -- --verbose
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Watch Mode Tips

```bash
# Watch mode with coverage
npm run test:watch -- --coverage

# Watch only changed files
npm run test:watch -- --onlyChanged

# Clear cache if tests behave strangely
npm test -- --clearCache
```

---

## 📝 Test Checklist

Before committing code, ensure:

- [ ] All tests pass
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Coverage meets minimum threshold
- [ ] No console errors/warnings in tests
- [ ] Tests run in CI/CD pipeline

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 📚 Additional Resources

### Jest Documentation
- https://jestjs.io/docs/getting-started

### Testing Library
- https://testing-library.com/docs/react-testing-library/intro/

### Next.js Testing
- https://nextjs.org/docs/testing

---

## 🎯 Next Steps

### Immediate
1. ✅ Run existing tests: `npm test`
2. ✅ Check coverage: `npm run test:coverage`
3. ✅ Write tests for new features

### Short Term
1. Increase coverage to 70%+
2. Add integration tests for critical flows
3. Set up CI/CD testing

### Long Term
1. Add E2E tests with Playwright or Cypress
2. Performance testing
3. Load testing for API endpoints
4. Visual regression testing

---

**Status**: ✅ Testing Infrastructure Ready  
**Next**: Write tests for critical business logic
