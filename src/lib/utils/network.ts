// Network Utility Functions
// Provides utilities for IP detection, request handling, and network security

import type { NextApiRequest } from 'next';

/**
 * Extract client IP address from request headers
 * Supports various proxy configurations and hosting environments
 */
export function getClientIP(req: NextApiRequest | { headers: { get: (name: string) => string | null } }): string {
  // Handle Next.js 13+ App Router request format
  const getHeader = (name: string): string | null => {
    if ('headers' in req && typeof req.headers.get === 'function') {
      return req.headers.get(name);
    }
    // Handle Next.js Pages API request format
    if ('headers' in req && req.headers) {
      const header = (req.headers as any)[name];
      return Array.isArray(header) ? header[0] : header || null;
    }
    return null;
  };

  // Try various headers that might contain the real IP
  const ipHeaders = [
    'x-forwarded-for',       // Most common proxy header
    'x-real-ip',             // Nginx real IP
    'x-client-ip',           // Apache mod_remoteip
    'cf-connecting-ip',      // Cloudflare
    'x-cluster-client-ip',   // Cluster environments
    'x-forwarded',           // General forwarded
    'forwarded-for',         // Alternative format
    'forwarded',             // RFC 7239 standard
  ];

  for (const header of ipHeaders) {
    const value = getHeader(header);
    if (value) {
      // Handle comma-separated IPs (x-forwarded-for can contain multiple IPs)
      const ips = value.split(',').map(ip => ip.trim());
      const validIP = ips.find(ip => isValidIP(ip) && !isPrivateIP(ip));
      if (validIP) {
        return validIP;
      }
      // If no public IP found, use the first one
      if (ips.length > 0 && isValidIP(ips[0])) {
        return ips[0];
      }
    }
  }

  // Fallback to connection remote address (for Pages API)
  if ('connection' in req && req.connection && 'remoteAddress' in req.connection) {
    const remoteAddress = (req.connection as any).remoteAddress;
    if (remoteAddress && isValidIP(remoteAddress)) {
      return remoteAddress;
    }
  }

  // Fallback to socket remote address (for Pages API)
  if ('socket' in req && req.socket && 'remoteAddress' in req.socket) {
    const remoteAddress = (req.socket as any).remoteAddress;
    if (remoteAddress && isValidIP(remoteAddress)) {
      return remoteAddress;
    }
  }

  // Default fallback
  return 'unknown';
}

/**
 * Validate if a string is a valid IP address (IPv4 or IPv6)
 */
export function isValidIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;

  // Remove any surrounding brackets (IPv6)
  const cleanIP = ip.replace(/^\[|\]$/g, '');

  // Check for IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(cleanIP)) {
    return true;
  }

  // Check for IPv6 (basic validation)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  const ipv6CompressedRegex = /^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{0,4}$/;
  
  return ipv6Regex.test(cleanIP) || ipv6CompressedRegex.test(cleanIP);
}

/**
 * Check if an IP address is in a private network range
 */
export function isPrivateIP(ip: string): boolean {
  if (!isValidIP(ip)) return false;

  // Remove any surrounding brackets (IPv6)
  const cleanIP = ip.replace(/^\[|\]$/g, '');

  // IPv4 private ranges
  if (cleanIP.includes('.')) {
    const parts = cleanIP.split('.').map(Number);
    
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    
    // 127.0.0.0/8 (localhost)
    if (parts[0] === 127) return true;
    
    // 169.254.0.0/16 (link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
  }

  // IPv6 private ranges
  if (cleanIP.includes(':')) {
    // ::1 (localhost)
    if (cleanIP === '::1') return true;
    
    // fc00::/7 (unique local addresses)
    if (cleanIP.toLowerCase().startsWith('fc') || cleanIP.toLowerCase().startsWith('fd')) {
      return true;
    }
    
    // fe80::/10 (link-local)
    if (cleanIP.toLowerCase().startsWith('fe8') || cleanIP.toLowerCase().startsWith('fe9') ||
        cleanIP.toLowerCase().startsWith('fea') || cleanIP.toLowerCase().startsWith('feb')) {
      return true;
    }
  }

  return false;
}

/**
 * Get user agent string from request headers
 */
