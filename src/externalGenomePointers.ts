/**
 * ClinVar / TCGA external genome pointer metadata (P2.4).
 *
 * Citation / ref shelf only — accession + URL template + disease/gene context.
 * Optional edgeIds link discovery neighbourhoods; never bulk genome dumps,
 * never PHI, never sets hsiGrade. Gate C / reviewRequired always true.
 * See docs/VISION_REPO_ALIGNMENT.md · EXTERNAL_GENOME_POINTER_SCHEMA.
 */
import { EXTERNAL_GENOME_POINTER_SCHEMA } from "./systemsAxes";

export const EXTERNAL_GENOME_POINTER_RUNTIME_SCHEMA =
  "hsi-external-genome-pointer-runtime-1" as const;

export const EXTERNAL_GENOME_POINTERS_EXPORT_SCHEMA =
  "hsi-external-genome-pointers-1" as const;

export type GenomePointerSource = "clinvar" | "tcga" | "tcga_index";

/**
 * Typed pointer matching EXTERNAL_GENOME_POINTER_SCHEMA.
 * Pointers cite public catalogs; they do not embed sequences or grades.
 */
export type ExternalGenomePointer = {
  /** Stable pointer id within the export. */
  pointerId: string;
  source: GenomePointerSource;
  /**
   * Public catalog accession or gene symbol used as the citation key
   * (e.g. ClinVar GeneID, HGNC symbol, GDC gene Ensembl id, or index slug).
   */
  accession: string;
  /** URL template with `{accession}` placeholder (or a concrete catalog URL). */
  urlTemplate: string;
  /** Resolved URL for this accession (template substituted). */
  url: string;
  /** Gene symbol when applicable (HGNC-style); null for portal/index shelves. */
  geneSymbol: string | null;
  /** Disease / phenotype context labels (MONDO-ish free text; not ontology ids). */
  diseaseContext: string[];
  /** Optional HSI edge ids this pointer may ground as citation metadata. */
  edgeIds: string[];
  /** Hard invariant — humans must still Gate C; pointers never auto-promote. */
  reviewRequired: true;
  doesNotSetHsiGrade: true;
  mayFlipEvidenceGrade: false;
  autoApprove: false;
  autoApproveIntoKg: false;
  containsPhi: false;
  containsBulkGenomeDump: false;
  createdAt: string;
  notes?: string;
};

export type ExternalGenomePointersBundle = {
  schemaVersion: typeof EXTERNAL_GENOME_POINTERS_EXPORT_SCHEMA;
  runtimeSchema: typeof EXTERNAL_GENOME_POINTER_RUNTIME_SCHEMA;
  slotSchemaRef: typeof EXTERNAL_GENOME_POINTER_SCHEMA.schemaVersion;
  notCds: true;
  autoApproveIntoKg: false;
  autoApprove: false;
  doesNotSetHsiGrade: true;
  mayFlipEvidenceGrade: false;
  reviewRequired: true;
  containsPhi: false;
  containsBulkGenomeDump: false;
  generatedAt: string;
  summary: {
    pointerCount: number;
    clinVarCount: number;
    tcgaCount: number;
    withEdgeLinks: number;
    uniqueLinkedEdgeIds: number;
  };
  pointers: ExternalGenomePointer[];
  instructions: string[];
};

const FORBIDDEN_KEYS = [
  "hsiGrade",
  "curationReview",
  "teachingStatus",
  "sequence",
  "genomicSequence",
  "vcf",
  "bam",
  "fastq",
  "patientId",
] as const;

const CLINVAR_GENE_URL_TEMPLATE =
  "https://www.ncbi.nlm.nih.gov/clinvar/?term={accession}[gene]" as const;

const GDC_GENE_URL_TEMPLATE =
  "https://portal.gdc.cancer.gov/genes/{accession}" as const;

const GDC_PORTAL_URL = "https://portal.gdc.cancer.gov/" as const;

const AWESOME_TCGA_URL =
  "https://github.com/IARCbioinfo/awesome-TCGA" as const;

/** Substitute `{accession}` in a URL template. */
export function resolveGenomePointerUrl(
  urlTemplate: string,
  accession: string,
): string {
  return urlTemplate.replaceAll("{accession}", encodeURIComponent(accession));
}

