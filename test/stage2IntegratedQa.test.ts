import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AUDIENCE_NAV_LINKS,
  PRIMARY_NAV_CTA,
  PUBLIC_MARKETING_PATHS,
} from "../site/src/lib/primaryNav";
import { SEO_PAGES } from "../site/src/lib/seo/siteSeo";

const root = (...p: string[]) => readFileSync(resolve(import.meta.dir, "..", ...p), "utf8");

const STAGE2_SURFACES = [
  "site/src/pages/HomeLanding.tsx",
  "site/src/pages/HowItWorksPage.tsx",
  "site/src/pages/AudiencePublicPages.tsx",
  "site/src/pages/EnterpriseLanding.tsx",
  "site/src/pages/ContactPublic.tsx",
] as const;

/** Promotional claim shapes — honesty denials that quote the banned phrase are allowed in copy. */
const FORBIDDEN =
  /clinically validated|clinically proven|scientifically validated|\$\d|£\d|per seat\/month|subscribe now|join thousands|members worldwide|120 expert-adjudicated results|\d{2,}% accuracy/i;

describe("Stage 2 integrated QA locks", () => {
  it("keeps PUBLIC_MARKETING_PATHS identical to indexed SEO_PAGES", () => {
    const marketing = ([...PUBLIC_MARKETING_PATHS] as string[]).sort();
    const seo = Object.keys(SEO_PAGES).sort();
    expect(marketing).toEqual(seo);
    expect(marketing).toHaveLength(12);
    expect(PRIMARY_NAV_CTA).toEqual({ to: "/sign-up", label: "Create account" });
  });

  it("indexes every audience destination and lists it in the footer", () => {
    const footer = root("site/src/components/Footer.tsx");
    const app = root("site/src/App.tsx");
    expect(AUDIENCE_NAV_LINKS.map((l) => l.to)).toEqual([
      "/researchers",
      "/enterprise",
      "/biotech",
      "/clinical",
      "/laboratories",
      "/research-community",
    ]);
    for (const link of AUDIENCE_NAV_LINKS) {
      expect(PUBLIC_MARKETING_PATHS).toContain(link.to);
      expect(Object.hasOwn(SEO_PAGES, link.to)).toBe(true);
      expect(footer).toContain(`"${link.to}"`);
      // Audience destinations are never the site root.
      expect(app).toContain(`path="${link.to.slice(1)}"`);
    }
  });

  it("ships vercel page rewrites for every non-root marketing path", () => {
    const vercel = JSON.parse(root("site/vercel.json")) as {
      rewrites: { source: string; destination: string }[];
    };
    const rewrites = new Set(
      vercel.rewrites
        .filter((r) => r.destination?.startsWith("/_pages/"))
        .map((r) => r.source),
    );
    for (const path of PUBLIC_MARKETING_PATHS) {
      if (path === "/") continue;
      expect(rewrites.has(path)).toBe(true);
    }
    expect(rewrites.has("/research-community")).toBe(true);
    expect(rewrites.has("/clinical")).toBe(true);
    expect(rewrites.has("/laboratories")).toBe(true);
  });

  it("keeps Stage 2 marketing surfaces free of forbidden claim patterns", () => {
    for (const file of STAGE2_SURFACES) {
      const text = root(file);
      expect(FORBIDDEN.test(text), `${file} matched forbidden marketing claim`).toBe(false);
    }
  });

  it("preserves hero secondary CTA contrast rules and QA inventory", () => {
    const css = root("site/src/styles/stage2-landing.css");
    expect(css).toContain(".s2-hero .s2-btn-secondary");
    // Light craft-bar hero: secondary CTA uses navy ink on white, not off-white on dark.
    expect(css).toContain("color: var(--s2-ink)");
    expect(css).toContain(".s2-maturity");
    expect(css).toContain("color: var(--s2-indigo-ink)");
    const qa = root("docs/design/HSI_STAGE2_INTEGRATED_QA_2026-11-19.md");
    expect(qa).toContain("Owner visual review");
    expect(qa).toContain("cursor/stage2-integrated-qa-2f71");
    expect(qa).toContain("Do not merge or deploy");
  });
});
