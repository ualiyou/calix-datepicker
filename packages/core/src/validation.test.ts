import { describe, expect, it } from "vitest";
import {
  buildDisabledPredicate,
  monthHasEnabledDay,
  nearestEnabledDate,
} from "./validation.js";
import { mockAdapter } from "./test/mock-adapter.js";
import type { CalendarDate } from "./types.js";

const d = (y: number, m: number, day: number): CalendarDate => ({ year: y, month: m, day });

describe("buildDisabledPredicate", () => {
  it("enforces min/max", () => {
    const isDisabled = buildDisabledPredicate(
      { min: d(2026, 7, 5), max: d(2026, 7, 25) },
      mockAdapter,
    );
    expect(isDisabled(d(2026, 7, 4))).toBe(true);
    expect(isDisabled(d(2026, 7, 5))).toBe(false);
    expect(isDisabled(d(2026, 7, 25))).toBe(false);
    expect(isDisabled(d(2026, 7, 26))).toBe(true);
  });

  it("disables specific dates and holidays", () => {
    const isDisabled = buildDisabledPredicate(
      { disabledDates: [d(2026, 7, 10)], holidays: [d(2026, 7, 12)] },
      mockAdapter,
    );
    expect(isDisabled(d(2026, 7, 10))).toBe(true);
    expect(isDisabled(d(2026, 7, 12))).toBe(true);
    expect(isDisabled(d(2026, 7, 11))).toBe(false);
  });

  it("supports businessDaysOnly and disabled weekdays", () => {
    const isDisabled = buildDisabledPredicate({ businessDaysOnly: true }, mockAdapter);
    expect(isDisabled(d(2026, 7, 11))).toBe(true); // Saturday
    expect(isDisabled(d(2026, 7, 12))).toBe(true); // Sunday
    expect(isDisabled(d(2026, 7, 13))).toBe(false); // Monday
  });

  it("honours a custom weekend via weekendDays", () => {
    const isDisabled = buildDisabledPredicate(
      { businessDaysOnly: true, weekendDays: [5] },
      mockAdapter,
    );
    expect(isDisabled(d(2026, 7, 10))).toBe(true); // Friday is the weekend
    expect(isDisabled(d(2026, 7, 11))).toBe(false); // Saturday now a working day
    expect(isDisabled(d(2026, 7, 12))).toBe(false); // Sunday now a working day
  });

  it("treats enabledDates as an allow-list", () => {
    const isDisabled = buildDisabledPredicate(
      { enabledDates: [d(2026, 7, 1), d(2026, 7, 2)] },
      mockAdapter,
    );
    expect(isDisabled(d(2026, 7, 1))).toBe(false);
    expect(isDisabled(d(2026, 7, 3))).toBe(true);
  });

  it("disables months and years", () => {
    const isDisabled = buildDisabledPredicate(
      { disabledMonths: [7], disabledYears: [2025] },
      mockAdapter,
    );
    expect(isDisabled(d(2026, 7, 1))).toBe(true);
    expect(isDisabled(d(2025, 3, 1))).toBe(true);
    expect(isDisabled(d(2026, 8, 1))).toBe(false);
  });

  it("supports a custom predicate", () => {
    const isDisabled = buildDisabledPredicate(
      { isDateDisabled: (date) => date.day === 13 },
      mockAdapter,
    );
    expect(isDisabled(d(2026, 7, 13))).toBe(true);
    expect(isDisabled(d(2026, 7, 14))).toBe(false);
  });
});

describe("monthHasEnabledDay", () => {
  it("detects a fully-disabled month", () => {
    const isDisabled = buildDisabledPredicate({ max: d(2026, 6, 30) }, mockAdapter);
    expect(monthHasEnabledDay({ year: 2026, month: 7 }, mockAdapter, isDisabled)).toBe(false);
    expect(monthHasEnabledDay({ year: 2026, month: 6 }, mockAdapter, isDisabled)).toBe(true);
  });
});

describe("nearestEnabledDate", () => {
  it("returns the date when already enabled", () => {
    const isDisabled = buildDisabledPredicate({}, mockAdapter);
    expect(nearestEnabledDate(d(2026, 7, 10), mockAdapter, isDisabled)).toEqual(d(2026, 7, 10));
  });
  it("searches outward for the nearest enabled date", () => {
    const isDisabled = buildDisabledPredicate({ min: d(2026, 7, 15) }, mockAdapter);
    expect(nearestEnabledDate(d(2026, 7, 10), mockAdapter, isDisabled)).toEqual(d(2026, 7, 15));
  });
});
