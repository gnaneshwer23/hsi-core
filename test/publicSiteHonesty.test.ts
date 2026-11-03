/**
 * Public HSI site honesty — four-product Available / In-dev / Planned; simplified IA.
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
    expect(mod).toContain('name: "ISI Research"');
    expect(mod).toContain('chip: "available"');
    expect(mod).toContain('chip: "in_development"');
    expect(mod).toContain('chip: "planned"');
    expect(mod).toMatch(/Never confirmed eligible|never “confirmed eligible”|never "confirmed eligible"/i);
    expect(mod).toContain("ENGINEERING_LINKS");
    expect(mod).toContain("STATUS_COLUMNS");
    // Shipped /for-trials marketing must not sit only under Planned
    expect(mod).toMatch(
      /available[\s\S]*HSI Trials marketing landing \(\/for-trials\)[\s\S]*in_development/i,
    );
    expect(mod).toContain("Trials five-state criteria demo (/trials-criteria");
    expect(mod).toContain("live CDS remains a non-goal");
    expect(mod).not.toMatch(/Omics runtimes and live CDS paths/);
  });

  it("routes /products, /science, /status; primary nav is simplified public IA", () => {
    const app = site("src/App.tsx");
    expect(app).toContain('path="products"');
    expect(app).toContain('path="status"');
    expect(app).toContain('path="science"');
    expect(app).toContain("<Science");
    expect(app).not.toMatch(/path="science"[\s\S]*Navigate to="\/explore"/);
    expect(app).toContain('path="clinical-timeline"');
    expect(app).toContain('path="trials-criteria"');
    expect(app).toContain('path="gateway"');

    const nav = site("src/components/Nav.tsx");
    expect(nav).toContain("/products");
    expect(nav).toContain("/platform");
    expect(nav).toContain("/science");
    expect(nav).toContain("/how-it-works");
    expect(nav).toContain("How It Works");
    // Primary IA is founder destinations only; Status/Roadmap/Docs stay footer-only.
    expect(nav).not.toMatch(/primaryLinks[\s\S]*Curator/);
    expect(nav).not.toMatch(/primaryLinks[\s\S]*\/discovery/);
    expect(nav).not.toMatch(/primaryLinks[\s\S]*\/explore/);
    expect(nav).not.toMatch(/primaryLinks[\s\S]*for-aksh/);
    expect(nav).not.toMatch(/primaryLinks[\s\S]*for-trials/);
    expect(nav).not.toMatch(/primaryLinks[\s\S]*for-isi/);
    expect(nav).not.toMatch(/primaryLinks[\s\S]*\/status/);
    expect(nav).not.toContain("ENGINEERING_LINKS");

    const home = site("src/pages/Home.tsx");
    expect(home).toContain("Aksh Health");
    expect(home).toContain("Immune Super Intelligence");
    expect(home).toContain("HEALTH SUPER INTELLIGENCE");
    expect(home).toContain("Illustrative connections · not study findings or patient analysis");
    expect(home).toContain('to="/for-isi"');
    expect(home).toContain('href: "/for-aksh"');
    expect(home).toContain('to="/platform"');
    expect(home).not.toContain("<EvidenceExplorer");
    const ecosystem = site("src/components/landing/EcosystemGrid.tsx");
    expect(ecosystem).toContain("ECOSYSTEM_PRODUCTS");
    expect(ecosystem).toContain("MATURITY_CHIP_LABEL");
    const roadmap = site("src/pages/Roadmap.tsx");
    expect(roadmap).toContain("MATURITY_CHIP_LABEL");
    expect(roadmap).toContain('to="/status"');

    const footer = site("src/components/Footer.tsx");
    expect(footer).toContain("PROGRESS_LINKS");
    expect(footer).toContain('to: "/roadmap"');
    expect(footer).toContain('to: "/status"');
    expect(footer).toContain('to: "/docs"');
    expect(footer).toContain("educational experience");
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


it("Stage A Platform includes all four distinct product perspectives and honest maturity", () => {
  const platform = site("src/pages/Platform.tsx");
  expect(platform).toContain('type Product = "aksh" | "clinical" | "isi" | "trials"');
  expect(platform).toContain('name: "Aksh Health"');
  expect(platform).toContain('name: "HSI Clinical"');
  expect(platform).toContain('name: "HSI Trials"');
  expect(platform).toContain('name: "Immune Super Intelligence"');
  expect(platform).toContain("ECOSYSTEM_PRODUCTS.map");
  expect(platform).toContain("MATURITY_CHIP_LABEL");
  expect(platform).toContain("No live matching, eligibility confirmation or enrolment");
  expect(platform).toContain("not patient-record transfers");
});
