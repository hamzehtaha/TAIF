/**
 * Global Type Definitions and Interfaces
 * 
 * Defines all TypeScript interfaces, types, and enums used throughout the application.
 * Ensures type safety and provides better IDE support with autocomplete.
 * 
 * @module types
 */

/**
 * Application environment mode
 * @enum {string}
 */
export enum EnvironmentMode {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TESTING = 'testing'
}

/**
 * Log level severity
 * @enum {string}
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * Error codes for structured error handling
 * @enum {string}
 */
export enum ErrorCode {
  // Upload errors
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  INVALID_FORMAT = 'INVALID_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  DUPLICATE_ID = 'DUPLICATE_ID',
  NO_FILE = 'NO_FILE',
  
  // Transcode errors
  TRANSCODE_FAILED = 'TRANSCODE_FAILED',
  FFMPEG_ERROR = 'FFMPEG_ERROR',
  METADATA_EXTRACTION_FAILED = 'METADATA_EXTRACTION_FAILED',
  
  // Video errors
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  STREAM_NOT_FOUND = 'STREAM_NOT_FOUND',
  
  // Auth errors
  AUTH_FAILED = 'AUTH_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  DISK_FULL = 'DISK_FULL'
}

/**
 * Video quality preset for transcoding
 * @enum {string}
 */
export enum VideoQuality {
  LOW = '360p',
  MEDIUM = '480p',
  HIGH = '720p',
  ULTRA = '1080p'
}

/**
 * Upload status for progress tracking
 */
export type UploadStatus = 'uploading' | 'uploaded' | 'failed';

/**
 * Transcode stage for progress tracking
 */
export type TranscodeStage = 
  | 'idle'
  | 'transcoding_360p'
  | 'transcoding_480p'
  | 'transcoding_720p'
  | 'transcoding_1080p'
  | 'completed'
  | 'failed';

/**
 * Upload progress model - tracks file upload phase
 */
export interface UploadProgress {
  /** Unique upload identifier */
  uploadId: string;
  /** Video identifier (may not exist during upload) */
  videoId?: string;
  /** Original video filename */
  videoName: string;
  /** Bytes received so far */
  bytesReceived: number;
  /** Total file size in bytes */
  totalBytes: number;
  /** Upload progress percentage (0-100) */
  percent: number;
  /** Current upload status */
  status: UploadStatus;
  /** Error message if failed */
  error?: string;
}

/**
 * Transcode progress model - tracks transcoding phase
 */
export interface TranscodeProgress {
  /** Unique upload identifier */
  uploadId: string;
  /** Video identifier */
  videoId: string;
  /** Original video filename */
  videoName: string;
  /** Current transcoding stage */
  currentStage: TranscodeStage;
  /** Progress within current stage (0-100) */
  stageProgressPercent: number;
  /** Overall transcoding progress (0-100) */
  overallProgressPercent: number;
  /** Current FPS during transcoding */
  currentFps?: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Server configuration object
 * Contains all environment-based settings
 */
export interface ServerConfig {
  /** Server environment mode */
  environment: EnvironmentMode;
  
  /** API server port number */
  port: number;
  
  /** Admin portal port number */
  adminPort: number;
  
  /** Log level for output */
  logLevel: LogLevel;
  
  /** CORS enabled flag */
  corsEnabled: boolean;
  
  /** Allowed CORS origins */
  allowedOrigins: string;
  
  /** Maximum file upload size in bytes */
  maxFileSize: number;
  
  /** Video transcoding enabled flag */
  enableTranscoding: boolean;
  
  /** Array of video quality presets to transcode to */
  transcodingPresets: VideoQuality[];
}

/**
 * Directory paths configuration
 */
export interface DirectoryConfig {
  /** Base public directory path */
  public: string;
  
  /** Video uploads directory path */
  uploads: string;
  
  /** Video streams directory path */
  streams: string;
}

/**
 * Video file metadata
 */
export interface VideoMetadata {
  /** Unique video identifier (UUID v4) */
  id: string;
  
  /** Original video file name */
  name: string;
  
  /** Video file size in bytes */
  size: number;
  
  /** MIME type of video */
  mimeType: string;
  
  /** Timestamp when video was uploaded */
  uploadedAt: Date;
  
  /** Array of available quality presets */
  qualities: VideoQuality[];
  
  /** Flag indicating transcoding completion */
  isTranscoded: boolean;
  