export function getUserAgent(req: NextApiRequest | { headers: { get: (name: string) => string | null } }): string {
  const getHeader = (name: string): string | null => {
    if ('headers' in req && typeof req.headers.get === 'function') {
      return req.headers.get(name);
    }
    if ('headers' in req && req.headers) {
      const header = (req.headers as any)[name];
      return Array.isArray(header) ? header[0] : header || null;
    }
    return null;
  };

  return getHeader('user-agent') || 'Unknown';
}

/**
 * Check if request is from a mobile device
 */
export function isMobileDevice(userAgent: string): boolean {
  const mobileRegex = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
}

/**
 * Extract country code from Cloudflare headers (if available)
 */
export function getCountryCode(req: NextApiRequest | { headers: { get: (name: string) => string | null } }): string | null {
  const getHeader = (name: string): string | null => {
    if ('headers' in req && typeof req.headers.get === 'function') {
      return req.headers.get(name);
    }
    if ('headers' in req && req.headers) {
      const header = (req.headers as any)[name];
      return Array.isArray(header) ? header[0] : header || null;
    }
    return null;
  };

  // Cloudflare country header
  const cfCountry = getHeader('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry.toUpperCase();
  }

  // Other possible country headers
  const countryHeaders = [
    'x-country-code',
    'x-geoip-country',
    'x-forwarded-country',
  ];

  for (const header of countryHeaders) {
    const value = getHeader(header);
    if (value && value.length === 2) {
      return value.toUpperCase();
    }
  }

  return null;
}

/**
 * Create a request fingerprint for rate limiting and security
 */
export function createRequestFingerprint(
  req: NextApiRequest | { headers: { get: (name: string) => string | null } }
): string {
  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);
  const country = getCountryCode(req) || 'unknown';
  
  // Create a simple hash-like fingerprint
  const fingerprint = `${clientIP}:${userAgent.substring(0, 50)}:${country}`;
  
  // Simple hash function (for demonstration - in production, consider using crypto)
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Security analysis of the request
 */
export interface RequestSecurityInfo {
  clientIP: string;
  isPrivateIP: boolean;
  userAgent: string;
  isMobile: boolean;
  country: string | null;
  fingerprint: string;
  riskScore: number; // 0-1, where 1 is highest risk
  riskFactors: string[];
}

export function analyzeRequestSecurity(
  req: NextApiRequest | { headers: { get: (name: string) => string | null } }
): RequestSecurityInfo {
  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);
  const country = getCountryCode(req);
  const fingerprint = createRequestFingerprint(req);
  
  const riskFactors: string[] = [];
  let riskScore = 0;

  // Unknown IP
  if (clientIP === 'unknown') {
    riskFactors.push('Unknown IP address');
    riskScore += 0.3;
  }

  // Private IP (might indicate proxy/VPN)
  const isPrivate = isPrivateIP(clientIP);
  if (isPrivate) {
    riskFactors.push('Private IP address');
    riskScore += 0.1;
  }

  // Suspicious user agent patterns
  const userAgentLower = userAgent.toLowerCase();
  const suspiciousPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'python', 'curl', 'wget', 'http', 'request'
  ];
  
  if (suspiciousPatterns.some(pattern => userAgentLower.includes(pattern))) {
    riskFactors.push('Suspicious user agent');
    riskScore += 0.4;
  }

  // Very short or very long user agent
  if (userAgent.length < 10) {
    riskFactors.push('Unusually short user agent');
    riskScore += 0.2;
  } else if (userAgent.length > 500) {
    riskFactors.push('Unusually long user agent');
    riskScore += 0.3;
  }

  // Empty or generic user agent
  if (userAgent === 'Unknown' || userAgent === 'Mozilla/5.0') {
    riskFactors.push('Generic user agent');
    riskScore += 0.2;
  }

  // Cap risk score at 1.0
  riskScore = Math.min(riskScore, 1.0);

  return {
    clientIP,
    isPrivateIP: isPrivate,
    userAgent,
    isMobile: isMobileDevice(userAgent),
    country,
    fingerprint,
    riskScore,
    riskFactors
  };
}

export default {
  getClientIP,
  isValidIP,
  isPrivateIP,
  getUserAgent,
  isMobileDevice,
  getCountryCode,
  createRequestFingerprint,
  analyzeRequestSecurity
};