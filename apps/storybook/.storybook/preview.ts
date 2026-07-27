import type { Preview } from "@storybook/react";
import "@alydev/themes/default.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { date: /Date$/ } },
    a11y: { test: "error" },
    layout: "centered",
  },
};

export default preview;
