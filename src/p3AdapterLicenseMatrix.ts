/**
 * P3 adapter license matrix (P2.5).
 *
 * Machine-readable shelf for TDC / AF3 / Boltz / ESM / OpenMM / RDKit /
 * REINVENT4 (+ ISI agents stub). Adapters emit ModelProposalArtifacts only;
 * never flip hsiGrade; never vendor multi-GB weights; never claim commercial
 * licenses signed without evidence.
 *
 * See docs/P3_ADAPTER_RFC.md · docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md.
 */
import {
  FUTURE_TECH_ADAPTER_STUBS,
  P3_ADAPTER_LICENSE_MATRIX_SCHEMA,
} from "./systemsAxes";

export const P3_ADAPTER_LICENSE_MATRIX_EXPORT_SCHEMA =
  "hsi-p3-adapter-license-matrix-1" as const;

export const P3_ADAPTER_LICENSE_MATRIX_RUNTIME_SCHEMA =
  "hsi-p3-adapter-license-matrix-runtime-1" as const;

/** Honest sign-off vocabulary — never invent commercial signed. */
export const P3_ADAPTER_SIGN_OFF_STATUSES = [
  "not_signed",
  "needs_review",
  "non_commercial_only",
  "research_ok_documented",
] as const;
export type P3AdapterSignOffStatus =
  (typeof P3_ADAPTER_SIGN_OFF_STATUSES)[number];

export const P3_ADAPTER_LICENSE_CLASSES = [
  "mit",
  "apache_2",
  "bsd_style",
  "lgpl_family",
  "mixed_per_dataset",
  "weights_restricted",
  "out_of_repo_runtime",
  "other",
] as const;
export type P3AdapterLicenseClass =
  (typeof P3_ADAPTER_LICENSE_CLASSES)[number];

export const P3_ADAPTER_COMMERCIAL_RISKS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;
export type P3AdapterCommercialRisk =
  (typeof P3_ADAPTER_COMMERCIAL_RISKS)[number];

export type P3AdapterLicenseRow = {
  adapterId: string;
  label: string;
  purpose: string;
  licenseClass: P3AdapterLicenseClass;
  commercialRisk: P3AdapterCommercialRisk;
  signOffStatus: P3AdapterSignOffStatus;
  /** Refuse run / download / wire while true. */
  blockedUntilSignOff: boolean;
  /** Upstream docs / LICENSE / weights terms — honest URLs only. */
  docsUrl: string;
  secondaryDocsUrls: string[];
  mayFlipEvidenceGrade: false;
  vendorsModelWeights: false;
  emitsModelProposalOnly: true;
  autoApproveIntoKg: false;
  containsPhi: false;
  notes: string;
};

export type P3AdapterLicenseMatrixBundle = {
  schemaVersion: typeof P3_ADAPTER_LICENSE_MATRIX_EXPORT_SCHEMA;
  runtimeSchema: typeof P3_ADAPTER_LICENSE_MATRIX_RUNTIME_SCHEMA;
  slotSchemaRef: typeof P3_ADAPTER_LICENSE_MATRIX_SCHEMA.schemaVersion;
  rfcDoc: "docs/P3_ADAPTER_RFC.md";
  positionDoc: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md";
  notCds: true;
  autoApproveIntoKg: false;
  mayFlipEvidenceGrade: false;
  vendorsModelWeights: false;
  emitsModelProposalOnly: true;
  containsPhi: false;
  generatedAt: string;
  summary: {
    adapterCount: number;
    blockedUntilSignOffCount: number;
    researchOkDocumentedCount: number;
    needsReviewCount: number;
    nonCommercialOnlyCount: number;
    notSignedCount: number;
  };
  adapters: P3AdapterLicenseRow[];
  signOffVocabulary: typeof P3_ADAPTER_SIGN_OFF_STATUSES;
  instructions: string[];
};

