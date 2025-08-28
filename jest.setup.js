import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001';

// Mock fetch globally
global.fetch = jest.fn();

// Setup console mocks to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};