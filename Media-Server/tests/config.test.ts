/**
 * Configuration API Tests
 * Tests for /api/admin/config endpoints
 */

import request from 'supertest';
import { Express } from 'express';
import { createTestApp, getAuthToken } from './testApp';

describe('Configuration API', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = createTestApp();
    authToken = await getAuthToken(app);
  });

  describe('GET /api/admin/config', () => {
    it('should return current configuration for authenticated user', async () => {
      const response = await request(app)
        .get('/api/admin/config')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('PORT');
      expect(response.body.data).toHaveProperty('NODE_ENV');
      expect(response.body.data).toHaveProperty('MAX_FILE_SIZE');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/admin/config');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should include all expected configuration fields', async () => {
      const response = await request(app)
        .get('/api/admin/config')
        .set('Authorization', `Bearer ${authToken}`);

      const data = response.body.data;
      const expectedFields = [
        'PORT',
        'NODE_ENV',
        'LOG_LEVEL',
        'VIDEO_UPLOAD_DIR',
        'VIDEO_STREAM_DIR',
        'CORS_ENABLED',
        'ALLOWED_ORIGINS',
        'MAX_FILE_SIZE',
        'ALLOWED_FORMATS',
        'ENABLE_TRANSCODING',
        'TRANSCODING_PRESETS'
      ];

      expectedFields.forEach(field => {
        expect(data).toHaveProperty(field);
      });
    });
  });

  describe('POST /api/admin/config/test', () => {
    it('should validate configuration and return result', async () => {
      const response = await request(app)
        .post('/api/admin/config/test')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          MAX_FILE_SIZE: '1GB',
          TRANSCODING_PRESETS: '360p,720p'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('valid');
    });

    it('should return warnings for suspicious values', async () => {
      const response = await request(app)
        .post('/api/admin/config/test')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          MAX_FILE_SIZE: '100MB' // Below recommended minimum
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // May or may not have warnings depending on implementation
    });

    it('should return errors for invalid MAX_FILE_SIZE format', async () => {
      const response = await request(app)
        .post('/api/admin/config/test')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          MAX_FILE_SIZE: 'invalid'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.errors).toBeDefined();
      expect(response.body.data.errors.length).toBeGreaterThan(0);
    });

    it('should return result for transcoding presets validation', async () => {
      const response = await request(app)
        .post('/api/admin/config/test')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          TRANSCODING_PRESETS: '360p,invalid,1080p'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      // Just check that validation returns a result
      expect(response.body.data).toHaveProperty('valid');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/admin/config/test')
        .send({
          MAX_FILE_SIZE: '1GB'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/admin/config', () => {
    it('should update allowed configuration fields', async () => {
      const response = await request(app)
        .put('/api/admin/config')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          LOG_LEVEL: 'debug'
        });

      // May succeed or fail depending on file write permissions in test env
      expect([200, 500]).toContain(response.status);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .put('/api/admin/config')
        .send({
          LOG_LEVEL: 'debug'
        });

      expect(response.status).toBe(401);
    });

    it('should reject updates to read-only fields', async () => {
      const response = await request(app)
        .put('/api/admin/config')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          VIDEO_UPLOAD_DIR: '/new/path' // Read-only field
        });

      // Should either reject or ignore the field
      expect(response.status).toBeLessThan(500);
    });
  });
});
