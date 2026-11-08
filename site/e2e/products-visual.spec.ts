import { expect, test } from "@playwright/test";

test.describe("HSI landing visuals", () => {
  test("platform and biology landings use reference imagery without legacy product catalogue", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/platform");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("One research environment");
    await expect(page.locator(".ed-landing-visual img").first()).toBeVisible();
    await expect(page.getByRole("main")).not.toContainText("Aksh Health");
    await expect(page.getByRole("main")).not.toContainText("Immune Super Intelligence");

    await page.goto("/biology");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("interconnected biological system");
    await expect(page.getByRole("link", { name: /Explore the Biology Graph/ }).first()).toHaveAttribute("href", "/science/graph");
  });

  test("legacy products URL redirects to platform", async ({ page }) => {
    await page.goto("/products");
    await expect(page).toHaveURL(/platform$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("One research environment");
  });
});
