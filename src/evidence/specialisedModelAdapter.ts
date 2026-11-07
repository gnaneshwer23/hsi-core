/**
 * N8 — one bounded specialised / multimodal research-model adapter.
 *
 * Extends the N4 optional model-adapter contract with a fail-closed dry-run /
 * fixture executor. Activation is disallowed by default; paid / live providers
 * are refused in this engineering increment. groundedClaimAccepted stays false
 * and N6 usefulness is never claimed from software alone.
 *
 * Research-safe only — no live CDS/PHI, Gate C auto-approve or invented MoU.
 */
import {createHash} from "node:crypto";
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {
  GROUNDED_BRIEF_PROMPT_VERSION,
  GROUNDED_BRIEF_SCHEMA,
  buildOptionalModelAdapterRequest,
  type BriefOutcome,
  type GroundedBrief,
  type GroundedHit,
} from "./groundedBrief";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";

export const N8_ADAPTER_ID = "adapter-n8-bounded-research-1" as const;
export const N8_ADAPTER_SCHEMA = "hsi-n8-specialised-model-adapter-1" as const;
export const N8_MANIFEST_SCHEMA = "hsi-n8-model-manifest-1" as const;
export const N8_RUN_RECEIPT_SCHEMA = "hsi-n8-adapter-run-1" as const;
export const N8_BENCHMARK_SCHEMA = "hsi-n8-baseline-comparison-1" as const;
export const N8_MODEL_VERSION = "hsi-n8-fixture-dry-run-v0" as const;
export const N8_CONFIG_VERSION = "hsi-n8-config-v0" as const;

export type GateStatus = "CLEARED" | "BLOCKED";

export type AdapterExecutionMode = "dry_run" | "fixture" | "live_provider";

export type AdapterModality = "text" | "text_plus_public_structure_fixture";

export type UncertaintyBand = "low" | "medium" | "high" | "abstain_required";

export type N8ModelManifest = {
  schemaVersion: typeof N8_MANIFEST_SCHEMA;
  adapterId: typeof N8_ADAPTER_ID;
  modelVersion: typeof N8_MODEL_VERSION;
  configVersion: typeof N8_CONFIG_VERSION;
  intendedUse: string;
  supportedTask: "n4_grounded_brief_augmentation";
  supportedInputs: Array<"inspectable_n4_hits" | "optional_public_structure_fixture">;
  modality: AdapterModality;
  permittedUse: "research_engineering_dry_run_only";
  limitations: string[];
  licence: {
    status: "fixture_engineering_only";
    compatibleForLiveWeights: false;
    note: string;
  };
  benchmarkEvidence: {
    independentHeldOut: false;
    n6UsefulnessDemonstrated: false;
    note: string;
  };
  activationDefault: false;
  mayCallPaidApis: false;
  mayUseLivePhi: false;
  notCds: true;
};

export type PublicStructureFixture = {
  fixtureId: string;
  kind: "public_uniprot_fragment";
  /** Short public catalog fragment only — never clinic / patient sequences. */
  sequenceAa: string;
  uniprotAccession: string;
  label: string;
  note: string;
};

/** Public FOXP3 fragment — same research-safe catalog pattern as P3 ESM fixtures. */
export const N8_PUBLIC_STRUCTURE_FIXTURE: PublicStructureFixture = {
  fixtureId: "n8-foxp3-public-fragment",
  kind: "public_uniprot_fragment",
  sequenceAa: "MPNPRPGKPSAPSLALGPSPGASPSWRAAPKASDLLGARG",
  uniprotAccession: "Q9BZS1",
  label: "FOXP3 public UniProt fragment (multimodal slot dry-run only)",
  note: "Declared multimodal input for N8 engineering — never sent to a paid provider; not PHI; not a therapeutic claim.",
};

