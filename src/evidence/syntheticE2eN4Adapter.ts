/**
 * Synthetic e2e → N4 grounded-brief adapter (engineering demo).
 *
 * Maps a tiny evidence_lookup slice (support + oppose + species mismatch)
 * into an N4 engineering corpus with fixtureKind=engineering.
 * Never enters approved corpus / retrieval index as science.
 * groundedClaimAccepted stays false.
 */
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {HSI_CDS_PHI_INVARIANTS, rejectPhiPayload, type HsiCdsPhiInvariants} from "../cdsPhiBoundary";
import {
  buildGroundedBrief,
  parseGroundedBrief,
  parseGroundedCorpus,
  passageHash,
  type GroundedBrief,
  type GroundedCorpus,
  type GroundedCorpusRecord,
  type GroundedPassage,
  type SupportAssessment,
} from "./groundedBrief";

export const SYNTHETIC_E2E_N4_ADAPTER_SCHEMA = "hsi-synthetic-e2e-n4-adapter-1" as const;
export const SYNTHETIC_E2E_N4_ADAPTER_METHOD = "hsi-synthetic-e2e-evidence-lookup-to-n4-1" as const;
export const SYNTHETIC_E2E_N4_ADAPTER_ID = "adapter-synthetic-e2e-n4-mismatch-1" as const;
export const SYNTHETIC_E2E_N4_DISEASE_TRACK = "RA" as const;
export const SYNTHETIC_E2E_N4_SPECIES_SCOPE = "human" as const;
export const SYNTHETIC_E2E_N4_QUESTION =
  "Engineering fixture: does pathway X increase fixture signal Y in human RA synovium according to synthetic evidence_lookup?" as const;

export type GateStatus = "CLEARED" | "BLOCKED";

export type PackEvidenceClaim = {
  id: string;
  passage_id: string;
  source_id: string;
  polarity: "supports" | "opposes";
  proposition: string;
  species: string;
  disease: string;
  tissue: string;
  setting: string;
  status: string;
  synthetic: true;
  namespace: string;
};

export type PackEvidencePassage = {
  id: string;
  source_id: string;
  text: string;
  synthetic: true;
  namespace: string;
};

export type PackEvidenceLookupSlice = {
  schemaVersion: "hsi-synthetic-e2e-evidence-lookup-n4-1";
  fixtureKind: "engineering";
  synthetic: true;
  synthetic_notice: string;
  namespace: string;
  groundedClaimAccepted: false;
  approvedCorpus: false;
  retrievalIndex: false;
  scientificAcceptance: "BLOCKED";
  records: Record<string, unknown>;
};

export type SyntheticE2eN4AdapterDemo = {
  schemaVersion: typeof SYNTHETIC_E2E_N4_ADAPTER_SCHEMA;
  adapterId: typeof SYNTHETIC_E2E_N4_ADAPTER_ID;
  method: typeof SYNTHETIC_E2E_N4_ADAPTER_METHOD;
  generatedAt: string;
  dataClass: "synthetic";
  containsPhi: false;
  fixtureKind: "engineering";
  approvedCorpus: false;
  retrievalIndex: false;
  diseaseTrack: typeof SYNTHETIC_E2E_N4_DISEASE_TRACK;
  speciesScope: typeof SYNTHETIC_E2E_N4_SPECIES_SCOPE;
  question: typeof SYNTHETIC_E2E_N4_QUESTION;
  corpus: GroundedCorpus;
  brief: GroundedBrief;
  supportAssessments: SupportAssessment[];
  hasSupportsWithPassage: boolean;
  hasChallengesWithPassage: boolean;
  hasWrongContext: boolean;
  expectedOutcome: "conflicting_sources";
  groundedClaimAccepted: false;
  scientificApproval: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  legalBinding: false;
  neonClinicalWrites: false;
  httpServer: false;
  engineeringHarness: GateStatus;
  scientificAcceptance: GateStatus;
  honestyBanners: string[];
  honesty: string[];
  invariants: HsiCdsPhiInvariants;
  sourceSample: string;
};

