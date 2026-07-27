import { describe, expect, it } from "vitest";
import { formatTokens, parseTokens, type FormatContext } from "./format.js";
import { toLatinDigits, toLocaleDigits, directionForLocale } from "./locale.js";

const ctx: FormatContext = {
  monthNamesLong: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  monthNamesShort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  weekdayNamesLong: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  weekdayNamesShort: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
  weekday: 5,
  locale: "en-US",
};

describe("formatTokens", () => {
  const date = { year: 2026, month: 7, day: 3 };
  it("formats numeric patterns with padding", () => {
    expect(formatTokens(date, undefined, "yyyy/MM/dd", ctx)).toBe("2026/07/03");
    expect(formatTokens(date, undefined, "d/M/yy", ctx)).toBe("3/7/26");
  });
  it("formats named months and weekdays", () => {
    expect(formatTokens(date, undefined, "EEEE, d MMMM yyyy", ctx)).toBe("Friday, 3 July 2026");
    expect(formatTokens(date, undefined, "EEE d MMM", ctx)).toBe("Fri 3 Jul");
  });
  it("formats time with meridiem", () => {
    const t = { hour: 14, minute: 5, second: 9, millisecond: 0 };
    expect(formatTokens(date, t, "HH:mm:ss", ctx)).toBe("14:05:09");
    expect(formatTokens(date, t, "hh:mm a", ctx)).toBe("02:05 PM");
  });
  it("passes quoted literals through", () => {
    expect(formatTokens(date, undefined, "yyyy 'at' MM", ctx)).toBe("2026 at 07");
  });
  it("localizes digits for fa-IR", () => {
    expect(formatTokens(date, undefined, "yyyy/MM/dd", { ...ctx, locale: "fa-IR" })).toBe(
      "۲۰۲۶/۰۷/۰۳",
    );
  });
});

describe("parseTokens", () => {
  it("parses numeric patterns", () => {
    expect(parseTokens("2026/07/03", "yyyy/MM/dd", ctx)).toEqual({ year: 2026, month: 7, day: 3 });
    expect(parseTokens("3/7/2026", "d/M/yyyy", ctx)).toEqual({ year: 2026, month: 7, day: 3 });
  });
  it("parses named months case-insensitively", () => {
    expect(parseTokens("3 july 2026", "d MMMM yyyy", ctx)).toEqual({ year: 2026, month: 7, day: 3 });
  });
  it("normalizes Persian digits before parsing", () => {
    expect(parseTokens("۲۰۲۶/۰۷/۰۳", "yyyy/MM/dd", ctx)).toEqual({ year: 2026, month: 7, day: 3 });
  });
  it("returns null on mismatch", () => {
    expect(parseTokens("not-a-date", "yyyy/MM/dd", ctx)).toBeNull();
    expect(parseTokens("2026-07-03", "yyyy/MM/dd", ctx)).toBeNull();
  });
});

describe("locale helpers", () => {
  it("round-trips digits", () => {
    expect(toLocaleDigits("2026", "fa-IR")).toBe("۲۰۲۶");
    expect(toLatinDigits("۲۰۲۶")).toBe("2026");
    expect(toLocaleDigits("2026", "en-US")).toBe("2026");
  });
  it("detects direction", () => {
    expect(directionForLocale("fa-IR")).toBe("rtl");
    expect(directionForLocale("ar")).toBe("rtl");
    expect(directionForLocale("en-US")).toBe("ltr");
  });
});
