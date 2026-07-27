# Roadmap

Calix is built in phases. Each phase is shippable and verified (build, typecheck,
lint, tests) before the next begins.

### Phase 1 — Monorepo architecture ✅ scaffolding
pnpm + Turborepo workspace, strict TypeScript project references, ESLint/Prettier,
Vitest/Playwright base config, Changesets, CI/CD, issue/PR templates, Dependabot,
Renovate, architecture docs, package skeletons.

### Phase 2 — Core engine & adapters
`@alydev/core` types, `CalendarAdapter` interface, month/year generation, validation
(min/max, disabled/enabled dates, weekdays, months, years, business days, holidays),
selection strategies, format/parse. Gregorian + Jalali adapters. Unit tests.

### Phase 3 — React headless
Split context, `useCalendar`, `useSelection`, `useDateInput`, `useDatePicker`;
controlled/uncontrolled; keyboard navigation; focus management; announcements.

### Phase 4 — Components & public API
Compound components (`Root/Input/Trigger/Content/Calendar/...`) + convenience
wrappers, Floating UI popover, Motion animations, portal/inline, slots & render props.

### Phase 5 — Calendar & UX features
DateTime + Time (digital/analog), month/year/quarter/week pickers, dual & multi-month,
infinite scrolling, today/clear, masked input, touch gestures, RTL + Persian digits.

### Phase 6 — Themes & icons
`@alydev/themes` default + minimal, dark/light, high-contrast; `@alydev/icons`.

### Phase 7 — Documentation website
Next.js + Fumadocs + Tailwind v4 + shadcn + MDX; live editable playground; full guides
and API reference; dark mode + search.

### Phase 8 — Storybook & examples
Storybook with interaction tests; Next.js, Vite, Remix, and TanStack Start examples.

### Phase 9 — Testing, accessibility & performance
Vitest coverage 95%+, Playwright e2e + axe + visual regression, bundle-size budgets,
benchmarks vs. react-day-picker / react-aria / MUI X / Mantine / Ant Design.

### Phase 10 — npm release preparation
`exports`/`sideEffects`/`typesVersions`, Changesets release workflow, npm provenance,
semantic versioning, final polish.

## Beyond 1.0 (ideas)
Additional calendars (Hijri, Hebrew, Buddhist, Japanese), presets/shortcuts panel,
timezone-aware values, `@alydev/vue` and `@alydev/solid` bindings, Tempo/Temporal support.
