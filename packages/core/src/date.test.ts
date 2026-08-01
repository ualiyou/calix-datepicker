import { describe, expect, it } from "vitest";
import {
  calendarDate,
  clampCalendarDate,
  compareCalendarDate,
  dateKey,
  isCalendarDate,
  isSameCalendarDay,
  isSameCalendarMonth,
  isWithinRange,
  maxCalendarDate,
  minCalendarDate,
  time,
} from "./date.js";

describe("date helpers", () => {
  const early = calendarDate(2026, 7, 1);
  const middle = calendarDate(2026, 7, 15);
  const late = calendarDate(2026, 7, 31);

  it("constructs date and time parts", () => {
    expect(early).toEqual({ year: 2026, month: 7, day: 1 });
    expect(time()).toEqual({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    expect(time(1, 2, 3, 4)).toEqual({ hour: 1, minute: 2, second: 3, millisecond: 4 });
  });

  it("recognizes calendar-date shapes", () => {
    expect(isCalendarDate(middle)).toBe(true);
    expect(isCalendarDate({ year: 2026, month: 7 })).toBe(false);
    expect(isCalendarDate(null)).toBe(false);
    expect(isCalendarDate("2026-07-15")).toBe(false);
    expect(isCalendarDate({ year: "2026", month: 7, day: 15 })).toBe(false);
  });

  it("compares, matches, clamps, and keys dates", () => {
    expect(compareCalendarDate(early, middle)).toBeLessThan(0);
    expect(compareCalendarDate(late, middle)).toBeGreaterThan(0);
    expect(isSameCalendarDay(middle, calendarDate(2026, 7, 15))).toBe(true);
    expect(isSameCalendarMonth(middle, late)).toBe(true);
    expect(clampCalendarDate(early, middle, late)).toBe(middle);
    expect(clampCalendarDate(late, early, middle)).toBe(middle);
    expect(clampCalendarDate(middle, early, late)).toBe(middle);
    expect(isSameCalendarMonth(middle, early)).toBe(true);
    expect(isSameCalendarDay(middle, early)).toBe(false);
    expect(dateKey(middle)).toBe("2026-7-15");
  });

  it("finds date bounds and inclusive range membership", () => {
    expect(minCalendarDate(undefined, late, null, middle, early)).toBe(early);
    expect(maxCalendarDate(undefined, early, null, middle, late)).toBe(late);
    expect(minCalendarDate()).toBeNull();
    expect(maxCalendarDate()).toBeNull();
    expect(isWithinRange(middle, early, late)).toBe(true);
    expect(isWithinRange(early, early, late)).toBe(true);
    expect(isWithinRange(late, early, middle)).toBe(false);
  });
});
