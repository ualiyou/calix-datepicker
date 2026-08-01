import { describe, expect, it } from "vitest";
import { gregorian } from "@alydev/adapter-gregorian";
import { emptyPublicValue, formatCalixValue, toInternalValue, toPublicValue } from "./value.js";

const first = new Date(2026, 6, 3, 9, 5, 2);
const second = new Date(2026, 6, 5, 10, 6, 3);

describe("public values", () => {
  it("formats empty, single, multiple, and range values", () => {
    expect(formatCalixValue(null, gregorian, "en-US", "yyyy-MM-dd")).toBe("");
    expect(formatCalixValue(first, gregorian, "en-US", "yyyy-MM-dd HH:mm:ss")).toBe("2026-07-03 09:05:02");
    expect(formatCalixValue([first, second], gregorian, "en-US", "yyyy-MM-dd")).toBe("2026-07-03, 2026-07-05");
    expect(formatCalixValue({ start: first, end: null }, gregorian, "en-US", "yyyy-MM-dd")).toBe("2026-07-03");
    expect(formatCalixValue({ start: first, end: second }, gregorian, "en-US", "yyyy-MM-dd")).toBe("2026-07-03 – 2026-07-05");
  });

  it("serializes every value shape to JSON", () => {
    expect(JSON.parse(formatCalixValue(null, gregorian, "en-US", "yyyy-MM-dd", "json"))).toMatchObject({ date: null });
    expect(JSON.parse(formatCalixValue(first, gregorian, "en-US", "yyyy-MM-dd", "json"))).toMatchObject({ date: "2026-07-03" });
    expect(JSON.parse(formatCalixValue([first], gregorian, "en-US", "yyyy-MM-dd", "json"))).toMatchObject({ dates: [{ date: "2026-07-03" }] });
    expect(JSON.parse(formatCalixValue({ start: null, end: second }, gregorian, "en-US", "yyyy-MM-dd", "json"))).toMatchObject({ start: null, end: { date: "2026-07-05" } });
  });

  it("converts values across the public boundary", () => {
    expect(toInternalValue("single", undefined, gregorian)).toBeNull();
    expect(toInternalValue("multiple", undefined, gregorian)).toEqual([]);
    expect(toInternalValue("multiple", [first], gregorian)).toEqual([{ year: 2026, month: 7, day: 3 }]);
    expect(toInternalValue("range", { start: first, end: null }, gregorian)).toEqual({ start: { year: 2026, month: 7, day: 3 }, end: null });
    expect(toPublicValue("single", { year: 2026, month: 7, day: 3 }, gregorian)).toEqual(new Date(2026, 6, 3));
    expect(toPublicValue("multiple", null, gregorian)).toEqual([]);
    expect(toPublicValue("range", null, gregorian)).toEqual({ start: null, end: null });
    expect(emptyPublicValue("single")).toBeNull();
    expect(emptyPublicValue("multiple")).toEqual([]);
    expect(emptyPublicValue("range")).toEqual({ start: null, end: null });
  });
});
