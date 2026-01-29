/**
 * Streaming Routes
 * Handles MP4 video streaming with HTTP range support for seeking.
 */

import express, { Router, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '../utils/logger';
import { FileUtil } from '../utils/fileUtil';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { Config } from '../config/config';
import { LogLevel } from '../types';
import { statisticsService } from '../services/statisticsService';

const router: Router = express.Router();
const config = Config.getInstance();
const logger = new Logger(config.getLogLevel() || LogLevel.INFO);

/**
 * Stream video segments and playlists with HTTP range support
 */
router.get(
  '/stream/:videoId/:file(*)',
  asyncHandler(async (req: Request, res: Response) => {
    const { videoId, file } = req.params;

    // Security: Prevent directory traversal
    if (file.includes('..')) {
      logger.warn('Directory traversal attempt', { videoId, file, ip: req.ip });
      throw new NotFoundError('Invalid file path');
    }

    const filePath = path.join(config.getStreamsDir(), videoId, file);
    const realPath = path.resolve(filePath);
    const allowedDir = path.resolve(config.getStreamsDir());

    // Security: Verify file is within allowed directory
    if (!realPath.startsWith(allowedDir)) {
      logger.warn('Path access violation', { videoId, realPath, ip: req.ip });
      throw new NotFoundError('Invalid file access');
    }

    // Check if file exists
    if (!FileUtil.fileExists(filePath)) {
      logger.warn('Stream file not found', { videoId, file });
      throw new NotFoundError(`Stream file not found: ${file}`);
    }

    // Determine Content-Type
    const ext = path.extname(file).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.m3u8') {
      contentType = 'application/vnd.apple.mpegurl';
    } else if (ext === '.ts') {
      contentType = 'video/mp2t';
    } else if (ext === '.mp4') {
      contentType = 'video/mp4';
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.set('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');

    // Cache control
    if (ext === '.m3u8') {
      res.set('Cache-Control', 'public, max-age=3600');
    } else if (ext === '.ts' || ext === '.mp4') {
      res.set('Cache-Control', 'public, max-age=86400, immutable');
    }

    // HTTP Range Support (critical for seeking)
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': contentType
      });

      const stream = fs.createReadStream(filePath, { start, end });
      
      // Track streaming statistics
      const sessionId = `${videoId}-${Date.now()}-${Math.random()}`;
      const quality = file.replace('.mp4', '').replace('.m3u8', '');
      statisticsService.startStream(sessionId, videoId, quality);
      statisticsService.updateStreamBytes(sessionId, chunkSize);
      
      stream.on('end', () => {
        statisticsService.endStream(sessionId);
      });
      
      stream.pipe(res);
      
      logger.debug('Range stream started', { videoId, file, start, end });
    } else {
      // Full file stream
      res.set({
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes'
      });

      const stream = fs.createReadStream(filePath);
      
      // Track streaming statistics
      const sessionId = `${videoId}-${Date.now()}-${Math.random()}`;
      const quality = file.replace('.mp4', '').replace('.m3u8', '');
      statisticsService.startStream(sessionId, videoId, quality);
      statisticsService.updateStreamBytes(sessionId, fileSize);
      
      stream.on('error', (err: Error) => {
        logger.error('Stream error', { videoId, file, error: err.message });
        statisticsService.endStream(sessionId);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: { code: 'STREAM_ERROR', message: 'Error streaming file' }
          });
        }
      });
      
      stream.on('end', () => {
        statisticsService.endStream(sessionId);
      });

      stream.pipe(res);
      
      logger.debug('Stream started', { videoId, file, fileSize });
    }
  })
);

router.options('/stream/:videoId/:file(*)', (_req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.set('Access-Control-Max-Age', '3600');
  res.sendStatus(200);
});

export default router;
