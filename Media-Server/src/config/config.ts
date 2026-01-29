/**
 * Application Configuration
 * Centralized configuration management with environment variable validation.
 */

import * as path from 'path';
import { config as loadEnv } from 'dotenv';
import {
  ServerConfig,
  DirectoryConfig,
  EnvironmentMode,
  LogLevel,
  VideoQuality
} from '../types';

loadEnv();

export class Config {
  private static instance: Config;
  private serverConfig: ServerConfig;
  private directoryConfig: DirectoryConfig;

  private constructor() {
    this.validateEnvironment();
    this.serverConfig = this.initializeServerConfig();
    this.directoryConfig = this.initializeDirectoryConfig();
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private validateEnvironment(): void {
    const required = ['VIDEO_UPLOAD_DIR', 'VIDEO_STREAM_DIR'];
    
    for (const variable of required) {
      if (!process.env[variable]) {
        throw new Error(`Missing required environment variable: ${variable}`);
      }
    }

    if (process.env.PORT && isNaN(Number(process.env.PORT))) {
      throw new Error('PORT must be a valid number');
    }

    const validModes = Object.values(EnvironmentMode);
    const nodeEnv = process.env.NODE_ENV || EnvironmentMode.DEVELOPMENT;
    if (!validModes.includes(nodeEnv as EnvironmentMode)) {
      throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
    }

    if (process.env.LOG_LEVEL) {
      const validLogLevels = Object.values(LogLevel);
      if (!validLogLevels.includes(process.env.LOG_LEVEL as LogLevel)) {
        throw new Error(`Invalid LOG_LEVEL: ${process.env.LOG_LEVEL}`);
      }
    }
  }

  private initializeServerConfig(): ServerConfig {
    const presetsString = process.env.TRANSCODING_PRESETS || '360p,480p,720p,1080p';
    const presets = presetsString
      .split(',')
      .map(p => p.trim())
      .filter(p => Object.values(VideoQuality).includes(p as VideoQuality)) as VideoQuality[];

    return {
      environment: (process.env.NODE_ENV || EnvironmentMode.DEVELOPMENT) as EnvironmentMode,
      port: Number(process.env.PORT) || 3000,
      adminPort: Number(process.env.ADMIN_PORT) || 3001,
      logLevel: (process.env.LOG_LEVEL || LogLevel.INFO) as LogLevel,
      corsEnabled: process.env.CORS_ENABLED !== 'false',
      allowedOrigins: process.env.ALLOWED_ORIGINS || '*',
      maxFileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 * 1024,
      enableTranscoding: process.env.ENABLE_TRANSCODING !== 'false',
      transcodingPresets: presets.length > 0 ? presets : [VideoQuality.LOW, VideoQuality.MEDIUM]
    };
  }

  private initializeDirectoryConfig(): DirectoryConfig {
    const projectRoot = process.cwd();

    return {
      public: path.resolve(projectRoot, 'public'),
      uploads: path.resolve(projectRoot, process.env.VIDEO_UPLOAD_DIR!),
      streams: path.resolve(projectRoot, process.env.VIDEO_STREAM_DIR!)
    };
  }

  public getServerConfig(): ServerConfig {
    return this.serverConfig;
  }

  public getDirectoryConfig(): DirectoryConfig {
    return this.directoryConfig;
  }

  public getPort(): number {
    return this.serverConfig.port;
  }

  public getAdminPort(): number {
    return this.serverConfig.adminPort;
  }

  public getEnvironment(): EnvironmentMode {
    return this.serverConfig.environment;
  }

  public getLogLevel(): LogLevel {
    return this.serverConfig.logLevel;
  }

  public getTranscodingPresets(): VideoQuality[] {
    return this.serverConfig.transcodingPresets;
  }

  public isTranscodingEnabled(): boolean {
    return this.serverConfig.enableTranscoding;
  }

  public isCorsEnabled(): boolean {
    return this.serverConfig.corsEnabled;
  }

  public getMaxFileSize(): number {
    return this.serverConfig.maxFileSize;
  }

  public getAllowedOrigins(): string {
    return this.serverConfig.allowedOrigins;
  }

  public getUploadsDir(): string {
    return this.directoryConfig.uploads;
  }

  public getStreamsDir(): string {
    return this.directoryConfig.streams;
  }

  public getPublicDir(): string {
    return this.directoryConfig.public;
  }

  public getJwtSecret(): string {
    return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  public getAllowedFormats(): string[] {
    const formats = process.env.ALLOWED_FORMATS || 'mp4,mkv,avi,mov,wmv,flv,webm';
    return formats.split(',').map(f => f.trim());
  }

  public getAllConfig(): object {
    return {
      server: this.serverConfig,
      directories: this.directoryConfig
    };
  }
}

export const config = Config.getInstance();
