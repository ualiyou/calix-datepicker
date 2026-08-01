import { describe, expect, it } from "vitest";
import { getSelectionStrategy, registerSelectionStrategy, selectionStrategies } from "./selection.js";
import { mockAdapter } from "./test/mock-adapter.js";
import type { CalendarDate, DateRange, SelectionContext } from "./types.js";

const ctx: SelectionContext = { adapter: mockAdapter, weekStartsOn: 0 };
const d = (year: number, month: number, day: number): CalendarDate => ({ year, month, day });

describe("single strategy", () => {
  const s = getSelectionStrategy("single");
  it("selects and reports selection", () => {
    const v = s.select(s.empty(), d(2026, 7, 10), ctx);
    expect(s.isSelected(v, d(2026, 7, 10), ctx)).toBe(true);
    expect(s.isSelected(v, d(2026, 7, 11), ctx)).toBe(false);
  });
  it("replaces on new selection", () => {
    let v = s.select(s.empty(), d(2026, 7, 10), ctx);
    v = s.select(v, d(2026, 7, 20), ctx);
    expect(s.isSelected(v, d(2026, 7, 20), ctx)).toBe(true);
    expect(s.isSelected(v, d(2026, 7, 10), ctx)).toBe(false);
  });
});

describe("multiple strategy", () => {
  const s = getSelectionStrategy("multiple");
  it("toggles membership and stays sorted", () => {
    let v = s.select(s.empty(), d(2026, 7, 5), ctx);
    v = s.select(v, d(2026, 7, 1), ctx);
    expect((v as CalendarDate[]).map((x) => x.day)).toEqual([1, 5]);
    v = s.select(v, d(2026, 7, 5), ctx); // toggle off
    expect((v as CalendarDate[]).map((x) => x.day)).toEqual([1]);
  });
  it("respects max", () => {
    const withMax: SelectionContext = { ...ctx, max: 2 };
    let v = s.select(s.empty(), d(2026, 7, 1), withMax);
    v = s.select(v, d(2026, 7, 2), withMax);
    v = s.select(v, d(2026, 7, 3), withMax);
    expect((v as CalendarDate[]).length).toBe(2);
  });
  it("allows an unlimited number of dates", () => {
    let v = s.select(s.empty(), d(2026, 7, 1), ctx);
    v = s.select(v, d(2026, 7, 2), ctx);
    expect((v as CalendarDate[])).toHaveLength(2);
  });
});

describe("range strategy", () => {
  const s = getSelectionStrategy("range");
  it("orders start/end regardless of click order", () => {
    let v = s.select(s.empty(), d(2026, 7, 20), ctx);
    v = s.select(v, d(2026, 7, 10), ctx);
    const r = v as DateRange;
    expect(r.start.day).toBe(10);
    expect(r.end?.day).toBe(20);
  });
  it("marks boundaries and in-range days", () => {
    let v = s.select(s.empty(), d(2026, 7, 10), ctx);
    v = s.select(v, d(2026, 7, 20), ctx);
    expect(s.isRangeStart!(v, d(2026, 7, 10), ctx)).toBe(true);
    expect(s.isRangeEnd!(v, d(2026, 7, 20), ctx)).toBe(true);
    expect(s.isInRange!(v, d(2026, 7, 15), ctx)).toBe(true);
    expect(s.isInRange!(v, d(2026, 7, 25), ctx)).toBe(false);
  });
  it("previews a tentative range mid-selection", () => {
    const v = s.select(s.empty(), d(2026, 7, 5), ctx);
    const previewCtx: SelectionContext = { ...ctx, preview: d(2026, 7, 9) };
    expect(s.isInRange!(v, d(2026, 7, 7), previewCtx)).toBe(true);
  });
  it("does not mark an incomplete range without a preview", () => {
    const v = s.select(s.empty(), d(2026, 7, 5), ctx);
    expect(s.isInRange!(v, d(2026, 7, 7), ctx)).toBe(false);
  });
  it("starts a fresh range after completion", () => {
    let v = s.select(s.empty(), d(2026, 7, 5), ctx);
    v = s.select(v, d(2026, 7, 9), ctx); // complete
    v = s.select(v, d(2026, 7, 15), ctx); // new start
    const r = v as DateRange;
    expect(r.start.day).toBe(15);
    expect(r.end).toBeNull();
  });
  it("clamps a range to maxRange days", () => {
    const rc: SelectionContext = { ...ctx, maxRange: 7 };
    let v = s.select(s.empty(), d(2026, 7, 10), rc);
    v = s.select(v, d(2026, 7, 20), rc);
    const r = v as DateRange;
    expect(r.start.day).toBe(10);
    expect(r.end?.day).toBe(16);
  });
  it("extends a range to minRange days", () => {
    const rc: SelectionContext = { ...ctx, minRange: 5 };
    let v = s.select(s.empty(), d(2026, 7, 10), rc);
    v = s.select(v, d(2026, 7, 12), rc);
    const r = v as DateRange;
    expect(r.end?.day).toBe(14);
  });
  it("clamps respecting the drag direction", () => {
    const rc: SelectionContext = { ...ctx, maxRange: 7 };
    let v = s.select(s.empty(), d(2026, 7, 20), rc);
    v = s.select(v, d(2026, 7, 10), rc);
    const r = v as DateRange;
    expect(r.start.day).toBe(14);
    expect(r.end?.day).toBe(20);
  });
});

describe("span strategies", () => {
  it("week spans Sunday..Saturday for weekStartsOn=0", () => {
    const s = getSelectionStrategy("week");
    const v = s.select(s.empty(), d(2026, 7, 15), ctx); // Wednesday
    const r = v as DateRange;
    expect(r.start.day).toBe(12); // Sunday
    expect(r.end?.day).toBe(18); // Saturday
  });
  it("month spans the whole month", () => {
    const s = getSelectionStrategy("month");
    const v = s.select(s.empty(), d(2026, 7, 15), ctx) as DateRange;
    expect(v.start).toEqual(d(2026, 7, 1));
    expect(v.end).toEqual(d(2026, 7, 31));
  });
  it("quarter spans three months", () => {
    const s = getSelectionStrategy("quarter");
    const v = s.select(s.empty(), d(2026, 5, 15), ctx) as DateRange; // Q2
    expect(v.start).toEqual(d(2026, 4, 1));
    expect(v.end).toEqual(d(2026, 6, 30));
  });
  it("year spans Jan..Dec", () => {
    const s = getSelectionStrategy("year");
    const v = s.select(s.empty(), d(2026, 5, 15), ctx) as DateRange;
    expect(v.start).toEqual(d(2026, 1, 1));
    expect(v.end).toEqual(d(2026, 12, 31));
  });

  it("reports selection boundaries for every span mode", () => {
    for (const mode of ["week", "month", "quarter", "year"] as const) {
      const s = getSelectionStrategy(mode);
      const value = s.select(s.empty(), d(2026, 7, 15), ctx) as DateRange;
      expect(s.isSelected(value, value.start, ctx)).toBe(true);
      expect(s.isRangeStart!(value, value.start, ctx)).toBe(true);
      expect(s.isRangeEnd!(value, value.end!, ctx)).toBe(true);
      expect(s.isInRange!(value, value.start, ctx)).toBe(true);
    }
  });

  it("allows advanced callers to register a strategy", () => {
    const original = selectionStrategies.week;
    registerSelectionStrategy("week", selectionStrategies.single);
    expect(getSelectionStrategy("week")).toBe(selectionStrategies.single);
    registerSelectionStrategy("week", original);
  });
});
