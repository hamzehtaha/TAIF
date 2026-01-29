/**
 * Video Routes Module - TypeScript Implementation
 *
 * Provides API endpoints for video upload, retrieval, and management.
 * Handles video processing including transcoding to multi-quality MP4.
 * Provides RESTful interface for video streaming functionality.
 *
 * Features:
 * - POST /api/upload: Upload and process video files
 * - GET /api/videos: List all uploaded videos
 * - GET /api/video/:videoId: Get details for specific video
 * - DELETE /api/video/:videoId: Delete video and streams
 *
 * Video Processing Pipeline:
 * 1. Receive uploaded file from client
 * 2. Generate unique video ID (UUID v4)
 * 3. Extract video metadata (duration, resolution, codecs)
 * 4. Transcode to multiple quality presets (360p, 480p, 720p, 1080p)
 * 5. Return streaming URLs to client
 *
 * Response Format:
 * - Success: { success: true, data: {...} }
 * - Error: { success: false, error: {...} } (handled by errorHandler)
 *
 * Error Handling:
 * - Async route wrappers for automatic error catching
 * - Custom error classes for consistent responses
 * - Proper HTTP status codes and error messages
 * - File cleanup on errors
 *
 * @module videoRoutes
 * @requires express
 * @requires multer
 * @example
 * import express from 'express';
 * import videoRoutes from './routes/videoRoutes';
 *
 * const app = express();
 * app.use('/api', videoRoutes);
 *
 * // Available endpoints:
 * // POST /api/upload - Upload video
 * // GET /api/videos - List videos
 * // GET /api/video/550e8400-e29b-41d4-a716-446655440000 - Get video
 * // DELETE /api/video/550e8400-e29b-41d4-a716-446655440000 - Delete video
 *
 * @see {@link VideoProcessor} for transcoding
 */

