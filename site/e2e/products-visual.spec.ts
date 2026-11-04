import { expect, test } from "@playwright/test";

test.describe("Products visual and responsive QA", () => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 720 }]) {
    test(`Products at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/products");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Four specialised products");
      await expect(page.getByText("NEXUS", { exact: true })).toBeVisible();
      await expect(page.getByText("Governed data access", { exact: true })).toBeVisible();
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth).toBeLessThanOrEqual(viewport.width + 1);
      const showcase = page.getByRole("group", { name: "Choose a product experience" });
      for (const name of ["Aksh Health", "ISI Research", "HSI Clinical", "HSI Trials"]) {
        const button = showcase.getByRole("button", { name: new RegExp(name) });
        await button.click();
        await expect(button).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator(".hsi-products-showcase-stage")).toContainText("Human decision boundary");
        await expect(page.locator(".hsi-products-showcase-stage .hsi-products-experience")).toBeVisible();
      }
      await expect(page.getByText("Concept visual", { exact: false }).first()).toBeVisible();
    });
  }
  test("product tabs are keyboard operable", async ({ page }) => {
    await page.goto("/products");
    const tabs = page.getByRole("group", { name: "Choose a product experience" });
    const aksh = tabs.getByRole("button", { name: /Aksh Health/ });
    await aksh.focus();
    await page.keyboard.press("Enter");
    await expect(aksh).toHaveAttribute("aria-pressed", "true");
  });
});
