import { toLatinDigits, toLocaleDigits } from "./locale.js";
import type { CalendarDate, Time } from "./types.js";

/**
 * Calendar-agnostic token formatter. It manipulates only the numeric fields of a
 * {@link CalendarDate}/{@link Time} plus caller-supplied localized names, so it
 * works for any calendar system. Adapters supply month/weekday names (typically
 * via `Intl`) and their own year numbering.
 */
export interface FormatContext {
  readonly monthNamesLong: readonly string[]; // index 0 = month 1
  readonly monthNamesShort: readonly string[];
  readonly weekdayNamesLong: readonly string[]; // index 0 = Sunday
  readonly weekdayNamesShort: readonly string[];
  /** Weekday index (0=Sun..6=Sat) of the date being formatted. */
  readonly weekday: number;
  readonly locale: string;
  readonly meridiem?: readonly [am: string, pm: string];
}

const pad = (n: number, len = 2) => String(Math.abs(n)).padStart(len, "0");

// Longest tokens first so the regex matches greedily and correctly.
const TOKEN_RE =
  /yyyy|yy|MMMM|MMM|MM|M|dd|d|EEEE|EEE|EE|HH|H|hh|h|mm|m|ss|s|aa|a|'[^']*'/g;

/** Format a date/time by a pattern of tokens (subset of Unicode LDML). */
export function formatTokens(
  date: CalendarDate,
  time: Time | undefined,
  pattern: string,
  ctx: FormatContext,
): string {
  const t = time ?? { hour: 0, minute: 0, second: 0, millisecond: 0 };
  const h12 = t.hour % 12 === 0 ? 12 : t.hour % 12;
  const [am, pm] = ctx.meridiem ?? ["AM", "PM"];

  const out = pattern.replace(TOKEN_RE, (token) => {
    switch (token) {
      case "yyyy":
        return pad(date.year, 4);
      case "yy":
        return pad(date.year % 100);
      case "MMMM":
        return ctx.monthNamesLong[date.month - 1] ?? String(date.month);
      case "MMM":
        return ctx.monthNamesShort[date.month - 1] ?? String(date.month);
      case "MM":
        return pad(date.month);
      case "M":
        return String(date.month);
      case "dd":
        return pad(date.day);
      case "d":
        return String(date.day);
      case "EEEE":
        return ctx.weekdayNamesLong[ctx.weekday] ?? "";
      case "EEE":
      case "EE":
        return ctx.weekdayNamesShort[ctx.weekday] ?? "";
      case "HH":
        return pad(t.hour);
      case "H":
        return String(t.hour);
      case "hh":
        return pad(h12);
      case "h":
        return String(h12);
      case "mm":
        return pad(t.minute);
      case "m":
        return String(t.minute);
      case "ss":
        return pad(t.second);
      case "s":
        return String(t.second);
      case "aa":
      case "a":
        return t.hour < 12 ? am : pm;
      default:
        // Quoted literal: strip the surrounding single quotes.
        return token.startsWith("'") ? token.slice(1, -1) : token;
    }
  });

  return toLocaleDigits(out, ctx.locale);
}

/**
 * Parse a string against a numeric/name token pattern into a {@link CalendarDate}.
 * Returns `null` when the input does not match. Localized digits are normalized
 * to Latin first. Month names (long/short) are matched case-insensitively.
 */
export function parseTokens(
  input: string,
  pattern: string,
  ctx: Pick<FormatContext, "monthNamesLong" | "monthNamesShort">,
): CalendarDate | null {
  const normalized = toLatinDigits(input).trim();

  const groups: string[] = [];
  const escaped = escapeRegExp(pattern).replace(
    // NOTE: pattern was regex-escaped, so `\{4\}` etc. — match the escaped tokens.
    /yyyy|yy|MMMM|MMM|MM|M|dd|d/g,
    (token) => {
      switch (token) {
        case "yyyy":
          groups.push("y");
          return "(\\d{1,4})";
        case "yy":
          groups.push("y2");
          return "(\\d{2})";
        case "MMMM":
        case "MMM":
          groups.push("Mname");
          return "([\\p{L}]+)";
        case "MM":
        case "M":
          groups.push("M");
          return "(\\d{1,2})";
        case "dd":
        case "d":
          groups.push("d");
          return "(\\d{1,2})";
        default:
          return token;
      }
    },
  );

  const match = new RegExp(`^${escaped}$`, "u").exec(normalized);
  if (!match) return null;

  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  groups.forEach((name, i) => {
    const raw = match[i + 1];
    if (raw == null) return;
    switch (name) {
      case "y":
        year = Number(raw);
        break;
      case "y2":
        year = 2000 + Number(raw);
        break;
      case "M":
        month = Number(raw);
        break;
      case "d":
        day = Number(raw);
        break;
      case "Mname": {
        const idx = findMonthIndex(raw, ctx);
        if (idx !== -1) month = idx + 1;
        break;
      }
    }
  });

  if (year == null || month == null || day == null) return null;
  if (month < 1 || month > 13 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function findMonthIndex(name: string, ctx: Pick<FormatContext, "monthNamesLong" | "monthNamesShort">) {
  const lower = name.toLocaleLowerCase();
  const long = ctx.monthNamesLong.findIndex((m) => m.toLocaleLowerCase() === lower);
  if (long !== -1) return long;
  return ctx.monthNamesShort.findIndex((m) => m.toLocaleLowerCase() === lower);
}

function escapeRegExp(source: string): string {
  // Escape everything that is regex-special EXCEPT letters (our tokens are letters).
  return source.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}
