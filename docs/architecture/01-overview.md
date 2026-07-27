# 01 — Overview & layering

Calix is layered so that each concern is testable in isolation and replaceable
without cascading changes.

```
┌──────────────────────────────────────────────────────────────┐
│  Consumer app (Tailwind / CSS Modules / Emotion / vanilla CSS) │
├──────────────────────────────────────────────────────────────┤
│  @alydev/themes (optional CSS)      @alydev/icons (optional SVG)  │
├──────────────────────────────────────────────────────────────┤
│  @alydev/datepicker                                             │
│    components (compound + convenience)                         │
│    hooks (useDatePicker / useCalendar / useSelection / input)  │
│    context (split: config · state · dispatch)                  │
├──────────────────────────────────────────────────────────────┤
│  @alydev/core  (framework-agnostic, zero runtime deps)          │
│    types · CalendarAdapter interface · selection strategies    │
│    validation · formatting orchestration · date algebra        │
├──────────────────────────────────────────────────────────────┤
│  @alydev/adapter-gregorian   @alydev/adapter-jalali   (…future)  │
│    concrete CalendarAdapter implementations                    │
└──────────────────────────────────────────────────────────────┘
```

## Why a separate core

- **Testability.** The hardest logic (calendar math, selection, validation)
  is pure and unit-tested without a DOM.
- **Reuse.** A future `@alydev/vue` or `@alydev/solid` reuses `@alydev/core`
  untouched.
- **Bundle hygiene.** Core has zero runtime dependencies; adapters pull in
  `date-fns`/`date-fns-jalali` only when used.

## Why adapters are separate packages

Tree-shaking at the package boundary is reliable and obvious. An app that only
needs Gregorian never downloads the Jalali adapter or its `date-fns-jalali`
dependency. Adding a calendar (Hijri, Hebrew, …) is a new package — no change to
core or UI.

## Build & module format

Every publishable package builds with Vite library mode (`tooling/vite-lib.ts`)
to **ESM + CJS** with `preserveModules`, emits `.d.ts` via `vite-plugin-dts`,
declares `"sideEffects": false`, and externalizes all dependencies. This yields
predictable tree-shaking and dual-format compatibility.

## Trade-offs

- **More packages = more release coordination.** Mitigated with Changesets
  `fixed` versioning across `@alydev/*` so the surface versions move together.
- **Indirection via the adapter interface** costs a little ceremony, but it is
  the single most important boundary in the project — it is what makes "multiple
  calendars, one UI" true rather than aspirational.
