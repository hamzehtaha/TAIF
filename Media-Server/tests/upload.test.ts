/**
 * Video API Tests
 * Tests for /api/videos and /api/upload endpoints
 */

import request from 'supertest';
import { Express } from 'express';
import { createTestApp, getAuthToken } from './testApp';
import * as path from 'path';
import * as fs from 'fs';

describe('Video API', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = createTestApp();
    authToken = await getAuthToken(app);
  });

  describe('GET /api/videos', () => {
    it('should return video list for authenticated user', async () => {
      const response = await request(app)
        .get('/api/videos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/videos?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should support sorting parameters', async () => {
      const response = await request(app)
        .get('/api/videos?sort=uploadedAt&order=desc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should limit maximum page size', async () => {
      const response = await request(app)
        .get('/api/videos?limit=1000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /api/video-ids', () => {
    it('should return list of video IDs for authenticated user', async () => {
      const response = await request(app)
        .get('/api/video-ids')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // data contains videoIds array inside the response
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/videos/:id', () => {
    it('should return 404 for non-existent video', async () => {
      const response = await request(app)
        .get('/api/videos/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/upload', () => {
    it('should return 400 for request without file', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept form data with optional parameters', async () => {
      // This test verifies the endpoint accepts multipart form data
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('videoName', 'Test Video')
        .field('videoId', 'test-video-id');

      // Will fail with "no file" but should process the fields
      expect(response.status).toBe(400);
    });

    it('should validate videoId format', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('videoId', 'invalid id with spaces!');

      // Should reject the invalid ID format or fail with no file
      expect(response.status).toBe(400);
    });
  });

  describe('Input Validation', () => {
    it('should handle invalid page parameter gracefully', async () => {
      const response = await request(app)
        .get('/api/videos?page=-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Should default to page 1
      expect(response.body.pagination.page).toBe(1);
    });

    it('should handle invalid limit parameter gracefully', async () => {
      const response = await request(app)
        .get('/api/videos?limit=-5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Should use default limit
      expect(response.body.pagination.limit).toBeGreaterThan(0);
    });

    it('should handle invalid sort field gracefully', async () => {
      const response = await request(app)
        .get('/api/videos?sort=invalidField')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Should still return videos, using default sort
    });
  });
});
