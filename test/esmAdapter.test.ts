import { describe, expect, test } from "bun:test";
import {
  P3AdapterLicenseBlockedError,
  assertP3AdapterRunnable,
  assertSafeEmbeddingSidecar,
  assertSafeModelProposal,
  buildEsmAdapterProposals,
  buildGateCChecklist,
  buildModelEvalHarnessBundle,
  buildSystemsVisionBundle,
  publishOutputs,
  runEsmAdapter,
  scoreModelEvalSubject,
  serializeEsmAdapterBundle,
} from "../src/index";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("P3.3 FAIR ESM-2 thin embedding stub", () => {
  test("license gate allows esm (and research-fixture AF3/TDC)", () => {
    expect(assertP3AdapterRunnable("adapter-tdc").blockedUntilSignOff).toBe(
      false,
    );
    expect(assertP3AdapterRunnable("adapter-af3").blockedUntilSignOff).toBe(
      false,
    );
    const esm = assertP3AdapterRunnable("adapter-esm");
    expect(esm.blockedUntilSignOff).toBe(false);
    expect(esm.signOffStatus).toBe("research_ok_documented");
    expect(esm.mayFlipEvidenceGrade).toBe(false);
    expect(esm.vendorsModelWeights).toBe(false);
    expect(P3AdapterLicenseBlockedError.name).toBe(
      "P3AdapterLicenseBlockedError",
    );
  });

  test("stub runtime emits safe proposals + embedding sidecar refs", () => {
    const generatedAt = "2026-11-01T20:00:00.000Z";
    const bundle = runEsmAdapter({ generatedAt, forceStub: true });

    expect(bundle.adapterId).toBe("adapter-esm");
    expect(bundle.runtime).toBe("stub");
    expect(bundle.autoApprove).toBe(false);
    expect(bundle.autoApproveIntoKg).toBe(false);
    expect(bundle.mayFlipEvidenceGrade).toBe(false);
    expect(bundle.vendorsModelWeights).toBe(false);
    expect(bundle.containsPhi).toBe(false);
    expect(bundle.partnerSigned).toBe(false);
    expect(bundle.notCds).toBe(true);
    expect(bundle.neverClinicRecommendationPath).toBe(true);
    expect(bundle.boltzDeferred).toBe(false);
    expect(bundle.emitsEmbeddingSidecarRefs).toBe(true);
    expect(bundle.licenseGate.blockedUntilSignOff).toBe(false);
    expect(bundle.proposals.length).toBe(2);
    expect(bundle.embeddings.every((e) => e.runtime === "stub")).toBe(true);
    expect(Object.keys(bundle.sidecarsByEdgeId).sort()).toEqual([
      "HSI-E-GUT-003",
      "HSI-E-RA-001",
    ]);

    for (const p of bundle.proposals) {
      expect(p.sourceAdapterOrAgent).toBe("adapter-esm");
      expect(p.suggestedTeachingStatus).toBe("hypothesized");
      expect("hsiGrade" in p).toBe(false);
      expect("curationReview" in p).toBe(false);
      expect("autoApprove" in p).toBe(false);
      expect(
        assertSafeModelProposal(p as unknown as Record<string, unknown>).ok,
      ).toBe(true);
      expect(p.evidenceHints.some((h) => h.startsWith("edge:HSI-E-"))).toBe(
        true,
      );
      expect(p.evidenceHints).toContain("runtime:stub");
      expect(p.evidenceHints).toContain("vendorsModelWeights:false");
    }

    for (const [edgeId, sidecar] of Object.entries(bundle.sidecarsByEdgeId)) {
      expect(edgeId.startsWith("HSI-E-")).toBe(true);
      expect(sidecar.doesNotSetHsiGrade).toBe(true);
      expect(sidecar.autoApprove).toBe(false);
      expect(sidecar.modelId).toContain("fair-esm2");
      expect(sidecar.dim).toBe(1280);
      expect(sidecar.contentHash?.startsWith("sha256:")).toBe(true);
      expect(sidecar.vectorRef?.startsWith("omit://fair-esm2/")).toBe(true);
      expect(
        assertSafeEmbeddingSidecar(sidecar as unknown as Record<string, unknown>)
          .ok,
      ).toBe(true);
    }

    const tnf = bundle.proposals.find(
      (p) => p.proposalId === "HSI-MP-ESM2-TNF-001",
    )!;
    expect(tnf.proposedSubject).toContain("TNF");
    expect(tnf.evidenceHints).toContain("edge:HSI-E-RA-001");
    expect(tnf.evidenceHints).toContain("pack:hsi-pilot-evidence-pack");
    expect(tnf.evidenceHints).toContain("uniprot:P01375");

    const foxp3 = bundle.proposals.find(
      (p) => p.proposalId === "HSI-MP-ESM2-FOXP3-001",
    )!;
    expect(foxp3.proposedSubject).toContain("FOXP3");
    expect(foxp3.evidenceHints).toContain("edge:HSI-E-GUT-003");

    const json = JSON.parse(serializeEsmAdapterBundle(bundle)) as {
      runtime: string;
      proposals: unknown[];
      sidecarsByEdgeId: Record<string, unknown>;
    };
    expect(json.runtime).toBe("stub");
    expect(json.proposals.length).toBe(2);
    expect(Object.keys(json.sidecarsByEdgeId).length).toBe(2);
  });

  test("Gate C includes ESM proposals as pending drafts", () => {
    const checklist = buildGateCChecklist({
      generatedAt: "2026-11-01T20:00:00.000Z",
    });
    const esmRows = checklist.modelProposals.filter(
      (p) => p.sourceAdapterOrAgent === "adapter-esm",
    );
    expect(esmRows.length).toBe(2);
    expect(esmRows.every((p) => p.gateCStatus === "pending")).toBe(true);
    expect(esmRows.every((p) => p.autoApprove === false)).toBe(true);
    expect(esmRows.every((p) => p.mayFlipEvidenceGrade === false)).toBe(true);
    expect(esmRows.every((p) => p.isGradedKgEdge === false)).toBe(true);
    expect(checklist.instructions.some((s) => s.includes("P3.3 FAIR ESM"))).toBe(
      true,
    );
  });

  test("offline eval harness scores ESM2 TNF proposal as pass", () => {
    const proposals = buildEsmAdapterProposals({
      createdAt: "2026-11-01T20:00:00.000Z",
      forceStub: true,
    });
    const tnf = proposals.find((p) => p.proposalId === "HSI-MP-ESM2-TNF-001")!;
    const scored = scoreModelEvalSubject({
      caseId: "EVAL-PASS-ESM2-TNF-001",
      kind: "model_proposal",
      label: "ESM2 TNF",
      expectPass: true,
      subject: { ...tnf },
    });
    expect(scored.passed).toBe(true);
    expect(scored.failClosed).toBe(false);

    const harness = buildModelEvalHarnessBundle({
      generatedAt: "2026-11-01T20:00:00.000Z",
    });
    const esmCase = harness.cases.find(
      (c) => c.caseId === "EVAL-PASS-ESM2-TNF-001",
    );
    expect(esmCase).toBeDefined();
    expect(esmCase!.passed).toBe(true);
    expect(harness.summary.stubBehaviorGreen).toBe(true);
  });

  test("systems vision marks adapter-esm as spike_wired", () => {
    const vision = buildSystemsVisionBundle({
      generatedAt: "2026-11-01T20:00:00.000Z",
    });
    const esm = vision.futureTechAdapters.find((a) => a.id === "adapter-esm");
    expect(esm?.status).toBe("spike_wired");
    expect(vision.invariants.some((s) => s.includes("P3.3"))).toBe(true);
  });

  test("publish writes hsi-esm-adapter-proposals artifacts + merges sidecars", () => {
    const result = publishOutputs({
      generatedAt: "2026-11-01T20:00:00.000Z",
    });
    expect(result.files).toContain("hsi-esm-adapter-proposals.json");
    expect(result.files).toContain("hsi-esm-adapter-proposals.md");
    expect(result.discoverySynced).toContain(
      "site/public/discovery/hsi-esm-adapter-proposals.json",
    );

    const jsonPath = join(result.outDir, "hsi-esm-adapter-proposals.json");
    expect(existsSync(jsonPath)).toBe(true);
    const body = JSON.parse(readFileSync(jsonPath, "utf8")) as {
      adapterId: string;
      runtime: string;
      autoApprove: boolean;
      mayFlipEvidenceGrade: boolean;
      partnerSigned: boolean;
      boltzDeferred: boolean;
      proposals: Array<{ sourceAdapterOrAgent: string }>;
      sidecarsByEdgeId: Record<string, { modelId: string }>;
    };
    expect(body.adapterId).toBe("adapter-esm");
    expect(body.runtime).toBe("stub");
    expect(body.autoApprove).toBe(false);
    expect(body.mayFlipEvidenceGrade).toBe(false);
    expect(body.partnerSigned).toBe(false);
    expect(body.boltzDeferred).toBe(false);
    expect(
      body.proposals.every((p) => p.sourceAdapterOrAgent === "adapter-esm"),
    ).toBe(true);
    expect(body.sidecarsByEdgeId["HSI-E-RA-001"]?.modelId).toContain(
      "fair-esm2",
    );

    const sidecarsPath = join(result.outDir, "hsi-embedding-sidecars.json");
    const sidecars = JSON.parse(readFileSync(sidecarsPath, "utf8")) as {
      byEdgeId: Record<string, { modelId: string; doesNotSetHsiGrade: boolean }>;
    };
    expect(sidecars.byEdgeId["HSI-E-RA-001"]?.modelId).toContain("fair-esm2");
    expect(sidecars.byEdgeId["HSI-E-GUT-003"]?.modelId).toContain("fair-esm2");
    expect(sidecars.byEdgeId["HSI-E-RA-001"]?.doesNotSetHsiGrade).toBe(true);

    const manifest = JSON.parse(
      readFileSync(join(result.outDir, "MANIFEST.json"), "utf8"),
    ) as {
      counts: {
        esmAdapterProposals: number;
        esmAdapterAutoApprove: boolean;
        esmAdapterSidecarEdges: number;
      };
      artifacts: { esmAdapterProposalsJson: string };
    };
    expect(manifest.artifacts.esmAdapterProposalsJson).toBe(
      "hsi-esm-adapter-proposals.json",
    );
    expect(manifest.counts.esmAdapterProposals).toBe(2);
    expect(manifest.counts.esmAdapterAutoApprove).toBe(false);
    expect(manifest.counts.esmAdapterSidecarEdges).toBe(2);
  });
});
