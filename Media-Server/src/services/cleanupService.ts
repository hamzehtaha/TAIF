/**
 * Cleanup Service
 * 
 * Handles cleanup of orphaned files and temporary data:
 * - Runs hourly cleanup job for orphaned files
 * - Cleans up partial transcoding files on failure
 * - Removes stale upload files
 * 
 * @module cleanupService
 */

import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../config/config';
import { logger } from '../utils/winstonLogger';

/**
 * Cleanup result
 */
export interface CleanupResult {
  success: boolean;
  deletedFiles: string[];
  deletedDirectories: string[];
  errors: string[];
  bytesFreed: number;
}

class CleanupService {
  private config: Config;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastCleanupTime: Date | null = null;
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  private readonly MAX_PARTIAL_FILE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.config = Config.getInstance();
  }

  /**
   * Start the cleanup job scheduler
   */
  startScheduler(): void {
    if (this.cleanupInterval) {
      logger.warn('Cleanup scheduler already running');
      return;
    }

    logger.info('Starting cleanup scheduler', {
      intervalMs: this.CLEANUP_INTERVAL_MS,
      intervalHours: this.CLEANUP_INTERVAL_MS / (60 * 60 * 1000)
    });

    // Run initial cleanup after 5 minutes
    setTimeout(() => {
      this.runCleanup().catch(err => {
        logger.error('Initial cleanup failed', { error: err.message });
      });
    }, 5 * 60 * 1000);

    // Schedule regular cleanup
    this.cleanupInterval = setInterval(() => {
      this.runCleanup().catch(err => {
        logger.error('Scheduled cleanup failed', { error: err.message });
      });
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Stop the cleanup job scheduler
   */
  stopScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('Cleanup scheduler stopped');
    }
  }

  /**
   * Run cleanup job
   */
  async runCleanup(): Promise<CleanupResult> {
    if (this.isRunning) {
      logger.warn('Cleanup already in progress, skipping');
      return {
        success: false,
        deletedFiles: [],
        deletedDirectories: [],
        errors: ['Cleanup already in progress'],
        bytesFreed: 0
      };
    }

    this.isRunning = true;
    const startTime = Date.now();

    const result: CleanupResult = {
      success: true,
      deletedFiles: [],
      deletedDirectories: [],
      errors: [],
      bytesFreed: 0
    };

    try {
      logger.info('Starting cleanup job...');

      // 1. Clean up orphaned upload files (incomplete uploads)
      const uploadCleanup = await this.cleanupOrphanedUploads();
      result.deletedFiles.push(...uploadCleanup.deletedFiles);
      result.errors.push(...uploadCleanup.errors);
      result.bytesFreed += uploadCleanup.bytesFreed;

      // 2. Clean up orphaned stream directories (no valid videos)
      const streamCleanup = await this.cleanupOrphanedStreams();
      result.deletedDirectories.push(...streamCleanup.deletedDirectories);
      result.deletedFiles.push(...streamCleanup.deletedFiles);
      result.errors.push(...streamCleanup.errors);
      result.bytesFreed += streamCleanup.bytesFreed;

      // 3. Clean up temp files
      const tempCleanup = await this.cleanupTempFiles();
      result.deletedFiles.push(...tempCleanup.deletedFiles);
      result.errors.push(...tempCleanup.errors);
      result.bytesFreed += tempCleanup.bytesFreed;

      this.lastCleanupTime = new Date();

      const duration = Date.now() - startTime;
      logger.info('Cleanup job completed', {
        duration: `${duration}ms`,
        filesDeleted: result.deletedFiles.length,
        directoriesDeleted: result.deletedDirectories.length,
        bytesFreed: result.bytesFreed,
        bytesFreedMB: (result.bytesFreed / (1024 * 1024)).toFixed(2),
        errors: result.errors.length
      });

    } catch (error) {
      result.success = false;
      result.errors.push((error as Error).message);
      logger.error('Cleanup job failed', { error: (error as Error).message });
    } finally {
      this.isRunning = false;
    }

    return result;
  }

  /**
   * Clean up orphaned upload files
   */
  private async cleanupOrphanedUploads(): Promise<{
    deletedFiles: string[];
    errors: string[];
    bytesFreed: number;
  }> {
    const deletedFiles: string[] = [];
    const errors: string[] = [];
    let bytesFreed = 0;

    try {
      const uploadsDir = this.config.getUploadsDir();
      
      if (!fs.existsSync(uploadsDir)) {
        return { deletedFiles, errors, bytesFreed };
      }

      const files = fs.readdirSync(uploadsDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        
        try {
          const stats = fs.statSync(filePath);
          
          // Skip directories
          if (stats.isDirectory()) continue;

          // Check file age
          const fileAge = now - stats.mtimeMs;
          
          // Delete files older than MAX_PARTIAL_FILE_AGE_MS that might be partial uploads
          if (fileAge > this.MAX_PARTIAL_FILE_AGE_MS) {
            // Check if file is in use or being processed
            // We check by seeing if the file has been modified recently
            if (fileAge > this.MAX_PARTIAL_FILE_AGE_MS * 2) {
              bytesFreed += stats.size;
              fs.unlinkSync(filePath);
              deletedFiles.push(filePath);
              logger.debug('Deleted orphaned upload file', { file: filePath, age: fileAge });
            }
          }
        } catch (error) {
          errors.push(`Failed to process ${file}: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      errors.push(`Upload cleanup failed: ${(error as Error).message}`);
    }

    return { deletedFiles, errors, bytesFreed };
  }

  /**
   * Clean up orphaned stream directories
   */
  private async cleanupOrphanedStreams(): Promise<{
    deletedFiles: string[];
    deletedDirectories: string[];
    errors: string[];
    bytesFreed: number;
  }> {
    const deletedFiles: string[] = [];
    const deletedDirectories: string[] = [];
    const errors: string[] = [];
    let bytesFreed = 0;

    try {
      const streamsDir = this.config.getStreamsDir();
      
      if (!fs.existsSync(streamsDir)) {
        return { deletedFiles, deletedDirectories, errors, bytesFreed };
      }

      const videoDirs = fs.readdirSync(streamsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const videoId of videoDirs) {
        const videoDir = path.join(streamsDir, videoId);
        
        try {
          const files = fs.readdirSync(videoDir);
          
          // Check if directory has any valid video files
          const validFiles = files.filter(f => 
            f.endsWith('.mp4') || 
            f.endsWith('.m3u8') || 
            f.endsWith('.ts')
          );

          // If no valid files and directory is old, consider it orphaned
          if (validFiles.length === 0) {
            const stats = fs.statSync(videoDir);
            const dirAge = Date.now() - stats.mtimeMs;
            
            if (dirAge > this.MAX_PARTIAL_FILE_AGE_MS) {
              // Delete all files in directory
              for (const file of files) {
                const filePath = path.join(videoDir, file);
                try {
                  const fileStats = fs.statSync(filePath);
                  if (fileStats.isFile()) {
                    bytesFreed += fileStats.size;
                    fs.unlinkSync(filePath);
                    deletedFiles.push(filePath);
                  }
                } catch {
                  // Ignore
                }
              }
              
              // Delete the directory
              fs.rmdirSync(videoDir);
              deletedDirectories.push(videoDir);
              logger.debug('Deleted orphaned stream directory', { videoId, dirAge });
            }
          }
        } catch (error) {
          errors.push(`Failed to process stream ${videoId}: ${(error as Error).message}`);
        }
      }
    } catch (error) {
      errors.push(`Stream cleanup failed: ${(error as Error).message}`);
    }

    return { deletedFiles, deletedDirectories, errors, bytesFreed };
  }

  /**
   * Clean up temp files
   */
  private async cleanupTempFiles(): Promise<{
    deletedFiles: string[];
    errors: string[];
    bytesFreed: number;
  }> {
    const deletedFiles: string[] = [];
    const errors: string[] = [];
    let bytesFreed = 0;

    // Clean up .write-test files from health checks
    const dirs = [
      this.config.getUploadsDir(),
      this.config.getStreamsDir(),
      this.config.getPublicDir()
    ];

    for (const dir of dirs) {
      try {
        if (!fs.existsSync(dir)) continue;
        
        const testFile = path.join(dir, '.write-test');
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
          deletedFiles.push(testFile);
        }
      } catch {
        // Ignore
      }
    }

    return { deletedFiles, errors, bytesFreed };
  }

  /**
   * Clean up partial files for a specific video on transcode failure
   */
  async cleanupPartialFiles(videoId: string, uploadPath?: string): Promise<void> {
    logger.info('Cleaning up partial files for video', { videoId });

    try {
      // Clean up stream directory
      const streamDir = path.join(this.config.getStreamsDir(), videoId);
      if (fs.existsSync(streamDir)) {
        const files = fs.readdirSync(streamDir);
        for (const file of files) {
          const filePath = path.join(streamDir, file);
          try {
            fs.unlinkSync(filePath);
            logger.debug('Deleted partial file', { file: filePath });
          } catch (error) {
            logger.error('Failed to delete partial file', { 
              file: filePath, 
              error: (error as Error).message 
            });
          }
        }
        
        // Remove the directory
        try {
          fs.rmdirSync(streamDir);
          logger.debug('Deleted partial stream directory', { videoId });
        } catch {
          // Directory might not be empty
        }
      }

      // Clean up upload file if specified
      if (uploadPath && fs.existsSync(uploadPath)) {
        fs.unlinkSync(uploadPath);
        logger.debug('Deleted upload file', { uploadPath });
      }

    } catch (error) {
      logger.error('Failed to cleanup partial files', { 
        videoId, 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Get cleanup status
   */
  getStatus(): {
    isRunning: boolean;
    lastCleanupTime: Date | null;
    nextScheduledCleanup: Date | null;
  } {
    return {
      isRunning: this.isRunning,
      lastCleanupTime: this.lastCleanupTime,
      nextScheduledCleanup: this.lastCleanupTime 
        ? new Date(this.lastCleanupTime.getTime() + this.CLEANUP_INTERVAL_MS)
        : null
    };
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();
