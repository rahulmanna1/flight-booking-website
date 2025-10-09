// Simple Rate Limiting Implementation
// For production, consider using Redis or a dedicated service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  key: string;
  limit: number;
  window: number; // in milliseconds
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

const cleanupExpiredEntries = () => {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  
  lastCleanup = now;
  console.log(`🧹 Rate limit cleanup completed. Entries: ${rateLimitStore.size}`);
};

const rateLimit = async (options: RateLimitOptions): Promise<RateLimitResult> => {
  const { key, limit, window } = options;
  const now = Date.now();
  
  // Clean up expired entries
  cleanupExpiredEntries();
  
  // Get existing entry or create new one
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + window
    };
    rateLimitStore.set(key, entry);
  }
  
  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetTime: entry.resetTime
  };
};

export default rateLimit;
export type { RateLimitOptions, RateLimitResult };
