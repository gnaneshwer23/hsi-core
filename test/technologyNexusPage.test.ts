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
  it("shows the NEXUS collaboration visual and reviewable engine contracts", () => {
    for (const label of ["Six engines.", "nx-nexus-orbit", "nx-nexus-contract", "REVIEWABLE OUTPUT", "SAFETY BOUNDARY", "Scientific review"]) expect(page).toContain(label);
    expect(page).toContain("Agents never self-approve claims");
  });
  it("shows distinct research and clinical applications with explicit maturity and safety boundaries", () => {
    for (const name of ["Evidence-led immune research", "Longitudinal clinical intelligence", "Clinical trial pre-screening", "Biomarker and therapeutic discovery", "REVIEWABLE OUTPUT", "Interpretation boundary", "not a live patient analysis"]) expect(page).toContain(name);
  });
  it("shows the six-step SSc investigation with explicit review and uncertainty", () => {
    for (const name of ["RESEARCH INVESTIGATION · SYSTEMIC SCLEROSIS", "Frame the SSc question", "Compare conflicting findings", "Draft testable hypotheses", "Review and decide", "REVIEWABLE ARTIFACT", "INTERPRETATION LIMIT"]) expect(page).toContain(name);
    expect(page).toContain("No patient data, actual study results");
  });
  it("keeps interactive journeys keyboard-operable and research boundaries explicit", () => {
    expect(page).toContain("setSourceIndex(index)");
    expect(page).toContain("setEngineIndex(index)");
    expect(page).toContain("setJourneyIndex(index)");
    expect(page).toContain("setApplicationIndex(i)");
    expect(page).toContain('aria-live="polite"');
    expect(read("../site/src/components/TechnologyFlow.tsx")).toContain("Data remains under the source system's authorisation and access controls.");
    expect(page).toContain("No autonomous diagnosis or prescribing");
    expect(read("../site/src/styles/technology.css")).toContain("focus-visible");
  });
});
