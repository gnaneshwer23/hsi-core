import { describe, expect, test } from "bun:test";
import {
  P3AdapterLicenseBlockedError,
  assertP3AdapterRunnable,
  assertSafeModelProposal,
  buildGateCChecklist,
  buildModelEvalHarnessBundle,
  buildOpenmmAdapterProposals,
  buildSystemsVisionBundle,
  publishOutputs,
  runOpenmmAdapter,
  scoreModelEvalSubject,
  serializeOpenmmAdapterBundle,
} from "../src/index";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("P3.1 OpenMM thin adapter spike", () => {
  test("license gate allows openmm (and research-fixture AF3/TDC)", () => {
    expect(assertP3AdapterRunnable("adapter-tdc").blockedUntilSignOff).toBe(
      false,
    );
    expect(assertP3AdapterRunnable("adapter-af3").blockedUntilSignOff).toBe(
      false,
    );
    const openmm = assertP3AdapterRunnable("adapter-openmm");
    expect(openmm.blockedUntilSignOff).toBe(false);
    expect(openmm.signOffStatus).toBe("research_ok_documented");
    expect(openmm.mayFlipEvidenceGrade).toBe(false);
    expect(openmm.vendorsModelWeights).toBe(false);
    expect(P3AdapterLicenseBlockedError.name).toBe(
      "P3AdapterLicenseBlockedError",
    );
  });

  test("stub runtime emits safe ModelProposalArtifacts only", () => {
    const generatedAt = "2026-11-01T19:30:00.000Z";
    const bundle = runOpenmmAdapter({ generatedAt, forceStub: true });

    expect(bundle.adapterId).toBe("adapter-openmm");
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
    expect(bundle.simulations.every((d) => d.runtime === "stub")).toBe(true);

    for (const p of bundle.proposals) {
      expect(p.sourceAdapterOrAgent).toBe("adapter-openmm");
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

    const ach = bundle.proposals.find(
      (p) => p.proposalId === "HSI-MP-OPENMM-ACH-001",
    )!;
    expect(ach.proposedSubject).toContain("Acetylcholine");
    expect(ach.evidenceHints).toContain("edge:HSI-E-NI-003");
    expect(ach.evidenceHints).toContain("pack:hsi-neuroimmune-pack");

    const butyrate = bundle.proposals.find(
      (p) => p.proposalId === "HSI-MP-OPENMM-BUTYRATE-001",
    )!;
    expect(butyrate.proposedSubject).toContain("Butyrate");
    expect(butyrate.evidenceHints).toContain("edge:HSI-E-GUT-003");

    const json = JSON.parse(serializeOpenmmAdapterBundle(bundle)) as {
      runtime: string;
      proposals: unknown[];
    };
    expect(json.runtime).toBe("stub");
    expect(json.proposals.length).toBe(2);
  });

  test("Gate C includes OpenMM proposals as pending drafts", () => {
    const checklist = buildGateCChecklist({
      generatedAt: "2026-11-01T19:30:00.000Z",
    });
    const openmmRows = checklist.modelProposals.filter(
      (p) => p.sourceAdapterOrAgent === "adapter-openmm",
    );
    expect(openmmRows.length).toBe(2);
    expect(openmmRows.every((p) => p.gateCStatus === "pending")).toBe(true);
    expect(openmmRows.every((p) => p.autoApprove === false)).toBe(true);
    expect(openmmRows.every((p) => p.mayFlipEvidenceGrade === false)).toBe(
      true,
    );
    expect(openmmRows.every((p) => p.isGradedKgEdge === false)).toBe(true);
    expect(
      checklist.instructions.some((s) => s.includes("P3.1 OpenMM")),
    ).toBe(true);
  });

  test("offline eval harness scores OpenMM ACh proposal as pass", () => {
    const proposals = buildOpenmmAdapterProposals({
      createdAt: "2026-11-01T19:30:00.000Z",
      forceStub: true,
    });
    const ach = proposals.find(
      (p) => p.proposalId === "HSI-MP-OPENMM-ACH-001",
    )!;
    const scored = scoreModelEvalSubject({
      caseId: "EVAL-PASS-OPENMM-ACH-001",
      kind: "model_proposal",
      label: "OpenMM ACh",
      expectPass: true,
      subject: { ...ach },
    });
    expect(scored.passed).toBe(true);
    expect(scored.failClosed).toBe(false);

    const harness = buildModelEvalHarnessBundle({
      generatedAt: "2026-11-01T19:30:00.000Z",
    });
    const openmmCase = harness.cases.find(
      (c) => c.caseId === "EVAL-PASS-OPENMM-ACH-001",
    );
    expect(openmmCase).toBeDefined();
    expect(openmmCase!.passed).toBe(true);
    expect(harness.summary.stubBehaviorGreen).toBe(true);
  });

  test("systems vision marks adapter-openmm as spike_wired", () => {
    const vision = buildSystemsVisionBundle({
      generatedAt: "2026-11-01T19:30:00.000Z",
    });
    const openmm = vision.futureTechAdapters.find(
      (a) => a.id === "adapter-openmm",
    );
    expect(openmm?.status).toBe("spike_wired");
    expect(vision.invariants.some((s) => s.includes("P3.1"))).toBe(true);
  });

  test("publish writes hsi-openmm-adapter-proposals artifacts", () => {
    const result = publishOutputs({
      generatedAt: "2026-11-01T19:30:00.000Z",
    });
    expect(result.files).toContain("hsi-openmm-adapter-proposals.json");
    expect(result.files).toContain("hsi-openmm-adapter-proposals.md");
    expect(result.discoverySynced).toContain(
      "site/public/discovery/hsi-openmm-adapter-proposals.json",
    );

    const jsonPath = join(result.outDir, "hsi-openmm-adapter-proposals.json");
    expect(existsSync(jsonPath)).toBe(true);
    const body = JSON.parse(readFileSync(jsonPath, "utf8")) as {
      adapterId: string;
      runtime: string;
      autoApprove: boolean;
      mayFlipEvidenceGrade: boolean;
      partnerSigned: boolean;
      proposals: Array<{ sourceAdapterOrAgent: string }>;
    };
    expect(body.adapterId).toBe("adapter-openmm");
    expect(body.runtime).toBe("stub");
    expect(body.autoApprove).toBe(false);
    expect(body.mayFlipEvidenceGrade).toBe(false);
    expect(body.partnerSigned).toBe(false);
    expect(
      body.proposals.every((p) => p.sourceAdapterOrAgent === "adapter-openmm"),
    ).toBe(true);

    const manifest = JSON.parse(
      readFileSync(join(result.outDir, "MANIFEST.json"), "utf8"),
    ) as {
      counts: {
        openmmAdapterProposals: number;
        openmmAdapterAutoApprove: boolean;
      };
      artifacts: { openmmAdapterProposalsJson: string };
    };
    expect(manifest.artifacts.openmmAdapterProposalsJson).toBe(
      "hsi-openmm-adapter-proposals.json",
    );
    expect(manifest.counts.openmmAdapterProposals).toBe(2);
    expect(manifest.counts.openmmAdapterAutoApprove).toBe(false);
  });
});
