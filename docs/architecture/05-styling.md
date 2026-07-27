# 05 — Styling contract

The library ships **no styling dependency**. No Tailwind, no shadcn, no
CSS-in-JS runtime. Styling is a contract of class names, `data-*` attributes, and
CSS custom properties.

## The contract

Every rendered element exposes:

- A stable **class name** (`calix-day`, `calix-grid`, `calix-header`, …), and
- **state via `data-*` attributes**, e.g.
  `data-selected`, `data-today`, `data-disabled`, `data-outside-month`,
  `data-range-start` / `data-range-end` / `data-in-range`, `data-focused`,
  `data-weekend`, and `dir="rtl|ltr"`.

Consumers style with any technology:

```css
/* vanilla CSS */
.calix-day[data-selected] { background: var(--calix-accent); }
```

```tsx
/* Tailwind via data-attribute variants */
<DatePicker classNames={{ day: "data-[selected]:bg-blue-600 data-[today]:font-bold" }} />
```

`@alydev/themes` is just a stylesheet that implements this contract against CSS
variables (`--calix-accent`, `--calix-surface`, `--calix-radius`, …). Import it
or don't; override any variable to theme.

## Why not ship components pre-styled

Pre-styled components force a CSS strategy on consumers and make theming a fight
against specificity. The data-attribute contract is the same approach used by
Radix and React Aria: it composes with every ecosystem and keeps the library's
own CSS optional and overridable.

## Class name customization

Every component accepts `className`/`classNames` (per-slot) and `style`. There is
no `styled`/`css` prop and no runtime style injection, so the library stays
side-effect free and SSR-safe.
