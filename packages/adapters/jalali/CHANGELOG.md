# @calix/adapter-jalali

## 1.0.0

### Major Changes

- [`d9b2127`](https://github.com/ualiyou/calix-datepicker/commit/d9b2127748bec16021e7cee53ecb0cf4c81faab3) Thanks [@ualiyou](https://github.com/ualiyou)! - Prepare the first stable Calix release with validated package entry points, bundle budgets, and release gates.

### Minor Changes

- [`d9b2127`](https://github.com/ualiyou/calix-datepicker/commit/d9b2127748bec16021e7cee53ecb0cf4c81faab3) Thanks [@ualiyou](https://github.com/ualiyou)! - Initial preview of Calix: a headless, multi-calendar React date picker.

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

### Patch Changes

- Updated dependencies [[`d9b2127`](https://github.com/ualiyou/calix-datepicker/commit/d9b2127748bec16021e7cee53ecb0cf4c81faab3), [`d9b2127`](https://github.com/ualiyou/calix-datepicker/commit/d9b2127748bec16021e7cee53ecb0cf4c81faab3)]:
  - @calix/core@1.0.0
