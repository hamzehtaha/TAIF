/**
 * Upload Middleware Module - TypeScript Implementation
 *
 * Configures and provides multer middleware for video file uploads.
 * Handles file storage, naming, filtering, and size validation.
 * Provides strong typing for multer configuration and file objects.
 *
 * Features:
 * - Multer disk storage configuration with custom directory
 * - File name sanitization for security
 * - Video file type validation (whitelist approach)
 * - File size limits to prevent resource exhaustion
 * - Upload validation middleware
 * - Comprehensive error handling
 * - Type-safe configuration
 *
 * File Upload Process:
 * 1. Client sends POST request with file
 * 2. Multer receives file and stores to disk
 * 3. File extension validated (must be video type)
 * 4. File name sanitized (special chars removed)
 * 5. File size checked against limits
 * 6. File object attached to request.file
 * 7. Custom validation middleware checks file
 *
 * Security:
 * - Validates file type against whitelist
 * - Sanitizes file names (no directory traversal)
 * - Limits file size to prevent DoS
 * - Uses disk storage (controlled directory)
 * - File permissions managed by filesystem
 *
 * File Upload Structure:
 * req.file = {
 *   fieldname: 'video',           // Form field name
 *   originalname: 'movie.mp4',    // Original filename from client
 *   encoding: '7bit',             // Content encoding
 *   mimetype: 'video/mp4',        // MIME type
 *   destination: './videos/uploads', // Upload directory
 *   filename: 'movie_mp4',        // Sanitized filename on disk
 *   path: './videos/uploads/movie_mp4', // Full path
 *   size: 5242880                 // File size in bytes
 * }
 *
 * @module uploadMiddleware
 * @requires multer
 * @requires express
 * @example
 * import express, { Router } from 'express';
 * import { upload, validateUpload } from './uploadMiddleware';
 *
 * const router = Router();
 *
 * // Use upload and validation middleware
 * router.post('/api/upload',
 *   upload.single('video'),   // Single file named 'video'
 *   validateUpload,            // Custom validation
 *   (req, res) => {
 *     console.log(req.file.filename); // Sanitized name
 *     res.json({ success: true });
 *   }
 * );
 */

import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { Validator } from '../utils/validator';
import { FileUtil } from '../utils/fileUtil';
import { Config } from '../config/config';
import {
  ValidationError
} from './errorHandler';
import { Logger } from '../utils/logger';
import { LogLevel } from '../types';

/**
 * Extended Express Request with file information
 */
interface UploadRequest extends Request {
  /** Multer file object from upload */
  file?: Express.Multer.File;
  /** Any additional upload context */
  uploadPath?: string;
}

/**
 * Initialize configuration and logger
 */
const config = Config.getInstance();
const logger = new Logger(config.getLogLevel() || LogLevel.INFO);

// Ensure upload directory exists
const uploadDir: string = config.getUploadsDir();
FileUtil.createDirIfNotExists(uploadDir)
  .catch((err) => {
    logger.error('Failed to create upload directory', {
      directory: uploadDir,
      error: err.message
    });
  });

/**
 * Configure multer disk storage
 *
 * Specifies where and how uploaded files are stored on disk.
 * Files are stored with sanitized names in the configured upload directory.
 *
 * Storage Options:
 * - destination: Where files are saved (./videos/uploads)
 * - filename: How files are named (sanitized original name)
 *
 * The disk storage engine:
 * 1. Saves files to disk immediately during upload
 * 2. Provides file path and stats in request.file
 * 3. Allows access to file for validation
 * 4. Files persist after request completes
 *
 * @type {multer.StorageEngine}
 */
