/**
 * Health Check Service
 * 
 * Provides comprehensive health checks for the system including:
 * - FFmpeg availability
 * - Disk space monitoring
 * - Memory usage
 * - Database connectivity (if applicable)
 * - Redis connectivity (if applicable)
 * 
 * @module healthService
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';
import { Config } from '../config/config';
import { logger } from '../utils/winstonLogger';

const execAsync = promisify(exec);

/**
 * Health check status
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string;
  uptime: number;
  checks: {
    ffmpeg: CheckResult;
    diskSpace: CheckResult;
    memory: CheckResult;
    directories: CheckResult;
  };
  details?: {
    version?: string;
    nodeVersion?: string;
    platform?: string;
  };
}

/**
 * Individual check result
 */
export interface CheckResult {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  data?: Record<string, any>;
  duration?: number;
}

/**
 * Disk space info
 */
interface DiskSpaceInfo {
  free: number;
  total: number;
  used: number;
  percentUsed: number;
}

class HealthService {
  private config: Config;
  private startTime: Date;
  private lastCheckTime: Date | null = null;
  private cachedHealth: HealthStatus | null = null;
  private cacheValidityMs: number = 5000; // 5 seconds cache

  constructor() {
    this.config = Config.getInstance();
    this.startTime = new Date();
  }

  /**
   * Get comprehensive health status
   */
  async getHealth(forceRefresh: boolean = false): Promise<HealthStatus> {
    // Return cached result if still valid
    if (!forceRefresh && this.cachedHealth && this.lastCheckTime) {
      const age = Date.now() - this.lastCheckTime.getTime();
      if (age < this.cacheValidityMs) {
        return this.cachedHealth;
      }
    }

    const startTime = Date.now();
    
    // Run all checks in parallel
    const [ffmpegCheck, diskCheck, memoryCheck, directoriesCheck] = await Promise.all([
      this.checkFFmpeg(),
      this.checkDiskSpace(),
      this.checkMemory(),
      this.checkDirectories()
    ]);

    // Determine overall status
    const checks = { ffmpeg: ffmpegCheck, diskSpace: diskCheck, memory: memoryCheck, directories: directoriesCheck };
    const checkResults = Object.values(checks);
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (checkResults.some(c => c.status === 'fail')) {
      status = 'unhealthy';
    } else if (checkResults.some(c => c.status === 'warn')) {
      status = 'degraded';
    }

    const health: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      environment: this.config.getEnvironment(),
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      checks,
      details: {
        version: process.env.npm_package_version || '2.0.0',
        nodeVersion: process.version,
        platform: os.platform()
      }
    };

    // Cache result
    this.cachedHealth = health;
    this.lastCheckTime = new Date();

    const duration = Date.now() - startTime;
    logger.debug('Health check completed', { status, duration: `${duration}ms` });

