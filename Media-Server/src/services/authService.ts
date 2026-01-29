/**
 * Authentication Service
 * Handles admin user authentication with bcrypt password hashing
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger';
import { LogLevel } from '../types';

const logger = new Logger(LogLevel.INFO);

interface AdminUser {
  username: string;
  passwordHash: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export class AuthService {
  private static instance: AuthService;
  private adminUser: AdminUser;
  private jwtSecret: string;
  private readonly SALT_ROUNDS = 10;

  private constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'taif-media-secret-change-in-production';
    
    // Get admin credentials from environment or use defaults
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin';
    
    // Hash the password
    const passwordHash = bcrypt.hashSync(password, this.SALT_ROUNDS);
    
    this.adminUser = {
      username,
      passwordHash
    };
    
    // Warn if default credentials are in use
    if (username === 'admin' && password === 'admin') {
      logger.warn('⚠️  SECURITY WARNING: Using default admin credentials (admin/admin). Please change ADMIN_USERNAME and ADMIN_PASSWORD in .env file!');
    }
    
    logger.info('Authentication service initialized', { username });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Verify login credentials
   */
  public async verifyCredentials(credentials: LoginCredentials): Promise<boolean> {
    if (credentials.username !== this.adminUser.username) {
      return false;
    }
    
    return bcrypt.compare(credentials.password, this.adminUser.passwordHash);
  }

  /**
   * Generate JWT token for authenticated user
   */
  public generateToken(username: string): string {
    return jwt.sign(
      { username, role: 'admin' },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): { username: string; role: string } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { username: string; role: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update admin password (requires current password)
   */
  public async updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const isValid = await bcrypt.compare(currentPassword, this.adminUser.passwordHash);
    if (!isValid) {
      return false;
    }
    
    this.adminUser.passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    logger.info('Admin password updated successfully');
    return true;
  }
}
