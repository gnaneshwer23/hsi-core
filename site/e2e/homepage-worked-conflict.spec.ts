import {test,expect} from "@playwright/test";

test("homepage worked conflict shows sealed DIAB pair with unreviewed honesty", async ({page}) => {
  await page.goto("/");
  const section = page.getByRole("region", {name: "One worked conflict"});
  await expect(section.getByRole("heading", {name: "One worked conflict", exact: true})).toBeVisible();
  await expect(section).toContainText("DIAB-003");
  await expect(section).toContainText("DIAB-015");
  await expect(section).toContainText("confirmed contradiction: false");
  await expect(section).toContainText("reviewed edges: 0");
  await expect(section).toContainText("Unreviewed candidates");
  await expect(section.getByRole("link", {name: /Open this comparison/})).toBeVisible();
});
