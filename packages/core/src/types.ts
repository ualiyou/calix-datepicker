/**
 * Core type contracts for Calix. Everything here is framework-agnostic and free
 * of any concrete calendar knowledge.
 */

/**
 * A calendar-agnostic date. Stored instead of a JS `Date` to avoid timezone/DST
 * drift and to remain valid across calendar systems.
 *
 * - `year` is the era-relative year in the active calendar.
 * - `month` is 1-based (1 = the first month of the year).
 * - `day` is the 1-based day of the month.
 */
export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** A named holiday represented by its calendar-independent JS date. */
export interface Holiday {
  readonly date: Date;
  readonly name: string;
}

/** A wall-clock time, independent of any date or timezone. */
export interface Time {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
}

/** A `CalendarDate` optionally carrying a time component. */
export interface CalendarDateTime extends CalendarDate {
  readonly time: Time;
}

/** Days of the week, 0 = Sunday … 6 = Saturday (ISO-independent index). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Requested width for localized names. */
export type NameWidth = "narrow" | "short" | "long";

/** Text/layout direction. */
export type Direction = "ltr" | "rtl";

/** The supported picker/selection modes. */
export type SelectionMode =
  | "single"
  | "multiple"
  | "range"
  | "week"
  | "month"
  | "year"
  | "quarter";

/** A contiguous date range. `end` is `null` while a range is mid-selection. */
export interface DateRange {
  readonly start: CalendarDate;
  readonly end: CalendarDate | null;
}

/**
 * The public value shape for each selection mode. Discriminated indirectly by
 * the mode passed to the picker; helpers narrow accordingly.
 */
export type SelectionValue =
  | CalendarDate // single, week, month, year, quarter (anchor day)
  | CalendarDate[] // multiple
  | DateRange // range
  | null;

/** Identifies which month a grid represents. */
export interface MonthView {
  readonly year: number;
  readonly month: number;
}

/** Options controlling month-grid generation. */
export interface GridOptions {
  /** First column of the week. */
  readonly weekStartsOn: Weekday;
  /**
   * When true, leading/trailing days from adjacent months fill the grid so it is
   * always a whole number of 7-day rows. Default: true.
   */
  readonly fixedWeeks?: boolean;
  /** Reference "today" for the `isToday` flag. Defaults to the adapter's today. */
  readonly today?: CalendarDate;
}

/** A single day cell within a generated grid. */
export interface DayCell {
  readonly date: CalendarDate;
  /** True when the day belongs to a month other than the grid's month. */
  readonly isOutsideMonth: boolean;
  /** True when the day equals the reference "today". */
  readonly isToday: boolean;
  /** Weekday index of this cell. */
  readonly weekday: Weekday;
}

/** A week row: its ISO-independent week number plus seven day cells. */
export interface WeekRow {
  readonly weekNumber: number;
  readonly days: readonly DayCell[];
}

/** A fully-formed month grid ready for rendering. */
export interface CalendarGrid {
  readonly view: MonthView;
  readonly weeks: readonly WeekRow[];
  /** Flat list of day cells in reading order (convenience for keyboard nav). */
  readonly days: readonly DayCell[];
}

/**
 * The central abstraction. A `CalendarAdapter` is the only thing that knows how a
 * specific calendar system behaves. Adapters are stateless singletons; locale is
 * always passed as a parameter, never stored.
 */
export interface CalendarAdapter {
  /** Stable identifier, e.g. `"gregorian"` or `"jalali"`. */
  readonly id: string;
  /** Locale used when none is supplied, e.g. `"en-US"` or `"fa-IR"`. */
  readonly defaultLocale: string;

  /** Today in this calendar, in the local timezone. */
  today(): CalendarDate;
  /** Convert to a JS `Date` (local time), optionally applying a time component. */
  toDate(date: CalendarDate, time?: Time): Date;
  /** Convert a JS `Date` (local time) to a `CalendarDate`. */
  fromDate(date: Date): CalendarDate;