const FORBIDDEN_KEYS = [
  "hsiGrade",
  "curationReview",
  "autoApprove",
  "commercialLicenseSigned",
  "signedCommercial",
  "weightsBlob",
  "modelWeightsPath",
] as const;

/** True when a matrix row looks safe (no grade/auto/fake-signed/weight paths). */
export function assertSafeP3AdapterLicenseRow(
  value: Record<string, unknown>,
): { ok: true } | { ok: false; reason: string } {
  for (const key of FORBIDDEN_KEYS) {
    if (key in value) {
      return {
        ok: false,
        reason: `Forbidden field "${key}" on P3 adapter license row`,
      };
    }
  }
  if (value.mayFlipEvidenceGrade !== false) {
    return { ok: false, reason: "mayFlipEvidenceGrade must be false" };
  }
  if (value.vendorsModelWeights !== false) {
    return { ok: false, reason: "vendorsModelWeights must be false" };
  }
  if (value.emitsModelProposalOnly !== true) {
    return { ok: false, reason: "emitsModelProposalOnly must be true" };
  }
  if (value.autoApproveIntoKg !== false) {
    return { ok: false, reason: "autoApproveIntoKg must be false" };
  }
  if (value.containsPhi === true) {
    return { ok: false, reason: "adapters must not contain PHI" };
  }
  if (typeof value.adapterId !== "string" || !value.adapterId.startsWith("adapter-")) {
    return { ok: false, reason: "adapterId must be adapter-*" };
  }
  if (typeof value.purpose !== "string" || value.purpose.length === 0) {
    return { ok: false, reason: "purpose is required" };
  }
  if (typeof value.docsUrl !== "string" || !value.docsUrl.startsWith("https://")) {
    return { ok: false, reason: "docsUrl must be an https URL" };
  }
  const status = value.signOffStatus;
  if (
    typeof status !== "string" ||
    !(P3_ADAPTER_SIGN_OFF_STATUSES as readonly string[]).includes(status)
  ) {
    return {
      ok: false,
      reason:
        "signOffStatus must be not_signed | needs_review | non_commercial_only | research_ok_documented",
    };
  }
  if (typeof value.blockedUntilSignOff !== "boolean") {
    return { ok: false, reason: "blockedUntilSignOff must be boolean" };
  }
  // Honesty: never claim research_ok while still blocked, or non_commercial while unblocked for commercial.
  if (status === "not_signed" && value.blockedUntilSignOff !== true) {
    return {
      ok: false,
      reason: "not_signed rows must keep blockedUntilSignOff=true",
    };
  }
  if (status === "needs_review" && value.blockedUntilSignOff !== true) {
    return {
      ok: false,
      reason: "needs_review rows must keep blockedUntilSignOff=true",
    };
  }
  if (status === "non_commercial_only" && value.blockedUntilSignOff !== true) {
    return {
      ok: false,
      reason:
        "non_commercial_only stays blockedUntilSignOff=true until a separate commercial review lands",
    };
  }
  if (
    status === "research_ok_documented" &&
    value.blockedUntilSignOff !== false
  ) {
    return {
      ok: false,
      reason:
        "research_ok_documented implies license gate open for research (blockedUntilSignOff=false); runtime still proposal-only",
    };
  }
  const risk = value.commercialRisk;
  if (
    typeof risk !== "string" ||
    !(P3_ADAPTER_COMMERCIAL_RISKS as readonly string[]).includes(risk)
  ) {
    return { ok: false, reason: "commercialRisk must be low|medium|high|critical" };
  }
  const licenseClass = value.licenseClass;
  if (
    typeof licenseClass !== "string" ||
    !(P3_ADAPTER_LICENSE_CLASSES as readonly string[]).includes(licenseClass)
  ) {
    return { ok: false, reason: "licenseClass is not a known class" };
  }
  return { ok: true };
}

