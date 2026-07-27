import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Calix playground accessibility", () => {
  test("has no detectable axe violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(400); // Let the calendar's entry animation reach its final contrast.
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("calendar grid is keyboard navigable", async ({ page }) => {
    await page.goto("/");
    const grid = page.getByRole("grid").first();
    await expect(grid).toBeVisible();
    const focusable = grid.getByRole("gridcell").and(page.locator('[tabindex="0"]')).first();
    await focusable.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    // A day should now be selected.
    await expect(grid.locator("[data-selected]").first()).toBeVisible();
  });

  test("popup opens and closes with the keyboard", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("combobox").first();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
