<div align="center">

# Calix

**A headless, accessible, multi-calendar date picker for React.**

Gregorian and Jalali calendars · React 18/19 · RTL/LTR · TypeScript · SSR-safe · optional CSS theme.

[Documentation](https://ualiyou.github.io/calix-datepicker/) · [Packages](#packages) · [Contributing](./CONTRIBUTING.md) · [Roadmap](./ROADMAP.md)

[![CI](https://github.com/calix-ui/calix-datepicker/actions/workflows/ci.yml/badge.svg)](https://github.com/calix-ui/calix-datepicker/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@alydev/datepicker.svg)](https://www.npmjs.com/package/@alydev/datepicker)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

</div>

Calix separates calendar rules from the React UI. The core works with calendar-neutral
date parts; adapters supply Gregorian or Jalali behavior; the React package supplies
headless hooks and accessible components. This means changing calendar systems does not
require rewriting your picker UI.

## Features

- Single, range, and multiple-date selection.
- Gregorian and Jalali/Persian adapters, with support for custom adapters.
- Inline calendar, ready-to-use popover picker, and compound primitives.
- Date/time selection, typed input, validation, disabled dates, and business-day rules.
- Locale-aware month names, weekday order, digits, direction, and RTL keyboard behavior.
- Accessible grid semantics, roving focus, keyboard navigation, focus management, and reduced-motion/high-contrast support.
- Styling through semantic classes, `data-*` state attributes, and optional CSS variables—no Tailwind or UI-kit dependency.

## Requirements

- Node.js 20+
- React 18.3+ or 19

## Installation

Install the React binding and an adapter. The theme is optional.

```bash
pnpm add @alydev/datepicker @alydev/adapter-gregorian
pnpm add @alydev/themes # optional
```

For Jalali/Persian dates:

```bash
pnpm add @alydev/datepicker @alydev/adapter-jalali
```

## Quick start

```tsx
"use client";

import { useState } from "react";
import { DatePicker } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import "@alydev/themes/default.css";

export function Example() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <DatePicker
      adapter={gregorian}
      locale="en-US"
      value={value}
      onChange={setValue}
      placeholder="Choose a date"
      theme="light"
    />
  );
}
```

Use an uncontrolled picker when the selected date does not need to live in parent state:

```tsx
<DatePicker adapter={gregorian} defaultValue={new Date()} />
```

## Calendars and localization

The calendar adapter and the display locale are independent. Switching to Jalali is one prop change:

```tsx
import { jalali } from "@alydev/adapter-jalali";

<DatePicker adapter={jalali} locale="fa-IR" dir="rtl" placeholder="تاریخ را انتخاب کنید" />;
```

Calix derives direction, digit system, weekday names, and the first day of the week from the locale. Override the first weekday when needed:

```tsx
<DatePicker adapter={gregorian} locale="en-US" weekStartsOn={1} />
```

`weekStartsOn` uses `0` for Sunday through `6` for Saturday. You can also pass `labels` to replace built-in navigation, time, and action text.

## Selection modes

`mode` defaults to `"single"`. All modes accept controlled (`value`/`onChange`) or uncontrolled (`defaultValue`) state.

```tsx
import { useState } from "react";
import { Calendar, type DateRange } from "@alydev/datepicker";

function RangeExample() {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });
  return <Calendar adapter={gregorian} mode="range" value={value} onChange={setValue} />;
}

function MultipleExample() {
  return <Calendar adapter={gregorian} mode="multiple" max={3} />;
}
```

For a date-and-time picker, enable `withTime` on the popover component:

```tsx
<DatePicker
  adapter={gregorian}
  withTime
  timePickerProps={{ variant: "wheel" }}
  onOutputChange={(value) => console.log(value)}
/>
```

`onChange` always receives `Date` values. `onOutputChange` can emit a formatted string (default) or JSON with `outputFormat="json"`; set `outputPattern` to control the string format.

## Constraints

Apply constraints directly to `Calendar` or `DatePicker`:

```tsx
<DatePicker
  adapter={gregorian}
  minDate={new Date(2026, 0, 1)}
  maxDate={new Date(2026, 11, 31)}
  disabledWeekdays={[0, 6]}
  holidays={[new Date(2026, 0, 1)]}
  businessDaysOnly
  isDateDisabled={(date) => date.month === 8 && date.day === 15}
/>
```

Available constraints: `minDate`, `maxDate`, `disabledDates`, `enabledDates`, `disabledWeekdays`, `disabledMonths`, `disabledYears`, `businessDaysOnly`, `holidays`, and `isDateDisabled`.

## Iranian public holidays

```tsx
import { Calendar } from "@alydev/datepicker";
import { jalali } from "@alydev/adapter-jalali";
import { iranHolidays } from "@alydev/holidays-iran";

<Calendar
  adapter={jalali}
  locale="fa-IR"
  holidayData={iranHolidays}
  showHolidays
  holidaysSelectable={false}
/>;
```

`showHolidays` defaults to `false`; `holidaysSelectable` defaults to `true`.
Use the existing `holidays` prop when you only need dates disabled without holiday data.

## Fixed international holidays

```tsx
import { internationalHolidays } from "@alydev/holidays-international";

<Calendar
  adapter={gregorian}
  holidayData={internationalHolidays}
  showHolidays
/>;
```

The package contains New Year's Day and Christmas Day from 2000 through 2100.

## Components and hooks

| API                         | Use it when                                                     |
| --------------------------- | --------------------------------------------------------------- |
| `DatePicker`                | You want the standard trigger + accessible popover.             |
| `Calendar`                  | You want an always-visible inline calendar.                     |
| `CalendarView`              | You already own calendar state via `useCalendar`.               |
| `TimeField`                 | You need a standalone time control.                             |
| `MonthPicker`, `YearPicker` | You need a month/year selection view.                           |
| `useCalendar`               | You need headless calendar state, navigation, and prop getters. |
| `useDatePicker`             | You need popover behavior around calendar state.                |
| `useDateInput`              | You need a parsed, masked date text input.                      |
| `useTime`                   | You need headless time-field state.                             |

For complete DOM control, compose the date picker primitives:

```tsx
<DatePicker.Root adapter={gregorian}>
  <DatePicker.Input pattern="yyyy/MM/dd" />
  <DatePicker.Trigger>Open calendar</DatePicker.Trigger>
  <DatePicker.Content />
</DatePicker.Root>
```

## Styling

Calix does not require a styling solution. Import one of the optional theme files:

```tsx
import "@alydev/themes/default.css"; // full default appearance
// import "@alydev/themes/minimal.css"; // structural styling only
```

Override CSS variables to match your design system:

```css
:root {
  --calix-accent: #6d28d9;
  --calix-radius: 10px;
  --calix-cell-size: 2.5rem;
}
```

Every day button exposes state attributes such as `data-selected`, `data-today`, `data-disabled`, `data-outside-month`, `data-range-start`, `data-range-end`, `data-in-range`, `data-focused`, and `data-weekend`. Use `classNames` for per-slot classes or `renderDay` for custom day content.

```tsx
<Calendar
  adapter={gregorian}
  classNames={{ day: "my-day" }}
  renderDay={(date, label) => <span title={`${date.year}/${date.month}/${date.day}`}>{label}</span>}
/>
```

## Packages

| Package                                                      | Description                                                                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| [`@alydev/core`](./packages/core)                            | Framework-agnostic types, adapter contract, selection, validation, parsing, and formatting. Zero runtime dependencies. |
| [`@alydev/adapter-gregorian`](./packages/adapters/gregorian) | Gregorian adapter powered by `date-fns`.                                                                               |
| [`@alydev/adapter-jalali`](./packages/adapters/jalali)       | Jalali/Persian adapter powered by `date-fns-jalali`.                                                                   |
| `@alydev/holidays-iran`                                     | Maintained Iranian public-holiday data for Jalali years 1400–1420.                                                     |
| `@alydev/holidays-international`                            | New Year's Day and Christmas Day data for 2000–2100.                                                                   |
| [`@alydev/datepicker`](./packages/react)                     | React hooks and accessible components.                                                                                 |
| [`@alydev/themes`](./packages/themes)                        | Optional CSS-variable themes.                                                                                          |
| [`@alydev/icons`](./packages/icons)                          | Tree-shakeable SVG icons.                                                                                              |

## Custom calendars

A calendar adapter implements `CalendarAdapter` from `@alydev/core`: conversion to/from `Date`, date arithmetic, month grids, comparison, parsing/formatting, localized names, and RTL detection. Add an adapter in its own package, then pass it to the same React components.

See the [adapter architecture](./docs/architecture/02-calendar-adapter.md) and [calendar guide](https://ualiyou.github.io/calix-datepicker/docs/calendars) before implementing one.

## Documentation

- [Getting started](https://ualiyou.github.io/calix-datepicker/docs/getting-started)
- [Installation](https://ualiyou.github.io/calix-datepicker/docs/installation)
- [Picker modes](https://ualiyou.github.io/calix-datepicker/docs/picker-modes)
- [Holidays](https://ualiyou.github.io/calix-datepicker/docs/holidays)
- [Localization](https://ualiyou.github.io/calix-datepicker/docs/localization)
- [Theming and customization](https://ualiyou.github.io/calix-datepicker/docs/theming)
- [Accessibility](https://ualiyou.github.io/calix-datepicker/docs/accessibility)
- [API reference](https://ualiyou.github.io/calix-datepicker/docs/api-reference)
- [Architecture](./docs/architecture)

## Development

This repository is a pnpm + Turborepo monorepo.

```bash
pnpm install
pnpm dev          # documentation site and development packages
pnpm build        # build every workspace
pnpm test         # run unit tests
pnpm test:e2e     # run Playwright and accessibility tests
pnpm lint
pnpm typecheck
pnpm format:check
```

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the contribution workflow and [SECURITY.md](./SECURITY.md) for reporting vulnerabilities.

## License

[MIT](./LICENSE) © Calix contributors
