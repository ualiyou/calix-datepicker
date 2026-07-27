---
"@calix/core": minor
"@calix/react": minor
"@calix/adapter-gregorian": minor
"@calix/adapter-jalali": minor
"@calix/themes": minor
"@calix/icons": minor
---

Initial preview of Calix: a headless, multi-calendar React date picker.

- `@calix/core`: calendar-agnostic engine — `CalendarDate` types, the
  `CalendarAdapter` interface, month-grid generation, pluggable selection
  strategies (single/multiple/range/week/month/quarter/year), declarative
  validation, and a locale-aware token formatter/parser with Persian-digit
  support. Zero runtime dependencies.
- `@calix/adapter-gregorian` and `@calix/adapter-jalali`: interchangeable
  calendar adapters.
- `@calix/react`: headless hooks (`useCalendar`, `useDatePicker`, `useDateInput`,
  `useTime`) and compound components (`Calendar`, `DatePicker`, `TimeField`,
  `MonthPicker`, `YearPicker`) with full keyboard navigation, focus management,
  and an accessible `data-*` styling contract.
- `@calix/themes`: optional CSS-variable themes (default + minimal) with dark
  mode, high-contrast, and reduced-motion support. No Tailwind/shadcn dependency.
- `@calix/icons`: tree-shakeable SVG icon set.
