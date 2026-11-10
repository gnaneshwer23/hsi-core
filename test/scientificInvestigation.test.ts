import { describe, expect, test } from "bun:test";
import {
  DATASET_CATALOGUE,
  EVIDENCE_TIERS,
  EVIDENCE_TIER_LABEL,
  InvestigationMemory,
  buildScientificInvestigation,
  claimsForSource,
  recordIndependentReview,
  renderInvestigationJson,
  sourcesForClaim,
} from "../src/scientificInvestigation";

describe("gut–immune–metabolic–neuroinflammation investigation", () => {
  test("keeps six outputs, four tiers, and both provenance directions", () => {
    const record = buildScientificInvestigation("gut-neuro");
    expect(record.question).toBe("How might gut microbial metabolites influence neuroinflammation?");
    expect(record.evidence.length).toBeGreaterThan(0);
    expect(record.relationships.length).toBeGreaterThan(0);
    expect(record.comparison.length).toBeGreaterThan(0);
    expect(record.contradictions).toHaveLength(1);
    expect(record.gaps.length).toBeGreaterThan(0);
    expect(record.hypotheses).toHaveLength(1);
    expect(record.tierCounts.verified_evidence).toBe(0);
    expect(record.tierCounts.uncertain_association).toBeGreaterThan(0);
    expect(record.tierCounts.computational_inference).toBe(1);
    expect(record.tierCounts.unvalidated_hypothesis).toBeGreaterThan(0);
    expect(record.evidence.every((claim) => claim.tier !== "verified_evidence")).toBe(true);
    expect(new Set(record.evidence.map((claim) => claim.tierLabel))).toEqual(
      new Set([
        EVIDENCE_TIER_LABEL.uncertain_association,
        EVIDENCE_TIER_LABEL.computational_inference,
        EVIDENCE_TIER_LABEL.unvalidated_hypothesis,
      ]),
    );
    for (const tier of EVIDENCE_TIERS) expect(record.report.markdown).toContain(EVIDENCE_TIER_LABEL[tier]);

    for (const claim of record.evidence) {
      expect(claim.sourceIds.length).toBeGreaterThan(0);
      for (const sourceId of claim.sourceIds) {
        const source = record.sources.find((item) => item.id === sourceId);
        expect(source?.claimIds).toContain(claim.id);
        expect(sourcesForClaim(record, claim.id).some((item) => item.id === sourceId)).toBe(true);
      }
    }
    for (const source of record.sources) {
      expect(source.passageTextImported).toBe(false);
      expect(source.rightsStatus).toBe("clearance_required");
      expect(source.pubmedFetchedOn).toBe("2026-11-10");
      for (const claimId of source.claimIds) {
        expect(claimsForSource(record, source.id).some((claim) => claim.id === claimId)).toBe(true);
        const claim = record.evidence.find((item) => item.id === claimId);
        expect(claim?.sourceIds).toContain(source.id);
      }
    }
    expect(record.contradictions[0]?.resolution).toBe("unresolved");
    expect(record.patientDataConnected).toBe(false);
    expect(record.datasets.every((item) => item.status === "access_not_requested" && item.patientLevelIngested === false)).toBe(true);
    expect(DATASET_CATALOGUE.map((item) => item.id)).toEqual(["hdruk-700", "hdruk-889", "hdruk-355"]);
  });

  test("refuses self-approval and does not call a comment scientific truth", () => {
    const record = buildScientificInvestigation();
    expect(() => recordIndependentReview(record, { kind: "agent", label: "composer" }, "This comment is long enough to store.", "2026-11-10T12:00:00.000Z")).toThrow(/cannot approve or review itself/);
    expect(() => recordIndependentReview(record, { kind: "drafter", label: "deterministic_composer" }, "This comment is long enough to store.", "2026-11-10T12:00:00.000Z")).toThrow(/cannot approve or review itself/);
    const reviewed = recordIndependentReview(
      record,
      { kind: "human_scientific_reviewer", label: "Example reviewer" },
      "The Th17 frames conflict and the cross-tissue step is unmeasured.",
      "2026-11-10T12:00:00.000Z",
    );
    expect(reviewed.review.status).toBe("comments_recorded");
    expect(reviewed.review.scientificTruthEstablished).toBe(false);
    expect(reviewed.review.aiMayApprove).toBe(false);
    expect(reviewed.report.markdown).toContain("Example reviewer comment");
    expect(reviewed.report.markdown).not.toContain("clinically proven");
  });

  test("saves to a workspace only when writes are authorised, and reopens a browser copy", () => {
    const record = buildScientificInvestigation("metabolic");
    expect(record.question).toContain("insulin resistance");
    expect(record.gaps.some((gap) => gap.id === "gap-metabolic-seed")).toBe(true);
    const memory = new InvestigationMemory();
    expect(memory.saveWorkspace(record, { signedIn: false, writesEnabled: false, role: "anonymous" }).ok).toBe(false);
    expect(memory.saveWorkspace(record, { signedIn: true, writesEnabled: false, role: "researcher" })).toEqual({
      ok: false,
      code: "RESEARCH_WRITES_DISABLED",
    });
    expect(memory.saveWorkspace(record, { signedIn: true, writesEnabled: true, role: "agent" })).toEqual({
      ok: false,
      code: "SIGN_IN_REQUIRED",
    });
    expect(memory.reopen(record.id, "authorised_workspace")).toBeNull();
    const saved = memory.saveWorkspace(record, { signedIn: true, writesEnabled: true, role: "researcher" });
    expect(saved).toEqual({ ok: true, id: record.id, where: "authorised_workspace" });
    expect(memory.reopen(record.id, "authorised_workspace")?.question).toBe(record.question);
    const session = memory.saveBrowserSession(record);
    expect(session.where).toBe("browser_session_only");
    expect(memory.reopen(record.id, "browser_session_only")?.id).toBe(record.id);
    const json = renderInvestigationJson(record);
    expect(JSON.parse(json).id).toBe(record.id);
    expect(record.report.markdown).toContain("## Evidence");
    expect(record.report.markdown).toContain("access not requested");
  });
});
