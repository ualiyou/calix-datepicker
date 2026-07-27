<div align="center">

# Calix

**A production-grade, headless, multi-calendar DatePicker for React 19.**

Gregorian & Jalali out of the box · RTL/LTR · fully typed · tree-shakeable · SSR/RSC-safe · zero styling dependencies.

[![CI](https://github.com/calix-ui/calix-datepicker/actions/workflows/ci.yml/badge.svg)](https://github.com/calix-ui/calix-datepicker/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@alydev/datepicker.svg)](https://www.npmjs.com/package/@alydev/datepicker)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

</div>

---

Calix is a from-scratch, modern reimagining of a date picker: a **framework-agnostic
calendar engine** wrapped in a **thin, headless React binding**. The UI never knows
which calendar system is active — everything flows through a `CalendarAdapter`, so
adding a new calendar is a new package, not a UI rewrite.

Documentation: https://ualiyou.github.io/calix-datepicker/

> **Status:** early development. The public API is stabilizing across the phased
> roadmap in [`ROADMAP.md`](./ROADMAP.md).

## Why Calix

- **Headless-first.** Ship your own markup. Calix gives you state, behavior, and
  accessibility; you own the DOM. A default theme is available when you want one.
- **Multi-calendar.** Gregorian and Jalali (Persian) today, both interchangeable
  via a single `calendar` prop. The architecture supports adding more without
  touching UI code.
- **No styling lock-in.** The core has **no** Tailwind or shadcn dependency. Styling
  is driven by semantic class names + `data-*` state attributes and CSS variables,
  so it works with Tailwind, CSS Modules, Emotion, styled-components, or plain CSS.
- **Modern React.** React 19, React-Compiler-friendly, SSR and React Server
  Component safe, minimal re-renders, tree-shakeable, side-effect free.
- **Accessible.** WCAG AA target, full keyboard model, focus management, screen
  reader announcements, reduced-motion and high-contrast support.

## Packages

| Package | Description |
| --- | --- |
| [`@alydev/core`](./packages/core) | Framework-agnostic engine: types, `CalendarAdapter`, selection strategies, validation, format/parse. Zero runtime deps. |
| [`@alydev/adapter-gregorian`](./packages/adapters/gregorian) | Gregorian calendar adapter (date-fns). |
| [`@alydev/adapter-jalali`](./packages/adapters/jalali) | Jalali / Persian calendar adapter (date-fns-jalali). |
| [`@alydev/datepicker`](./packages/react) | Headless hooks + compound components. |
| [`@alydev/themes`](./packages/themes) | Optional CSS-variable stylesheets (default, minimal). |
| [`@alydev/icons`](./packages/icons) | Tree-shakeable SVG icon set. |

## Quick start

```bash
pnpm add @alydev/datepicker @alydev/adapter-gregorian
# optional default styling
pnpm add @alydev/themes
```

```tsx
import { DatePicker } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import "@alydev/themes/default.css";

export function Example() {
  const [value, setValue] = React.useState<Date | null>(null);
  return <DatePicker adapter={gregorian} value={value} onChange={setValue} locale="en-US" />;
}
```

Switch calendars with a single prop:

```tsx
import { jalali } from "@alydev/adapter-jalali";

<DatePicker adapter={jalali} locale="fa-IR" dir="rtl" />;
```

Or go fully headless with hooks — see [`@alydev/datepicker`](./packages/react) and the docs.

## Development

This is a [pnpm](https://pnpm.io) + [Turborepo](https://turbo.build) monorepo.

```bash
pnpm install
pnpm build        # build all packages
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # end-to-end + a11y (Playwright)
pnpm lint
pnpm typecheck
pnpm dev          # run docs / storybook / playground
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`docs/architecture`](./docs/architecture)
for the design rationale.

## License

[MIT](./LICENSE) © Calix contributors
