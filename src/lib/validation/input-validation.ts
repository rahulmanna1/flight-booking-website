import { z } from 'zod';

// Flight search validation schema
export const flightSearchSchema = z.object({
  departure: z.string().min(3).max(3).regex(/^[A-Z]{3}$/, 'Must be 3-letter IATA code'),
  arrival: z.string().min(3).max(3).regex(/^[A-Z]{3}$/, 'Must be 3-letter IATA code'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format').optional(),
  passengers: z.number().min(1).max(9),
  class: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
});

// User registration validation schema
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
  firstName: z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/, 'Invalid name format'),
  lastName: z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/, 'Invalid name format'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
});

// Booking validation schema
export const bookingSchema = z.object({
  flightOfferId: z.string().min(1),
  passengers: z.array(z.object({
    firstName: z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/, 'Invalid name format'),
    lastName: z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/, 'Invalid name format'),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    email: z.string().email('Invalid email format'),
    phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
    passportNumber: z.string().optional(),
    passportExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format').optional(),
  })).min(1),
  contactInfo: z.object({
    email: z.string().email('Invalid email format'),
    phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  }),
});

// Price alert validation schema
export const priceAlertSchema = z.object({
  departure: z.string().min(3).max(3).regex(/^[A-Z]{3}$/, 'Must be 3-letter IATA code'),
  arrival: z.string().min(3).max(3).regex(/^[A-Z]{3}$/, 'Must be 3-letter IATA code'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  maxPrice: z.number().min(0),
  email: z.string().email('Invalid email format'),
});

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/, 'Invalid name format'),
  email: z.string().email('Invalid email format'),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
});

// Generic validation function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { 
      success: false, 
      errors: { general: 'Validation failed' } 
    };
  }
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, (match) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return map[match] || match;
    });
}

// Validate and sanitize object
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj } as any;
  
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key];
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item) : item
      );
    }
  });
  
  return sanitized;
}
