/**
 * Offline model-eval harness stubs (P2.3).
 *
 * Scores model proposals / embedding sidecars against frozen public pack
 * fixtures (RA / SSc / gut / neuro). No training, no PHI, no grade flips,
 * no auto-approve into KG. Packs remain evidence authority.
 *
 * See MODEL_EVAL_HARNESS_STUB + docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md.
 */
import { MODEL_EVAL_HARNESS_STUB, MODEL_PROPOSAL_ARTIFACT_SCHEMA } from "./systemsAxes";
import { HSI_T2D_IMMUNO_SEED_EDGES } from "./seed/t2dImmunoMetabolic";
import { HSI_SSC_SEED_EDGES } from "./seed/sscTfhBIl21";
import { HSI_GUT_SEED_EDGES } from "./seed/gutScfaMucosal";
import { HSI_NI_SEED_EDGES } from "./seed/neuroVagusCholinergic";
import {
  buildExampleModelProposals,
  type ModelProposalArtifact,
} from "./modelProposal";
import {
  buildExampleEmbeddingSidecars,
  type EdgeEmbeddingSidecar,
} from "./embeddingSidecar";
import { buildRdkitAdapterProposals } from "./adapters/rdkitAdapter";
import type { HsiEdge } from "./schema";
import type { HsiGrade, HsiTeachingStatus } from "./grades";

export const MODEL_EVAL_HARNESS_RUNTIME_SCHEMA =
  "hsi-model-eval-harness-runtime-1" as const;

export const MODEL_EVAL_HARNESS_EXPORT_SCHEMA =
  "hsi-model-eval-harness-1" as const;

/** Named offline checks — stub metrics, not a training loop. */
export const MODEL_EVAL_CHECK_IDS = [
  "cited_edge_ids_exist",
  "grade_not_flipped",
  "required_fields_present",
  "fail_closed_clinical_phi",
  "sidecar_locators_present",
  "pack_authority_unchanged",
] as const;

export type ModelEvalCheckId = (typeof MODEL_EVAL_CHECK_IDS)[number];

export type ModelEvalSubjectKind = "model_proposal" | "embedding_sidecar";

/** Frozen public-pack edge snapshot used as offline ground truth. */
export type FrozenPackEdgeFixture = {
  edgeId: string;
  packId:
    | "hsi-pilot-ra-tnf"
    | "hsi-ssc-pathway-pack"
    | "hsi-gut-immune-pack"
    | "hsi-neuroimmune-pack";
  hsiGrade: HsiGrade;
  teachingStatus: HsiTeachingStatus;
  curationReview: string;
};

export type ModelEvalCheckDefinition = {
  id: ModelEvalCheckId;
  label: string;
  detail: string;
  failClosed: boolean;
};

export type ModelEvalCheckResult = {
  checkId: ModelEvalCheckId;
  passed: boolean;
  detail: string;
};

export type ModelEvalCaseResult = {
  caseId: string;
  kind: ModelEvalSubjectKind;
  label: string;
  /** Expected outcome for stub demos (pass cases + intentional fails). */
  expectPass: boolean;
  passed: boolean;
  failClosed: boolean;
  checks: ModelEvalCheckResult[];
  notes?: string;
};

export type ModelEvalHarnessBundle = {
  schemaVersion: typeof MODEL_EVAL_HARNESS_EXPORT_SCHEMA;
  runtimeSchema: typeof MODEL_EVAL_HARNESS_RUNTIME_SCHEMA;
  stubSchemaRef: typeof MODEL_EVAL_HARNESS_STUB.schemaVersion;
  status: typeof MODEL_EVAL_HARNESS_STUB.status;
  notCds: true;
  offlineOnly: true;
  mayUseLivePhi: false;
  mayTrainModels: false;
  mayFlipEvidenceGrade: false;
  autoApprove: false;
  autoApproveIntoKg: false;
  containsPhi: false;
  packsRemainAuthority: true;
  generatedAt: string;
  fixtureSummary: {
    packIds: string[];
    edgeCount: number;
    byPack: Record<string, number>;
  };
  checks: ModelEvalCheckDefinition[];
  cases: ModelEvalCaseResult[];
  summary: {
    caseCount: number;
    passed: number;
    failed: number;
    failClosedHits: number;
    /** Stub demos: intentional fail cases that correctly failed. */
    intentionalFailCorrect: number;
    /** True when all expectPass cases pass and all expectPass=false cases fail. */
    stubBehaviorGreen: boolean;
  };
  instructions: string[];
};