function row(
  partial: Omit<
    P3AdapterLicenseRow,
    | "mayFlipEvidenceGrade"
    | "vendorsModelWeights"
    | "emitsModelProposalOnly"
    | "autoApproveIntoKg"
    | "containsPhi"
  >,
): P3AdapterLicenseRow {
  const built: P3AdapterLicenseRow = {
    ...partial,
    mayFlipEvidenceGrade: false,
    vendorsModelWeights: false,
    emitsModelProposalOnly: true,
    autoApproveIntoKg: false,
    containsPhi: false,
  };
  const safety = assertSafeP3AdapterLicenseRow(
    built as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(`Invalid P3 adapter license row ${built.adapterId}: ${safety.reason}`);
  }
  return built;
}

/**
 * Canonical P3 shelf rows — honest URLs + sign-off statuses.
 * Do not invent commercial signed; do not vendor weights.
 */
export function buildP3AdapterLicenseRows(): P3AdapterLicenseRow[] {
  return [
    row({
      adapterId: "adapter-tdc",
      label: "Therapeutics Data Commons (TDC)",
      purpose:
        "Offline ML eval / benchmarks against graded claims; not seed authority",
      licenseClass: "mixed_per_dataset",
      commercialRisk: "medium",
      signOffStatus: "needs_review",
      blockedUntilSignOff: true,
      docsUrl: "https://github.com/mims-harvard/TDC/blob/main/LICENSE",
      secondaryDocsUrls: [
        "https://github.com/mims-harvard/TDC",
        "https://tdcommons.ai",
      ],
      notes:
        "Codebase MIT; each dataset has its own license — review task page + provider terms before any download/run. Cite TDC + underlying sets.",
    }),
    row({
      adapterId: "adapter-af3",
      label: "AlphaFold3",
      purpose: "Structure prediction for mechanism hypotheses (discovery-only)",
      licenseClass: "weights_restricted",
      commercialRisk: "high",
      signOffStatus: "non_commercial_only",
      blockedUntilSignOff: true,
      docsUrl:
        "https://github.com/google-deepmind/alphafold3/blob/main/WEIGHTS_TERMS_OF_USE.md",
      secondaryDocsUrls: [
        "https://github.com/google-deepmind/alphafold3",
        "https://github.com/google-deepmind/alphafold3/blob/main/LICENSE",
      ],
      notes:
        "Source code Apache-2.0 (post-2026 relicense); model parameters remain under AlphaFold 3 Model Parameters Terms of Use — non-commercial / restricted. No commercial signed claim; never vendor weights into hsi-core.",
    }),
    row({
      adapterId: "adapter-boltz",
      label: "Boltz",
      purpose:
        "Open structure / complex (+ affinity) prediction alternative; discovery-only",
      licenseClass: "mit",
      commercialRisk: "low",
      signOffStatus: "research_ok_documented",
      blockedUntilSignOff: false,
      docsUrl: "https://github.com/jwohlwend/boltz/blob/main/LICENSE",
      secondaryDocsUrls: ["https://github.com/jwohlwend/boltz"],
      notes:
        "Upstream documents MIT for code and weights (academic + commercial). Still: no weight vendoring in hsi-core; proposals only; Boltz-2.1 closed API / third-party hosting has separate terms — re-check before those paths.",
    }),
    row({
      adapterId: "adapter-esm",
      label: "ESM (FAIR facebookresearch/esm)",
      purpose:
        "Protein language embeddings / similarity helpers for discovery edges",
      licenseClass: "mit",
      commercialRisk: "medium",
      signOffStatus: "research_ok_documented",
      blockedUntilSignOff: false,
      docsUrl: "https://github.com/facebookresearch/esm/blob/main/LICENSE",
      secondaryDocsUrls: [
        "https://github.com/facebookresearch/esm",
        "https://www.evolutionaryscale.ai/policies/terms-of-use",
      ],
      notes:
        "Scoped to archived FAIR ESM (MIT code + weights for ESM-2/ESMFold). EvolutionaryScale ESM-3 / ESMC use Cambrian Open / Non-Commercial terms — treat as a separate adapter/review; never clinic PHI sequences; never vendor multi-GB weights here.",
    }),
    row({
      adapterId: "adapter-openmm",
      label: "OpenMM",
      purpose: "Molecular dynamics simulation plugin (lab lane; not Gate C evidence)",
      licenseClass: "lgpl_family",
      commercialRisk: "low",
      signOffStatus: "research_ok_documented",
      blockedUntilSignOff: false,
      docsUrl: "https://github.com/openmm/openmm/blob/master/LICENSE",
      secondaryDocsUrls: ["https://github.com/openmm/openmm"],
      notes:
        "OpenMM license family (MIT/LGPL components historically) — research MD OK under documented terms; compute cost; simulation trajectories are not Gate C evidence alone.",
    }),
    row({
      adapterId: "adapter-rdkit",
      label: "RDKit",
      purpose: "Cheminformatics descriptors / fingerprints for research claims",
      licenseClass: "bsd_style",
      commercialRisk: "low",
      signOffStatus: "research_ok_documented",
      blockedUntilSignOff: false,
      docsUrl: "https://github.com/rdkit/rdkit/blob/master/license.txt",
      secondaryDocsUrls: ["https://github.com/rdkit/rdkit"],
      notes:
        "BSD-style permissive toolkit. Descriptors never invent clinical edges; proposals only.",
    }),
    row({
      adapterId: "adapter-reinvent4",
      label: "REINVENT4",
      purpose: "Generative molecular design sandbox (ISI lab only)",
      licenseClass: "apache_2",
      commercialRisk: "medium",
      signOffStatus: "research_ok_documented",
      blockedUntilSignOff: false,
      docsUrl: "https://github.com/MolecularAI/REINVENT4/blob/main/LICENSE",
      secondaryDocsUrls: ["https://github.com/MolecularAI/REINVENT4"],
      notes:
        "Apache-2.0 typical for REINVENT4. P3.2 thin spike → ModelProposalArtifacts only (runtime stub|reinvent; import-only live path). Never clinic recommendation path; never auto-promote generative designs into graded KG; no multi-GB weight vendoring.",
    }),
    row({
      adapterId: "adapter-isi-agents",
      label: "ISI 12-agent research workbench",
      purpose:
        "Supervised research agents (orchestrator + specialists) — runtime out of hsi-core",
      licenseClass: "out_of_repo_runtime",
      commercialRisk: "medium",
      signOffStatus: "not_signed",
      blockedUntilSignOff: true,
      docsUrl:
        "https://github.com/gnaneshwer23/hsi-core/blob/main/docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
      secondaryDocsUrls: [
        "https://github.com/gnaneshwer23/hsi-core/blob/main/docs/ISI_TECHNICAL_BLUEPRINT_ALIGNMENT.md",
      ],
      notes:
        "Catalog/schema pattern only in hsi-core. Executable runtime = ISI product (out of repo). No agent runtime sign-off claimed here.",
    }),
  ];
}

