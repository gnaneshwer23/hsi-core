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
  it("ships Stage 2 token JSON and CSS aligned to navy/burgundy brief", () => {
    const tokens = JSON.parse(root("docs/design/hsi-stage2-landing-tokens.v1.json")) as {
      schemaVersion: string;
      palette: Record<string, { hex: string }>;
      marketingHeadline: string;
    };
    expect(tokens.schemaVersion).toBe("hsi-stage2-landing-tokens-1");
    expect(tokens.palette.primaryBackground.hex).toBe("#101D2A");
    expect(tokens.palette.burgundy.hex).toBe("#963E56");
    expect(tokens.palette.mutedTeal.hex).toBe("#427B79");
    expect(tokens.marketingHeadline).toContain("Connect the Science");
    const css = root("site/src/styles/stage2-landing.css");
    expect(css).toContain("--s2-bg: #101d2a");
    expect(css).toContain("--s2-burgundy: #963e56");
    expect(root("site/src/main.tsx")).toContain("stage2-landing.css");
  });

  it("exposes audience destinations without retired path strings in primaryNav", () => {
    expect(PRIMARY_NAV_LINKS.some((l) => l.label === "Platform" && l.to === "/how-it-works")).toBe(true);
    expect(PRIMARY_NAV_LINKS.some((l) => l.label === "Scientific Validation" && l.to === "/validation")).toBe(
      true,
    );
    expect(PRIMARY_NAV_CTA).toEqual({ to: "/contact", label: "Get Access" });
    expect(AUDIENCE_NAV_LINKS.map((l) => l.to)).toEqual([
      "/researchers",
      "/enterprise",
      "/biotech",
      "/enterprise/clinical",
      "/enterprise/lab",
      "/enterprise/community",
    ]);
    const primaryNav = root("site/src/lib/primaryNav.ts");
    for (const retired of ["/platform", "/solutions", "/pricing", "/science", "/technology"]) {
      expect(primaryNav).not.toContain(retired);
    }
    expect(isAudienceNavActive("/researchers")).toBe(true);
    expect(isAudienceNavActive("/enterprise/lab")).toBe(true);
    expect(isAudienceNavActive("/how-it-works")).toBe(false);
  });

  it("wires Nav/Footer/LandingPrimitives for shared Stage 2 chrome", () => {
    const nav = root("site/src/components/Nav.tsx");
    expect(nav).toContain("AUDIENCE_NAV_LINKS");
    expect(nav).toContain("Audiences");
    expect(nav).toContain("aria-expanded");
    expect(nav).toContain("audience-pages");
    const footer = root("site/src/components/Footer.tsx");
    expect(footer).toContain("/researchers");
    expect(footer).toContain("/validation");
    expect(footer).toContain("Pricing & Access");
    const primitives = root("site/src/components/landing/LandingPrimitives.tsx");
    expect(primitives).toContain("LandingMaturityLabel");
    expect(primitives).toContain("LandingHero");
    expect(primitives).toContain("demonstration");
    expect(root("docs/design/HSI_STAGE2_PUBLIC_LANDING_INVENTORY_2026-11-19.md")).toContain("PR 1");
  });
});
