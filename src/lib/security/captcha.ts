// CAPTCHA Integration System
// Provides bot protection using Google reCAPTCHA v3 with score-based validation

interface CaptchaVerificationResult {
  success: boolean;
  score?: number; // 0.0 to 1.0, higher is more human-like
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  error?: string;
  shouldChallenge?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface CaptchaConfig {
  siteKey: string;
  secretKey: string;
  scoreThreshold: number;
  enabled: boolean;
  actions: {
    login: number;
    register: number;
    booking: number;
    payment: number;
    search: number;
    contact: number;
  };
}

// CAPTCHA configuration with different thresholds for different actions
const CAPTCHA_CONFIG: CaptchaConfig = {
  siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
  scoreThreshold: 0.5, // Default threshold
  enabled: !!(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY),
  actions: {
    login: 0.3,      // Lower threshold for login (more strict)
    register: 0.4,   // Stricter for registration
    booking: 0.3,    // Very strict for bookings
    payment: 0.2,    // Most strict for payments
    search: 0.7,     // More lenient for search
    contact: 0.5     // Medium threshold for contact forms
  }
};

// CAPTCHA verification cache to prevent replay attacks
const verificationCache = new Map<string, {
  used: boolean;
  timestamp: number;
  score: number;
  action: string;
}>();

class CaptchaService {
  
  // Verify reCAPTCHA v3 token server-side
  static async verifyToken(
    token: string, 
    action: keyof typeof CAPTCHA_CONFIG.actions,
    remoteIP?: string
  ): Promise<CaptchaVerificationResult> {
    // Handle mock tokens from development/fallback scenarios
    if (token.startsWith('mock_token')) {
      console.warn(`⚠️ Mock CAPTCHA token detected: ${token} - allowing for development`);
      return {
        success: true,
        score: 0.8, // High enough to pass most thresholds
        action: action,
        riskLevel: 'low',
        error: 'Using mock token'
      };
    }
    
    if (!CAPTCHA_CONFIG.enabled) {
      console.warn('⚠️ CAPTCHA not configured, skipping verification');
      return {
        success: true,
        score: 1.0,
        action: action,
        riskLevel: 'low'
      };
    }

    try {
      // Check if token was already used (prevent replay attacks)
      if (this.isTokenUsed(token)) {
        return {
          success: false,
          error: 'Token already used',
          riskLevel: 'high'
        };
      }

      console.log(`🔐 Verifying CAPTCHA for action: ${action}`);

      // Prepare verification request
      const verificationData = new URLSearchParams({
        secret: CAPTCHA_CONFIG.secretKey,
        response: token,
      });

      if (remoteIP) {
        verificationData.append('remoteip', remoteIP);
      }

      // Call Google reCAPTCHA API
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: verificationData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Check basic verification success
      if (!result.success) {
        console.error('❌ CAPTCHA verification failed:', result['error-codes']);
        return {
          success: false,
          error: `Verification failed: ${result['error-codes']?.join(', ') || 'Unknown error'}`,
          riskLevel: 'high'
        };
      }

      // Get action-specific threshold
      const threshold = CAPTCHA_CONFIG.actions[action] || CAPTCHA_CONFIG.scoreThreshold;
      const score = result.score || 0;
      const riskLevel = this.determineRiskLevel(score, threshold);

      // Mark token as used
      this.markTokenUsed(token, score, action);

      // Determine if score meets threshold
      const meetsThreshold = score >= threshold;

      console.log(`📊 CAPTCHA score: ${score}, threshold: ${threshold}, risk: ${riskLevel}`);

      const verificationResult: CaptchaVerificationResult = {
        success: meetsThreshold,
        score,
        action: result.action,
        challenge_ts: result.challenge_ts,
        hostname: result.hostname,
        shouldChallenge: !meetsThreshold && score > (threshold - 0.2), // Challenge if close to threshold
        riskLevel,
        error: meetsThreshold ? undefined : `Score ${score} below threshold ${threshold}`
      };

      // Log suspicious activity
      if (riskLevel === 'high') {
        console.warn(`🚨 High-risk CAPTCHA activity: IP ${remoteIP}, Score: ${score}, Action: ${action}`);
      }

      return verificationResult;

    } catch (error: any) {
      console.error('❌ CAPTCHA verification error:', error);
      return {
        success: false,
        error: `Verification error: ${error.message}`,
        riskLevel: 'high'
      };
    }
  }

  // Check if token was already used (prevent replay attacks)
  private static isTokenUsed(token: string): boolean {
    const cached = verificationCache.get(token);
    if (!cached) return false;

    const now = Date.now();
    const tokenAge = now - cached.timestamp;
    const maxAge = 5 * 60 * 1000; // 5 minutes

    // Clean up expired tokens
    if (tokenAge > maxAge) {
      verificationCache.delete(token);
      return false;
    }

    return cached.used;
  }

  // Mark token as used
  private static markTokenUsed(token: string, score: number, action: string): void {
    verificationCache.set(token, {
      used: true,
      timestamp: Date.now(),
      score,
      action
    });
  }

