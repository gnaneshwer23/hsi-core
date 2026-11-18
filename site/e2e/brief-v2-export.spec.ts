import {test, expect} from "@playwright/test";
import {readFile} from "node:fs/promises";

async function openOutcomes(page: import("@playwright/test").Page) {
  await page.goto("/research/knowledge-graph?experience=advanced");
  await expect(page.getByRole("heading", {name: "Connected research network", exact: true})).toBeVisible();
  await page.getByRole("button", {name: "Gut metabolites → islet autoimmunity → type 1 diabetes", exact: true}).click();
  await page.getByRole("tab", {name: "Research outcomes", exact: true}).click();
}

test("Brief v2 JSON export carries graph release id, review states and no approval", async ({page}) => {
  await openOutcomes(page);
  const event = page.waitForEvent("download");
  await page.getByRole("button", {name: "Export this research brief", exact: true}).click();
  const brief = JSON.parse(await readFile((await (await event).path())!, "utf8"));
  expect(brief.schemaVersion).toBe("hsi-domain-research-brief-2");
  expect(brief.briefVersion).toBe(2);
  expect(brief.graphReleaseId).toMatch(/^[a-f0-9]{64}$/);
  expect(brief.graphReleaseId).toBe(brief.graphVersion);
  expect(brief.scientificApproval).toBe(false);
  expect(brief.graphPromotable).toBe(false);
  expect(brief.reviewStates.reviewedEdgeCount).toBe(0);
  expect(brief.reviewStates.reviewed).toBe(0);
  expect(brief.reviewStates.unreviewed).toBeGreaterThan(0);
  expect(brief.runIds).toEqual([]);
  expect(brief.evidenceTable.schemaVersion).toBe("hsi-passport-evidence-table-1");
  expect(brief.conflictClasses[0]?.classification).toBe("context_comparison_required");
  expect(brief.conflictClasses[0]?.confirmedContradiction).toBe(false);
});

test("Brief v2 Markdown and print controls stay available without claiming approval", async ({page}) => {
  await openOutcomes(page);
  const mdEvent = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download Markdown brief v2", exact: true}).click();
  const md = await readFile((await (await mdEvent).path())!, "utf8");
  expect(md).toContain("# HSI Research Brief v2");
  expect(md).toContain("Reviewed edges in this brief: 0");
  expect(md).toContain("context_comparison_required");
  await expect(page.getByRole("button", {name: "Print brief v2", exact: true})).toBeVisible();
});