export const MODEL_EVAL_CHECK_DEFINITIONS: readonly ModelEvalCheckDefinition[] =
  [
    {
      id: "cited_edge_ids_exist",
      label: "Cited edge ids exist in frozen packs",
      detail:
        "Any edge:HSI-E-* / citedEdgeIds must resolve to RA/SSc/gut/neuro fixture edges",
      failClosed: true,
    },
    {
      id: "grade_not_flipped",
      label: "Grade not flipped",
      detail:
        "Subject must not set hsiGrade / curationReview / mayFlipEvidenceGrade or override fixture grades",
      failClosed: true,
    },
    {
      id: "required_fields_present",
      label: "Required fields present",
      detail:
        "Model proposals need MODEL_PROPOSAL requiredFields; sidecars need modelId/dim/locator/doesNotSetHsiGrade",
      failClosed: true,
    },
    {
      id: "fail_closed_clinical_phi",
      label: "Fail-closed on clinical / PHI claims",
      detail:
        "Detectable clinical-cure / dosing / EHR / PHI / patient-identifiable language fails closed",
      failClosed: true,
    },
    {
      id: "sidecar_locators_present",
      label: "Sidecar locators present",
      detail: "Embedding sidecars require vectorRef and/or contentHash",
      failClosed: true,
    },
    {
      id: "pack_authority_unchanged",
      label: "Pack authority unchanged",
      detail:
        "Subjects must not claim packsAreAuthority=false or overridePackGrades; fixture grades stay frozen",
      failClosed: true,
    },
  ];

const EDGE_ID_RE = /\b(HSI-E-[A-Z0-9-]+)\b/g;
const EDGE_HINT_RE = /(?:^|[\s:])edge:?(HSI-E-[A-Z0-9-]+)\b/gi;

/** Heuristic patterns — fail closed when detectable; not a PHI de-id engine. */
const CLINICAL_PHI_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "phi_flag", re: /\bPHI\b|\bprotected health information\b/i },
  { id: "mrn", re: /\bMRN\b|\bmedical record number\b/i },
  { id: "ssn", re: /\bSSN\b|\bsocial security\b/i },
  { id: "patient_name", re: /\bpatient\s+(?:name|dob|address|phone)\b/i },
  { id: "ehr_write", re: /\bEHR\s+write[- ]?back\b|\bwrite to (?:the )?EHR\b/i },
  {
    id: "clinical_cure",
    re: /\bclinical\s+cure\b|\bcures?\s+(?:RA|rheumatoid|disease)\b/i,
  },
  {
    id: "dosing",
    re: /\b(?:mg\/kg|prescribe|titrate dose|dosing regimen)\b/i,
  },
  {
    id: "live_cds",
    re: /\blive\s+CDS\b|\bauto[- ]?apply to (?:EHR|chart)\b/i,
  },
  {
    id: "partner_signed_fake",
    re: /\bpartnerSigned\s*[:=]\s*true\b/i,
  },
];

const FORBIDDEN_GRADE_KEYS = [
  "hsiGrade",
  "curationReview",
  "mayFlipEvidenceGrade",
] as const;

function fixtureFromEdge(
  edge: HsiEdge,
  packId: FrozenPackEdgeFixture["packId"],
): FrozenPackEdgeFixture {
  return {
    edgeId: edge.id,
    packId,
    hsiGrade: edge.hsiGrade,
    teachingStatus: edge.teachingStatus,
    curationReview: edge.curationReview,
  };
}

/** Build frozen edge fixtures from public pack seed authorities. */
export function buildFrozenPublicPackFixtures(): FrozenPackEdgeFixture[] {
  const ra = HSI_T2D_IMMUNO_SEED_EDGES.filter((e) =>
    e.id.startsWith("HSI-E-RA-"),
  ).map((e) => fixtureFromEdge(e, "hsi-pilot-ra-tnf"));
  const ssc = HSI_SSC_SEED_EDGES.map((e) =>
    fixtureFromEdge(e, "hsi-ssc-pathway-pack"),
  );
  const gut = HSI_GUT_SEED_EDGES.map((e) =>
    fixtureFromEdge(e, "hsi-gut-immune-pack"),
  );
  const neuro = HSI_NI_SEED_EDGES.map((e) =>
    fixtureFromEdge(e, "hsi-neuroimmune-pack"),
  );
  return [...ra, ...ssc, ...gut, ...neuro];
}

