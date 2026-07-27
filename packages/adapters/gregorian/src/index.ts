import {
  addDays,
  addMonths,
  addYears,
  endOfMonth as fnsEndOfMonth,
  getDaysInMonth,
  getWeek as fnsGetWeek,
  startOfMonth as fnsStartOfMonth,
} from "date-fns";
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

const CAL = "gregory";

function toJsDate(date: CalendarDate, time?: Time): Date {
  return new Date(
    date.year,
    date.month - 1,
    date.day,
    time?.hour ?? 0,
    time?.minute ?? 0,
    time?.second ?? 0,
    time?.millisecond ?? 0,
  );
}

function fromJsDate(d: Date): CalendarDate {
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

function monthNames(locale: string, width: NameWidth): string[] {
  // Mid-month reference dates for each Gregorian month.
  const dates = Array.from({ length: 12 }, (_, i) => new Date(2021, i, 15));
  return monthNamesFromDates(dates, locale, width, CAL);
}

/**
 * The Gregorian calendar adapter, backed by `date-fns`. Stateless singleton;
 * locale is always a parameter.
 */
export const gregorian: CalendarAdapter = {
  id: "gregorian",
  defaultLocale: "en-US",

  today: () => fromJsDate(new Date()),
  toDate: (date, time) => toJsDate(date, time),
  fromDate: (d) => fromJsDate(d),

  addDays: (date, amount) => fromJsDate(addDays(toJsDate(date), amount)),
  addMonths: (date, amount) => fromJsDate(addMonths(toJsDate(date), amount)),
  addYears: (date, amount) => fromJsDate(addYears(toJsDate(date), amount)),

  startOfMonth: (date) => fromJsDate(fnsStartOfMonth(toJsDate(date))),
  endOfMonth: (date) => fromJsDate(fnsEndOfMonth(toJsDate(date))),
  daysInMonth: (year, month) => getDaysInMonth(new Date(year, month - 1, 1)),
  monthsInYear: () => 12,
  isLeapYear: (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0,

  getWeekday: (date) => toJsDate(date).getDay() as Weekday,
  getMonthGrid: (view: MonthView, options: GridOptions): CalendarGrid =>
    generateMonthGrid(gregorian, view, options),
  getYearRange: (around, size) => {
    const half = Math.floor(size / 2);
    return Array.from({ length: size }, (_, i) => around - half + i);
  },
  getWeek: (date, { weekStartsOn }) =>
    fnsGetWeek(toJsDate(date), { weekStartsOn }),

  compare: (a, b) => a.year - b.year || a.month - b.month || a.day - b.day,
  isSameDay: (a, b) => a.year === b.year && a.month === b.month && a.day === b.day,
  isSameMonth: (a, b) => a.year === b.year && a.month === b.month,
  isSameYear: (a, b) => a.year === b.year,

  format: (date, pattern, locale = gregorian.defaultLocale, time) =>
    formatTokens(date, time, pattern, {
      monthNamesLong: monthNames(locale, "long"),
      monthNamesShort: monthNames(locale, "short"),
      weekdayNamesLong: weekdayNames(locale, "long", CAL),
      weekdayNamesShort: weekdayNames(locale, "short", CAL),
      weekday: toJsDate(date).getDay(),
      locale,
    }),
  parse: (input, pattern, locale = gregorian.defaultLocale) =>
    parseTokens(input, pattern, {
      monthNamesLong: monthNames(locale, "long"),
      monthNamesShort: monthNames(locale, "short"),
    }),

  getMonthNames: (locale = gregorian.defaultLocale, width = "long") => monthNames(locale, width),
  getWeekdayNames: (locale = gregorian.defaultLocale, width = "long") =>
    weekdayNames(locale, width, CAL),
  getEraNames: (locale = gregorian.defaultLocale) => eraNames(locale, CAL),
  isRTL: (locale = gregorian.defaultLocale) => directionForLocale(locale) === "rtl",
};

export default gregorian;
