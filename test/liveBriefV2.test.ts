import {describe,expect,test} from "bun:test";
import {runLiveInvestigation} from "../src/investigation/liveRun";
import {LIVE_SCENARIOS} from "../src/investigation/scenarios";
import {
  LIVE_BRIEF_V2_SCHEMA,
  exportLiveBriefV2,
  renderLiveBriefV2Markdown,
} from "../src/investigation/liveBriefV2";

const SENT =
  "Serum IL-21 was increased in patients with systemic sclerosis and promoted T follicular helper cell expansion.";
const epmc = {
  resultList: {
    result: [
      {
        id: "111",
        source: "MED",
        pmid: "111",
        doi: "10.1/abc",
        title: "IL-21 in systemic sclerosis",
        abstractText: "<p>" + SENT + "</p>",
        firstPublicationDate: "2020-01-02",
        pubTypeList: {pubType: ["Journal Article"]},
      },
    ],
  },
};
const oa = {
  results: [
    {
      id: "https://openalex.org/W1",
      doi: "https://doi.org/10.1/abc",
      title: "IL-21 in systemic sclerosis",
      publication_date: "2020-01-02",
      ids: {pmid: "https://pubmed.ncbi.nlm.nih.gov/111"},
      is_retracted: false,
      abstract_inverted_index: {IL: [0], "21": [1]},
      type: "article",
    },
  ],
};
const ot = {
  data: {
    disease: {
      id: "X",
      name: "systemic scleroderma",
      associatedTargets: {
        rows: [{target: {id: "ENSG1", approvedSymbol: "IL21R"}, score: 0.4}],
      },
    },
  },
};
const ok = (b: unknown) => new Response(JSON.stringify(b), {status: 200});
const fakeFetch = () =>
  (async (u: any) => {
    const url = String(u);
    if (url.includes("europepmc")) return ok(epmc);
    if (url.includes("openalex")) return ok(oa);
    if (url.includes("opentargets")) return ok(ot);
    return new Response("?", {status: 404});
  }) as any;
const now = () => "2026-11-15T10:00:00.000Z";
const slot = (id: string, direction: string) => ({
  verifierId: id,
  modelId: id + "-model",
  runner: async () => ({
    direction,
    reason: "r",
    evidenceSpan: direction === "insufficient" ? null : SENT.slice(0, 20),
  }),
});

describe("live Brief v2 soft-land", () => {
  test("exports null graph release, unreviewed counts, runIds from briefHash, and refuses approval", async () => {
    const scenario = LIVE_SCENARIOS["il21-autoimmune"]!;
    const run = await runLiveInvestigation({
      scenario,
      fetcher: fakeFetch(),
      now,
      verifiers: [slot("openai", "positive"), slot("anthropic", "positive")],
    });
    const brief = exportLiveBriefV2(run);
    expect(brief.schemaVersion).toBe(LIVE_BRIEF_V2_SCHEMA);
    expect(brief.briefVersion).toBe(2);
    expect(brief.graphReleaseId).toBeNull();
    expect(brief.runIds).toEqual([run.briefHash]);
    expect(brief.reviewStates.reviewed).toBe(0);
    expect(brief.reviewStates.reviewedEdgeCount).toBe(0);
    expect(brief.reviewStates.unreviewed).toBe(run.candidates.length);
    expect(brief.reviewStates.byCandidate.every((c) => c.reviewStatus === "unreviewed")).toBe(true);
    expect(brief.scientificApproval).toBe(false);
    expect(brief.graphPromotable).toBe(false);
    expect(brief.containsPhi).toBe(false);
    expect(brief.clinicalAdvice).toBe(false);
    expect(brief.reproducibleFromSavedRecord).toBe(false);
    expect(brief.conflictClasses[0]!.confirmedContradiction).toBe(false);
    expect(brief.conflictClasses[0]!.pooledEffectAllowed).toBe(false);
    expect(brief.markdown).toContain("Candidate-only");
    const md = renderLiveBriefV2Markdown(brief);
    expect(md).toContain("# HSI Live Research Brief v2");
    expect(md).toContain(run.briefHash);
    expect(md).toContain("Graph release id: none");
    expect(md).toMatch(/Unreviewed candidates:/);
  });

  test("emits supporting_vs_opposing_candidates without confirming contradiction", async () => {
    const scenario = LIVE_SCENARIOS["il21-autoimmune"]!;
    const run = await runLiveInvestigation({
      scenario,
      fetcher: fakeFetch(),
      now,
      verifiers: [slot("openai", "positive"), slot("anthropic", "positive")],
    });
    const supporting = run.candidates.find((c) => c.polarity === "supporting");
    expect(supporting).toBeTruthy();
    const opposing = {
      ...supporting!,
      id: "opp-fixture",
      polarity: "opposing" as const,
      direction: "negative" as const,
    };
    const mixed = {...run, candidates: [...run.candidates, opposing]};
    const brief = exportLiveBriefV2(mixed);
    expect(brief.conflictClasses).toHaveLength(1);
    expect(brief.conflictClasses[0]).toMatchObject({
      classification: "supporting_vs_opposing_candidates",
      opposingCount: 1,
      confirmedContradiction: false,
      pooledEffectAllowed: false,
    });
    expect(brief.conflictClasses[0]!.supportingCount).toBeGreaterThan(0);
    expect(brief.conflictNote).toContain("Confirmed contradiction stays false");
  });

  test("rejects invalid schema documents in the markdown renderer", () => {
    expect(() =>
      renderLiveBriefV2Markdown({
        schemaVersion: "wrong",
        briefVersion: 2,
      } as any),
    ).toThrow("Invalid live Brief v2 document");
  });
});
