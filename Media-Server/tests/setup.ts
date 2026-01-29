/**
 * Jest Test Setup
 * Configures the test environment before running tests
 */

// Set test environment variables BEFORE importing Config
process.env.NODE_ENV = 'testing';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'testpassword123';
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests
process.env.VIDEO_UPLOAD_DIR = './test-videos/uploads';
process.env.VIDEO_STREAM_DIR = './test-videos/streams';

import { Config } from '../src/config/config';

// Extend Jest matchers if needed
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      message: () => pass
        ? `expected ${received} not to be a valid UUID`
        : `expected ${received} to be a valid UUID`,
      pass
    };
  }
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
    }
  }
}

// Global beforeAll - runs once before all tests
beforeAll(async () => {
  // Initialize config for tests
  Config.getInstance();
});

// Global afterAll - runs once after all tests
afterAll(async () => {
  // Cleanup any test resources
});

// Increase timeout for integration tests
jest.setTimeout(30000);
