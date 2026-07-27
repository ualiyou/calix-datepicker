import type {
  CalendarAdapter,
  CalendarDate,
  DateRange,
  SelectionMode,
  SelectionValue,
  Time,
} from "@alydev/core";

/** A range of JS `Date`s at the public boundary. */
export interface RangeValue {
  start: Date | null;
  end: Date | null;
}

/** The public value shape. Its concrete form depends on the picker `mode`. */
export type CalixValue = Date | Date[] | RangeValue | null;

/** Formats selection output for forms and API payloads. */
export function formatCalixValue(
  value: CalixValue,
  adapter: CalendarAdapter,
  locale: string,
  pattern: string,
  outputFormat: "string" | "json" = "string",
): string {
  const formatDate = (date: Date) =>
    adapter.format(adapter.fromDate(date), pattern, locale, timeOf(date));
  const serializeJson = (date: Date) => {
    const calendarDate = adapter.fromDate(date);
    const dateText = adapter.format(calendarDate, "yyyy-MM-dd", locale);
    const timeText = adapter.format(calendarDate, "HH:mm:ss", locale, timeOf(date));
    return {
      dateTime: `${dateText} ${timeText}`,
      date: dateText,
      time: timeText,
      year: calendarDate.year,
      month: calendarDate.month,
      day: calendarDate.day,
    };
  };

  if (outputFormat === "json") {
    if (Array.isArray(value)) return JSON.stringify({ dates: value.map(serializeJson) }, null, 2);
    if (value && "start" in value)
      return JSON.stringify(
        {
          start: value.start ? serializeJson(value.start) : null,
          end: value.end ? serializeJson(value.end) : null,
        },
        null,
        2,
      );
    if (value) return JSON.stringify(serializeJson(value), null, 2);
    return JSON.stringify(
      { dateTime: null, date: null, time: null, year: null, month: null, day: null },
      null,
      2,
    );
  }

  if (Array.isArray(value)) return value.map(formatDate).join(", ");
  if (value && "start" in value) {
    const start = value.start ? formatDate(value.start) : "";
    const end = value.end ? formatDate(value.end) : "";
    return end ? `${start} – ${end}` : start;
  }
  return value ? formatDate(value) : "";
}

const spanModes = new Set<SelectionMode>(["range", "week", "month", "quarter", "year"]);

/** Convert a public (Date-based) value into the internal calendar value. */
export function toInternalValue(
  mode: SelectionMode,
  value: CalixValue | undefined,
  adapter: CalendarAdapter,
): SelectionValue {
  if (value == null) return mode === "multiple" ? [] : null;

  if (mode === "multiple") {
    return (value as Date[]).map((d) => adapter.fromDate(d));
  }
  if (spanModes.has(mode)) {
    const r = value as RangeValue;
    if (!r.start) return null;
    return {
      start: adapter.fromDate(r.start),
      end: r.end ? adapter.fromDate(r.end) : null,
    } satisfies DateRange;
  }
  return adapter.fromDate(value as Date);
}

/** Convert an internal calendar value back to the public (Date-based) value. */
export function toPublicValue(
  mode: SelectionMode,
  value: SelectionValue,
  adapter: CalendarAdapter,
): CalixValue {
  if (mode === "multiple") {
    return ((value as CalendarDate[] | null) ?? []).map((d) => adapter.toDate(d));
  }
  if (spanModes.has(mode)) {
    const r = value as DateRange | null;
    if (!r) return { start: null, end: null };
    return { start: adapter.toDate(r.start), end: r.end ? adapter.toDate(r.end) : null };
  }
  const cd = value as CalendarDate | null;
  return cd ? adapter.toDate(cd) : null;
}

/** The empty public value for a mode. */
export function emptyPublicValue(mode: SelectionMode): CalixValue {
  if (mode === "multiple") return [];
  if (spanModes.has(mode)) return { start: null, end: null };
  return null;
}

function timeOf(date: Date): Time {
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
  };
}