export function fixtureIndex(
  fixtures: FrozenPackEdgeFixture[] = buildFrozenPublicPackFixtures(),
): Map<string, FrozenPackEdgeFixture> {
  return new Map(fixtures.map((f) => [f.edgeId, f]));
}

/** Extract cited edge ids from free text / evidence hints / explicit lists. */
export function extractCitedEdgeIds(input: {
  citedEdgeIds?: string[];
  evidenceHints?: string[];
  textBlobs?: string[];
}): string[] {
  const found = new Set<string>();
  for (const id of input.citedEdgeIds ?? []) {
    if (id.startsWith("HSI-E-")) found.add(id);
  }
  for (const hint of input.evidenceHints ?? []) {
    EDGE_HINT_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = EDGE_HINT_RE.exec(hint)) !== null) {
      found.add(m[1]!);
    }
    EDGE_ID_RE.lastIndex = 0;
    while ((m = EDGE_ID_RE.exec(hint)) !== null) {
      found.add(m[1]!);
    }
  }
  for (const blob of input.textBlobs ?? []) {
    EDGE_ID_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = EDGE_ID_RE.exec(blob)) !== null) {
      found.add(m[1]!);
    }
  }
  return [...found].sort();
}

export function detectClinicalPhiClaims(
  texts: string[],
): { hit: boolean; matches: string[] } {
  const matches: string[] = [];
  for (const text of texts) {
    if (!text) continue;
    for (const p of CLINICAL_PHI_PATTERNS) {
      if (p.re.test(text)) {
        matches.push(p.id);
      }
    }
  }
  return { hit: matches.length > 0, matches: [...new Set(matches)] };
}

function collectStringValues(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectStringValues(v, out);
    }
  }
}

function checkCitedEdges(
  cited: string[],
  index: Map<string, FrozenPackEdgeFixture>,
): ModelEvalCheckResult {
  const missing = cited.filter((id) => !index.has(id));
  if (cited.length === 0) {
    return {
      checkId: "cited_edge_ids_exist",
      passed: true,
      detail: "No edge ids cited (ok for pure draft stubs)",
    };
  }
  if (missing.length > 0) {
    return {
      checkId: "cited_edge_ids_exist",
      passed: false,
      detail: `Unknown edge ids (not in frozen packs): ${missing.join(", ")}`,
    };
  }
  return {
    checkId: "cited_edge_ids_exist",
    passed: true,
    detail: `All ${cited.length} cited edge id(s) resolve in frozen packs`,
  };
}

function checkGradeNotFlipped(
  subject: Record<string, unknown>,
  index: Map<string, FrozenPackEdgeFixture>,
  cited: string[],
): ModelEvalCheckResult {
  for (const key of FORBIDDEN_GRADE_KEYS) {
    if (key in subject) {
      if (key === "mayFlipEvidenceGrade" && subject[key] === false) continue;
      if (key === "mayFlipEvidenceGrade" && subject[key] === true) {
        return {
          checkId: "grade_not_flipped",
          passed: false,
          detail: "mayFlipEvidenceGrade=true is forbidden",
        };
      }
      if (key !== "mayFlipEvidenceGrade") {
        return {
          checkId: "grade_not_flipped",
          passed: false,
          detail: `Forbidden field "${key}" on eval subject — models may not set grades`,
        };
      }
    }
  }
  const proposed = subject.proposedHsiGrade ?? subject.overrideHsiGrade;
  if (proposed !== undefined && proposed !== null) {
    return {
      checkId: "grade_not_flipped",
      passed: false,
      detail: "proposedHsiGrade / overrideHsiGrade is forbidden",
    };
  }
  // If subject asserts a grade map for cited edges, it must match frozen fixtures.
  const gradeMap = subject.claimedGradesByEdgeId;
  if (gradeMap && typeof gradeMap === "object") {
    for (const [edgeId, grade] of Object.entries(
      gradeMap as Record<string, unknown>,
    )) {
      const frozen = index.get(edgeId);
      if (!frozen) continue;
      if (grade !== frozen.hsiGrade) {
        return {
          checkId: "grade_not_flipped",
          passed: false,
          detail: `Attempted grade flip on ${edgeId}: claimed ${String(grade)} vs frozen ${frozen.hsiGrade}`,
        };
      }
    }
  }
  void cited;
  return {
    checkId: "grade_not_flipped",
    passed: true,
    detail: "No grade / curation flip fields present",
  };
}

