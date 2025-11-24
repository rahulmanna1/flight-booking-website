import { PrismaClient, AuditCategory, AuditSeverity } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogData {
  action: string;
  category: AuditCategory;
  severity?: AuditSeverity;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        category: data.category,
        severity: data.severity || 'INFO',
        userId: data.userId || null,
        userEmail: data.userEmail || null,
        userRole: data.userRole || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        endpoint: data.endpoint || null,
        method: data.method || null,
        details: data.details ? JSON.stringify(data.details) : '{}',
        metadata: data.metadata ? JSON.stringify(data.metadata) : '{}',
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to prevent blocking the main operation
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  category?: string;
  severity?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};

  if (filters.category && filters.category !== 'ALL') {
    where.category = filters.category;
  }

  if (filters.severity && filters.severity !== 'ALL') {
    where.severity = filters.severity;
  }

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const [logs, count] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, count };
}

export default {
  createAuditLog,
  getAuditLogs,
};
