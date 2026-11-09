import { describe, expect, test } from "bun:test";
import {
  P3AdapterLicenseBlockedError,
  assertP3AdapterRunnable,
  assertSafeModelProposal,
  buildGateCChecklist,
  buildModelEvalHarnessBundle,
  buildReinvent4AdapterProposals,
  buildSystemsVisionBundle,
  publishOutputs,
  runReinvent4Adapter,
  scoreModelEvalSubject,
  serializeReinvent4AdapterBundle,
} from "../src/index";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("P3.2 REINVENT4 thin adapter spike", () => {
  test("license gate allows reinvent4 (and research-fixture AF3/TDC)", () => {
    expect(assertP3AdapterRunnable("adapter-tdc").blockedUntilSignOff).toBe(
      false,
    );
    expect(assertP3AdapterRunnable("adapter-af3").blockedUntilSignOff).toBe(
      false,
    );
    const reinvent = assertP3AdapterRunnable("adapter-reinvent4");
    expect(reinvent.blockedUntilSignOff).toBe(false);
    expect(reinvent.signOffStatus).toBe("research_ok_documented");
    expect(reinvent.mayFlipEvidenceGrade).toBe(false);
    expect(reinvent.vendorsModelWeights).toBe(false);
    expect(P3AdapterLicenseBlockedError.name).toBe(
      "P3AdapterLicenseBlockedError",
    );
  });

  test("stub runtime emits safe ModelProposalArtifacts only", () => {
    const generatedAt = "2026-11-01T19:45:00.000Z";
    const bundle = runReinvent4Adapter({ generatedAt, forceStub: true });

    expect(bundle.adapterId).toBe("adapter-reinvent4");
    expect(bundle.runtime).toBe("stub");
    expect(bundle.autoApprove).toBe(false);
    expect(bundle.autoApproveIntoKg).toBe(false);
    expect(bundle.mayFlipEvidenceGrade).toBe(false);
    expect(bundle.vendorsModelWeights).toBe(false);
    expect(bundle.containsPhi).toBe(false);
    expect(bundle.partnerSigned).toBe(false);
    expect(bundle.notCds).toBe(true);
    expect(bundle.neverClinicRecommendationPath).toBe(true);
    expect(bundle.licenseGate.blockedUntilSignOff).toBe(false);
    expect(bundle.proposals.length).toBe(2);
    expect(bundle.designs.every((d) => d.runtime === "stub")).toBe(true);

    for (const p of bundle.proposals) {
      expect(p.sourceAdapterOrAgent).toBe("adapter-reinvent4");
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
      expect(p.evidenceHints).toContain("neverClinicRecommendationPath:true");
    }

    const mtx = bundle.proposals.find(
      (p) => p.proposalId === "HSI-MP-REINVENT4-MTX-001",
    )!;
    expect(mtx.proposedSubject).toContain("Methotrexate");
    expect(mtx.evidenceHints).toContain("edge:HSI-E-RA-012");
    expect(mtx.evidenceHints).toContain("pack:hsi-pilot-evidence-pack");

    const butyrate = bundle.proposals.find(
      (p) => p.proposalId === "HSI-MP-REINVENT4-BUTYRATE-001",
    )!;
    expect(butyrate.proposedSubject).toContain("Butyrate");
    expect(butyrate.evidenceHints).toContain("edge:HSI-E-GUT-003");

    const json = JSON.parse(serializeReinvent4AdapterBundle(bundle)) as {
      runtime: string;
      proposals: unknown[];
    };
    expect(json.runtime).toBe("stub");
    expect(json.proposals.length).toBe(2);
  });

  test("Gate C includes REINVENT4 proposals as pending drafts", () => {
    const checklist = buildGateCChecklist({
      generatedAt: "2026-11-01T19:45:00.000Z",
    });
    const reinventRows = checklist.modelProposals.filter(
      (p) => p.sourceAdapterOrAgent === "adapter-reinvent4",
    );
    expect(reinventRows.length).toBe(2);
    expect(reinventRows.every((p) => p.gateCStatus === "pending")).toBe(true);
    expect(reinventRows.every((p) => p.autoApprove === false)).toBe(true);
    expect(reinventRows.every((p) => p.mayFlipEvidenceGrade === false)).toBe(
      true,
    );
    expect(reinventRows.every((p) => p.isGradedKgEdge === false)).toBe(true);
    expect(
      checklist.instructions.some((s) => s.includes("P3.2 REINVENT4")),
    ).toBe(true);
  });

  test("offline eval harness scores REINVENT4 MTX proposal as pass", () => {
    const proposals = buildReinvent4AdapterProposals({
      createdAt: "2026-11-01T19:45:00.000Z",
      forceStub: true,
    });
    const mtx = proposals.find(
      (p) => p.proposalId === "HSI-MP-REINVENT4-MTX-001",
    )!;
    const scored = scoreModelEvalSubject({
      caseId: "EVAL-PASS-REINVENT4-MTX-001",
      kind: "model_proposal",
      label: "REINVENT4 MTX",
      expectPass: true,
      subject: { ...mtx },
    });
    expect(scored.passed).toBe(true);
    expect(scored.failClosed).toBe(false);

    const harness = buildModelEvalHarnessBundle({
      generatedAt: "2026-11-01T19:45:00.000Z",
    });
    const reinventCase = harness.cases.find(
      (c) => c.caseId === "EVAL-PASS-REINVENT4-MTX-001",
    );
    expect(reinventCase).toBeDefined();
    expect(reinventCase!.passed).toBe(true);
    expect(harness.summary.stubBehaviorGreen).toBe(true);
  });

  test("systems vision marks adapter-reinvent4 as spike_wired", () => {
    const vision = buildSystemsVisionBundle({
      generatedAt: "2026-11-01T19:45:00.000Z",
    });
    const reinvent = vision.futureTechAdapters.find(
      (a) => a.id === "adapter-reinvent4",
    );
    expect(reinvent?.status).toBe("spike_wired");
    expect(vision.invariants.some((s) => s.includes("P3.2"))).toBe(true);
  });

  test("publish writes hsi-reinvent4-adapter-proposals artifacts", () => {
    const result = publishOutputs({
      generatedAt: "2026-11-01T19:45:00.000Z",
      syncSiteDiscovery: false,
    });
    expect(result.files).toContain("hsi-reinvent4-adapter-proposals.json");
    expect(result.files).toContain("hsi-reinvent4-adapter-proposals.md");
    expect(result.discoverySynced).toEqual([]);
    expect(existsSync(join(result.outDir, "hsi-reinvent4-adapter-proposals.json"))).toBe(true);

    const jsonPath = join(
      result.outDir,
      "hsi-reinvent4-adapter-proposals.json",
    );
    expect(existsSync(jsonPath)).toBe(true);
    const body = JSON.parse(readFileSync(jsonPath, "utf8")) as {
      adapterId: string;
      runtime: string;
      autoApprove: boolean;
      mayFlipEvidenceGrade: boolean;
      partnerSigned: boolean;
      neverClinicRecommendationPath: boolean;
      proposals: Array<{ sourceAdapterOrAgent: string }>;
    };
    expect(body.adapterId).toBe("adapter-reinvent4");
    expect(body.runtime).toBe("stub");
    expect(body.autoApprove).toBe(false);
    expect(body.mayFlipEvidenceGrade).toBe(false);
    expect(body.partnerSigned).toBe(false);
    expect(body.neverClinicRecommendationPath).toBe(true);
    expect(
      body.proposals.every(
        (p) => p.sourceAdapterOrAgent === "adapter-reinvent4",
      ),
    ).toBe(true);

    const manifest = JSON.parse(
      readFileSync(join(result.outDir, "MANIFEST.json"), "utf8"),
    ) as {
      counts: {
        reinvent4AdapterProposals: number;
        reinvent4AdapterAutoApprove: boolean;
      };
      artifacts: { reinvent4AdapterProposalsJson: string };
    };
    expect(manifest.artifacts.reinvent4AdapterProposalsJson).toBe(
      "hsi-reinvent4-adapter-proposals.json",
    );
    expect(manifest.counts.reinvent4AdapterProposals).toBe(2);
    expect(manifest.counts.reinvent4AdapterAutoApprove).toBe(false);
  });
});
