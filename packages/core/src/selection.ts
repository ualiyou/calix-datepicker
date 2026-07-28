import {
  compareCalendarDate,
  isSameCalendarDay,
  isWithinRange,
} from "./date.js";
import type {
  CalendarAdapter,
  CalendarDate,
  DateRange,
  SelectionContext,
  SelectionMode,
  SelectionStrategy,
  SelectionValue,
  Weekday,
} from "./types.js";

/* ---------------------------------------------------------------- helpers */

function startOfWeek(date: CalendarDate, weekStartsOn: Weekday, adapter: CalendarAdapter) {
  const leading = (adapter.getWeekday(date) - weekStartsOn + 7) % 7;
  return adapter.addDays(date, -leading);
}

function spanForMode(
  mode: Extract<SelectionMode, "week" | "month" | "quarter" | "year">,
  date: CalendarDate,
  ctx: SelectionContext,
): DateRange {
  const { adapter, weekStartsOn } = ctx;
  switch (mode) {
    case "week": {
      const start = startOfWeek(date, weekStartsOn, adapter);
      return { start, end: adapter.addDays(start, 6) };
    }
    case "month": {
      return { start: adapter.startOfMonth(date), end: adapter.endOfMonth(date) };
    }
    case "quarter": {
      const qStartMonth = Math.floor((date.month - 1) / 3) * 3 + 1;
      const start: CalendarDate = { year: date.year, month: qStartMonth, day: 1 };
      const lastMonth: CalendarDate = { year: date.year, month: qStartMonth + 2, day: 1 };
      return { start, end: adapter.endOfMonth(lastMonth) };
    }
    case "year": {
      const start: CalendarDate = { year: date.year, month: 1, day: 1 };
      const lastMonth: CalendarDate = {
        year: date.year,
        month: adapter.monthsInYear(date.year),
        day: 1,
      };
      return { start, end: adapter.endOfMonth(lastMonth) };
    }
  }
}

/**
 * Clamp the tentative endpoint so the resulting range honours `minRange` /
 * `maxRange` (both measured in inclusive days). The endpoint is moved along the
 * same direction the user dragged, never past the anchor.
 */
function clampSpan(start: CalendarDate, end: CalendarDate, ctx: SelectionContext): CalendarDate {
  const { adapter, minRange, maxRange } = ctx;
  if (minRange == null && maxRange == null) return end;
  const diff = Math.round(
    (adapter.toDate(end).getTime() - adapter.toDate(start).getTime()) / 86_400_000,
  );
  const dir = diff >= 0 ? 1 : -1;
  const inclusive = Math.abs(diff) + 1;
  let target = inclusive;
  if (maxRange != null && target > maxRange) target = maxRange;
  if (minRange != null && target < minRange) target = minRange;
  if (target === inclusive) return end;
  return adapter.addDays(start, dir * (target - 1));
}

function orderedRange(
  a: CalendarDate,
  b: CalendarDate,
): { start: CalendarDate; end: CalendarDate } {
  return compareCalendarDate(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}

/* ------------------------------------------------------------- strategies */

const single: SelectionStrategy<CalendarDate | null> = {
  mode: "single",
  empty: () => null,
  select: (_current, date) => date,
  isSelected: (value, date) => value != null && isSameCalendarDay(value, date),
};

const multiple: SelectionStrategy<CalendarDate[]> = {
  mode: "multiple",
  empty: () => [],
  select: (current, date, ctx) => {
    const exists = current.some((d) => isSameCalendarDay(d, date));
    if (exists) return current.filter((d) => !isSameCalendarDay(d, date));
    if (ctx.max != null && current.length >= ctx.max) return current;
    return [...current, date].sort(compareCalendarDate);
  },
  isSelected: (value, date) => value.some((d) => isSameCalendarDay(d, date)),
};

const range: SelectionStrategy<DateRange | null> = {
  mode: "range",
  empty: () => null,
  select: (current, date, ctx) => {
    // Start a fresh range when empty or already complete.
    if (!current || current.end !== null) return { start: date, end: null };
    return orderedRange(current.start, clampSpan(current.start, date, ctx));
  },
  isSelected: (value, date) =>
    value != null &&
    (isSameCalendarDay(value.start, date) ||
      (value.end != null && isSameCalendarDay(value.end, date))),
  isRangeStart: (value, date) => value != null && isSameCalendarDay(value.start, date),
  isRangeEnd: (value, date) => value?.end != null && isSameCalendarDay(value.end, date),
  isInRange: (value, date, ctx) => {
    if (!value) return false;
    if (value.end != null) return isWithinRange(date, value.start, value.end);
    // Mid-selection: preview the tentative range under the pointer/focus.
    if (ctx.preview) {
      const r = orderedRange(value.start, clampSpan(value.start, ctx.preview, ctx));
      return isWithinRange(date, r.start, r.end);
    }
    return false;
  },
};

function spanStrategy(
  mode: Extract<SelectionMode, "week" | "month" | "quarter" | "year">,
): SelectionStrategy<DateRange | null> {
  return {
    mode,
    empty: () => null,
    select: (_current, date, ctx) => spanForMode(mode, date, ctx),
    isSelected: (value, date) =>
      value?.end != null && isWithinRange(date, value.start, value.end),
    isRangeStart: (value, date) => value != null && isSameCalendarDay(value.start, date),
    isRangeEnd: (value, date) => value?.end != null && isSameCalendarDay(value.end, date),
    isInRange: (value, date) =>
      value?.end != null && isWithinRange(date, value.start, value.end),
  };
}

const strategies: Record<SelectionMode, SelectionStrategy<SelectionValue>> = {
  single,
  multiple,
  range,
  week: spanStrategy("week"),
  month: spanStrategy("month"),
  quarter: spanStrategy("quarter"),
  year: spanStrategy("year"),
};

/** Resolve the built-in selection strategy for a mode. */
export function getSelectionStrategy(mode: SelectionMode): SelectionStrategy<SelectionValue> {
  return strategies[mode];
}

/** Register or override a selection strategy (advanced/custom modes). */
export function registerSelectionStrategy(
  mode: SelectionMode,
  strategy: SelectionStrategy<SelectionValue>,
): void {
  strategies[mode] = strategy;
}

export const selectionStrategies = strategies;