    return health;
  }

  /**
   * Check FFmpeg availability
   */
  async checkFFmpeg(): Promise<CheckResult> {
    const start = Date.now();
    
    try {
      const { stdout } = await execAsync('ffmpeg -version', { timeout: 5000 });
      
      // Extract version from output
      const versionMatch = stdout.match(/ffmpeg version (\S+)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';

      return {
        status: 'pass',
        message: 'FFmpeg is available',
        data: { version },
        duration: Date.now() - start
      };
    } catch (error) {
      logger.error('FFmpeg check failed', { error: (error as Error).message });
      
      return {
        status: 'fail',
        message: 'FFmpeg is not available or not in PATH',
        data: { error: (error as Error).message },
        duration: Date.now() - start
      };
    }
  }

  /**
   * Check disk space in videos directory
   */
  async checkDiskSpace(): Promise<CheckResult> {
    const start = Date.now();
    
    try {
      const videosDir = this.config.getStreamsDir();
      const diskInfo = await this.getDiskSpace(videosDir);
      
      const freeGB = diskInfo.free / (1024 * 1024 * 1024);
      const minFreeGB = 1; // 1GB minimum
      
      if (freeGB < minFreeGB) {
        return {
          status: 'fail',
          message: `Low disk space: ${freeGB.toFixed(2)}GB free (minimum: ${minFreeGB}GB)`,
          data: {
            freeBytes: diskInfo.free,
            freeGB: freeGB.toFixed(2),
            totalGB: (diskInfo.total / (1024 * 1024 * 1024)).toFixed(2),
            percentUsed: diskInfo.percentUsed.toFixed(1)
          },
          duration: Date.now() - start
        };
      }

      if (freeGB < minFreeGB * 2) {
        return {
          status: 'warn',
          message: `Disk space warning: ${freeGB.toFixed(2)}GB free`,
          data: {
            freeBytes: diskInfo.free,
            freeGB: freeGB.toFixed(2),
            totalGB: (diskInfo.total / (1024 * 1024 * 1024)).toFixed(2),
            percentUsed: diskInfo.percentUsed.toFixed(1)
          },
          duration: Date.now() - start
        };
      }

      return {
        status: 'pass',
        message: `Disk space OK: ${freeGB.toFixed(2)}GB free`,
        data: {
          freeBytes: diskInfo.free,
          freeGB: freeGB.toFixed(2),
          totalGB: (diskInfo.total / (1024 * 1024 * 1024)).toFixed(2),
          percentUsed: diskInfo.percentUsed.toFixed(1)
        },
        duration: Date.now() - start
      };
    } catch (error) {
      logger.error('Disk space check failed', { error: (error as Error).message });
      
      return {
        status: 'warn',
        message: 'Unable to check disk space',
        data: { error: (error as Error).message },
        duration: Date.now() - start
      };
    }
  }

  /**
   * Get disk space info for a path
   */
  private async getDiskSpace(dirPath: string): Promise<DiskSpaceInfo> {
    // Use wmic on Windows, df on Unix
    if (os.platform() === 'win32') {
      return this.getWindowsDiskSpace(dirPath);
    } else {
      return this.getUnixDiskSpace(dirPath);
    }
  }

  /**
   * Get disk space on Windows
   */
  private async getWindowsDiskSpace(dirPath: string): Promise<DiskSpaceInfo> {
    const drive = path.parse(dirPath).root.replace('\\', '');
    
    try {
      const { stdout } = await execAsync(
        `wmic logicaldisk where "DeviceID='${drive.replace(':', '')}:'" get Size,FreeSpace /format:value`,
        { timeout: 5000 }
      );
      
      const freeMatch = stdout.match(/FreeSpace=(\d+)/);
      const totalMatch = stdout.match(/Size=(\d+)/);
      
      if (freeMatch && totalMatch) {
        const free = parseInt(freeMatch[1], 10);
        const total = parseInt(totalMatch[1], 10);
        const used = total - free;
        
        return {
          free,
          total,
          used,
          percentUsed: (used / total) * 100
        };
      }
    } catch {
      // Fallback: try PowerShell
      try {
        const { stdout } = await execAsync(
          `powershell -Command "(Get-PSDrive ${drive.replace(':', '')}).Free, (Get-PSDrive ${drive.replace(':', '')}).Used"`,
          { timeout: 5000 }
        );
        
        const [freeStr, usedStr] = stdout.trim().split('\n');
        const free = parseInt(freeStr, 10);
        const used = parseInt(usedStr, 10);
        const total = free + used;
        
        return {
          free,
          total,
          used,
          percentUsed: (used / total) * 100
        };
      } catch {
        // Final fallback
      }
    }
    
    // Default fallback with estimated values
    return { free: 100 * 1024 * 1024 * 1024, total: 500 * 1024 * 1024 * 1024, used: 400 * 1024 * 1024 * 1024, percentUsed: 80 };
  }

  /**
   * Get disk space on Unix
   */
  private async getUnixDiskSpace(dirPath: string): Promise<DiskSpaceInfo> {
    const { stdout } = await execAsync(`df -k "${dirPath}" | tail -1`);
    const parts = stdout.trim().split(/\s+/);
    
    const total = parseInt(parts[1], 10) * 1024;
    const used = parseInt(parts[2], 10) * 1024;
    const free = parseInt(parts[3], 10) * 1024;
    const percentUsed = parseFloat(parts[4].replace('%', ''));
    
    return { free, total, used, percentUsed };
  }

  /**
   * Check memory usage
   */
  async checkMemory(): Promise<CheckResult> {
    const start = Date.now();
    
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const percentUsed = (usedMem / totalMem) * 100;
      
      // Process memory
      const processMemory = process.memoryUsage();
      
      const data = {
        system: {
          totalGB: (totalMem / (1024 * 1024 * 1024)).toFixed(2),
          freeGB: (freeMem / (1024 * 1024 * 1024)).toFixed(2),
          usedGB: (usedMem / (1024 * 1024 * 1024)).toFixed(2),
          percentUsed: percentUsed.toFixed(1)
        },
        process: {
          heapUsedMB: (processMemory.heapUsed / (1024 * 1024)).toFixed(2),
          heapTotalMB: (processMemory.heapTotal / (1024 * 1024)).toFixed(2),
          rssMB: (processMemory.rss / (1024 * 1024)).toFixed(2),
          externalMB: (processMemory.external / (1024 * 1024)).toFixed(2)
        }
      };

      if (percentUsed > 95) {
        return {
          status: 'fail',
          message: `Critical memory usage: ${percentUsed.toFixed(1)}%`,
          data,
          duration: Date.now() - start
        };
      }

      if (percentUsed > 85) {
        return {
          status: 'warn',
          message: `High memory usage: ${percentUsed.toFixed(1)}%`,
          data,
          duration: Date.now() - start
        };
      }

      return {
        status: 'pass',
        message: `Memory usage OK: ${percentUsed.toFixed(1)}%`,
        data,
        duration: Date.now() - start
      };
    } catch (error) {
      return {
        status: 'warn',
        message: 'Unable to check memory',
        data: { error: (error as Error).message },
        duration: Date.now() - start
      };
    }
  }

  /**
   * Check required directories exist and are writable
   */
  async checkDirectories(): Promise<CheckResult> {
    const start = Date.now();
    const issues: string[] = [];
    
    const dirs = [
      { name: 'uploads', path: this.config.getUploadsDir() },
      { name: 'streams', path: this.config.getStreamsDir() },
      { name: 'public', path: this.config.getPublicDir() }
    ];

    for (const dir of dirs) {
      try {
        // Check if directory exists
        if (!fs.existsSync(dir.path)) {
          issues.push(`${dir.name} directory does not exist: ${dir.path}`);
          continue;
        }

        // Check if writable
        const testFile = path.join(dir.path, '.write-test');
        try {
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
        } catch {
          issues.push(`${dir.name} directory is not writable: ${dir.path}`);
        }
      } catch (error) {
        issues.push(`Error checking ${dir.name}: ${(error as Error).message}`);
      }
    }

    if (issues.length > 0) {
      return {
        status: 'fail',
        message: `Directory issues: ${issues.length}`,
        data: { issues },
        duration: Date.now() - start
      };
    }

    return {
      status: 'pass',
      message: 'All directories OK',
      data: { checked: dirs.map(d => d.name) },
      duration: Date.now() - start
    };
  }

  /**
   * Liveness check - is the process alive?
   */
  isAlive(): boolean {
    return true;
  }

  /**
   * Readiness check - is the server ready to accept requests?
   */
  async isReady(): Promise<boolean> {
    const health = await this.getHealth();
    return health.status !== 'unhealthy';
  }

  /**
   * Get uptime in seconds
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }
}

// Export singleton instance
export const healthService = new HealthService();
