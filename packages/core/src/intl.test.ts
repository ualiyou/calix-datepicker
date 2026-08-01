import { describe, expect, it } from "vitest";
import { eraNames, monthNamesFromDates, weekdayNames } from "./intl.js";

describe("Intl name helpers", () => {
  it("returns ordered localized weekday names", () => {
    const names = weekdayNames("en-US", "short");
    expect(names).toHaveLength(7);
    expect(names[0]).toBe("Sun");
    expect(names[6]).toBe("Sat");
    expect(weekdayNames("en-US", "narrow", "gregory")).toHaveLength(7);
  });

  it("formats representative dates as month names", () => {
    expect(monthNamesFromDates([new Date(2026, 0, 15), new Date(2026, 1, 15)], "en-US", "long")).toEqual([
      "January",
      "February",
    ]);
    expect(monthNamesFromDates([new Date(2026, 0, 15)], "en-US", "short", "gregory")).toEqual([
      "Jan",
    ]);
  });

  it("returns both era labels", () => {
    expect(eraNames("en-US")).toHaveLength(2);
    expect(eraNames("en-US", "gregory")).toHaveLength(2);
    expect(eraNames("en-US", "gregory").every(Boolean)).toBe(true);
  });
});