  /** Duration of video in seconds */
  duration?: number;
  
  /** Video width in pixels */
  width?: number;
  
  /** Video height in pixels */
  height?: number;
  
  /** Video codec */
  codec?: string;
  
  /** Frames per second */
  fps?: number;
  
  /** Bitrate in bits per second */
  bitrate?: number;
  
  /** Audio codec */
  audioCodec?: string;
  
  /** Audio channels */
  channels?: number;
  
  /** Video format */
  format?: string;
}

/**
 * Video processing response
 */
export interface ProcessingResponse {
  /** Success flag */
  success: boolean;
  
  /** Status message */
  message: string;
  
  /** Video ID if successful */
  videoId?: string;
  
  /** Error message if failed */
  error?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  /** Success flag */
  success: boolean;
  
  /** Response message */
  message: string;
  
  /** Response data (generic type)  */
  data?: T;
  
  /** Error details if applicable */
  error?: string;
  
  /** Response timestamp */
  timestamp: Date;
}

/**
 * Upload request body
 */
export interface UploadRequest {
  /** Uploaded file - Express.Multer.File type */
  file: Express.Multer.File;
}

/**
 * List videos response data
 */
export interface VideoListResponse {
  /** Array of video metadata */
  videos: VideoMetadata[];
  
  /** Total count of videos */
  totalCount: number;
  
  /** Timestamp of response */
  timestamp: Date;
}

/**
 * Stream quality option
 */
export interface StreamQuality {
  /** Quality preset identifier */
  quality: VideoQuality;
  
  /** Bitrate in kbps */
  bitrate: number;
  
  /** Resolution */
  resolution: string;
}

/**
 * Custom application error
 */
export interface AppError extends Error {
  /** HTTP status code */
  statusCode: number;
  
  /** Error code identifier */
  errorCode: string;
  
  /** Detailed error message */
  message: string;
}

/**
 * Request context with user/session data
 */
export interface RequestContext {
  /** Request ID for tracking */
  requestId: string;
  
  /** Request timestamp */
  timestamp: Date;
  
  /** Client IP address */
  clientIp: string;
  
  /** Request user agent */
  userAgent: string;
}

/**
 * Transcoding job details
 */
export interface TranscodingJob {
  /** Unique job identifier */
  jobId: string;
  
  /** Video being transcoded */
  videoId: string;
  
  /** Target quality preset */
  targetQuality: VideoQuality;
  
  /** Current progress percentage (0-100) */
  progress: number;
  
  /** Job status */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  
  /** Job start time */
  startedAt: Date;
  
  /** Job completion time */
  completedAt?: Date;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Server health status
 */
export interface HealthStatus {
  /** Overall server health */
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  /** Detailed status message */
  message: string;
  
  /** Server uptime in seconds */
  uptime: number;
  
  /** Memory usage in bytes */
  memoryUsage: number;
  
  /** FFmpeg availability */
  ffmpegAvailable: boolean;
  
  /** Disk space available in bytes */
  diskSpaceAvailable: number;
  
  /** Response timestamp */
  timestamp: Date;
}

/**
 * FFprobe metadata format section
 */
export interface FFprobeFormat {
  filename?: string;
  nb_streams?: number;
  format_name?: string;
  format_long_name?: string;
  duration?: string | number;
  size?: string | number;
  bit_rate?: string | number;
  tags?: Record<string, string>;
}

/**
 * FFprobe stream information
 */
export interface FFprobeStream {
  index: number;
  codec_name?: string;
  codec_long_name?: string;
  codec_type: 'video' | 'audio' | 'subtitle' | 'data';
  width?: number;
  height?: number;
  coded_width?: number;
  coded_height?: number;
  r_frame_rate?: string;
  avg_frame_rate?: string;
  duration?: string;
  bit_rate?: string;
  nb_frames?: string;
  sample_rate?: string;
  channels?: number;
  channel_layout?: string;
  tags?: Record<string, string>;
}

/**
 * FFprobe complete metadata result
 */
export interface FFprobeData {
  streams: FFprobeStream[];
  format: FFprobeFormat;
}

/**
 * FFmpeg transcoding progress data
 */
export interface FFmpegProgress {
  frames?: number;
  currentFps?: number;
  currentKbps?: number;
  targetSize?: number;
  timemark?: string;
  percent?: number;
}

/**
 * Logger data type - allows any JSON-serializable value
 */
export type LoggerData = Record<string, unknown>;
