import { describe, expect, test } from "bun:test";
import {
  P3AdapterLicenseBlockedError,
  assertP3AdapterRunnable,
  assertSafeModelProposal,
  buildGateCChecklist,
  buildModelEvalHarnessBundle,
  buildRdkitAdapterProposals,
  buildSystemsVisionBundle,
  publishOutputs,
  runRdkitAdapter,
  scoreModelEvalSubject,
  serializeRdkitAdapterBundle,
} from "../src/index";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("P3.0 RDKit thin adapter spike", () => {
  test("license gate opens research-fixture adapters; RDKit stays research_ok", () => {
    const tdc = assertP3AdapterRunnable("adapter-tdc");
    expect(tdc.blockedUntilSignOff).toBe(false);
    expect(tdc.signOffStatus).toBe("research_ok_documented");
    const af3 = assertP3AdapterRunnable("adapter-af3");
    expect(af3.blockedUntilSignOff).toBe(false);
    expect(af3.signOffStatus).toBe("signed_research_test_only");
    expect(af3.notCommercial).toBe(true);
    const isi = assertP3AdapterRunnable("adapter-isi-agents");
    expect(isi.blockedUntilSignOff).toBe(false);
    expect(isi.signOffStatus).toBe("signed_research_test_only");
    const rdkit = assertP3AdapterRunnable("adapter-rdkit");
    expect(rdkit.blockedUntilSignOff).toBe(false);
    expect(rdkit.signOffStatus).toBe("research_ok_documented");
    expect(rdkit.mayFlipEvidenceGrade).toBe(false);
    expect(rdkit.vendorsModelWeights).toBe(false);
    // P3AdapterLicenseBlockedError retained for honesty when blocked rows exist.
    expect(P3AdapterLicenseBlockedError.name).toBe(
      "P3AdapterLicenseBlockedError",
    );
  });

  test("stub runtime emits safe ModelProposalArtifacts only", () => {
    const generatedAt = "2026-11-01T19:20:00.000Z";
    const bundle = runRdkitAdapter({ generatedAt, forceStub: true });

    expect(bundle.adapterId).toBe("adapter-rdkit");
    expect(bundle.runtime).toBe("stub");
    expect(bundle.autoApprove).toBe(false);
    expect(bundle.autoApproveIntoKg).toBe(false);
    expect(bundle.mayFlipEvidenceGrade).toBe(false);
    expect(bundle.vendorsModelWeights).toBe(false);
    expect(bundle.containsPhi).toBe(false);
    expect(bundle.partnerSigned).toBe(false);
    expect(bundle.notCds).toBe(true);
    expect(bundle.licenseGate.blockedUntilSignOff).toBe(false);
    expect(bundle.proposals.length).toBe(2);
    expect(bundle.descriptors.every((d) => d.runtime === "stub")).toBe(true);

    for (const p of bundle.proposals) {
      expect(p.sourceAdapterOrAgent).toBe("adapter-rdkit");
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
    }

    const mtx = bundle.proposals.find(
      (p) => p.proposalId === "HSI-MP-RDKIT-MTX-001",
    )!;
    expect(mtx.proposedSubject).toContain("Methotrexate");
    expect(mtx.evidenceHints).toContain("edge:HSI-E-RA-012");

    const butyrate = bundle.proposals.find(
      (p) => p.proposalId === "HSI-MP-RDKIT-BUTYRATE-001",
    )!;
    expect(butyrate.proposedSubject).toContain("Butyrate");
    expect(butyrate.evidenceHints).toContain("edge:HSI-E-GUT-003");

    const json = JSON.parse(serializeRdkitAdapterBundle(bundle)) as {
      runtime: string;
      proposals: unknown[];
    };
    expect(json.runtime).toBe("stub");
    expect(json.proposals.length).toBe(2);
  });

  test("Gate C includes RDKit proposals as pending drafts", () => {
    const checklist = buildGateCChecklist({
      generatedAt: "2026-11-01T19:20:00.000Z",
    });
    const rdkitRows = checklist.modelProposals.filter(
      (p) => p.sourceAdapterOrAgent === "adapter-rdkit",
    );
    expect(rdkitRows.length).toBe(2);
    expect(rdkitRows.every((p) => p.gateCStatus === "pending")).toBe(true);
    expect(rdkitRows.every((p) => p.autoApprove === false)).toBe(true);
    expect(rdkitRows.every((p) => p.mayFlipEvidenceGrade === false)).toBe(true);
    expect(rdkitRows.every((p) => p.isGradedKgEdge === false)).toBe(true);
    expect(
      checklist.instructions.some((s) => s.includes("P3.0 RDKit")),
    ).toBe(true);
  });

  test("offline eval harness scores RDKit MTX proposal as pass", () => {
    const proposals = buildRdkitAdapterProposals({
      createdAt: "2026-11-01T19:20:00.000Z",
      forceStub: true,
    });
    const mtx = proposals.find((p) => p.proposalId === "HSI-MP-RDKIT-MTX-001")!;
    const scored = scoreModelEvalSubject({
      caseId: "EVAL-PASS-RDKIT-MTX-001",
      kind: "model_proposal",
      label: "RDKit MTX",
      expectPass: true,
      subject: { ...mtx },
    });
    expect(scored.passed).toBe(true);
    expect(scored.failClosed).toBe(false);

    const harness = buildModelEvalHarnessBundle({
      generatedAt: "2026-11-01T19:20:00.000Z",
    });
    const rdkitCase = harness.cases.find(
      (c) => c.caseId === "EVAL-PASS-RDKIT-MTX-001",
    );
    expect(rdkitCase).toBeDefined();
    expect(rdkitCase!.passed).toBe(true);
    expect(harness.summary.stubBehaviorGreen).toBe(true);
  });

  test("systems vision marks adapter-rdkit as spike_wired", () => {
    const vision = buildSystemsVisionBundle({
      generatedAt: "2026-11-01T19:20:00.000Z",
    });
    const rdkit = vision.futureTechAdapters.find(
      (a) => a.id === "adapter-rdkit",
    );
    expect(rdkit?.status).toBe("spike_wired");
    expect(vision.invariants.some((s) => s.includes("P3.0"))).toBe(true);
  });

  test("publish writes hsi-rdkit-adapter-proposals artifacts", () => {
    const result = publishOutputs({
      generatedAt: "2026-11-01T19:20:00.000Z",
    });
    expect(result.files).toContain("hsi-rdkit-adapter-proposals.json");
    expect(result.files).toContain("hsi-rdkit-adapter-proposals.md");
    expect(result.discoverySynced).toContain(
      "site/public/discovery/hsi-rdkit-adapter-proposals.json",
    );

    const jsonPath = join(result.outDir, "hsi-rdkit-adapter-proposals.json");
    expect(existsSync(jsonPath)).toBe(true);
    const body = JSON.parse(readFileSync(jsonPath, "utf8")) as {
      adapterId: string;
      runtime: string;
      autoApprove: boolean;
      mayFlipEvidenceGrade: boolean;
      partnerSigned: boolean;
      proposals: Array<{ sourceAdapterOrAgent: string }>;
    };
    expect(body.adapterId).toBe("adapter-rdkit");
    expect(body.runtime).toBe("stub");
    expect(body.autoApprove).toBe(false);
    expect(body.mayFlipEvidenceGrade).toBe(false);
    expect(body.partnerSigned).toBe(false);
    expect(
      body.proposals.every((p) => p.sourceAdapterOrAgent === "adapter-rdkit"),
    ).toBe(true);

    const manifest = JSON.parse(
      readFileSync(join(result.outDir, "MANIFEST.json"), "utf8"),
    ) as {
      counts: { rdkitAdapterProposals: number; rdkitAdapterAutoApprove: boolean };
      artifacts: { rdkitAdapterProposalsJson: string };
    };
    expect(manifest.artifacts.rdkitAdapterProposalsJson).toBe(
      "hsi-rdkit-adapter-proposals.json",
    );
    expect(manifest.counts.rdkitAdapterProposals).toBe(2);
    expect(manifest.counts.rdkitAdapterAutoApprove).toBe(false);
  });
});
