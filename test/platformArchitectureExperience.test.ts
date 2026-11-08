import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
const platform = readFileSync(new URL("../site/src/pages/Platform.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../site/src/styles/editorial-site.css", import.meta.url), "utf8");
describe("Platform architecture experience", () => {
  it("presents an HSI-only research workflow without catalogue product lenses", () => {
    for (const name of ["Investigate", "Connect", "Evaluate", "Translate", "Decide"]) {
      expect(platform).toContain(name);
    }
    expect(platform).not.toContain("aksh:");
    expect(platform).not.toContain("Aksh Health");
    expect(platform).not.toContain("Immune Super Intelligence");
    expect(platform).toContain("Authorised tools remain behind separately provisioned access");
  });
  it("keeps provenance, uncertainty and human review explicit", () => {
    expect(platform).toContain("source provenance");
    expect(platform).toContain("uncertainty and human review kept visible");
    expect(platform).toContain("never presented as independently proven");
    expect(platform).toContain("Capabilities still under validation are labelled as such");
  });
  it("uses editorial landing visuals rather than interactive product lenses", () => {
    expect(platform).toContain("LandingVisual");
    expect(platform).toContain('kind="knowledge"');
    expect(platform).not.toContain("setProductId");
    expect(platform).not.toContain("setLensIndex");
    expect(platform).not.toContain("ECOSYSTEM_PRODUCTS");
  });
  it("preserves responsive editorial focus styling", () => {
    expect(platform).toContain("to=\"/evidence-safety\"");
    expect(platform).toContain("to=\"/biology\"");
    expect(css).toContain("@media");
    expect(css).toContain("focus-visible");
  });
});
