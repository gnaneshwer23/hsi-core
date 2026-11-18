import {expect, test} from "@playwright/test";

const open = async (page: import("@playwright/test").Page) => {
  await page.goto("/research/d01-edge-review");
  await expect(page.getByRole("heading", {name: "D-01 edge review", level: 1})).toBeVisible();
};

test.describe("D-01 edge review", () => {
  test("states plainly that recommendations are not graph promotions", async ({page}) => {
    await open(page);
    await expect(page.getByRole("note")).toContainText("not graph promotions");
    await expect(page.getByRole("note")).toContainText("scientificClaimAllowed stays false");
    await expect(page.getByText(/of \d+ reviewed/)).toBeVisible();
  });

  test("decisions need a reviewer label and a reason; identifying text is refused", async ({page}) => {
    await open(page);
    const first = page.getByRole("article").first();
    await expect(first.getByRole("button", {name: "Recommend accepting"})).toBeDisabled();
    await page.getByLabel("Reviewer label").fill("Curator A");
    await first.getByRole("button", {name: "Recommend accepting"}).click();
    await expect(first.getByRole("alert")).toContainText("reason");
    await first.getByLabel("Reason for your recommendation").fill("Call 943 476 5919 about this one");
    await first.getByRole("button", {name: "Recommend accepting"}).click();
    await expect(first.getByRole("alert")).toContainText("identifiers");
  });

  test("records a recommendation on this device without claiming promotion", async ({page}) => {
    await open(page);
    await page.getByLabel("Reviewer label").fill("Curator A");
    const first = page.getByRole("article").first();
    await first.getByLabel("Reason for your recommendation").fill("Source and context support keeping this candidate.");
    await first.getByRole("button", {name: "Recommend accepting"}).click();
    await expect(page.getByRole("status").first()).toContainText("recorded on this device");
    await expect(page.getByRole("status").first()).toContainText("published graph is unchanged");
    await expect(page.getByText(/\b1\b of \d+ reviewed/)).toBeVisible();
    await page.reload();
    await page.getByRole("button", {name: "Reviewed", exact: true}).click();
    await expect(page.getByRole("article").first()).toContainText("Recommended for acceptance");
    await expect(page.getByRole("article").first()).toContainText("graphPromotion=false");
  });
});
