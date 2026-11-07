import {describe, expect, test} from "bun:test";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  DEFAULT_N4_INVESTIGATIONS,
  OPTIONAL_MODEL_ADAPTER_ID,
  buildOptionalModelAdapterRequest,
  parseGroundedBrief,
  parseGroundedCorpus,
  runGroundedBriefSuite,
} from "../src/evidence/groundedBrief";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  N8_ADAPTER_ID,
  N8_PUBLIC_STRUCTURE_FIXTURE,
  buildN8AdapterStatus,
  buildN8ModelManifest,
  parseN8AdapterRunReceipt,
  parseN8ModelManifest,
  runBoundedSpecialisedModelAdapter,
} from "../src/evidence/specialisedModelAdapter";

const root = resolve(import.meta.dir, "..");

function loadAdapterEnabledBriefs() {
  const corpus = parseGroundedCorpus(
    JSON.parse(readFileSync(resolve(root, "research/domain-graph/n4/corpus.v1.json"), "utf8")),
  );
  const suite = runGroundedBriefSuite({
    corpus,
    generatedAt: "2026-11-07T22:30:00.000Z",
    enableModelAdapter: true,
    n3HumanLabelFreeze: "BLOCKED",
    n3EngineeringHarness: "CLEARED",
  });
  return DEFAULT_N4_INVESTIGATIONS.map((q, i) => ({
    investigationId: q.id,
    brief: parseGroundedBrief(suite.briefs[i]!),
  }));
}

