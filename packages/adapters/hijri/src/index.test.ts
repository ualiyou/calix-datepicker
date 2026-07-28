import { describe, expect, it } from "vitest";
import { hijri } from "./index.js";
import type { CalendarDate } from "@alydev/core";

const DAY = 86_400_000;

describe("hijri adapter — known conversions", () => {
  it("maps 2026-07-28 to 14 Safar 1448", () => {
    expect(hijri.fromDate(new Date(2026, 6, 28))).toEqual({ year: 1448, month: 2, day: 14 });
  });
  it("round-trips that Hijri date back to the civil date", () => {
    const back = hijri.toDate({ year: 1448, month: 2, day: 14 });
    expect([back.getFullYear(), back.getMonth() + 1, back.getDate()]).toEqual([2026, 7, 28]);
  });
});

describe("hijri adapter — civil→hijri→civil round-trip", () => {
  it("is exact for every day 1950-01-01 … 2075-12-31", () => {
    let checked = 0;
    let failures = 0;
    const start = Date.UTC(1950, 0, 1);
    const end = Date.UTC(2075, 11, 31);
    for (let ms = start; ms <= end; ms += DAY) {
      const u = new Date(ms);
      const local = new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate());
      const h = hijri.fromDate(local);
      const back = hijri.toDate(h);
      if (
        back.getFullYear() !== local.getFullYear() ||
        back.getMonth() !== local.getMonth() ||
        back.getDate() !== local.getDate()
      ) {
        failures++;
      }
      checked++;
    }
    expect(checked).toBeGreaterThan(45000);
    expect(failures).toBe(0);
  });
});

describe("hijri adapter — hijri→civil→hijri round-trip", () => {
  it("is exact across Hijri years 1390 … 1460", () => {
    let failures = 0;
    let checked = 0;
    for (let y = 1390; y <= 1460; y++) {
      for (let m = 1; m <= 12; m++) {
        const dim = hijri.daysInMonth(y, m);
        expect([29, 30]).toContain(dim);
        for (let d = 1; d <= dim; d++) {
          const h: CalendarDate = { year: y, month: m, day: d };
          const back = hijri.fromDate(hijri.toDate(h));
          if (back.year !== y || back.month !== m || back.day !== d) failures++;
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(20000);
    expect(failures).toBe(0);
  });
});

describe("hijri adapter — structure", () => {
  it("year length is 354 or 355 days and matches leap flag", () => {
    for (let y = 1400; y <= 1450; y++) {
      let sum = 0;
      for (let m = 1; m <= 12; m++) sum += hijri.daysInMonth(y, m);
      expect([354, 355]).toContain(sum);
      expect(hijri.isLeapYear(y)).toBe(sum === 355);
    }
  });
  it("addMonths wraps across year boundaries and clamps day", () => {
    expect(hijri.addMonths({ year: 1447, month: 12, day: 1 }, 1)).toEqual({
      year: 1448,
      month: 1,
      day: 1,
    });
    const clamped = hijri.addMonths({ year: 1447, month: 1, day: 30 }, 1);
    expect(clamped.day).toBeLessThanOrEqual(hijri.daysInMonth(1447, 2));
  });
  it("endOfMonth lands on the last valid day", () => {
    const eom = hijri.endOfMonth({ year: 1447, month: 3, day: 1 });
    expect(eom.day).toBe(hijri.daysInMonth(1447, 3));
    expect(hijri.fromDate(hijri.toDate(eom))).toEqual(eom);
  });
  it("addDays is consistent with day arithmetic", () => {
    const h = { year: 1447, month: 5, day: 20 };
    const plus10 = hijri.addDays(h, 10);
    const t0 = hijri.toDate(h).getTime();
    const t1 = hijri.toDate(plus10).getTime();
    expect(Math.round((t1 - t0) / DAY)).toBe(10);
  });
  it("formats localized month names", () => {
    const en = hijri.format({ year: 1448, month: 2, day: 14 }, "d MMMM yyyy", "en-US");
    expect(en).toContain("Safar");
    expect(en).toContain("1448");
    const fa = hijri.getMonthNames("fa-IR", "long");
    expect(fa).toHaveLength(12);
    expect(fa[1]).toBe("صفر");
  });
  it("reports RTL for Arabic and today within range", () => {
    expect(hijri.isRTL("ar-SA")).toBe(true);
    const t = hijri.today();
    expect(t.month).toBeGreaterThanOrEqual(1);
    expect(t.month).toBeLessThanOrEqual(12);
  });
  it("implements the remaining CalendarAdapter primitives", () => {
    const date = { year: 1448, month: 2, day: 14 };
    expect(hijri.addYears(date, 1)).toEqual({ year: 1449, month: 2, day: 14 });
    expect(hijri.getMonthGrid({ year: 1448, month: 2 }, { weekStartsOn: 0 }).days).toHaveLength(42);
    expect(hijri.getYearRange(1448, 3)).toEqual([1447, 1448, 1449]);
    expect(hijri.getWeek(date, { weekStartsOn: 0 })).toBeGreaterThan(0);
    expect(hijri.isSameDay(date, { ...date })).toBe(true);
    expect(hijri.isSameMonth(date, { ...date, day: 1 })).toBe(true);
    expect(hijri.isSameYear(date, { ...date, month: 1 })).toBe(true);
    expect(hijri.parse("1448-02-14", "yyyy-MM-dd", "en-US")).toEqual(date);
    expect(hijri.getWeekdayNames("en-US", "short")).toHaveLength(7);
    expect(hijri.getEraNames("ar-SA")).not.toHaveLength(0);
  });
});
