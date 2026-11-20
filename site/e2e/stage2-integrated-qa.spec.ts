import { test, expect } from "@playwright/test";
import { PUBLIC_MARKETING_PATHS } from "../src/lib/primaryNav";

const FORBIDDEN =
  /clinically validated|clinically proven|scientifically validated|outperforms|better than|\$\d|£\d|per seat\/month|subscribe now|join thousands|members worldwide/i;

test("Stage 2 public pages: one h1, Get Access chrome, honesty, no overflow at 390px", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of PUBLIC_MARKETING_PATHS) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    // Desktop Primary nav is display:none below 1151px; assert mobile chrome instead.
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Get Access", exact: true }).first()).toHaveAttribute(
      "href",
      "/contact",
    );
    const body = page.locator("#main-content");
    await expect(body).not.toContainText(FORBIDDEN);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      path,
    ).toBe(true);
  }
});

test("Stage 2 audience menu lists the six indexed destinations", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Audiences", exact: true }).click();
  const menu = page.locator("#audience-pages");
  await expect(menu).toBeVisible();
  for (const [href, name] of [
    ["/researchers", "Researchers"],
    ["/enterprise", "Research Groups"],
    ["/biotech", "Biotech & Pharma"],
    ["/clinical", "Clinical Research"],
    ["/laboratories", "Laboratories"],
    ["/research-community", "Research Community"],
  ] as const) {
    // NavLink uses role="menuitem"; accessible name includes the <small> note.
    await expect(menu.getByRole("menuitem", { name: new RegExp(`^${name}`) })).toHaveAttribute(
      "href",
      href,
    );
  }
});
