# @alydev/react

## 2.1.3

### Patch Changes

- [`0aaf67e`](https://github.com/ualiyou/calix-datepicker/commit/0aaf67e09b91466f297df93264863478f8b61b6d) Thanks [@ualiyou](https://github.com/ualiyou)! - Close a date-time picker when its embedded time picker is confirmed, and make the default picker theme more compact.

## 2.1.2

### Patch Changes

- [`d5e4797`](https://github.com/ualiyou/calix-datepicker/commit/d5e4797a0c7ccc15b4eff504b1e9b0ffefc0123a) Thanks [@ualiyou](https://github.com/ualiyou)! - Preserve the React client directive in published ESM output and stabilize keyboard focus navigation.

## 2.1.1

### Patch Changes

- Refresh the Calix documentation landing page with the new minimal brand mark.

## 2.1.0

### Minor Changes

- Add accessible popover controls, richer calendar and time-picker behavior, and
  updated default theme support. Refresh the documentation and product landing page
  to reflect the released multi-calendar feature set.

### Patch Changes

- [`ab4bb49`](https://github.com/ualiyou/calix-datepicker/commit/ab4bb497398b9a1cbbb473830d9732518523f1f9) Thanks [@ualiyou](https://github.com/ualiyou)! - Remove the Floating UI runtime dependency while preserving the date picker popover behavior.

## 2.0.1

### Patch Changes

- [`7ad4554`](https://github.com/ualiyou/calix-datepicker/commit/7ad4554e32ce177888afc40dee48b06bc5634e7c) Thanks [@ualiyou](https://github.com/ualiyou)! - Reduce published package weight and load optional playground calendars only when selected.

- Updated dependencies []:
  - @alydev/core@2.0.1

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
