/**
 * Authentication Middleware
 * Protects admin portal routes (NOT API endpoints)
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export interface AuthRequest extends Request {
  user?: {
    username: string;
    role: string;
  };
}

const authService = AuthService.getInstance();

/**
 * Middleware to protect admin portal routes
 * Checks for JWT token in cookies or Authorization header
 */
export function adminAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Admin authentication required'
      }
    });
    return;
  }

  const user = authService.verifyToken(token);
  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
    return;
  }

  req.user = user;
  next();
}

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't require it
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
  if (token) {
    const user = authService.verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}
