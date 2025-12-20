import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Extend expect with custom matchers (if needed in the future)
// expect.extend({
//   toBeWithinRange(received, floor, ceiling) {
//     const pass = received >= floor && received <= ceiling;
//     return {
//       pass,
//       message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
//     };
//   },
// });

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep console.error and console.warn for debugging
  // Uncomment below to silence them:
  // error: vi.fn(),
  // warn: vi.fn(),

  // Silence console.log, console.info, console.debug in tests
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock environment variables for tests
process.env.NODE_ENV = "test";
