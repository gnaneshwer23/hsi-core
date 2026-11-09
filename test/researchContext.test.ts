import { describe, expect, it } from "bun:test";
import {
  homeDemoHref,
  parseDemoPanel,
  parseScenarioId,
  resolveDemoPanel,
  safeNextPath,
  withResearchContext,
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
});
