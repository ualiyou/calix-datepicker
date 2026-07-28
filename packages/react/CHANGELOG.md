# @alydev/react

## 2.0.0

### Minor Changes

- [`2715ed1`](https://github.com/ualiyou/calix-datepicker/commit/2715ed1514eada76c2848fc2dec3c6a2db0aa6ea) Thanks [@ualiyou](https://github.com/ualiyou)! - Add a `presets` prop to `DatePicker` and `CalendarView` for one-click shortcuts
  (e.g. Today, Last 7 days, This month). Choosing a preset applies its value and
  navigates the view to the value's month. Ships default `.calix-presets` /
  `.calix-preset` theme styles.

- [`2715ed1`](https://github.com/ualiyou/calix-datepicker/commit/2715ed1514eada76c2848fc2dec3c6a2db0aa6ea) Thanks [@ualiyou](https://github.com/ualiyou)! - Add regional weekend support, range length limits, and month/focus callbacks.

  - **`weekendDays`**: configure which weekdays are treated as the weekend for
    `data-weekend` and `businessDaysOnly`. Defaults are locale-aware — Persian
    locales default to `[5]` (Friday), everything else to `[0, 6]` (Sun/Sat).
  - **`minRange` / `maxRange`**: constrain a `range` selection to a minimum and/or
    maximum number of inclusive days; the tentative endpoint (and hover preview)
    is clamped along the drag direction.
  - **`onMonthChange(view)`** and **`onFocusChange(date)`** callbacks fire when the
    visible month or the roving focus changes.

### Patch Changes

- Updated dependencies [[`2715ed1`](https://github.com/ualiyou/calix-datepicker/commit/2715ed1514eada76c2848fc2dec3c6a2db0aa6ea)]:
  - @alydev/core@2.0.0

## 1.0.1

### Patch Changes

- [`e4fd323`](https://github.com/ualiyou/calix-datepicker/commit/e4fd3235dfc312adb441168f5c20f52aa3c62196) Thanks [@ualiyou](https://github.com/ualiyou)! - Add a complete npm package README and improve npm metadata.

- Updated dependencies []:
  - @alydev/core@1.0.1

## 1.0.0

### Major Changes

- [`d9b2127`](https://github.com/ualiyou/calix-datepicker/commit/d9b2127748bec16021e7cee53ecb0cf4c81faab3) Thanks [@ualiyou](https://github.com/ualiyou)! - Prepare the first stable Calix release with validated package entry points, bundle budgets, and release gates.

### Minor Changes

- [`d9b2127`](https://github.com/ualiyou/calix-datepicker/commit/d9b2127748bec16021e7cee53ecb0cf4c81faab3) Thanks [@ualiyou](https://github.com/ualiyou)! - Initial preview of Calix: a headless, multi-calendar React date picker.

  - `@alydev/core`: calendar-agnostic engine — `CalendarDate` types, the
    `CalendarAdapter` interface, month-grid generation, pluggable selection
    strategies (single/multiple/range/week/month/quarter/year), declarative
    validation, and a locale-aware token formatter/parser with Persian-digit
    support. Zero runtime dependencies.
  - `@alydev/adapter-gregorian` and `@alydev/adapter-jalali`: interchangeable
    calendar adapters.
  - `@alydev/react`: headless hooks (`useCalendar`, `useDatePicker`, `useDateInput`,
    `useTime`) and compound components (`Calendar`, `DatePicker`, `TimeField`,
    `MonthPicker`, `YearPicker`) with full keyboard navigation, focus management,
    and an accessible `data-*` styling contract.
  - `@alydev/themes`: optional CSS-variable themes (default + minimal) with dark
    mode, high-contrast, and reduced-motion support. No Tailwind/shadcn dependency.
  - `@alydev/icons`: tree-shakeable SVG icon set.

### Patch Changes

- Updated dependencies [[`d9b2127`](https://github.com/ualiyou/calix-datepicker/commit/d9b2127748bec16021e7cee53ecb0cf4c81faab3), [`d9b2127`](https://github.com/ualiyou/calix-datepicker/commit/d9b2127748bec16021e7cee53ecb0cf4c81faab3)]:
  - @alydev/core@1.0.0