export type AdapterActivation = {
  /** Must be true to run; default path refuses. */
  optIn: boolean;
  /** Explicit acknowledgement that live activation remains blocked. */
  acknowledgeActivationDisallowed: boolean;
  mode: AdapterExecutionMode;
  /** Optional multimodal fixture slot — logged only in dry-run/fixture. */
  includePublicStructureFixture?: boolean;
  generatedAt: string;
  operatorNote?: string;
};

export type AdapterLogEntry = {
  at: string;
  event:
    | "opt_in_received"
    | "activation_refused"
    | "live_provider_refused"
    | "dry_run_started"
    | "fixture_emitted"
    | "baseline_compared"
    | "honesty_asserted";
  detail: string;
};

export type FixtureModelProposal = {
  investigationId: string;
  question: string;
  /** Mirrors N4 outcome — never invents stronger support than inspectable hits allow. */
  proposedOutcome: BriefOutcome;
  abstainReason: string | null;
  usedHitIds: string[];
  uncertainty: UncertaintyBand;
  uncertaintyNotes: string[];
  multimodalFixtureAttached: boolean;
  inventedClaims: false;
  groundedClaimAccepted: false;
  modelActivationAllowed: false;
};

export type BaselineComparisonRow = {
  investigationId: string;
  deterministicOutcome: BriefOutcome;
  fixtureModelOutcome: BriefOutcome;
  outcomesAgree: boolean;
  abstentionPreserved: boolean;
  uncertainty: UncertaintyBand;
};

export type N8BaselineComparison = {
  schemaVersion: typeof N8_BENCHMARK_SCHEMA;
  adapterId: typeof N8_ADAPTER_ID;
  baselineMethodId: string;
  rows: BaselineComparisonRow[];
  agreementRate: number | null;
  /** Forced null while N6 usefulness remains BLOCKED. */
  usefulnessDeltaVsBaseline: null;
  n6UsefulnessClaimed: false;
  note: string;
};

export type N8AdapterRunReceipt = {
  schemaVersion: typeof N8_RUN_RECEIPT_SCHEMA;
  phase: "N8";
  programme: "gut_immune_t2d";
  adapterId: typeof N8_ADAPTER_ID;
  generatedAt: string;
  mode: AdapterExecutionMode;
  optIn: boolean;
  activationAllowed: false;
  manifest: N8ModelManifest;
  configurationHash: string;
  dataManifestHash: string;
  modelVersion: typeof N8_MODEL_VERSION;
  n4BriefPins: Array<{
    investigationId: string;
    questionHash: string;
    configurationHash: string;
    modelAdapterEnabled: boolean;
  }>;
  publicStructureFixture: PublicStructureFixture | null;
  proposals: FixtureModelProposal[];
  baselineComparison: N8BaselineComparison;
  logs: AdapterLogEntry[];
  engineeringHarness: GateStatus;
  scientificAcceptance: "BLOCKED";
  n6Usefulness: "BLOCKED";
  groundedClaimAccepted: false;
  modelActivationAllowed: false;
  scientificApproval: false;
  graphPromotable: false;
  liveProviderCalled: false;
  paidApiCalled: false;
  note: string;
};

export type N8AdapterStatus = {
  schemaVersion: "hsi-n8-status-1";
  phase: "N8";
  programme: "gut_immune_t2d";
  generatedAt: string;
  engineeringHarness: GateStatus;
  scientificAcceptance: "BLOCKED";
  n6Usefulness: "BLOCKED";
  activationDefault: false;
  modelActivationAllowed: false;
  groundedClaimAccepted: false;
  liveProviderCalled: false;
  pins: {
    n4BriefReceiptHash: string | null;
    n6ProtocolHash: string | null;
    n7LedgerHash: string | null;
    manifestHash: string;
    runReceiptHash: string;
  };
  note: string;
};

export class SpecialisedModelAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpecialisedModelAdapterError";
  }
}

function fail(message: string): never {
  throw new SpecialisedModelAdapterError(message);
}

