import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User as PrismaUser } from '@prisma/client';
import { User } from '@/contexts/AuthContext';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export class PrismaAuthService {
  // Generate JWT token
  static generateToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'access' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: string; type: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Convert Prisma user to API user format
  private static formatUserForAPI(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      avatar: prismaUser.avatar,
      phone: prismaUser.phone,
      dateOfBirth: prismaUser.dateOfBirth,
      nationality: prismaUser.nationality,
      frequentFlyerNumbers: JSON.parse(prismaUser.frequentFlyerNumbers || '[]'),
      preferences: JSON.parse(prismaUser.preferences),
      createdAt: prismaUser.createdAt.toISOString(),
      lastLogin: prismaUser.lastLogin?.toISOString(),
    };
  }

  // Create user
  static async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    nationality?: string;
  }): Promise<{ user: User; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user in database
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth,
          nationality: userData.nationality,
          preferences: JSON.stringify({
            currency: 'USD',
            language: 'en',
            notifications: {
              email: true,
              sms: false,
              push: true,
            },
          }),
          frequentFlyerNumbers: JSON.stringify([]),
        },
      });

      const token = this.generateToken(newUser.id);
      const user = this.formatUserForAPI(newUser);

      return { user, token };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      const token = this.generateToken(user.id);
      const userForAPI = this.formatUserForAPI(updatedUser);

      return { user: userForAPI, token };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Authentication failed');
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return null;
      }

      return this.formatUserForAPI(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  // Update user
  static async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      // Prepare update data for Prisma
      const prismaUpdateData: any = {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        avatar: updateData.avatar,
        phone: updateData.phone,
        dateOfBirth: updateData.dateOfBirth,
        nationality: updateData.nationality,
      };

      // Handle JSON fields separately
      if (updateData.preferences) {
        prismaUpdateData.preferences = JSON.stringify(updateData.preferences);
      }

      if (updateData.frequentFlyerNumbers) {
        prismaUpdateData.frequentFlyerNumbers = JSON.stringify(updateData.frequentFlyerNumbers);
      }

      // Remove undefined values
      Object.keys(prismaUpdateData).forEach(key => {
        if (prismaUpdateData[key] === undefined) {
          delete prismaUpdateData[key];
        }
      });

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: prismaUpdateData
      });

      return this.formatUserForAPI(updatedUser);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update user');
    }
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user with current password
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await this.comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password and update
      const hashedPassword = await this.hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to change password');
    }
  }

  // Delete user (for GDPR compliance)
  static async deleteUser(userId: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id: userId }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete user');
    }
  }

  // Get user statistics
  static async getUserStats(userId: string) {
    try {
      const [bookingCount, priceAlertCount, notificationCount] = await Promise.all([
        prisma.booking.count({ where: { userId } }),
        prisma.priceAlert.count({ where: { userId } }),
        prisma.notification.count({ where: { userId } })
      ]);

      return {
        bookings: bookingCount,
        priceAlerts: priceAlertCount,
        notifications: notificationCount
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        bookings: 0,
        priceAlerts: 0,
        notifications: 0
      };
    }
  }

  // Validate password strength
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Initialize demo users for development
  static async initializeDemoUsers(): Promise<void> {
    try {
      const userCount = await prisma.user.count();
      if (userCount > 0) return; // Already initialized

      const demoUsers = [
        {
          email: 'john.doe@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1-555-0123'
        },
        {
          email: 'jane.smith@example.com',
          password: 'Password123!',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1-555-0456'
        }
      ];

      for (const userData of demoUsers) {
        try {
          await this.createUser(userData);
          console.log(`✅ Demo user created: ${userData.email}`);
        } catch (error) {
          console.log(`ℹ️ Demo user already exists: ${userData.email}`);
        }
      }
    } catch (error) {
      console.error('Error initializing demo users:', error);
    }
  }
}

// Middleware to verify authentication
export const verifyAuth = (token: string): { userId: string } | null => {
  try {
    const decoded = PrismaAuthService.verifyToken(token);
    if (!decoded) {
      return null;
    }

    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
};

// Initialize demo users in development
if (process.env.NODE_ENV === 'development') {
  PrismaAuthService.initializeDemoUsers().catch(console.error);
}