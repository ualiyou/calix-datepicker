import { newDate } from "date-fns-jalali";
import type { Holiday } from "@alydev/core";
import { iranHolidayRecords } from "./data.js";

export { iranHolidayRecords, type IranHolidayRecord } from "./data.js";

const holidayKey = (year: number, month: number, day: number) => `${year}-${month}-${day}`;

/**
 * Iranian public holidays from 1400 through 1420, converted from their Jalali
 * dates to local JavaScript dates. Multiple observances on one day are combined.
 *
 * Lunar dates are a maintained table because official announcements can differ
 * from calculated dates; update the affected year's records when announced.
 */
export const iranHolidays: readonly Holiday[] = Array.from(
  iranHolidayRecords
    .reduce((holidays, [year, month, day, name]) => {
      const key = holidayKey(year, month, day);
      const current = holidays.get(key);
      holidays.set(key, {
        date: current?.date ?? newDate(year, month - 1, day),
        name: current ? `${current.name}، ${name}` : name,
      });
      return holidays;
    }, new Map<string, Holiday>())
    .values(),
);
