import {test, expect} from "bun:test";
import type {InterrogativeInvestigation} from "../src/interrogativeContracts";
import type {FalsificationReport} from "../src/interrogativeFalsificationEngine";
import {
  HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL,
  validateHsiLiveScientificPlatformOwnerApproval,
} from "../src/hsiLiveScientificPlatformAuthorization";
import {runHsiAuthorizedLiveScientificPlatform} from "../src/hsiLiveScientificPlatformRuntime";
import type {HsiInvestigationArtifactSink} from "../src/hsiArch003AgentAdapters";
import {createMemoryCheckpointStore} from "../src/evidence/boundedAgentExecution";
import {LIVE_SCENARIOS} from "../src/investigation/scenarios";

const release = {
  id: "HSI-GR-SSC",
  version: "1.0.0",
  manifestHash: "a".repeat(64),
};

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
        abstractText: `<p>${SENT}</p>`,
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
      abstract_inverted_index: {IL: [0], "21": [1], matters: [2]},
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

function fakeFetch() {
  return (async (u: unknown) => {
    const url = String(u);
    if (url.includes("europepmc")) return new Response(JSON.stringify(epmc), {status: 200});
    if (url.includes("openalex")) return new Response(JSON.stringify(oa), {status: 200});
    if (url.includes("opentargets")) return new Response(JSON.stringify(ot), {status: 200});
    return new Response("?", {status: 404});
  }) as typeof fetch;
}

function memorySink(): HsiInvestigationArtifactSink & {
  draft: InterrogativeInvestigation | null;
  report: FalsificationReport | null;
} {
  const state: {
    draft: InterrogativeInvestigation | null;
    report: FalsificationReport | null;
  } = {draft: null, report: null};
  return {
    get draft() {
      return state.draft;
    },
    get report() {
      return state.report;
    },
    saveDraft: async (d) => {
      state.draft = d;
      return "draft-ref";
    },
    loadDraft: async (ref) => {
      if (ref !== "draft-ref" || !state.draft) throw Error("No draft");
      return state.draft;
    },
    saveFalsification: async (r) => {
      state.report = r;
      return "falsification-ref";
    },
  };
}

test("live scientific platform approval refuses preview GO / writes / PHI / GA", () => {
  expect(() =>
    validateHsiLiveScientificPlatformOwnerApproval(HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL),
  ).not.toThrow();
  expect(HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL.liveScientificPlatformEngineeringAuthorized).toBe(
    true,
  );
  expect(HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL.restrictedPreviewClaimed).toBe(false);
  expect(HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL.productionResearchWritesEnabled).toBe(false);
  expect(HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL.scientificApproval).toBe(false);
  expect(HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL.generalAvailability).toBe(false);
  expect(() =>
    validateHsiLiveScientificPlatformOwnerApproval({
      ...HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL,
      productionResearchWritesEnabled: true as false,
    }),
  ).toThrow("research writes");
});

test("authorized platform runs live investigation then research agents without claiming preview", async () => {
  const sink = memorySink();
  const store = createMemoryCheckpointStore();
  const scenario = LIVE_SCENARIOS["il21-autoimmune"]!;
  const result = await runHsiAuthorizedLiveScientificPlatform({
    authorization: HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL,
    investigationId: "inv-live-platform-1",
    scenarioId: scenario.id,
    fetcher: fakeFetch(),
    plan: {
      question: "Which SSc mechanisms require investigation?",
      actorPrincipal: "researcher-1",
      createdAt: "2026-11-21T21:00:00Z",
      dataClass: "public_biomedical",
      focus: "systemic_sclerosis",
      release,
    },
    sink,
    checkpointStore: store,
    now: () => "2026-11-21T21:00:00.000Z",
  });

  expect(result.schemaVersion).toBe("hsi-live-scientific-platform-runtime-1");
  expect(result.stage).toBe("L1_restricted_preview_engineering");
  expect(result.scenarioId).toBe("il21-autoimmune");
  expect(result.investigation.candidates.length).toBeGreaterThan(0);
  expect(result.investigation.flags.scientificApproval).toBe(false);
  expect(result.briefMarkdown).toContain("Candidate-only");
  expect(result.researchAgent.orchestration.status).toBe("completed");
  expect(result.honesty.restrictedPreviewClaimed).toBe(false);
  expect(result.honesty.productionWritesEnabled).toBe(false);
  expect(result.honesty.sourceClearanceVerified).toBe(false);
  expect(result.honesty.scientificApproval).toBe(false);
  expect(result.honesty.generalAvailability).toBe(false);
  expect(result.honesty.inventedStagingUrl).toBe(false);
});

test("platform refuses without canonical owner approval", async () => {
  const sink = memorySink();
  await expect(
    runHsiAuthorizedLiveScientificPlatform({
      authorization: {
        ...HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL,
        approvedAt: "2099-01-01",
      },
      investigationId: "inv-live-platform-2",
      scenarioId: "il21-autoimmune",
      fetcher: fakeFetch(),
      plan: {
        question: "Which SSc mechanisms require investigation?",
        actorPrincipal: "researcher-1",
        createdAt: "2026-11-21T21:00:00Z",
        dataClass: "public_biomedical",
        focus: "systemic_sclerosis",
        release,
      },
      sink,
    }),
  ).rejects.toThrow("approval");
});

test("platform refuses unknown scenario ids", async () => {
  const sink = memorySink();
  await expect(
    runHsiAuthorizedLiveScientificPlatform({
      authorization: HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL,
      investigationId: "inv-live-platform-3",
      scenarioId: "not-a-real-scenario",
      fetcher: fakeFetch(),
      plan: {
        question: "Which SSc mechanisms require investigation?",
        actorPrincipal: "researcher-1",
        createdAt: "2026-11-21T21:00:00Z",
        dataClass: "public_biomedical",
        focus: "systemic_sclerosis",
        release,
      },
      sink,
    }),
  ).rejects.toThrow("Unknown live scientific platform scenario");
});