/** True when an object looks like a safe genome pointer (no grade/PHI/bulk). */
export function assertSafeExternalGenomePointer(
  value: Record<string, unknown>,
): { ok: true } | { ok: false; reason: string } {
  for (const key of FORBIDDEN_KEYS) {
    if (key in value) {
      return {
        ok: false,
        reason: `Forbidden field "${key}" on genome pointer — citation/ref only`,
      };
    }
  }
  if (value.doesNotSetHsiGrade !== true) {
    return { ok: false, reason: "doesNotSetHsiGrade must be true" };
  }
  if (value.reviewRequired !== true) {
    return { ok: false, reason: "reviewRequired must be true (Gate C still required)" };
  }
  if (value.mayFlipEvidenceGrade === true) {
    return { ok: false, reason: "mayFlipEvidenceGrade must not be true" };
  }
  if (value.autoApprove === true || value.autoApproveIntoKg === true) {
    return { ok: false, reason: "autoApprove / autoApproveIntoKg must be false" };
  }
  if (value.containsPhi === true) {
    return { ok: false, reason: "pointers must not contain PHI" };
  }
  if (value.containsBulkGenomeDump === true) {
    return { ok: false, reason: "pointers must not embed bulk genome dumps" };
  }
  if (typeof value.accession !== "string" || value.accession.length === 0) {
    return { ok: false, reason: "accession is required" };
  }
  if (typeof value.urlTemplate !== "string" || value.urlTemplate.length === 0) {
    return { ok: false, reason: "urlTemplate is required" };
  }
  if (typeof value.url !== "string" || value.url.length === 0) {
    return { ok: false, reason: "url is required" };
  }
  if (!Array.isArray(value.diseaseContext)) {
    return { ok: false, reason: "diseaseContext must be an array" };
  }
  if (!Array.isArray(value.edgeIds)) {
    return { ok: false, reason: "edgeIds must be an array (may be empty)" };
  }
  if (
    value.edgeIds.some(
      (id) => typeof id !== "string" || !id.startsWith("HSI-E-"),
    )
  ) {
    return {
      ok: false,
      reason: "edgeIds must be HSI-E-* ids when present",
    };
  }
  const source = value.source;
  if (source !== "clinvar" && source !== "tcga" && source !== "tcga_index") {
    return { ok: false, reason: "source must be clinvar | tcga | tcga_index" };
  }
  return { ok: true };
}

function pointer(
  partial: Omit<
    ExternalGenomePointer,
    | "reviewRequired"
    | "doesNotSetHsiGrade"
    | "mayFlipEvidenceGrade"
    | "autoApprove"
    | "autoApproveIntoKg"
    | "containsPhi"
    | "containsBulkGenomeDump"
    | "url"
  > & { url?: string },
): ExternalGenomePointer {
  const url =
    partial.url ??
    resolveGenomePointerUrl(partial.urlTemplate, partial.accession);
  const built: ExternalGenomePointer = {
    ...partial,
    url,
    reviewRequired: true,
    doesNotSetHsiGrade: true,
    mayFlipEvidenceGrade: false,
    autoApprove: false,
    autoApproveIntoKg: false,
    containsPhi: false,
    containsBulkGenomeDump: false,
  };
  const safety = assertSafeExternalGenomePointer(
    built as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(
      `Refusing unsafe genome pointer (${partial.pointerId}): ${safety.reason}`,
    );
  }
  return built;
}

/**
 * Illustrative ClinVar / TCGA citation pointers for publish demos.
 * Gene / portal refs only — no VCF / BAM / FASTQ / PHI. Packs remain authority.
 */
