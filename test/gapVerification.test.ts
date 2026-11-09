import {describe, expect, test} from "bun:test";
import {readFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {
  buildExpertReviewedGapAssessment,
  GAP_ASSESSMENT_RECORD_SCHEMA,
  projectGapAssessmentRecord,
  projectGapAssessmentRecords,
  projectGapVerificationForOutcome,
  requireSemanticGapSupport,
  verifyRecordedGaps,
} from "../src/evidence/gapVerification";
import type {OpposingEvidenceSearchReport} from "../src/evidence/opposingEvidenceSearch";
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
    const withSnapshot = await buildResearchOutcome(brief, async (text) => deliveryHash(text), {livingEvidenceSnapshot: snapshot});
    expect(withSnapshot.gapVerification.honesty.passageImportAuthorized).toBe(false);
    expect(withSnapshot.gapVerification.unavailableCapabilities.some((s) => /#4/.test(s))).toBe(true);
  });

  test("incomplete literature coverage does not verify scientific novelty gap", () => {
    const opposingSearch: OpposingEvidenceSearchReport = {
      schemaVersion: "hsi-opposing-evidence-search-1",
      method: "hsi.opposing_evidence_search.v1",
      version: "0.1.0",
      searchPerformed: true,
      status: "successful_empty",
      searchScope: {
        providers: ["europe_pmc", "open_targets"],
        contentLevel: "abstract-level",
        dateOfSearch: asOf,
        corpusNote: "Europe PMC only; abstract-level; bounded",
        queryVariants: ["q oppose"],
        bounded: true,
      },
      findings: [],
      recordedOpposingCandidateIds: [],
      coverage: {
        literatureAttempts: 1,
        literatureHits: 0,
        openTargetsAttempts: 0,
        openTargetsHits: 0,
        providerUnavailable: false,
        successfulEmpty: true,
        overallOutcome: "successful_empty",
      },
      searchRecordId: null,
      searchRecordHash: null,
      limitations: ["Incomplete oppose ≠ consensus"],
      structuredComparison: null,
      contradictionInvestigation: null,
      consensusEstablished: false,
      providerUnavailableDistinctFromNoEvidence: true,
      scientificApproval: false,
      graphPromotable: false,
    };

    const report = verifyRecordedGaps({
      asOf,
      branches: [
        {
          id: "b-cov",
          assessment: "insufficient_evidence",
          supportingClaimIds: [],
          opposingClaimIds: [],
          missingEvidence: ["no relevant study retrieved under bounded literature coverage"],
          uncertainty: [],
        },
      ],
      claimContexts: [],
      localSourcePmids: [],
      contradictions: {recordedOpposingClaimIds: [], searchStatus: "successful_empty"},
      livingEvidence: emptyLiving,
      opposingSearch,
    });

    const item = report.items[0]!;
    expect(item.kind).toBe("incomplete_literature_coverage");
    expect(item.scientificGapStatus).toBe("not_verified");
    expect(item.searchCompleteness.impliesScientificNovelty).toBe(false);
    expect(item.scientificNovelty.status).toBe("not_verified");
    expect(item.scientificNovelty.expertReviewRequired).toBe(true);
    expect(item.scientificallyValidated).toBe(false);
    expect(report.honesty.incompleteCoverageDoesNotVerifyNoveltyGap).toBe(true);
    expect(report.honesty.searchCompletenessDistinctFromScientificNovelty).toBe(true);
    expect(item.searchCompleteness.coverageNote).toMatch(/Europe PMC/);
  });

  test("taxonomy distinguishes contradictory, mechanism, computational, and insufficient classes", () => {
    const report = verifyRecordedGaps({
      asOf,
      branches: [
        {
          id: "b-tax",
          assessment: "insufficient_evidence",
          supportingClaimIds: ["HSI-C-TAX-1"],
          opposingClaimIds: ["HSI-C-TAX-OPP"],
          missingEvidence: [
            "Independent contradictory or null findings",
            "Approved source-linked claims for the biological mechanism",
            "Unverified computational hypothesis from in silico docking",
          ],
          uncertainty: [],
        },
      ],
      claimContexts: [],
      localSourcePmids: ["123"],
      contradictions: {
        recordedOpposingClaimIds: ["HSI-C-TAX-OPP"],
        searchStatus: "completed_bounded",
      },
      livingEvidence: emptyLiving,
    });
    expect(report.items.some((i) => i.kind === "contradictory_findings")).toBe(true);
    expect(report.items.some((i) => i.kind === "unresolved_biological_mechanism")).toBe(true);
    expect(report.items.some((i) => i.kind === "unverified_computational_hypothesis")).toBe(true);
    expect(report.items.every((i) => i.scientificGapStatus === "not_verified")).toBe(true);
  });

  test("semantic gap analysis requires supporting passage or reasoning record", () => {
    const absent = requireSemanticGapSupport({});
    expect(absent.acceptedForSemanticAnalysis).toBe(false);
    expect(absent.kind).toBe("absent");

    const withReason = requireSemanticGapSupport({
      reasoningRecord: "Classifier used oppose-search receipt; not passage-entailed.",
    });
    expect(withReason.acceptedForSemanticAnalysis).toBe(true);
    expect(withReason.kind).toBe("explicit_reasoning_record");

    const withPassage = requireSemanticGapSupport({
      supportingPassage: "Quoted abstract sentence (rights-cleared fixture).",
      passageRef: "pmid:18375541#abs-1",
    });
    expect(withPassage.acceptedForSemanticAnalysis).toBe(true);
    expect(withPassage.kind).toBe("supporting_passage");

    const report = verifyRecordedGaps({
      asOf,
      branches: [
        {
          id: "b-sem",
          assessment: "insufficient_evidence",
          supportingClaimIds: [],
          opposingClaimIds: [],
          missingEvidence: ["Approved source-linked claims for the mechanism"],
          uncertainty: [],
        },
      ],
      claimContexts: [],
      localSourcePmids: [],
      contradictions: {recordedOpposingClaimIds: [], searchStatus: "not_recorded"},
      livingEvidence: emptyLiving,
      semanticSupports: [
        {
          matchText: "Approved source-linked claims for the mechanism",
          reasoningRecord: "No local claims bound; engineering missing_local_data.",
        },
      ],
    });
    expect(report.items[0]!.semanticSupport.acceptedForSemanticAnalysis).toBe(true);
    expect(report.items[0]!.semanticSupport.kind).toBe("explicit_reasoning_record");
  });

  test("expert-reviewed assessment requires search scope and date; never scientifically verified", () => {
    const assessment = buildExpertReviewedGapAssessment({
      reviewerId: "reviewer-alice",
      assessedAt: asOf,
      searchScope: {
        providers: ["europe_pmc"],
        contentLevel: "abstract-level",
        dateOfSearch: asOf,
        corpusNote: "Europe PMC abstracts only as of assessment date — not a claim that nobody investigated",
      },
    });
    expect(assessment.status).toBe("expert_reviewed");
    expect(assessment.scientificGapStatus).toBe("expert_reviewed_labelled");
    expect(assessment.searchScope?.dateOfSearch).toBe(asOf);
    expect(assessment.note).toMatch(/does not imply nobody/i);

    expect(() =>
      buildExpertReviewedGapAssessment({
        reviewerId: "reviewer-alice",
        assessedAt: asOf,
        searchScope: {
          providers: [],
          contentLevel: "metadata",
          dateOfSearch: asOf,
          corpusNote: "x",
        },
      }),
    ).toThrow(/providers/);

    const report = verifyRecordedGaps({
      asOf,
      branches: [
        {
          id: "b-exp",
          assessment: "insufficient_evidence",
          supportingClaimIds: [],
          opposingClaimIds: [],
          missingEvidence: ["no relevant study retrieved"],
          uncertainty: [],
        },
      ],
      claimContexts: [],
      localSourcePmids: [],
      contradictions: {recordedOpposingClaimIds: [], searchStatus: "successful_empty"},
      livingEvidence: emptyLiving,
      expertReviews: [
        {
          gapId: "gap-001",
          reviewerId: "reviewer-alice",
          assessedAt: asOf,
          searchScope: {
            providers: ["europe_pmc"],
            contentLevel: "abstract-level",
            dateOfSearch: asOf,
            corpusNote: "Bounded Europe PMC only",
          },
        },
      ],
    });
    expect(report.items[0]!.expertReview.status).toBe("expert_reviewed");
    expect(report.items[0]!.scientificGapStatus).toBe("expert_reviewed_labelled");
    expect(report.items[0]!.scientificallyValidated).toBe(false);
    expect(report.honesty.scientificallyValidated).toBe(false);
    expect(report.honesty.smeGoldFilled).toBe(false);
  });

  test("projects refined-brief gap envelope without verifying novelty from empty search", () => {
    const opposingSearch: OpposingEvidenceSearchReport = {
      schemaVersion: "hsi-opposing-evidence-search-1",
      method: "hsi.opposing_evidence_search.v1",
      version: "0.1.0",
      searchPerformed: true,
      status: "successful_empty",
      searchScope: {
        providers: ["europe_pmc", "open_targets"],
        contentLevel: "metadata",
        dateOfSearch: asOf,
        corpusNote: "Bounded Europe PMC + Open Targets only",
        queryVariants: ["q oppose"],
        bounded: true,
      },
      findings: [],
      recordedOpposingCandidateIds: [],
      coverage: {
        literatureAttempts: 1,
        literatureHits: 0,
        openTargetsAttempts: 1,
        openTargetsHits: 0,
        providerUnavailable: false,
        successfulEmpty: true,
        overallOutcome: "successful_empty",
      },
      searchRecordId: null,
      searchRecordHash: null,
      limitations: ["No opposing bibliographic hits in this bounded search"],
      structuredComparison: null,
      contradictionInvestigation: null,
      consensusEstablished: false,
      providerUnavailableDistinctFromNoEvidence: true,
      scientificApproval: false,
      graphPromotable: false,
    };
    const report = verifyRecordedGaps({
      asOf,
      branches: [
        {
          id: "b-1",
          assessment: "insufficient_evidence",
          supportingClaimIds: [],
          opposingClaimIds: [],
          missingEvidence: [
            "no relevant study retrieved under bounded opposing-evidence literature coverage",
          ],
          uncertainty: [],
        },
      ],
      claimContexts: [],
      localSourcePmids: [],
      contradictions: {recordedOpposingClaimIds: [], searchStatus: "successful_empty"},
      livingEvidence: emptyLiving,
      opposingSearch,
    });
    const records = projectGapAssessmentRecords({
      investigationId: "inv_gap_brief",
      question: "Does IL-6 contribute to insulin resistance in humans?",
      report,
      opposingSearch,
      resultBudget: 100,
    });
    expect(records.length).toBe(1);
    const gap = records[0]!;
    expect(gap.schemaVersion).toBe(GAP_ASSESSMENT_RECORD_SCHEMA);
    expect(gap.gap_id).toBe("gap-001");
    expect(gap.investigation_id).toBe("inv_gap_brief");
    expect(gap.gap_type).toBe("incomplete_literature_coverage");
    expect(gap.searched_sources).toEqual(["europe_pmc", "open_targets"]);
    expect(gap.retrieved_records).toBe(0);
    expect(gap.result_budget).toBe(100);
    expect(gap.verification_status).toBe("not_verified");
    expect(gap.expert_review_required).toBe(true);
    expect(gap.next_research_action.length).toBeGreaterThan(0);
    expect(gap.honesty.searchCompletenessDistinctFromScientificNovelty).toBe(true);
    expect(gap.honesty.notFoundInThisSearchDistinctFromNoEvidence).toBe(true);
    expect(gap.coverage_limitations.some((l) => /Search completeness ≠ scientific novelty/i.test(l))).toBe(
      true,
    );

    const single = projectGapAssessmentRecord({
      investigationId: "inv_gap_brief",
      question: "Does IL-6 contribute to insulin resistance in humans?",
      item: report.items[0]!,
      report,
      opposingSearch,
      resultBudget: 100,
    });
    expect(single.gap_id).toBe(gap.gap_id);
    expect(single.verification_status).toBe("not_verified");
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
