/**
 * Data Source Configuration
 * 
 * Toggle between MOCK data (local JSON file) and REAL API
 * 
 * To switch to real API:
 * 1. Set USE_MOCK_DATA = false
 * 2. Ensure backend API is running
 * 3. All services will automatically use real API endpoints
 */

export const USE_MOCK_DATA = true; // Set to false when backend is ready

export const API_CONFIG = {
  useMockData: USE_MOCK_DATA,
  mockDataPath: '/data/localDB.json',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
};
