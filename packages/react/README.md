# @alydev/datepicker

An accessible, headless date picker for React 18 and 19. Calix supports Gregorian and
Jalali/Persian calendars, RTL, typed date input, time selection, ranges, multiple dates,
constraints, and optional CSS themes.

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
your design system.

## Documentation and packages

- [Getting started](https://ualiyou.github.io/calix-datepicker/docs/getting-started)
- [API reference](https://ualiyou.github.io/calix-datepicker/docs/api-reference)
- [Calendar adapters](https://ualiyou.github.io/calix-datepicker/docs/calendars)
- [Picker modes](https://ualiyou.github.io/calix-datepicker/docs/picker-modes)
- [Theming](https://ualiyou.github.io/calix-datepicker/docs/theming)
- [`@alydev/adapter-gregorian`](https://www.npmjs.com/package/@alydev/adapter-gregorian)
- [`@alydev/adapter-jalali`](https://www.npmjs.com/package/@alydev/adapter-jalali)
- [`@alydev/themes`](https://www.npmjs.com/package/@alydev/themes)

## License

[MIT](https://github.com/ualiyou/calix-datepicker/blob/main/LICENSE)
