// Security Audit Logging System
// Provides comprehensive logging for security events, CAPTCHA verification, and suspicious activities

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp?: string;
  id?: string;
}

interface AuditLogEntry extends SecurityEvent {
  id: string;
  timestamp: string;
}

// In-memory storage for development (in production, use database/external logging service)
const auditLogs: AuditLogEntry[] = [];
const MAX_LOGS = 10000; // Maximum logs to keep in memory

/**
 * Log a security event
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<string> {
  const logEntry: AuditLogEntry = {
    ...event,
    id: generateLogId(),
    timestamp: event.timestamp || new Date().toISOString()
  };

  try {
    // Add to in-memory storage
    auditLogs.push(logEntry);
    
    // Keep only the most recent logs
    if (auditLogs.length > MAX_LOGS) {
      auditLogs.splice(0, auditLogs.length - MAX_LOGS);
    }

    // Console logging for development
    const logLevel = getLogLevel(event.severity);
    const message = `[SECURITY] ${event.type}: ${JSON.stringify(event.details)}`;
    
    switch (logLevel) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'info':
        console.info(message);
        break;
      default:
        console.log(message);
    }

    // In production, you would also:
    // - Send to external logging service (e.g., Winston, LogRocket, Sentry)
    // - Store in database for analysis
    // - Send alerts for high-severity events
    // - Integrate with monitoring systems

    await sendToExternalLogging(logEntry);

    return logEntry.id;

  } catch (error) {
    console.error('❌ Failed to log security event:', error);
    // Don't throw - logging failures shouldn't break the application
    return 'log-failed';
  }
}

/**
 * Get security audit logs with filtering
 */
export function getSecurityLogs(filters?: {
  type?: string;
  severity?: string;
  since?: Date;
  limit?: number;
}): AuditLogEntry[] {
  let filteredLogs = [...auditLogs];

  if (filters) {
    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => 
        log.type.toLowerCase().includes(filters.type!.toLowerCase())
      );
    }

    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => 
        log.severity === filters.severity
      );
    }

    if (filters.since) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= filters.since!
      );
    }

    if (filters.limit) {
      filteredLogs = filteredLogs.slice(-filters.limit);
    }
  }

  return filteredLogs.reverse(); // Most recent first
}

/**
 * Get security statistics
 */
export function getSecurityStatistics(timeframe?: Date): {
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  recentEvents: AuditLogEntry[];
  topRiskIPs: { ip: string; events: number }[];
} {
  const since = timeframe || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
  const recentLogs = getSecurityLogs({ since });

  const bySeverity: Record<string, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  };

  const byType: Record<string, number> = {};
  const ipCounts: Record<string, number> = {};

  recentLogs.forEach(log => {
    // Count by severity
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;

    // Count by type
    byType[log.type] = (byType[log.type] || 0) + 1;

    // Count by IP
    const clientIP = log.details.clientIP || log.metadata?.clientIP;
    if (clientIP && clientIP !== 'unknown') {
      ipCounts[clientIP] = (ipCounts[clientIP] || 0) + 1;
    }
  });

  // Get top risk IPs
  const topRiskIPs = Object.entries(ipCounts)
    .map(([ip, events]) => ({ ip, events }))
    .sort((a, b) => b.events - a.events)
    .slice(0, 10);

  return {
    total: recentLogs.length,
    bySeverity,
    byType,
    recentEvents: recentLogs.slice(0, 50), // Last 50 events
    topRiskIPs
  };
}

/**
 * Check for suspicious patterns
 */
