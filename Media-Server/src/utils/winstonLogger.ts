/**
 * Winston Logger Module - Structured Logging with Daily Rotation
 * 
 * Provides persistent, structured logging with the following features:
 * - Daily rotating log files (logs/app-YYYY-MM-DD.log)
 * - 30-day log retention with automatic rotation
 * - Request ID middleware for request tracing
 * - Correlation IDs for Socket.IO events
 * - Log levels: error, warn, info, debug
 * 
 * @module winstonLogger
 */

import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { LoggerData } from '../types';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom log format for consistent structured output
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, requestId, correlationId, ...metadata }) => {
    let logMessage = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (requestId) {
      logMessage += ` [req:${requestId}]`;
    }
    
    if (correlationId) {
      logMessage += ` [corr:${correlationId}]`;
    }
    
    logMessage += ` ${message}`;
    
    // Add metadata if present
    const metaKeys = Object.keys(metadata);
    if (metaKeys.length > 0 && !(metaKeys.length === 1 && metaKeys[0] === 'splat')) {
      const filteredMeta = Object.fromEntries(
        Object.entries(metadata).filter(([key]) => key !== 'splat')
      );
      if (Object.keys(filteredMeta).length > 0) {
        logMessage += ` ${JSON.stringify(filteredMeta)}`;
      }
    }
    
    return logMessage;
  })
);

/**
 * JSON format for structured logging (for log aggregation systems)
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Daily rotating file transport configuration
 */
const dailyRotateTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d', // Keep 30 days of logs
  format: jsonFormat,
  zippedArchive: true
});

/**
 * Error-only rotating file transport
 */
const errorRotateTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: jsonFormat,
  zippedArchive: true
});

/**
 * Console transport with colorized output
 */
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    logFormat
  )
});

/**
 * Get log level from environment or default to 'info'
 */
function getLogLevel(): string {
  const level = process.env.LOG_LEVEL?.toLowerCase() || 'info';
  const validLevels = ['error', 'warn', 'info', 'debug'];
  return validLevels.includes(level) ? level : 'info';
}

/**
 * Create the Winston logger instance
 */
const winstonLogger = winston.createLogger({
  level: getLogLevel(),
  format: logFormat,
  defaultMeta: { service: 'taif-media-system' },
  transports: [
    dailyRotateTransport,
    errorRotateTransport,
    consoleTransport
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    })
  ]
});

// Handle transport errors
dailyRotateTransport.on('error', (error) => {
  console.error('Error with daily rotate transport:', error);
});

dailyRotateTransport.on('rotate', (oldFilename, newFilename) => {
  winstonLogger.info('Log file rotated', { oldFilename, newFilename });
});

/**
 * Request context storage using AsyncLocalStorage-like pattern
 */
interface RequestContext {
  requestId: string;
  correlationId?: string;
  startTime: number;
  method: string;
  path: string;
}

const requestContextMap = new Map<string, RequestContext>();

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return uuidv4();
}

/**
 * Generate a correlation ID for Socket.IO events
 */
export function generateCorrelationId(): string {
  return `corr-${uuidv4().substring(0, 8)}`;
}

/**
 * Request ID middleware for request tracing
 * Attaches a unique request ID to each incoming request
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Check for existing request ID in headers (for distributed tracing)
  const existingRequestId = req.headers['x-request-id'] as string;
  const requestId = existingRequestId || generateRequestId();
  
  // Attach to request object
  (req as any).requestId = requestId;
  
  // Add to response headers
  res.setHeader('X-Request-Id', requestId);
  
  // Store context
  const context: RequestContext = {
    requestId,
    correlationId: req.headers['x-correlation-id'] as string,
    startTime: Date.now(),
    method: req.method,
    path: req.path
  };
  requestContextMap.set(requestId, context);
  
  // Log request start
  winstonLogger.info(`${req.method} ${req.path}`, {
    requestId,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - context.startTime;
    winstonLogger.info(`${req.method} ${req.path} ${res.statusCode}`, {
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
    
    // Cleanup context
    requestContextMap.delete(requestId);
  });
  
  next();
}

/**
 * Get current request context
 */
export function getRequestContext(requestId: string): RequestContext | undefined {
  return requestContextMap.get(requestId);
}

/**
 * Logger wrapper class for compatibility with existing Logger interface
 */
export class WinstonLogger {
  private requestId?: string;
  private correlationId?: string;

