import { test, expect } from "@playwright/test";

test("homepage Demo Universe landing preview shows six pack-backed scenarios", async ({
  page,
}) => {
  await page.goto("/#product-demo");
  const preview = page.locator(".hsi-demo-landing-preview");
  await expect(preview).toBeVisible();
  await expect(preview.getByRole("status")).toContainText(/Pack-backed conflict pairs/i);
  await expect(preview.getByRole("status")).toContainText(/production write:\s*false/i);
  const tabs = preview.getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await expect(preview.getByRole("heading", { level: 3 })).toBeVisible();
  await expect(preview.getByText(/Abstention:/i)).toBeVisible();
  await tabs.nth(1).click();
  await expect(preview.getByRole("link", { name: /Open full comparison desk/i })).toHaveAttribute(
    "href",
    /\/demo\/universe\?scenario=/,
  );
  await expect(preview).not.toContainText(/clinically validated|subscribe now/i);
});
