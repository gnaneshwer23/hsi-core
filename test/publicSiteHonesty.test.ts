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

    const primaryNav = site("src/lib/primaryNav.ts");
    for(const route of ["/platform","/solutions","/research","/evidence-safety","/pricing","/contact","/modules","/technology","/science","/how-it-works"])expect(primaryNav).toContain(route);
    expect(primaryNav).toContain('label: "Request access"');
    const primaryLinksBlock=primaryNav.match(/export const PRIMARY_NAV_LINKS = \[[\s\S]*?\] as const/)?.[0]??"";
    for(const route of ["/platform","/research","/modules","/science","/how-it-works"])expect(primaryLinksBlock).toContain(route);
    for(const route of ["/curator","/gateway","/clinical-timeline","/trials-criteria","/status"])expect(primaryLinksBlock).not.toContain(route);
    for(const route of ["/modules/isi","/modules/aksh-health","/modules/trials","/modules/clinical"])expect(primaryNav).toContain(route);
    const nav=site("src/components/Nav.tsx");
    expect(nav).toContain("PRIMARY_NAV_LINKS");expect(nav).toContain("PRIMARY_NAV_CTA");expect(nav).not.toContain("ENGINEERING_LINKS");
    const home=site("src/pages/Home.tsx"),experience=site("src/components/Experience.tsx");
    expect(home).toContain("Investigate biological mechanisms");expect(home).toContain("across human systems");expect(home).toContain("Aksh Health");expect(home).toContain("Immune Super Intelligence");
    expect(home).toContain("validation case");expect(home).toContain("homeResearchScenarios");
    expect(home).not.toContain("ValidationPreview");expect(home).toContain("HomeProductDemo");expect(home).toContain("What HSI does not do");expect(experience).toContain("review scope");
    expect(home).not.toContain("100% accurate");
    const ecosystem = site("src/components/landing/EcosystemGrid.tsx");
    expect(ecosystem).toContain("ECOSYSTEM_PRODUCTS");
    expect(ecosystem).toContain("MATURITY_CHIP_LABEL");
    const roadmap = site("src/pages/Roadmap.tsx");
    expect(roadmap).toContain("MATURITY_CHIP_LABEL");
    expect(roadmap).toContain('to="/status"');

    const footer = site("src/components/Footer.tsx");
    expect(footer).toContain("RESEARCH_LINKS");
    expect(footer).not.toContain('to: "/roadmap"');
    expect(footer).not.toContain('to: "/status"');
    expect(footer).toContain('to: "/evidence-safety"');
    expect(footer).not.toContain('to: "/docs"');
    expect(footer).toContain('to: "/contact"');
    expect(footer).toContain("For research and education");
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
  expect(platform).toContain('type ProductId = EcosystemProduct["id"];');
  expect(platform).toContain('aksh:');
  expect(platform).toContain('clinical:');
  expect(platform).toContain('trials:');
  expect(platform).toContain('isi:');
  expect(platform).toContain("ECOSYSTEM_PRODUCTS.find");
  expect(platform).toContain("ECOSYSTEM_PRODUCTS.map");
  expect(platform).toContain("MATURITY_CHIP_LABEL");
  expect(platform).toContain("No live matching, eligibility confirmation or enrolment");
  expect(platform).toContain("not patient-record transfers");
  const maturity = site("src/lib/productMaturity.ts");
  expect(maturity).toContain('name: "Aksh Health"');
  expect(maturity).toContain('name: "HSI Clinical"');
  expect(maturity).toContain('name: "HSI Trials"');
  expect(maturity).toContain('name: "ISI Research"');
});


describe("Stage A public security boundary audit", () => {
  it("labels the clinical and trials public workspaces as synthetic, not live patient services", () => {
    const clinical = site("src/pages/ClinicalTimeline.tsx");
    const trials = site("src/pages/TrialsCriteria.tsx");
    const gateway = site("src/pages/GatewayDemo.tsx");
    expect(clinical).toContain("syntheticOnly");
    expect(clinical).toContain("No live EMIS / hospital connector");
    expect(trials).toContain("no eligibility claim");
    expect(gateway).toContain("synthetic");
    expect(gateway).toContain("containsPhi: true");
  });
  it("does not place internal demonstration routes in the primary navigation", () => {
    const nav = site("src/components/Nav.tsx");
    for (const route of ["/curator", "/gateway", "/clinical-timeline", "/trials-criteria"]) {
      expect(nav).not.toContain('to="' + route + '"');
    }
  });
  it("retains a visible keyboard skip link and a main landmark", () => {
    const layout = site("src/components/Layout.tsx");
    expect(layout).toContain('href="#main-content"');
    expect(layout).toContain('id="main-content"');
  });
});


describe("Homepage scientific visuals and product proof",()=>{
 it("leads with a product demonstration while preserving artwork and labelled validation components",()=>{
  const home=site("src/pages/Home.tsx"),preview=site("src/components/ValidationPreview.tsx"),art=site("src/components/Experience.tsx"),editorial=site("src/components/editorial/Editorial.tsx");
  expect(home).toContain("HomeProductDemo");expect(home).toContain("HomeHeroPreview");expect(editorial).toContain("BiologyArtwork");expect(art).toContain('role="img"');expect(art).toContain("EXPERIENCE_DOMAINS");
  expect(preview).toContain("loadValidationCatalogue");expect(preview).toContain("loadValidationScenario");expect(preview).toContain("Synthetic validation");
  expect(preview).toContain("Reference intervals are not supplied");expect(home).not.toContain("PMID:12345678");
 });
});
