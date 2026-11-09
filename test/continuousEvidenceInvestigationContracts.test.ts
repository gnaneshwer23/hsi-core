/**
 * Milestone 17 PR3 — continuous evidence investigation honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  activateProgrammeSourceSubscription,
  assessProgrammeEvidenceImpact,
  buildContinuousEvidenceInvestigationPack,
  classifyProgrammeEvidence,
  createMemoryContinuousEvidenceInvestigationStore,
  detectEvidenceChange,
  detectProgrammeEvidenceContradiction,
  draftProgrammeSourceSubscription,
  extractEvidenceContext,
  fingerprintProgrammeSourceSubscription,
  ingestProgrammeEvidenceItem,
  mapProgrammeSourceToM8Provider,
  projectContinuousEvidenceInvestigationPersistenceLines,
  recordRetractionOrCorrection,
  recordScheduledEvidenceRetrieval,
  verifyProgrammeEvidenceSourceIdentity,
  type ProgrammeEvidenceItem,
  type ProgrammeSourceSubscription,
  type ScheduledEvidenceRetrieval,
} from "../src/continuousEvidenceInvestigationContracts";

const asOf = "2026-11-09T17:00:00.000Z";
const programmeId = "hsi-sp-prog-ssc-fixture";

function seedSubscription(
  overrides?: Partial<Parameters<typeof draftProgrammeSourceSubscription>[0]>,
): ProgrammeSourceSubscription {
  return draftProgrammeSourceSubscription({
    id: "hsi-sp-psub-ssc-literature",
    programmeId,
    topicLabel: "SSc Tfh–IL-21 public literature neighbourhood (fixture)",
    sourceKinds: [
      "europe_pmc",
      "open_targets",
      "clinicaltrials_gov",
      "uniprot",
      "reactome_stub",
      "approved_omics",
    ],
    scheduleInterval: "daily_bounded",
    authoredByPrincipalId: "agent-hsi-sp-cei-1",
    authoredByActorKind: "ai_agent",
    createdAt: asOf,
    planId: "hsi-sp-plan-ssc-fixture",
    workstreamId: "hsi-sp-ws-ssc-fixture",
    m8SubscriptionId: "m8-sub-ssc-fixture-001",
    nextRetrievalAt: asOf,
    ...overrides,
  });
}

function seedActiveSubscription(): ProgrammeSourceSubscription {
  const draft = seedSubscription();
  return activateProgrammeSourceSubscription({
    subscription: draft,
    updatedAt: asOf,
    actor: {principalId: "principal-researcher-alice", actorKind: "human"},
    nextRetrievalAt: asOf,
  });
}

function seedRetrieval(
  subscription: ProgrammeSourceSubscription = seedActiveSubscription(),
  overrides?: Partial<Parameters<typeof recordScheduledEvidenceRetrieval>[0]>,
): ScheduledEvidenceRetrieval {
  return recordScheduledEvidenceRetrieval({
    id: "hsi-sp-sret-ssc-001",
    subscription,
    status: "completed_bounded",
    scheduledAt: asOf,
    startedAt: asOf,
    completedAt: asOf,
    retrievedAt: asOf,
    hitCountBounded: 2,
    truncatedByBudget: false,
    liveNetworkUsed: false,
    offlineFixture: true,
    snapshotRef: "snap://fixture/ssc-cei-001",
    authoredByPrincipalId: "service-cei-scheduler",
    authoredByActorKind: "service",
    ...overrides,
  });
}

function seedEvidence(
  subscription: ProgrammeSourceSubscription,
  retrieval: ScheduledEvidenceRetrieval,
  overrides?: Partial<Parameters<typeof ingestProgrammeEvidenceItem>[0]>,
): ProgrammeEvidenceItem {
  return ingestProgrammeEvidenceItem({
    id: "hsi-sp-evid-pmid-fixture-1",
    subscription,
    retrieval,
    sourceKind: "europe_pmc",
    externalId: "PMID:9990001",
    title: "Fixture public literature record for SSc neighbourhood scoping",
    classification: "literature_record",
    sourceIdentityState: "verified_fixture",
    extractedClaimSummary:
      "Fixture extracted claim text for human review only — not approved.",
    priorEvidence: [],
    snapshotRef: "snap://fixture/ssc-cei-001#pmid-9990001",
    retrievedAt: asOf,
    createdAt: asOf,
    ...overrides,
  });
}

describe("continuous evidence investigation contracts (M17 PR3)", () => {
  test("drafts programme source subscription extending M8 providers", () => {
    const subscription = seedSubscription();
    expect(subscription.lifecycle).toBe("draft");
    expect(subscription.honesty.extendsM8IncrementalEvidenceMonitoring).toBe(
      true,
    );
    expect(subscription.honesty.newPublicationIsNotConsensusChange).toBe(true);
    expect(subscription.honesty.extractedClaimsNotAutoApproved).toBe(true);
    expect(subscription.honesty.scientificKnowledgeEvolution).toBe(false);
    expect(subscription.licenceBound.fullDatabaseScrape).toBe(false);
    expect(mapProgrammeSourceToM8Provider("europe_pmc")).toBe("europe_pmc");
    expect(mapProgrammeSourceToM8Provider("reactome_stub")).toBe(
      "reactome_stub",
    );
    expect(mapProgrammeSourceToM8Provider("approved_omics")).toBeNull();
    expect(fingerprintProgrammeSourceSubscription(subscription)).toMatch(
      /^[a-f0-9]{64}$/,
    );

    expect(() =>
      seedSubscription({
        topicLabel: "We have proven a consensus change via auto-approve.",
      }),
    ).toThrow(/must not invent/);
  });

  test("human activation gates scheduled retrieval and preserves snapshots", () => {
    const draft = seedSubscription();
    expect(() =>
      activateProgrammeSourceSubscription({
        subscription: draft,
        updatedAt: asOf,
        actor: {principalId: "agent-hsi-sp-cei-1", actorKind: "ai_agent"},
      }),
    ).toThrow(/Only human researchers may activate/);

    const active = seedActiveSubscription();
    expect(active.lifecycle).toBe("active");

    const retrieval = seedRetrieval(active);
    expect(retrieval.status).toBe("completed_bounded");
    expect(retrieval.retrievedAt).toBe(asOf);
    expect(retrieval.snapshotRef).toBe("snap://fixture/ssc-cei-001");
    expect(retrieval.offlineFixture).toBe(true);
    expect(retrieval.honesty.snapshotsAndRetrievalTimestampsPreserved).toBe(
      true,
    );

    expect(() =>
      recordScheduledEvidenceRetrieval({
        id: "hsi-sp-sret-bad",
        subscription: draft,
        status: "completed_bounded",
        scheduledAt: asOf,
        retrievedAt: asOf,
        snapshotRef: "snap://x",
        authoredByPrincipalId: "service-cei-scheduler",
      }),
    ).toThrow(/active subscription/);
  });

  test("deduplicates evidence and refuses auto-approved extracted claims", () => {
    const subscription = seedActiveSubscription();
    const retrieval = seedRetrieval(subscription);
    const first = seedEvidence(subscription, retrieval);
    expect(first.duplicateOfPrior).toBe(false);
    expect(first.extractedClaimsNotAutoApproved).toBe(true);
    expect(first.validSupport).toBe("not_assessed");

    const dup = ingestProgrammeEvidenceItem({
      id: "hsi-sp-evid-pmid-fixture-1b",
      subscription,
      retrieval,
      sourceKind: "europe_pmc",
      externalId: "PMID:9990001",
      title: "Fixture duplicate literature record",
      classification: "literature_record",
      priorEvidence: [first],
      snapshotRef: "snap://fixture/ssc-cei-001#pmid-9990001-dup",
      retrievedAt: asOf,
      createdAt: asOf,
    });
    expect(dup.duplicateOfPrior).toBe(true);
    expect(dup.duplicateOfEvidenceId).toBe(first.id);

    const verified = verifyProgrammeEvidenceSourceIdentity({
      evidence: first,
      state: "verified_fixture",
      updatedAt: asOf,
    });
    expect(verified.sourceIdentityState).toBe("verified_fixture");

    const classified = classifyProgrammeEvidence({
      evidence: verified,
      classification: "literature_record",
      updatedAt: asOf,
    });
    expect(classified.extractedClaimsNotAutoApproved).toBe(true);
  });

  test("context extraction and contradiction detection are non-consensus", () => {
    const subscription = seedActiveSubscription();
    const retrieval = seedRetrieval(subscription);
    const a = seedEvidence(subscription, retrieval);
    const b = ingestProgrammeEvidenceItem({
      id: "hsi-sp-evid-pmid-fixture-2",
      subscription,
      retrieval,
      sourceKind: "europe_pmc",
      externalId: "PMID:9990002",
      title: "Fixture opposing neighbourhood literature record",
      classification: "literature_record",
      priorEvidence: [a],
      snapshotRef: "snap://fixture/ssc-cei-001#pmid-9990002",
      retrievedAt: asOf,
      createdAt: asOf,
    });

    const context = extractEvidenceContext({
      id: "hsi-sp-ctx-ssc-1",
      evidence: a,
      contextSummary:
        "Fixture context for workstream neighbourhood review — not a consensus change.",
      authoredByPrincipalId: "agent-hsi-sp-cei-1",
      authoredByActorKind: "ai_agent",
      createdAt: asOf,
      relatedWorkstreamIds: ["hsi-sp-ws-ssc-fixture"],
      relatedPlanId: "hsi-sp-plan-ssc-fixture",
    });
    expect(context.notConsensusChange).toBe(true);
    expect(context.extractedClaimsNotAutoApproved).toBe(true);

    const contradiction = detectProgrammeEvidenceContradiction({
      id: "hsi-sp-ctr-ssc-1",
      evidenceA: a,
      evidenceB: b,
      status: "candidate_recorded",
      summary:
        "Fixture opposing neighbourhood traces recorded for human review — detection is not adjudication.",
      authoredByPrincipalId: "agent-hsi-sp-cei-1",
      createdAt: asOf,
    });
    expect(contradiction.notConsensusChange).toBe(true);
    expect(contradiction.notAutoApproved).toBe(true);
  });

  test("retraction clears support; change detection preserves snapshots", () => {
    const subscription = seedActiveSubscription();
    const retrieval = seedRetrieval(subscription);
    const evidence = seedEvidence(subscription, retrieval);

    const {record, evidence: retracted} = recordRetractionOrCorrection({
      id: "hsi-sp-rtx-ssc-1",
      evidence,
      kind: "retraction",
      summary: "Fixture retraction notice for engineering honesty checks.",
      noticedAt: asOf,
      authoredByPrincipalId: "service-cei-retraction-watch",
    });
    expect(record.retractedIsNotValidSupport).toBe(true);
    expect(record.validSupportAfter).toBe(false);
    expect(retracted.retractedOrCorrected).toBe(true);
    expect(retracted.validSupport).toBe(false);

    const change = detectEvidenceChange({
      id: "hsi-sp-chg-ssc-1",
      evidence: retracted,
      changeKind: "retraction_or_correction",
      summary:
        "Fixture evidence change after retraction notice — new publication is not consensus change.",
      previousSnapshotRef: evidence.snapshotRef,
      currentSnapshotRef: "snap://fixture/ssc-cei-001#pmid-9990001-rtx",
      detectedAt: asOf,
      authoredByPrincipalId: "service-cei-change-watch",
    });
    expect(change.newPublicationIsNotConsensusChange).toBe(true);
    expect(change.previousSnapshotRef).toBe(evidence.snapshotRef);
  });

  test("programme impact assessment requires human review for material classes", () => {
    const impact = assessProgrammeEvidenceImpact({
      id: "hsi-sp-imp-ssc-1",
      programmeId,
      subjectRefs: ["hsi-sp-evid-pmid-fixture-1", "hsi-sp-chg-ssc-1"],
      impactClass: "may_affect_evidence_gap",
      summary:
        "Fixture impact advisory for evidence-gap review — not auto-approval and not consensus change.",
      authoredByPrincipalId: "agent-hsi-sp-cei-1",
      createdAt: asOf,
    });
    expect(impact.requiresHumanReview).toBe(true);
    expect(impact.notAutoApproved).toBe(true);
    expect(impact.newPublicationIsNotConsensusChange).toBe(true);

    expect(() =>
      assessProgrammeEvidenceImpact({
        id: "hsi-sp-imp-bad",
        programmeId,
        subjectRefs: ["hsi-sp-evid-pmid-fixture-1"],
        impactClass: "requires_human_review",
        summary: "Bad impact without human review flag.",
        authoredByPrincipalId: "agent-hsi-sp-cei-1",
        createdAt: asOf,
        requiresHumanReview: false,
      }),
    ).toThrow(/require human review/);
  });

  test("thin store and pack projection preserve honesty gates", () => {
    const store = createMemoryContinuousEvidenceInvestigationStore();
    const subscription = seedActiveSubscription();
    const retrieval = seedRetrieval(subscription);
    const evidence = seedEvidence(subscription, retrieval);
    const context = extractEvidenceContext({
      id: "hsi-sp-ctx-store-1",
      evidence,
      contextSummary: "Store fixture context — not consensus change.",
      authoredByPrincipalId: "agent-hsi-sp-cei-1",
      createdAt: asOf,
    });
    const contradiction = detectProgrammeEvidenceContradiction({
      id: "hsi-sp-ctr-store-1",
      evidenceA: evidence,
      evidenceB: ingestProgrammeEvidenceItem({
        id: "hsi-sp-evid-store-2",
        subscription,
        retrieval,
        sourceKind: "open_targets",
        externalId: "EFO_0000699",
        title: "Fixture Open Targets association row",
        classification: "target_association",
        priorEvidence: [evidence],
        snapshotRef: "snap://fixture/ssc-cei-001#ot",
        retrievedAt: asOf,
        createdAt: asOf,
      }),
      status: "none_detected_fixture",
      summary: "No contradiction in fixture pair — still not consensus.",
      authoredByPrincipalId: "agent-hsi-sp-cei-1",
      createdAt: asOf,
    });
    const {record: retraction, evidence: retracted} = recordRetractionOrCorrection(
      {
        id: "hsi-sp-rtx-store-1",
        evidence,
        kind: "correction",
        summary: "Fixture correction notice.",
        noticedAt: asOf,
        authoredByPrincipalId: "service-cei-retraction-watch",
      },
    );
    const change = detectEvidenceChange({
      id: "hsi-sp-chg-store-1",
      evidence: retracted,
      changeKind: "metadata_refresh",
      summary: "Fixture metadata refresh — not consensus change.",
      previousSnapshotRef: evidence.snapshotRef,
      currentSnapshotRef: retracted.snapshotRef,
      detectedAt: asOf,
      authoredByPrincipalId: "service-cei-change-watch",
    });
    const impact = assessProgrammeEvidenceImpact({
      id: "hsi-sp-imp-store-1",
      programmeId,
      subjectRefs: [retracted.id, change.id],
      impactClass: "informational_only",
      summary: "Informational fixture impact only.",
      authoredByPrincipalId: "agent-hsi-sp-cei-1",
      createdAt: asOf,
      requiresHumanReview: false,
    });

    store.upsertSubscription(subscription);
    store.upsertRetrieval(retrieval);
    store.upsertEvidence(retracted);
    store.upsertContext(context);
    store.upsertContradiction(contradiction);
    store.upsertRetraction(retraction);
    store.upsertChange(change);
    store.upsertImpact(impact);

    expect(store.listSubscriptions(programmeId)).toHaveLength(1);
    expect(store.listEvidence(programmeId)).toHaveLength(1);
    expect(store.getEvidence(retracted.id)?.validSupport).toBe(false);

    const pack = buildContinuousEvidenceInvestigationPack({
      subscriptions: [subscription],
      retrievals: [retrieval],
      evidence: [retracted],
      contexts: [context],
      contradictions: [contradiction],
      retractions: [retraction],
      changes: [change],
      impacts: [impact],
      asOf,
    });
    expect(pack.subscriptionCount).toBe(1);
    expect(pack.evidenceCount).toBe(1);
    expect(pack.honesty.retractedIsNotValidSupport).toBe(true);
    expect(pack.honesty.scientificKnowledgeEvolution).toBe(false);

    const lines = projectContinuousEvidenceInvestigationPersistenceLines({
      subscription,
      retrieval,
      evidence: [retracted],
      contexts: [context],
      contradictions: [contradiction],
      retractions: [retraction],
      changes: [change],
      impacts: [impact],
    });
    expect(lines).toContain("newPublicationIsNotConsensusChange=true");
    expect(lines).toContain("extractedClaimsNotAutoApproved=true");
    expect(lines).toContain("retractedIsNotValidSupport=true");
    expect(lines).toContain("scientificKnowledgeEvolution=false");
    expect(lines).toContain("neon=red-wave-only");
  });
});