function sha256(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function text(v: unknown, max: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max && !/[\u0000-\u0008]/.test(v);
}

export function buildN8ModelManifest(): N8ModelManifest {
  return {
    schemaVersion: N8_MANIFEST_SCHEMA,
    adapterId: N8_ADAPTER_ID,
    modelVersion: N8_MODEL_VERSION,
    configVersion: N8_CONFIG_VERSION,
    intendedUse:
      "Research-safe dry-run augmentation of N4 grounded briefs over inspectable hits only, with an optional public-structure multimodal fixture slot.",
    supportedTask: "n4_grounded_brief_augmentation",
    supportedInputs: ["inspectable_n4_hits", "optional_public_structure_fixture"],
    modality: "text_plus_public_structure_fixture",
    permittedUse: "research_engineering_dry_run_only",
    limitations: [
      "Activation disallowed by default; live / paid providers are refused in this increment.",
      "Fixture proposals never invent passages or flip groundedClaimAccepted.",
      "Multimodal structure fixture is logged metadata only — not embedding inference or wet-lab execution.",
      "N6 usefulness and held-out scientific evaluation remain BLOCKED until independent expert evidence exists.",
      "Compatible commercial / research weights licences are not assumed.",
    ],
    licence: {
      status: "fixture_engineering_only",
      compatibleForLiveWeights: false,
      note: "No external model weights or paid API credentials are required or invoked for N8 dry-run.",
    },
    benchmarkEvidence: {
      independentHeldOut: false,
      n6UsefulnessDemonstrated: false,
      note: "Engineering baseline comparison only. Do not treat agreement with N4 as demonstrated expert usefulness.",
    },
    activationDefault: false,
    mayCallPaidApis: false,
    mayUseLivePhi: false,
    notCds: true,
  };
}

export function parseN8ModelManifest(value: unknown): N8ModelManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("Invalid N8 model manifest");
  const m = value as N8ModelManifest;
  if (m.schemaVersion !== N8_MANIFEST_SCHEMA || m.adapterId !== N8_ADAPTER_ID) {
    fail("Unsupported N8 model manifest");
  }
  if (m.activationDefault !== false || m.mayCallPaidApis !== false || m.mayUseLivePhi !== false || m.notCds !== true) {
    fail("N8 manifest honesty invariants violated");
  }
  if (m.licence.compatibleForLiveWeights !== false) fail("Live weights compatibility cannot be claimed");
  if (m.benchmarkEvidence.n6UsefulnessDemonstrated !== false || m.benchmarkEvidence.independentHeldOut !== false) {
    fail("N8 cannot claim N6 usefulness or held-out benchmark clearance");
  }
  return m;
}

function uncertaintyForHits(hits: GroundedHit[], outcome: BriefOutcome): {
  band: UncertaintyBand;
  notes: string[];
} {
  const notes: string[] = [];
  if (outcome === "abstain") {
    notes.push("Deterministic abstention required; fixture model must not invent support.");
    return {band: "abstain_required", notes};
  }
  const metadata = hits.filter((h) => h.supportAssessment === "metadata_only_insufficient").length;
  const passage = hits.filter((h) =>
    h.supportAssessment === "supports_with_passage" || h.supportAssessment === "challenges_with_passage",
  ).length;
  if (passage === 0) {
    notes.push("No passage-backed hits — uncertainty remains abstain-class.");
    return {band: "abstain_required", notes};
  }
  if (metadata > 0) {
    notes.push("Corpus still contains metadata-only neighbours; treat passage support as provisional.");
    return {band: "high", notes};
  }
  if (hits.length === 1) {
    notes.push("Single inspectable hit; coverage incomplete.");
    return {band: "medium", notes};
  }
  notes.push("Passage-backed hits present under engineering fixture honesty.");
  return {band: "low", notes};
}

