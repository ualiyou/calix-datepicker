import { describe, expect, it } from "vitest";
import { buddhist } from "./index.js";

describe("buddhist adapter", () => {
  it("maps Buddhist Era dates to Gregorian dates", () => {
    const date = { year: 2569, month: 7, day: 28 };
    expect(buddhist.fromDate(buddhist.toDate(date))).toEqual(date);
    expect(buddhist.toDate(date)).toEqual(new Date(2026, 6, 28));
  });

  it("preserves Gregorian calendar rules", () => {
    expect(buddhist.daysInMonth(2567, 2)).toBe(29);
    expect(buddhist.isLeapYear(2567)).toBe(true);
    expect(buddhist.isLeapYear(2568)).toBe(false);
    expect(buddhist.addDays({ year: 2569, month: 1, day: 31 }, 1)).toEqual({
      year: 2569,
      month: 2,
      day: 1,
    });
    expect(buddhist.addMonths({ year: 2569, month: 12, day: 15 }, 1)).toEqual({
      year: 2570,
      month: 1,
      day: 15,
    });
    expect(buddhist.addYears({ year: 2569, month: 7, day: 28 }, 1)).toEqual({
      year: 2570,
      month: 7,
      day: 28,
    });
  });

  it("implements formatting, grid, and comparison primitives", () => {
    const date = { year: 2569, month: 7, day: 28 };
    expect(buddhist.startOfMonth(date)).toEqual({ year: 2569, month: 7, day: 1 });
    expect(buddhist.endOfMonth(date)).toEqual({ year: 2569, month: 7, day: 31 });
    expect(buddhist.monthsInYear(2569)).toBe(12);
    expect(buddhist.getWeekday(date)).toBe(2);
    expect(buddhist.getMonthGrid({ year: 2569, month: 7 }, { weekStartsOn: 0 }).days).toHaveLength(42);
    expect(buddhist.getYearRange(2569, 3)).toEqual([2568, 2569, 2570]);
    expect(buddhist.getWeek(date, { weekStartsOn: 0 })).toBeGreaterThan(0);
    expect(buddhist.compare(date, { ...date, day: 29 })).toBeLessThan(0);
    expect(buddhist.isSameDay(date, { ...date })).toBe(true);
    expect(buddhist.isSameMonth(date, { ...date, day: 1 })).toBe(true);
    expect(buddhist.isSameYear(date, { ...date, month: 1 })).toBe(true);
    expect(buddhist.format(date, "yyyy-MM-dd", "en-US")).toBe("2569-07-28");
    expect(buddhist.parse("2569-07-28", "yyyy-MM-dd", "en-US")).toEqual(date);
    expect(buddhist.getMonthNames("en-US", "long")[0]).toBe("January");
    expect(buddhist.getWeekdayNames("en-US", "short")).toHaveLength(7);
    expect(buddhist.getEraNames("th-TH")).not.toHaveLength(0);
    expect(buddhist.isRTL("th-TH")).toBe(false);
    expect(buddhist.today().year).toBeGreaterThan(2500);
  });
});
