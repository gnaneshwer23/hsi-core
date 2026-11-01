import { describe, expect, test } from "bun:test";
import {
  EXTERNAL_GENOME_POINTER_SCHEMA,
  assertSafeExternalGenomePointer,
  buildExampleExternalGenomePointers,
  buildExternalGenomePointersBundle,
  buildGateCChecklist,
  resolveGenomePointerUrl,
  serializeExternalGenomePointers,
} from "../src/index";

describe("P2.4 ClinVar / TCGA external genome pointers", () => {
  test("schema is wired for citation pointers and forbids grade / bulk / PHI", () => {
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.status).toBe(
      "wired_citation_pointers",
    );
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.doesNotSetHsiGrade).toBe(true);
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.reviewRequired).toBe(true);
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.mayFlipEvidenceGrade).toBe(false);
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.autoApprove).toBe(false);
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.autoApproveIntoKg).toBe(false);
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.containsPhi).toBe(false);
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.containsBulkGenomeDump).toBe(false);
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.exportArtifact).toBe(
      "hsi-external-genome-pointers.json",
    );
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.fields).toContain("accession");
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.fields).toContain("urlTemplate");
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.fields).toContain("edgeIds");
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.fields).toContain("reviewRequired");
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.sources).toContain("clinvar");
    expect(EXTERNAL_GENOME_POINTER_SCHEMA.sources).toContain("tcga");
  });

  test("sample pointers carry accession/URL/disease context; optional edgeIds; invariants hold", () => {
    const generatedAt = "2026-11-01T19:00:00.000Z";
    const pointers = buildExampleExternalGenomePointers({
      createdAt: generatedAt,
    });
    expect(pointers.length).toBeGreaterThanOrEqual(6);

    const byId = Object.fromEntries(pointers.map((p) => [p.pointerId, p]));
    expect(byId["HSI-GP-CLINVAR-TNF"]).toBeDefined();
    expect(byId["HSI-GP-CLINVAR-IL21"]).toBeDefined();
    expect(byId["HSI-GP-CLINVAR-PDCD1"]).toBeDefined();
    expect(byId["HSI-GP-TCGA-CD274"]).toBeDefined();
    expect(byId["HSI-GP-TCGA-AWESOME-INDEX"]).toBeDefined();

    expect(byId["HSI-GP-CLINVAR-TNF"]!.edgeIds).toContain("HSI-E-RA-001");
    expect(byId["HSI-GP-CLINVAR-IL21"]!.edgeIds).toEqual(
      expect.arrayContaining(["HSI-E-SSC-002", "HSI-E-SSC-003"]),
    );
    expect(byId["HSI-GP-CLINVAR-PTPN22"]!.edgeIds).toEqual([]);

    for (const p of pointers) {
      expect(p.reviewRequired).toBe(true);
      expect(p.doesNotSetHsiGrade).toBe(true);
      expect(p.autoApprove).toBe(false);
      expect(p.autoApproveIntoKg).toBe(false);
      expect(p.mayFlipEvidenceGrade).toBe(false);
      expect(p.containsPhi).toBe(false);
      expect(p.containsBulkGenomeDump).toBe(false);
      expect(p.createdAt).toBe(generatedAt);
      expect(p.accession.length).toBeGreaterThan(0);
      expect(p.urlTemplate.length).toBeGreaterThan(0);
      expect(p.url.length).toBeGreaterThan(0);
      expect(p.diseaseContext.length).toBeGreaterThan(0);
      expect("hsiGrade" in p).toBe(false);
      expect("sequence" in p).toBe(false);
      for (const edgeId of p.edgeIds) {
        expect(edgeId.startsWith("HSI-E-")).toBe(true);
      }
    }

    const bundle = buildExternalGenomePointersBundle({ generatedAt });
    expect(bundle.schemaVersion).toBe("hsi-external-genome-pointers-1");
    expect(bundle.containsPhi).toBe(false);
    expect(bundle.containsBulkGenomeDump).toBe(false);
    expect(bundle.reviewRequired).toBe(true);
    expect(bundle.summary.pointerCount).toBe(pointers.length);
    expect(bundle.summary.clinVarCount).toBeGreaterThanOrEqual(3);
    expect(bundle.summary.tcgaCount).toBeGreaterThanOrEqual(2);
    expect(bundle.summary.withEdgeLinks).toBeGreaterThanOrEqual(3);

    const json = JSON.parse(serializeExternalGenomePointers(bundle)) as {
      pointers: Array<{ pointerId: string }>;
    };
    expect(json.pointers.length).toBe(bundle.summary.pointerCount);
  });

  test("URL template resolves accession placeholders", () => {
    expect(
      resolveGenomePointerUrl(
        "https://www.ncbi.nlm.nih.gov/clinvar/?term={accession}[gene]",
        "TNF",
      ),
    ).toBe("https://www.ncbi.nlm.nih.gov/clinvar/?term=TNF[gene]");
    expect(
      resolveGenomePointerUrl(
        "https://portal.gdc.cancer.gov/genes/{accession}",
        "ENSG00000120217",
      ),
    ).toBe("https://portal.gdc.cancer.gov/genes/ENSG00000120217");
  });

  test("rejects pointers that try to set grades, omit accession, or embed bulk/PHI", () => {
    const badGrade = {
      pointerId: "x",
      source: "clinvar",
      accession: "TNF",
      urlTemplate: "https://example.test/{accession}",
      url: "https://example.test/TNF",
      geneSymbol: "TNF",
      diseaseContext: ["ra"],
      edgeIds: [],
      reviewRequired: true,
      doesNotSetHsiGrade: true,
      hsiGrade: "established",
    };
    expect(assertSafeExternalGenomePointer(badGrade).ok).toBe(false);

    const noReview = {
      pointerId: "x",
      source: "clinvar",
      accession: "TNF",
      urlTemplate: "https://example.test/{accession}",
      url: "https://example.test/TNF",
      geneSymbol: "TNF",
      diseaseContext: ["ra"],
      edgeIds: [],
      reviewRequired: false,
      doesNotSetHsiGrade: true,
    };
    expect(assertSafeExternalGenomePointer(noReview).ok).toBe(false);

    const bulk = {
      pointerId: "x",
      source: "tcga",
      accession: "dump",
      urlTemplate: "https://example.test/{accession}",
      url: "https://example.test/dump",
      geneSymbol: null,
      diseaseContext: ["io"],
      edgeIds: [],
      reviewRequired: true,
      doesNotSetHsiGrade: true,
      containsBulkGenomeDump: true,
    };
    expect(assertSafeExternalGenomePointer(bulk).ok).toBe(false);

    const badEdge = {
      pointerId: "x",
      source: "clinvar",
      accession: "TNF",
      urlTemplate: "https://example.test/{accession}",
      url: "https://example.test/TNF",
      geneSymbol: "TNF",
      diseaseContext: ["ra"],
      edgeIds: ["NOT-AN-HSI-EDGE"],
      reviewRequired: true,
      doesNotSetHsiGrade: true,
    };
    expect(assertSafeExternalGenomePointer(badEdge).ok).toBe(false);

    const good = buildExampleExternalGenomePointers({
      createdAt: "2026-11-01T19:00:00.000Z",
    })[0]!;
    expect(
      assertSafeExternalGenomePointer(good as unknown as Record<string, unknown>)
        .ok,
    ).toBe(true);
  });

  test("Gate C instructions note ClinVar/TCGA pointers still require review", () => {
    const checklist = buildGateCChecklist({
      generatedAt: "2026-11-01T19:00:00.000Z",
    });
    expect(checklist.autoApproveIntoKg).toBe(false);
    expect(
      checklist.instructions.some((s) => s.includes("ClinVar/TCGA pointers")),
    ).toBe(true);
  });
});
