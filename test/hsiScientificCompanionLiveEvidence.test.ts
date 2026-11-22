import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL} from "../src/hsiScientificCompanionAuthorization";
import {
  assertHsiScientificCompanionLiveEvidenceOwnerAuthorized,
  HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL,
  validateHsiScientificCompanionLiveEvidenceOwnerApproval,
} from "../src/hsiScientificCompanionLiveEvidenceAuthorization";
import {runHsiScientificCompanionTurn} from "../src/hsiScientificCompanionRuntime";
import {
  assertHsiScientificCompanionLiveEvidenceSoftLand,
  hsiScientificCompanionLiveEvidenceSoftLandPacket,
  hsiScientificCompanionLiveEvidenceSurfaceById,
} from "../src/operations/hsiScientificCompanionLiveEvidenceSoftLand";

const SAMPLE = [
  {
    sourceId: "europepmc:MED:demo-1",
    title: "Demo SSc literature metadata",
    provider: "europe-pmc" as const,
    sourceUrl: "https://europepmc.org/article/MED/demo-1",
    verificationState: "metadata_retrieved_not_claim_verified" as const,
    reviewState: "unreviewed" as const,
  },
];

describe("U42 Scientific Companion live-evidence binding", () => {
  test("owner approval refuses network retrieval / claim verification / avatar", () => {
    expect(() =>
      validateHsiScientificCompanionLiveEvidenceOwnerApproval(
        HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL,
      ),
    ).not.toThrow();
    expect(
      HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL.companionPerformsNetworkRetrieval,
    ).toBe(false);
    expect(() =>
      validateHsiScientificCompanionLiveEvidenceOwnerApproval({
        ...HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL,
        claimVerificationAuthorized: true as false,
      }),
    ).toThrow(/verification|retrieval|avatar/i);
  });

  test("soft-land catalogues binding surfaces and keeps retrieval gated", () => {
    const packet = hsiScientificCompanionLiveEvidenceSoftLandPacket();
    const summary = assertHsiScientificCompanionLiveEvidenceSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.companionPerformsNetworkRetrieval).toBe(false);
    expect(
      hsiScientificCompanionLiveEvidenceSurfaceById("bind_caller_supplied_records")
        .engineeringReady,
    ).toBe(true);
    expect(
      hsiScientificCompanionLiveEvidenceSurfaceById("companion_network_retrieval")
        .engineeringReady,
    ).toBe(false);
  });

  test("discuss turn without liveEvidence stays U41-shaped", () => {
    const result = runHsiScientificCompanionTurn({
      authorization: HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
      mode: "discuss",
      question: "Which SSc mechanisms require investigation?",
      createdAt: "2026-11-22T00:00:00Z",
    });
    expect(result.boundEvidence).toEqual([]);
    expect(result.liveEvidenceAuthorization).toBeNull();
    expect(result.honesty.liveEvidenceBound).toBe(false);
    expect(result.honesty.companionPerformedNetworkRetrieval).toBe(false);
    expect(result.servicesUsed).not.toContain("caller_supplied_live_evidence");
  });

  test("discuss turn binds caller-supplied records without claiming retrieval", () => {
    assertHsiScientificCompanionLiveEvidenceOwnerAuthorized(
      HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL,
    );
    const result = runHsiScientificCompanionTurn({
      authorization: HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
      mode: "discuss",
      question: "Which SSc mechanisms require investigation?",
      createdAt: "2026-11-22T00:00:00Z",
      liveEvidence: {
        authorization: HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL,
        records: SAMPLE,
      },
    });
    expect(result.honesty.liveEvidenceBound).toBe(true);
    expect(result.honesty.companionPerformedNetworkRetrieval).toBe(false);
    expect(result.honesty.claimVerified).toBe(false);
    expect(result.boundEvidence).toHaveLength(1);
    expect(result.citations.some((c) => c.kind === "live_evidence")).toBe(true);
    expect(result.replyMarkdown).toContain("Bound public literature");
    expect(result.servicesUsed).toContain("caller_supplied_live_evidence");
    expect(result.limitations.some((l) => /did not retrieve/i.test(l))).toBe(true);
  });

  test("binding refuses claim-verified or oversize payloads", () => {
    expect(() =>
      runHsiScientificCompanionTurn({
        authorization: HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
        mode: "discuss",
        question: "Which SSc mechanisms require investigation?",
        liveEvidence: {
          authorization: HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL,
          records: [
            {
              ...SAMPLE[0]!,
              verificationState: "claim_verified" as "metadata_retrieved_not_claim_verified",
            },
          ],
        },
      }),
    ).toThrow(/metadata_retrieved_not_claim_verified/);
  });

  test("docs keep U42 honesty", () => {
    const doc = readFileSync(
      join(
        import.meta.dir,
        "../docs/engineering/HSI_U42_COMPANION_LIVE_EVIDENCE_2026-11-22.md",
      ),
      "utf8",
    );
    expect(doc).toContain("caller-supplied");
    expect(doc).toMatch(/not.*network retrieval|never.*retriev/i);
  });
});
