import { expect, test } from "@playwright/test";

test("a researcher can walk the demo investigation without an account", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/research/investigate");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Start an investigation");
  await expect(page.getByText("Demo environment", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /gut microbial metabolites/i }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Evidence" })).toBeVisible();
  await expect(page.getByText("Verified evidence", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Uncertain association").first()).toBeVisible();
  await expect(page.getByText("Computational inference").first()).toBeVisible();
  await expect(page.getByText("Unvalidated hypothesis").first()).toBeVisible();
  for (const label of ["Biological relationships", "Evidence comparison", "Contradictions", "Research gaps", "Testable hypotheses", "Human review", "Research report", "Save and export"]) {
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
  }
  await page.getByRole("button", { name: "Save to my workspace" }).click();
  await expect(page.getByRole("status")).toContainText("Sign in to save");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain(".json");
});

test("the investigation stays usable on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/research/investigate");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
