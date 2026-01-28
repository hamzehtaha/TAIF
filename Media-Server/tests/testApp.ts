/**
 * Test Application Setup
 * Creates a testable Express application instance
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { Config } from '../src/config/config';
import videoRoutes from '../src/routes/videoRoutes';
import authRoutes from '../src/routes/authRoutes';
import configRoutes from '../src/routes/configRoutes';
import statisticsRoutes from '../src/routes/statisticsRoutes';
import logsRoutes from '../src/routes/logsRoutes';
import streamRoutes from '../src/routes/streamRoutes';
import { errorHandler } from '../src/middleware/errorHandler';

/**
 * Creates a configured Express application for testing
 */
export function createTestApp(): Express {
  const app: Express = express();
  const config = Config.getInstance();

  // Basic middleware
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '10kb', extended: true }));
  app.use(cookieParser());

  // Test-specific request ID middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as any).requestId = `test-${Date.now()}`;
    next();
  });

  // Health endpoints
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
  });

  app.get('/ready', (_req: Request, res: Response) => {
    res.json({ status: 'ready' });
  });

  app.get('/live', (_req: Request, res: Response) => {
    res.json({ status: 'alive', uptime: process.uptime() });
  });

  // API Routes - match the actual server mounting
  app.use('/api', videoRoutes);          // Handles /api/videos, /api/upload, /api/video-ids
  app.use('/api/auth', authRoutes);      // Handles /api/auth/login, /api/auth/logout, /api/auth/verify
  app.use('/api/admin', logsRoutes);     // Handles /api/admin/logs
  app.use('/api/admin', configRoutes);   // Handles /api/admin/config
  app.use('/', statisticsRoutes);        // Handles /api/admin/statistics
  app.use('/', streamRoutes);            // Handles /streams/:videoId/:quality

  // Error handling
  app.use(errorHandler);

  return app;
}

/**
 * Helper to get valid auth token for tests
 */
export async function getAuthToken(app: Express): Promise<string> {
  const request = require('supertest');
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'testpassword123'
    });
  
  return response.body.data?.token || response.body.token || '';
}