  addDays(date: CalendarDate, amount: number): CalendarDate;
  addMonths(date: CalendarDate, amount: number): CalendarDate;
  addYears(date: CalendarDate, amount: number): CalendarDate;

  startOfMonth(date: CalendarDate): CalendarDate;
  endOfMonth(date: CalendarDate): CalendarDate;
  daysInMonth(year: number, month: number): number;
  /** Number of months in the given year (usually 12). */
  monthsInYear(year: number): number;
  isLeapYear(year: number): boolean;

  /** Weekday (0=Sun..6=Sat) of the given date. */
  getWeekday(date: CalendarDate): Weekday;
  /** Build a renderable month grid. */
  getMonthGrid(view: MonthView, options: GridOptions): CalendarGrid;
  /** A window of `size` years centered on/around `around`. */
  getYearRange(around: number, size: number): number[];
  /** Locale-aware week-of-year number. */
  getWeek(date: CalendarDate, options: { weekStartsOn: Weekday }): number;

  /** Negative if a<b, 0 if equal, positive if a>b (day precision). */
  compare(a: CalendarDate, b: CalendarDate): number;
  isSameDay(a: CalendarDate, b: CalendarDate): boolean;
  isSameMonth(a: CalendarDate, b: CalendarDate): boolean;
  isSameYear(a: CalendarDate, b: CalendarDate): boolean;

  format(date: CalendarDate, pattern: string, locale?: string, time?: Time): string;
  parse(input: string, pattern: string, locale?: string): CalendarDate | null;

  getMonthNames(locale?: string, width?: NameWidth): string[];
  getWeekdayNames(locale?: string, width?: NameWidth): string[];
  getEraNames(locale?: string): string[];
  isRTL(locale?: string): boolean;
}

/** Context passed to a selection strategy for computing/querying state. */
export interface SelectionContext {
  readonly adapter: CalendarAdapter;
  readonly weekStartsOn: Weekday;
  /** A tentative date under the pointer/focus, for range hover previews. */
  readonly preview?: CalendarDate | null;
  /** Maximum number of selectable items (multiple mode). */
  readonly max?: number;
}

/**
 * A pluggable selection algorithm. `select` is pure: it computes the next value
 * from the current value and a chosen date without side effects.
 */
export interface SelectionStrategy<TValue = SelectionValue> {
  readonly mode: SelectionMode;
  /** Compute the next value when `date` is chosen. */
  select(current: TValue, date: CalendarDate, ctx: SelectionContext): TValue;
  /** The empty/cleared value for this mode. */
  empty(): TValue;
  isSelected(value: TValue, date: CalendarDate, ctx: SelectionContext): boolean;
  isRangeStart?(value: TValue, date: CalendarDate, ctx: SelectionContext): boolean;
  isRangeEnd?(value: TValue, date: CalendarDate, ctx: SelectionContext): boolean;
  isInRange?(value: TValue, date: CalendarDate, ctx: SelectionContext): boolean;
}

/** Declarative constraints that determine which dates are selectable. */
export interface DateConstraints {
  readonly min?: CalendarDate;
  readonly max?: CalendarDate;
  /** Specific dates that are disabled. */
  readonly disabledDates?: readonly CalendarDate[];
  /** If provided, ONLY these dates are enabled (everything else disabled). */
  readonly enabledDates?: readonly CalendarDate[];
  /** Weekdays (0=Sun..6=Sat) that are disabled. */
  readonly disabledWeekdays?: readonly Weekday[];
  /** 1-based months that are disabled. */
  readonly disabledMonths?: readonly number[];
  /** Years that are disabled. */
  readonly disabledYears?: readonly number[];
  /** When true, only Mon–Fri are selectable. */
  readonly businessDaysOnly?: boolean;
  /** Holiday dates treated as disabled. */
  readonly holidays?: readonly CalendarDate[];
  /** Arbitrary predicate; returning true disables the date. */
  readonly isDateDisabled?: (date: CalendarDate, adapter: CalendarAdapter) => boolean;
}

/** A resolved predicate: `true` means the date cannot be selected. */
export type DateDisabledPredicate = (date: CalendarDate) => boolean;
