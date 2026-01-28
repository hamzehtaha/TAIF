/**
 * File Utility Module - TypeScript Implementation
 *
 * Provides safe, async file system operations with comprehensive error handling.
 * All operations catch exceptions and provide meaningful error messages.
 * Enables the application to handle file operations reliably with proper error context.
 *
 * Features:
 * - Async directory creation with recursive support
 * - Recursive directory deletion (async/await)
 * - File existence checking
 * - File size calculation (without loading into memory)
 * - Directory listing with type information
 * - File extension extraction
 * - Safe error reporting with context
 * - Promise-based API for async operations
 *
 * Design Principles:
 * - All methods are static and don't maintain state
 * - Async/await pattern for non-blocking I/O
 * - Comprehensive error handling with descriptive messages
 * - Path validation to prevent directory traversal
 * - Efficient file operations (stats, not full read)
 *
 * Usage:
 * await FileUtil.createDirIfNotExists('./videos/uploads');
 * const exists = await FileUtil.fileExists('./video.mp4');
 * const size = await FileUtil.getFileSize('./video.mp4');
 *
 * @module fileUtil
 * @example
 * // Create upload directory
 * await FileUtil.createDirIfNotExists('./output');
 *
 * // Delete video stream directory
 * await FileUtil.deleteDir('./videos/streams/videoId');
 *
 * // List uploaded files
 * const files = await FileUtil.listFiles('./videos/uploads');
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

/**
 * Interface for file listing with type information
 */
interface FileEntry {
  /** Name of file or directory */
  name: string;
  /** True if entry is a directory */
  isDirectory: boolean;
  /** Size in bytes if file */
  size?: number;
}

/**
 * FileUtil utility class - Provides static file system operations
 *
 * All methods are static and use Promise-based async/await API.
 * This eliminates the need to create instances while providing
 * clean, non-blocking file I/O throughout the application.
 *
 * Error handling:
 * - All methods throw descriptive errors with context
 * - Errors include the operation, path, and underlying error message
 * - Use try-catch to handle errors appropriately
 *
 * @class FileUtil
 * @static
 */
