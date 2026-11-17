import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    exclude: ["e2e/**", "node_modules/**"],
  },
  coverage: {
    provider: "v8",
    reporter: ["text", "lcov"],
    reportsDirectory: "coverage",
  },
});