function checkRequiredFields(
  kind: ModelEvalSubjectKind,
  subject: Record<string, unknown>,
): ModelEvalCheckResult {
  if (kind === "model_proposal") {
    const missing = MODEL_PROPOSAL_ARTIFACT_SCHEMA.requiredFields.filter(
      (f) => {
        const v = subject[f];
        if (v === undefined || v === null) return true;
        if (typeof v === "string" && v.trim() === "") return true;
        if (Array.isArray(v) && v.length === 0 && f === "evidenceHints") {
          return true;
        }
        return false;
      },
    );
    if (missing.length > 0) {
      return {
        checkId: "required_fields_present",
        passed: false,
        detail: `Missing proposal fields: ${missing.join(", ")}`,
      };
    }
    return {
      checkId: "required_fields_present",
      passed: true,
      detail: "All model-proposal required fields present",
    };
  }

  const missing: string[] = [];
  if (typeof subject.modelId !== "string" || !subject.modelId) {
    missing.push("modelId");
  }
  if (typeof subject.dim !== "number" || !(subject.dim > 0)) {
    missing.push("dim");
  }
  if (subject.doesNotSetHsiGrade !== true) {
    missing.push("doesNotSetHsiGrade=true");
  }
  if (missing.length > 0) {
    return {
      checkId: "required_fields_present",
      passed: false,
      detail: `Missing sidecar fields: ${missing.join(", ")}`,
    };
  }
  return {
    checkId: "required_fields_present",
    passed: true,
    detail: "Sidecar required fields present",
  };
}

function checkFailClosedClinicalPhi(
  subject: Record<string, unknown>,
): ModelEvalCheckResult {
  const texts: string[] = [];
  collectStringValues(subject, texts);
  const { hit, matches } = detectClinicalPhiClaims(texts);
  if (hit) {
    return {
      checkId: "fail_closed_clinical_phi",
      passed: false,
      detail: `Fail-closed clinical/PHI patterns: ${matches.join(", ")}`,
    };
  }
  if (subject.containsPhi === true) {
    return {
      checkId: "fail_closed_clinical_phi",
      passed: false,
      detail: "containsPhi=true is forbidden",
    };
  }
  if (subject.clinicalActive === true) {
    return {
      checkId: "fail_closed_clinical_phi",
      passed: false,
      detail: "clinicalActive=true is forbidden on offline eval subjects",
    };
  }
  return {
    checkId: "fail_closed_clinical_phi",
    passed: true,
    detail: "No detectable clinical/PHI claims",
  };
}

function checkSidecarLocators(
  kind: ModelEvalSubjectKind,
  subject: Record<string, unknown>,
): ModelEvalCheckResult {
  if (kind !== "embedding_sidecar") {
    return {
      checkId: "sidecar_locators_present",
      passed: true,
      detail: "N/A for model_proposal",
    };
  }
  const hasRef =
    typeof subject.vectorRef === "string" && subject.vectorRef.length > 0;
  const hasHash =
    typeof subject.contentHash === "string" && subject.contentHash.length > 0;
  if (!hasRef && !hasHash) {
    return {
      checkId: "sidecar_locators_present",
      passed: false,
      detail: "Sidecar requires vectorRef and/or contentHash",
    };
  }
  return {
    checkId: "sidecar_locators_present",
    passed: true,
    detail: "Sidecar locator(s) present",
  };
}

function checkPackAuthority(
  subject: Record<string, unknown>,
): ModelEvalCheckResult {
  if (subject.packsAreAuthority === false) {
    return {
      checkId: "pack_authority_unchanged",
      passed: false,
      detail: "packsAreAuthority=false is forbidden — packs remain authority",
    };
  }
  if (subject.overridePackGrades === true) {
    return {
      checkId: "pack_authority_unchanged",
      passed: false,
      detail: "overridePackGrades=true is forbidden",
    };
  }
  if (subject.autoApprove === true || subject.autoApproveIntoKg === true) {
    return {
      checkId: "pack_authority_unchanged",
      passed: false,
      detail: "autoApprove / autoApproveIntoKg must not be true",
    };
  }
  return {
    checkId: "pack_authority_unchanged",
    passed: true,
    detail: "Packs remain authority; no auto-approve",
  };
}