function fixtureProposalFromBrief(input: {
  investigationId: string;
  brief: GroundedBrief;
  multimodal: boolean;
}): FixtureModelProposal {
  const {band, notes} = uncertaintyForHits(input.brief.hits, input.brief.outcome);
  const usedHitIds = input.brief.hits
    .filter((h) =>
      h.supportAssessment === "supports_with_passage" || h.supportAssessment === "challenges_with_passage",
    )
    .map((h) => h.hitId);

  // Fail closed: fixture never upgrades abstain → source_summary.
  const proposedOutcome = input.brief.outcome;
  return {
    investigationId: input.investigationId,
    question: input.brief.question,
    proposedOutcome,
    abstainReason: input.brief.abstainReason,
    usedHitIds,
    uncertainty: band,
    uncertaintyNotes: notes,
    multimodalFixtureAttached: input.multimodal,
    inventedClaims: false,
    groundedClaimAccepted: false,
    modelActivationAllowed: false,
  };
}

function compareToBaseline(rows: Array<{
  investigationId: string;
  deterministic: BriefOutcome;
  fixture: FixtureModelProposal;
}>): N8BaselineComparison {
  const comparisonRows: BaselineComparisonRow[] = rows.map((r) => {
    const outcomesAgree = r.deterministic === r.fixture.proposedOutcome;
    const abstentionPreserved =
      r.deterministic !== "abstain" || r.fixture.proposedOutcome === "abstain";
    return {
      investigationId: r.investigationId,
      deterministicOutcome: r.deterministic,
      fixtureModelOutcome: r.fixture.proposedOutcome,
      outcomesAgree,
      abstentionPreserved,
      uncertainty: r.fixture.uncertainty,
    };
  });
  const agreed = comparisonRows.filter((r) => r.outcomesAgree).length;
  return {
    schemaVersion: N8_BENCHMARK_SCHEMA,
    adapterId: N8_ADAPTER_ID,
    baselineMethodId: "hsi-n4-deterministic-lexical-graph-baseline-1",
    rows: comparisonRows,
    agreementRate: comparisonRows.length ? agreed / comparisonRows.length : null,
    usefulnessDeltaVsBaseline: null,
    n6UsefulnessClaimed: false,
    note: "Outcome agreement is an engineering reproducibility check — not N6 expert usefulness.",
  };
}

export type RunBoundedAdapterInput = {
  activation: AdapterActivation;
  /** N4 briefs with modelAdapterEnabled pins; investigation ids parallel DEFAULT_N4 order when omitted. */
  briefs: Array<{investigationId: string; brief: GroundedBrief}>;
  n4BriefReceiptHash?: string | null;
  n6ProtocolHash?: string | null;
  n7LedgerHash?: string | null;
};

/**
 * Fail-closed executor for the single N8 bounded adapter.
 * Requires explicit opt-in + acknowledgement; refuses live_provider; never calls paid APIs.
 */
