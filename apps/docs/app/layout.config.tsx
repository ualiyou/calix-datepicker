import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/** Shared layout options: nav, links, GitHub. */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: "Calix",
  },
  links: [
    { text: "Docs", url: "/docs", active: "nested-url" },
    { text: "Playground", url: "/docs/playground" },
  ],
  githubUrl: "https://github.com/calix-ui/calix-datepicker",
};
