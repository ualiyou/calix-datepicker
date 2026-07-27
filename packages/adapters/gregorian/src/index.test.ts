import { describe, expect, it } from "vitest";
import { gregorian } from "./index.js";

describe("gregorian adapter", () => {
  it("round-trips through JS Date", () => {
    const cd = { year: 2026, month: 7, day: 3 };
    expect(gregorian.fromDate(gregorian.toDate(cd))).toEqual(cd);
  });

  it("adds days/months/years across boundaries", () => {
    expect(gregorian.addDays({ year: 2026, month: 1, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 1,
    });
    expect(gregorian.addMonths({ year: 2026, month: 12, day: 15 }, 1)).toEqual({
      year: 2027,
      month: 1,
      day: 15,
    });
    // 2025 is not a leap year, so Feb 29 clamps to Feb 28 (date-fns does not roll over).
    expect(gregorian.addYears({ year: 2024, month: 2, day: 29 }, 1)).toEqual({
      year: 2025,
      month: 2,
      day: 28,
    });
  });

  it("computes leap years and days in month", () => {
    expect(gregorian.isLeapYear(2024)).toBe(true);
    expect(gregorian.isLeapYear(2025)).toBe(false);
    expect(gregorian.isLeapYear(2100)).toBe(false);
    expect(gregorian.isLeapYear(2000)).toBe(true);
    expect(gregorian.daysInMonth(2024, 2)).toBe(29);
    expect(gregorian.daysInMonth(2025, 2)).toBe(28);
  });

  it("builds a 42-cell grid", () => {
    const grid = gregorian.getMonthGrid({ year: 2026, month: 7 }, { weekStartsOn: 0 });
    expect(grid.days).toHaveLength(42);
  });

  it("formats and parses in en-US", () => {
    const cd = { year: 2026, month: 7, day: 3 };
    expect(gregorian.format(cd, "yyyy-MM-dd", "en-US")).toBe("2026-07-03");
    expect(gregorian.parse("2026-07-03", "yyyy-MM-dd", "en-US")).toEqual(cd);
    expect(gregorian.format(cd, "d MMMM yyyy", "en-US")).toBe("3 July 2026");
  });

  it("exposes localized names and direction", () => {
    expect(gregorian.getMonthNames("en-US", "long")[0]).toBe("January");
    expect(gregorian.getWeekdayNames("en-US", "short")).toHaveLength(7);
    expect(gregorian.isRTL("en-US")).toBe(false);
  });

  it("implements the remaining CalendarAdapter primitives", () => {
    const date = { year: 2026, month: 7, day: 3 };
    expect(gregorian.startOfMonth(date)).toEqual({ year: 2026, month: 7, day: 1 });
    expect(gregorian.endOfMonth(date)).toEqual({ year: 2026, month: 7, day: 31 });
    expect(gregorian.monthsInYear(2026)).toBe(12);
    expect(gregorian.getWeekday(date)).toBe(5);
    expect(gregorian.getYearRange(2026, 3)).toEqual([2025, 2026, 2027]);
    expect(gregorian.getWeek(date, { weekStartsOn: 0 })).toBeGreaterThan(0);
    expect(gregorian.compare(date, { year: 2026, month: 7, day: 4 })).toBeLessThan(0);
    expect(gregorian.isSameDay(date, { ...date })).toBe(true);
    expect(gregorian.isSameMonth(date, { ...date, day: 4 })).toBe(true);
    expect(gregorian.isSameYear(date, { ...date, month: 1 })).toBe(true);
    expect(gregorian.getEraNames("en-US")).not.toHaveLength(0);
    expect(gregorian.today().year).toBeGreaterThan(2000);
  });
});
