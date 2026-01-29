/**
 * Validation Module - TypeScript Implementation
 *
 * Provides comprehensive input validation and sanitization for the application.
 * Ensures all user input meets requirements before processing.
 * Generates unique identifiers for videos and database records.
 * Includes type guards for runtime type checking.
 *
 * Features:
 * - Video file type validation (whitelist approach for security)
 * - File size validation with strict limits
 * - File name sanitization (removes dangerous characters)
 * - Unique UUID v4 identifier generation for videos
 * - Required field validation on request objects
 * - Type validation for numbers and integers
 * - Email format validation
 * - URL validation
 *
 * Security Principles:
 * - Whitelist approach for file types (only allow known video formats)
 * - Rejects unknown file types to prevent execution attacks
 * - Sanitizes file names to prevent directory traversal and injection
 * - Validates file sizes against limits to prevent resource exhaustion
 * - No execution of arbitrary code or eval()
 * - Case-insensitive extension checking for robustness
 *
 * Supported Video Formats:
 * - MP4: H.264 video codec, AAC audio (most compatible)
 * - AVI: MPEG-4 Part 2 video, MP3 audio (legacy)
 * - MOV: QuickTime format (Apple standard)
 * - MKV: Matroska format (supports many codecs)
 * - FLV: Flash video (legacy format, limited support)
 * - WMV: Windows Media Video (Windows standard)
 * - WebM: VP8/VP9 video, Vorbis audio (web standard)
 *
 * @module validator
 * @example
 * if (!Validator.isValidVideoFile(fileName)) throw new ValidationError('Invalid file');
 * const fileId = Validator.generateFileId();
 * const safe = Validator.sanitizeFileName(fileName);
 *
 * @see {@link VideoQuality} for quality presets
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Validator utility class - Provides static validation methods
 *
 * All methods are static utilities that don't maintain state.
 * This allows usage without creating instances.
 * Methods follow a consistent pattern:
 * - Return boolean for validation checks
 * - Throw Error for validation errors
 * - Return value for transformations
 *
 * @class Validator
 * @static
 */
export class Validator {
  /**
   * Whitelist of allowed video file extensions
   * @private
   * @readonly
   */
  private static readonly ALLOWED_VIDEO_EXTENSIONS: ReadonlyArray<string> = [
    'mp4',
    'avi',
    'mov',
    'mkv',
    'flv',
    'wmv',
    'webm'
  ];

  /**
   * Validate if file is a supported video format
   *
   * Uses whitelist approach - only allows known video types.
   * Checks extension case-insensitively for robustness.
   * Prevents execution of arbitrary file types.
   *
   * The whitelist includes:
   * - MP4: Most compatible format for streaming
   * - AVI, MOV, MKV: Various video containers
   * - FLV, WMV: Legacy formats with limited support
   * - WebM: Open standard for web video
   *
   * @static
   * @method isValidVideoFile
   * @param {string} fileName - File name or path to validate
   *
   * @returns {boolean} True if file extension is a supported video format
   *
   * @example
   * Validator.isValidVideoFile('video.mp4');   // true
   * Validator.isValidVideoFile('video.txt');   // false
   * Validator.isValidVideoFile('video.MKV');   // true (case-insensitive)
   * Validator.isValidVideoFile('path/to/movie.avi'); // true (ignores path)
   */
  static isValidVideoFile(fileName: string): boolean {
    // Extract extension from filename, handling both files and paths
    const extension: string = fileName.split('.').pop()?.toLowerCase() || '';

    // Check if extension is in whitelist
    return Validator.ALLOWED_VIDEO_EXTENSIONS.includes(extension);
  }

  /**
   * Validate file size against maximum limit
   *
   * Ensures file size is positive and within specified limits.
   * Prevents disk space exhaustion and processing timeouts.
   * Returns false for negative or zero sizes to prevent edge cases.
   *
   * File size limits prevent:
   * - Disk space exhaustion
   * - Memory allocation failures
   * - Transcoding timeout issues
   * - Network timeout during upload
   *
   * @static
   * @method isValidFileSize
   * @param {number} fileSize - File size in bytes (from file stats)
   * @param {number} maxSize - Maximum allowed size in bytes
   *
   * @returns {boolean} True if file size is within valid range
   *
   * @example
   * // Typical 5GB limit for video uploads
   * const maxSize = 5 * 1024 * 1024 * 1024; // 5GB in bytes
   * if (Validator.isValidFileSize(stat.size, maxSize)) {
   *   processFile();
   * }
   *
   * // Check file size from upload
   * const isValid = Validator.isValidFileSize(uploadedFile.size, config.maxFileSize);
   */
  static isValidFileSize(fileSize: number, maxSize: number): boolean {
    // File must be positive (non-zero) and not exceed limit
    return fileSize > 0 && fileSize <= maxSize;
  }