export function buildExampleExternalGenomePointers(opts?: {
  createdAt?: string;
}): ExternalGenomePointer[] {
  const createdAt = opts?.createdAt ?? new Date().toISOString();

  return [
    pointer({
      pointerId: "HSI-GP-CLINVAR-TNF",
      source: "clinvar",
      accession: "TNF",
      urlTemplate: CLINVAR_GENE_URL_TEMPLATE,
      geneSymbol: "TNF",
      diseaseContext: [
        "rheumatoid arthritis",
        "anti-TNF response heterogeneity (scope-locked pathway context)",
      ],
      edgeIds: ["HSI-E-RA-001"],
      createdAt,
      notes:
        "ClinVar gene-term citation for TNF — optional grounding for RA/TNF pathway; does not set hsiGrade; Gate C still required.",
    }),
    pointer({
      pointerId: "HSI-GP-CLINVAR-PTPN22",
      source: "clinvar",
      accession: "PTPN22",
      urlTemplate: CLINVAR_GENE_URL_TEMPLATE,
      geneSymbol: "PTPN22",
      diseaseContext: [
        "rheumatoid arthritis",
        "autoimmunity susceptibility (literature shelf — not a seeded claim edge)",
      ],
      edgeIds: [],
      createdAt,
      notes:
        "Classic RA genetics shelf pointer (PTPN22) — citation only; no bulk variants; not linked to a graded edge until curated.",
    }),
    pointer({
      pointerId: "HSI-GP-CLINVAR-IL21",
      source: "clinvar",
      accession: "IL21",
      urlTemplate: CLINVAR_GENE_URL_TEMPLATE,
      geneSymbol: "IL21",
      diseaseContext: [
        "systemic sclerosis",
        "Tfh–B–IL-21 PRD MVP neighbourhood",
      ],
      edgeIds: ["HSI-E-SSC-002", "HSI-E-SSC-003"],
      createdAt,
      notes:
        "ClinVar IL21 gene citation for dual-track SSc IL-21 axis — packs + PMIDs remain evidence authority.",
    }),
    pointer({
      pointerId: "HSI-GP-CLINVAR-PDCD1",
      source: "clinvar",
      accession: "PDCD1",
      urlTemplate: CLINVAR_GENE_URL_TEMPLATE,
      geneSymbol: "PDCD1",
      diseaseContext: [
        "immuno-oncology",
        "PD-1 / T-cell exhaustion educational graph",
      ],
      edgeIds: ["HSI-E-IO-001"],
      createdAt,
      notes:
        "ClinVar PDCD1 (PD-1) gene citation — discovery IO wedge; never CDS / never auto Gate C.",
    }),
    pointer({
      pointerId: "HSI-GP-TCGA-GDC-PORTAL",
      source: "tcga",
      accession: "gdc-data-portal",
      urlTemplate: GDC_PORTAL_URL,
      url: GDC_PORTAL_URL,
      geneSymbol: null,
      diseaseContext: [
        "immuno-oncology discovery",
        "TCGA / GDC public data portal (index — not a dump)",
      ],
      edgeIds: [],
      createdAt,
      notes:
        "GDC portal shelf pointer — respect TCGA/dbGaP access rules; no PHI; no bulk genome dump in hsi-core.",
    }),
    pointer({
      pointerId: "HSI-GP-TCGA-CD274",
      source: "tcga",
      // CD274 (PD-L1) Ensembl gene id — public GDC gene page, not a sequence dump.
      accession: "ENSG00000120217",
      urlTemplate: GDC_GENE_URL_TEMPLATE,
      geneSymbol: "CD274",
      diseaseContext: [
        "immuno-oncology",
        "PD-L1 / checkpoint therapy neighbourhood",
      ],
      edgeIds: ["HSI-E-IO-001", "HSI-E-IO-002"],
      createdAt,
      notes:
        "GDC gene page for CD274 (PD-L1) — citation/ref for IO edges; does not embed expression matrices or PHI.",
    }),
    pointer({
      pointerId: "HSI-GP-TCGA-AWESOME-INDEX",
      source: "tcga_index",
      accession: "awesome-TCGA",
      urlTemplate: AWESOME_TCGA_URL,
      url: AWESOME_TCGA_URL,
      geneSymbol: null,
      diseaseContext: [
        "immuno-oncology discovery literature & data portals",
        "curated TCGA resource index (IARCbioinfo/awesome-TCGA)",
      ],
      edgeIds: [],
      createdAt,
      notes:
        "awesome-TCGA index shelf (VISION_REPO_ALIGNMENT) — reference-only; hsi-sources remains archival; no auto-ingest.",
    }),
  ];
}

export function buildExternalGenomePointersBundle(opts?: {
  generatedAt?: string;
}): ExternalGenomePointersBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const pointers = buildExampleExternalGenomePointers({ createdAt: generatedAt });
  const linkedEdgeIds = new Set(
    pointers.flatMap((p) => p.edgeIds),
  );

  return {
    schemaVersion: EXTERNAL_GENOME_POINTERS_EXPORT_SCHEMA,
    runtimeSchema: EXTERNAL_GENOME_POINTER_RUNTIME_SCHEMA,
    slotSchemaRef: EXTERNAL_GENOME_POINTER_SCHEMA.schemaVersion,
    notCds: true,
    autoApproveIntoKg: false,
    autoApprove: false,
    doesNotSetHsiGrade: true,
    mayFlipEvidenceGrade: false,
    reviewRequired: true,
    containsPhi: false,
    containsBulkGenomeDump: false,
    generatedAt,
    summary: {
      pointerCount: pointers.length,
      clinVarCount: pointers.filter((p) => p.source === "clinvar").length,
      tcgaCount: pointers.filter(
        (p) => p.source === "tcga" || p.source === "tcga_index",
      ).length,
      withEdgeLinks: pointers.filter((p) => p.edgeIds.length > 0).length,
      uniqueLinkedEdgeIds: linkedEdgeIds.size,
    },
    pointers,
    instructions: [
      "ClinVar / TCGA pointers are citation/ref metadata only — never bulk genome dumps or PHI.",
      "reviewRequired=true · doesNotSetHsiGrade=true · autoApprove=false · autoApproveIntoKg=false.",
      "Optional edgeIds link discovery neighbourhoods; packs + PMIDs remain evidence authority.",
      "Gate C still required — pointers never silent-promote to established / never auto-approve into KG.",
      "Respect ClinVar citation norms and TCGA / dbGaP access rules; hsi-sources stays archival (no sync).",
      "See docs/VISION_REPO_ALIGNMENT.md · EXTERNAL_GENOME_POINTER_SCHEMA · docs/BUILD_STATUS_AND_NEXT.md P2.4.",
    ],
  };
}

export function serializeExternalGenomePointers(
  bundle: ExternalGenomePointersBundle = buildExternalGenomePointersBundle(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