export function runBoundedSpecialisedModelAdapter(input: RunBoundedAdapterInput): N8AdapterRunReceipt {
  const {activation} = input;
  if (!Number.isFinite(Date.parse(activation.generatedAt))) fail("Invalid generatedAt");
  if (!text(activation.generatedAt, 40)) fail("generatedAt required");

  const logs: AdapterLogEntry[] = [];
  const push = (event: AdapterLogEntry["event"], detail: string) => {
    logs.push({at: activation.generatedAt, event, detail});
  };

  if (activation.optIn) {
    push("opt_in_received", "Explicit opt-in flag set for N8 bounded adapter.");
  } else {
    push("activation_refused", "optIn=false — adapter remains inactive by default.");
    fail("N8 adapter refuses to run without explicit optIn=true");
  }

  if (!activation.acknowledgeActivationDisallowed) {
    push("activation_refused", "Missing acknowledgeActivationDisallowed acknowledgement.");
    fail("N8 requires acknowledgeActivationDisallowed=true (activation remains blocked)");
  }

  if (activation.mode === "live_provider") {
    push("live_provider_refused", "live_provider mode is refused in this engineering increment.");
    fail("N8 live_provider mode is refused — use dry_run or fixture only");
  }

  if (activation.mode !== "dry_run" && activation.mode !== "fixture") {
    fail("Unsupported N8 execution mode");
  }

  push("dry_run_started", `mode=${activation.mode}; paid APIs will not be called.`);

  const manifest = buildN8ModelManifest();
  parseN8ModelManifest(manifest);

  const multimodal = activation.includePublicStructureFixture === true;
  const structureFixture = multimodal ? N8_PUBLIC_STRUCTURE_FIXTURE : null;

  const proposals: FixtureModelProposal[] = [];
  const n4BriefPins: N8AdapterRunReceipt["n4BriefPins"] = [];
  const baselineRows: Array<{
    investigationId: string;
    deterministic: BriefOutcome;
    fixture: FixtureModelProposal;
  }> = [];

  for (const row of input.briefs) {
    const brief = row.brief;
    if (brief.groundedClaimAccepted !== false) fail("Input brief must keep groundedClaimAccepted=false");
    if (brief.modelActivationAllowed !== false) fail("Input brief must keep modelActivationAllowed=false");
    if (!brief.pins.modelAdapterEnabled) {
      fail(`Brief ${row.investigationId} requires pins.modelAdapterEnabled=true for N8 dry-run`);
    }

    // Exercise N4 optional contract — still activation-disallowed.
    const contract = buildOptionalModelAdapterRequest(brief);
    if (contract.modelActivationAllowed !== false) fail("N4 contract must disallow activation");
    if (contract.outputSchema !== GROUNDED_BRIEF_SCHEMA) fail("Unexpected N4 output schema");
    if (contract.promptVersion !== GROUNDED_BRIEF_PROMPT_VERSION) fail("Unexpected N4 prompt version");

    for (const hit of brief.hits) {
      if (!rejectPhiPayload({textBlobs: [hit.quote ?? "", hit.assertion ?? ""].filter(Boolean)}).ok) {
        fail("Research-only non-identifying hit text required");
      }
    }

    const proposal = fixtureProposalFromBrief({
      investigationId: row.investigationId,
      brief,
      multimodal,
    });
    proposals.push(proposal);
    push("fixture_emitted", `${row.investigationId}: outcome=${proposal.proposedOutcome}; uncertainty=${proposal.uncertainty}`);

    n4BriefPins.push({
      investigationId: row.investigationId,
      questionHash: brief.pins.questionHash,
      configurationHash: brief.pins.configurationHash,
      modelAdapterEnabled: brief.pins.modelAdapterEnabled,
    });
    baselineRows.push({
      investigationId: row.investigationId,
      deterministic: brief.outcome,
      fixture: proposal,
    });
  }

  const baselineComparison = compareToBaseline(baselineRows);
  if (baselineComparison.rows.some((r) => !r.abstentionPreserved)) {
    fail("Fixture model must preserve deterministic abstention (fail closed)");
  }
  push("baseline_compared", `agreementRate=${baselineComparison.agreementRate}; usefulnessDelta=null`);
  push("honesty_asserted", "groundedClaimAccepted=false; modelActivationAllowed=false; n6Usefulness=BLOCKED");

  const dataManifest = {
    briefs: n4BriefPins,
    publicStructureFixture: structureFixture,
    n4BriefReceiptHash: input.n4BriefReceiptHash ?? null,
    n6ProtocolHash: input.n6ProtocolHash ?? null,
    n7LedgerHash: input.n7LedgerHash ?? null,
  };

  const configuration = {
    adapterId: N8_ADAPTER_ID,
    modelVersion: N8_MODEL_VERSION,
    configVersion: N8_CONFIG_VERSION,
    mode: activation.mode,
    optIn: true,
    activationAllowed: false,
    includePublicStructureFixture: multimodal,
    mayCallPaidApis: false,
  };

  return {
    schemaVersion: N8_RUN_RECEIPT_SCHEMA,
    phase: "N8",
    programme: "gut_immune_t2d",
    adapterId: N8_ADAPTER_ID,
    generatedAt: activation.generatedAt,
    mode: activation.mode,
    optIn: true,
    activationAllowed: false,
    manifest,
    configurationHash: sha256(configuration),
    dataManifestHash: sha256(dataManifest),
    modelVersion: N8_MODEL_VERSION,
    n4BriefPins,
    publicStructureFixture: structureFixture,
    proposals,
    baselineComparison,
    logs,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    n6Usefulness: "BLOCKED",
    groundedClaimAccepted: false,
    modelActivationAllowed: false,
    scientificApproval: false,
    graphPromotable: false,
    liveProviderCalled: false,
    paidApiCalled: false,
    note:
      activation.operatorNote ??
      "N8 engineering dry-run only. Do not claim specialised-model usefulness without N6 expert evidence and held-out evaluation.",
  };
}

