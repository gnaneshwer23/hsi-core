import { describe, expect, test } from "bun:test";
import {
  FUTURE_TECH_ADAPTER_STUBS,
  P3_ADAPTER_LICENSE_MATRIX_SCHEMA,
  P3_ADAPTER_SIGN_OFF_STATUSES,
  assertSafeP3AdapterLicenseRow,
  buildGateCChecklist,
  buildP3AdapterLicenseMatrixBundle,
  buildP3AdapterLicenseRows,
  buildSystemsVisionBundle,
  serializeP3AdapterLicenseMatrix,
} from "../src/index";

describe("P2.5 P3 adapter RFC + license matrix", () => {
  test("schema is wired; forbids grade flips and weight vendoring", () => {
    expect(P3_ADAPTER_LICENSE_MATRIX_SCHEMA.status).toBe(
      "wired_rfc_and_matrix",
    );
    expect(P3_ADAPTER_LICENSE_MATRIX_SCHEMA.mayFlipEvidenceGrade).toBe(false);
    expect(P3_ADAPTER_LICENSE_MATRIX_SCHEMA.vendorsModelWeights).toBe(false);
    expect(P3_ADAPTER_LICENSE_MATRIX_SCHEMA.emitsModelProposalOnly).toBe(true);
    expect(P3_ADAPTER_LICENSE_MATRIX_SCHEMA.autoApproveIntoKg).toBe(false);
    expect(P3_ADAPTER_LICENSE_MATRIX_SCHEMA.containsPhi).toBe(false);
    expect(P3_ADAPTER_LICENSE_MATRIX_SCHEMA.exportArtifact).toBe(
      "hsi-p3-adapter-license-matrix.json",
    );
    expect(P3_ADAPTER_LICENSE_MATRIX_SCHEMA.rfcDoc).toBe(
      "docs/P3_ADAPTER_RFC.md",
    );
    expect([...P3_ADAPTER_LICENSE_MATRIX_SCHEMA.signOffStatuses]).toEqual([
      ...P3_ADAPTER_SIGN_OFF_STATUSES,
    ]);
    expect(P3_ADAPTER_SIGN_OFF_STATUSES).toContain("signed_research_test_only");
  });

  test("matrix covers every FUTURE_TECH_ADAPTER_STUBS id with honest statuses", () => {
    const rows = buildP3AdapterLicenseRows();
    const byId = Object.fromEntries(rows.map((r) => [r.adapterId, r]));

    expect(rows.length).toBe(FUTURE_TECH_ADAPTER_STUBS.length);
    for (const stub of FUTURE_TECH_ADAPTER_STUBS) {
      const row = byId[stub.id];
      expect(row).toBeDefined();
      expect(row!.mayFlipEvidenceGrade).toBe(false);
      expect(row!.vendorsModelWeights).toBe(false);
      expect(row!.emitsModelProposalOnly).toBe(true);
      expect(row!.autoApproveIntoKg).toBe(false);
      expect(row!.containsPhi).toBe(false);
      expect(row!.docsUrl.startsWith("https://")).toBe(true);
      expect(stub.mayFlipEvidenceGrade).toBe(false);
    }

    expect(byId["adapter-tdc"]!.signOffStatus).toBe("research_ok_documented");
    expect(byId["adapter-tdc"]!.blockedUntilSignOff).toBe(false);
    expect(byId["adapter-tdc"]!.researchSignOffFixture).toBe(true);
    expect(byId["adapter-af3"]!.signOffStatus).toBe("signed_research_test_only");
    expect(byId["adapter-af3"]!.blockedUntilSignOff).toBe(false);
    expect(byId["adapter-af3"]!.notCommercial).toBe(true);
    expect(byId["adapter-af3"]!.replaceWithLegalSignOff).toBe(true);
    expect(byId["adapter-boltz"]!.signOffStatus).toBe("research_ok_documented");
    expect(byId["adapter-boltz"]!.blockedUntilSignOff).toBe(false);
    expect(byId["adapter-esm"]!.signOffStatus).toBe("research_ok_documented");
    expect(byId["adapter-rdkit"]!.signOffStatus).toBe("research_ok_documented");
    expect(byId["adapter-openmm"]!.signOffStatus).toBe(
      "research_ok_documented",
    );
    expect(byId["adapter-reinvent4"]!.signOffStatus).toBe(
      "research_ok_documented",
    );
    expect(byId["adapter-isi-agents"]!.signOffStatus).toBe(
      "signed_research_test_only",
    );
    expect(byId["adapter-isi-agents"]!.blockedUntilSignOff).toBe(false);

    // Honesty: no invented commercial signed field anywhere.
    for (const r of rows) {
      expect("commercialLicenseSigned" in r).toBe(false);
      expect("signedCommercial" in r).toBe(false);
      expect("hsiGrade" in r).toBe(false);
      expect(
        assertSafeP3AdapterLicenseRow(r as unknown as Record<string, unknown>)
          .ok,
      ).toBe(true);
    }
  });

  test("bundle summary + serialize; systems vision points at RFC", () => {
    const generatedAt = "2026-11-01T19:05:00.000Z";
    const bundle = buildP3AdapterLicenseMatrixBundle({ generatedAt });
    expect(bundle.schemaVersion).toBe("hsi-p3-adapter-license-matrix-1");
    expect(bundle.rfcDoc).toBe("docs/P3_ADAPTER_RFC.md");
    expect(bundle.vendorsModelWeights).toBe(false);
    expect(bundle.emitsModelProposalOnly).toBe(true);
    expect(bundle.summary.adapterCount).toBe(8);
    expect(bundle.summary.blockedUntilSignOffCount).toBe(0);
    expect(bundle.summary.researchOkDocumentedCount).toBeGreaterThanOrEqual(5);
    expect(bundle.summary.signedResearchTestOnlyCount).toBeGreaterThanOrEqual(2);
    expect(bundle.summary.researchSignOffFixtureActive).toBe(true);
    expect(bundle.weightsPolicyDoc).toBe("docs/P3_WEIGHTS_AND_LICENSE_POLICY.md");

    const json = JSON.parse(serializeP3AdapterLicenseMatrix(bundle)) as {
      adapters: Array<{ adapterId: string }>;
    };
    expect(json.adapters.length).toBe(8);

    const vision = buildSystemsVisionBundle({ generatedAt });
    expect(vision.aiFutureTech.p3AdapterRfc).toBe("docs/P3_ADAPTER_RFC.md");
    expect(vision.aiFutureTech.p3AdapterLicenseMatrixSchema.status).toBe(
      "wired_rfc_and_matrix",
    );
    expect(vision.invariants.some((s) => s.includes("P2.5"))).toBe(true);
    expect(
      vision.futureTechAdapters.every((a) => a.mayFlipEvidenceGrade === false),
    ).toBe(true);
  });

  test("rejects fake commercial signed, grade flips, or inconsistent blocked flags", () => {
    const good = buildP3AdapterLicenseRows()[0]!;
    expect(
      assertSafeP3AdapterLicenseRow({
        ...(good as unknown as Record<string, unknown>),
        commercialLicenseSigned: true,
      }).ok,
    ).toBe(false);

    expect(
      assertSafeP3AdapterLicenseRow({
        ...(good as unknown as Record<string, unknown>),
        mayFlipEvidenceGrade: true,
      }).ok,
    ).toBe(false);

    expect(
      assertSafeP3AdapterLicenseRow({
        ...(good as unknown as Record<string, unknown>),
        vendorsModelWeights: true,
      }).ok,
    ).toBe(false);

    expect(
      assertSafeP3AdapterLicenseRow({
        ...(good as unknown as Record<string, unknown>),
        signOffStatus: "research_ok_documented",
        blockedUntilSignOff: true,
      }).ok,
    ).toBe(false);

    expect(
      assertSafeP3AdapterLicenseRow({
        ...(good as unknown as Record<string, unknown>),
        signOffStatus: "needs_review",
        blockedUntilSignOff: false,
      }).ok,
    ).toBe(false);

    expect(
      assertSafeP3AdapterLicenseRow({
        ...(good as unknown as Record<string, unknown>),
        docsUrl: "http://insecure.example/license",
      }).ok,
    ).toBe(false);
  });

  test("Gate C instructions mention P3 license gate", () => {
    const checklist = buildGateCChecklist({
      generatedAt: "2026-11-01T19:05:00.000Z",
    });
    expect(checklist.autoApproveIntoKg).toBe(false);
    expect(
      checklist.instructions.some((s) => s.includes("P2.5 P3 adapters")),
    ).toBe(true);
  });
});
