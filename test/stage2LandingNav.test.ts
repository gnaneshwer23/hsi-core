import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AUDIENCE_NAV_LINKS,
  PRIMARY_NAV_CTA,
  PRIMARY_NAV_LINKS,
  isAudienceNavActive,
} from "../site/src/lib/primaryNav";

const root = (...p: string[]) => readFileSync(resolve(import.meta.dir, "..", ...p), "utf8");

describe("Stage 2 landing design system + nav", () => {
  it("ships Stage 2 token JSON and CSS aligned to craft-bar brief", () => {
    const tokens = JSON.parse(root("docs/design/hsi-stage2-landing-tokens.v1.json")) as {
      schemaVersion: string;
      palette: Record<string, { hex: string }>;
      marketingHeadline: string;
    };
    expect(tokens.schemaVersion).toBe("hsi-stage2-landing-tokens-1");
    expect(tokens.marketingHeadline).toContain("better question");
    const css = root("site/src/styles/cinematic.css");
    expect(css).toContain("#000310");
    expect(css).toContain("#C52076");
    expect(css).toContain("#2396AC");
    expect(root("site/src/main.tsx")).toContain("cinematic.css");
  });

  it("exposes audience destinations without retired path strings in primaryNav", () => {
    expect(PRIMARY_NAV_LINKS.map(l=>l.label)).toEqual(["Home", "How It Works", "Knowledge Graph", "For Researchers", "Community"]);
    expect(PRIMARY_NAV_CTA).toEqual({ to: "/sign-up", label: "Create account" });
    expect(AUDIENCE_NAV_LINKS.map((l) => l.to)).toEqual([
      "/solutions#researchers",
      "/solutions#research-groups",
      "/solutions#biotech",
      "/solutions#clinical",
      "/solutions#laboratories",
      "/solutions#community",
    ]);
    const primaryNav = root("site/src/lib/primaryNav.ts");
    for (const retired of ['"/platform"', '"/solutions"', '"/pricing"', '"/science"', '"/technology"']) {
      expect(primaryNav).not.toContain(retired);
    }
    expect(isAudienceNavActive("/how-it-works")).toBe(false);
  });

  it("wires Nav/Footer for shared Stage 2 chrome", () => {
    const nav = root("site/src/components/Nav.tsx");
    expect(nav).not.toContain("AUDIENCE_NAV_LINKS");
    expect(nav).toContain("aria-expanded");
    expect(nav).not.toContain("audience-pages");
    const footer = root("site/src/components/Footer.tsx");
    expect(footer).toContain("/solutions#researchers");
    expect(footer).toContain("/trust#validation");
    expect(footer).not.toContain("Pricing & Access");
    expect(root("docs/design/HSI_STAGE2_PUBLIC_LANDING_INVENTORY_2026-11-19.md")).toContain("PR 1");
  });
});