export function parseN8AdapterRunReceipt(value: unknown): N8AdapterRunReceipt {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("Invalid N8 run receipt");
  const r = value as N8AdapterRunReceipt;
  if (r.schemaVersion !== N8_RUN_RECEIPT_SCHEMA || r.phase !== "N8" || r.adapterId !== N8_ADAPTER_ID) {
    fail("Unsupported N8 run receipt");
  }
  if (r.groundedClaimAccepted !== false || r.modelActivationAllowed !== false || r.activationAllowed !== false) {
    fail("N8 receipt honesty: activation / grounded claims must remain false");
  }
  if (r.scientificAcceptance !== "BLOCKED" || r.n6Usefulness !== "BLOCKED") {
    fail("N8 scientific / N6 usefulness gates must remain BLOCKED");
  }
  if (r.scientificApproval !== false || r.graphPromotable !== false) {
    fail("N8 cannot claim scientific approval or graph promotion");
  }
  if (r.liveProviderCalled !== false || r.paidApiCalled !== false) {
    fail("N8 receipt cannot claim live / paid API calls");
  }
  if (r.baselineComparison.usefulnessDeltaVsBaseline !== null || r.baselineComparison.n6UsefulnessClaimed !== false) {
    fail("N8 cannot claim usefulness delta vs baseline");
  }
  parseN8ModelManifest(r.manifest);
  if (!Array.isArray(r.proposals) || !Array.isArray(r.logs) || !Array.isArray(r.baselineComparison.rows)) {
    fail("N8 receipt lists required");
  }
  for (const p of r.proposals) {
    if (p.inventedClaims !== false || p.groundedClaimAccepted !== false || p.modelActivationAllowed !== false) {
      fail("N8 proposal honesty violated");
    }
  }
  return r;
}

export function buildN8AdapterStatus(input: {
  receipt: N8AdapterRunReceipt;
  n4BriefReceiptHash: string | null;
  n6ProtocolHash: string | null;
  n7LedgerHash: string | null;
}): N8AdapterStatus {
  const receipt = parseN8AdapterRunReceipt(input.receipt);
  return {
    schemaVersion: "hsi-n8-status-1",
    phase: "N8",
    programme: "gut_immune_t2d",
    generatedAt: receipt.generatedAt,
    engineeringHarness: receipt.engineeringHarness,
    scientificAcceptance: "BLOCKED",
    n6Usefulness: "BLOCKED",
    activationDefault: false,
    modelActivationAllowed: false,
    groundedClaimAccepted: false,
    liveProviderCalled: false,
    pins: {
      n4BriefReceiptHash: input.n4BriefReceiptHash,
      n6ProtocolHash: input.n6ProtocolHash,
      n7LedgerHash: input.n7LedgerHash,
      manifestHash: sha256(receipt.manifest),
      runReceiptHash: sha256(receipt),
    },
    note: "Engineering adapter harness only. N4 honesty retained; N6 usefulness BLOCKED; activation disallowed by default.",
  };
}
