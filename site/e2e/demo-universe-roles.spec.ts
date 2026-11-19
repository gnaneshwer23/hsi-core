import { test, expect } from "@playwright/test";

test("lab dashboard exposes Demo Universe role panel deep-links", async ({ page }) => {
  await page.goto("/enterprise/lab");
  await expect(page.getByRole("heading", { name: "Demo Research Universe" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /catalog duplication:\s*false/i })).toBeVisible();
  const link = page.getByRole("link", { name: /scRNA-seq cluster labels/i });
  await expect(link).toHaveAttribute("href", /\/demo\/universe\?scenario=single-cell-omics/);
  await link.click();
  await expect(page).toHaveURL(/\/demo\/universe\?scenario=single-cell-omics/);
  await expect(page.locator(".du-scenario-list button[aria-pressed='true']")).toContainText(
    /scRNA-seq/i,
  );
});
