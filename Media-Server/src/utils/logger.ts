/**
 * Logger Module - TypeScript Implementation
 *
 * Provides consistent, structured logging across the entire application.
 * Implements severity levels (error, warn, info, debug) for flexible control.
 * All messages include ISO timestamps and can include structured data.
 *
 * Features:
 * - Timestamp formatting (ISO 8601)
 * - Log level filtering based on configured severity
 * - Structured logging with optional data objects
 * - Console output with appropriate streams (stdout/stderr)
 * - Production-ready logging format with proper error context
 * - Type-safe logging with TypeScript interfaces
 *
 * Log Levels (ordered by severity):
 * - error (0): Critical errors that need immediate attention
 * - warn (1): Warnings for potentially problematic situations
 * - info (2): Informational messages about application flow (default)
 * - debug (3): Detailed debug information (verbose, development only)
 *
 * Each log level only displays messages at that level or higher priority.
 * For example, if level is 'warn', only warnings and errors are shown.
 *
 * @module logger
 * @example
 * const logger = new Logger('info');
 * logger.info('User logged in', { userId: 123 });
 * logger.error('Database connection failed', { error: err.message });
 * logger.warn('High memory usage', { usage: 0.85 });
 * logger.debug('Processing segment', { segment: 5 });
 *
 * @see {@link LogLevel} for log level constants
 */

import { LogLevel, LoggerData } from '../types';

/**
 * Interface for log level configuration
 * Maps log level names to numeric severity values
 */
interface LogLevelMap {
  [LogLevel.ERROR]: number;
  [LogLevel.WARN]: number;
  [LogLevel.INFO]: number;
  [LogLevel.DEBUG]: number;
}

/**
 * Logger class - Implements structured logging with severity levels
 *
 * Manages application logging with strong typing and flexible output control.
 * Uses a singleton pattern for consistent logging across the application.
 * Supports filtering logs by severity level to reduce noise in production.
 *
 * The logger automatically formats messages with timestamps and optional context,
 * making it easy to trace application behavior and debug issues.
 *
 * @class Logger
 * @example
 * // Create logger with info level (show info, warn, error)
 * const logger = new Logger('info');
 *
 * // Create logger with debug level (show all messages)
 * const debugLogger = new Logger('debug');
 *
 * // Create logger with error level (show errors only)
 * const errorOnlyLogger = new Logger('error');
 */
export class Logger {
  /**
   * Current minimum log level to display
   * @private
   */
  private readonly level: LogLevel;

