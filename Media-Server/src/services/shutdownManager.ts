/**
 * Graceful Shutdown Manager
 * 
 * Handles graceful shutdown of the server with:
 * - SIGTERM and SIGINT signal handlers
 * - Active job tracking and waiting
 * - Configurable shutdown timeout (default 30s)
 * - Socket.IO graceful close
 * - Proper cleanup of resources
 * 
 * @module shutdownManager
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/winstonLogger';

/**
 * Active job tracking
 */
interface ActiveJob {
  id: string;
  type: 'upload' | 'transcode' | 'cleanup';
  startTime: Date;
  description: string;
}

/**
 * Shutdown status
 */
export interface ShutdownStatus {
  isShuttingDown: boolean;
  shutdownStartTime: Date | null;
  activeJobs: ActiveJob[];
  acceptingNewRequests: boolean;
  shutdownTimeoutMs: number;
  remainingTimeMs: number | null;
}

class ShutdownManager {
  private isShuttingDown: boolean = false;
  private shutdownStartTime: Date | null = null;
  private activeJobs: Map<string, ActiveJob> = new Map();
  private shutdownTimeoutMs: number = 30000; // 30 seconds
  private httpServer: HTTPServer | null = null;
  private socketIO: SocketIOServer | null = null;
  private shutdownPromise: Promise<void> | null = null;
  private shutdownResolve: (() => void) | null = null;
  private cleanupCallbacks: Array<() => Promise<void>> = [];

  /**
   * Initialize the shutdown manager with server instances
   */
  initialize(httpServer: HTTPServer, socketIO?: SocketIOServer): void {
    this.httpServer = httpServer;
    this.socketIO = socketIO || null;

    // Register signal handlers
    process.on('SIGTERM', () => this.handleShutdownSignal('SIGTERM'));
    process.on('SIGINT', () => this.handleShutdownSignal('SIGINT'));

    // Handle Windows-specific signals
    if (process.platform === 'win32') {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.on('SIGINT', () => this.handleShutdownSignal('SIGINT'));
    }

    logger.info('Shutdown manager initialized', { 
      timeoutMs: this.shutdownTimeoutMs 
    });
  }

  /**
   * Register a cleanup callback to be called during shutdown
   */
  registerCleanupCallback(callback: () => Promise<void>): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Handle shutdown signal
   */
  private async handleShutdownSignal(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress, forcing exit...', { signal });
      process.exit(1);
    }

    logger.info(`Received ${signal} signal, initiating graceful shutdown...`);
    
    await this.initiateShutdown();
  }

  /**
   * Initiate graceful shutdown
   */
  async initiateShutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return this.shutdownPromise!;
    }

    this.isShuttingDown = true;
    this.shutdownStartTime = new Date();

    this.shutdownPromise = new Promise<void>(resolve => {
      this.shutdownResolve = resolve;
    });

    logger.info('Graceful shutdown initiated', {
      activeJobs: this.activeJobs.size,
      timeoutMs: this.shutdownTimeoutMs
    });

    // Notify connected clients
    if (this.socketIO) {
      this.socketIO.emit('system-notification', {
        type: 'warning',
        message: 'Server is shutting down...',
        timestamp: new Date()
      });
    }

    // Stop accepting new connections
    if (this.httpServer) {
      this.httpServer.close((err) => {
        if (err) {
          logger.error('Error closing HTTP server', { error: err.message });
        } else {
          logger.info('HTTP server closed, no longer accepting new connections');
        }
      });
    }

    // Wait for active jobs or timeout
    const waitStart = Date.now();
    
    while (this.activeJobs.size > 0) {
      const elapsed = Date.now() - waitStart;
      const remaining = this.shutdownTimeoutMs - elapsed;

      if (remaining <= 0) {
        logger.warn('Shutdown timeout reached, forcing shutdown', {
          remainingJobs: this.activeJobs.size,
          jobs: Array.from(this.activeJobs.values()).map(j => ({
            id: j.id,
            type: j.type,
            description: j.description
          }))
        });
        break;
      }

      logger.info(`Waiting for ${this.activeJobs.size} active jobs to complete...`, {
        remainingTimeMs: remaining,
        jobs: Array.from(this.activeJobs.values()).map(j => j.description)
      });

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Run cleanup callbacks
    logger.info('Running cleanup callbacks...');
    for (const callback of this.cleanupCallbacks) {
      try {
        await callback();
      } catch (error) {
        logger.error('Cleanup callback failed', { error: (error as Error).message });
      }
    }

    // Close Socket.IO
    if (this.socketIO) {
      logger.info('Closing Socket.IO connections...');
      this.socketIO.close();
    }

    logger.info('Graceful shutdown completed');
    
    if (this.shutdownResolve) {
      this.shutdownResolve();
    }

    // Give logs time to flush
    await new Promise(resolve => setTimeout(resolve, 500));

    process.exit(0);
  }

  /**
   * Register an active job
   */
  registerJob(id: string, type: 'upload' | 'transcode' | 'cleanup', description: string): void {
    this.activeJobs.set(id, {
      id,
      type,
      startTime: new Date(),
      description
    });

    logger.debug('Job registered', { id, type, description, activeJobs: this.activeJobs.size });
  }

  /**
   * Unregister a completed job
   */
  unregisterJob(id: string): void {
    const job = this.activeJobs.get(id);
    if (job) {
      const duration = Date.now() - job.startTime.getTime();
      logger.debug('Job completed', { 
        id, 
        type: job.type, 
        duration: `${duration}ms`,
        activeJobs: this.activeJobs.size - 1
      });
    }
    this.activeJobs.delete(id);
  }

  /**
   * Check if we're accepting new requests
   */
  isAcceptingRequests(): boolean {
    return !this.isShuttingDown;
  }

  /**
   * Get current shutdown status
   */
  getStatus(): ShutdownStatus {
    let remainingTimeMs: number | null = null;
    
    if (this.isShuttingDown && this.shutdownStartTime) {
      const elapsed = Date.now() - this.shutdownStartTime.getTime();
      remainingTimeMs = Math.max(0, this.shutdownTimeoutMs - elapsed);
    }

    return {
      isShuttingDown: this.isShuttingDown,
      shutdownStartTime: this.shutdownStartTime,
      activeJobs: Array.from(this.activeJobs.values()),
      acceptingNewRequests: !this.isShuttingDown,
      shutdownTimeoutMs: this.shutdownTimeoutMs,
      remainingTimeMs
    };
  }

  /**
   * Set shutdown timeout
   */
  setShutdownTimeout(timeoutMs: number): void {
    this.shutdownTimeoutMs = timeoutMs;
    logger.info('Shutdown timeout updated', { timeoutMs });
  }

  /**
   * Get active job count
   */
  getActiveJobCount(): number {
    return this.activeJobs.size;
  }

  /**
   * Get active jobs by type
   */
  getActiveJobsByType(type: 'upload' | 'transcode' | 'cleanup'): ActiveJob[] {
    return Array.from(this.activeJobs.values()).filter(job => job.type === type);
  }

  /**
   * Check if shutting down
   */
  isInShutdown(): boolean {
    return this.isShuttingDown;
  }
}

// Export singleton instance
export const shutdownManager = new ShutdownManager();
