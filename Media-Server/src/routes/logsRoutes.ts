import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { asyncHandler } from '../middleware/errorHandler';
import { adminAuthMiddleware } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/apiResponse';

const router = Router();

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: unknown;
}

const logs: LogEntry[] = [];
const MAX_LOGS = 1000;

// Store logs in memory
export function addLog(level: string, message: string, metadata?: unknown): void {
  logs.unshift({
    timestamp: new Date().toISOString(),
    level,
    message,
    metadata
  });

  if (logs.length > MAX_LOGS) {
    logs.pop();
  }
}

// Get logs endpoint
router.get('/logs', adminAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { level, limit = '100', search } = req.query;
  
  let filteredLogs = [...logs];

  // Filter by level
  if (level && typeof level === 'string') {
    filteredLogs = filteredLogs.filter(log => 
      log.level.toLowerCase() === level.toLowerCase()
    );
  }

  // Search in message
  if (search && typeof search === 'string') {
    filteredLogs = filteredLogs.filter(log =>
      log.message.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Limit results
  const limitNum = parseInt(limit as string, 10) || 100;
  filteredLogs = filteredLogs.slice(0, limitNum);

  sendSuccess(res, {
    logs: filteredLogs,
    count: filteredLogs.length,
    total: logs.length
  });
}));

// Clear logs endpoint
router.delete('/logs', adminAuthMiddleware, asyncHandler(async (_req: Request, res: Response) => {
  logs.length = 0;
  sendSuccess(res, null, 'Logs cleared successfully');
}));

// Get log levels
router.get('/logs/levels', adminAuthMiddleware, (_req: Request, res: Response) => {
  const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
  sendSuccess(res, { levels });
});

export default router;
