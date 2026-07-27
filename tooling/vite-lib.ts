import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type UserConfig } from "vite";
import dts from "vite-plugin-dts";

export interface LibOptions {
  /** Absolute path to the package root (pass `__dirname` / `import.meta.dirname`). */
  root: string;
  /** Entry points, relative to package root. Default: `{ index: "src/index.ts" }`. */
  entries?: Record<string, string>;
  /** Extra externals in addition to peer/deps and node builtins. */
  external?: (string | RegExp)[];
}

/**
 * Shared Vite library build config for every `@calix/*` package.
 *
 * - ESM + CJS output, `preserveModules` so consumers tree-shake cleanly.
 * - `.d.ts` emitted via vite-plugin-dts.
 * - All dependencies/peerDependencies externalized (never bundled).
 */
export function createLibConfig(options: LibOptions): UserConfig {
  const { root, entries = { index: "src/index.ts" }, external = [] } = options;

  // Read declared dependencies to externalize them automatically.
  // Use fs (not `require`): this config is bundled to ESM, where `require`
  // is unavailable.
  const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  const declared = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ];

  const resolvedEntries = Object.fromEntries(
    Object.entries(entries).map(([name, file]) => [name, resolve(root, file)]),
  );

  return defineConfig({
    plugins: [
      dts({
        root,
        entryRoot: "src",
        tsconfigPath: resolve(root, "tsconfig.json"),
        include: ["src"],
        exclude: ["src/**/*.{test,spec,stories,bench}.{ts,tsx}", "src/**/test/**"],
      }),
    ],
    build: {
      target: "es2022",
      sourcemap: true,
      lib: {
        entry: resolvedEntries,
        formats: ["es", "cjs"],
      },
      rollupOptions: {
        external: [
          /^node:/,
          ...declared.map((d) => new RegExp(`^${d}(/.*)?$`)),
          ...external,
        ],
        output: [
          {
            format: "es",
            preserveModules: true,
            preserveModulesRoot: "src",
            entryFileNames: "[name].js",
          },
          {
            format: "cjs",
            preserveModules: true,
            preserveModulesRoot: "src",
            entryFileNames: "[name].cjs",
          },
        ],
      },
    },
  }) as UserConfig;
}
