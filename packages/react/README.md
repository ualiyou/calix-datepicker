# @alydev/datepicker

An accessible, headless date picker for React 18 and 19. Calix supports Gregorian,
Jalali/Persian, Hijri (Umm al-Qura), and Thai Buddhist calendars, RTL, typed date input,
time selection, ranges, multiple dates, constraints, and optional CSS themes.

[Documentation](https://ualiyou.github.io/calix-datepicker/) · [Interactive playground](https://ualiyou.github.io/calix-datepicker/docs/playground) · [GitHub](https://github.com/ualiyou/calix-datepicker)

## Install

Install the React package with an adapter. Themes are optional.

```bash
pnpm add @alydev/datepicker @alydev/adapter-gregorian
pnpm add @alydev/themes # optional
```

For Jalali/Persian calendars:

```bash
pnpm add @alydev/datepicker @alydev/adapter-jalali
```

Hijri and Thai Buddhist adapters are available as `@alydev/adapter-hijri` and
`@alydev/adapter-buddhist`.

## Quick start

```tsx
"use client";

import { useState } from "react";
import { DatePicker } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import "@alydev/themes/default.css";

export function BookingDate() {
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

## Jalali and RTL

The adapter controls calendar rules; `locale` controls language, digits, weekday order,
and direction.

```tsx
import { DatePicker } from "@alydev/datepicker";
import { jalali } from "@alydev/adapter-jalali";

<DatePicker adapter={jalali} locale="fa-IR" dir="rtl" placeholder="تاریخ را انتخاب کنید" />;
```

## What is included

- `DatePicker`: ready-to-use input and accessible popover.
- `Calendar`: always-visible inline calendar.
- `CalendarView`, `TimeField`, `MonthPicker`, and `YearPicker` components.
- Headless `useCalendar`, `useDatePicker`, `useDateInput`, and `useTime` hooks.
- Single, multiple, and range selection; date/time picking; typed input and formatting.
- Date constraints, business-day-only rules, custom disabled dates, and holiday data.
- Range-length limits, regional weekends, month/focus callbacks, and one-click presets.
- Keyboard navigation, roving focus, ARIA grid semantics, RTL, and reduced-motion support.

## Common patterns

### Range and multiple selection

```tsx
import { Calendar, type RangeValue } from "@alydev/datepicker";

const [range, setRange] = useState<RangeValue>({ start: null, end: null });

<Calendar adapter={gregorian} mode="range" value={range} onChange={setRange} />;
<Calendar adapter={gregorian} mode="multiple" max={3} />;
```

### Date and time

```tsx
<DatePicker
  adapter={gregorian}
  withTime
  timePickerProps={{ variant: "wheel" }}
  outputPattern="yyyy-MM-dd HH:mm"
  onOutputChange={(value) => console.log(value)}
/>
```

`onChange` receives `Date` values. Use `onOutputChange` for a formatted string, or set
`outputFormat="json"` for serialized output.

### Constraints and holidays

```tsx
import { iranHolidays } from "@alydev/holidays-iran";

<Calendar
  adapter={jalali}
  locale="fa-IR"
  minDate={new Date(2026, 0, 1)}
  disabledWeekdays={[5]}
  holidayData={iranHolidays}
  showHolidays
  holidaysSelectable={false}
/>;
```

## Styling

Calix has no Tailwind or UI-kit dependency. Import an optional theme:

```tsx
import "@alydev/themes/default.css";
// import "@alydev/themes/minimal.css";
```

Use CSS variables, `classNames`, `renderDay`, and state attributes such as
`data-selected`, `data-today`, `data-disabled`, and `data-in-range` to integrate it with
your design system. `CalendarClassNames` covers the calendar shell, header,
navigation, grids, day cells, presets, footer, and month/year picker;
`DatePickerClassNames` additionally covers the popover, field, input, toggle,
clear control, and date-time step.

```tsx
<Calendar
  adapter={gregorian}
  classNames={{ heading: "calendar-title", navButton: "calendar-nav", day: "calendar-day" }}
  header={(calendar) => <button onClick={calendar.goToToday}>This month</button>}
  footer={(calendar) => <button onClick={calendar.clear}>Reset</button>}
/>
```

`header` and `footer` can also be plain React nodes. Use their callback form to
keep custom controls connected to the built-in calendar state. For complete DOM
control, compose `DatePicker.Root`, `.Input`, `.Trigger`, and `.Content`, or use
`useCalendar` directly.

## Documentation and packages

- [Getting started](https://ualiyou.github.io/calix-datepicker/docs/getting-started)
- [API reference](https://ualiyou.github.io/calix-datepicker/docs/api-reference)
- [Calendar adapters](https://ualiyou.github.io/calix-datepicker/docs/calendars)
- [Picker modes](https://ualiyou.github.io/calix-datepicker/docs/picker-modes)
- [Theming](https://ualiyou.github.io/calix-datepicker/docs/theming)
- [`@alydev/adapter-gregorian`](https://www.npmjs.com/package/@alydev/adapter-gregorian)
- [`@alydev/adapter-jalali`](https://www.npmjs.com/package/@alydev/adapter-jalali)
- [`@alydev/adapter-hijri`](https://www.npmjs.com/package/@alydev/adapter-hijri)
- [`@alydev/adapter-buddhist`](https://www.npmjs.com/package/@alydev/adapter-buddhist)
- [`@alydev/themes`](https://www.npmjs.com/package/@alydev/themes)

## License

[MIT](https://github.com/ualiyou/calix-datepicker/blob/main/LICENSE)
