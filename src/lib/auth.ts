import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/contexts/AuthContext';

// Mock user database - In production, this would be a real database
interface UserRecord extends User {
  password: string;
}

const users: UserRecord[] = [];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export class AuthService {
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
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await this.hashPassword(userData.password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newUser: UserRecord = {
      id: userId,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      dateOfBirth: userData.dateOfBirth,
      nationality: userData.nationality,
      preferences: {
        currency: 'USD',
        language: 'en',
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      },
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const token = this.generateToken(userId);
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    const token = this.generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user
  static async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = { ...users[userIndex], ...updateData };
    const { password: _, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await this.comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    user.password = await this.hashPassword(newPassword);
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
    if (users.length > 0) return; // Already initialized

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
        console.log(`Demo user created: ${userData.email}`);
      } catch (error) {
        console.log(`Demo user already exists: ${userData.email}`);
      }
    }
  }
}

// Middleware to verify authentication
export const verifyAuth = (token: string): { userId: string } | null => {
  try {
    const decoded = AuthService.verifyToken(token);
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
  AuthService.initializeDemoUsers().catch(console.error);
}
