import {describe,expect,test} from "bun:test";
import {
  AUTHORISED_INVESTIGATION_PATH,
  authorisedInvestigationHref,
  LEGACY_WORKBENCH_REDIRECTS,
  LIVE_INVESTIGATION_PATH,
  RESEARCH_HOME_PATH,
  SCIENTIFIC_COMPANION_PATH,
  liveInvestigationHref,
  scientificCompanionHref,
} from "../site/src/lib/workbenchPrimary";
import {RESEARCH_NAV_ITEMS} from "../site/src/lib/researchNavItems";

describe("workbench primary reconnect",()=>{
  test("live investigation is the canonical path",()=>{
    expect(LIVE_INVESTIGATION_PATH).toBe("/research/workspace");
    expect(RESEARCH_HOME_PATH).toBe("/research/home");
    expect(liveInvestigationHref()).toBe("/research/workspace");
    expect(liveInvestigationHref({reopen:true})).toBe("/research/workspace?reopen=1");
    expect(liveInvestigationHref({scenarioId:"il21-autoimmune"})).toBe(
      "/research/workspace?scenario=il21-autoimmune",
    );
    expect(liveInvestigationHref({scenarioId:"not-a-scenario"})).toBe("/research/workspace");
    expect(liveInvestigationHref({reopen:true,scenarioId:"il21-autoimmune"})).toBe(
      "/research/workspace?reopen=1&scenario=il21-autoimmune",
    );
    expect(authorisedInvestigationHref("hsi-interrogative-demo-12345678")).toBe(
      `${AUTHORISED_INVESTIGATION_PATH}?investigation=hsi-interrogative-demo-12345678`,
    );
    expect(SCIENTIFIC_COMPANION_PATH).toBe("/research/companion");
    expect(scientificCompanionHref()).toBe("/research/companion");
    expect(scientificCompanionHref({scenarioId:"il21-autoimmune",fromWorkspace:true})).toBe(
      "/research/companion?from=workspace&scenario=il21-autoimmune",
    );
  });

  test("legacy discovery experience redirects to live workspace",()=>{
    expect(LEGACY_WORKBENCH_REDIRECTS).toContainEqual({
      from:"/research/discovery-experience",
      to:LIVE_INVESTIGATION_PATH,
    });
  });

  test("legacy research nav leads with live investigation, not mechanism-workflow",()=>{
    const targets=RESEARCH_NAV_ITEMS.map(i=>i.to);
    expect(RESEARCH_NAV_ITEMS[0]?.to).toBe("/research/home");
    expect(targets).toContain(LIVE_INVESTIGATION_PATH);
    expect(RESEARCH_NAV_ITEMS.find(i=>i.to===LIVE_INVESTIGATION_PATH)?.label).toBe("Live investigation");
    expect(targets).not.toContain("/research/mechanism-workflow");
    expect(targets).not.toContain("/research/dashboard#dashboard-workspace");
  });
});
