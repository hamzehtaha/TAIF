/**
 * Video Processor Service - TypeScript Implementation
 *
 * Handles FFmpeg video transcoding for multiple resolutions and quality presets.
 * Provides async/await interface for non-blocking video processing operations.
 * Extracts metadata and transcodes videos to various quality levels for adaptive streaming.
 *
 * Features:
 * - FFmpeg-based video transcoding with fluent-ffmpeg
 * - Multi-resolution transcoding (360p, 480p, 720p, 1080p)
 * - Video metadata extraction (duration, resolution, codecs)
 * - Preset-based configuration for different quality levels
 * - Progress tracking for long-running operations
 * - Comprehensive error handling and logging
 * - Async/await pattern for non-blocking I/O
 *
 * Transcoding Process:
 * 1. Validate input file exists
 * 2. Create output directory structure
 * 3. For each quality preset:
 *    - Configure FFmpeg codec and bitrate
 *    - Transcode to target resolution
 *    - Track progress with callbacks
 *    - Collect results with file paths
 *
 * Video Presets:
 * - 360p: Low bandwidth, mobile-friendly (500-800 kbps)
 * - 480p: Standard definition (1000-1400 kbps)
 * - 720p: HD quality (2000-3000 kbps)
 * - 1080p: Full HD quality (4000-6000 kbps)
 *
 * @module videoProcessor
 * @example
 * const processor = new VideoProcessor();
 * const metadata = await processor.getVideoMetadata('./input.mp4');
 * const results = await processor.transcodeVideo('./input.mp4', './output', 'videoId');
 *
 * @see {@link Config} for transcoding presets configuration
 * @see {@link FileUtil} for file operations
 */

import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { logger as winstonLogger } from '../utils/winstonLogger';
import { FileUtil } from '../utils/fileUtil';
import { Config } from '../config/config';
import { 
  LogLevel, 
  VideoMetadata, 
  TranscodeStage, 
  ErrorCode,
  FFprobeData,
  FFprobeStream,
  FFmpegProgress
} from '../types';
import { statisticsService } from './statisticsService';
import { socketService } from './socketService';
import { cleanupService } from './cleanupService';
import { shutdownManager } from './shutdownManager';

/**
 * Interface for transcoding preset configuration
 */
interface TranscodingPreset {
  /** Resolution string (e.g., "1280x720") */
  resolution: string;
  /** Video bitrate (e.g., "2500k") */
  bitrate: string;
  /** Maximum bitrate for rate control (e.g., "3000k") */
  maxrate: string;
  /** Buffer size for rate control (e.g., "6000k") */
  bufsize: string;
}

/**
 * Interface for transcoding results
 */
interface TranscodingResult {
  /** Output file path for this preset */
  file: string;
  /** Preset name (e.g., "720p") */
  preset: string;
  /** Resolution string (e.g., "1280x720") */
  resolution: string;
}

/**
 * Interface for collected transcoding results
 */
interface TranscodingResults {
  [presetName: string]: TranscodingResult;
}

/**
 * Custom error class for transcoding errors with structured information
 */
export class TranscodeError extends Error {
  public readonly code: ErrorCode;
  public readonly stage: string;
  public readonly timestamp: string;

  constructor(code: ErrorCode, message: string, stage: string) {
    super(message);
    this.name = 'TranscodeError';
    this.code = code;
    this.stage = stage;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      stage: this.stage,
      timestamp: this.timestamp
    };
  }
}

/**
 * Video Processor service - Handles FFmpeg transcoding operations
 *
 * Manages video transcoding to multiple resolutions for adaptive streaming.
 * Uses FFmpeg library for video processing operations.
 * Provides async/await interface for non-blocking operations.
 *
 * Configuration:
 * - Uses transcoding presets from Config module
 * - Configurable log level for debug information
 * - Supports custom FFmpeg path if not in PATH
 *
 * @class VideoProcessor
 */
export class VideoProcessor {
  /**
   * Logger instance for diagnostic output
   * @private
   */
  private readonly logger: Logger;

  /**
   * Transcoding presets from configuration
   * @private
   */
  private readonly presets: Record<string, TranscodingPreset>;