  /**
   * Maps log level names to numeric severity
   * Lower numbers = higher priority
   * @private
   * @readonly
   */
  private readonly levels: LogLevelMap = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3
  };

  /**
   * Initialize logger with specified log level
   *
   * Creates a new logger instance configured to display logs at the specified
   * severity level and above. The log level controls verbosity of output.
   *
   * @constructor
   * @param {LogLevel} [level=LogLevel.INFO] - Minimum log level to display
   *   - LogLevel.ERROR: Only critical errors (0)
   *   - LogLevel.WARN: Warnings and errors (0-1)
   *   - LogLevel.INFO: Info, warnings, and errors (0-2) [default]
   *   - LogLevel.DEBUG: All messages including debug (0-3)
   *
   * @example
   * // Show all log levels (development)
   * const logger = new Logger(LogLevel.DEBUG);
   *
   * // Show info and above (production)
   * const logger = new Logger(LogLevel.INFO);
   *
   * // Show errors only (minimal output)
   * const logger = new Logger(LogLevel.ERROR);
   */
  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  /**
   * Format a log message with timestamp and level
   *
   * Creates a standardized log format that includes:
   * - ISO 8601 timestamp for precise time tracking across systems
   * - Log level in uppercase for easy visual scanning
   * - Original message text
   * - Optional structured data as JSON for searchable logs
   *
   * Format: [2024-01-20T10:30:45.123Z] [INFO] Message {"key":"value"}
   *
   * @method formatMessage
   * @private
   * @param {LogLevel} level - Log level (error, warn, info, debug)
   * @param {string} message - Log message content to display
   * @param {LoggerData} [data] - Optional structured context data
   *
   * @returns {string} Formatted log message ready for output
   *
   * @example
   * // Simple message
   * formatMessage(LogLevel.INFO, 'User action');
   * // Returns: "[2024-01-20T10:30:45.123Z] [INFO] User action"
   *
   * // Message with structured data
   * formatMessage(LogLevel.INFO, 'User login', { userId: 123, ip: '192.168.1.1' });
   * // Returns: "[2024-01-20T10:30:45.123Z] [INFO] User login {"userId":123,"ip":"192.168.1.1"}"
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    data?: LoggerData
  ): string {
    // Get current timestamp in ISO 8601 format for UTC compatibility
    const timestamp: string = new Date().toISOString();

    // Build formatted message with level indicator
    let formatted: string = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Append structured data if provided
    if (data) {
      formatted += ` ${JSON.stringify(data)}`;
    }

    return formatted;
  }

  /**
   * Log error level message
   *
   * Use for critical errors that need immediate attention or manual intervention.
   * Errors are output to stderr (console.error) for proper error stream handling.
   * Error logs include full context for debugging and incident response.
   *
   * Error level logs should indicate:
   * - Database connection failures
   * - Authentication/authorization failures
   * - File system errors
   * - Network timeouts or connection errors
   * - Unhandled exceptions
   *
   * @method error
   * @param {string} message - Descriptive error message
   * @param {LoggerData} [data] - Additional error context and metadata
   *
   * @returns {void}
   *
   * @example
   * // Simple error
   * logger.error('Database connection failed');
   *
   * // Error with context
   * logger.error('Database connection failed', {
   *   error: 'ECONNREFUSED',
   *   host: 'localhost:5432',
   *   attempt: 3
   * });
   */
  error(message: string, data?: LoggerData): void {
    // Only log if error level is configured to show (always true for error level)
    if (this.levels[this.level] >= this.levels[LogLevel.ERROR]) {
      const formatted: string = this.formatMessage(LogLevel.ERROR, message, data);
      console.error(formatted);
      // Track in log viewer
      try {
        const { addLog } = require('../routes/logsRoutes');
        addLog('ERROR', message, data);
      } catch (e) {
        // Ignore if logsRoutes not available
      }
    }
  }

  /**
   * Log warning level message
   *
   * Use for potentially problematic situations that don't stop execution.
   * Warnings help identify issues before they become errors.
   * Warning logs should indicate:
   * - Deprecated API usage
   * - High resource usage (memory, CPU)
   * - Unusual but recoverable conditions
   * - Configuration issues
   *
   * @method warn
   * @param {string} message - Warning message describing the issue
   * @param {LoggerData} [data] - Additional context about the warning
   *
   * @returns {void}
   *
   * @example
   * // Memory warning
   * logger.warn('High memory usage detected', {
   *   usage: '85%',
   *   threshold: '80%',
   *   available: '2GB'
   * });
   *
   * // Configuration warning
   * logger.warn('Deprecated configuration key', {
   *   deprecated: 'enableEncryption',
   *   use: 'security.enableEncryption'
   * });
   */
  warn(message: string, data?: LoggerData): void {
    // Log if warning level or higher priority is enabled
    if (this.levels[this.level] >= this.levels[LogLevel.WARN]) {
      const formatted: string = this.formatMessage(LogLevel.WARN, message, data);
      console.warn(formatted);
      // Track in log viewer
      try {
        const { addLog } = require('../routes/logsRoutes');
        addLog('WARN', message, data);
      } catch (e) {
        // Ignore if logsRoutes not available
      }
    }
  }

  /**
   * Log info level message
   *
   * Use for general informational messages about application flow and lifecycle.
   * Info is the default log level showing important events without being verbose.
   * Info logs should indicate:
   * - Application startup/shutdown
   * - Important business events (user actions, transactions)
   * - Service availability changes
   * - Configuration being applied
   * - Job completion
   *
   * @method info
   * @param {string} message - Informational message
   * @param {LoggerData} [data] - Optional business context
   *
   * @returns {void}
   *
   * @example
   * // Application lifecycle
   * logger.info('Application started', { version: '1.0.0', port: 3000 });
   *
   * // Business event
   * logger.info('Video processing completed', {
   *   videoId: '550e8400-e29b-41d4-a716-446655440000',
   *   duration: 120,
   *   processingTime: 45000
   * });
   */
  info(message: string, data?: LoggerData): void {
    // Log if info level or higher priority is enabled
    if (this.levels[this.level] >= this.levels[LogLevel.INFO]) {
      const formatted: string = this.formatMessage(LogLevel.INFO, message, data);
      console.log(formatted);
      // Track in log viewer
      try {
        const { addLog } = require('../routes/logsRoutes');
        addLog('INFO', message, data);
      } catch (e) {
        // Ignore if logsRoutes not available
      }
    }
  }

  /**
   * Log debug level message
   *
   * Use for detailed debugging information and development diagnostics.
   * Debug logs are only displayed when log level is explicitly set to 'debug'.
   * Debug logs should indicate:
   * - Entry/exit points of functions
   * - State changes
   * - Detailed operation progress
   * - Complex logic branches taken
   * - Performance metrics
   *
   * @method debug
   * @param {string} message - Debug message with detailed information
   * @param {LoggerData} [data] - Detailed context for debugging
   *
   * @returns {void}
   *
   * @example
   * // Function entry/exit
   * logger.debug('Entering processVideo', { videoId: 'xyz', inputPath: '/path/to/file' });
   *
   * // Progress tracking
   * logger.debug('Processing video segment', {
   *   segment: 5,
   *   resolution: '720p',
   *   size: 2048000,
   *   progress: '45%'
   * });
   */
  debug(message: string, data?: LoggerData): void {
    // Log only if debug level is explicitly enabled
    if (this.levels[this.level] >= this.levels[LogLevel.DEBUG]) {
      const formatted: string = this.formatMessage(LogLevel.DEBUG, message, data);
      console.debug(formatted);
    }
  }

  /**
   * Create a new logger instance with different log level
   *
   * Useful for creating specialized loggers for specific modules or components.
   * Allows different parts of the application to have different verbosity levels.
   *
   * @method withLevel
   * @param {LogLevel} level - New log level for the logger
   *
   * @returns {Logger} New logger instance with specified level
   *
   * @example
   * const infoLogger = new Logger(LogLevel.INFO);
   * const debugLogger = infoLogger.withLevel(LogLevel.DEBUG);
   * debugLogger.debug('Detailed info', { data: 'value' });
   */
  withLevel(level: LogLevel): Logger {
    return new Logger(level);
  }
}

// Export singleton instance with default configuration
export default new Logger(LogLevel.INFO);
