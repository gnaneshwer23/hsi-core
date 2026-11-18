import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  ONE_HOP_MARKETING_REDIRECTS,
  RETIRED_MARKETING_REDIRECTS,
  REVIEWER_TOOL_PATHS,
  assertSiteRouteCatalogSoftLand,
  buildSiteRouteCatalog,
  classifySiteRoute,
  parseAppRoutes,
} from "../site/src/lib/siteRouteCatalog";

const appPath = join(import.meta.dir, "../site/src/App.tsx");
const appSource = readFileSync(appPath, "utf8");

describe("site route catalog (WB-07 soft-land)", () => {
  test("parses App.tsx and keeps honesty flags false", () => {
    const catalog = buildSiteRouteCatalog(appSource);
    const summary = assertSiteRouteCatalogSoftLand(catalog);
    expect(summary.routeCountHalved).toBe(false);
    expect(summary.entryCount).toBeGreaterThan(90);
    expect(summary.redirectCount).toBeGreaterThan(40);
    expect(summary.legacyDebtCount).toBeGreaterThan(0);
    expect(catalog.wb07Accepted).toBe(false);
    expect(catalog.d60Decided).toBe(false);
    expect(catalog.inventedDestinations).toBe(false);
  });

  test("reviewer tools stay mounted and classified", () => {
    for (const path of REVIEWER_TOOL_PATHS) {
      const entry = classifySiteRoute(path);
      expect(entry.bucket).toBe("reviewer_tool");
      expect(entry.isRedirect).toBe(false);
      expect(entry.proposedAction).toBe("keep");
    }
  });

  test("one-hop marketing aliases target existing how-it-works", () => {
    for (const [from, to] of ONE_HOP_MARKETING_REDIRECTS) {
      expect(to).toBe("/how-it-works");
      expect(appSource).toContain(`path="${from.slice(1)}"`);
      expect(appSource).toContain(`Navigate to="${to}"`);
      expect(appSource).not.toMatch(
        new RegExp(`path="${from.slice(1)}"\\s+element=\\{<Navigate to="/connected-intelligence"`),
      );
    }
  });

  test("retired marketing list matches App Navigate destinations", () => {
    const parsed = parseAppRoutes(appSource);
    for (const [from, to] of RETIRED_MARKETING_REDIRECTS) {
      if (from.startsWith("/intelligence/") && from !== "/intelligence/nexus") continue;
      const row = parsed.find((r) => r.path === from);
      expect(row?.isRedirect, from).toBe(true);
      expect(row?.destination, from).toBe(to);
    }
  });

  test("soft-land doc states non-claims", () => {
    const doc = readFileSync(
      join(import.meta.dir, "../docs/engineering/WB_07_ROUTE_LEGACY_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("WB-07");
    expect(doc).toContain("routeCountHalved");
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("owner_D60");
  });
});