describe("N8 specialised model adapter", () => {
  test("manifest stays activation-disallowed and research-safe", () => {
    const m = buildN8ModelManifest();
    expect(m.adapterId).toBe(N8_ADAPTER_ID);
    expect(m.adapterId).toBe(OPTIONAL_MODEL_ADAPTER_ID);
    expect(m.activationDefault).toBe(false);
    expect(m.mayCallPaidApis).toBe(false);
    expect(m.mayUseLivePhi).toBe(false);
    expect(m.notCds).toBe(true);
    expect(m.benchmarkEvidence.n6UsefulnessDemonstrated).toBe(false);
    expect(m.licence.compatibleForLiveWeights).toBe(false);
    parseN8ModelManifest(m);
  });

  test("refuses default (non-opt-in) activation", () => {
    const briefs = loadAdapterEnabledBriefs();
    expect(() =>
      runBoundedSpecialisedModelAdapter({
        activation: {
          optIn: false,
          acknowledgeActivationDisallowed: true,
          mode: "dry_run",
          generatedAt: "2026-11-07T23:45:00.000Z",
        },
        briefs,
      }),
    ).toThrow("optIn=true");
  });

  test("refuses missing activation-disallowed acknowledgement", () => {
    const briefs = loadAdapterEnabledBriefs();
    expect(() =>
      runBoundedSpecialisedModelAdapter({
        activation: {
          optIn: true,
          acknowledgeActivationDisallowed: false,
          mode: "dry_run",
          generatedAt: "2026-11-07T23:45:00.000Z",
        },
        briefs,
      }),
    ).toThrow("acknowledgeActivationDisallowed");
  });

  test("refuses live_provider mode without calling any API", () => {
    const briefs = loadAdapterEnabledBriefs();
    expect(() =>
      runBoundedSpecialisedModelAdapter({
        activation: {
          optIn: true,
          acknowledgeActivationDisallowed: true,
          mode: "live_provider",
          generatedAt: "2026-11-07T23:45:00.000Z",
        },
        briefs,
      }),
    ).toThrow("live_provider");
  });

  test("dry-run consumes N4 contract, preserves abstention, keeps honesty false", () => {
    const briefs = loadAdapterEnabledBriefs();
    for (const row of briefs) {
      const contract = buildOptionalModelAdapterRequest(row.brief);
      expect(contract.adapterId).toBe(N8_ADAPTER_ID);
      expect(contract.modelActivationAllowed).toBe(false);
    }

    const receipt = runBoundedSpecialisedModelAdapter({
      activation: {
        optIn: true,
        acknowledgeActivationDisallowed: true,
        mode: "dry_run",
        includePublicStructureFixture: true,
        generatedAt: "2026-11-07T23:45:00.000Z",
      },
      briefs,
    });

    expect(receipt.engineeringHarness).toBe("CLEARED");
    expect(receipt.scientificAcceptance).toBe("BLOCKED");
    expect(receipt.n6Usefulness).toBe("BLOCKED");
    expect(receipt.groundedClaimAccepted).toBe(false);
    expect(receipt.modelActivationAllowed).toBe(false);
    expect(receipt.activationAllowed).toBe(false);
    expect(receipt.paidApiCalled).toBe(false);
    expect(receipt.liveProviderCalled).toBe(false);
    expect(receipt.publicStructureFixture?.uniprotAccession).toBe(
      N8_PUBLIC_STRUCTURE_FIXTURE.uniprotAccession,
    );
    expect(receipt.baselineComparison.usefulnessDeltaVsBaseline).toBeNull();
    expect(receipt.baselineComparison.n6UsefulnessClaimed).toBe(false);
    expect(receipt.baselineComparison.agreementRate).toBe(1);
    expect(receipt.logs.some((l) => l.event === "dry_run_started")).toBe(true);
    expect(receipt.logs.some((l) => l.event === "honesty_asserted")).toBe(true);

    for (const row of receipt.baselineComparison.rows) {
      expect(row.abstentionPreserved).toBe(true);
      expect(row.outcomesAgree).toBe(true);
    }

    const abstaining = receipt.proposals.filter((p) => p.proposedOutcome === "abstain");
    expect(abstaining.length).toBeGreaterThanOrEqual(3);
    expect(abstaining.every((p) => p.uncertainty === "abstain_required")).toBe(true);

    parseN8AdapterRunReceipt(receipt);
    const status = buildN8AdapterStatus({
      receipt,
      n4BriefReceiptHash: null,
      n6ProtocolHash: null,
      n7LedgerHash: null,
    });
    expect(status.n6Usefulness).toBe("BLOCKED");
    expect(status.modelActivationAllowed).toBe(false);
  });

  test("parse rejects flipped groundedClaimAccepted or usefulness claims", () => {
    const briefs = loadAdapterEnabledBriefs();
    const receipt = runBoundedSpecialisedModelAdapter({
      activation: {
        optIn: true,
        acknowledgeActivationDisallowed: true,
        mode: "fixture",
        generatedAt: "2026-11-07T23:45:00.000Z",
      },
      briefs,
    });
    const bad = structuredClone(receipt) as {groundedClaimAccepted: boolean};
    bad.groundedClaimAccepted = true;
    expect(() => parseN8AdapterRunReceipt(bad)).toThrow("honesty");

    const badUsefulness = structuredClone(receipt) as {
      baselineComparison: {usefulnessDeltaVsBaseline: number | null; n6UsefulnessClaimed: boolean};
    };
    badUsefulness.baselineComparison.usefulnessDeltaVsBaseline = 0.1;
    badUsefulness.baselineComparison.n6UsefulnessClaimed = true;
    expect(() => parseN8AdapterRunReceipt(badUsefulness)).toThrow("usefulness");
  });

  test("on-disk n8 artifacts match builder when present", () => {
    const receiptPath = resolve(root, "research/domain-graph/n8/adapter.offline.receipt.json");
    const manifestPath = resolve(root, "research/domain-graph/n8/manifest.v1.json");
    let disk: string;
    try {
      disk = readFileSync(receiptPath, "utf8");
      readFileSync(manifestPath, "utf8");
    } catch {
      return;
    }
    const expected = runBoundedSpecialisedModelAdapter({
      activation: {
        optIn: true,
        acknowledgeActivationDisallowed: true,
        mode: "dry_run",
        includePublicStructureFixture: true,
        generatedAt: "2026-11-07T23:45:00.000Z",
        operatorNote:
          "N8 offline dry-run with public-structure multimodal fixture slot. Paid APIs not called; N6 usefulness BLOCKED.",
      },
      briefs: loadAdapterEnabledBriefs(),
      n4BriefReceiptHash: createHash("sha256")
        .update(readFileSync(resolve(root, "research/domain-graph/n4/brief.offline.receipt.json")))
        .digest("hex"),
      n6ProtocolHash: createHash("sha256")
        .update(readFileSync(resolve(root, "research/domain-graph/n6/protocol.v1.json")))
        .digest("hex"),
      n7LedgerHash: (() => {
        try {
          return createHash("sha256")
            .update(readFileSync(resolve(root, "research/domain-graph/n7/ledger.v1.json")))
            .digest("hex");
        } catch {
          return null;
        }
      })(),
    });
    expect(canonicalEvidenceJson(JSON.parse(disk))).toBe(canonicalEvidenceJson(expected));
    expect(canonicalEvidenceJson(JSON.parse(readFileSync(manifestPath, "utf8")))).toBe(
      canonicalEvidenceJson(buildN8ModelManifest()),
    );
  });
});
