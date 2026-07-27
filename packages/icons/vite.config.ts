import { createLibConfig } from "../../tooling/vite-lib";

export default createLibConfig({
  root: import.meta.dirname,
  entries: { index: "src/index.tsx" },
  external: ["react", "react/jsx-runtime"],
});