const storage: multer.StorageEngine = multer.diskStorage({
  /**
   * Specify directory where uploaded files are saved
   *
   * Called for each file upload to determine destination.
   * Callback receives (req, file, callback).
   *
   * @param {Request} req - Express request object
   * @param {Express.Multer.File} file - File information from client
   * @param {Function} cb - Callback (error, destination path)
   */
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ): void => {
    cb(null, uploadDir);
  },

  /**
   * Specify filename for uploaded file
   *
   * Called for each file upload to determine disk filename.
   * Sanitizes original name to prevent security issues.
   *
   * Sanitization:
   * - Removes special characters
   * - Prevents directory traversal
   * - Converts to lowercase
   * - Safe for filesystem storage
   *
   * @param {Request} req - Express request object
   * @param {Express.Multer.File} file - File information from client
   * @param {Function} cb - Callback (error, filename)
   */
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ): void => {
    // Sanitize original filename for safe storage
    const sanitized: string = Validator.sanitizeFileName(file.originalname);
    cb(null, sanitized);
  }
});

/**
 * Configure multer file filter for validation
 *
 * Validates files before uploading to disk.
 * Rejects invalid file types before storage.
 *
 * Filter runs:
 * 1. For each file in the request
 * 2. Before file is written to disk
 * 3. Can reject or accept file
 *
 * Validation:
 * - Checks file extension is in video whitelist
 * - Throws ValidationError for invalid files
 * - Allows legitimate video files through
 *
 * Supported Formats:
 * - MP4 (H.264 + AAC, most compatible)
 * - AVI (MPEG-4 + MP3, legacy)
 * - MOV (QuickTime, Apple standard)
 * - MKV (Matroska, supports many codecs)
 * - FLV (Flash video, legacy)
 * - WMV (Windows Media Video)
 * - WebM (VP8/VP9 + Vorbis, web standard)
 *
 * @param {Request} req - Express request object
 * @param {Express.Multer.File} file - File information
 * @param {Function} cb - Callback (error, accepted)
 *
 * @example
 * // Valid file: accepted
 * fileFilter(req, { originalname: 'video.mp4' }, cb);
 * // Calls: cb(null, true)
 *
 * // Invalid file: rejected
 * fileFilter(req, { originalname: 'script.js' }, cb);
 * // Calls: cb(new ValidationError(...), false)
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, accepted: boolean) => void
): void => {
  try {
    // Validate file type is in whitelist
    if (!Validator.isValidVideoFile(file.originalname)) {
      // Reject file with descriptive error message
      throw new ValidationError(
        'Invalid video file type. Supported: mp4, avi, mov, mkv, flv, wmv, webm'
      );
    }

    // File is valid, accept it
    cb(null, true);
  } catch (error) {
    // Validation error occurred, reject file
    cb(error as Error, false);
  }
};

/**
 * Multer upload middleware instance
 *
 * Configured with:
 * - Disk storage to ./videos/uploads
 * - File filter for video type validation
 * - File size limits
 * - Single file per request
 *
 * Used in routes with .single('video') for single file uploads.
 * Attaches file info to request.file after processing.
 *
 * @type {multer.Multer}
 *
 * @example
 * router.post('/upload', upload.single('video'), (req, res) => {
 *   console.log(req.file.path);      // /path/to/uploaded/file
 *   console.log(req.file.size);      // File size in bytes
 *   console.log(req.file.filename);  // Sanitized filename
 * });
 */
export const upload: multer.Multer = multer({
  storage: storage,
  fileFilter: fileFilter as any,
  limits: {
    // Maximum file size (from config, typically 5GB)
    fileSize: config.getMaxFileSize()
  }
});

