// CAPTCHA Middleware for API Endpoints
// Adds automatic CAPTCHA verification to sensitive API endpoints

import type { NextApiRequest, NextApiResponse } from 'next';
import CaptchaService from '../security/captcha';
import { getClientIP } from '../utils/network';
import { logSecurityEvent } from '../security/audit';

// Extend NextApiRequest to include CAPTCHA verification result
export interface CaptchaRequest extends NextApiRequest {
  captcha?: {
    verified: boolean;
    score?: number;
    riskLevel?: 'low' | 'medium' | 'high';
    action: string;
    clientIP?: string;
  };
}

interface CaptchaMiddlewareOptions {
  action: 'login' | 'register' | 'booking' | 'payment' | 'search' | 'contact';
  required?: boolean; // Default: true
  minScore?: number; // Override default threshold
  skipInDev?: boolean; // Skip verification in development
  onFailure?: (req: CaptchaRequest, res: NextApiResponse, result: any) => void;
  onSuccess?: (req: CaptchaRequest, res: NextApiResponse, result: any) => void;
}

type ApiHandler = (req: CaptchaRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * CAPTCHA Protection Middleware
 * 
 * Wraps API endpoints to require CAPTCHA verification
 * 
 * Usage:
 * export default withCaptcha(handler, { action: 'booking' });
 * 
 * The middleware expects the client to send:
 * {
 *   "captchaToken": "reCAPTCHA_token",
 *   // ... other request data
 * }
 */
export function withCaptcha(
  handler: ApiHandler,
  options: CaptchaMiddlewareOptions
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const captchaReq = req as CaptchaRequest;
    const startTime = Date.now();
    
    const {
      action,
      required = true,
      minScore,
      skipInDev = false,
      onFailure,
      onSuccess
    } = options;

    try {
      // Skip in development if requested
      if (skipInDev && process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ CAPTCHA verification skipped for ${action} (development mode)`);
        captchaReq.captcha = {
          verified: true,
          score: 1.0,
          riskLevel: 'low',
          action
        };
        return handler(captchaReq, res);
      }

      const clientIP = getClientIP(req);
      const userAgent = req.headers['user-agent'] || 'Unknown';

      // Extract CAPTCHA token from request
      const captchaToken = extractCaptchaToken(req);

      if (required && !captchaToken) {
        await logSecurityEvent({
          type: 'CAPTCHA_TOKEN_MISSING',
          severity: 'medium',
          details: {
            action,
            endpoint: req.url,
            clientIP,
            method: req.method
          },
          metadata: {
            userAgent,
            endpoint: req.url
          }
        });

        const errorResponse = {
          success: false,
          error: 'CAPTCHA verification required',
          code: 'CAPTCHA_REQUIRED',
          action
        };

        onFailure?.(captchaReq, res, errorResponse);
        return res.status(400).json(errorResponse);
      }

      // If token is provided or required, verify it
      if (captchaToken || required) {
        console.log(`🔐 Verifying CAPTCHA for ${action} endpoint`);

        const verificationResult = await CaptchaService.verifyToken(
          captchaToken || '',
          action,
          clientIP
        );

        const processingTime = Date.now() - startTime;

        // Apply custom score threshold if provided
        const customThreshold = minScore !== undefined;
        const scoreThreshold = minScore || (await getCaptchaThreshold(action));
        const meetsCustomThreshold = customThreshold ? 
          (verificationResult.score || 0) >= minScore! : 
          verificationResult.success;

        const finalSuccess = customThreshold ? meetsCustomThreshold : verificationResult.success;

        // Set CAPTCHA verification result on request
        captchaReq.captcha = {
          verified: finalSuccess,
          score: verificationResult.score,
          riskLevel: verificationResult.riskLevel,
          action,
          clientIP
        };

        // Log verification attempt
        await logSecurityEvent({
          type: finalSuccess ? 'CAPTCHA_MIDDLEWARE_SUCCESS' : 'CAPTCHA_MIDDLEWARE_FAILED',
          severity: verificationResult.riskLevel === 'high' ? 'high' : 'low',
          details: {
            action,
            score: verificationResult.score,
            riskLevel: verificationResult.riskLevel,
            success: finalSuccess,
            processingTime,
            clientIP,
            endpoint: req.url,
            method: req.method,
            customThreshold,
            scoreThreshold
          },
          metadata: {
            userAgent,
            endpoint: req.url,
            error: verificationResult.error
          }
        });

        if (!finalSuccess) {
          console.warn(`⚠️ CAPTCHA verification failed for ${action}: ${verificationResult.error}`);

          const errorResponse = {
            success: false,
            error: verificationResult.error || 'CAPTCHA verification failed',
            code: 'CAPTCHA_VERIFICATION_FAILED',
            action,
            score: verificationResult.score,
            riskLevel: verificationResult.riskLevel,
            shouldRetry: verificationResult.shouldChallenge
          };

          onFailure?.(captchaReq, res, errorResponse);
          return res.status(403).json(errorResponse);
        }

        console.log(`✅ CAPTCHA verification successful for ${action}, score: ${verificationResult.score}`);
        onSuccess?.(captchaReq, res, verificationResult);
      }

      // Call the original handler
      return handler(captchaReq, res);

    } catch (error: any) {
      console.error('❌ CAPTCHA middleware error:', error);

      await logSecurityEvent({
        type: 'CAPTCHA_MIDDLEWARE_ERROR',
        severity: 'high',
        details: {
          action,
          error: error.message,
          stack: error.stack,
          endpoint: req.url,
          method: req.method
        },
        metadata: {
          userAgent: req.headers['user-agent'],
          endpoint: req.url
        }
      });

      return res.status(500).json({
        success: false,
        error: 'Internal server error during CAPTCHA verification',
        code: 'CAPTCHA_MIDDLEWARE_ERROR'
      });
    }
  };
}

/**
 * Extract CAPTCHA token from request
 * Checks multiple possible locations for the token
 */
function extractCaptchaToken(req: NextApiRequest): string | null {
  // Check request body
  if (req.body?.captchaToken) {
    return req.body.captchaToken;
  }

  // Check headers
  if (req.headers['x-captcha-token']) {
    return req.headers['x-captcha-token'] as string;
  }

  // Check query parameters (less secure, but supported)
  if (req.query?.captchaToken) {
    return req.query.captchaToken as string;
  }

  return null;
}

/**
 * Get CAPTCHA threshold for action
 */
async function getCaptchaThreshold(action: string): Promise<number> {
  // Import dynamically to avoid circular dependency
  const { CAPTCHA_CONFIG } = await import('../security/captcha');
  return CAPTCHA_CONFIG.actions[action as keyof typeof CAPTCHA_CONFIG.actions] || 0.5;
}

/**
 * Conditional CAPTCHA middleware
 * Only applies CAPTCHA verification based on conditions
 */
export function withConditionalCaptcha(
  handler: ApiHandler,
  options: CaptchaMiddlewareOptions & {
    condition: (req: NextApiRequest) => boolean | Promise<boolean>;
  }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const shouldApplyCaptcha = await options.condition(req);

    if (shouldApplyCaptcha) {
      return withCaptcha(handler, options)(req, res);
    } else {
      // Skip CAPTCHA verification
      const captchaReq = req as CaptchaRequest;
      captchaReq.captcha = {
        verified: true,
        score: 1.0,
        riskLevel: 'low',
        action: options.action
      };
      return handler(captchaReq, res);
    }
  };
}

/**
 * Multiple action CAPTCHA middleware
 * Allows different actions based on request properties
 */
export function withMultiActionCaptcha(
  handler: ApiHandler,
  actions: {
    [key: string]: CaptchaMiddlewareOptions;
  },
  actionSelector: (req: NextApiRequest) => string
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const selectedAction = actionSelector(req);
    const actionOptions = actions[selectedAction];

    if (!actionOptions) {
      return res.status(400).json({
        success: false,
        error: `Invalid action: ${selectedAction}`,
        code: 'INVALID_CAPTCHA_ACTION'
      });
    }

    return withCaptcha(handler, actionOptions)(req, res);
  };
}

/**
 * Rate-limited CAPTCHA middleware
 * Applies stricter CAPTCHA requirements based on rate limiting
 */
export function withRateLimitedCaptcha(
  handler: ApiHandler,
  baseOptions: CaptchaMiddlewareOptions,
  rateLimitOptions: {
    windowMs: number;
    maxRequests: number;
    stricterThreshold?: number; // Applied after rate limit hit
  }
) {
  const requestCounts = new Map<string, {
    count: number;
    resetTime: number;
  }>();

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const clientIP = getClientIP(req);
    const now = Date.now();
    const key = `${clientIP}:${baseOptions.action}`;

    // Check rate limit
    const cached = requestCounts.get(key);
    let isRateLimited = false;

    if (!cached || now > cached.resetTime) {
      // New window
      requestCounts.set(key, {
        count: 1,
        resetTime: now + rateLimitOptions.windowMs
      });
    } else {
      cached.count++;
      if (cached.count > rateLimitOptions.maxRequests) {
        isRateLimited = true;
      }
      requestCounts.set(key, cached);
    }

    // Apply stricter CAPTCHA if rate limited
    const finalOptions = isRateLimited && rateLimitOptions.stricterThreshold ? {
      ...baseOptions,
      minScore: rateLimitOptions.stricterThreshold
    } : baseOptions;

    return withCaptcha(handler, finalOptions)(req, res);
  };
}

export default withCaptcha;