/**
 * API Response Utilities Tests
 * Tests for src/utils/apiResponse.ts
 */

import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePaginationParams,
  calculatePagination,
  PaginationMeta
} from '../src/utils/apiResponse';

describe('API Response Utilities', () => {
  describe('successResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const result = successResponse(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.message).toBeUndefined();
    });

    it('should include message when provided', () => {
      const data = { id: 1 };
      const result = successResponse(data, 'Operation successful');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.message).toBe('Operation successful');
    });

    it('should handle null data', () => {
      const result = successResponse(null);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle array data', () => {
      const data = [1, 2, 3];
      const result = successResponse(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });
  });

  describe('errorResponse', () => {
    it('should create error response with code and message', () => {
      const result = errorResponse('ERROR_CODE', 'Something went wrong');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('ERROR_CODE');
      expect(result.error?.message).toBe('Something went wrong');
    });

    it('should include details when provided', () => {
      const result = errorResponse('NOT_FOUND', 'Not found', { id: 123 });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('Not found');
      expect(result.error?.details).toEqual({ id: 123 });
    });
  });

  describe('paginatedResponse', () => {
    it('should create paginated response', () => {
      const data = [1, 2, 3, 4, 5];
      const pagination: PaginationMeta = {
        page: 1,
        limit: 5,
        total: 20,
        totalPages: 4,
        hasMore: true
      };

      const result = paginatedResponse(data, pagination);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.pagination).toEqual(pagination);
    });
  });

  describe('parsePaginationParams', () => {
    it('should parse valid pagination params', () => {
      const query = { page: '2', limit: '25' };
      const result = parsePaginationParams(query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    it('should use defaults for missing params', () => {
      const query = {};
      const result = parsePaginationParams(query);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('should enforce minimum page of 1', () => {
      const query = { page: '0' };
      const result = parsePaginationParams(query);

      expect(result.page).toBe(1);
    });

    it('should enforce minimum page for negative values', () => {
      const query = { page: '-5' };
      const result = parsePaginationParams(query);

      expect(result.page).toBe(1);
    });

    it('should use default for zero limit', () => {
      const query = { limit: '0' };
      const result = parsePaginationParams(query);

      // 0 gets parsed as falsy, so defaults to 50
      expect(result.limit).toBe(50);
    });

    it('should enforce maximum limit of 100', () => {
      const query = { limit: '500' };
      const result = parsePaginationParams(query);

      expect(result.limit).toBe(100);
    });

    it('should use custom defaults when provided', () => {
      const query = {};
      const result = parsePaginationParams(query, { page: 10, limit: 20 });

      expect(result.page).toBe(10);
      expect(result.limit).toBe(20);
    });

    it('should calculate skip correctly', () => {
      const query = { page: '3', limit: '10' };
      const result = parsePaginationParams(query);

      expect(result.skip).toBe(20); // (3-1) * 10
    });
  });

  describe('calculatePagination', () => {
    it('should calculate pagination metadata correctly', () => {
      const result = calculatePagination(100, 1, 10);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(100);
      expect(result.totalPages).toBe(10);
      expect(result.hasMore).toBe(true);
    });

    it('should indicate no more pages on last page', () => {
      const result = calculatePagination(100, 10, 10);

      expect(result.page).toBe(10);
      expect(result.hasMore).toBe(false);
    });

    it('should handle single page', () => {
      const result = calculatePagination(5, 1, 10);

      expect(result.totalPages).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should handle zero items', () => {
      const result = calculatePagination(0, 1, 10);

      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should handle exact page boundary', () => {
      const result = calculatePagination(50, 1, 50);

      expect(result.totalPages).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should handle partial last page', () => {
      const result = calculatePagination(55, 2, 50);

      expect(result.totalPages).toBe(2);
      expect(result.hasMore).toBe(false);
    });
  });
});
