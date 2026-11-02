/**
 * Public HSI site honesty — four-product Available / In-dev / Planned; engineering demoted.
 */
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const site = (...p: string[]) =>
  readFileSync(resolve(import.meta.dir, "../site", ...p), "utf8");

describe("Public HSI site honesty", () => {
  it("defines four products with Available / In development / Planned chips", () => {
    const mod = site("src/lib/productMaturity.ts");
    expect(mod).toContain('id: "aksh"');
    expect(mod).toContain('id: "clinical"');
    expect(mod).toContain('id: "isi"');
    expect(mod).toContain('id: "trials"');
    expect(mod).toContain('chip: "available"');
    expect(mod).toContain('chip: "in_development"');
    expect(mod).toContain('chip: "planned"');
    expect(mod).toMatch(/Never confirmed eligible|never “confirmed eligible”|never "confirmed eligible"/i);
    expect(mod).toContain("ENGINEERING_LINKS");
    expect(mod).toContain("STATUS_COLUMNS");
  });

  it("routes /products and /status; primary nav demotes engineering chrome", () => {
    const app = site("src/App.tsx");
    expect(app).toContain('path="products"');
    expect(app).toContain('path="status"');
    expect(app).toContain('path="clinical-timeline"');
    expect(app).toContain('path="trials-criteria"');
    expect(app).toContain('path="gateway"');

    const nav = site("src/components/Nav.tsx");
    expect(nav).toContain("/products");
    expect(nav).toContain("/status");
    expect(nav).toContain("For researchers");
    expect(nav).toContain("Engineering (secondary)");
    // Curator / Systems not in primaryLinks
    expect(nav).not.toMatch(/primaryLinks[\s\S]*Curator/);
    expect(nav).toContain("ENGINEERING_LINKS");

    const home = site("src/pages/Home.tsx");
    expect(home).toContain("<EcosystemGrid");
    const ecosystem = site("src/components/landing/EcosystemGrid.tsx");
    expect(ecosystem).toContain("ECOSYSTEM_PRODUCTS");
    expect(ecosystem).toContain("MATURITY_CHIP_LABEL");
    expect(home).toContain("STATUS_COLUMNS");
    expect(home).toContain("What is live today?");
    expect(home).toContain('to="/status"');

    const footer = site("src/components/Footer.tsx");
    expect(footer).toContain("Engineering (secondary)");
    expect(footer).toContain("/status");
  });

  it("wires Clinical timeline + Trials five-state + Gateway thin demos with honesty labels", () => {
    const maturity = site("src/lib/productMaturity.ts");
    expect(maturity).toContain("DEMO_LINKS");
    expect(maturity).toContain('to: "/clinical-timeline"');
    expect(maturity).toContain('to: "/trials-criteria"');
    expect(maturity).toContain('to: "/gateway"');
    expect(maturity).toContain("/clinical-timeline");
    expect(maturity).toContain("/trials-criteria");
    expect(maturity).toContain("/gateway");

    const status = site("src/pages/Status.tsx");
    expect(status).toContain("DEMO_LINKS");
    expect(status).toContain('id="demos"');

    const clinical = site("src/pages/ClinicalTimeline.tsx");
    expect(clinical).toContain("buildClinicalTimelineView");
    expect(clinical).toContain("buildSyntheticFhirMappingNotes");
    expect(clinical).toContain("listSyntheticTimelineFixtures");
    expect(clinical).toContain("syn-t2d-multi-provider-01");
    expect(clinical).toContain("syntheticOnly");
    expect(clinical).toContain("missing-info-panel");
    expect(clinical).toContain("provenance-chip");
    expect(clinical).toContain("sourceSystem");
    expect(clinical).toContain("fhir-notes");
    expect(clinical).toContain("fhirSoT=false");
    expect(clinical).toMatch(/liveEmis\s*=\s*false|liveEmis=false/);
    expect(clinical).not.toMatch(/live hospital connector|live EMIS SoT/i);
    expect(clinical).not.toMatch(/UK Core certified|SMART-on-FHIR launch live/i);

    const trials = site("src/pages/TrialsCriteria.tsx");
    expect(trials).toContain("assessTrialCriteria");
    expect(trials).toContain("listDemoTrialStubs");
    expect(trials).toContain("confirmedEligible=false");
    expect(trials).toContain("criterion_assessment_only");
    expect(trials).toContain("CRITERION_STATES");
    expect(trials).toContain("CRITERION_STATE_LEGEND");
    expect(trials).toContain("criterion-legend");
    expect(trials).toContain("Never confirmed eligible");
    expect(trials).toContain("provenanceSource");
    expect(trials).toContain("Trial stubs");
    // May discuss the ban; must not affirm enrolment suitability.
    expect(trials).not.toMatch(/\bis confirmed eligible\b/i);
    expect(trials).not.toMatch(/\bpatient is eligible\b/i);
    expect(trials).not.toMatch(/\bfully eligible\b/i);
    expect(trials).toContain("String(report.confirmedEligible)");
    expect(trials).toContain("String(a.confirmedEligible)");

    const gateway = site("src/pages/GatewayDemo.tsx");
    expect(gateway).toContain("decideGatewayRequest");
    expect(gateway).toContain("gatewayContract");
    expect(gateway).toContain("researchDbWrite=false");
    expect(gateway).toContain("containsPhi: true");
    expect(gateway).toContain("Deny — PHI toward research DB");
    expect(gateway).toContain("PHI → research denied");
    expect(gateway).toContain("syntheticOnly");
    expect(gateway).toContain("no live PHI");
    expect(gateway).toContain("/status#demos");
    expect(gateway).toMatch(/liveEmis\s*=\s*false|liveEmis=false/);
    expect(gateway).not.toMatch(/live Aksh CDS engines wired|live EMIS connector/i);
  });
});
