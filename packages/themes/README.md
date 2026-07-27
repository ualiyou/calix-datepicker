# @alydev/themes

Optional, framework-free stylesheets for [Calix](https://github.com/calix-ui/calix-datepicker).
Pure CSS driven by custom properties — **no JavaScript, no Tailwind, no shadcn**.

```bash
pnpm add @alydev/themes
```

```ts
import "@alydev/themes/default.css"; // full-featured default theme
// or
import "@alydev/themes/minimal.css"; // lean, structural styling only
```

Theme by overriding variables (see `tokens.css`):

```css
:root {
  --calix-accent: #6d28d9;
  --calix-surface: #17171d;
  --calix-text: #f4f4f5;
  --calix-radius: 10px;
  --calix-font: "Vazirmatn", system-ui, sans-serif;
}
```

Useful routine tokens: `--calix-accent`, `--calix-on-accent`,
`--calix-surface`, `--calix-surface-raised`, `--calix-text`, `--calix-muted`,
`--calix-border`, `--calix-hover`, `--calix-radius`, `--calix-radius-sm`,
`--calix-cell-size`, `--calix-gap`, `--calix-font`, and `--calix-transition`.
State and layout tokens: `--calix-focus-ring`, `--calix-disabled-opacity`,
`--calix-weekend`, `--calix-outside-month`, `--calix-selected-shadow`,
`--calix-calendar-padding`, and `--calix-popover-z-index`.

Built-in components are dark by default. Pass `theme="light"` to `Calendar`,
`DatePicker`, or `TimeField` to use the white theme. A high-contrast variant
activates under `prefers-contrast: more`.
