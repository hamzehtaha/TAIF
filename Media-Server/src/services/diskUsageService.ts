/**
 * Disk Usage Cache Service
 * 
 * Handles async disk usage calculations with caching:
 * - Background job runs every 5 minutes
 * - Cached results for fast API responses
 * - Manual refresh capability
 * - Uses async fs.promises for non-blocking I/O
 * 
 * @module diskUsageService
 */

import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../config/config';
import { logger } from '../utils/winstonLogger';

/**
 * Disk usage data
 */
export interface DiskUsageData {
  uploadsDiskUsage: number;
  streamsDiskUsage: number;
  totalDiskUsage: number;
  lastUpdated: Date;
  isCalculating: boolean;
}

class DiskUsageService {
  private config: Config;
  private cache: DiskUsageData;
  private updateInterval: NodeJS.Timeout | null = null;
  private isCalculating: boolean = false;
  private readonly UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.config = Config.getInstance();
    this.cache = {
      uploadsDiskUsage: 0,
      streamsDiskUsage: 0,
      totalDiskUsage: 0,
      lastUpdated: new Date(0),
      isCalculating: false
    };
  }

  /**
   * Start the background update job
   */
  startScheduler(): void {
    if (this.updateInterval) {
      logger.warn('Disk usage scheduler already running');
      return;
    }

    logger.info('Starting disk usage scheduler', {
      intervalMs: this.UPDATE_INTERVAL_MS,
      intervalMinutes: this.UPDATE_INTERVAL_MS / (60 * 1000)
    });

    // Run initial calculation
    this.calculateDiskUsage().catch(err => {
      logger.error('Initial disk usage calculation failed', { error: err.message });
    });

    // Schedule regular updates
    this.updateInterval = setInterval(() => {
      this.calculateDiskUsage().catch(err => {
        logger.error('Scheduled disk usage calculation failed', { error: err.message });
      });
    }, this.UPDATE_INTERVAL_MS);
  }

  /**
   * Stop the background update job
   */
  stopScheduler(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('Disk usage scheduler stopped');
    }
  }

  /**
   * Get cached disk usage data
   */
  getCachedUsage(): DiskUsageData {
    return {
      ...this.cache,
      isCalculating: this.isCalculating
    };
  }

  /**
   * Trigger a manual refresh of disk usage
   */
  async refreshDiskUsage(): Promise<DiskUsageData> {
    await this.calculateDiskUsage();
    return this.getCachedUsage();
  }

  /**
   * Calculate disk usage (async, non-blocking)
   */
  private async calculateDiskUsage(): Promise<void> {
    if (this.isCalculating) {
      logger.debug('Disk usage calculation already in progress');
      return;
    }

    this.isCalculating = true;
    const startTime = Date.now();

    try {
      const uploadsDir = this.config.getUploadsDir();
      const streamsDir = this.config.getStreamsDir();

      // Calculate both directories in parallel
      const [uploadsDiskUsage, streamsDiskUsage] = await Promise.all([
        this.getDirectorySizeAsync(uploadsDir),
        this.getDirectorySizeAsync(streamsDir)
      ]);

      const totalDiskUsage = uploadsDiskUsage + streamsDiskUsage;

      // Update cache
      this.cache = {
        uploadsDiskUsage,
        streamsDiskUsage,
        totalDiskUsage,
        lastUpdated: new Date(),
        isCalculating: false
      };

      const duration = Date.now() - startTime;
      logger.debug('Disk usage calculated', {
        duration: `${duration}ms`,
        uploadsMB: (uploadsDiskUsage / (1024 * 1024)).toFixed(2),
        streamsMB: (streamsDiskUsage / (1024 * 1024)).toFixed(2),
        totalMB: (totalDiskUsage / (1024 * 1024)).toFixed(2)
      });

    } catch (error) {
      logger.error('Disk usage calculation failed', { error: (error as Error).message });
    } finally {
      this.isCalculating = false;
    }
  }

  /**
   * Get directory size asynchronously using fs.promises
   */
  private async getDirectorySizeAsync(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      // Check if directory exists
      try {
        await fs.promises.access(dirPath);
      } catch {
        return 0;
      }

      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

      // Process entries in batches for better performance
      const batchSize = 100;
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        
        const sizes = await Promise.all(
          batch.map(async (entry) => {
            const entryPath = path.join(dirPath, entry.name);
            
            try {
              if (entry.isDirectory()) {
                return await this.getDirectorySizeAsync(entryPath);
              } else if (entry.isFile()) {
                const stats = await fs.promises.stat(entryPath);
                return stats.size;
              }
            } catch {
              // Ignore errors for individual files
            }
            return 0;
          })
        );

        totalSize += sizes.reduce((sum, size) => sum + size, 0);
      }
    } catch (error) {
      logger.error('Failed to calculate directory size', { 
        dirPath, 
        error: (error as Error).message 
      });
    }

    return totalSize;
  }

  /**
   * Get status of the service
   */
  getStatus(): {
    isCalculating: boolean;
    lastUpdated: Date;
    cacheAgeMs: number;
    nextUpdateMs: number | null;
  } {
    const now = Date.now();
    const cacheAgeMs = now - this.cache.lastUpdated.getTime();
    
    return {
      isCalculating: this.isCalculating,
      lastUpdated: this.cache.lastUpdated,
      cacheAgeMs,
      nextUpdateMs: this.updateInterval 
        ? Math.max(0, this.UPDATE_INTERVAL_MS - cacheAgeMs)
        : null
    };
  }
}

// Export singleton instance
export const diskUsageService = new DiskUsageService();
