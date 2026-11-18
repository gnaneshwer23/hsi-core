import {expect, test} from "@playwright/test";

test("domain graph legend distinguishes reviewed vs candidate without claiming reviews", async ({page}) => {
  await page.goto("/research/knowledge-graph?experience=advanced");
  await expect(page.getByRole("heading", {level: 1})).toContainText("Follow the connection");
  const legend = page.getByLabel("Graph legend");
  await expect(legend.getByText("Source candidate (unreviewed)")).toBeVisible();
  await expect(legend.getByText("Reviewed (reserved)")).toBeVisible();
  await expect(legend.getByText("Evidence gap")).toBeVisible();
  const honesty = page.getByLabel("Review styling honesty");
  await expect(honesty).toContainText("Reviewed relationships: 0");
  await expect(honesty).toContainText("source candidates remain unreviewed");
  await expect(honesty).toContainText("nothing here is promoted");
  await expect(page.getByText(/Solid teal: unreviewed source candidates/i)).toBeVisible();
  // Live edges carry the candidate lane attribute, never a forged reviewed paint.
  await expect(page.locator("[data-graph-edge]").first()).toHaveAttribute(
    "data-review-lane",
    "candidate_unreviewed",
  );
});
