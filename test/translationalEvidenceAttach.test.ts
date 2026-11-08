/**
 * PR 7 — Translational O-04 attach honesty.
 */
import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  attachTranslationalTrialFromCtgovStudy,
  attachTranslationalTrialFromLookup,
  buildTranslationalLandscapeSnapshot,
  projectTranslationalForOutcome,
} from "../src/evidence/translationalEvidenceAttach";
import type {OpenTargetsDiseaseRecord} from "../src/evidence/openTargetsLookup";
import {buildResearchOutcome} from "../src/researchOutcome";
import {deliveryHarness} from "./fixtures/deliveryHarness";
import {deliveryHash} from "../src/server/investigationDeliveryService";
import type {EvidenceBrief} from "../src/investigationDelivery";

const fixturePath = join(
  import.meta.dir,
  "../research/domain-graph/living-evidence/fixtures/ctgov.nct01030861.json",
);

function loadStudy(): Record<string, unknown> {
  return JSON.parse(readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
}

const teplizumabTargets: OpenTargetsDiseaseRecord[] = [
  {
    provider: "open_targets_platform_graphql_v4",
    diseaseId: "MONDO_0005147",
    diseaseName: "type 1 diabetes mellitus",
    associationCount: 1,
    associations: [
      {
        targetEnsemblId: "ENSG00000160791",
        approvedSymbol: "Teplizumab",
        score: 0.4,
        datatypeScores: [{id: "literature", score: 0.3}],
      },
    ],
    retrievedAt: "2026-11-08T21:00:00.000Z",
    responseIdentity: "a".repeat(64),
    verificationState: "metadata_retrieved_not_claim_verified",
    reviewState: "unreviewed",
    scientificApproval: false,
    graphPromotable: false,
    passageImportAuthorized: false,
  },
];

describe("translational evidence O-04 attach", () => {
  test("separates registry planes and refuses efficacy inference from registration", () => {
    const study = loadStudy();
    const record = attachTranslationalTrialFromCtgovStudy({
      nctId: "NCT01030861",
      study,
      responseIdentity: "b".repeat(64),
      retrievedAt: "2026-11-08T21:00:00.000Z",
      openTargets: teplizumabTargets,
    });

    expect(record.registration.registrationImpliesEfficacy).toBe(false);
    expect(record.registration.overallStatus).toBe("COMPLETED");
    expect(record.registration.briefTitle).toMatch(/Teplizumab/i);
    expect(record.interventionTargetMapping.interventions.some((i) => /teplizumab/i.test(i.name))).toBe(
      true,
    );
    expect(record.interventionTargetMapping.mappedTargets.some((t) => t.targetSymbol === "Teplizumab")).toBe(
      true,
    );
    expect(
      record.interventionTargetMapping.mappedTargets.every((t) => t.associationImpliesEfficacy === false),
    ).toBe(true);
    expect(record.registryReportedResults.hasResultsSection).toBe(true);
    expect(record.registryReportedResults.registryResultsAreNotEfficacyProof).toBe(true);
    expect(record.publishedOutcomes.length).toBeGreaterThan(0);
    expect(record.publishedOutcomes.every((p) => p.claimSupport === "not_assessed")).toBe(true);
    expect(record.missingOutcomeEvidence.every((m) => m.missingResultsImpliesFailure === false)).toBe(true);

    const snapshot = buildTranslationalLandscapeSnapshot({
      origin: "fixture_replay",
      generatedAt: "2026-11-08T21:55:00.000Z",
      asOf: "2026-11-08T21:55:00.000Z",
      records: [record],
    });
    expect(snapshot.honesty.registrationIsNotEfficacy).toBe(true);
    expect(snapshot.honesty.missingResultsIsNotFailure).toBe(true);
    expect(snapshot.honesty.eligibilityAssessed).toBe(false);
    expect(snapshot.honesty.confirmedEligible).toBe(false);
    expect(snapshot.honesty.gateCAutoApprove).toBe(false);

    const projected = projectTranslationalForOutcome(snapshot);
    expect(projected.status).toBe("attached_registry_snapshot");
    expect(projected.planes.trialRegistrationAndStatus).toHaveLength(1);
    expect(projected.planes.interventionAndTargetMapping).toHaveLength(1);
    expect(projected.planes.registryReportedResults).toHaveLength(1);
    expect(projected.planes.publishedOutcomes.length).toBeGreaterThan(0);
    expect(projected.eligibilityAssessed).toBe(false);
    expect(projected.confirmedEligible).toBe(false);
  });

  test("missing results section is not therapy failure", () => {
    const study = {
      protocolSection: {
        identificationModule: {
          nctId: "NCT01030861",
          briefTitle: "Registry-only stub without results",
        },
        statusModule: {overallStatus: "RECRUITING"},
        conditionsModule: {conditions: ["Type 1 Diabetes"]},
        designModule: {studyType: "INTERVENTIONAL", phases: ["PHASE1"]},
        armsInterventionsModule: {
          interventions: [{type: "DRUG", name: "ExampleMab", description: "test"}],
        },
      },
      hasResults: false,
    };
    const record = attachTranslationalTrialFromCtgovStudy({
      nctId: "NCT01030861",
      study,
      lookupOk: true,
    });
    expect(record.registryReportedResults.hasResultsSection).toBe(false);
    expect(record.missingOutcomeEvidence.some((m) => m.kind === "no_results_section")).toBe(true);
    expect(record.missingOutcomeEvidence.every((m) => m.missingResultsImpliesFailure === false)).toBe(true);
    expect(record.registration.registrationImpliesEfficacy).toBe(false);
  });

  test("provider lookup failure is distinct from empty evidence / failure claim", () => {
    const record = attachTranslationalTrialFromLookup({
      result: {
        ok: false,
        provider: "clinicaltrials_gov_api_v2",
        nctId: "NCT01030861",
        query: "https://clinicaltrials.gov/api/v2/studies/NCT01030861?format=json",
        retrievedAt: "2026-11-08T21:00:00.000Z",
        outcome: "provider_unavailable",
        httpStatus: 503,
        detail: "unavailable",
      },
    });
    expect(record.lookupOk).toBe(false);
    expect(record.missingOutcomeEvidence.some((m) => m.kind === "provider_lookup_failed")).toBe(true);
    const snapshot = buildTranslationalLandscapeSnapshot({
      origin: "live_provider_unverified",
      generatedAt: "2026-11-08T21:55:00.000Z",
      asOf: "2026-11-08T21:55:00.000Z",
      records: [record],
    });
    const projected = projectTranslationalForOutcome(snapshot);
    expect(projected.status).toBe("provider_unavailable");
    expect(projected.note).toMatch(/Provider failure is not empty evidence/i);
  });

  test("research outcome binds O-04 planes and keeps eligibility false", async () => {
    const study = loadStudy();
    const record = attachTranslationalTrialFromCtgovStudy({
      nctId: "NCT01030861",
      study,
      openTargets: teplizumabTargets,
    });
    const landscape = buildTranslationalLandscapeSnapshot({
      origin: "fixture_replay",
      generatedAt: "2026-11-08T21:55:00.000Z",
      asOf: "2026-11-08T21:55:00.000Z",
      records: [record],
    });

    const f = deliveryHarness();
    const view = await f.service.view("alice", f.initial.id);
    const brief: EvidenceBrief = {
      schemaVersion: "hsi-investigation-brief-1",
      package: view.package!,
      submission: view.submission,
      decision: view.decision,
      scope: "research_only",
      graphPublicationApproved: false,
    };
    const outcome = await buildResearchOutcome(brief, deliveryHash, {
      translationalLandscape: landscape,
    });
    expect(outcome.trials.status).toBe("attached_registry_snapshot");
    expect(outcome.trials.eligibilityAssessed).toBe(false);
    expect(outcome.trials.confirmedEligible).toBe(false);
    expect(outcome.trials.honesty?.registrationIsNotEfficacy).toBe(true);
    expect(outcome.trials.honesty?.missingResultsIsNotFailure).toBe(true);
    expect(outcome.researchBrief).not.toBeNull();
    expect(outcome.researchBrief!.scientificValidityClaimed).toBe(false);
    expect(outcome.researchBrief!.eligibilityInferred).toBe(false);
    expect(outcome.researchBrief!.efficacyInferred).toBe(false);
    expect(outcome.researchBrief!.limitations.some((l) => /registration is not efficacy/i.test(l))).toBe(
      true,
    );
    expect(outcome.researchBrief!.candidatesRemainUnapproved).toBe(true);
    expect(outcome.researchBrief!.reviewGatesIntact).toBe(true);
  });
});
