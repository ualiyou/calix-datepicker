import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix({ future: { v3_singleFetch: true } })],
  ssr: {
    // Bundle workspace packages during SSR so they resolve from source.
    noExternal: [/^@calix\//],
  },
});
