import {describe, expect, test} from "bun:test";
import {readFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {assertValidPmid, parseEuropePmcBibliographicPayload} from "../src/evidence/europePmcBibliographicLookup";
import {
  assertValidOpenTargetsDiseaseId,
  parseOpenTargetsDiseasePayload,
} from "../src/evidence/openTargetsLookup";
import {
  LIVING_EVIDENCE_DISEASE_PINS,
  LIVING_EVIDENCE_NCT_PINS,
  LIVING_EVIDENCE_PMID_PINS,
  assertLivingEvidencePins,
  parseLivingEvidenceExpansionReceipt,
  projectLivingEvidenceForOutcome,
  runLivingEvidenceExpansionFromFixtures,
} from "../src/evidence/livingEvidenceExpansion";
import {buildResearchOutcome} from "../src/researchOutcome";
import {deliveryHarness} from "./fixtures/deliveryHarness";
import {deliveryHash} from "../src/server/investigationDeliveryService";

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

describe("living evidence expansion (step 03)", () => {
  test("pins are valid provider identities", () => {
    const pins = assertLivingEvidencePins();
    expect(pins.pmids).toEqual(["18375541", "24586782", "30760472"]);
    expect(pins.diseaseIds).toEqual(["MONDO_0008383", "MONDO_0005100"]);
    expect(pins.nctIds).toEqual(["NCT01030861"]);
    for (const pmid of pins.pmids) expect(assertValidPmid(pmid)).toBe(pmid);
    for (const id of pins.diseaseIds) expect(assertValidOpenTargetsDiseaseId(id)).toBe(id);
  });

  test("parses captured Europe PMC and Open Targets fixtures as metadata-only", () => {
    const fixtures = loadFixtures();
    for (const pmid of LIVING_EVIDENCE_PMID_PINS) {
      const parsed = parseEuropePmcBibliographicPayload({
        query: `EXT_ID:${pmid} AND SRC:MED`,
        bodyText: fixtures.europePmcBodiesByPmid[pmid]!.bodyText,
        httpStatus: 200,
        retrievedAt,
      });
      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        expect(parsed.records.some((r) => r.pmid === pmid)).toBe(true);
        expect(parsed.records.every((r) => r.scientificApproval === false && r.graphPromotable === false)).toBe(true);
      }
    }
    for (const diseaseId of LIVING_EVIDENCE_DISEASE_PINS) {
      const parsed = parseOpenTargetsDiseasePayload({
        diseaseId,
        bodyText: fixtures.openTargetsBodiesByDiseaseId[diseaseId]!.bodyText,
        httpStatus: 200,
        retrievedAt,
      });
      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        expect(parsed.record.diseaseId).toBe(diseaseId);
        expect(parsed.record.passageImportAuthorized).toBe(false);
        expect(parsed.record.graphPromotable).toBe(false);
        expect(parsed.record.associations.length).toBeGreaterThan(0);
      }
    }
  });

  test("fixture replay keeps rights fail-closed and emits graph relationship candidates", () => {
    const {receipt} = runLivingEvidenceExpansionFromFixtures({
      ...loadFixtures(),
      retrievedAt,
      asOf,
      generatedAt,
    });
    const parsed = parseLivingEvidenceExpansionReceipt(receipt);
    expect(parsed.engineeringHarness).toBe("CLEARED");
    expect(parsed.scientificAcceptance).toBe("BLOCKED");
    expect(parsed.rightsAcceptance).toBe("BLOCKED");
    expect(parsed.humanCleared).toBe(false);
    expect(parsed.passageImported).toBe(false);
    expect(parsed.bibliographicRetrieved).toBe(3);
    expect(parsed.openTargetsRetrieved).toBe(2);
    expect(parsed.registryEntitiesResolved).toBe(1);
    expect(parsed.graphRelationshipCandidates).toBeGreaterThan(0);
    expect(parsed.snapshot.licensing.passageImportAuthorized).toBe(false);
    expect(parsed.snapshot.honesty.trialsAttachedToInvestigation).toBe(false);
    expect(parsed.snapshot.graphRelationshipCandidates.every((c) => c.graphPromotable === false)).toBe(true);
    expect(parsed.snapshot.entityResolutions.every((e) => e.needsHumanReview === true)).toBe(true);
    expect(parsed.unavailableCapabilities.some((s) => /passage import/i.test(s))).toBe(true);
  });

  test("outcome projection binds overlapping PMIDs; synthetic delivery fixture stays not_attached", async () => {
    const {snapshot} = runLivingEvidenceExpansionFromFixtures({
      ...loadFixtures(),
      retrievedAt,
      asOf,
      generatedAt,
    });
    const bound = projectLivingEvidenceForOutcome({
      sourcePmids: ["18375541", "99999999"],
      snapshot,
    });
    expect(bound.status).toBe("bound_metadata_refresh");
    expect(bound.matchedPmids).toEqual(["18375541"]);
    expect(bound.bibliographic).toHaveLength(1);
    expect(bound.licensing?.humanCleared).toBe(false);
    expect(bound.registryIdentityOnly[0]?.translationalAttachStatus).toBe("not_attached_step_05");

    const unbound = projectLivingEvidenceForOutcome({sourcePmids: ["123"], snapshot});
    expect(unbound.status).toBe("not_attached");

    const f = deliveryHarness();
    const o = await f.service.outcome("alice", f.initial.id);
    expect(o.livingEvidence.status).toBe("not_attached");
    expect(o.stages.find((s) => s.id === "external_search")?.status).toBe("not_recorded");
    expect(o.trials.status).toBe("not_queried");

    const view = await f.service.view("alice", f.initial.id);
    const brief = {
      schemaVersion: "hsi-investigation-brief-1" as const,
      package: view.package!,
      submission: view.submission,
      decision: view.decision,
      scope: "research_only" as const,
      graphPublicationApproved: false as const,
    };
    const withSnapshot = await buildResearchOutcome(brief, async (text) => deliveryHash(text), {livingEvidenceSnapshot: snapshot});
    expect(withSnapshot.livingEvidence.status).toBe("not_attached");
  });
});