export function buildP3AdapterLicenseMatrixBundle(opts?: {
  generatedAt?: string;
}): P3AdapterLicenseMatrixBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const adapters = buildP3AdapterLicenseRows();

  const stubIds = new Set(FUTURE_TECH_ADAPTER_STUBS.map((s) => s.id));
  for (const a of adapters) {
    if (!stubIds.has(a.adapterId)) {
      throw new Error(
        `P3 license matrix adapter ${a.adapterId} missing from FUTURE_TECH_ADAPTER_STUBS`,
      );
    }
  }
  for (const stub of FUTURE_TECH_ADAPTER_STUBS) {
    if (!adapters.some((a) => a.adapterId === stub.id)) {
      throw new Error(
        `FUTURE_TECH_ADAPTER_STUBS id ${stub.id} missing from P3 license matrix`,
      );
    }
    if (stub.mayFlipEvidenceGrade !== false) {
      throw new Error(`Stub ${stub.id} must keep mayFlipEvidenceGrade=false`);
    }
  }

  return {
    schemaVersion: P3_ADAPTER_LICENSE_MATRIX_EXPORT_SCHEMA,
    runtimeSchema: P3_ADAPTER_LICENSE_MATRIX_RUNTIME_SCHEMA,
    slotSchemaRef: P3_ADAPTER_LICENSE_MATRIX_SCHEMA.schemaVersion,
    rfcDoc: "docs/P3_ADAPTER_RFC.md",
    positionDoc: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
    notCds: true,
    autoApproveIntoKg: false,
    mayFlipEvidenceGrade: false,
    vendorsModelWeights: false,
    emitsModelProposalOnly: true,
    containsPhi: false,
    generatedAt,
    summary: {
      adapterCount: adapters.length,
      blockedUntilSignOffCount: adapters.filter((a) => a.blockedUntilSignOff)
        .length,
      researchOkDocumentedCount: adapters.filter(
        (a) => a.signOffStatus === "research_ok_documented",
      ).length,
      needsReviewCount: adapters.filter((a) => a.signOffStatus === "needs_review")
        .length,
      nonCommercialOnlyCount: adapters.filter(
        (a) => a.signOffStatus === "non_commercial_only",
      ).length,
      notSignedCount: adapters.filter((a) => a.signOffStatus === "not_signed")
        .length,
    },
    adapters,
    signOffVocabulary: P3_ADAPTER_SIGN_OFF_STATUSES,
    instructions: [
      "Read docs/P3_ADAPTER_RFC.md before wiring any adapter.",
      "Refuse to run / download / vendor when blockedUntilSignOff=true.",
      "Emit ModelProposalArtifact only → Gate C pending (autoApprove=false).",
      "Never flip hsiGrade / curationReview; never autoApproveIntoKg.",
      "Never vendor multi-GB model weights into hsi-core.",
      "Never claim commercialLicenseSigned without written evidence in-repo.",
      "signOffStatus vocabulary: not_signed | needs_review | non_commercial_only | research_ok_documented.",
    ],
  };
}

