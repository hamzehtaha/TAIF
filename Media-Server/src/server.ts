/**
 * Main Server Entry Point
 * 
 * Initializes Express server with video streaming capabilities.
 * Provides upload, processing, and MP4 streaming endpoints with real-time progress tracking.
 */

import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { Logger } from './utils/logger';
import { logger as winstonLogger, requestIdMiddleware, WinstonLogger } from './utils/winstonLogger';
import { FileUtil } from './utils/fileUtil';
import { errorHandler } from './middleware/errorHandler';
import { Config } from './config/config';
import { swaggerSpec } from './config/swagger';
import { socketService } from './services/socketService';
import { healthService } from './services/healthService';
import { shutdownManager } from './services/shutdownManager';
import { cleanupService } from './services/cleanupService';
import { diskUsageService } from './services/diskUsageService';
import { LogLevel } from './types';
import videoRoutes from './routes/videoRoutes';
import streamRoutes from './routes/streamRoutes';
import authRoutes from './routes/authRoutes';
import logsRoutes from './routes/logsRoutes';
import configRoutes from './routes/configRoutes';
import statisticsRoutes from './routes/statisticsRoutes';
import { addLog } from './routes/logsRoutes';

const app: Express = express();
const httpServer = createServer(app);
const config = Config.getInstance();
const logger = new Logger(config.getLogLevel() || LogLevel.INFO);

async function initialize(): Promise<void> {
  try {
    await FileUtil.createDirIfNotExists(config.getUploadsDir());
    await FileUtil.createDirIfNotExists(config.getStreamsDir());
    await FileUtil.createDirIfNotExists(config.getPublicDir());
    
    logger.info('Required directories initialized', {
      uploads: config.getUploadsDir(),
      streams: config.getStreamsDir(),
      public: config.getPublicDir()
    });
  } catch (error) {
    logger.error('Failed to initialize application', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
  }
}

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(cookieParser());

// CORS
if (config.isCorsEnabled()) {
  app.use((req: Request, res: Response, next: NextFunction): void => {
    res.set('Access-Control-Allow-Origin', config.getAllowedOrigins() || '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
    res.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });
  
  logger.info('CORS enabled', { allowedOrigins: config.getAllowedOrigins() });
}

// Request logging (replaced with Winston request ID middleware)
app.use(requestIdMiddleware);

// Middleware to reject requests during shutdown
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!shutdownManager.isAcceptingRequests()) {
    // Allow health check endpoints during shutdown
    if (req.path === '/health' || req.path === '/live' || req.path === '/ready' || req.path === '/api/system/shutdown-status') {
      return next();
    }
    
    return res.status(503).json({
      success: false,
      error: {
        code: 'SYSTEM_SHUTTING_DOWN',
        message: 'Server is shutting down, not accepting new requests'
      }
    });
  }
  next();
});

// Static files
app.use(express.static(config.getPublicDir()));

// Admin portal routing (without .html extension)
app.get('/admin', (_req: Request, res: Response) => {
  res.sendFile('admin.html', { root: config.getPublicDir() });
});

// Login page
app.get('/login', (_req: Request, res: Response) => {
  res.sendFile('login.html', { root: config.getPublicDir() });
});

// Standalone player routing (without .html extension)
app.get('/player', (_req: Request, res: Response) => {
  res.sendFile('player.html', { root: config.getPublicDir() });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Comprehensive health check
 *     description: Returns detailed server health status including FFmpeg, disk space, and memory
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *       503:
 *         description: Server is unhealthy
 */
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = await healthService.getHealth();
    const statusCode = health.status === 'unhealthy' ? 503 : 200;
    
    res.status(statusCode).json({
      success: health.status !== 'unhealthy',
      data: health
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Kubernetes readiness probe
 *     description: Returns 200 if server is ready to accept traffic
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is ready
 *       503:
 *         description: Server is not ready
 */
app.get('/ready', async (_req: Request, res: Response) => {
  const isReady = await healthService.isReady();
  
  if (isReady && shutdownManager.isAcceptingRequests()) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});

/**
 * @swagger
 * /live:
 *   get:
 *     summary: Kubernetes liveness probe
 *     description: Returns 200 if server process is alive
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is alive
 */
app.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'alive',
    uptime: healthService.getUptime()
  });
});

/**
 * @swagger
 * /api/system/shutdown-status:
 *   get:
 *     summary: Get shutdown status
 *     description: Returns current shutdown status and active jobs
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Shutdown status
 */
app.get('/api/system/shutdown-status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: shutdownManager.getStatus()
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TAIF Media Management System API'
}));

app.use('/api', videoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', logsRoutes);
app.use('/api/admin', configRoutes);
app.use('/', statisticsRoutes);
app.use('/', streamRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      path: req.path
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await initialize();
    
    const port = config.getPort();
    
    // Initialize Socket.IO
    socketService.initialize(httpServer);
    winstonLogger.info('Real-time communication (Socket.IO) initialized');
    
    // Initialize shutdown manager
    shutdownManager.initialize(httpServer, socketService.getIO() || undefined);
    winstonLogger.info('Shutdown manager initialized');
    
    // Register cleanup callbacks for graceful shutdown
    shutdownManager.registerCleanupCallback(async () => {
      cleanupService.stopScheduler();
      diskUsageService.stopScheduler();
      winstonLogger.info('Background services stopped');
    });
    
    // Start background services
    cleanupService.startScheduler();
    diskUsageService.startScheduler();
    winstonLogger.info('Background services started (cleanup, disk usage)');
    
    httpServer.listen(port, () => {
      winstonLogger.info(`TAIF Media Management System Started`);
      winstonLogger.info(`Environment: ${config.getEnvironment()}`);
      winstonLogger.info(`Server: http://localhost:${port}`);
      winstonLogger.info(`API Docs: http://localhost:${port}/api-docs`);
      winstonLogger.info(`Admin Portal: http://localhost:${port}/admin`);
      winstonLogger.info(`Health: http://localhost:${port}/health`);
      winstonLogger.info(`Readiness: http://localhost:${port}/ready`);
      winstonLogger.info(`Liveness: http://localhost:${port}/live`);
    });
  } catch (error) {
    winstonLogger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
  }
}

// Process error handlers
process.on('unhandledRejection', (reason: unknown) => {
  winstonLogger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
});

process.on('uncaughtException', (error: Error) => {
  winstonLogger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Note: SIGTERM and SIGINT are now handled by shutdownManager

startServer();

export default app;