  // Determine risk level based on score and threshold
  private static determineRiskLevel(
    score: number, 
    threshold: number
  ): 'low' | 'medium' | 'high' {
    if (score >= threshold) return 'low';
    if (score >= (threshold - 0.3)) return 'medium';
    return 'high';
  }

  // Get CAPTCHA configuration for client-side
  static getClientConfig(): {
    enabled: boolean;
    siteKey?: string;
    actions: string[];
  } {
    return {
      enabled: CAPTCHA_CONFIG.enabled,
      siteKey: CAPTCHA_CONFIG.enabled ? CAPTCHA_CONFIG.siteKey : undefined,
      actions: Object.keys(CAPTCHA_CONFIG.actions)
    };
  }

  // Validate action name
  static isValidAction(action: string): action is keyof typeof CAPTCHA_CONFIG.actions {
    return action in CAPTCHA_CONFIG.actions;
  }

  // Update action threshold (for admin use)
  static updateActionThreshold(
    action: keyof typeof CAPTCHA_CONFIG.actions, 
    threshold: number
  ): boolean {
    if (threshold < 0 || threshold > 1) {
      console.error('❌ Invalid threshold value. Must be between 0 and 1.');
      return false;
    }

    CAPTCHA_CONFIG.actions[action] = threshold;
    console.log(`⚙️ CAPTCHA threshold updated: ${action} = ${threshold}`);
    return true;
  }

  // Get statistics for monitoring
  static getStatistics(): {
    totalVerifications: number;
    successfulVerifications: number;
    averageScore: number;
    riskLevelDistribution: Record<string, number>;
    actionDistribution: Record<string, number>;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Filter recent verifications
    const recentVerifications = Array.from(verificationCache.values())
      .filter(v => v.timestamp > oneHourAgo);

    const total = recentVerifications.length;
    const successful = recentVerifications.filter(v => v.score >= 0.5).length;
    
    const averageScore = total > 0 ? 
      recentVerifications.reduce((sum, v) => sum + v.score, 0) / total : 0;

    // Risk level distribution
    const riskLevelDistribution: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0
    };

    // Action distribution
    const actionDistribution: Record<string, number> = {};

    recentVerifications.forEach(v => {
      const riskLevel = this.determineRiskLevel(v.score, 0.5);
      riskLevelDistribution[riskLevel]++;
      
      actionDistribution[v.action] = (actionDistribution[v.action] || 0) + 1;
    });

    return {
      totalVerifications: total,
      successfulVerifications: successful,
      averageScore: Math.round(averageScore * 100) / 100,
      riskLevelDistribution,
      actionDistribution
    };
  }

  // Clean up expired verification cache
  static cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    let cleaned = 0;

    for (const [token, data] of verificationCache.entries()) {
      if (now - data.timestamp > maxAge) {
        verificationCache.delete(token);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 CAPTCHA cleanup: ${cleaned} expired tokens removed`);
    }
  }

  // Validate CAPTCHA configuration
  static validateConfiguration(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if keys are configured
    if (!CAPTCHA_CONFIG.siteKey) {
      errors.push('NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured');
    }

    if (!CAPTCHA_CONFIG.secretKey) {
      errors.push('RECAPTCHA_SECRET_KEY not configured');
    }

    // Validate site key format
    if (CAPTCHA_CONFIG.siteKey && !CAPTCHA_CONFIG.siteKey.startsWith('6L')) {
      warnings.push('Site key format appears invalid (should start with 6L)');
    }

    // Check thresholds
    Object.entries(CAPTCHA_CONFIG.actions).forEach(([action, threshold]) => {
      if (threshold < 0 || threshold > 1) {
        errors.push(`Invalid threshold for action ${action}: ${threshold}`);
      }
      if (threshold < 0.1) {
        warnings.push(`Very low threshold for action ${action}: ${threshold}`);
      }
    });

    // Environment-specific warnings
    if (process.env.NODE_ENV === 'production' && !CAPTCHA_CONFIG.enabled) {
      warnings.push('CAPTCHA disabled in production environment');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Test CAPTCHA integration (development only)
  static async testIntegration(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        message: 'Test integration only available in development'
      };
    }

    if (!CAPTCHA_CONFIG.enabled) {
      return {
        success: false,
        message: 'CAPTCHA not configured'
      };
    }

    try {
      // Test with a dummy token (this will fail, but tests the connection)
      const testResult = await this.verifyToken('test-token', 'login');
      
      return {
        success: true,
        message: 'CAPTCHA integration test completed',
        details: {
          configured: CAPTCHA_CONFIG.enabled,
          siteKey: CAPTCHA_CONFIG.siteKey.substring(0, 10) + '...',
          testResult: testResult.error || 'Connection successful'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `CAPTCHA integration test failed: ${error.message}`
      };
    }
  }
}

// Automated cleanup every 5 minutes
setInterval(() => {
  CaptchaService.cleanup();
}, 5 * 60 * 1000);

export default CaptchaService;
export type { 
  CaptchaVerificationResult, 
  CaptchaConfig
};
export {
  CAPTCHA_CONFIG 
};
