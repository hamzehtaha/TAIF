/**
 * Stream API Tests
 * Tests for /streams and health endpoints
 */

import request from 'supertest';
import { Express } from 'express';
import { createTestApp, getAuthToken } from './testApp';

describe('Stream API', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = createTestApp();
    authToken = await getAuthToken(app);
  });

  describe('GET /streams/:videoId/:quality', () => {
    it('should return 404 for non-existent video', async () => {
      const response = await request(app)
        .get('/streams/non-existent-video/720p.mp4');

      expect(response.status).toBe(404);
    });

    it('should return 404 for invalid quality', async () => {
      const response = await request(app)
        .get('/streams/some-video/invalid.mp4');

      expect(response.status).toBe(404);
    });
  });
});

describe('Health Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
    });

    it('should return healthy status for working server', async () => {
      const response = await request(app).get('/health');

      expect(response.body.data.status).toBe('healthy');
    });
  });

  describe('GET /ready', () => {
    it('should return ready status', async () => {
      const response = await request(app).get('/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
    });
  });

  describe('GET /live', () => {
    it('should return alive status', async () => {
      const response = await request(app).get('/live');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });
  });
});

describe('Statistics API', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = createTestApp();
    authToken = await getAuthToken(app);
  });

  describe('GET /api/admin/statistics', () => {
    it('should return statistics for authenticated user', async () => {
      const response = await request(app)
        .get('/api/admin/statistics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should include server, media, and performance stats', async () => {
      const response = await request(app)
        .get('/api/admin/statistics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('server');
      expect(response.body.data).toHaveProperty('media');
      expect(response.body.data).toHaveProperty('performance');
    });
  });
});