export type ScoreModelEvalSubjectInput = {
  caseId: string;
  kind: ModelEvalSubjectKind;
  label: string;
  subject: Record<string, unknown>;
  expectPass?: boolean;
  notes?: string;
  citedEdgeIds?: string[];
};

/** Score one proposal or sidecar offline against frozen pack fixtures. */
export function scoreModelEvalSubject(
  input: ScoreModelEvalSubjectInput,
  fixtures: FrozenPackEdgeFixture[] = buildFrozenPublicPackFixtures(),
): ModelEvalCaseResult {
  const index = fixtureIndex(fixtures);
  const evidenceHints = Array.isArray(input.subject.evidenceHints)
    ? (input.subject.evidenceHints as string[])
    : undefined;
  const textBlobs: string[] = [];
  collectStringValues(input.subject, textBlobs);
  const cited = extractCitedEdgeIds({
    citedEdgeIds: input.citedEdgeIds,
    evidenceHints,
    textBlobs,
  });

  const checks: ModelEvalCheckResult[] = [
    checkCitedEdges(cited, index),
    checkGradeNotFlipped(input.subject, index, cited),
    checkRequiredFields(input.kind, input.subject),
    checkFailClosedClinicalPhi(input.subject),
    checkSidecarLocators(input.kind, input.subject),
    checkPackAuthority(input.subject),
  ];

  const passed = checks.every((c) => c.passed);
  const failClosed = checks.some(
    (c) =>
      !c.passed &&
      MODEL_EVAL_CHECK_DEFINITIONS.find((d) => d.id === c.checkId)
        ?.failClosed === true,
  );

  return {
    caseId: input.caseId,
    kind: input.kind,
    label: input.label,
    expectPass: input.expectPass ?? true,
    passed,
    failClosed,
    checks,
    notes: input.notes,
  };
}

function proposalAsRecord(
  p: ModelProposalArtifact,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return { ...p, ...extra };
}

function sidecarAsRecord(
  edgeId: string,
  s: EdgeEmbeddingSidecar,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return { edgeId, ...s, ...extra };
}

/**
 * Demo offline cases: green proposals/sidecars + intentional fail-closed stubs.
 * Does not train models; does not write KG.
 */
