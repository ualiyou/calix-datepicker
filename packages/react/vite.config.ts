import { createLibConfig } from "../../tooling/vite-lib";

export default createLibConfig({
  root: import.meta.dirname,
  external: ["react", "react-dom", "react/jsx-runtime"],
});