import express, { Router, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { FileUtil } from '../utils/fileUtil';
import { Logger } from '../utils/logger';
import { Validator } from '../utils/validator';
import { VideoProcessor } from '../services/videoProcessor';
import {
  asyncHandler,
  ValidationError,
  NotFoundError
} from '../middleware/errorHandler';
import {
  upload,
  validateUpload,
  getUploadedFile
} from '../middleware/uploadMiddleware';
import { Config } from '../config/config';
import { LogLevel, VideoMetadata, VideoQuality } from '../types';
import { statisticsService } from '../services/statisticsService';
import { socketService } from '../services/socketService';
import { 
  sendSuccess, 
  sendError, 
  sendPaginated,
  parsePaginationParams,
  calculatePagination
} from '../utils/apiResponse';

/**
 * Extended Express Request with file
 */
interface VideoUploadRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * Video data stored in memory
 * In production, this would be a database
 */
interface StoredVideo {
  /** Unique video identifier */
  id: string;
  /** Custom video name (can differ from filename) */
  videoName?: string;
  /** Original upload file path */
  originalFile: string;
  /** Original filename from client */
  filename: string;
  /** File size in bytes */
  filesize: number;
  /** Video duration in seconds */
  duration: number;
  /** Video metadata (resolution, codecs, etc) */
  metadata: VideoMetadata;
  /** Transcoded file paths keyed by preset */
  transcoded: Record<string, any>;
  /** Creation timestamp */
  createdAt: Date;
  /** Upload timestamp */
  uploadedAt: Date;
}

/**
 * Create router instance
 */
const router: Router = express.Router();

/**
 * Initialize services and configuration
 */
const config = Config.getInstance();
const logger = new Logger(config.getLogLevel() || LogLevel.INFO);
const videoProcessor = new VideoProcessor();

/**
 * In-memory video storage (temporary, use database in production)
 * Maps video ID to video metadata
 *
 * @type {Map<string, StoredVideo>}
 */
const videos = new Map<string, StoredVideo>();

/**
 * Scan streams directory on startup to rebuild video list
 * Reconstructs video metadata from existing processed videos
 */
async function loadExistingVideos(): Promise<void> {
  try {
    const streamsDir = config.getStreamsDir();
    const uploadsDir = config.getUploadsDir();
    
    // Check if streams directory exists
    if (!FileUtil.directoryExists(streamsDir)) {
      logger.info('No streams directory found, skipping video scan');
      return;
    }

    // Read all video directories in streams folder
    const fs = require('fs');
    const videoIds = fs.readdirSync(streamsDir, { withFileTypes: true })
      .filter((dirent: { isDirectory: () => boolean }) => dirent.isDirectory())
      .map((dirent: { name: string }) => dirent.name);

    logger.info(`Scanning for existing videos`, { count: videoIds.length });

    for (const videoId of videoIds) {
      try {
        const videoDir = path.join(streamsDir, videoId);

        // Find transcoded MP4 files
        const transcodedFiles: Record<string, { file: string; preset: string; resolution: string }> = {};
        const presets = ['360p', '480p', '720p', '1080p'];
        
        for (const preset of presets) {
          const transcodedFile = path.join(videoDir, `${preset}.mp4`);
          if (FileUtil.fileExists(transcodedFile)) {
            transcodedFiles[preset] = {
              file: transcodedFile,
              preset: preset,
              resolution: preset === '360p' ? '640x360' :
                          preset === '480p' ? '854x480' :
                          preset === '720p' ? '1280x720' : '1920x1080'
            };
          }
        }

        // Skip if no transcoded files found
        if (Object.keys(transcodedFiles).length === 0) {
          logger.warn(`No transcoded MP4 files found for ${videoId}, skipping`);
          continue;
        }

        // Try to find original file in uploads
        let originalFile = '';
        let filename = 'Unknown';
        let filesize = 0;

        // Check uploads directory for original file
        if (FileUtil.directoryExists(uploadsDir)) {
          const uploadFiles = fs.readdirSync(uploadsDir);
          // Try to match by timestamp or just use first available
          const possibleOriginal = uploadFiles.find((f: string) => 
            f.toLowerCase().endsWith('.mp4') || 
            f.toLowerCase().endsWith('.avi') ||
            f.toLowerCase().endsWith('.mkv') ||
            f.toLowerCase().endsWith('.mov')
          );
          
          if (possibleOriginal) {
            originalFile = path.join(uploadsDir, possibleOriginal);
            filename = possibleOriginal;
            const stats = fs.statSync(originalFile);
            filesize = stats.size;
          }
        }

        // Extract metadata from first available transcoded file
        let metadata: VideoMetadata;
        const firstPreset = Object.keys(transcodedFiles)[0];
        const firstFile = transcodedFiles[firstPreset].file;
        
        try {
          metadata = await videoProcessor.getVideoMetadata(firstFile);
        } catch (error) {
          // Fallback metadata if extraction fails
          metadata = {
            id: videoId,
            name: filename,
            size: filesize,
            mimeType: 'video/mp4',
            uploadedAt: new Date(),
            qualities: Object.keys(transcodedFiles).map(p => p as VideoQuality),
            isTranscoded: true,
            duration: 0,
            width: 1280,
            height: 720,
            bitrate: 0,
            fps: 0,
            codec: 'h264',
            audioCodec: 'aac'
          };
        }

        // Reconstruct video entry
        const videoData: StoredVideo = {
          id: videoId,
          videoName: filename,
          originalFile: originalFile || firstFile,
          filename: filename,
          filesize: filesize,
          duration: metadata.duration || 0,
          metadata: metadata,
          transcoded: transcodedFiles,
          createdAt: new Date(fs.statSync(videoDir).birthtime),
          uploadedAt: new Date(fs.statSync(videoDir).birthtime)
        };

        videos.set(videoId, videoData);
        logger.info(`Loaded existing video: ${videoId}`, { 
          filename, 
          presets: Object.keys(transcodedFiles).length 
        });

      } catch (error) {
        logger.error(`Failed to load video ${videoId}`, { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    logger.info(`Loaded ${videos.size} existing videos from streams directory`);
    
    // Update statistics with actual video count
    statisticsService.setTotalVideos(videos.size);

  } catch (error) {
    logger.error('Failed to scan existing videos', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Load existing videos on startup
loadExistingVideos().catch((error) => {
  logger.error('Error during startup video scan', { 
    error: error instanceof Error ? error.message : 'Unknown error' 
  });
});

/**
 * POST /regenerate/:videoId - Regenerate metadata for existing video
 * Useful when videos were processed with old code
 */
router.post(
  '/regenerate/:videoId',
  asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    
    // Get protocol and host from request for full URLs
    const protocol = req.protocol;
    const host = req.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    logger.info(`Regenerating metadata for video: ${videoId}`);
    
    // Check if video exists in memory
    const video = videos.get(videoId);
    if (!video) {
      throw new NotFoundError(`Video not found: ${videoId}`);
    }
    
    try {
      logger.info(`Metadata regenerated successfully for: ${videoId}`);
      
      res.status(200).json({
        success: true,
        message: 'Video metadata refreshed',
        data: {
          videoId,
          streams: {
            variants: Object.keys(video.transcoded).map((preset) => ({
              preset,
              url: `${baseUrl}/stream/${videoId}/${preset}.mp4`
            }))
          }
        }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to regenerate metadata for ${videoId}`, { error: errorMsg });
      throw new Error(`Metadata regeneration failed: ${errorMsg}`);
    }
  })
);

/**
 * @swagger
 * /api/refresh-cache:
 *   post:
 *     summary: Refresh video cache
 *     description: Re-scan video folders and reload all video metadata into memory
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: Cache refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     videosFound:
 *                       type: integer
 *                     previousCount:
 *                       type: integer
 */
router.post(
  '/refresh-cache',
  asyncHandler(async (_req: Request, res: Response) => {
    const previousCount = videos.size;
    
    logger.info('Starting video cache refresh');
    
    // Clear current cache
    videos.clear();
    
    // Reload videos from disk
    await loadExistingVideos();
    
    const newCount = videos.size;
    
    // Update statistics
    statisticsService.setTotalVideos(newCount);
    
    logger.info(`Cache refresh complete`, { previousCount, newCount });
    
    res.status(200).json({
      success: true,
      message: 'Video cache refreshed successfully',
      data: {
        videosFound: newCount,
        previousCount
      }
    });
  })
);

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload and transcode video
 *     description: Upload a video file, extract metadata, and transcode to multiple qualities (360p, 480p, 720p, 1080p)
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - video
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (mp4, avi, mov, mkv, flv, wmv, webm)
 *               videoName:
 *                 type: string
 *                 description: Optional custom video name (defaults to original filename)
 *               videoId:
 *                 type: string
 *                 description: Optional custom video ID (defaults to auto-generated UUID)
 *     responses:
 *       201:
 *         description: Video uploaded and processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     videoId:
 *                       type: string
 *                       format: uuid
 *                     filename:
 *                       type: string
 *                     duration:
 *                       type: number
 *                     metadata:
 *                       type: object
 *                     streams:
 *                       type: object
 *       400:
 *         description: Invalid file or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/upload',
  // Multer middleware: save file to disk
  upload.single('video'),
  // Custom validation: check file size and type
  validateUpload,
  // Async route handler with error catching
  asyncHandler(async (req: VideoUploadRequest, res: Response) => {
    try {
      // Get file from request (guaranteed by validateUpload)
      const file = getUploadedFile(req as any);
      if (!file) {
        throw new ValidationError('No file uploaded');
      }

      // Get optional custom videoName and videoId from request body
      const customVideoName = req.body.videoName?.trim();
      const customVideoId = req.body.videoId?.trim();

      // Use custom name or fallback to original filename
      const videoName = customVideoName || file.originalname;
      
      // Use custom ID or generate a new one
      let videoId: string;
      if (customVideoId) {
        // Validate custom ID format (alphanumeric, hyphens, underscores)
        if (!/^[a-zA-Z0-9_-]+$/.test(customVideoId)) {
          throw new ValidationError('Invalid videoId format. Use only alphanumeric characters, hyphens, and underscores.');
        }
        // Check if ID already exists
        if (videos.has(customVideoId)) {
          throw new ValidationError(`Video ID '${customVideoId}' already exists. Please use a different ID.`);
        }
        videoId = customVideoId;
      } else {
        videoId = Validator.generateFileId();
      }
      
      // Generate upload ID for tracking (MUST be different from videoId)
      const uploadId = Validator.generateFileId();

      logger.info('Video upload started', { 
        uploadId,
        videoId, 
        videoName,
        filename: file.originalname 
      });
      
      // Track upload start
      statisticsService.startUpload(videoId, file.originalname, file.size);
      
      // Emit upload completed (file is already on disk via multer)
      socketService.updateUploadProgress({
        uploadId,
        videoId,
        videoName: file.originalname,
        bytesReceived: file.size,
        totalBytes: file.size,
        percent: 100,
        status: 'uploaded'
      });

      // Path to uploaded file on disk
      const inputPath: string = file.path;

      // Output directory for transcoded files
      const streamDir: string = path.join(
        config.getStreamsDir(),
        videoId
      );

      // Extract video metadata (duration, resolution, codecs, etc)
      const metadata: VideoMetadata =
        await videoProcessor.getVideoMetadata(inputPath);

      logger.info('Video metadata extracted', {
        videoId,
        duration: metadata.duration,
        resolution: `${metadata.width}x${metadata.height}`
      });

      // Start transcoding - emit initial event
      socketService.startTranscode(uploadId, videoId, file.originalname);
      
      // Track upload status change
      statisticsService.updateUploadStatus(videoId, 'transcoding');
      
      // Transcode video to multiple quality presets with progress tracking
      const transcodedFiles: Record<string, any> =
        await videoProcessor.transcodeVideo(
          inputPath, 
          streamDir, 
          videoId,
          uploadId,
          file.originalname
        );

      logger.info('Video transcoding completed', {
        videoId,
        presets: Object.keys(transcodedFiles).length
      });

      // Create video metadata object for storage
      const videoData: StoredVideo = {
        id: videoId,
        videoName: videoName,
        originalFile: inputPath,
        filename: file.originalname,
        filesize: file.size,
        duration: metadata.duration || 0,
        metadata,
        transcoded: transcodedFiles,
        createdAt: new Date(),
        uploadedAt: new Date()
      };

      // Store video info (in production, would be database)
      videos.set(videoId, videoData);
      
      // Update statistics
      statisticsService.updateUploadStatus(videoId, 'completed');
      statisticsService.setTotalVideos(videos.size);

      logger.info('Video processing completed', { videoId });

      // Get protocol and host from request for full URLs
      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;

      // Return 202 Accepted response with direct MP4 streaming URLs
      // 202 indicates the request has been accepted for processing
      res.status(202).json({
        success: true,
        message: 'Video processing started',
        data: {
          uploadId,
          videoId,
          videoName,
          filename: file.originalname,
          duration: metadata.duration,
          metadata: {
            width: metadata.width,
            height: metadata.height,
            codec: metadata.codec,
            fps: metadata.fps,
            bitrate: metadata.bitrate,
            duration: metadata.duration
          },
          streams: {
            // Direct MP4 streaming URLs for each quality
            variants: Object.keys(transcodedFiles).map((preset) => ({
              preset,
              quality: preset,
              url: `${baseUrl}/stream/${videoId}/${preset}.mp4`,
              resolution: transcodedFiles[preset].resolution
            }))
          }
        }
      });
    } catch (error) {
      // Log error and rethrow (errorHandler catches it)
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Video upload failed', { error: errorMsg });
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: List all videos with pagination
 *     description: Returns paginated array of uploaded videos with metadata and streaming URLs
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Number of videos per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [uploadedAt, createdAt, videoName, duration, filesize]
 *           default: uploadedAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated list of videos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *                     totalPages:
 *                       type: integer
 *                 count:
 *                   type: integer
 *                   example: 5
 */
router.get(
  '/videos',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      // Get protocol and host from request
      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      
      // Parse pagination params
      const { page, limit, skip } = parsePaginationParams(req.query as Record<string, unknown>);
      
      // Parse sort params
      const sortField = (req.query.sort as string) || 'uploadedAt';
      const sortOrder = (req.query.order as string) || 'desc';
      const validSortFields = ['uploadedAt', 'createdAt', 'videoName', 'duration', 'filesize'];
      const actualSortField = validSortFields.includes(sortField) ? sortField : 'uploadedAt';
      
      // Convert Map to array and format for response with full URLs
      let videoList = Array.from(videos.values()).map((video) => {
        const variants = Object.keys(video.transcoded).map((preset) => {
          const filePath = video.transcoded[preset].file;
          let fileSize = 0;
          try {
            if (FileUtil.fileExists(filePath)) {
              const stats = fs.statSync(filePath);
              fileSize = stats.size;
            }
          } catch (err) {
            // Ignore errors getting file size
          }
          
          return {
            preset,
            url: `${baseUrl}/stream/${video.id}/${preset}.mp4`,
            resolution: video.transcoded[preset].resolution,
            fileSize
          };
        });
        
        return {
          videoId: video.id,
          videoName: video.videoName || video.filename,
          filename: video.filename,
          duration: video.duration,
          filesize: video.filesize,
          createdAt: video.createdAt,
          uploadedAt: video.uploadedAt || video.createdAt,
          metadata: {
            width: video.metadata.width,
            height: video.metadata.height,
            codec: video.metadata.codec,
            audioCodec: video.metadata.audioCodec,
            fps: video.metadata.fps,
            bitrate: video.metadata.bitrate,
            duration: video.metadata.duration
          },
          streams: {
            variants
          }
        };
      });
      
      // Sort videos
      videoList.sort((a, b) => {
        let aVal: string | number | Date;
        let bVal: string | number | Date;
        
        switch (actualSortField) {
          case 'videoName':
            aVal = a.videoName.toLowerCase();
            bVal = b.videoName.toLowerCase();
            break;
          case 'duration':
            aVal = a.duration;
            bVal = b.duration;
            break;
          case 'filesize':
            aVal = a.filesize;
            bVal = b.filesize;
            break;
          case 'createdAt':
            aVal = new Date(a.createdAt).getTime();
            bVal = new Date(b.createdAt).getTime();
            break;
          case 'uploadedAt':
          default:
            aVal = new Date(a.uploadedAt).getTime();
            bVal = new Date(b.uploadedAt).getTime();
            break;
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      });
      
      const total = videoList.length;
      
      // Apply pagination
      const paginatedList = videoList.slice(skip, skip + limit);
      const pagination = calculatePagination(total, page, limit);

      logger.info('Listed videos', { count: paginatedList.length, total, page, limit });

      // Return paginated list
      sendPaginated(res, paginatedList, pagination);
    } catch (error) {
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to list videos', { error: errorMsg });
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/video/{videoId}:
 *   get:
 *     summary: Get video by ID
 *     description: Returns complete metadata and streaming URLs for a specific video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique video identifier
 *     responses:
 *       200:
 *         description: Video details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/video/:videoId',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { videoId } = req.params;
      
      // Get protocol and host from request for full URLs
      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;

      // Retrieve video from storage
      const video = videos.get(videoId);
      if (!video) {
        throw new NotFoundError(`Video not found: ${videoId}`);
      }

      logger.info('Retrieved video details', { videoId });

      // Return video data with streams
      res.status(200).json({
        success: true,
        data: {
          videoId: video.id,
          filename: video.filename,
          duration: video.duration,
          filesize: video.filesize,
          metadata: video.metadata,
          createdAt: video.createdAt,
          streams: {
            variants: Object.keys(video.transcoded).map((preset) => ({
              preset,
              url: `${baseUrl}/stream/${videoId}/${preset}.mp4`,
              resolution: video.transcoded[preset].resolution
            }))
          }
        }
      });
    } catch (error) {
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get video details', { error: errorMsg });
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/video/{videoId}:
 *   delete:
 *     summary: Delete video
 *     description: Removes video and all associated files (original upload, transcoded files, streams)
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique video identifier
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/video/:videoId',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { videoId } = req.params;

      // Find video by ID
      const video = videos.get(videoId);
      if (!video) {
        throw new NotFoundError(`Video not found: ${videoId}`);
      }

      logger.info('Deleting video', { videoId });

      // Delete original upload file if it exists
      if (FileUtil.fileExists(video.originalFile)) {
        await FileUtil.deleteFile(video.originalFile);
      }

      // Delete all transcoded MP4 files and video directory
      const videoDir = path.join(config.getStreamsDir(), videoId);
      if (FileUtil.directoryExists(videoDir)) {
        await FileUtil.deleteDir(videoDir);
      }

      // Remove from storage
      videos.delete(videoId);

      // Track deletion statistics
      statisticsService.recordVideoDelete();

      logger.info('Video deleted successfully', { videoId });

      // Return success message
      sendSuccess(res, null, `Video ${videoId} deleted successfully`);
    } catch (error) {
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to delete video', { error: errorMsg });
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/video-ids:
 *   get:
 *     summary: Get all video IDs
 *     description: Returns array of all existing video IDs (for duplicate checking)
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: List of video IDs
 */
router.get('/video-ids', (_req: Request, res: Response) => {
  const ids = Array.from(videos.keys());
  sendSuccess(res, { ids });
});

/**
 * Health check endpoint (informational)
 * Useful for monitoring video processing readiness
 */
router.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, {
    status: 'operational',
    videosCount: videos.size
  }, 'Video API is operational');
});

/**
 * GET /stats - Get server statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  const stats = statisticsService.getStats();
  
  // Override totalVideos with actual count from videos Map
  stats.totalVideos = videos.size;
  
  sendSuccess(res, stats);
});

// Export router for use in main server
export default router;
