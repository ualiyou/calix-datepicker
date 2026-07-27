import {
  addDays,
  addMonths,
  addYears,
  endOfMonth as fnsEndOfMonth,
  getDate,
  getDay,
  getDaysInMonth,
  getMonth,
  getWeek as fnsGetWeek,
  getYear,
  newDate,
  startOfMonth as fnsStartOfMonth,
} from "date-fns-jalali";
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
} from "@calix/core";

const CAL = "persian";

function toJsDate(date: CalendarDate, time?: Time): Date {
  const base = newDate(date.year, date.month - 1, date.day);
  if (time) {
    base.setHours(time.hour, time.minute, time.second, time.millisecond);
  }
  return base;
}

function fromJsDate(d: Date): CalendarDate {
  return { year: getYear(d), month: getMonth(d) + 1, day: getDate(d) };
}

function daysInJalaliMonth(year: number, month: number): number {
  return getDaysInMonth(newDate(year, month - 1, 1));
}

function monthNames(locale: string, width: NameWidth): string[] {
  // 15th of each Jalali month, converted to JS dates, then formatted via Intl.
  const dates = Array.from({ length: 12 }, (_, i) => newDate(1400, i, 15));
  return monthNamesFromDates(dates, locale, width, CAL);
}

/**
 * The Jalali (Persian/Shamsi) calendar adapter, backed by `date-fns-jalali`.
 * Stateless singleton; locale is always a parameter.
 */
export const jalali: CalendarAdapter = {
  id: "jalali",
  defaultLocale: "fa-IR",

  today: () => fromJsDate(new Date()),
  toDate: (date, time) => toJsDate(date, time),
  fromDate: (d) => fromJsDate(d),

  addDays: (date, amount) => fromJsDate(addDays(toJsDate(date), amount)),
  addMonths: (date, amount) => fromJsDate(addMonths(toJsDate(date), amount)),
  addYears: (date, amount) => fromJsDate(addYears(toJsDate(date), amount)),

  startOfMonth: (date) => fromJsDate(fnsStartOfMonth(toJsDate(date))),
  endOfMonth: (date) => fromJsDate(fnsEndOfMonth(toJsDate(date))),
  daysInMonth: (year, month) => daysInJalaliMonth(year, month),
  monthsInYear: () => 12,
  // Esfand (month 12) has 30 days in a leap year, 29 otherwise.
  isLeapYear: (year) => daysInJalaliMonth(year, 12) === 30,

  getWeekday: (date) => getDay(toJsDate(date)) as Weekday,
  getMonthGrid: (view: MonthView, options: GridOptions): CalendarGrid =>
    generateMonthGrid(jalali, view, options),
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

  format: (date, pattern, locale = jalali.defaultLocale) =>
    formatTokens(date, undefined, pattern, {
      monthNamesLong: monthNames(locale, "long"),
      monthNamesShort: monthNames(locale, "short"),
      weekdayNamesLong: weekdayNames(locale, "long", CAL),
      weekdayNamesShort: weekdayNames(locale, "short", CAL),
      weekday: getDay(toJsDate(date)),
      locale,
    }),
  parse: (input, pattern, locale = jalali.defaultLocale) =>
    parseTokens(input, pattern, {
      monthNamesLong: monthNames(locale, "long"),
      monthNamesShort: monthNames(locale, "short"),
    }),

  getMonthNames: (locale = jalali.defaultLocale, width = "long") => monthNames(locale, width),
  getWeekdayNames: (locale = jalali.defaultLocale, width = "long") =>
    weekdayNames(locale, width, CAL),
  getEraNames: (locale = jalali.defaultLocale) => eraNames(locale, CAL),
  isRTL: (locale = jalali.defaultLocale) => directionForLocale(locale) === "rtl",
};

export default jalali;
