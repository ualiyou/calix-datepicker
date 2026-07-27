import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.{test,spec}.ts", "src/**/index.ts", "src/**/*.d.ts", "src/**/*.bench.ts", "src/test/**", "src/types.ts"],
      thresholds: { lines: 75, functions: 60, branches: 80, statements: 75 },
    },
  },
});
