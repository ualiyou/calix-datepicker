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

const CAL = "islamic-umalqura";
const DAY = 86_400_000;

const partsFmt = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura-nu-latn", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "UTC",
});

/** Hijri (Umm al-Qura) Y/M/D for a civil (Gregorian) Y/M/D. */
function hijriFromCivil(gy: number, gm: number, gd: number): CalendarDate {
  const parts = partsFmt.formatToParts(new Date(Date.UTC(gy, gm - 1, gd, 12)));
  let year = 0;
  let month = 0;
  let day = 0;
  for (const p of parts) {
    if (p.type === "year") year = Number(p.value.replace(/[^0-9]/g, ""));
    else if (p.type === "month") month = Number(p.value);
    else if (p.type === "day") day = Number(p.value);
  }
  return { year, month, day };
}

/** Whole-day UTC day-number → civil Y/M/D. */
function civilFromDayNumber(n: number): { y: number; m: number; d: number } {
  const dt = new Date(n * DAY);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

function hijriFromDayNumber(n: number): CalendarDate {
  const c = civilFromDayNumber(n);
  return hijriFromCivil(c.y, c.m, c.d);
}

/** Monotonic approximation of a Hijri date's day ordinal (for estimation only). */
function ordinal(h: CalendarDate): number {
  return h.year * 354.36707 + (h.month - 1) * 29.53059 + h.day;
}

function cmp(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

const ANCHOR_DN = Math.floor(Date.UTC(2000, 0, 1) / DAY);
const ANCHOR_H = hijriFromCivil(2000, 1, 1);

/** Civil day-number of a Hijri date: estimate by ordinal, then exact fine-tune. */
function toDayNumber(h: CalendarDate): number {
  let g = ANCHOR_DN + Math.round(ordinal(h) - ordinal(ANCHOR_H));
  for (let i = 0; i < 4; i++) {
    const diff = Math.round(ordinal(h) - ordinal(hijriFromDayNumber(g)));
    if (diff === 0) break;
    g += diff;
  }
  let guard = 0;
  while (cmp(hijriFromDayNumber(g), h) < 0 && guard++ < 60) g++;
  guard = 0;
  while (cmp(hijriFromDayNumber(g), h) > 0 && guard++ < 60) g--;
  return g;
}

function toLocalDate(h: CalendarDate, time?: Time): Date {
  const c = civilFromDayNumber(toDayNumber(h));
  return new Date(
    c.y,
    c.m - 1,
    c.d,
    time?.hour ?? 0,
    time?.minute ?? 0,
    time?.second ?? 0,
    time?.millisecond ?? 0,
  );
}

function daysInHijriMonth(year: number, month: number): number {
  const start = toDayNumber({ year, month, day: 1 });
  const next =
    month === 12
      ? toDayNumber({ year: year + 1, month: 1, day: 1 })
      : toDayNumber({ year, month: month + 1, day: 1 });
  return next - start;
}

function weekdayOf(h: CalendarDate): Weekday {
  const c = civilFromDayNumber(toDayNumber(h));
  return new Date(c.y, c.m - 1, c.d).getDay() as Weekday;
}

function monthNames(locale: string, width: NameWidth): string[] {
  const refYear = hijriFromCivil(new Date().getFullYear(), 6, 1).year;
  const dates = Array.from({ length: 12 }, (_, i) => {
    const c = civilFromDayNumber(toDayNumber({ year: refYear, month: i + 1, day: 15 }));
    return new Date(c.y, c.m - 1, c.d);
  });
  return monthNamesFromDates(dates, locale, width, CAL);
}

/**
 * The Hijri (Umm al-Qura / Islamic civil) calendar adapter. Conversion is backed
 * by the platform's ICU `islamic-umalqura` calendar, so no lookup tables ship in
 * the bundle. Stateless singleton; locale is always a parameter.
 */
export const hijri: CalendarAdapter = {
  id: "hijri",
  defaultLocale: "ar-SA",

  today: () => {
    const now = new Date();
    return hijriFromCivil(now.getFullYear(), now.getMonth() + 1, now.getDate());
  },
  toDate: (date, time) => toLocalDate(date, time),
  fromDate: (d) => hijriFromCivil(d.getFullYear(), d.getMonth() + 1, d.getDate()),

  addDays: (date, amount) => hijriFromDayNumber(toDayNumber(date) + amount),
  addMonths: (date, amount) => {
    const total = date.month - 1 + amount;
    const year = date.year + Math.floor(total / 12);
    const month = ((total % 12) + 12) % 12 + 1;
    return { year, month, day: Math.min(date.day, daysInHijriMonth(year, month)) };
  },
  addYears: (date, amount) => {
    const year = date.year + amount;
    return { year, month: date.month, day: Math.min(date.day, daysInHijriMonth(year, date.month)) };
  },

  startOfMonth: (date) => ({ year: date.year, month: date.month, day: 1 }),
  endOfMonth: (date) => ({
    year: date.year,
    month: date.month,
    day: daysInHijriMonth(date.year, date.month),
  }),
  daysInMonth: (year, month) => daysInHijriMonth(year, month),
  monthsInYear: () => 12,
  isLeapYear: (year) =>
    toDayNumber({ year: year + 1, month: 1, day: 1 }) - toDayNumber({ year, month: 1, day: 1 }) ===
    355,

  getWeekday: (date) => weekdayOf(date),
  getMonthGrid: (view: MonthView, options: GridOptions): CalendarGrid =>
    generateMonthGrid(hijri, view, options),
  getYearRange: (around, size) => {
    const half = Math.floor(size / 2);
    return Array.from({ length: size }, (_, i) => around - half + i);
  },
  getWeek: (date, { weekStartsOn }) => {
    const firstOfYear: CalendarDate = { year: date.year, month: 1, day: 1 };
    const dayOfYear = toDayNumber(date) - toDayNumber(firstOfYear) + 1;
    const offset = (weekdayOf(firstOfYear) - weekStartsOn + 7) % 7;
    return Math.floor((dayOfYear + offset - 1) / 7) + 1;
  },

  compare: (a, b) => cmp(a, b),
  isSameDay: (a, b) => a.year === b.year && a.month === b.month && a.day === b.day,
  isSameMonth: (a, b) => a.year === b.year && a.month === b.month,
  isSameYear: (a, b) => a.year === b.year,

  format: (date, pattern, locale = hijri.defaultLocale, time) =>
    formatTokens(date, time, pattern, {
      monthNamesLong: monthNames(locale, "long"),
      monthNamesShort: monthNames(locale, "short"),
      weekdayNamesLong: weekdayNames(locale, "long", CAL),
      weekdayNamesShort: weekdayNames(locale, "short", CAL),
      weekday: weekdayOf(date),
      locale,
    }),
  parse: (input, pattern, locale = hijri.defaultLocale) =>
    parseTokens(input, pattern, {
      monthNamesLong: monthNames(locale, "long"),
      monthNamesShort: monthNames(locale, "short"),
    }),

  getMonthNames: (locale = hijri.defaultLocale, width = "long") => monthNames(locale, width),
  getWeekdayNames: (locale = hijri.defaultLocale, width = "long") =>
    weekdayNames(locale, width, CAL),
  getEraNames: (locale = hijri.defaultLocale) => eraNames(locale, CAL),
  isRTL: (locale = hijri.defaultLocale) => directionForLocale(locale) === "rtl",
};

export default hijri;
