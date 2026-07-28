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
    expect(buddhist.addDays({ year: 2569, month: 1, day: 31 }, 1)).toEqual({
      year: 2569,
      month: 2,
      day: 1,
    });
  });
});
