import { describe, expect, it } from "vitest";
import { createCode } from "./Playground";

const base = {
  calendar: "gregorian",
  view: "datepicker",
  mode: "single",
  theme: "dark",
  numberOfMonths: 1,
  weekStartsOn: "auto",
  fixedWeeks: true,
  businessDaysOnly: false,
  holidaySource: "none",
  showHolidays: false,
  holidaysSelectable: true,
  showToday: true,
  max: 0,
  withTime: false,
  timeVariant: "wheel",
  hourCycle: 24,
  outputFormat: "string",
  placeholder: "Select date",
  labels: false,
  weekdays: "Su, Mo, Tu, We, Th, Fr, Sa",
  previousMonth: "Previous month",
  nextMonth: "Next month",
} as const;

describe("createCode", () => {
  it("keeps imports aligned with the selected playground options", () => {
    const jalali = createCode({ ...base, calendar: "jalali" });
    const holidays = createCode({
      ...base,
      holidaySource: "iran",
      showHolidays: true,
    });
    const time = createCode({ ...base, view: "timepicker" });

    expect(jalali).toContain('import { jalali } from "@alydev/adapter-jalali";');
    expect(holidays).toContain('import { iranHolidays } from "@alydev/holidays-iran";');
    expect(time).toContain('import { TimePicker } from "@alydev/datepicker";');
    expect(time).not.toContain("@alydev/adapter-");
    expect(jalali).toContain("export default function Example()");
  });
});
