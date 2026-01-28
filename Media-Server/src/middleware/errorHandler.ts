/**
 * Error Handling Module - TypeScript Implementation
 *
 * Provides centralized error handling for the entire application.
 * Includes custom error classes, Express middleware, and wrapper functions.
 * Ensures consistent error responses across all endpoints.
 *
 * Features:
 * - Global error handler middleware for Express
 * - Async route wrapper for automatic error catching
 * - Custom error classes with HTTP status codes
 * - Consistent error response format (JSON)
 * - Stack traces in development mode only
 * - Proper HTTP status codes (400, 404, 500)
 * - Error logging with request context
 * - Type-safe error handling with TypeScript
 *
 * Error Classes Hierarchy:
 * - AppError: Base error class (500 status)
 *   - ValidationError: Invalid input (400 status)
 *   - NotFoundError: Resource not found (404 status)
 *   - AuthenticationError: Auth failure (401 status)
 *   - AuthorizationError: Permission denied (403 status)
 *
 * Error Response Format (JSON):
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Human readable message",
 *     "stack": "..." // Only in development
 *   }
 * }
 *
 * Usage:
 * app.use(errorHandler);                        // Install global handler
 * throw new ValidationError('Invalid input');   // Throw custom error
 * router.get('/path', asyncHandler(handler));  // Wrap async route
 *
 * @module errorHandler
 * @requires express
 * @example
 * import { errorHandler, asyncHandler, ValidationError } from './errorHandler';
 *
 * // Install error handler (last middleware)
 * app.use(errorHandler);
 *
 * // Throw validation error
 * router.get('/api/video/:id', asyncHandler(async (req, res) => {
 *   if (!req.params.id) {
 *     throw new ValidationError('Video ID is required');
 *   }
 *   res.json({ video: await getVideo(req.params.id) });
 * }));
 */

import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler
} from 'express';
import { Logger } from '../utils/logger';
import { LogLevel } from '../types';

/**
 * Logger instance for error logging
 * @private
 */
const logger: Logger = new Logger(LogLevel.ERROR);

/**
 * Interface for application error details
 */
interface AppErrorDetails {
  /** Error code for client identification */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Stack trace (development mode only) */
  stack?: string;
}

/**
 * Interface for error response body
 */
interface ErrorResponse {
  /** Success flag (always false for errors) */
  success: false;
  /** Error details */
  error: AppErrorDetails;
}

/**
 * Global error handler middleware
 *
 * Must be registered LAST in middleware chain, after all routes.
 * Catches all errors thrown in route handlers and middleware.
 * Logs errors with appropriate context for debugging.
 * Returns consistent JSON error response to client.
 *
 * Middleware Order (for reference):
 * 1. Body parser middleware
 * 2. Logging middleware
 * 3. Authentication middleware
 * 4. Route handlers
 * 5. 404 handler
 * 6. ERROR HANDLER (this middleware, must be last)
 *
 * Error Handling:
 * - Logs with request method and path
 * - Includes stack trace in development mode
 * - Returns appropriate HTTP status code
 * - Sends JSON response format
 *
 * Status Codes:
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized (authentication failures)
 * - 403: Forbidden (permission denied)
 * - 404: Not Found (resource doesn't exist)
 * - 500: Internal Server Error (unexpected errors)
 *
 * @middleware errorHandler
 * @param {Error} err - Error object from Express
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware (unused but required signature)
 *
 * @returns {void} Sends error response
 *
 * @example
 * // In server.ts, after all routes:
 * app.use(errorHandler);
 *
 * // Express will catch errors and pass to this handler
 * // Thrown errors, rejected promises, etc. all get caught
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Get status code from error or default to 500
  const statusCode: number =
    err instanceof AppError ? err.statusCode : 500;

  // Get error message
  const message: string = err.message || 'Internal Server Error';

  // Get error code or default
  const code: string =
    err instanceof AppError ? err.code : 'ERROR';

  // Log error with request context
  logger.error(`[${req.method}] ${req.path}`, {
    statusCode,
    message,
    code,
    // Include stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    // Include request details for debugging
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Build error response object
  const errorDetails: AppErrorDetails = {
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Send error response
  const response: ErrorResponse = {
    success: false,
    error: errorDetails
  };

  res.status(statusCode).json(response);
};

/**
 * Wrapper for async route handlers
 *
 * Express doesn't automatically catch errors from async functions.
 * This wrapper catches rejected promises and passes them to error handler.
 * Enables clean async/await syntax in route handlers without try-catch.
 *
 * How it works:
 * 1. Wraps the route handler function
 * 2. Returns a function that Express calls
 * 3. Calls the handler wrapped in Promise.resolve()
 * 4. Catches any errors with .catch(next)
 * 5. Express error handler catches and responds
 *
 * Benefits:
 * - No try-catch boilerplate in route handlers
 * - Automatic error propagation
 * - Clean async/await code
 * - Consistent error handling
 *
 * @function asyncHandler
 * @template T - Return type of handler
 * @param {RequestHandler} fn - Express route handler (async or sync)
 *
 * @returns {RequestHandler} Wrapped function that handles errors
 *
 * @example
 * // Without wrapper (requires try-catch):
 * router.get('/video/:id', async (req, res, next) => {
 *   try {
 *     const video = await VideoService.get(req.params.id);
 *     res.json(video);
 *   } catch (err) {
 *     next(err); // Pass to error handler
 *   }
 * });
 *
 * // With wrapper (clean syntax):
 * router.get('/video/:id', asyncHandler(async (req, res) => {
 *   const video = await VideoService.get(req.params.id);
 *   res.json(video);
 *   // Errors automatically caught and passed to error handler
 * }));
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    // Wrap handler call in Promise to catch errors
    // Promise.resolve ensures both async and sync functions work
    Promise.resolve(fn(req, res, next))
      // Catch any error and pass to Express error handler
      .catch(next);
  };

/**
 * Custom error class for application errors
 *
 * Base class for all application-specific errors.
 * Provides HTTP status codes and error codes for consistent error handling.
 * Used as foundation for ValidationError, NotFoundError, etc.
 *
 * Properties:
 * - message: Human-readable error description
 * - statusCode: HTTP status code (400-599)
 * - code: Machine-readable error identifier
 * - stack: Captured stack trace for debugging
 *
 * Inheritance:
 * - Extends built-in Error class
 * - Captures stack trace at construction
 * - Used for custom error types
 *
 * @class AppError
 * @extends Error
 *
 * @param {string} message - Human-readable error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {string} [code='ERROR'] - Machine-readable error code
 *
 * @example
 * // Generic application error
 * throw new AppError('Something went wrong', 500, 'INTERNAL_ERROR');
 *
 * // With status code
 * throw new AppError('Operation failed', 503, 'SERVICE_UNAVAILABLE');
 *
 * // Catch and handle
 * try {
 *   throw new AppError('Invalid state', 400, 'INVALID_STATE');
 * } catch (err) {
 *   if (err instanceof AppError) {
 *     console.log(`Error ${err.code}: ${err.message} (${err.statusCode})`);
 *   }
 * }
 */
