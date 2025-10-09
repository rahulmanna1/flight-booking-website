// API endpoint for CAPTCHA token verification
// Handles server-side validation of Google reCAPTCHA v3 tokens

import type { NextApiRequest, NextApiResponse } from 'next';
import CaptchaService, { CaptchaVerificationResult } from '../../../../lib/security/captcha';
import { getClientIP } from '../../../../lib/utils/network';
import { logSecurityEvent } from '../../../../lib/security/audit';

interface VerificationRequest {
  token: string;
  action: string;
}

interface VerificationResponse extends CaptchaVerificationResult {
  timestamp: string;
  clientIP?: string;
}

/**
 * CAPTCHA Token Verification API
 * 
 * POST /api/security/captcha/verify
 * 
 * Body:
 * {
 *   "token": "reCAPTCHA_token_from_client",
 *   "action": "login|register|booking|payment|search|contact"
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "score": number,
 *   "action": string,
 *   "riskLevel": "low|medium|high",
 *   "timestamp": string,
 *   "error": string
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerificationResponse | { error: string }>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const startTime = Date.now();
  let clientIP: string | undefined;

  try {
    // Get client IP for logging and rate limiting
    clientIP = getClientIP(req);

    // Validate request body
    const { token, action }: VerificationRequest = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request: token is required and must be a string' 
      });
    }

    if (!action || typeof action !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request: action is required and must be a string' 
      });
    }

    // Validate action type
    if (!CaptchaService.isValidAction(action)) {
      return res.status(400).json({ 
        error: `Invalid action: ${action}. Must be one of: login, register, booking, payment, search, contact` 
      });
    }

    // Rate limiting check (simple in-memory rate limiting)
    const rateLimitKey = `captcha_verify:${clientIP}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey);

    if (!rateLimitResult.allowed) {
      // Log rate limit exceeded
      await logSecurityEvent({
        type: 'CAPTCHA_RATE_LIMIT_EXCEEDED',
        severity: 'medium',
        details: {
          clientIP,
          action,
          requestsInWindow: rateLimitResult.requests,
          windowMinutes: rateLimitResult.windowMinutes
        },
        metadata: {
          endpoint: '/api/security/captcha/verify',
          userAgent: req.headers['user-agent'],
          rateLimitKey
        }
      });

      return res.status(429).json({
        error: `Rate limit exceeded. Try again in ${rateLimitResult.resetTimeSeconds} seconds.`
      });
    }

    console.log(`🔐 CAPTCHA verification request: action=${action}, IP=${clientIP}`);

    // Verify CAPTCHA token
    const verificationResult = await CaptchaService.verifyToken(token, action, clientIP);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Prepare response
    const response: VerificationResponse = {
      ...verificationResult,
      timestamp: new Date().toISOString(),
      clientIP: clientIP
    };

    // Remove sensitive information from response
    delete response.challenge_ts;
    delete response.hostname;

    // Log verification result for monitoring
    await logSecurityEvent({
      type: verificationResult.success ? 'CAPTCHA_VERIFICATION_SUCCESS' : 'CAPTCHA_VERIFICATION_FAILED',
      severity: verificationResult.riskLevel === 'high' ? 'high' : 'low',
      details: {
        action,
        score: verificationResult.score,
        riskLevel: verificationResult.riskLevel,
        success: verificationResult.success,
        processingTime,
        clientIP
      },
      metadata: {
        endpoint: '/api/security/captcha/verify',
        userAgent: req.headers['user-agent'],
        error: verificationResult.error
      }
    });

    // Set appropriate HTTP status
    const statusCode = verificationResult.success ? 200 : 400;

    console.log(`📊 CAPTCHA verification completed: success=${verificationResult.success}, score=${verificationResult.score}, risk=${verificationResult.riskLevel}, time=${processingTime}ms`);

    return res.status(statusCode).json(response);

  } catch (error: any) {
    console.error('❌ CAPTCHA verification API error:', error);

    const processingTime = Date.now() - startTime;

    // Log the error
    await logSecurityEvent({
      type: 'CAPTCHA_VERIFICATION_ERROR',
      severity: 'high',
      details: {
        error: error.message,
        stack: error.stack,
        processingTime,
        clientIP
      },
      metadata: {
        endpoint: '/api/security/captcha/verify',
        userAgent: req.headers['user-agent']
      }
    });

    return res.status(500).json({
      error: 'Internal server error during CAPTCHA verification'
    });
  }
}

// Simple in-memory rate limiting for CAPTCHA verification
const rateLimitCache = new Map<string, {
  requests: number;
  resetTime: number;
}>();

interface RateLimitResult {
  allowed: boolean;
  requests: number;
  windowMinutes: number;
  resetTimeSeconds?: number;
}

async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxRequests = 20; // 20 requests per 5 minutes
  
  const cached = rateLimitCache.get(key);
  
  if (!cached || now > cached.resetTime) {
    // New window or expired
    rateLimitCache.set(key, {
      requests: 1,
      resetTime: now + windowMs
    });
    
    return {
      allowed: true,
      requests: 1,
      windowMinutes: 5
    };
  }
  
  if (cached.requests >= maxRequests) {
    // Rate limit exceeded
    const resetTimeSeconds = Math.ceil((cached.resetTime - now) / 1000);
    
    return {
      allowed: false,
      requests: cached.requests,
      windowMinutes: 5,
      resetTimeSeconds
    };
  }
  
  // Increment request count
  cached.requests++;
  rateLimitCache.set(key, cached);
  
  return {
    allowed: true,
    requests: cached.requests,
    windowMinutes: 5
  };
}

// Clean up expired rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, data] of rateLimitCache.entries()) {
    if (now > data.resetTime) {
      rateLimitCache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 CAPTCHA rate limit cleanup: ${cleaned} expired entries removed`);
  }
}, 10 * 60 * 1000);