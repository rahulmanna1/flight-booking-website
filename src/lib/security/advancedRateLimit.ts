// Advanced Rate Limiting and Abuse Protection System
// Implements tiered rate limiting, abuse detection, and automatic blocking

interface RateLimitTier {
  name: string;
  limits: {
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  description: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  tier: string;
  blocked: boolean;
  blockExpiry?: number;
  violations: number;
  firstSeen: number;
  lastSeen: number;
}

interface AbusePattern {
  rapidRequests: boolean;
  identicalRequests: boolean;
  suspiciousUserAgent: boolean;
  invalidTokenAttempts: boolean;
  geolocationAnomalies: boolean;
  score: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  tier: string;
  blocked?: boolean;
  blockReason?: string;
  retryAfter?: number;
  abuseScore?: number;
}

// Rate limiting tiers for different types of requests
const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  // Public endpoints (search, health checks)
  public: {
    name: 'Public API',
    limits: {
      perMinute: 60,
      perHour: 1000,
      perDay: 5000
    },
    description: 'Public endpoints like search and health checks'
  },
  
  // Authenticated general requests
  authenticated: {
    name: 'Authenticated User',
    limits: {
      perMinute: 120,
      perHour: 2000,
      perDay: 10000
    },
    description: 'General authenticated requests'
  },
  
  // Booking operations (more restrictive)
  booking: {
    name: 'Booking Operations',
    limits: {
      perMinute: 10,
      perHour: 50,
      perDay: 200
    },
    description: 'Booking creation and modification'
  },
  
  // Payment operations (most restrictive)
  payment: {
    name: 'Payment Operations',
    limits: {
      perMinute: 5,
      perHour: 20,
      perDay: 100
    },
    description: 'Payment processing and refunds'
  },
  
  // Admin operations
  admin: {
    name: 'Admin Operations',
    limits: {
      perMinute: 200,
      perHour: 5000,
      perDay: 20000
    },
    description: 'Administrative operations'
  }
};

// Suspicious patterns configuration
const ABUSE_DETECTION_CONFIG = {
  RAPID_REQUEST_THRESHOLD: 30, // requests per minute
  IDENTICAL_REQUEST_THRESHOLD: 5, // same request repeated
  SUSPICIOUS_USER_AGENTS: [
    'curl', 'wget', 'python-requests', 'bot', 'crawler', 'scanner',
    'postman', 'insomnia', 'httpie'
  ],
  GEOLOCATION_CHANGE_THRESHOLD: 1000, // km within 1 hour
  MAX_VIOLATIONS_BEFORE_BLOCK: 3,
  BLOCK_DURATION_MINUTES: 60, // 1 hour initial block
  MAX_BLOCK_DURATION_HOURS: 24, // 24 hours maximum
};

// In-memory stores (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();
const requestHistory = new Map<string, Array<{ timestamp: number; endpoint: string; userAgent?: string }>>();
const blockedIPs = new Map<string, { reason: string; expiry: number; violations: number }>();

class AdvancedRateLimit {
  
