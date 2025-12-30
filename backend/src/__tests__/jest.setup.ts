/**
 * @fileoverview Jest setup file for test configuration
 * @author Offer Hub Team
 */

import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);

// Suppress console logs in tests (optional)
// jest.spyOn(console, 'log').mockImplementation(() => {});
// jest.spyOn(console, 'error').mockImplementation(() => {});

// Note: Crypto mocking can be added here if needed for specific tests
// For now, we'll use real crypto functions in tests

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
