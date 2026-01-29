/**
 * Enhanced Statistics Service
 * Tracks comprehensive server metrics including uploads, transcodes, streams, and performance
 */

import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../config/config';

export interface UploadStats {
  videoId: string;
  filename: string;
  startTime: Date;
  endTime?: Date;
  status: 'uploading' | 'transcoding' | 'completed' | 'failed';
  fileSize: number;
  error?: string;
}

export interface TranscodeStats {
  videoId: string;
  preset: string;
  startTime: Date;
  endTime?: Date;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface StreamStats {
  videoId: string;
  startTime: Date;
  bytesServed: number;
  quality: string;
}

export interface ServerStats {
  // Video counts
  totalVideos: number;
  totalUploads: number;
  
  // Active operations
  activeUploads: number;
  activeTranscodes: number;
  activeStreams: number;
  
  // Completed operations
  completedTranscodes: number;
  failedTranscodes: number;
  completedUploads: number;
  failedUploads: number;
  
  // Streaming
  totalStreamsServed: number;
  totalBytesServed: number;
  
  // Disk usage
  uploadsDiskUsage: number; // bytes
  streamsDiskUsage: number; // bytes
  totalDiskUsage: number; // bytes
  
  // Timing averages
  averageUploadTime: number; // seconds
  averageTranscodeTime: Record<string, number>; // per preset, in seconds
  
  // Peak concurrency
  peakConcurrentUploads: number;
  peakConcurrentStreams: number;
  
  // Timestamps
  lastUpload: Date | null;
  lastStream: Date | null;
  serverStartTime: Date;
}

class StatisticsService {
  private stats: ServerStats;
  private uploadHistory: Map<string, UploadStats>;
  private transcodeHistory: Map<string, TranscodeStats[]>;
  private activeStreamSessions: Map<string, StreamStats>;
  private config: Config;

  constructor() {
    this.config = Config.getInstance();
    this.uploadHistory = new Map();
    this.transcodeHistory = new Map();
    this.activeStreamSessions = new Map();
    
    this.stats = {
      totalVideos: 0,
      totalUploads: 0,
      activeUploads: 0,
      activeTranscodes: 0,
      activeStreams: 0,
      completedTranscodes: 0,
      failedTranscodes: 0,
      completedUploads: 0,
      failedUploads: 0,
      totalStreamsServed: 0,
      totalBytesServed: 0,
      uploadsDiskUsage: 0,
      streamsDiskUsage: 0,
      totalDiskUsage: 0,
      averageUploadTime: 0,
      averageTranscodeTime: {},
      peakConcurrentUploads: 0,
      peakConcurrentStreams: 0,
      lastUpload: null,
      lastStream: null,
      serverStartTime: new Date()
    };
  }

  // Upload tracking
  public startUpload(videoId: string, filename: string, fileSize: number): void {
    this.uploadHistory.set(videoId, {
      videoId,
      filename,
      startTime: new Date(),
      status: 'uploading',
      fileSize
    });
    
    this.stats.activeUploads++;
    this.stats.totalUploads++;
    
    if (this.stats.activeUploads > this.stats.peakConcurrentUploads) {
      this.stats.peakConcurrentUploads = this.stats.activeUploads;
    }
  }

  public updateUploadStatus(videoId: string, status: 'transcoding' | 'completed' | 'failed', error?: string): void {
    const upload = this.uploadHistory.get(videoId);
    if (upload) {
      upload.status = status;
      upload.endTime = new Date();
      if (error) upload.error = error;
      
      if (status === 'completed') {
        this.stats.completedUploads++;
        this.stats.totalVideos++;
        this.stats.activeUploads = Math.max(0, this.stats.activeUploads - 1);
        this.stats.lastUpload = new Date();
        
        // Update average upload time
        const duration = (upload.endTime.getTime() - upload.startTime.getTime()) / 1000;
        this.updateAverageUploadTime(duration);
      } else if (status === 'failed') {
        this.stats.failedUploads++;
        this.stats.activeUploads = Math.max(0, this.stats.activeUploads - 1);
      }
    }
  }

  // Transcode tracking
  public startTranscode(videoId: string, preset: string): void {
    if (!this.transcodeHistory.has(videoId)) {
      this.transcodeHistory.set(videoId, []);
    }
    
    this.transcodeHistory.get(videoId)!.push({
      videoId,
      preset,
      startTime: new Date(),
      status: 'processing'
    });
    
    this.stats.activeTranscodes++;
  }