  // Main rate limiting function with tiered protection
  static async checkRateLimit(options: {
    key: string;
    tier: keyof typeof RATE_LIMIT_TIERS;
    endpoint: string;
    userAgent?: string;
    userId?: string;
    ipAddress?: string;
  }): Promise<RateLimitResult> {
    const { key, tier, endpoint, userAgent, userId, ipAddress } = options;
    const now = Date.now();
    
    // Check if IP is blocked
    if (ipAddress && this.isIPBlocked(ipAddress)) {
      const blockInfo = blockedIPs.get(ipAddress)!;
      return {
        allowed: false,
        limit: 0,
        remaining: 0,
        resetTime: blockInfo.expiry,
        tier,
        blocked: true,
        blockReason: blockInfo.reason,
        retryAfter: blockInfo.expiry
      };
    }
    
    // Get tier configuration
    const tierConfig = RATE_LIMIT_TIERS[tier];
    if (!tierConfig) {
      throw new Error(`Invalid rate limit tier: ${tier}`);
    }
    
    // Track request history for abuse detection
    if (ipAddress) {
      this.trackRequest(ipAddress, endpoint, userAgent);
    }
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + (60 * 1000), // 1 minute window
        tier,
        blocked: false,
        violations: 0,
        firstSeen: now,
        lastSeen: now
      };
      rateLimitStore.set(key, entry);
    }
    
    // Update last seen
    entry.lastSeen = now;
    
    // Check if window has expired
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + (60 * 1000);
    }
    
    // Detect abuse patterns
    const abuseScore = ipAddress ? this.detectAbusePatterns(ipAddress, endpoint, userAgent) : 0;
    
    // Apply dynamic rate limiting based on abuse score
    const adjustedLimits = this.adjustLimitsForAbuseScore(tierConfig.limits, abuseScore);
    
    // Check minute limit
    if (entry.count >= adjustedLimits.perMinute) {
      entry.violations++;
      
      // Check if we should block this key/IP
      if (entry.violations >= ABUSE_DETECTION_CONFIG.MAX_VIOLATIONS_BEFORE_BLOCK && ipAddress) {
        this.blockIP(ipAddress, 'Rate limit violations', entry.violations);
      }
      
      return {
        allowed: false,
        limit: adjustedLimits.perMinute,
        remaining: 0,
        resetTime: entry.resetTime,
        tier,
        abuseScore,
        retryAfter: entry.resetTime
      };
    }
    
    // Increment counter
    entry.count++;
    
    return {
      allowed: true,
      limit: adjustedLimits.perMinute,
      remaining: Math.max(0, adjustedLimits.perMinute - entry.count),
      resetTime: entry.resetTime,
      tier,
      abuseScore
    };
  }
  
  // Track request history for pattern analysis
  private static trackRequest(ipAddress: string, endpoint: string, userAgent?: string): void {
    let history = requestHistory.get(ipAddress);
    if (!history) {
      history = [];
      requestHistory.set(ipAddress, history);
    }
    
    const now = Date.now();
    history.push({ timestamp: now, endpoint, userAgent });
    
    // Keep only last hour of requests
    const oneHourAgo = now - (60 * 60 * 1000);
    history = history.filter(req => req.timestamp > oneHourAgo);
    requestHistory.set(ipAddress, history);
  }
  
  // Detect abuse patterns
  private static detectAbusePatterns(
    ipAddress: string, 
    endpoint: string, 
    userAgent?: string
  ): number {
    const history = requestHistory.get(ipAddress) || [];
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const recentRequests = history.filter(req => req.timestamp > oneMinuteAgo);
    
    const patterns: AbusePattern = {
      rapidRequests: recentRequests.length > ABUSE_DETECTION_CONFIG.RAPID_REQUEST_THRESHOLD,
      identicalRequests: this.detectIdenticalRequests(history, endpoint),
      suspiciousUserAgent: this.isSuspiciousUserAgent(userAgent),
      invalidTokenAttempts: this.detectInvalidTokenAttempts(history),
      geolocationAnomalies: false, // Would integrate with geolocation service
      score: 0
    };
    
    // Calculate abuse score
    let score = 0;
    if (patterns.rapidRequests) score += 30;
    if (patterns.identicalRequests) score += 25;
    if (patterns.suspiciousUserAgent) score += 20;
    if (patterns.invalidTokenAttempts) score += 35;
    if (patterns.geolocationAnomalies) score += 40;
    
    patterns.score = Math.min(score, 100);
    
    // Log high-risk patterns
    if (patterns.score > 50) {
      console.warn(`🚨 High abuse score detected: IP ${ipAddress}, Score: ${patterns.score}`, patterns);
    }
    
    return patterns.score;
  }
  
  // Detect identical request patterns
  private static detectIdenticalRequests(
    history: Array<{ timestamp: number; endpoint: string; userAgent?: string }>, 
    currentEndpoint: string
  ): boolean {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const recentSameEndpoint = history.filter(
      req => req.timestamp > fiveMinutesAgo && req.endpoint === currentEndpoint
    );
    
    return recentSameEndpoint.length > ABUSE_DETECTION_CONFIG.IDENTICAL_REQUEST_THRESHOLD;
  }
  
  // Check for suspicious user agents
  private static isSuspiciousUserAgent(userAgent?: string): boolean {
    if (!userAgent) return true; // Missing user agent is suspicious
    
    const lowercaseUA = userAgent.toLowerCase();
    return ABUSE_DETECTION_CONFIG.SUSPICIOUS_USER_AGENTS.some(
      pattern => lowercaseUA.includes(pattern)
    );
  }
  
  // Detect repeated invalid token attempts
  private static detectInvalidTokenAttempts(
    history: Array<{ timestamp: number; endpoint: string; userAgent?: string }>
  ): boolean {
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    const authEndpoints = history.filter(
      req => req.timestamp > tenMinutesAgo && 
      (req.endpoint.includes('/auth') || req.endpoint.includes('/login'))
    );
    
    return authEndpoints.length > 10; // More than 10 auth attempts in 10 minutes
  }
  
  // Adjust rate limits based on abuse score
  private static adjustLimitsForAbuseScore(
    baseLimits: { perMinute: number; perHour: number; perDay: number }, 
    abuseScore: number
  ): { perMinute: number; perHour: number; perDay: number } {
    // Reduce limits for higher abuse scores
    const reductionFactor = Math.max(0.1, 1 - (abuseScore / 200));
    
    return {
      perMinute: Math.floor(baseLimits.perMinute * reductionFactor),
      perHour: Math.floor(baseLimits.perHour * reductionFactor),
      perDay: Math.floor(baseLimits.perDay * reductionFactor)
    };
  }
  
  // Block an IP address
  private static blockIP(ipAddress: string, reason: string, violations: number): void {
    const existingBlock = blockedIPs.get(ipAddress);
    const baseBlockDuration = ABUSE_DETECTION_CONFIG.BLOCK_DURATION_MINUTES * 60 * 1000;
    
    // Exponential backoff for repeat offenders
    const blockDurationMultiplier = existingBlock ? 
      Math.min(Math.pow(2, violations), ABUSE_DETECTION_CONFIG.MAX_BLOCK_DURATION_HOURS) : 1;
    
    const blockDuration = baseBlockDuration * blockDurationMultiplier;
    const expiry = Date.now() + blockDuration;
    
    blockedIPs.set(ipAddress, {
      reason,
      expiry,
      violations: existingBlock ? existingBlock.violations + 1 : violations
    });
    
    console.warn(`🔒 IP blocked: ${ipAddress}, Reason: ${reason}, Duration: ${blockDurationMultiplier}x base, Expires: ${new Date(expiry).toISOString()}`);
  }
  
  // Check if IP is currently blocked
  private static isIPBlocked(ipAddress: string): boolean {
    const blockInfo = blockedIPs.get(ipAddress);
    if (!blockInfo) return false;
    
    const now = Date.now();
    if (now > blockInfo.expiry) {
      // Block has expired, remove it
      blockedIPs.delete(ipAddress);
      return false;
    }
    
    return true;
  }
  
  // Unblock an IP address (for admin use)
  static unblockIP(ipAddress: string): boolean {
    const existed = blockedIPs.has(ipAddress);
    blockedIPs.delete(ipAddress);
    
    if (existed) {
      console.log(`🔓 IP unblocked: ${ipAddress}`);
    }
    
    return existed;
  }
  
  // Get current rate limit status for a key
  static getRateLimitStatus(key: string): {
    exists: boolean;
    entry?: RateLimitEntry;
    timeUntilReset?: number;
  } {
    const entry = rateLimitStore.get(key);
    if (!entry) return { exists: false };
    
    const now = Date.now();
    return {
      exists: true,
      entry: { ...entry },
      timeUntilReset: Math.max(0, entry.resetTime - now)
    };
  }
  
  // Get abuse statistics for monitoring
  static getAbuseStatistics(): {
    totalRequests: number;
    blockedIPs: number;
    activeRateLimits: number;
    topAbusers: Array<{ ip: string; score: number; requests: number }>;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Count total requests in the last hour
    let totalRequests = 0;
    const ipStats = new Map<string, { score: number; requests: number }>();
    
    for (const [ip, history] of requestHistory.entries()) {
      const recentRequests = history.filter(req => req.timestamp > oneHourAgo);
      totalRequests += recentRequests.length;
      
      if (recentRequests.length > 0) {
        const score = this.detectAbusePatterns(ip, '', '');
        ipStats.set(ip, { score, requests: recentRequests.length });
      }
    }
    
    // Get top abusers
    const topAbusers = Array.from(ipStats.entries())
      .map(([ip, stats]) => ({ ip, ...stats }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    return {
      totalRequests,
      blockedIPs: blockedIPs.size,
      activeRateLimits: rateLimitStore.size,
      topAbusers
    };
  }
  
  // Clean up expired entries
  static cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    // Clean up rate limit entries
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime && entry.count === 0) {
        rateLimitStore.delete(key);
        cleaned++;
      }
    }
    
    // Clean up old request history
    for (const [ip, history] of requestHistory.entries()) {
      const oneHourAgo = now - (60 * 60 * 1000);
      const filteredHistory = history.filter(req => req.timestamp > oneHourAgo);
      
      if (filteredHistory.length === 0) {
        requestHistory.delete(ip);
      } else if (filteredHistory.length < history.length) {
        requestHistory.set(ip, filteredHistory);
      }
    }
    
    // Clean up expired IP blocks
    for (const [ip, blockInfo] of blockedIPs.entries()) {
      if (now > blockInfo.expiry) {
        blockedIPs.delete(ip);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Rate limit cleanup: ${cleaned} entries removed`);
    }
  }
  
  // Get rate limit configuration for a tier
  static getTierConfiguration(tier: keyof typeof RATE_LIMIT_TIERS): RateLimitTier | null {
    return RATE_LIMIT_TIERS[tier] || null;
  }
  
  // Update tier configuration (for admin use)
  static updateTierConfiguration(
    tier: keyof typeof RATE_LIMIT_TIERS, 
    updates: Partial<RateLimitTier>
  ): boolean {
    if (!RATE_LIMIT_TIERS[tier]) return false;
    
    RATE_LIMIT_TIERS[tier] = { ...RATE_LIMIT_TIERS[tier], ...updates };
    console.log(`⚙️ Rate limit tier updated: ${tier}`, updates);
    
    return true;
  }
}

// Automated cleanup every 5 minutes
setInterval(() => {
  AdvancedRateLimit.cleanup();
}, 5 * 60 * 1000);

export default AdvancedRateLimit;
export type { 
  RateLimitResult, 
  RateLimitTier, 
  AbusePattern
};
export {
  RATE_LIMIT_TIERS,
  ABUSE_DETECTION_CONFIG
};
