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
  --calix-radius: 10px;
}
```

Dark mode is automatic via `prefers-color-scheme` and can be forced with a
`[data-theme="dark"]` ancestor. A high-contrast variant activates under
`prefers-contrast: more`.
