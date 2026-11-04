import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
describe("HSI NEXUS technology page", () => {
  const page = read("../site/src/pages/Technology.tsx");
  it("is accessible from a dedicated public route and navigation", () => {
    expect(read("../site/src/App.tsx")).toContain('path="technology" element={<Technology />}');
    expect(read("../site/src/lib/primaryNav.ts")).toContain('to: "/technology"');
  });
  it("shows the four independent information domains and six intelligence functions", () => {
    for (const name of ["Akeno Health", "Aksh Health", "Immune Super Intelligence", "External research & trials", "Context", "Biology", "Evidence", "Reasoning", "Discovery", "Governance"]) expect(page).toContain(name);
  });
  it("explains four governed logical graph layers and source-specific trust boundaries", () => {
    for (const name of ["Patient context", "Human biology", "Gut–immune–metabolic", "Biomedical evidence", "POTENTIAL DATA CONTRACT", "TRUST BOUNDARY"]) expect(page).toContain(name);
    expect(page).toContain("not a claim that every source is currently integrated");
  });
  it("shows matching, trial intelligence, in-silico discovery and precision medicine without claiming deployment", () => {
    for (const name of ["Patient and cohort matching", "Clinical trial intelligence", "In-silico drug discovery", "Precision medicine research", "not a validated drug-discovery service", "not a live patient analysis"]) expect(page).toContain(name);
  });
  it("keeps interactive journeys keyboard-operable and research boundaries explicit", () => {
    expect(page).toContain("setSourceIndex(index)");
    expect(page).toContain("setEngineIndex(index)");
    expect(page).toContain("setJourneyIndex(index)");
    expect(page).toContain('aria-live="polite"');
    expect(read("../site/src/components/TechnologyFlow.tsx")).toContain("Data remains under the source system's authorisation and access controls.");
    expect(page).toContain("No autonomous diagnosis or prescribing");
    expect(read("../site/src/styles/technology.css")).toContain("focus-visible");
  });
});