  /**
   * Config singleton instance
   * @private
   */
  private readonly config: Config;

  /**
   * Initialize video processor with configuration
   *
   * Sets up logger and loads transcoding presets from configuration.
   * Uses config log level to control FFmpeg debug output.
   *
   * @constructor
   * @example
   * const processor = new VideoProcessor();
   * const metadata = await processor.getVideoMetadata('./video.mp4');
   */
  constructor() {
    // Get config instance
    this.config = Config.getInstance();

    // Initialize logger with configured log level
    this.logger = new Logger(
      this.config.getLogLevel() || LogLevel.INFO
    );

    // Preset configurations for each quality level
    const presetConfigs: Record<string, TranscodingPreset> = {
      '360p': {
        resolution: '640x360',
        bitrate: '800k',
        maxrate: '856k',
        bufsize: '1200k'
      },
      '480p': {
        resolution: '854x480',
        bitrate: '1400k',
        maxrate: '1498k',
        bufsize: '2100k'
      },
      '720p': {
        resolution: '1280x720',
        bitrate: '2800k',
        maxrate: '2996k',
        bufsize: '4200k'
      },
      '1080p': {
        resolution: '1920x1080',
        bitrate: '5000k',
        maxrate: '5350k',
        bufsize: '7500k'
      }
    };

    // Load transcoding presets from config - convert quality array to preset record
    const presetsArray = this.config.getTranscodingPresets();
    this.presets = {} as Record<string, TranscodingPreset>;
    
    // Map quality names to preset configurations
    presetsArray.forEach((quality: string) => {
      if (presetConfigs[quality]) {
        this.presets[quality] = presetConfigs[quality];
      }
    });
    
    this.logger.info('VideoProcessor initialized with presets', {
      count: Object.keys(this.presets).length,
      presets: Object.keys(this.presets)
    });
  }

