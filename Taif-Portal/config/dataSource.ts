export const USE_MOCK_DATA = false; // Set to false when backend is ready

export const API_CONFIG = {
  useMockData: USE_MOCK_DATA,
  mockDataPath: '/data/localDB.json',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7277',
};
