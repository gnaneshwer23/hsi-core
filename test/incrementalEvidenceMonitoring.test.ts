/**
 * Milestone 8 PR1 — incremental evidence monitoring honesty.
 */
import {describe, expect, test} from "bun:test";
import {
  EUROPE_PMC_CURSOR_MARK_START,
} from "../src/evidence/europePmcBibliographicLookup";
import {
  advanceIncrementalCursor,
  assessSubscriptionFreshness,
  buildIncrementalMonitoringPack,
  detectDuplicateEvidenceKeys,
  draftResearchTopicSubscription,
  projectMonitoringFreshnessOntoInvestigation,
  projectMonitoringSubscriptionPersistenceLines,
  projectSubscriptionToResearcherQuery,
  reportSourceAvailability,
  runIncrementalEvidenceMonitoringCheck,
  applyDynamicRetrievalCursors,
  validateResearchTopicSubscription,
} from "../src/evidence/incrementalEvidenceMonitoring";
import {draftScientificInvestigation} from "../src/evidence/investigationOrchestrationContracts";
import {integrateResearchBrief} from "../src/evidence/researchBriefIntegration";

const asOf = "2026-11-09T12:00:00.000Z";

describe("incremental evidence monitoring (M8 PR1)", () => {
  test("drafts disease / gene / trial / target / pathway / saved_investigation subscriptions", () => {
    const disease = draftResearchTopicSubscription({
      topicKind: "disease",
      topicId: "MONDO_0005100",
      topicLabel: "systemic sclerosis",
      scheduleInterval: "daily_bounded",
      createdAt: asOf,
    });
    expect(disease.providers).toContain("europe_pmc");
    expect(disease.providers).toContain("open_targets");
    expect(disease.budgets.fullDatabaseScrape).toBe(false);
    expect(disease.honesty.unreviewedNotAutoApproved).toBe(true);
    expect(disease.honesty.changeDetectionPipelineNotImplemented).toBe(true);
    expect(disease.honesty.reactomeLiveFetch).toBe(false);
    expect(disease.cursors.find((c) => c.provider === "europe_pmc")?.cursorMark).toBe(
      EUROPE_PMC_CURSOR_MARK_START,
    );
    validateResearchTopicSubscription(disease);

    const gene = draftResearchTopicSubscription({
      topicKind: "gene",
      topicId: "IL21",
      createdAt: asOf,
    });
    expect(gene.providers).toContain("uniprot");

    const target = draftResearchTopicSubscription({
      topicKind: "target",
      topicId: "ENSG00000138685",
      createdAt: asOf,
    });
    expect(target.providers).toContain("open_targets");

    const trial = draftResearchTopicSubscription({
      topicKind: "trial",
      topicId: "NCT01030861",
      createdAt: asOf,
    });
    expect(trial.providers).toContain("clinicaltrials_gov");

    const pathway = draftResearchTopicSubscription({
      topicKind: "pathway",
      topicId: "R-HSA-6785807",
      reactomePathwayId: "R-HSA-6785807",
      createdAt: asOf,
    });
    expect(pathway.providers).toContain("reactome_stub");
    expect(pathway.reactomeStub?.resolution).toBe("stub_only");
    expect(pathway.honesty.reactomeLiveFetch).toBe(false);

    const investigation = draftScientificInvestigation({
      investigationId: "hsi-inv-m8-monitor",
      question: "Monitor IL-21 SSc investigation freshness",
      createdAt: asOf,
    });
    const saved = draftResearchTopicSubscription({
      topicKind: "saved_investigation",
      topicId: investigation.investigationId,
      investigationId: investigation.investigationId,
      createdAt: asOf,
    });
    expect(saved.investigationId).toBe(investigation.investigationId);
  });

  test("refuses invalid Reactome pathway and full-DB scrape", () => {
    expect(() =>
      draftResearchTopicSubscription({
        topicKind: "pathway",
        topicId: "not-a-reactome-id",
        createdAt: asOf,
      }),
    ).toThrow(/valid Reactome/);

    expect(() =>
      draftResearchTopicSubscription({
        topicKind: "disease",
        topicId: "MONDO_0005100",
        budgets: {fullDatabaseScrape: true as unknown as false, maxExternalFetches: 100},
        createdAt: asOf,
      }),
    ).toThrow();
  });

  test("advances cursors, detects duplicates, assesses freshness", () => {
    const cursor = {
      provider: "europe_pmc" as const,
      cursorMark: EUROPE_PMC_CURSOR_MARK_START,
      lastSeenExternalId: null,
      lastRetrievedAt: null,
      providerVersion: "europepmc_rest_search_cursor_v1",
      exhausted: false,
    };
    const advanced = advanceIncrementalCursor(cursor, {
      nextCursorMark: "AoIIP4g...",
      lastSeenExternalId: "19180481",
      retrievedAt: asOf,
      hitCount: 10,
    });
    expect(advanced.cursorMark).toBe("AoIIP4g...");
    expect(advanced.exhausted).toBe(false);
    expect(advanced.lastSeenExternalId).toBe("19180481");

    const exhausted = advanceIncrementalCursor(advanced, {
      nextCursorMark: null,
      retrievedAt: asOf,
      hitCount: 0,
    });
    expect(exhausted.exhausted).toBe(true);

    const dupes = detectDuplicateEvidenceKeys({
      priorKeys: ["europe_pmc:19180481"],
      candidates: [
        {provider: "europe_pmc", externalId: "19180481"},
        {provider: "europe_pmc", externalId: "24586782"},
        {provider: "europe_pmc", externalId: "24586782"},
      ],
    });
    expect(dupes[0]?.duplicateOfPrior).toBe(true);
    expect(dupes[1]?.duplicateOfPrior).toBe(false);
    expect(dupes[2]?.duplicateOfPrior).toBe(true);
    expect(dupes.every((d) => d.claimSupport === "not_assessed")).toBe(true);

    const fresh = assessSubscriptionFreshness(
      {asOf, maxAgeHours: 24, stale: null, lastSuccessfulCheckAt: null},
      "2026-11-09T13:00:00.000Z",
    );
    expect(fresh.stale).toBe(false);
    const stale = assessSubscriptionFreshness(
      {asOf, maxAgeHours: 1, stale: null, lastSuccessfulCheckAt: null},
      "2026-11-10T12:00:00.000Z",
    );
    expect(stale.stale).toBe(true);
  });

  test("source availability stays honest offline and gated", () => {
    const offline = reportSourceAvailability({
      providers: ["europe_pmc", "reactome_stub"],
      mode: "offline_fixture",
    });
    expect(offline[0]?.reachable).toBeNull();
    expect(offline[0]?.probed).toBe(false);
    expect(offline[1]?.detail).toMatch(/stub only/i);

    const gated = reportSourceAvailability({
      providers: ["open_targets"],
      mode: "gated_live",
    });
    expect(gated[0]?.reachable).toBeNull();
    expect(gated[0]?.detail).toMatch(/gated_not_run/);
  });

  test("scheduled check stub is fail-closed offline / gated live", () => {
    const sub = draftResearchTopicSubscription({
      topicKind: "disease",
      topicId: "MONDO_0005100",
      topicLabel: "systemic sclerosis",
      createdAt: asOf,
    });

    const offline = runIncrementalEvidenceMonitoringCheck({
      subscription: sub,
      mode: "offline_fixture",
      generatedAt: asOf,
      priorEvidenceKeys: ["europe_pmc:19180481"],
      fixtureCandidates: [
        {provider: "europe_pmc", externalId: "19180481"},
        {provider: "europe_pmc", externalId: "30760472"},
      ],
    });
    expect(offline.status).toBe("skipped_offline");
    expect(offline.scientificAcceptance).toBe("BLOCKED");
    expect(offline.honesty.liveNetworkUsed).toBe(false);
    expect(offline.honesty.offlineStatusHonest).toBe(true);
    expect(offline.hitCountBounded).toBe(2);
    expect(offline.duplicates.some((d) => d.duplicateOfPrior)).toBe(true);
    expect(offline.dynamicRetrievalQuery?.entities?.diseaseIds).toEqual(["MONDO_0005100"]);

    const gated = runIncrementalEvidenceMonitoringCheck({
      subscription: sub,
      mode: "gated_live",
      liveGateEnabled: false,
      generatedAt: asOf,
    });
    expect(gated.status).toBe("gated_not_run");
    expect(gated.honesty.liveNetworkUsed).toBe(false);

    // Even with gate enabled, PR1 stub must not invent live success.
    const gatedOn = runIncrementalEvidenceMonitoringCheck({
      subscription: sub,
      mode: "gated_live",
      liveGateEnabled: true,
      generatedAt: asOf,
    });
    expect(gatedOn.status).toBe("gated_not_run");
    expect(gatedOn.honesty.liveNetworkUsed).toBe(false);
  });

  test("wires thinly to dynamic retrieval query and M6 investigation freshness", () => {
    const investigation = draftScientificInvestigation({
      investigationId: "hsi-inv-m8-fresh",
      question: "Freshness bind for monitoring",
      createdAt: asOf,
      freshness: {asOf, maxAgeDays: 7, stale: null},
    });
    const sub = draftResearchTopicSubscription({
      topicKind: "saved_investigation",
      topicId: investigation.investigationId,
      investigationId: investigation.investigationId,
      freshness: {asOf, maxAgeHours: 48, stale: null},
      createdAt: asOf,
    });

    const query = projectSubscriptionToResearcherQuery(sub);
    expect(query.contentAccess).toBe("metadata");
    expect(query.maxResults).toBeLessThanOrEqual(sub.budgets.maxResults);

    const projected = projectMonitoringFreshnessOntoInvestigation(sub, investigation);
    expect(projected.asOf).toBe(asOf);
    expect(projected.maxAgeDays).toBe(2);

    let advanced = applyDynamicRetrievalCursors({
      subscription: sub,
      europePmcNextCursorMark: null,
      europePmcLastPmid: "19180481",
      retrievedAt: asOf,
      literatureHitCount: 1,
    });
    expect(advanced.cursors.find((c) => c.provider === "europe_pmc")?.exhausted).toBe(true);
    expect(advanced.freshness.lastSuccessfulCheckAt).toBe(asOf);

    const pack = buildIncrementalMonitoringPack({
      subscriptions: [sub, advanced],
      generatedAt: asOf,
    });
    expect(pack.subscriptions).toHaveLength(2);
    expect(pack.honesty.noKafka).toBe(true);

    const lines = projectMonitoringSubscriptionPersistenceLines(sub);
    expect(lines.some((l) => l.includes("unreviewed_not_auto_approved=true"))).toBe(true);
  });

  test("research brief binds monitoring summary without claiming living complete", () => {
    const sub = draftResearchTopicSubscription({
      topicKind: "disease",
      topicId: "MONDO_0005100",
      createdAt: asOf,
    });
    const brief = integrateResearchBrief({
      question: "M8 monitoring brief bind",
      monitoringSubscription: sub,
    });
    expect(brief.monitoringSummary?.subscriptionId).toBe(sub.subscriptionId);
    expect(brief.monitoringSummary?.fullDatabaseScrape).toBe(false);
    expect(brief.monitoringSummary?.changeDetectionPipelineNotImplemented).toBe(true);
    expect(brief.monitoringSummary?.continuousMonitoringIsNotValidatedScience).toBe(true);
    expect(brief.scientificValidityClaimed).toBe(false);
    expect(brief.limitations.some((l) => /M8 incremental monitoring/i.test(l))).toBe(true);
  });
});
