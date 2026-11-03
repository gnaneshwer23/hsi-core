import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
const platform = readFileSync(new URL("../site/src/pages/Platform.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../site/src/styles/platform.css", import.meta.url), "utf8");
describe("Platform architecture experience", () => {
  it("explains all four governed knowledge graph domains", () => {
    for (const title of ["Patient context", "Human biology", "Gut–immune–metabolic", "Biomedical evidence"])
      expect(platform).toContain(title);
    expect(platform).toContain("not a single shared database");
    expect(platform).toContain("not copied into the public biomedical graph");
  });
  it("distinguishes SSc curation from existing RA working set", () => {
    expect(platform).toContain("Curation pending");
    expect(platform).toContain("Research working set");
    expect(platform).toContain("One track cannot approve findings in the other");
  });
  it("offers functional state-driven selectors and accessible detail updates", () => {
    expect(platform).toContain("setGraphDomain(index)");
    expect(platform).toContain("setResearchTrack(id)");
    expect(platform).toContain("setIntelligenceStage(index)");
    expect(platform).toContain('aria-pressed={graphDomain === index}');
    expect(platform).toContain('aria-live="polite"');
  });
  it("keeps evidence and governance boundaries visible", () => {
    expect(platform).toContain("hypotheses remain separate from approved findings");
    expect(platform).toContain("not live patient or research data");
    expect(css).toContain("focus-visible");
    expect(css).toContain("max-width:600px");
  });
});
