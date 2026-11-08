import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
describe("HSI technology architecture page", () => {
  const page = read("../site/src/pages/Technology.tsx");
  it("is accessible from a dedicated public route outside primary nav", () => {
    expect(read("../site/src/App.tsx")).toContain('path="technology" element={<Technology />}');
    const primaryNav = read("../site/src/lib/primaryNav.ts");
    expect(primaryNav).toContain('"/technology"');
    expect(primaryNav).toContain("PUBLIC_MARKETING_PATHS");
    const primaryLinks = primaryNav.match(/export const PRIMARY_NAV_LINKS = \[[\s\S]*?\] as const/)?.[0] ?? "";
    expect(primaryLinks).not.toContain("/technology");
    expect(primaryLinks).toContain("/platform");
    expect(primaryLinks).toContain("/biology");
  });
  it("describes five HSI architecture layers without public catalogue brands", () => {
    for (const name of [
      "Biomedical evidence connections",
      "Living knowledge graph",
      "Research agent orchestration",
      "Scientific governance",
      "Research experience",
    ]) {
      expect(page).toContain(name);
    }
    expect(page).not.toContain("Aksh Health");
    expect(page).not.toContain("Immune Super Intelligence");
    expect(page).not.toContain("nx-nexus-orbit");
  });
  it("labels future connectors as illustrative and refuses live CDS claims", () => {
    expect(page).toContain("Illustrative future architecture");
    expect(page).toContain("Authorised care systems");
    expect(page).toContain("not live hospital integrations");
    expect(page).toMatch(/eligibility engines or clinical[\s\S]*decision support/);
    expect(page).toMatch(/No live[\s\S]*CDS, PHI or EHR write-back is offered here/);
  });
  it("keeps naming a capability separate from scientific validation", () => {
    expect(page).toContain("Naming a capability does not claim scientific validation");
    expect(page).toContain("under continuous engineering and scientific evaluation");
    expect(page).toContain("to=\"/evidence-safety\"");
  });
  it("uses editorial visuals rather than interactive NEXUS journeys", () => {
    expect(page).toContain("LandingVisual");
    expect(page).toContain('kind="network"');
    expect(page).not.toContain("setSourceIndex");
    expect(page).not.toContain("setEngineIndex");
    expect(page).not.toContain("setJourneyIndex");
    expect(page).not.toContain("setGovernanceIndex");
  });
  it("preserves the internal TechnologyFlow honesty contract for governed engines", () => {
    const flow = read("../site/src/components/TechnologyFlow.tsx");
    expect(flow).toContain("Data remains under the source system's authorisation and access controls.");
    expect(flow).toContain("No claim of live patient integrations");
    expect(read("../site/src/styles/editorial-site.css")).toContain("focus-visible");
  });
});
