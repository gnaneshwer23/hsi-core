import {expect, test} from "@playwright/test";

test("curator workspace links D-01 sheets without claiming promotion", async ({page}) => {
  await page.goto("/curator");
  const sheets = page.getByLabel("D-01 curator sheets");
  await expect(sheets.getByRole("heading", {name: "Curator sheets"})).toBeVisible();
  await expect(sheets.getByRole("note")).toContainText("autoPromotion=false");
  await expect(sheets.getByRole("note")).toContainText("graphPromotion=false");
  await sheets.getByRole("link", {name: "Context completion fill progress"}).click();
  await expect(page).toHaveURL(/\/research\/context-completion/);
  await expect(page.getByRole("heading", {level: 1})).toContainText("D-01 context completion");
  await expect(page.getByText(/never promotes relationships/i)).toBeVisible();
  await page.getByRole("link", {name: "D-01 edge review"}).click();
  await expect(page).toHaveURL(/\/research\/d01-edge-review/);
  await expect(page.getByRole("heading", {name: "D-01 edge review", level: 1})).toBeVisible();
  await expect(page.getByRole("note")).toContainText("not graph promotions");
  await page.getByRole("link", {name: "Curator workspace"}).click();
  await expect(page).toHaveURL(/\/curator/);
});
