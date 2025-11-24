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

export interface AdminAuthResponse {
  valid: boolean;
  user?: AdminAuthResult;
  error?: string;
}

/**
 * Verify admin authentication and return user info
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return { valid: false, error: 'No authorization token provided' };
    }
    
    const token = authHeader.substring(7);
    const auth = verifyAuth(token);
    
    if (!auth) {
      return { valid: false, error: 'Invalid or expired token' };
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
    
    if (!user) {
      return { valid: false, error: 'User not found' };
    }
    
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return { valid: false, error: 'Admin access required' };
    }
    
    return {
      valid: true,
      user: {
        userId: user.id,
        email: user.email,
        role: user.role as 'ADMIN' | 'SUPER_ADMIN',
        isSuperAdmin: user.role === 'SUPER_ADMIN',
      }
    };
  } catch (error) {
    console.error('Admin auth verification error:', error);
    return { valid: false, error: 'Authentication failed' };
  }
}

/**
 * Middleware wrapper for admin routes
 */
export async function requireAdmin(
  request: NextRequest,
  handler: (request: NextRequest, admin: AdminAuthResult) => Promise<NextResponse>
): Promise<NextResponse> {
  const authResult = await verifyAdminAuth(request);
  
  if (!authResult.valid || !authResult.user) {
    return NextResponse.json(
      { 
        success: false,
        error: authResult.error || 'Unauthorized. Admin access required.' 
      },
      { status: 403 }
    );
  }
  
  return handler(request, authResult.user);
}

/**
 * Middleware wrapper for super admin routes
 */
export async function requireSuperAdmin(
  request: NextRequest,
  handler: (request: NextRequest, admin: AdminAuthResult) => Promise<NextResponse>
): Promise<NextResponse> {
  const authResult = await verifyAdminAuth(request);
  
  if (!authResult.valid || !authResult.user || !authResult.user.isSuperAdmin) {
    return NextResponse.json(
      { 
        success: false,
        error: authResult.error || 'Unauthorized. Super admin access required.' 
      },
      { status: 403 }
    );
  }
  
  return handler(request, authResult.user);
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction(data: {
  userId: string;
  action: string;
  category: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        category: data.category as any,
        severity: 'INFO',
        userId: data.userId,
        userEmail: undefined,
        userRole: undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        endpoint: undefined,
        method: undefined,
        details: JSON.stringify(data.details),
        metadata: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
