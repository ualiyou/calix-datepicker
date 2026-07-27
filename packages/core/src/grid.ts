import type {
  CalendarAdapter,
  CalendarGrid,
  DayCell,
  GridOptions,
  MonthView,
  WeekRow,
  Weekday,
} from "./types.js";

/**
 * Shared month-grid generator. Adapters delegate their `getMonthGrid` here so
 * grid construction lives in exactly one place; only the calendar primitives
 * (`startOfMonth`, `addDays`, `getWeekday`, …) differ per adapter.
 */
export function generateMonthGrid(
  adapter: CalendarAdapter,
  view: MonthView,
  options: GridOptions,
): CalendarGrid {
  const { weekStartsOn, fixedWeeks = true } = options;
  const today = options.today ?? adapter.today();

  const firstOfMonth = adapter.startOfMonth({ year: view.year, month: view.month, day: 1 });
  const firstWeekday = adapter.getWeekday(firstOfMonth);

  // Days from the previous month needed to pad the first row.
  const leadingDays = (firstWeekday - weekStartsOn + 7) % 7;
  const gridStart = adapter.addDays(firstOfMonth, -leadingDays);

  const daysInMonth = adapter.daysInMonth(view.year, view.month);
  const usedCells = leadingDays + daysInMonth;
  const totalCells = fixedWeeks ? 42 : Math.ceil(usedCells / 7) * 7;

  const days: DayCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = adapter.addDays(gridStart, i);
    days.push({
      date,
      isOutsideMonth: date.month !== view.month || date.year !== view.year,
      isToday: adapter.isSameDay(date, today),
      weekday: adapter.getWeekday(date),
    });
  }

  const weeks: WeekRow[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const rowDays = days.slice(i, i + 7);
    const firstDay = rowDays[0];
    weeks.push({
      weekNumber: firstDay ? adapter.getWeek(firstDay.date, { weekStartsOn }) : 0,
      days: rowDays,
    });
  }

  return { view, weeks, days };
}

/** Ordered weekday indices starting from `weekStartsOn`. */
export function weekdayOrder(weekStartsOn: Weekday): Weekday[] {
  return Array.from({ length: 7 }, (_, i) => (((weekStartsOn + i) % 7) as Weekday));
}
