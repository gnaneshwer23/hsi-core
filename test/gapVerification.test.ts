import {describe, expect, test} from "bun:test";
import {readFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {
  projectGapVerificationForOutcome,
  verifyRecordedGaps,
} from "../src/evidence/gapVerification";
import {
  LIVING_EVIDENCE_DISEASE_PINS,
  LIVING_EVIDENCE_NCT_PINS,
  LIVING_EVIDENCE_PMID_PINS,
  projectLivingEvidenceForOutcome,
  runLivingEvidenceExpansionFromFixtures,
} from "../src/evidence/livingEvidenceExpansion";
import {buildResearchOutcome} from "../src/researchOutcome";
import {deliveryHarness} from "./fixtures/deliveryHarness";
import {deliveryHash} from "../src/server/investigationDeliveryService";
import {createGapVerificationExecutor, type HsiInvestigationArtifactSink} from "../src/hsiArch003AgentAdapters";
import type {GapVerificationOutcomeSection} from "../src/evidence/gapVerification";
import {HSI_ROLE_TOOL_ALLOWLIST} from "../src/hsiAgentIntelligenceContracts";

const root = resolve(import.meta.dir, "..");
const fixturesDir = resolve(root, "research/domain-graph/living-evidence/fixtures");
const retrievedAt = "2026-11-08T17:40:00.000Z";
const asOf = "2026-11-08T17:45:00.000Z";
const generatedAt = "2026-11-08T17:45:00.000Z";

function loadFixtures() {
  const europePmcBodiesByPmid: Record<string, {httpStatus: number; bodyText: string}> = {};
  for (const pmid of LIVING_EVIDENCE_PMID_PINS) {
    const path = resolve(fixturesDir, `europepmc.pmid.${pmid}.json`);
    expect(existsSync(path)).toBe(true);
    europePmcBodiesByPmid[pmid] = {httpStatus: 200, bodyText: readFileSync(path, "utf8")};
  }
  const openTargetsBodiesByDiseaseId: Record<string, {httpStatus: number; bodyText: string}> = {};
  for (const diseaseId of LIVING_EVIDENCE_DISEASE_PINS) {
    const path = resolve(fixturesDir, `opentargets.disease.${diseaseId.toLowerCase()}.json`);
    expect(existsSync(path)).toBe(true);
    openTargetsBodiesByDiseaseId[diseaseId] = {httpStatus: 200, bodyText: readFileSync(path, "utf8")};
  }
  const ctgovBodiesByNct: Record<string, {httpStatus: number; bodyText: string}> = {};
  for (const nctId of LIVING_EVIDENCE_NCT_PINS) {
    const path = resolve(fixturesDir, `ctgov.${nctId.toLowerCase()}.json`);
    expect(existsSync(path)).toBe(true);
    ctgovBodiesByNct[nctId] = {httpStatus: 200, bodyText: readFileSync(path, "utf8")};
  }
  return {europePmcBodiesByPmid, openTargetsBodiesByDiseaseId, ctgovBodiesByNct};
}

const emptyLiving = projectLivingEvidenceForOutcome({sourcePmids: [], snapshot: null});

describe("gap verification (step 04)", () => {
  test("classifies missing local data vs oppose-search incompleteness vs genuine unresolved", () => {
    const report = verifyRecordedGaps({
      asOf,
      branches: [
        {
          id: "b-1",
          assessment: "insufficient_evidence",
          supportingClaimIds: [],
          opposingClaimIds: [],
          missingEvidence: [
            "Approved source-linked claims for the mechanism",
            "Independent contradictory or null findings",
          ],
          uncertainty: ["No evidence retrieval performed by question planner"],
        },
        {
          id: "b-2",
          assessment: "insufficient_evidence",
          supportingClaimIds: ["HSI-C-TEST-001"],
          opposingClaimIds: [],
          missingEvidence: ["Approved source-linked claims for the mechanism"],
          uncertainty: [],
        },
      ],
      claimContexts: [
        {
          claimId: "HSI-C-TEST-001",
          context: {species: "human", assay: "ELISA", tissueId: null, diseaseStage: null, experimentalSystem: "ex_vivo"},
        },
      ],
      localSourcePmids: ["123"],
      contradictions: {recordedOpposingClaimIds: [], searchStatus: "not_recorded"},
      livingEvidence: emptyLiving,
    });
    expect(report.honesty.smeGoldFilled).toBe(false);
    expect(report.honesty.scientificallyValidated).toBe(false);
    expect(report.honesty.expertLabelsAvailable).toBe(false);
    expect(report.items.some((i) => i.kind === "missing_local_data")).toBe(true);
    expect(report.items.some((i) => i.kind === "oppose_search_incomplete")).toBe(true);
    expect(report.items.some((i) => i.kind === "genuine_unresolved_question")).toBe(true);
    expect(report.items.every((i) => i.expertLabelStatus === "unavailable")).toBe(true);
  });

  test("living-evidence bind marks passage-rights-blocked when metadata overlaps and passages are fail-closed", () => {
    const {snapshot} = runLivingEvidenceExpansionFromFixtures({
      ...loadFixtures(),
      retrievedAt,
      asOf,
      generatedAt,
    });
    const living = projectLivingEvidenceForOutcome({
      sourcePmids: ["18375541"],
      snapshot,
    });
    expect(living.status).toBe("bound_metadata_refresh");
    expect(living.licensing?.humanCleared).toBe(false);

    const report = projectGapVerificationForOutcome({
      asOf,
      branches: [
        {
          id: "b-live",
          assessment: "insufficient_evidence",
          supportingClaimIds: [],
          opposingClaimIds: [],
          missingEvidence: ["Approved source-linked claims for the mechanism"],
          uncertainty: ["No evidence retrieval performed by question planner"],
        },
      ],
      claimContexts: [],
      localSourcePmids: ["18375541"],
      contradictions: {recordedOpposingClaimIds: [], searchStatus: "not_recorded"},
      livingEvidence: living,
    });
    expect(report.status).toBe("classified_against_bound_evidence");
    expect(report.items.some((i) => i.kind === "passage_rights_blocked")).toBe(true);
    expect(report.items.every((i) => i.trace.matchedLivingPmids.includes("18375541"))).toBe(true);
  });

  test("research outcome always projects gapVerification without inventing SME gold", async () => {
    const f = deliveryHarness();
    const o = await f.service.outcome("alice", f.initial.id);
    expect(o.gapVerification.status).toBe("classified_local_only");
    expect(o.gapVerification.items.length).toBeGreaterThan(0);
    expect(o.gapVerification.honesty.smeGoldFilled).toBe(false);
    expect(o.gapVerification.honesty.scientificallyValidated).toBe(false);
    expect(o.gapVerification.summary.opposeSearchIncomplete).toBeGreaterThan(0);

    const view = await f.service.view("alice", f.initial.id);
    const brief = {
      schemaVersion: "hsi-investigation-brief-1" as const,
      package: view.package!,
      submission: view.submission,
      decision: view.decision,
      scope: "research_only" as const,
      graphPublicationApproved: false as const,
    };
    const {snapshot} = runLivingEvidenceExpansionFromFixtures({
      ...loadFixtures(),
      retrievedAt,
      asOf,
      generatedAt,
    });
    const withSnapshot = await buildResearchOutcome(brief, deliveryHash, {livingEvidenceSnapshot: snapshot});
    expect(withSnapshot.gapVerification.honesty.passageImportAuthorized).toBe(false);
    expect(withSnapshot.gapVerification.unavailableCapabilities.some((s) => /#4/.test(s))).toBe(true);
  });

  test("claim_verifier adapter persists gap verification without approving science", async () => {
    let saved: GapVerificationOutcomeSection | null = null;
    const sink: HsiInvestigationArtifactSink = {
      saveDraft: async () => "draft-ref",
      loadDraft: async () => {
        throw Error("unused");
      },
      saveFalsification: async () => "falsification-ref",
      saveGapVerification: async (report) => {
        saved = report;
        return "gap-ref";
      },
    };
    const executor = createGapVerificationExecutor({
      sink,
      gapInput: {
        asOf,
        branches: [
          {
            id: "b-1",
            assessment: "insufficient_evidence",
            supportingClaimIds: [],
            opposingClaimIds: [],
            missingEvidence: ["Independent contradictory or null findings"],
            uncertainty: [],
          },
        ],
        claimContexts: [],
        localSourcePmids: [],
        contradictions: {recordedOpposingClaimIds: [], searchStatus: "not_recorded"},
        livingEvidence: emptyLiving,
      },
    });
    expect(HSI_ROLE_TOOL_ALLOWLIST.claim_verifier).toContain("evidence.get");
    const result = await executor({
      investigationId: "inv-gap",
      taskId: "gap-verify",
      role: "claim_verifier",
      dependencies: {},
      signal: new AbortController().signal,
      assertTool: (tool) => {
        expect(tool).toBe("evidence.get");
      },
    });
    expect(result.outputRef).toBe("gap-ref");
    expect(saved!.honesty.scientificallyValidated).toBe(false);
    expect(saved!.items[0]!.kind).toBe("oppose_search_incomplete");
  });
});
