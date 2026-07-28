import {
  directionForLocale,
  eraNames,
  formatTokens,
  generateMonthGrid,
  monthNamesFromDates,
  parseTokens,
  weekdayNames,
  type CalendarAdapter,
  type CalendarDate,
  type CalendarGrid,
  type GridOptions,
  type MonthView,
  type NameWidth,
  type Time,
  type Weekday,
} from "@alydev/core";

const CAL = "buddhist";
/** Thai Buddhist Era leads the Gregorian year by 543 years. */
const OFFSET = 543;

/** Buddhist-era CalendarDate → the equivalent Gregorian JS Date. */
function toJs(date: CalendarDate, time?: Time): Date {
  return new Date(
    date.year - OFFSET,
    date.month - 1,
    date.day,
    time?.hour ?? 0,
    time?.minute ?? 0,
    time?.second ?? 0,
    time?.millisecond ?? 0,
  );
}

function fromJs(d: Date): CalendarDate {
  return { year: d.getFullYear() + OFFSET, month: d.getMonth() + 1, day: d.getDate() };
}

function monthNames(locale: string, width: NameWidth): string[] {
  const dates = Array.from({ length: 12 }, (_, i) => new Date(2021, i, 15));
  return monthNamesFromDates(dates, locale, width, CAL);
}

/**
 * The Thai Buddhist calendar adapter. Shares Gregorian month/day structure but
 * numbers years in the Buddhist Era (BE = CE + 543). Stateless singleton; locale
 * is always a parameter.
 */
export const buddhist: CalendarAdapter = {
  id: "buddhist",
  defaultLocale: "th-TH",

  today: () => fromJs(new Date()),
  toDate: (date, time) => toJs(date, time),
  fromDate: (d) => fromJs(d),

  addDays: (date, amount) => fromJs(new Date(date.year - OFFSET, date.month - 1, date.day + amount)),
  addMonths: (date, amount) =>
    fromJs(new Date(date.year - OFFSET, date.month - 1 + amount, date.day)),
  addYears: (date, amount) => fromJs(new Date(date.year - OFFSET + amount, date.month - 1, date.day)),

  startOfMonth: (date) => ({ year: date.year, month: date.month, day: 1 }),
  endOfMonth: (date) => fromJs(new Date(date.year - OFFSET, date.month, 0)),
  daysInMonth: (year, month) => new Date(year - OFFSET, month, 0).getDate(),
  monthsInYear: () => 12,
  isLeapYear: (year) => {
    const g = year - OFFSET;
    return (g % 4 === 0 && g % 100 !== 0) || g % 400 === 0;
  },

  getWeekday: (date) => toJs(date).getDay() as Weekday,
  getMonthGrid: (view: MonthView, options: GridOptions): CalendarGrid =>
    generateMonthGrid(buddhist, view, options),
  getYearRange: (around, size) => {
    const half = Math.floor(size / 2);
    return Array.from({ length: size }, (_, i) => around - half + i);
  },
  getWeek: (date, { weekStartsOn }) => {
    const firstOfYear = new Date(date.year - OFFSET, 0, 1);
    const doy = Math.round((toJs(date).getTime() - firstOfYear.getTime()) / 86_400_000) + 1;
    const offset = (firstOfYear.getDay() - weekStartsOn + 7) % 7;
    return Math.floor((doy + offset - 1) / 7) + 1;
  },

  compare: (a, b) => a.year - b.year || a.month - b.month || a.day - b.day,
  isSameDay: (a, b) => a.year === b.year && a.month === b.month && a.day === b.day,
  isSameMonth: (a, b) => a.year === b.year && a.month === b.month,
  isSameYear: (a, b) => a.year === b.year,

  format: (date, pattern, locale = buddhist.defaultLocale, time) =>
    formatTokens(date, time, pattern, {
      monthNamesLong: monthNames(locale, "long"),
      monthNamesShort: monthNames(locale, "short"),
      weekdayNamesLong: weekdayNames(locale, "long", CAL),
      weekdayNamesShort: weekdayNames(locale, "short", CAL),
      weekday: toJs(date).getDay(),
      locale,
    }),
  parse: (input, pattern, locale = buddhist.defaultLocale) =>
    parseTokens(input, pattern, {
      monthNamesLong: monthNames(locale, "long"),
      monthNamesShort: monthNames(locale, "short"),
    }),

  getMonthNames: (locale = buddhist.defaultLocale, width = "long") => monthNames(locale, width),
  getWeekdayNames: (locale = buddhist.defaultLocale, width = "long") =>
    weekdayNames(locale, width, CAL),
  getEraNames: (locale = buddhist.defaultLocale) => eraNames(locale, CAL),
  isRTL: (locale = buddhist.defaultLocale) => directionForLocale(locale) === "rtl",
};

export default buddhist;
