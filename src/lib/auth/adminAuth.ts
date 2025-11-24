/**
 * Admin Authentication Helper
 * Validates admin access for protected API routes
 */

import { NextRequest } from 'next/server';
import { PrismaAuthService } from '@/lib/auth-prisma';
import { prisma } from '@/lib/prisma';

export interface AdminAuthResult {
  authenticated: boolean;
  userId?: string;
  role?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Verify admin authentication from request
 * Checks JWT token and validates admin role
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthResult> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        error: 'Unauthorized - No token provided',
        statusCode: 401,
      };
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify token
    const decoded = PrismaAuthService.verifyToken(token);
    
    if (!decoded) {
      return {
        authenticated: false,
        error: 'Unauthorized - Invalid token',
        statusCode: 401,
      };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      return {
        authenticated: false,
        error: 'Unauthorized - User not found',
        statusCode: 401,
      };
    }

    // Check admin role
    if (user.role !== 'ADMIN') {
      return {
        authenticated: false,
        error: 'Forbidden - Admin access required',
        statusCode: 403,
      };
    }

    return {
      authenticated: true,
      userId: user.id,
      role: user.role,
    };

  } catch (error) {
    console.error('Admin auth verification error:', error);
    return {
      authenticated: false,
      error: 'Internal server error during authentication',
      statusCode: 500,
    };
  }
}

/**
 * Verify regular user authentication (non-admin)
 */
export async function verifyUserAuth(request: NextRequest): Promise<AdminAuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        error: 'Unauthorized - No token provided',
        statusCode: 401,
      };
    }

    const token = authHeader.substring(7);
    const decoded = PrismaAuthService.verifyToken(token);
    
    if (!decoded) {
      return {
        authenticated: false,
        error: 'Unauthorized - Invalid token',
        statusCode: 401,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      return {
        authenticated: false,
        error: 'Unauthorized - User not found',
        statusCode: 401,
      };
    }

    return {
      authenticated: true,
      userId: user.id,
      role: user.role,
    };

  } catch (error) {
    console.error('User auth verification error:', error);
    return {
      authenticated: false,
      error: 'Internal server error during authentication',
      statusCode: 500,
    };
  }
}