export function detectSuspiciousActivity(): {
  alerts: string[];
  recommendations: string[];
} {
  const stats = getSecurityStatistics();
  const alerts: string[] = [];
  const recommendations: string[] = [];

  // High rate of CAPTCHA failures
  const captchaFailures = stats.byType['CAPTCHA_VERIFICATION_FAILED'] || 0;
  if (captchaFailures > 100) {
    alerts.push(`High CAPTCHA failure rate: ${captchaFailures} failures in 24h`);
    recommendations.push('Consider adjusting CAPTCHA thresholds or investigating bot activity');
  }

  // High rate of missing CAPTCHA tokens
  const missingCaptcha = stats.byType['CAPTCHA_TOKEN_MISSING'] || 0;
  if (missingCaptcha > 50) {
    alerts.push(`Many requests missing CAPTCHA tokens: ${missingCaptcha} in 24h`);
    recommendations.push('Ensure all client applications are properly sending CAPTCHA tokens');
  }

  // High critical/high severity events
  const highSeverityCount = stats.bySeverity.high + stats.bySeverity.critical;
  if (highSeverityCount > 20) {
    alerts.push(`High number of critical security events: ${highSeverityCount} in 24h`);
    recommendations.push('Review security logs immediately and consider additional protective measures');
  }

  // Rate limiting triggered frequently
  const rateLimitEvents = stats.byType['CAPTCHA_RATE_LIMIT_EXCEEDED'] || 0;
  if (rateLimitEvents > 30) {
    alerts.push(`Rate limiting frequently triggered: ${rateLimitEvents} times in 24h`);
    recommendations.push('Review rate limiting configuration and monitor for bot attacks');
  }

  // Single IP with many events
  if (stats.topRiskIPs.length > 0 && stats.topRiskIPs[0].events > 50) {
    alerts.push(`High activity from single IP: ${stats.topRiskIPs[0].ip} (${stats.topRiskIPs[0].events} events)`);
    recommendations.push('Consider blocking or additional monitoring for suspicious IP addresses');
  }

  return { alerts, recommendations };
}

/**
 * Generate a unique log ID
 */
function generateLogId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `audit_${timestamp}_${random}`;
}

/**
 * Map severity to console log level
 */
function getLogLevel(severity: string): 'error' | 'warn' | 'info' | 'log' {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warn';
    case 'low':
      return 'info';
    default:
      return 'log';
  }
}

/**
 * Send logs to external logging service (stub for production implementation)
 */
async function sendToExternalLogging(logEntry: AuditLogEntry): Promise<void> {
  // In production, implement integrations with:
  
  // 1. Winston Logger
  // logger.log(logEntry.severity, logEntry.type, logEntry);

  // 2. Sentry for error tracking
  // if (logEntry.severity === 'critical' || logEntry.severity === 'high') {
  //   Sentry.addBreadcrumb({
  //     message: logEntry.type,
  //     level: 'error',
  //     data: logEntry.details
  //   });
  // }

  // 3. External monitoring services
  // await fetch('/api/external-logging', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(logEntry)
  // });

  // 4. Database storage
  // await prisma.securityLog.create({
  //   data: {
  //     id: logEntry.id,
  //     type: logEntry.type,
  //     severity: logEntry.severity,
  //     details: JSON.stringify(logEntry.details),
  //     metadata: JSON.stringify(logEntry.metadata),
  //     timestamp: new Date(logEntry.timestamp)
  //   }
  // });

  // For development, just return
  return Promise.resolve();
}

/**
 * Clean up old audit logs (call periodically)
 */
export function cleanupOldLogs(olderThan: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)): number {
  const initialLength = auditLogs.length;
  
  // Remove logs older than specified date
  for (let i = auditLogs.length - 1; i >= 0; i--) {
    if (new Date(auditLogs[i].timestamp) < olderThan) {
      auditLogs.splice(i, 1);
    }
  }

  const removedCount = initialLength - auditLogs.length;
  
  if (removedCount > 0) {
    console.log(`🧹 Security audit cleanup: ${removedCount} old logs removed`);
  }

  return removedCount;
}

/**
 * Export logs for analysis (development utility)
 */
export function exportSecurityLogs(format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
    const headers = 'ID,Timestamp,Type,Severity,ClientIP,Details';
    const rows = auditLogs.map(log => {
      const clientIP = log.details.clientIP || log.metadata?.clientIP || 'unknown';
      const details = JSON.stringify(log.details).replace(/"/g, '""'); // Escape quotes for CSV
      return `${log.id},${log.timestamp},${log.type},${log.severity},${clientIP},"${details}"`;
    });
    return [headers, ...rows].join('\n');
  }

  return JSON.stringify(auditLogs, null, 2);
}

// Automated cleanup every hour
setInterval(() => {
  cleanupOldLogs();
}, 60 * 60 * 1000);

export default {
  logSecurityEvent,
  getSecurityLogs,
  getSecurityStatistics,
  detectSuspiciousActivity,
  cleanupOldLogs,
  exportSecurityLogs
};