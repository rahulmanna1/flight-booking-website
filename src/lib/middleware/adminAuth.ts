/**
 * Admin Authentication Middleware
 * Verifies user has admin privileges for protected routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-prisma';
import { prisma } from '@/lib/prisma';

export interface AdminAuthResult {
  userId: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isSuperAdmin: boolean;
}

/**
 * Verify admin authentication and return user info
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthResult | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const auth = verifyAuth(token);
    
    if (!auth) {
      return null;
    }
    
    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { 
        id: true,
        email: true,
        role: true 
      },
    });
    
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return null;
    }
    
    return {
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'SUPER_ADMIN',
      isSuperAdmin: user.role === 'SUPER_ADMIN',
    };
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return null;
  }
}

/**
 * Middleware wrapper for admin routes
 */
export async function requireAdmin(
  request: NextRequest,
  handler: (request: NextRequest, admin: AdminAuthResult) => Promise<NextResponse>
): Promise<NextResponse> {
  const admin = await verifyAdminAuth(request);
  
  if (!admin) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Unauthorized. Admin access required.' 
      },
      { status: 403 }
    );
  }
  
  return handler(request, admin);
}

/**
 * Middleware wrapper for super admin routes
 */
export async function requireSuperAdmin(
  request: NextRequest,
  handler: (request: NextRequest, admin: AdminAuthResult) => Promise<NextResponse>
): Promise<NextResponse> {
  const admin = await verifyAdminAuth(request);
  
  if (!admin || !admin.isSuperAdmin) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Unauthorized. Super admin access required.' 
      },
      { status: 403 }
    );
  }
  
  return handler(request, admin);
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction(
  admin: AdminAuthResult,
  action: string,
  category: string,
  details: any,
  request?: NextRequest
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        category: category as any,
        severity: 'INFO',
        userId: admin.userId,
        userEmail: admin.email,
        userRole: admin.role,
        ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
        userAgent: request?.headers.get('user-agent') || undefined,
        endpoint: request?.nextUrl.pathname,
        method: request?.method,
        details: JSON.stringify(details),
        metadata: JSON.stringify({
          timestamp: new Date().toISOString(),
          isSuperAdmin: admin.isSuperAdmin,
        }),
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
