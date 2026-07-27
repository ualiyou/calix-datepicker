import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const packages = [
  "packages/core",
  "packages/adapters/gregorian",
  "packages/adapters/jalali",
  "packages/react",
  "packages/icons",
];

for (const directory of packages) {
  const packageRoot = resolve(root, directory);
  const manifest = JSON.parse(await readFile(resolve(packageRoot, "package.json"), "utf8"));
  const entry = manifest.exports["."];

  for (const field of ["types", "import", "require"]) {
    await access(resolve(packageRoot, entry[field]));
  }
  for (const dependency of Object.keys(manifest.peerDependencies ?? {})) {
    require.resolve(dependency, { paths: [packageRoot] });
  }

  const esm = await import(pathToFileURL(resolve(packageRoot, entry.import)).href);
  const cjs = require(resolve(packageRoot, entry.require));
  if (Object.keys(esm).length === 0 || Object.keys(cjs).length === 0) {
    throw new Error(`${manifest.name} has an empty public entry point`);
  }
}

const themes = JSON.parse(await readFile(resolve(root, "packages/themes/package.json"), "utf8"));
for (const path of Object.values(themes.exports)) await access(resolve(root, "packages/themes", path));

console.log("Public package ESM, CJS, types, files, and peer dependencies are valid.");