  constructor(requestId?: string, correlationId?: string) {
    this.requestId = requestId;
    this.correlationId = correlationId;
  }

  /**
   * Create a child logger with request context
   */
  child(meta: { requestId?: string; correlationId?: string }): WinstonLogger {
    return new WinstonLogger(
      meta.requestId || this.requestId,
      meta.correlationId || this.correlationId
    );
  }

  /**
   * Log error level message
   */
  error(message: string, data?: LoggerData): void {
    winstonLogger.error(message, {
      ...data,
      requestId: this.requestId,
      correlationId: this.correlationId
    });
  }

  /**
   * Log warning level message
   */
  warn(message: string, data?: LoggerData): void {
    winstonLogger.warn(message, {
      ...data,
      requestId: this.requestId,
      correlationId: this.correlationId
    });
  }

  /**
   * Log info level message
   */
  info(message: string, data?: LoggerData): void {
    winstonLogger.info(message, {
      ...data,
      requestId: this.requestId,
      correlationId: this.correlationId
    });
  }

  /**
   * Log debug level message
   */
  debug(message: string, data?: LoggerData): void {
    winstonLogger.debug(message, {
      ...data,
      requestId: this.requestId,
      correlationId: this.correlationId
    });
  }

  /**
   * Set the log level dynamically
   */
  setLevel(level: string): void {
    winstonLogger.level = level;
  }
}

/**
 * Read log files for the logs API endpoint
 */
export async function readLogFiles(options: {
  level?: string;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Array<{
  timestamp: string;
  level: string;
  message: string;
  metadata?: LoggerData;
}>> {
  const { level, limit = 1000, search, startDate, endDate } = options;
  const logs: Array<{ timestamp: string; level: string; message: string; metadata?: LoggerData }> = [];
  
  try {
    // Get list of log files
    const files = fs.readdirSync(logsDir)
      .filter(f => f.startsWith('app-') && f.endsWith('.log'))
      .sort()
      .reverse(); // Most recent first
    
    // Filter by date range if specified
    const filteredFiles = files.filter(file => {
      const dateMatch = file.match(/app-(\d{4}-\d{2}-\d{2})\.log/);
      if (!dateMatch) return false;
      
      const fileDate = dateMatch[1];
      if (startDate && fileDate < startDate) return false;
      if (endDate && fileDate > endDate) return false;
      return true;
    });
    
    // Read logs from files
    for (const file of filteredFiles) {
      if (logs.length >= limit) break;
      
      const filePath = path.join(logsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      // Process lines in reverse order (most recent first)
      for (let i = lines.length - 1; i >= 0 && logs.length < limit; i--) {
        try {
          const logEntry = JSON.parse(lines[i]);
          
          // Filter by level
          if (level && logEntry.level?.toLowerCase() !== level.toLowerCase()) {
            continue;
          }
          
          // Filter by search term
          if (search && !logEntry.message?.toLowerCase().includes(search.toLowerCase())) {
            continue;
          }
          
          logs.push({
            timestamp: logEntry.timestamp,
            level: logEntry.level?.toUpperCase() || 'INFO',
            message: logEntry.message || '',
            metadata: Object.fromEntries(
              Object.entries(logEntry).filter(([key]) => 
                !['timestamp', 'level', 'message', 'service'].includes(key)
              )
            )
          });
        } catch {
          // Skip malformed log lines
        }
      }
    }
  } catch (error) {
    winstonLogger.error('Failed to read log files', { error: (error as Error).message });
  }
  
  return logs;
}

/**
 * Clear old log files (for manual cleanup)
 */
export function clearOldLogs(daysToKeep: number = 30): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  try {
    const files = fs.readdirSync(logsDir);
    
    for (const file of files) {
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const fileDate = new Date(dateMatch[1]);
        if (fileDate < cutoffDate) {
          fs.unlinkSync(path.join(logsDir, file));
          winstonLogger.info('Deleted old log file', { file });
        }
      }
    }
  } catch (error) {
    winstonLogger.error('Failed to clear old logs', { error: (error as Error).message });
  }
}

/**
 * Get logs directory path
 */
export function getLogsDirectory(): string {
  return logsDir;
}

/**
 * Default logger instance
 */
export const logger = new WinstonLogger();

/**
 * Raw Winston logger for advanced usage
 */
export { winstonLogger };
