import { bench, describe } from "vitest";
import { generateMonthGrid } from "./grid.js";
import { mockAdapter } from "./test/mock-adapter.js";

describe("month grid generation", () => {
  bench("generate 120 months (10 years)", () => {
    for (let i = 0; i < 120; i++) {
      const month = (i % 12) + 1;
      const year = 2020 + Math.floor(i / 12);
      generateMonthGrid(mockAdapter, { year, month }, { weekStartsOn: 0 });
    }
  });
});
