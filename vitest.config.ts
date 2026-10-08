import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // The data layer. github.ts reads the GitHub API, spec-source.ts runs
      // git and provenance-source.ts reads the sites, each at build time with
      // no suite of its own; everything else in it is held at 100%.
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/lib/github.ts",
        "src/lib/spec-source.ts",
        "src/lib/provenance-source.ts",
        "src/lib/types.ts",
      ],
      reporter: ["text"],
      thresholds: {
        lines: 100,
        statements: 100,
        branches: 100,
        functions: 100,
      },
    },
  },
});
