import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: "jsdom",

    // Global test utilities
    globals: true,

    // Setup files
    setupFiles: ["./src/__tests__/setup.ts"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],

      // Files to include in coverage
      include: [
        "src/services/**/*.ts",
        "src/repositories/**/*.ts",
        "src/validation/**/*.ts",
        "src/lib/**/*.ts",
        "src/hooks/**/*.ts",
        "src/middleware/**/*.ts",
      ],

      // Files to exclude from coverage
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/dist/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "src/db/database.types.ts", // Generated types
        "src/env.d.ts",
      ],

      // Coverage thresholds
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },

      // Fail on threshold violations
      skipFull: true,
    },

    // Test match patterns
    include: ["src/__tests__/**/*.test.{ts,tsx}"],

    // Exclude patterns
    exclude: ["node_modules/", "dist/", ".idea/", ".git/", ".cache/"],

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Watch options
    watch: false,

    // Reporter
    reporter: ["verbose", "html"],

    // Output file for HTML reporter
    outputFile: {
      html: "./test-results/index.html",
    },

    // Disable threads for better debugging
    threads: true,

    // Max threads
    maxThreads: 4,

    // Min threads
    minThreads: 1,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
