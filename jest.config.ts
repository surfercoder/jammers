import type { Config } from "jest";
import nextJest from "next/jest.js";

// next/jest wires up the SWC transform, CSS/image/font mocking, and .env
// loading for us. We layer our own coverage gate + module shims on top.
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // Watchman isn't available in every environment (CI sandboxes, etc.).
  watchman: false,
  setupFiles: ["<rootDir>/test/env.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    // `server-only` / `client-only` throw when imported outside their runtime;
    // stub them so server modules can be unit-tested.
    "^server-only$": "<rootDir>/test/empty.ts",
    "^client-only$": "<rootDir>/test/empty.ts",
    "^@test/(.*)$": "<rootDir>/test/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default createJestConfig(config);
