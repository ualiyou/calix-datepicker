import { internationalHolidays } from "./index.js";

describe("internationalHolidays", () => {
  it("covers New Year's Day and Christmas from 2000 through 2100", () => {
    expect(internationalHolidays).toContainEqual({
      date: new Date(2000, 0, 1),
      name: "New Year's Day",
    });
    expect(internationalHolidays).toContainEqual({
      date: new Date(2100, 11, 25),
      name: "Christmas Day",
    });
  });

  it("does not contain duplicate dates", () => {
    expect(new Set(internationalHolidays.map((holiday) => holiday.date.getTime())).size).toBe(
      internationalHolidays.length,
    );
  });
});