function fail(message: string): never {
  throw new Error(message);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${label} must be non-empty string`);
  return value;
}

function parseClaim(raw: unknown, label: string): PackEvidenceClaim {
  if (!isObject(raw)) fail(`${label}: claim must be object`);
  if (raw.synthetic !== true) fail(`${label}: synthetic must be true`);
  const polarity = asString(raw.polarity, `${label}.polarity`);
  if (polarity !== "supports" && polarity !== "opposes") fail(`${label}: polarity must be supports|opposes`);
  return {
    id: asString(raw.id, `${label}.id`),
    passage_id: asString(raw.passage_id, `${label}.passage_id`),
    source_id: asString(raw.source_id, `${label}.source_id`),
    polarity,
    proposition: asString(raw.proposition, `${label}.proposition`),
    species: asString(raw.species, `${label}.species`),
    disease: asString(raw.disease, `${label}.disease`),
    tissue: asString(raw.tissue, `${label}.tissue`),
    setting: asString(raw.setting, `${label}.setting`),
    status: asString(raw.status, `${label}.status`),
    synthetic: true,
    namespace: asString(raw.namespace, `${label}.namespace`),
  };
}

function parsePassage(raw: unknown, label: string): PackEvidencePassage {
  if (!isObject(raw)) fail(`${label}: passage must be object`);
  if (raw.synthetic !== true) fail(`${label}: synthetic must be true`);
  const textValue = asString(raw.text, `${label}.text`);
  if (!textValue.includes("SYNTHETIC_ONLY")) fail(`${label}: passage must keep SYNTHETIC_ONLY banner`);
  return {
    id: asString(raw.id, `${label}.id`),
    source_id: asString(raw.source_id, `${label}.source_id`),
    text: textValue,
    synthetic: true,
    namespace: asString(raw.namespace, `${label}.namespace`),
  };
}

export function parsePackEvidenceLookupSlice(raw: unknown, sourceSample = "inline"): PackEvidenceLookupSlice {
  if (!isObject(raw)) fail(`${sourceSample}: evidence_lookup slice must be object`);
  if (raw.schemaVersion !== "hsi-synthetic-e2e-evidence-lookup-n4-1") {
    fail(`${sourceSample}: schemaVersion mismatch`);
  }
  if (raw.fixtureKind !== "engineering") fail(`${sourceSample}: fixtureKind must be engineering`);
  if (raw.synthetic !== true) fail(`${sourceSample}: synthetic must be true`);
  if (raw.groundedClaimAccepted !== false) fail(`${sourceSample}: groundedClaimAccepted must be false`);
  if (raw.approvedCorpus !== false || raw.retrievalIndex !== false) {
    fail(`${sourceSample}: must not mark approvedCorpus or retrievalIndex`);
  }
  if (raw.scientificAcceptance !== "BLOCKED") fail(`${sourceSample}: scientificAcceptance must be BLOCKED`);
  const synthetic_notice = asString(raw.synthetic_notice, `${sourceSample}.synthetic_notice`);
  if (!synthetic_notice.includes("Wholly synthetic")) {
    fail(`${sourceSample}: synthetic_notice must keep wholly-synthetic banner`);
  }
  const phiGate = rejectPhiPayload({
    containsPhi: false,
    mayUseLivePhi: false,
    phiToLlm: false,
    textBlobs: [synthetic_notice, JSON.stringify(raw.records ?? {})],
  });
  if (!phiGate.ok) fail(`${sourceSample}: PHI boundary rejected slice (${phiGate.detail})`);
  if (!isObject(raw.records)) fail(`${sourceSample}: records object required`);
  return {
    schemaVersion: "hsi-synthetic-e2e-evidence-lookup-n4-1",
    fixtureKind: "engineering",
    synthetic: true,
    synthetic_notice,
    namespace: asString(raw.namespace, `${sourceSample}.namespace`),
    groundedClaimAccepted: false,
    approvedCorpus: false,
    retrievalIndex: false,
    scientificAcceptance: "BLOCKED",
    records: raw.records,
  };
}

function mapPolarityToSupport(polarity: PackEvidenceClaim["polarity"]): GroundedPassage["support"] {
  switch (polarity) {
    case "supports":
      return "supports";
    case "opposes":
      return "contradicts";
    default: {
      const _exhaustive: never = polarity;
      return _exhaustive;
    }
  }
}

/** Build an isolated engineering corpus from the tiny evidence_lookup slice. */
export function buildN4EngineeringCorpusFromEvidenceLookup(input: {
  slice: PackEvidenceLookupSlice;
  generatedAt: string;
}): GroundedCorpus {
  const {slice, generatedAt} = input;
  const claimIds = Object.keys(slice.records).filter((k) => k.includes("/CLAIM/"));
  if (claimIds.length < 3) fail("evidence_lookup slice must include support + oppose + mismatch claims");

  const claims = claimIds.map((id) => parseClaim(slice.records[id], id));
  const support = claims.find((c) => c.polarity === "supports" && c.species === "human");
  const oppose = claims.find((c) => c.polarity === "opposes" && c.species === "human");
  const mismatch = claims.find((c) => c.species !== "human");
  if (!support || !oppose || !mismatch) {
    fail("slice must provide human support, human oppose, and non-human species mismatch claims");
  }

  const selected = [support, oppose, mismatch];
  const passages: GroundedPassage[] = [];
  const records: GroundedCorpusRecord[] = [];

  for (const claim of selected) {
    const passageRaw = slice.records[claim.passage_id];
    const packPassage = parsePassage(passageRaw, claim.passage_id);
    const scientificReview = claim.status === "reviewed" ? "approved" : "unreviewed";
    const passage: GroundedPassage = {
      passageId: packPassage.id,
      sourceId: packPassage.source_id,
      text: packPassage.text,
      locator: `engineering-fixture:synthetic-e2e/${packPassage.id}`,
      passageHash: passageHash(packPassage.text),
      rightsCleared: true,
      disease: claim.disease,
      species: claim.species,
      support: mapPolarityToSupport(claim.polarity),
      scientificReview,
      fixtureKind: "engineering",
    };
    passages.push(passage);
    records.push({
      recordId: claim.id,
      assertionKind: "synthetic_evidence_lookup_claim",
      assertion: `${claim.proposition} (${claim.polarity}; ${claim.species} ${claim.tissue} ${claim.setting})`,
      subjectId: "SYNTHETIC/CONCEPT/pathway_X",
      predicate: claim.polarity === "supports" ? "increases" : "does_not_increase",
      objectId: "SYNTHETIC/CONCEPT/fixture_signal_Y",
      sourceId: claim.source_id,
      n1QueueId: null,
      n1Outcome: null,
      passageIds: [passage.passageId],
      model: null,
      species: claim.species,
      diseaseTrack: claim.disease,
      status: "active",
    });
  }

  return parseGroundedCorpus({
    schemaVersion: "hsi-n4-grounded-corpus-1",
    programme: "gut_immune_t2d",
    purpose: "engineering_fixture",
    generatedAt,
    records,
    passages,
    n1Results: [],
    pins: {
      n1ReceiptHash: null,
      n2LedgerHash: null,
      n3KitHash: createHash("sha256")
        .update(JSON.stringify({adapter: SYNTHETIC_E2E_N4_ADAPTER_ID, slice: "evidence_lookup_n4"}))
        .digest("hex"),
    },
    groundedClaimAccepted: false,
    scientificApproval: false,
  });
}

export function adaptSyntheticE2eEvidenceLookupToN4Demo(input: {
  slice: PackEvidenceLookupSlice;
  sourceSample: string;
  generatedAt: string;
}): SyntheticE2eN4AdapterDemo {
  const {slice, sourceSample, generatedAt} = input;
  const corpus = buildN4EngineeringCorpusFromEvidenceLookup({slice, generatedAt});
  const brief = parseGroundedBrief(
    buildGroundedBrief({
      question: SYNTHETIC_E2E_N4_QUESTION,
      corpus,
      diseaseTrack: SYNTHETIC_E2E_N4_DISEASE_TRACK,
      speciesScope: SYNTHETIC_E2E_N4_SPECIES_SCOPE,
      generatedAt,
      n3HumanLabelFreeze: "BLOCKED",
      n3EngineeringHarness: "CLEARED",
    }),
  );

  if (brief.groundedClaimAccepted !== false) fail("groundedClaimAccepted must stay false");
  if (brief.outcome !== "conflicting_sources") {
    fail(`expected conflicting_sources from support+oppose, got ${brief.outcome}`);
  }

  const supportAssessments = brief.hits.map((h) => h.supportAssessment);
  const hasSupportsWithPassage = supportAssessments.includes("supports_with_passage");
  const hasChallengesWithPassage = supportAssessments.includes("challenges_with_passage");
  const hasWrongContext = supportAssessments.includes("wrong_context");
  if (!hasSupportsWithPassage || !hasChallengesWithPassage || !hasWrongContext) {
    fail(
      `N4 demo must surface support+oppose+wrong_context; got ${JSON.stringify(supportAssessments)}`,
    );
  }

  const honestyBanners = [
    slice.synthetic_notice,
    "Engineering fixture only — not approved corpus or retrieval-index science.",
    "synthetic ≠ clinical ≠ eligible",
  ];
  const honesty = [
    "Vendored synthetic evidence_lookup slice only — support/oppose/species mismatch structure test.",
    "fixtureKind=engineering · approvedCorpus=false · retrievalIndex=false.",
    "groundedClaimAccepted=false · scientificApproval=false · graphPromotable=false always.",
    "No Gate C auto-approve, invented MoU, legalBinding flip, Neon clinical writes, or HTTP server.",
  ];

  return {
    schemaVersion: SYNTHETIC_E2E_N4_ADAPTER_SCHEMA,
    adapterId: SYNTHETIC_E2E_N4_ADAPTER_ID,
    method: SYNTHETIC_E2E_N4_ADAPTER_METHOD,
    generatedAt,
    dataClass: "synthetic",
    containsPhi: false,
    fixtureKind: "engineering",
    approvedCorpus: false,
    retrievalIndex: false,
    diseaseTrack: SYNTHETIC_E2E_N4_DISEASE_TRACK,
    speciesScope: SYNTHETIC_E2E_N4_SPECIES_SCOPE,
    question: SYNTHETIC_E2E_N4_QUESTION,
    corpus,
    brief,
    supportAssessments,
    hasSupportsWithPassage,
    hasChallengesWithPassage,
    hasWrongContext,
    expectedOutcome: "conflicting_sources",
    groundedClaimAccepted: false,
    scientificApproval: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    legalBinding: false,
    neonClinicalWrites: false,
    httpServer: false,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    honestyBanners,
    honesty,
    invariants: HSI_CDS_PHI_INVARIANTS,
    sourceSample,
  };
}

export function parseSyntheticE2eN4AdapterDemo(raw: unknown): SyntheticE2eN4AdapterDemo {
  if (!isObject(raw)) fail("N4 adapter demo must be object");
  if (raw.schemaVersion !== SYNTHETIC_E2E_N4_ADAPTER_SCHEMA) fail("schemaVersion mismatch");
  if (raw.adapterId !== SYNTHETIC_E2E_N4_ADAPTER_ID) fail("adapterId mismatch");
  if (raw.fixtureKind !== "engineering") fail("fixtureKind must be engineering");
  if (raw.approvedCorpus !== false || raw.retrievalIndex !== false) {
    fail("must not enter approved corpus / retrieval index");
  }
  if (raw.groundedClaimAccepted !== false) fail("groundedClaimAccepted must remain false");
  if (raw.gateCAutoApprove !== false || raw.legalBinding !== false) {
    fail("Gate C / legalBinding must remain false");
  }
  if (raw.neonClinicalWrites !== false || raw.httpServer !== false) {
    fail("neon/http must remain false");
  }
  if (raw.scientificAcceptance !== "BLOCKED") fail("scientificAcceptance must stay BLOCKED");
  if (raw.expectedOutcome !== "conflicting_sources") fail("expectedOutcome mismatch");
  parseGroundedCorpus(raw.corpus);
  parseGroundedBrief(raw.brief);
  return raw as SyntheticE2eN4AdapterDemo;
}

const DEFAULT_FIXTURE_REL = "research/fixtures/hsi-synthetic-e2e";
const DEFAULT_SAMPLE = "outputs/sample_evidence_lookup_n4.json";

export function adaptVendoredSyntheticE2eN4Demo(input?: {
  repoRoot?: string;
  sampleRelativePath?: string;
  generatedAt?: string;
}): SyntheticE2eN4AdapterDemo {
  const repoRoot = input?.repoRoot ?? resolve(import.meta.dir, "../..");
  const sampleRelativePath = input?.sampleRelativePath ?? DEFAULT_SAMPLE;
  const generatedAt = input?.generatedAt ?? "2026-11-08T05:40:00.000Z";
  const abs = resolve(repoRoot, DEFAULT_FIXTURE_REL, sampleRelativePath);
  const raw = JSON.parse(readFileSync(abs, "utf8")) as unknown;
  const slice = parsePackEvidenceLookupSlice(raw, sampleRelativePath);
  return adaptSyntheticE2eEvidenceLookupToN4Demo({slice, sourceSample: sampleRelativePath, generatedAt});
}

export type SyntheticE2eN4AdapterCheckResult = {
  ok: true;
  adapterId: typeof SYNTHETIC_E2E_N4_ADAPTER_ID;
  outcome: GroundedBrief["outcome"];
  supportAssessments: SupportAssessment[];
  groundedClaimAccepted: false;
  engineeringHarness: GateStatus;
  scientificAcceptance: GateStatus;
};

export function checkSyntheticE2eN4Adapter(repoRoot?: string): SyntheticE2eN4AdapterCheckResult {
  const demo = parseSyntheticE2eN4AdapterDemo(
    adaptVendoredSyntheticE2eN4Demo({
      repoRoot: repoRoot ?? resolve(import.meta.dir, "../.."),
      generatedAt: "2026-11-08T05:40:00.000Z",
    }),
  );
  if (demo.brief.outcome !== "conflicting_sources") fail("check: outcome must be conflicting_sources");
  if (!demo.hasSupportsWithPassage || !demo.hasChallengesWithPassage || !demo.hasWrongContext) {
    fail("check: missing support/oppose/wrong_context assessments");
  }
  if (demo.groundedClaimAccepted !== false) fail("check: groundedClaimAccepted must be false");
  if (demo.honestyBanners.every((b) => !b.includes("synthetic ≠ clinical ≠ eligible"))) {
    fail("check: synthetic≠clinical≠eligible banner required");
  }
  return {
    ok: true,
    adapterId: demo.adapterId,
    outcome: demo.brief.outcome,
    supportAssessments: demo.supportAssessments,
    groundedClaimAccepted: false,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
  };
}
