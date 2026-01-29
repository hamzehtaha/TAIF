/**
 * Authentication Routes
 * Handles login, token verification, and password management
 */

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { adminAuthMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { successResponse, sendError, sendSuccess } from '../utils/apiResponse';

const router = Router();
const authService = AuthService.getInstance();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin user and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    sendError(res, 400, 'MISSING_CREDENTIALS', 'Username and password are required');
    return;
  }

  const isValid = await authService.verifyCredentials({ username, password });

  if (!isValid) {
    sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid username or password');
    return;
  }

  const token = authService.generateToken(username);

  // Set token in HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  sendSuccess(res, {
    token,
    username,
    expiresIn: '24h'
  });
}));

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify token
 *     description: Check if current token is valid
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid or missing token
 */
router.get('/verify', adminAuthMiddleware, (req: AuthRequest, res: Response) => {
  sendSuccess(res, { user: req.user });
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change admin password
 *     description: Update admin password (requires current password)
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Invalid current password
 */
router.post('/change-password', adminAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    sendError(res, 400, 'MISSING_FIELDS', 'Current and new passwords are required');
    return;
  }

  const success = await authService.updatePassword(currentPassword, newPassword);

  if (!success) {
    sendError(res, 401, 'INVALID_PASSWORD', 'Invalid current password');
    return;
  }

  sendSuccess(res, null, 'Password changed successfully');
}));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout
 *     description: Clear authentication token (client-side)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  sendSuccess(res, null, 'Logged out successfully');
});

export default router;
