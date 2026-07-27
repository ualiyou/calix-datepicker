# 02 — The Calendar Adapter

The `CalendarAdapter` is the central abstraction. It is the only thing that knows
how a specific calendar system works. Everything above it — selection, validation,
hooks, components — is calendar-agnostic.

## The calendar-agnostic date

Calix never stores a JS `Date` as its source of truth. It stores a
**`CalendarDate`**:

```ts
interface CalendarDate {
  readonly year: number;  // era-relative year in the target calendar
  readonly month: number; // 1-based month (1 = first month of the year)
  readonly day: number;   // 1-based day of month
}
```

Optionally paired with a `Time` (`{ hour, minute, second, millisecond }`) for
date-time modes. This avoids the two classic date-picker bugs:

1. **Timezone drift** — `new Date("2026-01-01")` is midnight UTC, which is the
   previous day in negative offsets. A plain `{year, month, day}` has no zone.
2. **Calendar coupling** — a Jalali date `1404/05/06` is not naturally a JS
   `Date`; forcing it through `Date` loses information. `CalendarDate` is the
   lingua franca; the adapter converts at the edges.

Conversion to a JS `Date` happens only when a value crosses the public boundary
(the `value`/`onChange` props default to JS `Date` for ergonomics, but a
`valueType="calendar-date"` escape hatch keeps everything zone-free).

## The interface (shape)

```ts
interface CalendarAdapter {
  readonly id: string;                 // "gregorian" | "jalali" | ...
  readonly defaultLocale: string;

  today(): CalendarDate;
  toDate(date: CalendarDate, time?: Time): Date;
  fromDate(date: Date): CalendarDate;

  addDays(date: CalendarDate, amount: number): CalendarDate;
  addMonths(date: CalendarDate, amount: number): CalendarDate;
  addYears(date: CalendarDate, amount: number): CalendarDate;

  startOfMonth(date: CalendarDate): CalendarDate;
  endOfMonth(date: CalendarDate): CalendarDate;
  daysInMonth(year: number, month: number): number;
  isLeapYear(year: number): boolean;

  getMonthGrid(view: MonthView, options: GridOptions): CalendarGrid;
  getYearRange(around: number, size: number): number[];
  getWeek(date: CalendarDate, options: { weekStartsOn: Weekday }): number;

  compare(a: CalendarDate, b: CalendarDate): number;
  isSameDay(a: CalendarDate, b: CalendarDate): boolean;
  isSameMonth(a: CalendarDate, b: CalendarDate): boolean;

  format(date: CalendarDate, pattern: string, locale: string): string;
  parse(input: string, pattern: string, locale: string): CalendarDate | null;

  getMonthNames(locale: string, width?: NameWidth): string[];
  getWeekdayNames(locale: string, width?: NameWidth): string[];
  getEraNames(locale: string): string[];
  isRTL(locale: string): boolean;
}
```

`getMonthGrid` returns a fully-formed grid (weeks × day cells) with metadata
(`isOutsideMonth`, `isToday`, `weekNumber`) so the UI just maps over cells.

## Design decisions

- **Adapters are stateless singletons.** They carry no per-instance config, so
  they are trivially shared and referentially stable — important for React
  render performance.
- **Locale is a parameter, not adapter state.** The same Gregorian adapter serves
  `en-US`, `en-GB`, `fr-FR`, etc. Locale and calendar are orthogonal axes.
- **date-fns under the hood, hidden from consumers.** The Gregorian adapter uses
  `date-fns`; the Jalali adapter uses `date-fns-jalali`. Neither leaks its
  library choice through the interface, so we can swap engines (e.g. Temporal)
  later without a breaking change.

## Trade-offs

The interface is broad. That is deliberate: a narrow interface would push
calendar knowledge up into the UI (the exact thing we forbid). The breadth is
paid once per calendar system and amortized across every feature.
