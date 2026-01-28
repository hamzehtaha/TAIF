/**
 * API Response Helpers
 * Standardized response format for all API endpoints
 * 
 * @module utils/apiResponse
 */

import { Response } from 'express';

/**
 * Standard API response format
 */
export interface ApiResponseFormat<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
}

/**
 * Paginated API response format
 */
export interface PaginatedResponseFormat<T> extends ApiResponseFormat<T[]> {
  pagination: PaginationMeta;
}

/**
 * Create a success response object
 * 
 * @template T - Type of the response data
 * @param data - The response data
 * @param message - Optional success message
 * @returns Formatted success response object
 * 
 * @example
 * successResponse({ videoId: '123' }, 'Video uploaded successfully')
 * // Returns: { success: true, data: { videoId: '123' }, message: 'Video uploaded successfully' }
 */
export function successResponse<T>(data: T, message?: string): ApiResponseFormat<T> {
  const response: ApiResponseFormat<T> = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * Create an error response object
 * 
 * @param code - Error code for programmatic handling
 * @param message - Human-readable error message
 * @param details - Optional additional error details
 * @returns Formatted error response object
 * 
 * @example
 * errorResponse('VALIDATION_ERROR', 'Invalid file format', { allowed: ['mp4', 'mkv'] })
 * // Returns: { success: false, error: { code: 'VALIDATION_ERROR', message: '...', details: {...} } }
 */
export function errorResponse(code: string, message: string, details?: unknown): ApiResponseFormat<never> {
  const response: ApiResponseFormat<never> = {
    success: false,
    error: {
      code,
      message
    }
  };
  
  if (details !== undefined) {
    response.error!.details = details;
  }
  
  return response;
}

/**
 * Create a paginated success response object
 * 
 * @template T - Type of items in the data array
 * @param data - Array of response items
 * @param pagination - Pagination metadata
 * @param message - Optional success message
 * @returns Formatted paginated response object
 * 
 * @example
 * paginatedResponse(videos, { total: 100, page: 1, limit: 10, hasMore: true, totalPages: 10 })
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string
): PaginatedResponseFormat<T> {
  const response: PaginatedResponseFormat<T> = {
    success: true,
    data,
    pagination
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * Calculate pagination metadata from query parameters
 * 
 * @param total - Total number of items
 * @param page - Current page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Pagination metadata object
 */
export function calculatePagination(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    hasMore: page < totalPages,
    totalPages
  };
}

/**
 * Parse and validate pagination query parameters
 * 
 * @param query - Express request query object
 * @param defaults - Default values for pagination
 * @returns Validated pagination parameters
 */
export function parsePaginationParams(
  query: Record<string, unknown>,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): { page: number; limit: number; skip: number } {
  const { page: defaultPage = 1, limit: defaultLimit = 50, maxLimit = 100 } = defaults;
  
  let page = parseInt(query.page as string, 10) || defaultPage;
  let limit = parseInt(query.limit as string, 10) || defaultLimit;
  
  // Ensure valid ranges
  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), maxLimit);
  
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Helper to send success response with proper status code
 */
export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
  res.status(statusCode).json(successResponse(data, message));
}

/**
 * Helper to send error response with proper status code
 */
export function sendError(res: Response, statusCode: number, code: string, message: string, details?: unknown): void {
  res.status(statusCode).json(errorResponse(code, message, details));
}

/**
 * Helper to send paginated response
 */
export function sendPaginated<T>(
  res: Response, 
  data: T[], 
  pagination: PaginationMeta, 
  message?: string
): void {
  res.status(200).json(paginatedResponse(data, pagination, message));
}
