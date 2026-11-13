import { describe,expect,it } from "bun:test";
import { readFileSync } from "node:fs";
const read=(p:string)=>readFileSync(new URL(p,import.meta.url),"utf8");
describe("Technology data-to-discovery hero",()=>{
  const page=read("../site/src/pages/Technology.tsx");
  const flow=read("../site/src/components/TechnologyFlow.tsx");
  it("keeps the retired portfolio infographic off the active public technology page",()=>{
    expect(page).not.toContain("<TechnologyFlow");
    expect(page).toContain("PlatformPublicPage as Technology");
  });
  it("shows five ordered stages, three product inputs and six governed intelligence engines",()=>{
    for(const label of ["Data sources","Knowledge building","HSI NEXUS","Intelligence outputs","Potential impact","Authorised care systems","Aksh Health","Immune Super Intelligence","Context Engine","Biology Engine","Evidence Engine","Reasoning Engine","Discovery Engine","Governance Engine"])expect(flow).toContain(label);
  });
  it("details the three source products and governed integration layers",()=>{
    for(const phrase of ["EHR encounters, diagnoses & procedures","Wearables, glucose & cardiometabolic trends","Immune cells, tissues, pathways & mechanisms","Normalise FHIR, lab, omics & terminology","Verify identity, permissions & purpose","Biomedical evidence, uncertainty & hypotheses"]) expect(flow).toContain(phrase);
    expect(flow).toContain('className="tf-detail-list"');
  });
  it("uses five accessible original scientific illustrations with responsive styling",()=>{
    expect(flow).toContain("function StageVisual");
    expect(flow).toContain('role="img"');
    expect(flow).toContain("stageVisuals[index]");
    expect(flow).toContain("<StageVisual index={i}/>");
    const css=read("../site/src/components/TechnologyFlow.css");
    expect(css).toContain(".tf-stage-visual");
    expect(css).toContain("@media(max-width:520px)");
  });
  it("animates directional data flow with reduced-motion support",()=>{
    expect(flow).toContain('className="tf-motion"');
    expect(flow).toContain("<animateMotion");
    expect(flow).toContain("tf-arrow-pulse");
    expect(read("../site/src/components/TechnologyFlow.css")).toContain("prefers-reduced-motion:reduce");
  });
  it("shows NEXUS, output and impact details inline without fake links",()=>{
    for(const term of ["Context Engine","Biology Engine","Evidence Engine","Reasoning Engine","Discovery Engine","Governance Engine","Clinical trial intelligence","In-silico drug discovery","Therapeutic candidates","Inclusive trials"]) expect(flow).toContain(term);
    expect(flow).toContain("row.details.map(detail=");
    expect(flow).not.toContain("Explore details");
    expect(flow).not.toContain("setActiveItem(");
    expect(flow).not.toContain("tf-capability-detail");
    expect(read("../site/src/components/TechnologyFlow.css")).toContain(".tf-stage:nth-child(n+3) .tf-detail-list");
  });
  it("has interactive and honest stage explanations",()=>{
    expect(flow).toContain("aria-pressed={selected===i}");
    expect(flow).toContain('aria-live="polite"');
    expect(flow).toContain("No claim of live patient integrations");
    expect(read("../site/src/components/TechnologyFlow.css")).toContain("focus-visible");
  });
});