export function buildDemoModelEvalCases(opts?: {
  createdAt?: string;
}): ScoreModelEvalSubjectInput[] {
  const createdAt = opts?.createdAt ?? new Date().toISOString();
  const proposals = buildExampleModelProposals({ createdAt });
  const goodProposal = proposals.find((p) => p.proposalId === "HSI-MP-SSC-001")!;
  const sidecars = buildExampleEmbeddingSidecars({ createdAt });
  const goodSidecar = sidecars["HSI-E-RA-001"]!;
  const rdkitProposals = buildRdkitAdapterProposals({
    createdAt,
    forceStub: true,
  });
  const goodRdkit = rdkitProposals.find(
    (p) => p.proposalId === "HSI-MP-RDKIT-MTX-001",
  )!;

  return [
    {
      caseId: "EVAL-PASS-PROPOSAL-SSC-001",
      kind: "model_proposal",
      label: "Safe SSc model proposal citing pack edge",
      expectPass: true,
      subject: proposalAsRecord(goodProposal, {
        evidenceHints: [
          ...goodProposal.evidenceHints,
          "edge:HSI-E-SSC-001",
        ],
      }),
      notes: "Cites existing SSc pack edge; no grade/PHI/clinical claims",
    },
    {
      caseId: "EVAL-PASS-RDKIT-MTX-001",
      kind: "model_proposal",
      label: "P3.0 RDKit MTX descriptor proposal (stub runtime)",
      expectPass: true,
      subject: proposalAsRecord(goodRdkit),
      notes:
        "adapter-rdkit proposal cites HSI-E-RA-012; no grade/PHI/clinical/dosing claims",
    },
    {
      caseId: "EVAL-PASS-SIDECAR-RA-001",
      kind: "embedding_sidecar",
      label: "Safe RA embedding sidecar with hash/ref",
      expectPass: true,
      subject: sidecarAsRecord("HSI-E-RA-001", goodSidecar),
      citedEdgeIds: ["HSI-E-RA-001"],
      notes: "Hash/ref sidecar; doesNotSetHsiGrade; packs remain authority",
    },
    {
      caseId: "EVAL-FAIL-UNKNOWN-EDGE",
      kind: "model_proposal",
      label: "Proposal cites non-existent edge id",
      expectPass: false,
      subject: proposalAsRecord({
        ...goodProposal,
        proposalId: "HSI-MP-BAD-EDGE",
        evidenceHints: ["edge:HSI-E-FAKE-999", "pack:hsi-ssc-pathway-pack"],
        contextNote: "Intentional fail stub — unknown edge id",
      }),
      notes: "Fail-closed: cited edge must exist in frozen packs",
    },
    {
      caseId: "EVAL-FAIL-GRADE-FLIP",
      kind: "model_proposal",
      label: "Proposal tries to set hsiGrade",
      expectPass: false,
      subject: proposalAsRecord(goodProposal, {
        proposalId: "HSI-MP-BAD-GRADE",
        hsiGrade: "established",
        evidenceHints: ["edge:HSI-E-SSC-001"],
      }),
      notes: "Fail-closed: models never flip hsiGrade",
    },
    {
      caseId: "EVAL-FAIL-CLINICAL-PHI",
      kind: "model_proposal",
      label: "Proposal claims clinical cure / PHI",
      expectPass: false,
      subject: proposalAsRecord({
        ...goodProposal,
        proposalId: "HSI-MP-BAD-PHI",
        contextNote:
          "Intentional fail stub — claims clinical cure and includes PHI / MRN language for harness detection",
        evidenceHints: ["edge:HSI-E-NI-006"],
      }),
      notes: "Fail-closed on detectable clinical/PHI language",
    },
    {
      caseId: "EVAL-FAIL-SIDECAR-NO-LOCATOR",
      kind: "embedding_sidecar",
      label: "Sidecar missing vectorRef and contentHash",
      expectPass: false,
      subject: {
        edgeId: "HSI-E-GUT-003",
        modelId: "hsi-stub-edge-encoder/v0-demo",
        dim: 384,
        vectorRef: null,
        contentHash: null,
        doesNotSetHsiGrade: true,
        createdAt,
      },
      citedEdgeIds: ["HSI-E-GUT-003"],
      notes: "Fail-closed: sidecar requires a locator",
    },
    {
      caseId: "EVAL-FAIL-MISSING-FIELDS",
      kind: "model_proposal",
      label: "Proposal missing required fields",
      expectPass: false,
      subject: {
        proposalId: "HSI-MP-BAD-FIELDS",
        sourceAdapterOrAgent: "hsi-stub",
        // missing proposedSubject / predicate / object / etc.
        createdAt,
      },
      notes: "Fail-closed: required proposal fields must be present",
    },
  ];
}

export function runOfflineModelEvalHarness(opts?: {
  generatedAt?: string;
  fixtures?: FrozenPackEdgeFixture[];
  cases?: ScoreModelEvalSubjectInput[];
}): {
  cases: ModelEvalCaseResult[];
  fixtures: FrozenPackEdgeFixture[];
} {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const fixtures = opts?.fixtures ?? buildFrozenPublicPackFixtures();
  const caseInputs =
    opts?.cases ?? buildDemoModelEvalCases({ createdAt: generatedAt });
  const cases = caseInputs.map((c) => scoreModelEvalSubject(c, fixtures));
  return { cases, fixtures };
}

