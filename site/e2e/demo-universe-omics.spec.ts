import { test, expect } from "@playwright/test";

test("demo universe shows synthetic cohort withholding for comparative disease", async ({
  page,
}) => {
  await page.goto("/demo/universe?scenario=comparative-disease-mechanisms");
  await expect(page.getByRole("heading", { name: /Omics, assays/i })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /real cohort data:\s*false/i })).toBeVisible();
  await expect(page.locator("#main-content")).toContainText(/matched:\s*withheld/i);
  await expect(page.locator("#main-content")).toContainText(/dataClass=synthetic/);
  await expect(page.locator("#main-content")).not.toContainText(/patient_id|NHS number/i);
});
