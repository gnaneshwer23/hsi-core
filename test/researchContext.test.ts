import { describe, expect, it } from "bun:test";
import {
  CROSS_DOMAIN_JOURNEY_ENTRIES,
  contactAccessHref,
  homeDemoHref,
  parseDemoPanel,
  parseScenarioId,
  resolveDemoPanel,
  safeNextPath,
  signInHref,
  signUpHref,
  withResearchContext,
  writeAccessIntent,
  readAccessIntent,
  clearAccessIntent,
} from "../site/src/lib/researchContext";

describe("researchContext contracts", () => {
  it("parses known demo panels and rejects unknowns", () => {
    expect(parseDemoPanel("brief")).toBe("brief");
    expect(parseDemoPanel("GRAPH")).toBe("graph");
    expect(parseDemoPanel("nope")).toBeNull();
  });

  it("resolves panel from query or hash", () => {
    expect(resolveDemoPanel("?panel=brief", "")).toBe("brief");
    expect(resolveDemoPanel("", "#demo-panel-brief")).toBe("brief");
    expect(resolveDemoPanel("", "#product-demo")).toBeNull();
  });

  it("accepts only known scenario ids", () => {
    const known = ["ssc_fibrosis", "gut_neuro"] as const;
    expect(parseScenarioId("gut_neuro", known)).toBe("gut_neuro");
    expect(parseScenarioId("oncology", known)).toBeNull();
  });

  it("builds homepage demo deep links without inventing backends", () => {
    expect(homeDemoHref({ scenarioId: "gut_neuro", panel: "brief" })).toBe(
      "/?scenario=gut_neuro&panel=brief#product-demo",
    );
  });

  it("keeps next paths same-origin relative only", () => {
    expect(safeNextPath("/research/account")).toBe("/research/account");
    expect(safeNextPath("https://evil.example/")).toBeNull();
    expect(safeNextPath("//evil.example")).toBeNull();
  });

  it("preserves domain and investigation on research paths", () => {
    expect(
      withResearchContext("/science/graph", { domain: "immunity" }),
    ).toBe("/science/graph?domain=immunity");
    expect(
      withResearchContext("/research/decision-workbench", {
        investigation: "hsi-interrogative-demo",
      }),
    ).toBe("/research/decision-workbench?investigation=hsi-interrogative-demo");
  });

  it("builds contact and auth hrefs that preserve research intent", () => {
    expect(contactAccessHref({ scenarioId: "gut_neuro", domain: "microbiome" })).toContain(
      "scenario=gut_neuro",
    );
    expect(signInHref("/research/account")).toBe("/sign-in?next=%2Fresearch%2Faccount");
    expect(signUpHref({ next: "/research/account", domain: "immunity" })).toContain("domain=immunity");
  });

  it("exposes three navigable cross-domain journey entries", () => {
    expect(CROSS_DOMAIN_JOURNEY_ENTRIES).toHaveLength(3);
    expect(CROSS_DOMAIN_JOURNEY_ENTRIES.every((j) => j.scenarioId && j.exploreTo.startsWith("/"))).toBe(
      true,
    );
  });

  it("stores access intent as browser_only drafts", () => {
    const memory = new Map<string, string>();
    const store = {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => {
        memory.set(k, v);
      },
      removeItem: (k: string) => {
        memory.delete(k);
      },
    };
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: store,
    });
    clearAccessIntent();
    const draft = writeAccessIntent({
      question: "How do microbial metabolites affect neuroinflammation?",
      domain: "microbiome",
      scenarioId: "gut_neuro",
    });
    expect(draft.persistence).toBe("browser_only");
    expect(readAccessIntent()?.question).toContain("microbial metabolites");
    clearAccessIntent();
    expect(readAccessIntent()).toBeNull();
  });
});