export function buildModelEvalHarnessBundle(opts?: {
  generatedAt?: string;
}): ModelEvalHarnessBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const { cases, fixtures } = runOfflineModelEvalHarness({ generatedAt });

  const byPack: Record<string, number> = {};
  for (const f of fixtures) {
    byPack[f.packId] = (byPack[f.packId] ?? 0) + 1;
  }

  const passed = cases.filter((c) => c.passed).length;
  const failed = cases.length - passed;
  const failClosedHits = cases.filter((c) => c.failClosed).length;
  const intentionalFailCorrect = cases.filter(
    (c) => c.expectPass === false && c.passed === false,
  ).length;
  const stubBehaviorGreen = cases.every(
    (c) => c.passed === c.expectPass,
  );

  return {
    schemaVersion: MODEL_EVAL_HARNESS_EXPORT_SCHEMA,
    runtimeSchema: MODEL_EVAL_HARNESS_RUNTIME_SCHEMA,
    stubSchemaRef: MODEL_EVAL_HARNESS_STUB.schemaVersion,
    status: MODEL_EVAL_HARNESS_STUB.status,
    notCds: true,
    offlineOnly: true,
    mayUseLivePhi: false,
    mayTrainModels: false,
    mayFlipEvidenceGrade: false,
    autoApprove: false,
    autoApproveIntoKg: false,
    containsPhi: false,
    packsRemainAuthority: true,
    generatedAt,
    fixtureSummary: {
      packIds: Object.keys(byPack).sort(),
      edgeCount: fixtures.length,
      byPack,
    },
    checks: [...MODEL_EVAL_CHECK_DEFINITIONS],
    cases,
    summary: {
      caseCount: cases.length,
      passed,
      failed,
      failClosedHits,
      intentionalFailCorrect,
      stubBehaviorGreen,
    },
    instructions: [
      "P2.3 offline eval harness — scores model proposals / embedding sidecars against frozen public pack fixtures.",
      "No training loop · no live PHI · mayFlipEvidenceGrade=false · autoApprove=false · packs remain authority.",
      "Checks: cited edge ids exist · grade not flipped · required fields · fail-closed clinical/PHI · sidecar locators · pack authority.",
      "RA / SSc / gut / neuro evidence packs stay the graded truth store; harness never writes KG or Gate C approve.",
      "Intentional fail cases document fail-closed behavior; stubBehaviorGreen means demos matched expectPass.",
      "TDC-style retrieval metrics deferred until broader P3 adapters — P3.0 RDKit proposals are scored as ModelProposalArtifacts here.",
      "See docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md · MODEL_EVAL_HARNESS_STUB · src/modelEvalHarness.ts.",
    ],
  };
}

export function serializeModelEvalHarness(
  bundle: ModelEvalHarnessBundle = buildModelEvalHarnessBundle(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeModelEvalHarnessMarkdown(
  bundle: ModelEvalHarnessBundle = buildModelEvalHarnessBundle(),
): string {
  const lines: string[] = [
    "# HSI model eval harness (offline stub)",
    "",
    `schema: \`${bundle.schemaVersion}\` · status: **${bundle.status}** · generatedAt: ${bundle.generatedAt}`,
    "",
    "> Offline only. Not CDS. No PHI. No training. Never flips `hsiGrade`. Never auto-approves into KG. Packs remain authority.",
    "",
    "## Fixture summary",
    "",
    `- Edges: **${bundle.fixtureSummary.edgeCount}** across ${bundle.fixtureSummary.packIds.join(", ")}`,
    ...Object.entries(bundle.fixtureSummary.byPack).map(
      ([pack, n]) => `  - \`${pack}\`: ${n}`,
    ),
    "",
    "## Checks",
    "",
    ...bundle.checks.map(
      (c) =>
        `- **${c.id}** — ${c.label}${c.failClosed ? " _(fail-closed)_" : ""}: ${c.detail}`,
    ),
    "",
    "## Cases",
    "",
    `| Case | Kind | Expect | Result | Fail-closed |`,
    `|---|---|---|---|---|`,
    ...bundle.cases.map((c) => {
      const result = c.passed ? "PASS" : "FAIL";
      const expect = c.expectPass ? "pass" : "fail";
      const ok =
        c.passed === c.expectPass ? "✓" : "✗ unexpected";
      return `| \`${c.caseId}\` | ${c.kind} | ${expect} | ${result} ${ok} | ${c.failClosed} |`;
    }),
    "",
    "## Summary",
    "",
    `- Cases: ${bundle.summary.caseCount} · passed=${bundle.summary.passed} · failed=${bundle.summary.failed}`,
    `- Fail-closed hits: ${bundle.summary.failClosedHits}`,
    `- Intentional fails correct: ${bundle.summary.intentionalFailCorrect}`,
    `- stubBehaviorGreen: **${bundle.summary.stubBehaviorGreen}**`,
    "",
    "## Instructions",
    "",
    ...bundle.instructions.map((i) => `- ${i}`),
    "",
  ];
  return `${lines.join("\n")}\n`;
}
