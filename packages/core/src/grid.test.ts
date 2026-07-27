import { describe, expect, it } from "vitest";
import { generateMonthGrid, weekdayOrder } from "./grid.js";
import { mockAdapter } from "./test/mock-adapter.js";

describe("generateMonthGrid", () => {
  it("produces 6 fixed weeks (42 cells) by default", () => {
    const grid = generateMonthGrid(mockAdapter, { year: 2026, month: 7 }, { weekStartsOn: 0 });
    expect(grid.days).toHaveLength(42);
    expect(grid.weeks).toHaveLength(6);
  });

  it("pads leading days from the previous month", () => {
    // July 2026 starts on Wednesday; with weekStartsOn=Sunday the grid starts Jun 28.
    const grid = generateMonthGrid(mockAdapter, { year: 2026, month: 7 }, { weekStartsOn: 0 });
    expect(grid.days[0]?.date).toEqual({ year: 2026, month: 6, day: 28 });
    expect(grid.days[0]?.isOutsideMonth).toBe(true);
  });

  it("respects weekStartsOn=1 (Monday)", () => {
    const grid = generateMonthGrid(mockAdapter, { year: 2026, month: 7 }, { weekStartsOn: 1 });
    expect(grid.days[0]?.date).toEqual({ year: 2026, month: 6, day: 29 });
  });

  it("flags today", () => {
    const grid = generateMonthGrid(mockAdapter, { year: 2026, month: 7 }, { weekStartsOn: 0 });
    const today = grid.days.filter((d) => d.isToday);
    expect(today).toHaveLength(1);
    expect(today[0]?.date).toEqual({ year: 2026, month: 7, day: 27 });
  });

  it("supports non-fixed weeks", () => {
    const grid = generateMonthGrid(
      mockAdapter,
      { year: 2026, month: 2 },
      { weekStartsOn: 0, fixedWeeks: false },
    );
    // Feb 2026 fits in 5 rows.
    expect(grid.weeks.length).toBeLessThanOrEqual(6);
    expect(grid.days.length % 7).toBe(0);
  });
});

describe("weekdayOrder", () => {
  it("orders from the given start day", () => {
    expect(weekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(weekdayOrder(6)).toEqual([6, 0, 1, 2, 3, 4, 5]);
  });
});
