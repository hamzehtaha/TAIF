/**
 * Socket.IO Service
 * Real-time communication for upload and transcoding progress tracking
 * 
 * This service maintains the SINGLE SOURCE OF TRUTH for all upload and transcode progress.
 * It provides a global registry that survives socket reconnections and can be queried
 * by late-joining clients.
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Logger } from '../utils/logger';
import { LogLevel, UploadProgress, TranscodeProgress } from '../types';
import { ServerStats } from './statisticsService';

const logger = new Logger(LogLevel.INFO);

/**
 * Global Progress Registry
 * Maps uploadId to current progress state
 */
interface ProgressRegistry {
  upload: Map<string, UploadProgress>;
  transcode: Map<string, TranscodeProgress>;
}

class SocketService {
  private io: SocketIOServer | null = null;
  
  /**
   * SINGLE SOURCE OF TRUTH for all progress tracking
   * This registry survives socket reconnections
   */
  private progressRegistry: ProgressRegistry = {
    upload: new Map<string, UploadProgress>(),
    transcode: new Map<string, TranscodeProgress>()
  };

  public initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      logger.info('Socket.IO client connected', { socketId: socket.id });

      // Send current state snapshot to late-joining client
      socket.emit('progress:snapshot', {
        uploads: Array.from(this.progressRegistry.upload.values()),
        transcodes: Array.from(this.progressRegistry.transcode.values())
      });

      // Join upload progress room
      socket.on('upload:subscribe', (uploadId: string) => {
        socket.join(`upload-${uploadId}`);
        logger.info('Client subscribed to upload', { socketId: socket.id, uploadId });
        
        // Send current progress if exists
        const uploadProgress = this.progressRegistry.upload.get(uploadId);
        const transcodeProgress = this.progressRegistry.transcode.get(uploadId);
        
        if (uploadProgress) {
          socket.emit('upload:progress', uploadProgress);
        }
        if (transcodeProgress) {
          socket.emit('transcode:progress', transcodeProgress);
        }
      });

      // Unsubscribe from upload progress
      socket.on('upload:unsubscribe', (uploadId: string) => {
        socket.leave(`upload-${uploadId}`);
        logger.info('Client unsubscribed from upload', { socketId: socket.id, uploadId });
      });

      socket.on('disconnect', () => {
        logger.info('Socket.IO client disconnected', { socketId: socket.id });
      });
    });

    logger.info('Socket.IO initialized with global progress registry');
  }

  /**
   * Update and emit upload progress
   */
  public updateUploadProgress(progress: UploadProgress): void {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    // Update registry (single source of truth)
    this.progressRegistry.upload.set(progress.uploadId, progress);

    // Emit to subscribers AND broadcast to all clients
    this.io.to(`upload-${progress.uploadId}`).emit('upload:progress', progress);
    this.io.emit('upload:progress', progress); // Broadcast to all for admin visibility
    
    logger.debug('Emitted upload progress', { 
      uploadId: progress.uploadId,
      percent: progress.percent,
      status: progress.status
    });

    // If upload completed, emit completion event
    if (progress.status === 'uploaded') {
      this.io.to(`upload-${progress.uploadId}`).emit('upload:completed', progress);
      this.io.emit('upload:completed', progress); // Broadcast to all
      logger.info('Upload completed', { uploadId: progress.uploadId });
    }

    // If upload failed, emit failure event
    if (progress.status === 'failed') {
      this.io.to(`upload-${progress.uploadId}`).emit('upload:failed', progress);
      this.io.emit('upload:failed', progress); // Broadcast to all
      logger.error('Upload failed', { uploadId: progress.uploadId, error: progress.error });
    }
  }

  /**
   * Start transcoding - emits initial transcode event
   */
  public startTranscode(uploadId: string, videoId: string, videoName: string): void {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const progress: TranscodeProgress = {
      uploadId,
      videoId,
      videoName,
      currentStage: 'idle',
      stageProgressPercent: 0,
      overallProgressPercent: 0
    };

    this.progressRegistry.transcode.set(uploadId, progress);
    this.io.to(`upload-${uploadId}`).emit('transcode:started', progress);
    this.io.emit('transcode:started', progress); // Broadcast to all
    
    logger.info('Transcode started', { uploadId, videoId });
  }

  /**
   * Update and emit transcode progress
   */
  public updateTranscodeProgress(progress: TranscodeProgress): void {
    if (!this.io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    // Update registry (single source of truth)
    this.progressRegistry.transcode.set(progress.uploadId, progress);

    // Emit to subscribers AND broadcast to all clients
    this.io.to(`upload-${progress.uploadId}`).emit('transcode:progress', progress);
    this.io.emit('transcode:progress', progress); // Broadcast to all for admin visibility
    
    logger.debug('Emitted transcode progress', { 
      uploadId: progress.uploadId,
      stage: progress.currentStage,
      stagePercent: progress.stageProgressPercent,
      overallPercent: progress.overallProgressPercent
    });

    // If transcoding completed, emit completion event and cleanup
    if (progress.currentStage === 'completed') {
      this.io.to(`upload-${progress.uploadId}`).emit('transcode:completed', progress);
      this.io.emit('transcode:completed', progress); // Broadcast to all
      logger.info('Transcode completed', { uploadId: progress.uploadId });
      
      // Cleanup after delay
      setTimeout(() => {
        this.progressRegistry.upload.delete(progress.uploadId);
        this.progressRegistry.transcode.delete(progress.uploadId);
        logger.debug('Cleaned up progress registry', { uploadId: progress.uploadId });
      }, 30000); // Keep for 30 seconds after completion
    }

    // If transcoding failed, emit failure event and cleanup
    if (progress.currentStage === 'failed') {
      this.io.to(`upload-${progress.uploadId}`).emit('transcode:failed', progress);
      this.io.emit('transcode:failed', progress); // Broadcast to all
      logger.error('Transcode failed', { uploadId: progress.uploadId, error: progress.error });
      
      // Cleanup after delay
      setTimeout(() => {
        this.progressRegistry.upload.delete(progress.uploadId);
        this.progressRegistry.transcode.delete(progress.uploadId);
      }, 60000); // Keep for 60 seconds after failure for debugging
    }
  }

  /**
   * Get all active uploads
   */
  public getActiveUploads(): UploadProgress[] {
    return Array.from(this.progressRegistry.upload.values());
  }

  /**
   * Get all active transcodes
   */
  public getActiveTranscodes(): TranscodeProgress[] {
    return Array.from(this.progressRegistry.transcode.values());
  }

  /**
   * Get upload progress by uploadId
   */
  public getUploadProgress(uploadId: string): UploadProgress | undefined {
    return this.progressRegistry.upload.get(uploadId);
  }

  /**
   * Get transcode progress by uploadId
   */
  public getTranscodeProgress(uploadId: string): TranscodeProgress | undefined {
    return this.progressRegistry.transcode.get(uploadId);
  }

  /**
   * Emit system notification to all connected clients
   */
  public emitSystemNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.io) {
      return;
    }

    this.io.emit('system-notification', { message, type, timestamp: new Date() });
  }

  /**
   * Emit statistics update
   */
  public emitStatsUpdate(stats: ServerStats): void {
    if (!this.io) {
      return;
    }

    this.io.emit('stats-update', stats);
  }

  /**
   * Get Socket.IO instance
   */
  public getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const socketService = new SocketService();