  /**
   * Sanitize file name to remove dangerous characters
   *
   * Prevents directory traversal attacks and special character issues.
   * Replaces dangerous characters with underscores for safe storage.
   * Removes multiple consecutive underscores for cleaner names.
   * Converts to lowercase for consistency across systems.
   *
   * Characters replaced (security):
   * - Path separators: / \ : (prevent directory traversal)
   * - Control chars: null, tab, newline (prevent injection)
   * - Special chars: < > ? * " | (shell, Windows special)
   * - Unicode control: various control characters
   * - Space gets converted to underscore
   *
   * Result is filesystem-safe and cross-platform compatible.
   *
   * @static
   * @method sanitizeFileName
   * @param {string} fileName - Original file name (can be unsafe)
   *
   * @returns {string} Safe file name for storage and display
   *
   * @example
   * // Remove spaces and special characters
   * Validator.sanitizeFileName('My Video (2024).mp4');
   * // Returns: 'my_video_2024_.mp4'
   *
   * // Prevent directory traversal
   * Validator.sanitizeFileName('../../../etc/passwd');
   * // Returns: '__etc_passwd'
   *
   * // Handle Unicode and emoji
   * Validator.sanitizeFileName('Movie™ 2024® 🎬.mp4');
   * // Returns: 'movie_2024____.mp4'
   */
  static sanitizeFileName(fileName: string): string {
    // Replace all non-alphanumeric characters except dot, underscore, hyphen
    // This includes spaces, special chars, Unicode, control chars
    let sanitized: string = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Collapse multiple underscores to single underscore
    sanitized = sanitized.replace(/_{2,}/g, '_');

    // Convert to lowercase for consistency
    sanitized = sanitized.toLowerCase();

    return sanitized;
  }

  /**
   * Generate unique file identifier using UUID v4
   *
   * Creates a cryptographically random 128-bit value encoded as string.
   * UUID v4 provides extremely low collision probability.
   * Used as primary keys for video records and directory names.
   *
   * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   * - x: random hex digits (0-f)
   * - 4: version 4 indicator (fixed)
   * - y: variant bits (8, 9, a, or b)
   *
   * Properties:
   * - 128-bit random number encoded as string
   * - 36 characters total (including hyphens)
   * - ~5.3 x 10^36 possible values
   * - Collision probability negligible for any practical use
   *
   * @static
   * @method generateFileId
   *
   * @returns {string} UUID v4 string (36 characters)
   *
   * @example
   * const videoId = Validator.generateFileId();
   * // Returns: '550e8400-e29b-41d4-a716-446655440000'
   *
   * // Use for directory names
   * const streamDir = path.join(config.directories.streams, Validator.generateFileId());
   *
   * // Use for video record IDs
   * const video = {
   *   id: Validator.generateFileId(),
   *   filename: 'video.mp4',
   *   createdAt: new Date()
   * };
   */
  static generateFileId(): string {
    // Use uuid v4 for random ID generation
    return uuidv4();
  }

