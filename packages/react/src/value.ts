import type { CalendarAdapter, CalendarDate, DateRange, SelectionMode, SelectionValue } from "@alydev/core";

/** A range of JS `Date`s at the public boundary. */
export interface RangeValue {
  start: Date | null;
  end: Date | null;
}

/** The public value shape. Its concrete form depends on the picker `mode`. */
export type CalixValue = Date | Date[] | RangeValue | null;

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