  /**
   * Transcode video to multiple resolutions with progress tracking
   *
   * Main transcoding operation that converts input video to multiple
   * quality presets for adaptive streaming. Creates output directory
   * structure and processes each preset sequentially.
   *
   * Process:
   * 1. Validate input file exists
   * 2. Create output directory
   * 3. Loop through each preset:
   *    a. Call transcodeResolution() for single preset
   *    b. Collect output file path
   *    c. Report progress via callback
   * 4. Return map of results
   *
   * @async
   * @method transcodeVideo
   * @param {string} inputPath - Path to input video file
   * @param {string} outputDir - Directory to save transcoded files
   * @param {string} videoId - Unique video identifier (for logging)
   * @param {string} uploadId - Upload identifier for progress tracking
   * @param {string} videoName - Video filename for progress tracking
   *
   * @returns {Promise<TranscodingResults>} Map of preset names to file paths
   * @throws {Error} If input file doesn't exist or transcoding fails
   *
   * @example
   * // Transcode video to all presets
   * const results = await processor.transcodeVideo(
   *   './videos/uploads/input.mp4',
   *   './videos/streams/videoId',
   *   'videoId',
   *   'uploadId123',
   *   'video.mp4'
   * );
   */
  async transcodeVideo(
    inputPath: string,
    outputDir: string,
    videoId: string,
    uploadId: string,
    videoName: string
  ): Promise<TranscodingResults> {
    // Register job with shutdown manager
    const jobId = `transcode-${videoId}`;
    shutdownManager.registerJob(jobId, 'transcode', `Transcoding ${videoName}`);
    
    let currentPreset: string = '';
    
    try {
      // Log transcoding start
      this.logger.info(`Starting transcoding for video: ${videoId}`, {
        inputPath,
        outputDir,
        presetCount: Object.keys(this.presets).length
      });
      
      winstonLogger.info(`Starting transcoding for video: ${videoId}`, {
        inputPath,
        outputDir,
        presetCount: Object.keys(this.presets).length
      });

      // Validate input file exists
      if (!FileUtil.fileExists(inputPath)) {
        throw new TranscodeError(
          ErrorCode.TRANSCODE_FAILED,
          `Input file not found: ${inputPath}`,
          'file_validation'
        );
      }

      // Create output directory if needed
      await FileUtil.createDirIfNotExists(outputDir);

      // Get video metadata to calculate progress accurately
      let metadata: VideoMetadata;
      try {
        metadata = await this.getVideoMetadata(inputPath);
      } catch (error) {
        throw new TranscodeError(
          ErrorCode.METADATA_EXTRACTION_FAILED,
          `Failed to extract video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'metadata_extraction'
        );
      }
      
      const videoDuration = metadata.duration || 0;

      // Map to collect results from each preset
      const results: TranscodingResults = {};
      const presetNames: string[] = Object.keys(this.presets);
      const totalPresets = presetNames.length;

      // Process each preset sequentially
      for (let i = 0; i < presetNames.length; i++) {
        const presetName = presetNames[i];
        currentPreset = presetName;
        const preset: TranscodingPreset = this.presets[presetName];

        this.logger.info(`Transcoding ${videoId} to ${presetName}`, {
          resolution: preset.resolution,
          bitrate: preset.bitrate
        });
        
        // Track transcode start
        statisticsService.startTranscode(videoId, presetName);

        // Map preset name to transcode stage
        const stage: TranscodeStage = `transcoding_${presetName}` as TranscodeStage;

        // Generate output file path for this preset
        const outputPath: string = path.join(
          outputDir,
          `${presetName}.mp4`
        );

        try {
          // Perform transcoding for this preset with progress tracking
          await this.transcodeResolution(
            inputPath, 
            outputPath, 
            preset,
            videoDuration,
            (stagePercent: number, fps: number) => {
              // Calculate overall progress (across all presets)
              const baseProgress = (i / totalPresets) * 100;
              const stageWeight = 100 / totalPresets;
              const overallPercent = Math.round(baseProgress + (stagePercent / 100) * stageWeight);
              
              // Emit progress via socketService
              socketService.updateTranscodeProgress({
                uploadId,
                videoId,
                videoName,
                currentStage: stage,
                stageProgressPercent: Math.round(stagePercent),
                overallProgressPercent: overallPercent,
                currentFps: fps
              });
            }
          );
          
          // Track transcode completion
          statisticsService.completeTranscode(videoId, presetName, true);
        } catch (error) {
          // Track transcode failure
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          statisticsService.completeTranscode(videoId, presetName, false, errorMsg);
          
          // Emit failure via socket with structured error
          socketService.updateTranscodeProgress({
            uploadId,
            videoId,
            videoName,
            currentStage: 'failed',
            stageProgressPercent: 0,
            overallProgressPercent: 0,
            error: `Transcoding failed at ${presetName} preset: ${errorMsg}`
          });
          
          // Throw structured error
          throw new TranscodeError(
            ErrorCode.TRANSCODE_FAILED,
            `Transcoding failed at ${presetName} preset: ${errorMsg}`,
            `transcoding_${presetName}`
          );
        }

        // Store result
        results[presetName] = {
          file: outputPath,
          preset: presetName,
          resolution: preset.resolution
        };

        this.logger.info(
          `Successfully transcoded ${presetName}: ${videoId}`
        );
      }

      // Emit completion
      socketService.updateTranscodeProgress({
        uploadId,
        videoId,
        videoName,
        currentStage: 'completed',
        stageProgressPercent: 100,
        overallProgressPercent: 100
      });

      // Log completion
      this.logger.info(`Transcoding completed for video: ${videoId}`, {
        presetsCompleted: Object.keys(results).length
      });
      
      winstonLogger.info(`Transcoding completed for video: ${videoId}`, {
        presetsCompleted: Object.keys(results).length
      });

      return results;
    } catch (error) {
      // Log and handle error
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      
      this.logger.error(`Transcoding failed for ${videoId}`, {
        error: errorMsg,
        inputPath,
        stage: currentPreset ? `transcoding_${currentPreset}` : 'initialization'
      });
      
      winstonLogger.error(`Transcoding failed for ${videoId}`, {
        error: errorMsg,
        inputPath,
        stage: currentPreset ? `transcoding_${currentPreset}` : 'initialization'
      });
      
      // Clean up partial files on failure
      await cleanupService.cleanupPartialFiles(videoId, inputPath);
      
      // Emit failure event
      socketService.updateTranscodeProgress({
        uploadId,
        videoId,
        videoName,
        currentStage: 'failed',
        stageProgressPercent: 0,
        overallProgressPercent: 0,
        error: errorMsg
      });
      
      // Re-throw with structured error info
      if (error instanceof TranscodeError) {
        throw error;
      }
      
      throw new TranscodeError(
        ErrorCode.TRANSCODE_FAILED,
        `Video transcoding failed: ${errorMsg}`,
        currentPreset ? `transcoding_${currentPreset}` : 'initialization'
      );
    } finally {
      // Unregister job from shutdown manager
      shutdownManager.unregisterJob(jobId);
    }
  }

  /**
   * Transcode video to specific resolution with progress callback
   *
   * Internal method that handles transcoding to a single resolution.
   * Configures FFmpeg with codec, bitrate, and output format.
   * Tracks progress and handles completion/errors.
   *
   * FFmpeg Configuration:
   * - Video codec: libx264 (H.264, widely compatible)
   * - Audio codec: aac (AAC, widely supported)
   * - Format: mp4 with faststart flag (streaming optimized)
   * - Bitrate: configured per preset
   * - Preset: veryfast (fast encoding, good quality)
   *
   * @async
   * @method transcodeResolution
   * @private
   * @param {string} inputPath - Input file path
   * @param {string} outputPath - Output file path
   * @param {TranscodingPreset} preset - Preset configuration
   * @param {number} videoDuration - Video duration in seconds for accurate progress
   * @param {Function} progressCallback - Optional progress callback
   *
   * @returns {Promise<void>} Resolves when transcoding complete
   * @throws {Error} If FFmpeg execution fails
   */
  private async transcodeResolution(
    inputPath: string,
    outputPath: string,
    preset: TranscodingPreset,
    videoDuration: number,
    progressCallback?: (percent: number, fps: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Start FFmpeg command for transcoding
      ffmpeg(inputPath)
        // Video codec and quality settings
        .videoCodec('libx264')
        // Audio codec and bitrate
        .audioCodec('aac')
        // Target resolution (e.g., "1280x720")
        .size(preset.resolution)
        // Video bitrate for this preset
        .videoBitrate(preset.bitrate)
        // Audio bitrate (constant for all presets)
        .audioBitrate('128k')
        // Audio channel configuration (stereo)
        .audioChannels(2)
        // Audio sample rate (44.1 kHz)
        .audioFrequency(44100)
        // Output container format
        .format('mp4')
        // Additional FFmpeg options for streaming-optimized MP4
        .outputOptions([
          `-maxrate ${preset.maxrate}`,
          `-bufsize ${preset.bufsize}`,
          `-preset veryfast`, // Fast encoding for quicker transcoding
          '-movflags +faststart', // Enable streaming (moov atom at start)
          '-pix_fmt yuv420p' // Ensure compatibility
        ])
        // Error handler
        .on('error', (err: Error) => {
          this.logger.error(`FFmpeg error for ${outputPath}`, {
            error: err.message,
            preset: preset.resolution
          });
          reject(err);
        })
        // Progress handler with callback support
        .on('progress', (progress: FFmpegProgress) => {
          // Calculate accurate percentage based on timemark and duration
          let percent = 0;
          if (progress.timemark && videoDuration > 0) {
            // Parse timemark (format: "00:00:10.05")
            const parts = progress.timemark.split(':');
            if (parts.length === 3) {
              const hours = parseInt(parts[0]) || 0;
              const minutes = parseInt(parts[1]) || 0;
              const seconds = parseFloat(parts[2]) || 0;
              const currentTime = hours * 3600 + minutes * 60 + seconds;
              percent = Math.min(100, (currentTime / videoDuration) * 100);
            }
          } else if (progress.percent) {
            // Fallback to FFmpeg's percent if available
            percent = progress.percent;
          }
          
          const fps = Math.round(progress.currentFps || 0);
          
          this.logger.debug(`Transcoding progress for ${preset.resolution}`, {
            timemark: progress.timemark,
            percent: Math.round(percent),
            fps
          });
          
          // Call progress callback if provided
          if (progressCallback) {
            progressCallback(percent, fps);
          }
        })
        // Completion handler
        .on('end', () => {
          // Emit final 100% progress
          if (progressCallback) {
            progressCallback(100, 0);
          }
          resolve();
        })
        // Start transcoding with output path
        .save(outputPath);
    });
  }

  /**
   * Get video metadata (duration, resolution, codecs)
   *
   * Extracts video information without transcoding.
   * Uses FFprobe to analyze video file quickly.
   * Provides information needed for streaming setup.
   *
   * Metadata includes:
   * - Duration in seconds
   * - Resolution (width x height)
   * - Video and audio codecs
   * - Frame rate
   * - Overall bitrate
   *
   * @async
   * @method getVideoMetadata
   * @param {string} inputPath - Path to video file
   *
   * @returns {Promise<VideoMetadata>} Complete video metadata
   * @throws {Error} If file doesn't exist or metadata extraction fails
   *
   * @example
   * const metadata = await processor.getVideoMetadata('./input.mp4');
   * // Returns: {
   * //   id: 'generated-uuid',
   * //   duration: 120,
   * //   width: 1920,
   * //   height: 1080,
   * //   bitrate: 5000000,
   * //   fps: 30,
   * //   codec: 'h264',
   * //   audioCodec: 'aac',
   * //   channels: 2,
   * //   format: 'mp4'
   * // }
   */
  async getVideoMetadata(inputPath: string): Promise<VideoMetadata> {
    try {
      // Validate file exists
      if (!FileUtil.fileExists(inputPath)) {
        throw new Error(`File not found: ${inputPath}`);
      }

      this.logger.info('Extracting metadata from video', { inputPath });

      // Use FFprobe to analyze the file
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
          if (err) {
            this.logger.error(`Failed to extract metadata`, {
              error: err.message,
              file: inputPath
            });
            reject(err);
            return;
          }

          try {
            // Find video and audio streams in the metadata
            const videoStream = metadata.streams.find(
              (s) => s.codec_type === 'video'
            );
            const audioStream = metadata.streams.find(
              (s) => s.codec_type === 'audio'
            );

            // Extract and calculate values with null checks
            const duration: number = Math.floor(metadata.format.duration ?? 0);
            const fps: number = videoStream?.r_frame_rate 
              ? eval(videoStream.r_frame_rate) || 30 
              : 30;

            // Create metadata object (partial - will be completed by caller)
            const videoMetadata: Partial<VideoMetadata> & { duration: number } = {
              id: '', // Will be set by caller
              duration,
              bitrate: Number(metadata.format.bit_rate) || 0,
              width: videoStream?.width || 0,
              height: videoStream?.height || 0,
              fps,
              codec: videoStream?.codec_name || 'unknown',
              audioCodec: audioStream?.codec_name || 'unknown',
              channels: audioStream?.channels || 0,
              format: 'mp4'
            };

            this.logger.info('Metadata extracted successfully', {
              duration,
              resolution: `${videoMetadata.width}x${videoMetadata.height}`,
              fps,
              codec: videoMetadata.codec
            });

            resolve(videoMetadata as VideoMetadata);
          } catch (parseError) {
            const errorMsg: string =
              parseError instanceof Error
                ? parseError.message
                : 'Unknown error';
            this.logger.error('Failed to parse metadata', {
              error: errorMsg
            });
            reject(parseError);
          }
        });
      });
    } catch (error) {
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Exception extracting metadata`, {
        error: errorMsg,
        file: inputPath
      });
      throw error;
    }
  }

  /**
   * Get video duration in seconds
   *
   * Quick utility to get just the duration without full metadata.
   * Useful when only duration is needed for playlist generation.
   *
   * @async
   * @method getVideoDuration
   * @param {string} inputPath - Path to video file
   *
   * @returns {Promise<number>} Duration in seconds
   * @throws {Error} If duration extraction fails
   *
   * @example
   * const duration = await processor.getVideoDuration('./video.mp4');
   * console.log(`Duration: ${duration} seconds`);
   */
  async getVideoDuration(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          this.logger.error(`Failed to get video duration`, {
            error: err.message
          });
          reject(err);
          return;
        }

        try {
          const duration: number = Math.floor(metadata.format.duration ?? 0);
          resolve(duration);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

// Export for use in other modules
export default VideoProcessor;
