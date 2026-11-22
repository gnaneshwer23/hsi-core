import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assertHsiCompanionWorkspaceHandoffOwnerAuthorized,
  HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL,
  validateHsiCompanionWorkspaceHandoffOwnerApproval,
} from "../src/hsiCompanionWorkspaceHandoffAuthorization";
import {
  buildCompanionWorkspaceHandoff,
  mapCandidatesToCompanionBound,
  mapLiveEvidenceRecordsToCompanionBound,
} from "../src/investigation/companionWorkspaceHandoff";
import {
  assertHsiCompanionWorkspaceHandoffSoftLand,
  hsiCompanionWorkspaceHandoffSoftLandPacket,
  hsiCompanionWorkspaceHandoffSurfaceById,
} from "../src/operations/hsiCompanionWorkspaceHandoffSoftLand";
import type {Candidate} from "../src/investigation/liveRun";
import type {LiveEvidenceRecord} from "../src/evidence/liveSources";
import {
  scientificCompanionHref,
  COMPANION_HANDOFF_FROM_WORKSPACE,
} from "../site/src/lib/workbenchPrimary";

describe("U45 Companion workspace handoff", () => {
  test("owner approval refuses network retrieval / claim verification", () => {
    expect(() =>
      validateHsiCompanionWorkspaceHandoffOwnerApproval(
        HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL,
      ),
    ).not.toThrow();
    expect(() =>
      validateHsiCompanionWorkspaceHandoffOwnerApproval({
        ...HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL,
        companionPerformsNetworkRetrieval: true as false,
      }),
    ).toThrow(/retrieval|verification|avatar/i);
  });

  test("soft-land catalogues handoff surfaces and keeps retrieval gated", () => {
    const packet = hsiCompanionWorkspaceHandoffSoftLandPacket();
    const summary = assertHsiCompanionWorkspaceHandoffSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.companionPerformsNetworkRetrieval).toBe(false);
    expect(hsiCompanionWorkspaceHandoffSurfaceById("map_candidates").engineeringReady).toBe(true);
    expect(
      hsiCompanionWorkspaceHandoffSurfaceById("companion_network_retrieval").engineeringReady,
    ).toBe(false);
  });

  test("maps live records and candidates without escalating verification", () => {
    const records: LiveEvidenceRecord[] = [
      {
        provider: "europe-pmc",
        sourceId: "europepmc:MED:1",
        title: "Demo title",
        abstract: null,
        doi: null,
        pmid: "1",
        publicationDate: null,
        sourceUrl: "https://europepmc.org/article/MED/1",
        retrievedAt: "2026-11-22T08:00:00Z",
        licenceStatus: "not_assessed",
        retraction: "not_flagged_by_provider",
        studyTypes: [],
        verificationState: "metadata_retrieved_not_claim_verified",
        reviewState: "unreviewed",
      },
    ];
    const bound = mapLiveEvidenceRecordsToCompanionBound(records);
    expect(bound).toHaveLength(1);
    expect(bound[0]!.verificationState).toBe("metadata_retrieved_not_claim_verified");
    expect(bound[0]!.provider).toBe("europe-pmc");

    const candidates: Candidate[] = [
      {
        id: "c1",
        relationId: "r1",
        subject: "IL-21",
        object: "Tfh",
        contexts: ["sle"],
        species: "human",
        sourceId: "openalex:W1",
        sourceUrl: "https://openalex.org/W1",
        sentence: "IL-21 associated with Tfh expansion in SLE.",
        state: "extracted_candidate",
        lexicalPolarity: "supporting",
        polarity: "uncertain",
        polarityBasis: "not_assessed",
        direction: "not_assessed",
        priority: {score: 1, reasons: []},
        verification: "not_run",
        verdicts: [],
        retraction: "unknown",
      },
    ];
    const fromCandidates = mapCandidatesToCompanionBound(candidates);
    expect(fromCandidates[0]!.title).toContain("IL-21");
    expect(fromCandidates[0]!.provider).toBe("openalex");
    expect(fromCandidates[0]!.reviewState).toBe("unreviewed");
  });

  test("buildCompanionWorkspaceHandoff loads curated fixture for il21-autoimmune", () => {
    assertHsiCompanionWorkspaceHandoffOwnerAuthorized(
      HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL,
    );
    const handoff = buildCompanionWorkspaceHandoff({
      authorization: HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL,
      scenarioId: "il21-autoimmune",
      useFixtureIfEmpty: true,
    });
    expect(handoff.scenarioId).toBe("il21-autoimmune");
    expect(handoff.question).toMatch(/IL-21/i);
    expect(handoff.records.length).toBeGreaterThan(0);
    expect(handoff.honesty.companionPerformedNetworkRetrieval).toBe(false);
    expect(handoff.honesty.inventsLiterature).toBe(false);
    expect(handoff.records.every((r) => r.reviewState === "unreviewed")).toBe(true);
  });

  test("scientificCompanionHref encodes workspace handoff query", () => {
    expect(
      scientificCompanionHref({scenarioId: "il21-autoimmune", fromWorkspace: true}),
    ).toContain(`from=${COMPANION_HANDOFF_FROM_WORKSPACE}`);
    expect(
      scientificCompanionHref({scenarioId: "il21-autoimmune", fromWorkspace: true}),
    ).toContain("scenario=il21-autoimmune");
    expect(scientificCompanionHref()).toBe("/research/companion");
  });

  test("docs keep U45 honesty", () => {
    const doc = readFileSync(
      join(
        import.meta.dir,
        "../docs/engineering/HSI_U45_COMPANION_WORKSPACE_HANDOFF_2026-11-22.md",
      ),
      "utf8",
    );
    expect(doc).toContain("workspace");
    expect(doc).toMatch(/not.*retriev|never.*retriev/i);
  });
});
