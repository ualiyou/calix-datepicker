import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const config = {
  basePath,
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  typescript: { tsconfigPath: "./tsconfig.build.json" },
};

export default withMDX(config);
