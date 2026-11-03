import { test, expect } from "@playwright/test";

test("compare claims and export the selected cited draft", async ({ page }) => {
  await page.goto("/discovery");
  await page.getByRole("tab", { name: /02 \/ MAP/ }).click();
  const panel = page.getByRole("region", { name: "Compare evidence. Prepare a research brief." });
  const boxes = panel.getByRole("checkbox");
  const download = panel.getByRole("button", { name: "Download cited brief (.md)" });
  await expect(download).toBeDisabled();
  await boxes.nth(0).check();
  await expect(download).toBeDisabled();
  await boxes.nth(1).check();
  await expect(download).toBeEnabled();
  await boxes.nth(2).check();
  await boxes.nth(3).check();
  await expect(boxes.nth(4)).toBeDisabled();
  const [file] = await Promise.all([page.waitForEvent("download"), download.click()]);
  expect(file.suggestedFilename()).toBe("hsi-research-comparison.md");
  const stream = await file.createReadStream();
  let contents = "";
  for await (const chunk of stream!) contents += chunk.toString();
  expect(contents).toContain("Not independently verified");
  expect(contents).toContain("https://pubmed.ncbi.nlm.nih.gov/");
  expect(contents.match(/^### /gm)).toHaveLength(4);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("source registry rejects tampered imported metadata", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/sources");
  await expect(page.locator("main article")).toHaveCount(63);
  await page.route("**/research/source-registry.json", (route) => route.fulfill({ json: {
    schemaVersion: "hsi-source-registry-1", notCds: true, containsPhi: false, claimSupport: "not_assessed",
    sources: [{ id: "pmid:11244034", pmid: "11244034", claimIds: ["HSI-C-IM-002"], revisions: [{
      id: "0".repeat(64), provider: "manual_metadata", retrievedAt: "2026-11-02T12:00:00.000Z",
      metadata: { title: "Tampered test fixture", doi: null, publishedAt: null, licence: null, retractionStatus: "not_checked" },
    }] }],
  } }));
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("Source registry unavailable");
  await expect(page.locator("main article")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("unknown client route has a recovery view", async ({ page }) => {
  await page.goto("/unknown-test-destination");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Open research workspace" }).click();
  await expect(page).toHaveURL(/\/discovery$/);
});