  public completeTranscode(videoId: string, preset: string, success: boolean = true, error?: string): void {
    const transcodes = this.transcodeHistory.get(videoId);
    if (transcodes) {
      const transcode = transcodes.find(t => t.preset === preset && t.status === 'processing');
      if (transcode) {
        transcode.status = success ? 'completed' : 'failed';
        transcode.endTime = new Date();
        if (error) transcode.error = error;
        
        this.stats.activeTranscodes = Math.max(0, this.stats.activeTranscodes - 1);
        
        if (success) {
          this.stats.completedTranscodes++;
          
          // Update average transcode time for this preset
          const duration = (transcode.endTime.getTime() - transcode.startTime.getTime()) / 1000;
          this.updateAverageTranscodeTime(preset, duration);
        } else {
          this.stats.failedTranscodes++;
        }
      }
    }
  }

  // Stream tracking
  public startStream(sessionId: string, videoId: string, quality: string): void {
    this.activeStreamSessions.set(sessionId, {
      videoId,
      startTime: new Date(),
      bytesServed: 0,
      quality
    });
    
    this.stats.activeStreams++;
    this.stats.totalStreamsServed++;
    
    if (this.stats.activeStreams > this.stats.peakConcurrentStreams) {
      this.stats.peakConcurrentStreams = this.stats.activeStreams;
    }
    
    this.stats.lastStream = new Date();
  }

  public updateStreamBytes(sessionId: string, bytes: number): void {
    const session = this.activeStreamSessions.get(sessionId);
    if (session) {
      session.bytesServed += bytes;
      this.stats.totalBytesServed += bytes;
    }
  }

  public endStream(sessionId: string): void {
    if (this.activeStreamSessions.delete(sessionId)) {
      this.stats.activeStreams = Math.max(0, this.stats.activeStreams - 1);
    }
  }

  // Video deletion
  public recordVideoDelete(): void {
    if (this.stats.totalVideos > 0) {
      this.stats.totalVideos--;
    }
  }

  // Disk usage calculation
  public updateDiskUsage(): void {
    try {
      const uploadsDir = this.config.getUploadsDir();
      const streamsDir = this.config.getStreamsDir();
      
      this.stats.uploadsDiskUsage = this.getDirectorySize(uploadsDir);
      this.stats.streamsDiskUsage = this.getDirectorySize(streamsDir);
      this.stats.totalDiskUsage = this.stats.uploadsDiskUsage + this.stats.streamsDiskUsage;
    } catch (error) {
      // Ignore errors
    }
  }

  private getDirectorySize(dirPath: string): number {
    let totalSize = 0;
    
    try {
      if (!fs.existsSync(dirPath)) {
        return 0;
      }
      
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return totalSize;
  }

  // Average time calculations
  private updateAverageUploadTime(duration: number): void {
    const count = this.stats.completedUploads;
    const currentAvg = this.stats.averageUploadTime;
    this.stats.averageUploadTime = ((currentAvg * (count - 1)) + duration) / count;
  }

  private updateAverageTranscodeTime(preset: string, duration: number): void {
    const currentAvg = this.stats.averageTranscodeTime[preset] || 0;
    const completedForPreset = Array.from(this.transcodeHistory.values())
      .flat()
      .filter(t => t.preset === preset && t.status === 'completed')
      .length;
    
    this.stats.averageTranscodeTime[preset] = 
      ((currentAvg * (completedForPreset - 1)) + duration) / completedForPreset;
  }

  // Set video count (for cache refresh)
  public setTotalVideos(count: number): void {
    this.stats.totalVideos = count;
  }

  // Get current stats
  public getStats(): ServerStats {
    // Update disk usage before returning stats
    this.updateDiskUsage();
    return { ...this.stats };
  }

  // Reset stats
  public resetStats(): void {
    const serverStartTime = this.stats.serverStartTime;
    
    this.uploadHistory.clear();
    this.transcodeHistory.clear();
    this.activeStreamSessions.clear();
    
    this.stats = {
      totalVideos: this.stats.totalVideos, // Keep current video count
      totalUploads: 0,
      activeUploads: 0,
      activeTranscodes: 0,
      activeStreams: 0,
      completedTranscodes: 0,
      failedTranscodes: 0,
      completedUploads: 0,
      failedUploads: 0,
      totalStreamsServed: 0,
      totalBytesServed: 0,
      uploadsDiskUsage: 0,
      streamsDiskUsage: 0,
      totalDiskUsage: 0,
      averageUploadTime: 0,
      averageTranscodeTime: {},
      peakConcurrentUploads: 0,
      peakConcurrentStreams: 0,
      lastUpload: null,
      lastStream: null,
      serverStartTime
    };
  }
}

export const statisticsService = new StatisticsService();