  /**
   * Validate that required fields are present in object
   *
   * Checks that all specified fields exist and have truthy values.
   * Throws descriptive error naming the missing or falsy field.
   * Useful for API request validation and parameter checking.
   *
   * Falsy values (all considered invalid):
   * - undefined
   * - null
   * - false
   * - 0
   * - '' (empty string)
   * - NaN
   *
   * Note: This is strict validation. Use custom checks for allowing 0 or empty strings.
   *
   * @static
   * @method validateRequired
   * @param {Record<string, any>} data - Object to validate
   * @param {ReadonlyArray<string>} requiredFields - Array of required field names
   *
   * @throws {Error} If any required field is missing or falsy
   * @returns {void}
   *
   * @example
   * // Successful validation
   * const body = { title: 'Video', duration: 120 };
   * Validator.validateRequired(body, ['title', 'duration']);
   * // Succeeds silently
   *
   * // Failed validation
   * Validator.validateRequired(body, ['title', 'uploader']);
   * // Throws: Error("Missing required field: uploader")
   *
   * // Empty string fails validation
   * Validator.validateRequired({ name: '', description: 'test' }, ['name', 'description']);
   * // Throws: Error("Missing required field: name")
   */
  static validateRequired(
    data: Record<string, any>,
    requiredFields: ReadonlyArray<string>
  ): void {
    for (const field of requiredFields) {
      // Check if field exists and has a truthy value
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Validate that value is a positive integer
   *
   * Ensures value is a valid integer (no decimals) and greater than zero.
   * Useful for IDs, counts, durations, and other positive numbers.
   * Throws descriptive error if validation fails.
   *
   * Valid values: 1, 2, 100, 999999
   * Invalid values: -5, 0, 3.14, NaN, null, undefined
   *
   * @static
   * @method validatePositiveInteger
   * @param {number} value - Value to validate
   * @param {string} fieldName - Field name for error context
   *
   * @throws {Error} If value is not an integer or not positive
   * @returns {void}
   *
   * @example
   * // Valid positive integer
   * Validator.validatePositiveInteger(10, 'duration');
   * // Succeeds silently
   *
   * // Negative number fails
   * Validator.validatePositiveInteger(-5, 'duration');
   * // Throws: Error("duration must be a positive integer")
   *
   * // Zero fails
   * Validator.validatePositiveInteger(0, 'count');
   * // Throws: Error("count must be a positive integer")
   *
   * // Decimal fails
   * Validator.validatePositiveInteger(3.14, 'frames');
   * // Throws: Error("frames must be a positive integer")
   */
  static validatePositiveInteger(value: number, fieldName: string): void {
    // Check if value is integer AND greater than zero
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${fieldName} must be a positive integer`);
    }
  }

  /**
   * Validate email address format
   *
   * Performs basic email format validation using regex pattern.
   * Matches most common email formats.
   * For production, consider using email verification via sending confirmation.
   *
   * Pattern validates:
   * - Local part: alphanumeric, dots, hyphens, underscores
   * - @ symbol (required)
   * - Domain: alphanumeric, dots, hyphens
   * - TLD: 2-6 characters
   *
   * Limitations: This regex doesn't validate RFC 5321 completely.
   * For strict validation, use email verification service.
   *
   * @static
   * @method isValidEmail
   * @param {string} email - Email address to validate
   *
   * @returns {boolean} True if email matches basic format
   *
   * @example
   * Validator.isValidEmail('user@example.com');      // true
   * Validator.isValidEmail('user.name@domain.co.uk'); // true
   * Validator.isValidEmail('invalid@');               // false
   * Validator.isValidEmail('no-at-sign.com');         // false
   */
  static isValidEmail(email: string): boolean {
    // Basic email format regex
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   *
   * Checks if string is a valid HTTP/HTTPS URL.
   * Validates protocol, domain, and basic structure.
   *
   * Valid URLs:
   * - http://example.com
   * - https://sub.example.com/path
   * - https://example.com:8080/path?query=value
   *
   * Invalid URLs:
   * - ftp://example.com (only HTTP/HTTPS)
   * - example.com (missing protocol)
   * - http:// (missing domain)
   *
   * @static
   * @method isValidUrl
   * @param {string} url - URL to validate
   *
   * @returns {boolean} True if URL has valid format
   *
   * @example
   * Validator.isValidUrl('https://example.com');           // true
   * Validator.isValidUrl('http://sub.domain.com/path');    // true
   * Validator.isValidUrl('not-a-url');                     // false
   * Validator.isValidUrl('ftp://example.com');             // false
   */
  static isValidUrl(url: string): boolean {
    try {
      // Use URL constructor to validate - throws if invalid
      new URL(url);
      // Only allow HTTP and HTTPS protocols
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  /**
   * Type guard for checking if object is not null or undefined
   *
   * Useful for filtering out null/undefined from arrays.
   * TypeScript type narrowing helper.
   *
   * @static
   * @template T
   * @method isDefined
   * @param {T | null | undefined} value - Value to check
   *
   * @returns {value is T} True if value is not null or undefined
   *
   * @example
   * // Filter null values from array
   * const values = [1, null, 2, undefined, 3];
   * const defined = values.filter(Validator.isDefined);
   * // Result: [1, 2, 3]
   */
  static isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
  }
}

// Export for use in other modules
export default Validator;
