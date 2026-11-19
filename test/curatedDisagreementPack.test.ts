import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { parseDomainBundle } from "../src/knowledgeGraph/domainGraph";
import {
  assertCuratedDisagreementPackHonesty,
  buildCuratedDisagreementPack,
  CURATED_DISAGREEMENT_CASE_REFS,
  CURATED_DISAGREEMENT_PACK_HONESTY,
  CURATED_DISAGREEMENT_PACK_SCHEMA,
} from "../src/investigation/curatedDisagreementPack";

const bundle = parseDomainBundle(
  JSON.parse(
    readFileSync("./site/public/research/domain-graph/graph.v1.json", "utf8"),
  ),
);

describe("curated disagreement demonstration pack", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertCuratedDisagreementPackHonesty(
      CURATED_DISAGREEMENT_PACK_HONESTY,
    );
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.confirmedContradiction).toBe(false);
    expect(honesty.isScientificGold).toBe(false);
    expect(honesty.inventsDoisOrPassages).toBe(false);
    expect(honesty.demonstrationOnly).toBe(true);
    expect(honesty.smeAdjudication).toBe(false);
    expect(honesty.usp).toBe("A");
  });

  test("catalog has three to five sealed-graph cases", () => {
    expect(CURATED_DISAGREEMENT_CASE_REFS.length).toBeGreaterThanOrEqual(3);
    expect(CURATED_DISAGREEMENT_CASE_REFS.length).toBeLessThanOrEqual(5);
  });

  test("resolves every catalog pair against the sealed domain graph", () => {
    const pack = buildCuratedDisagreementPack(bundle);
    expect(pack.schemaVersion).toBe(CURATED_DISAGREEMENT_PACK_SCHEMA);
    expect(pack.graphVersion).toBe(bundle.version);
    expect(pack.unresolvedCaseIds).toEqual([]);
    expect(pack.cases.length).toBe(CURATED_DISAGREEMENT_CASE_REFS.length);
    for (const c of pack.cases) {
      expect(c.confirmedContradiction).toBe(false);
      expect(c.scientificApproval).toBe(false);
      expect(c.left.id).not.toBe(c.right.id);
      expect(c.differences.length).toBeGreaterThan(0);
      expect(c.leftSource?.url || c.left.sourceId).toBeTruthy();
      expect(c.rightSource?.url || c.right.sourceId).toBeTruthy();
      // Locators must come from the sealed graph — no invented DOI strings in the catalog.
      expect(c.leftSource?.url ?? "").not.toMatch(/example\.org\/invented/i);
      expect(c.rightSource?.url ?? "").not.toMatch(/example\.org\/invented/i);
    }
  });

  test("includes the homepage gut-t1d worked-conflict pair", () => {
    const pack = buildCuratedDisagreementPack(bundle);
    const gut = pack.cases.find((c) => c.id === "gut-t1d-metabolite-vs-longitudinal");
    expect(gut?.left.id).toBe("DIAB-003");
    expect(gut?.right.id).toBe("DIAB-015");
    expect(gut?.demoClass).toBe("context_dependent_difference");
  });

  test("marks the SSc same-entity pair without claiming contradiction", () => {
    const pack = buildCuratedDisagreementPack(bundle);
    const ssc = pack.cases.find((c) => c.id === "ssc-tfh-fibrosis-same-entity");
    expect(ssc?.sameEntityPair).toBe(true);
    expect(ssc?.demoClass).toBe("same_entity_method_difference");
    expect(ssc?.confirmedContradiction).toBe(false);
  });
});