export function serializeP3AdapterLicenseMatrix(
  bundle: P3AdapterLicenseMatrixBundle = buildP3AdapterLicenseMatrixBundle(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeP3AdapterLicenseMatrixMarkdown(
  bundle: P3AdapterLicenseMatrixBundle = buildP3AdapterLicenseMatrixBundle(),
): string {
  const lines: string[] = [
    "# P3 adapter license matrix",
    "",
    `Schema: \`${bundle.schemaVersion}\` · generated ${bundle.generatedAt}`,
    "",
    `RFC: [\`${bundle.rfcDoc}\`](../${bundle.rfcDoc}) · **notCds** · **vendorsModelWeights=false** · **emitsModelProposalOnly=true**`,
    "",
    "## Summary",
    "",
    `- Adapters: ${bundle.summary.adapterCount}`,
    `- Blocked until sign-off: ${bundle.summary.blockedUntilSignOffCount}`,
    `- research_ok_documented: ${bundle.summary.researchOkDocumentedCount}`,
    `- needs_review: ${bundle.summary.needsReviewCount}`,
    `- non_commercial_only: ${bundle.summary.nonCommercialOnlyCount}`,
    `- not_signed: ${bundle.summary.notSignedCount}`,
    "",
    "## Rows",
    "",
    "| adapterId | licenseClass | commercialRisk | signOffStatus | blocked | docs |",
    "|-----------|--------------|----------------|---------------|---------|------|",
  ];
  for (const a of bundle.adapters) {
    lines.push(
      `| \`${a.adapterId}\` | ${a.licenseClass} | ${a.commercialRisk} | ${a.signOffStatus} | ${a.blockedUntilSignOff} | [docs](${a.docsUrl}) |`,
    );
  }
  lines.push(
    "",
    "## Instructions",
    "",
    ...bundle.instructions.map((s) => `- ${s}`),
    "",
  );
  return `${lines.join("\n")}\n`;
}