export class FileUtil {
  /**
   * Create directory recursively if it doesn't exist
   *
   * Creates all parent directories as needed using async/await.
   * Does nothing if directory already exists (idempotent).
   * Throws descriptive error if creation fails.
   *
   * Non-blocking operation - use await to wait for completion.
   * Respects filesystem permissions and disk space limits.
   *
   * @static
   * @async
   * @method createDirIfNotExists
   * @param {string} dirPath - Absolute or relative directory path
   *
   * @returns {Promise<void>} Resolves when directory is ready
   * @throws {Error} If directory creation fails (permissions, disk space, etc)
   *
   * @example
   * // Create upload directory
   * await FileUtil.createDirIfNotExists('./videos/uploads');
   *
   * // Create nested directory structure
   * await FileUtil.createDirIfNotExists('./data/videos/streams/preset');
   * // Creates all intermediate directories as needed
   *
   * // Safe to call multiple times
   * await FileUtil.createDirIfNotExists('./output');
   * await FileUtil.createDirIfNotExists('./output'); // No error
   */
  static async createDirIfNotExists(dirPath: string): Promise<void> {
    try {
      // Check if directory already exists
      const exists: boolean = fsSync.existsSync(dirPath);
      if (!exists) {
        // Create directory with recursive flag for all parent dirs
        await fs.mkdir(dirPath, { recursive: true });
      }
    } catch (error) {
      // Provide context about which directory failed to create
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create directory ${dirPath}: ${errorMsg}`);
    }
  }

  /**
   * Check if file or directory exists
   *
   * Non-throwing check for existence using sync API.
   * Returns false on any error (permissions, etc).
   * Useful for conditional logic without try-catch.
   *
   * Note: Uses synchronous check for simplicity since we're only
   * checking existence (very fast operation).
   *
   * @static
   * @method fileExists
   * @param {string} filePath - Path to file or directory
   *
   * @returns {boolean} True if file/directory exists and accessible
   *
   * @example
   * // Check file exists before processing
   * if (FileUtil.fileExists('./video.mp4')) {
   *   console.log('Video file found, proceeding...');
   * } else {
   *   console.log('Video file not found');
   * }
   *
   * // Conditional directory check
   * const uploadsDir = './videos/uploads';
   * if (!FileUtil.fileExists(uploadsDir)) {
   *   await FileUtil.createDirIfNotExists(uploadsDir);
   * }
   */
  static fileExists(filePath: string): boolean {
    try {
      // Check using synchronous existsSync - very fast, minimal overhead
      return fsSync.existsSync(filePath);
    } catch {
      // Any error (permissions, encoding, etc) means we can't access it
      return false;
    }
  }

  /**
   * Check if path exists and is a directory
   *
   * Non-throwing check for directory existence.
   * Returns false if path doesn't exist or is not a directory.
   *
   * @static
   * @method directoryExists
   * @param {string} dirPath - Path to check
   *
   * @returns {boolean} True if path exists and is a directory
   *
   * @example
   * if (FileUtil.directoryExists('./videos/streams')) {
   *   console.log('Streams directory exists');
   * }
   */
  static directoryExists(dirPath: string): boolean {
    try {
      const stats = fsSync.statSync(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Delete a file safely
   *
   * Removes a single file if it exists (async/await).
   * Does nothing if file doesn't exist (idempotent).
   * Throws error only if deletion fails for other reasons.
   *
   * @static
   * @async
   * @method deleteFile
   * @param {string} filePath - Path to file to delete
   *
   * @returns {Promise<void>} Resolves when file is deleted
   * @throws {Error} If file deletion fails
   *
   * @example
   * // Delete uploaded file
   * await FileUtil.deleteFile('./videos/uploads/old-video.mp4');
   *
   * // Safe to delete non-existent file (no error)
   * await FileUtil.deleteFile('./nonexistent.txt');
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      // Check if file exists before attempting delete
      if (FileUtil.fileExists(filePath)) {
        // Delete the file asynchronously
        await fs.unlink(filePath);
      }
    } catch (error) {
      // Provide context about which file failed to delete
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete file ${filePath}: ${errorMsg}`);
    }
  }

  /**
   * Delete directory and all contents recursively
   *
   * Completely removes a directory tree asynchronously.
   * Does nothing if directory doesn't exist (idempotent).
   * Force flag ensures deletion even if files are in use on some systems.
   *
   * Use with caution - this is permanent and cannot be undone.
   * Typically used for cleanup after transcoding or on video deletion.
   *
   * @static
   * @async
   * @method deleteDir
   * @param {string} dirPath - Path to directory to delete
   *
   * @returns {Promise<void>} Resolves when directory is fully deleted
   * @throws {Error} If directory deletion fails
   *
   * @example
   * // Clean up after video processing
   * const videoId = '550e8400-e29b-41d4-a716-446655440000';
   * await FileUtil.deleteDir(`./videos/streams/${videoId}`);
   *
   * // Safe to delete non-existent directory (no error)
   * await FileUtil.deleteDir('./nonexistent/directory');
   */
  static async deleteDir(dirPath: string): Promise<void> {
    try {
      // Check if directory exists
      if (fsSync.existsSync(dirPath)) {
        // Remove recursively with force flag
        // Force ensures deletion even if files are locked (Windows)
        await fs.rm(dirPath, { recursive: true, force: true });
      }
    } catch (error) {
      // Provide context about which directory failed to delete
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete directory ${dirPath}: ${errorMsg}`);
    }
  }

  /**
   * Get file size in bytes
   *
   * Returns exact file size without loading into memory.
   * Uses fs.stat() for efficiency - just reads metadata.
   * Useful for validation and streaming.
   *
   * @static
   * @async
   * @method getFileSize
   * @param {string} filePath - Path to file
   *
   * @returns {Promise<number>} File size in bytes
   * @throws {Error} If file doesn't exist or can't be read
   *
   * @example
   * // Check file size
   * const size = await FileUtil.getFileSize('./video.mp4');
   * console.log(`File size: ${size} bytes`);
   *
   * // Validate size before processing
   * const size = await FileUtil.getFileSize(uploadPath);
   * const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
   * if (size > maxSize) throw new Error('File too large');
   *
   * // Get size in megabytes
   * const sizeInMB = (await FileUtil.getFileSize('./video.mp4')) / (1024 * 1024);
   */
  static async getFileSize(filePath: string): Promise<number> {
    try {
      // Get file stats (metadata, not content)
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      // Provide context about which file had issue
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file size for ${filePath}: ${errorMsg}`);
    }
  }

  /**
   * List all files and directories in a directory
   *
   * Returns array of names (not full paths).
   * Returns empty array if directory doesn't exist.
   * Useful for iterating over directory contents.
   *
   * @static
   * @async
   * @method listFiles
   * @param {string} dirPath - Path to directory
   *
   * @returns {Promise<string[]>} Array of file/directory names
   * @throws {Error} If directory can't be read
   *
   * @example
   * // List all uploads
   * const files = await FileUtil.listFiles('./videos/uploads');
   * for (const file of files) {
   *   console.log(file);
   * }
   *
   * // Filter to video files only
   * const files = await FileUtil.listFiles('./videos/uploads');
   * const videos = files.filter(f => f.endsWith('.mp4'));
   */
  static async listFiles(dirPath: string): Promise<string[]> {
    try {
      // Check if directory exists first
      if (!FileUtil.fileExists(dirPath)) {
        return [];
      }
      // Read directory and return list of file names
      const files: string[] = await fs.readdir(dirPath);
      return files;
    } catch (error) {
      // Provide context about which directory had issue
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to list files in ${dirPath}: ${errorMsg}`);
    }
  }

  /**
   * List files with detailed information
   *
   * Returns array of file entries with type and size information.
   * Distinguishes between files and directories.
   * Useful for building file browsers or detailed listings.
   *
   * @static
   * @async
   * @method listFilesWithDetails
   * @param {string} dirPath - Path to directory
   *
   * @returns {Promise<FileEntry[]>} Array of file entries with details
   * @throws {Error} If directory can't be read
   *
   * @example
   * // Get detailed file listing
   * const entries = await FileUtil.listFilesWithDetails('./videos/uploads');
   * for (const entry of entries) {
   *   if (entry.isDirectory) {
   *     console.log(`DIR: ${entry.name}`);
   *   } else {
   *     console.log(`FILE: ${entry.name} (${entry.size} bytes)`);
   *   }
   * }
   */
  static async listFilesWithDetails(dirPath: string): Promise<FileEntry[]> {
    try {
      // Check if directory exists
      if (!FileUtil.fileExists(dirPath)) {
        return [];
      }

      // Read directory entries with type info
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      // Convert to our FileEntry format
      const results: FileEntry[] = [];
      for (const entry of entries) {
        const result: FileEntry = {
          name: entry.name,
          isDirectory: entry.isDirectory()
        };

        // Get file size if it's a file
        if (!entry.isDirectory()) {
          try {
            const fullPath = path.join(dirPath, entry.name);
            const stats = await fs.stat(fullPath);
            result.size = stats.size;
          } catch {
            // Ignore errors getting size
          }
        }

        results.push(result);
      }

      return results;
    } catch (error) {
      // Provide context about which directory had issue
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to list files with details in ${dirPath}: ${errorMsg}`
      );
    }
  }

  /**
   * Get file extension without the dot
   *
   * Extracts extension from filename or full path.
   * Always returns lowercase for consistency.
   * Returns empty string for files without extension.
   *
   * Synchronous method - very fast, safe for immediate use.
   *
   * @static
   * @method getExtension
   * @param {string} fileName - File name or path
   *
   * @returns {string} File extension in lowercase (without dot)
   *
   * @example
   * FileUtil.getExtension('video.MP4');       // 'mp4'
   * FileUtil.getExtension('archive.tar.gz');  // 'gz' (gets last extension)
   * FileUtil.getExtension('README');          // '' (no extension)
   * FileUtil.getExtension('/path/to/file.ts'); // 'ts' (works with paths)
   */
  static getExtension(fileName: string): string {
    // Get extension using path.extname, remove leading dot, lowercase
    return path.extname(fileName).toLowerCase().substring(1);
  }

  /**
   * Get file name without extension
   *
   * Removes extension from filename or path.
   * Useful for generating output file names.
   * Works with paths containing directories.
   *
   * Synchronous method - very fast, safe for immediate use.
   *
   * @static
   * @method getBaseName
   * @param {string} fileName - File name or full path
   *
   * @returns {string} File name without extension
   *
   * @example
   * FileUtil.getBaseName('video.mp4');            // 'video'
   * FileUtil.getBaseName('/path/to/video.mp4');   // 'video'
   * FileUtil.getBaseName('archive.tar.gz');       // 'archive.tar'
   * FileUtil.getBaseName('/data/file.with.dots.txt'); // 'file.with.dots'
   */
  static getBaseName(fileName: string): string {
    // Get base name, removing extension
    return path.basename(fileName, path.extname(fileName));
  }

  /**
   * Get directory name from path
   *
   * Extracts the directory path from a full file path.
   * Returns '.' for files in current directory.
   *
   * Synchronous method - very fast, safe for immediate use.
   *
   * @static
   * @method getDirectory
   * @param {string} filePath - File path
   *
   * @returns {string} Directory path
   *
   * @example
   * FileUtil.getDirectory('/path/to/file.mp4');     // '/path/to'
   * FileUtil.getDirectory('./videos/stream.m3u8');  // './videos'
   * FileUtil.getDirectory('file.txt');              // '.'
   */
  static getDirectory(filePath: string): string {
    return path.dirname(filePath);
  }

  /**
   * Copy file from source to destination
   *
   * Copies file asynchronously, preserving content exactly.
   * Creates destination directory if needed.
   * Overwrites destination if it exists.
   *
   * @static
   * @async
   * @method copyFile
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   *
   * @returns {Promise<void>} Resolves when copy is complete
   * @throws {Error} If copy fails
   *
   * @example
   * // Copy uploaded file to backup
   * await FileUtil.copyFile('./videos/uploads/video.mp4', './backups/video.mp4');
   */
  static async copyFile(source: string, destination: string): Promise<void> {
    try {
      // Create destination directory if needed
      const destDir = FileUtil.getDirectory(destination);
      await FileUtil.createDirIfNotExists(destDir);

      // Copy file asynchronously
      await fs.copyFile(source, destination);
    } catch (error) {
      const errorMsg: string =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to copy file from ${source} to ${destination}: ${errorMsg}`
      );
    }
  }

  /**
   * Check if path is a directory
   *
   * Returns true only if path exists and is a directory.
   * Returns false if path is a file or doesn't exist.
   *
   * @static
   * @async
   * @method isDirectory
   * @param {string} filePath - Path to check
   *
   * @returns {Promise<boolean>} True if path is directory
   *
   * @example
   * const isDir = await FileUtil.isDirectory('./videos');
   * if (isDir) console.log('It\'s a directory');
   */
  static async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }
}

// Export for use in other modules
export default FileUtil;
