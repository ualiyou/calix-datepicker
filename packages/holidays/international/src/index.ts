import type { Holiday } from "@alydev/core";

/** Fixed international observances from 2000 through 2100, using local JS dates. */
export const internationalHolidays: readonly Holiday[] = Array.from(
  { length: 101 },
  (_, index) => 2000 + index,
).flatMap((year) => [
  { date: new Date(year, 0, 1), name: "New Year's Day" },
  { date: new Date(year, 11, 25), name: "Christmas Day" },
]);