export class AppError extends Error {
  /**
   * HTTP status code for this error
   * @readonly
   */
  readonly statusCode: number;

  /**
   * Machine-readable error code
   * @readonly
   */
  readonly code: string;

  /**
   * Create application error
   *
   * @constructor
   * @param {string} message - Error message shown to client
   * @param {number} [statusCode=500] - HTTP status code
   * @param {string} [code='ERROR'] - Error code for identification
   */
  constructor(message: string, statusCode: number = 500, code: string = 'ERROR') {
    // Call parent Error constructor
    super(message);

    // Set error type for instanceof checks
    this.name = 'AppError';

    // Store properties
    this.statusCode = statusCode;
    this.code = code;

    // Capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 *
 * For errors related to invalid input or request data.
 * Returns HTTP 400 (Bad Request) status code.
 *
 * Use cases:
 * - Missing required fields
 * - Invalid field values
 * - Format validation failures
 * - Type mismatches
 *
 * @class ValidationError
 * @extends AppError
 *
 * @param {string} message - Description of validation failure
 *
 * @example
 * // Missing required field
 * throw new ValidationError('Email is required');
 *
 * // Invalid format
 * throw new ValidationError('Email format is invalid');
 *
 * // Result: 400 response with error code VALIDATION_ERROR
 */
export class ValidationError extends AppError {
  /**
   * Create validation error
   *
   * @constructor
   * @param {string} message - Validation error message
   */
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Not found error class
 *
 * For errors when requested resource doesn't exist.
 * Returns HTTP 404 (Not Found) status code.
 *
 * Use cases:
 * - Video ID not found in database
 * - Requested file doesn't exist
 * - User not found by ID
 * - Route not found (caught by Express)
 *
 * @class NotFoundError
 * @extends AppError
 *
 * @param {string} [message='Resource not found'] - Description of missing resource
 *
 * @example
 * // Video not found
 * throw new NotFoundError('Video ID not found');
 *
 * // File not found
 * throw new NotFoundError('Segment file not found: segment_001.ts');
 *
 * // Result: 404 response with error code NOT_FOUND
 */
export class NotFoundError extends AppError {
  /**
   * Create not found error
   *
   * @constructor
   * @param {string} [message='Resource not found'] - Error message
   */
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Authentication error class
 *
 * For errors when user authentication fails.
 * Returns HTTP 401 (Unauthorized) status code.
 *
 * Use cases:
 * - Missing or invalid auth token
 * - Token expired
 * - Invalid credentials
 * - API key invalid
 *
 * @class AuthenticationError
 * @extends AppError
 *
 * @param {string} [message='Authentication failed'] - Error message
 *
 * @example
 * throw new AuthenticationError('Invalid API token');
 */
export class AuthenticationError extends AppError {
  /**
   * Create authentication error
   *
   * @constructor
   * @param {string} [message='Authentication failed'] - Error message
   */
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error class
 *
 * For errors when user lacks required permissions.
 * Returns HTTP 403 (Forbidden) status code.
 *
 * Use cases:
 * - User doesn't own resource
 * - User lacks admin privileges
 * - Permission denied for operation
 * - Insufficient role
 *
 * @class AuthorizationError
 * @extends AppError
 *
 * @param {string} [message='Permission denied'] - Error message
 *
 * @example
 * throw new AuthorizationError('Only admin can delete users');
 */
export class AuthorizationError extends AppError {
  /**
   * Create authorization error
   *
   * @constructor
   * @param {string} [message='Permission denied'] - Error message
   */
  constructor(message: string = 'Permission denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

// Export for use in other modules
export default { errorHandler, asyncHandler, AppError, ValidationError, NotFoundError };
