import { compareCalendarDate, dateKey } from "./date.js";
import type {
  CalendarAdapter,
  CalendarDate,
  DateConstraints,
  DateDisabledPredicate,
  Weekday,
} from "./types.js";

/**
 * Compile a set of declarative {@link DateConstraints} into a single fast
 * predicate. The returned function answers "is this date NOT selectable?".
 *
 * Rules are OR-combined: a date is disabled if *any* rule disables it. When
 * `enabledDates` is provided it acts as an allow-list — anything not in it is
 * disabled (min/max and explicit disables still apply on top).
 */
export function buildDisabledPredicate(
  constraints: DateConstraints,
  adapter: CalendarAdapter,
): DateDisabledPredicate {
  const {
    min,
    max,
    disabledDates,
    enabledDates,
    disabledWeekdays,
    disabledMonths,
    disabledYears,
    businessDaysOnly,
    holidays,
    isDateDisabled,
  } = constraints;

  const disabledSet = disabledDates ? new Set(disabledDates.map(dateKey)) : null;
  const holidaySet = holidays ? new Set(holidays.map(dateKey)) : null;
  const enabledSet = enabledDates ? new Set(enabledDates.map(dateKey)) : null;
  const weekdaySet = disabledWeekdays ? new Set<Weekday>(disabledWeekdays) : null;
  const monthSet = disabledMonths ? new Set<number>(disabledMonths) : null;
  const yearSet = disabledYears ? new Set<number>(disabledYears) : null;

  return (date: CalendarDate): boolean => {
    if (min && compareCalendarDate(date, min) < 0) return true;
    if (max && compareCalendarDate(date, max) > 0) return true;

    const key = dateKey(date);
    if (enabledSet && !enabledSet.has(key)) return true;
    if (disabledSet?.has(key)) return true;
    if (holidaySet?.has(key)) return true;

    if (monthSet?.has(date.month)) return true;
    if (yearSet?.has(date.year)) return true;

    if (weekdaySet || businessDaysOnly) {
      const weekday = adapter.getWeekday(date);
      if (weekdaySet?.has(weekday)) return true;
      if (businessDaysOnly && (weekday === 0 || weekday === 6)) return true;
    }

    if (isDateDisabled?.(date, adapter)) return true;

    return false;
  };
}

/** True when the whole month contains at least one selectable day. */
export function monthHasEnabledDay(
  view: { year: number; month: number },
  adapter: CalendarAdapter,
  isDisabled: DateDisabledPredicate,
): boolean {
  const days = adapter.daysInMonth(view.year, view.month);
  for (let day = 1; day <= days; day++) {
    if (!isDisabled({ year: view.year, month: view.month, day })) return true;
  }
  return false;
}

/** Find the nearest selectable date to `date`, searching outward up to `limit` days. */
export function nearestEnabledDate(
  date: CalendarDate,
  adapter: CalendarAdapter,
  isDisabled: DateDisabledPredicate,
  limit = 366,
): CalendarDate | null {
  if (!isDisabled(date)) return date;
  for (let offset = 1; offset <= limit; offset++) {
    const forward = adapter.addDays(date, offset);
    if (!isDisabled(forward)) return forward;
    const backward = adapter.addDays(date, -offset);
    if (!isDisabled(backward)) return backward;
  }
  return null;
}