/**
 * Upload validation middleware
 *
 * Validates uploaded file after multer processing.
 * Checks:
 * - File was actually uploaded (not missing)
 * - File size within limits
 * - File extension is valid
 * - File is readable
 *
 * Called after upload middleware in route:
 * router.post('/upload', upload.single('video'), validateUpload, handler)
 *
 * If validation fails:
 * - Throws ValidationError with descriptive message
 * - Error handler catches and returns 400 response
 * - File is still on disk (cleanup may be needed)
 *
 * Success:
 * - Calls next() to proceed to route handler
 * - request.file contains upload info
 * - File is ready for processing
 *
 * @async
 * @middleware validateUpload
 * @param {UploadRequest} req - Express request with potential file
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware
 *
 * @throws {ValidationError} If validation fails
 *
 * @example
 * // In route definition:
 * router.post('/api/upload',
 *   upload.single('video'),    // Multer saves file
 *   validateUpload,             // This middleware validates
 *   asyncHandler(async (req, res) => {
 *     // File is now validated and ready
 *     const videoId = Validator.generateFileId();
 *     const processor = new VideoProcessor();
 *     await processor.transcodeVideo(req.file.path, outDir, videoId);
 *   })
 * );
 */
export const validateUpload = (
  req: UploadRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check that a file was actually uploaded
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    // Validate file size is within limits
    if (
      !Validator.isValidFileSize(
        req.file.size,
        config.getMaxFileSize()
      )
    ) {
      throw new ValidationError(
        `File size exceeds maximum limit of ${config.getMaxFileSize()} bytes`
      );
    }

    // Validate file extension (double-check after multer)
    if (!Validator.isValidVideoFile(req.file.originalname)) {
      throw new ValidationError(
        'Uploaded file is not a valid video format'
      );
    }

    // Log successful validation
    logger.info('File upload validated', {
      filename: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });

    // File is valid, proceed to next handler
    next();
  } catch (error) {
    // Pass validation error to error handler middleware
    next(error);
  }
};

/**
 * Middleware to clean up failed uploads
 *
 * If file was uploaded but subsequent processing fails,
 * this middleware cleans up the uploaded file.
 *
 * Use in error handler or after failed processing:
 * router.post('/upload', upload.single('video'), handler, cleanupOnError);
 *
 * @async
 * @middleware cleanupOnError
 * @param {UploadRequest} req - Express request with uploaded file
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware
 *
 * @example
 * router.post('/api/upload',
 *   upload.single('video'),
 *   validateUpload,
 *   asyncHandler(async (req, res) => {
 *     // If this throws, file needs cleanup
 *     await transcodeVideo(req.file.path);
 *   }),
 *   cleanupOnError  // Clean up on error
 * );
 */
export const cleanupOnError = (
  req: UploadRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check if file was uploaded
  if (req.file && FileUtil.fileExists(req.file.path)) {
    FileUtil.deleteFile(req.file.path)
      .then(() => {
        logger.info('Cleaned up uploaded file after error', {
          filename: req.file!.filename,
          path: req.file!.path
        });
        next();
      })
      .catch((err) => {
        logger.error('Failed to cleanup uploaded file', {
          filename: req.file!.filename,
          path: req.file!.path,
          error: err.message
        });
        next();
      });
  } else {
    next();
  }
};

/**
 * Get upload file info from request
 *
 * Utility function to safely extract file information
 * with proper type checking and error handling.
 *
 * @param {UploadRequest} req - Express request object
 *
 * @returns {Express.Multer.File | null} File object or null if not present
 *
 * @example
 * const file = getUploadedFile(req);
 * if (file) {
 *   console.log(`File size: ${file.size}`);
 *   console.log(`Saved as: ${file.filename}`);
 * }
 */
export function getUploadedFile(
  req: UploadRequest
): Express.Multer.File | null {
  return req.file || null;
}

/**
 * Upload configuration object
 *
 * Centralized configuration for upload settings.
 * Can be customized per route if needed.
 */
export const uploadConfig = {
  /** Maximum file size in bytes */
  maxFileSize: config.getMaxFileSize(),
  /** Upload directory path */
  uploadDir: uploadDir,
  /** Single file field name */
  fieldName: 'video',
  /** Allowed file extensions */
  allowedExtensions: [
    'mp4',
    'avi',
    'mov',
    'mkv',
    'flv',
    'wmv',
    'webm'
  ]
};

// Export for use in other modules
export default {
  upload,
  validateUpload,
  cleanupOnError,
  getUploadedFile,
  uploadConfig
};
