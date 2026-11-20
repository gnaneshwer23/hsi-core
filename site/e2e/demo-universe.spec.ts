import { test, expect } from "@playwright/test";

test("demo universe comparison UI loads six scenarios and shows abstention", async ({ page }) => {
  await page.goto("/demo/universe");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("status").first()).toContainText(/Production write:\s*false/i);
  const scenarioButtons = page.locator(".du-scenario-list button");
  await expect(scenarioButtons).toHaveCount(6);
  await expect(page.getByRole("heading", { name: "Conflicting findings" })).toBeVisible();
  await expect(page.locator(".du-abstention")).toContainText(/Abstention/i);
  await expect(page.getByRole("heading", { name: "Reviewable research brief" })).toBeVisible();
  await expect(page.locator(".du-brief-limitations li").first()).toBeVisible();

  await scenarioButtons.nth(1).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Cytokine|inflammation/i);
  await expect(page.locator("#main-content")).toContainText("DEMO-INV-002");
  await expect(page.locator("#main-content")).not.toContainText(/clinically validated|subscribe now/i);
});
