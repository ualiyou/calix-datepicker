import { describe, expect, it } from "vitest";
import { iranHolidayRecords, iranHolidays } from "./index.js";

describe("iranHolidays", () => {
  it("covers 1400 through 1420 without duplicate exported dates", () => {
    const years = iranHolidayRecords.map(([year]) => year);
    expect(Math.min(...years)).toBe(1400);
    expect(Math.max(...years)).toBe(1420);
    expect(new Set(iranHolidays.map((holiday) => holiday.date.getTime())).size).toBe(
      iranHolidays.length,
    );
  });

  it("contains known Nowruz and Ashura entries", () => {
    expect(iranHolidays).toContainEqual({ date: new Date(2021, 2, 21), name: "عید نوروز" });
    expect(iranHolidayRecords).toContainEqual([1400, 5, 27, "عاشورای حسینی"]);
  });
});
