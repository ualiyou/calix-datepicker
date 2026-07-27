import { describe, expect, it } from "vitest";
import { jalali } from "./index.js";

describe("jalali adapter", () => {
  it("round-trips through JS Date", () => {
    const cd = { year: 1405, month: 5, day: 6 };
    expect(jalali.fromDate(jalali.toDate(cd))).toEqual(cd);
  });

  it("maps a known Gregorian date to Jalali", () => {
    // 2021-03-21 is Nowruz 1400/01/01.
    expect(jalali.fromDate(new Date(2021, 2, 21))).toEqual({ year: 1400, month: 1, day: 1 });
  });

  it("knows Jalali leap years", () => {
    // 1403 is a leap year (Esfand has 30 days); 1404 is not.
    expect(jalali.daysInMonth(1403, 12)).toBe(30);
    expect(jalali.isLeapYear(1403)).toBe(true);
    expect(jalali.daysInMonth(1404, 12)).toBe(29);
    expect(jalali.isLeapYear(1404)).toBe(false);
  });

  it("first six months have 31 days", () => {
    expect(jalali.daysInMonth(1404, 1)).toBe(31);
    expect(jalali.daysInMonth(1404, 6)).toBe(31);
    expect(jalali.daysInMonth(1404, 7)).toBe(30);
  });

  it("builds a 42-cell grid", () => {
    const grid = jalali.getMonthGrid({ year: 1405, month: 5 }, { weekStartsOn: 6 });
    expect(grid.days).toHaveLength(42);
  });

  it("formats with Persian month names and digits", () => {
    const cd = { year: 1405, month: 1, day: 1 };
    const formatted = jalali.format(cd, "d MMMM yyyy", "fa-IR");
    expect(formatted).toContain("فروردین");
    // Digits should be Persian.
    expect(/[۰-۹]/.test(formatted)).toBe(true);
  });

  it("is RTL for fa-IR", () => {
    expect(jalali.isRTL("fa-IR")).toBe(true);
  });

  it("implements the remaining CalendarAdapter primitives", () => {
    const date = { year: 1405, month: 5, day: 6 };
    expect(jalali.startOfMonth(date)).toEqual({ year: 1405, month: 5, day: 1 });
    expect(jalali.endOfMonth(date)).toEqual({ year: 1405, month: 5, day: 31 });
    expect(jalali.monthsInYear(1405)).toBe(12);
    expect(jalali.getWeekday(date)).toBeGreaterThanOrEqual(0);
    expect(jalali.getYearRange(1405, 3)).toEqual([1404, 1405, 1406]);
    expect(jalali.getWeek(date, { weekStartsOn: 6 })).toBeGreaterThan(0);
    expect(jalali.compare(date, { year: 1405, month: 5, day: 7 })).toBeLessThan(0);
    expect(jalali.isSameDay(date, { ...date })).toBe(true);
    expect(jalali.isSameMonth(date, { ...date, day: 7 })).toBe(true);
    expect(jalali.isSameYear(date, { ...date, month: 1 })).toBe(true);
    expect(jalali.getEraNames("fa-IR")).not.toHaveLength(0);
    expect(jalali.parse("1405-05-06", "yyyy-MM-dd", "fa-IR")).toEqual(date);
    expect(jalali.today().year).toBeGreaterThan(1400);
  });
});
