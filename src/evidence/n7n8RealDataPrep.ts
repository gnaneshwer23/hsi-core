/**
 * N7/N8 real-data / licensed-model prep (production-readiness audit Phase #10).
 * Engineering scaffolding only — science stays NO-GO near-term.
 * Never invents wet-lab observations, partner data agreements, licensed weights,
 * live provider calls, MoU, Gate C approval, or CDS/PHI.
 */
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";

export const N7N8_REAL_DATA_PREP_SCHEMA = "hsi-n7n8-real-data-prep-1" as const;

export type N7N8PrepCheckStatus =
  | "CLEARED"
  | "BLOCKED"
  | "PENDING_HUMAN"
  | "NO_GO";

export type N7N8PrepCheckId =
  | "n7_offline_ledger_harness_present"
  | "n7_fixture_outcomes_only_documented"
  | "n7_real_observation_forced_false"
  | "n8_offline_adapter_harness_present"
  | "n8_live_provider_refused_by_default"
  | "n8_activation_disallowed_by_default"
  | "empty_real_data_slots_reserved"
  | "n7n8_checklist_published"
  | "n7_authorised_public_or_partner_data"
  | "n7_protocol_human_approved"
  | "n7_non_fixture_observation_recorded"
  | "n8_compatible_model_licence"
  | "n8_n6_usefulness_prerequisite"
  | "n8_held_out_multimodal_eval"
  | "n8_live_provider_activation";

export type N7N8PrepCheck = {
  id: N7N8PrepCheckId;
  title: string;
  plane: "engineering" | "human";
  track: "N7" | "N8" | "shared";
  status: N7N8PrepCheckStatus;
  evidence: string;
};

/**
 * Empty real-data / licence slots — fill only after human agreements exist.
 * All identity / artifact fields stay null; attestations stay false.
 */
export type N7N8RealDataSlot = {
  slotId: string;
  track: "N7" | "N8";
  role:
    | "n7_authorised_public_data"
    | "n7_partner_lab_agreement"
    | "n7_protocol_approval"
    | "n7_observation_attestor"
    | "n8_model_licence_artifact"
    | "n8_weights_access"
    | "n8_held_out_eval_protocol"
    | "n8_activation_attestor";
  roleLabel: string;
  organisationName: null;
  artifactUri: null;
  licenceId: null;
  modelId: null;
  approvedAt: null;
  attested: false;
  notes: string;
};

export type N7N8RealDataPrep = {
  schemaVersion: typeof N7N8_REAL_DATA_PREP_SCHEMA;
  phase: "N7_N8";
  programme: "gut_immune_t2d";
  remediationPhase: "production_readiness_audit_phase_10";
  generatedAt: string;
  auditRank: 10;
  nearTermGoNoGo: "NO_GO";
  engineeringScaffold: "CLEARED";
  scientificAcceptance: "BLOCKED";
  n7: {
    offlineHarness: "CLEARED";
    realObservationAcceptance: "BLOCKED";
    realObservationClaimed: false;
    realObservationGoNoGo: "NO_GO";
    inventedRealOutcomesPermitted: false;
    fixtureHonestyRequired: true;
    ledgerStatusPin: {
      engineeringHarness: "CLEARED";
      realObservationAcceptance: "BLOCKED";
      realObservationClaimed: false;
    };
  };
  n8: {
    offlineHarness: "CLEARED";
    scientificAcceptance: "BLOCKED";
    n6UsefulnessPrerequisite: "BLOCKED";
    modelActivationAllowed: false;
    activationDefault: false;
    liveProviderCalled: false;
    liveModelGoNoGo: "NO_GO";
    inventedLicensedModelsPermitted: false;
    statusPin: {
      engineeringHarness: "CLEARED";
      scientificAcceptance: "BLOCKED";
      n6Usefulness: "BLOCKED";
      modelActivationAllowed: false;
      liveProviderCalled: false;
    };
  };
  honesty: {
    offlineFixturesAreNotWetLab: true;
    emptySlotsAreNotAgreements: true;
    realObservationRequiresAuthorisedData: true;
    liveModelsRequireLicenceAndN6: true;
    noInventedPartnerData: true;
    noInventedMoU: true;
    noGateCAutoApprove: true;
    noLiveCdsPhi: true;
    redWaveOnlyForHsi: true;
    nearTermNoGoDocumented: true;
  };
  realDataSlots: N7N8RealDataSlot[];
  humanMustSupply: string[];
  codeCanAutomate: string[];
  checks: N7N8PrepCheck[];
  summary: {
    engineeringChecksCleared: number;
    engineeringChecksTotal: number;
    humanChecksPending: number;
    humanChecksTotal: number;
    realDataSlotsReserved: number;
    realDataSlotsFilled: 0;
    nearTermGoNoGo: "NO_GO";
    scientificAcceptance: "BLOCKED";
  };
  residualHumanSteps: string[];
  stopNote: string;
  prepHash: string;
};

export class N7N8RealDataPrepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "N7N8RealDataPrepError";
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function seal(body: Omit<N7N8RealDataPrep, "prepHash">): N7N8RealDataPrep {
  return {...body, prepHash: digest(body)};
}

function defaultRealDataSlots(): N7N8RealDataSlot[] {
  return [
    {
      slotId: "N7-DATA-PUBLIC",
      track: "N7",
      role: "n7_authorised_public_data",
      roleLabel: "Authorised public experimental data pointer",
      organisationName: null,
      artifactUri: null,
      licenceId: null,
      modelId: null,
      approvedAt: null,
      attested: false,
      notes:
        "Fill only with a real authorised public dataset URI / accession after human clearance. Never invent wet-lab rows.",
    },
    {
      slotId: "N7-DATA-PARTNER",
      track: "N7",
      role: "n7_partner_lab_agreement",
      roleLabel: "Partner laboratory / data agreement",
      organisationName: null,
      artifactUri: null,
      licenceId: null,
      modelId: null,
      approvedAt: null,
      attested: false,
      notes:
        "Requires real written partner / lab agreement (ties to Audit #8 MoU residual). Do not invent org names or MoU text.",
    },
    {
      slotId: "N7-PROTOCOL",
      track: "N7",
      role: "n7_protocol_approval",
      roleLabel: "Prospective protocol human approval",
      organisationName: null,
      artifactUri: null,
      licenceId: null,
      modelId: null,
      approvedAt: null,
      attested: false,
      notes:
        "Wet-lab / authorised observation protocol must be separately approved. Fixture ledger does not imply approval.",
    },
    {
      slotId: "N7-ATTEST",
      track: "N7",
      role: "n7_observation_attestor",
      roleLabel: "Non-fixture observation attestor",
      organisationName: null,
      artifactUri: null,
      licenceId: null,
      modelId: null,
      approvedAt: null,
      attested: false,
      notes:
        "Human attests realObservationClaimed only after authorised data + protocol. Eng cannot flip this flag.",
    },
    {
      slotId: "N8-LICENCE",
      track: "N8",
      role: "n8_model_licence_artifact",
      roleLabel: "Compatible model licence artifact",
      organisationName: null,
      artifactUri: null,
      licenceId: null,
      modelId: null,
      approvedAt: null,
      attested: false,
      notes:
        "Record a real licence id / private artifact pointer for a bounded research model. Do not invent commercial rights.",
    },
    {
      slotId: "N8-WEIGHTS",
      track: "N8",
      role: "n8_weights_access",
      roleLabel: "Licensed weights / provider access",
      organisationName: null,
      artifactUri: null,
      licenceId: null,
      modelId: null,
      approvedAt: null,
      attested: false,
      notes:
        "Weights or paid provider access stay out of git. Never vendor multi-GB weights or claim AF3 commercial rights.",
    },
    {
      slotId: "N8-EVAL",
      track: "N8",
      role: "n8_held_out_eval_protocol",
      roleLabel: "Held-out multimodal / organoid eval protocol",
      organisationName: null,
      artifactUri: null,
      licenceId: null,
      modelId: null,
      approvedAt: null,
      attested: false,
      notes:
        "Requires N6 usefulness CLEARED (#4/#7 residuals) plus a separately approved held-out protocol.",
    },
    {
      slotId: "N8-ACTIVATE",
      track: "N8",
      role: "n8_activation_attestor",
      roleLabel: "Live provider activation attestor",
      organisationName: null,
      artifactUri: null,
      licenceId: null,
      modelId: null,
      approvedAt: null,
      attested: false,
      notes:
        "modelActivationAllowed stays false until founder/human attests licence + N6 + protocol. live_provider remains refused by default.",
    },
  ];
}

function readJsonStatus(relativePath: string): Record<string, unknown> {
  const root = resolve(import.meta.dir, "../..");
  return JSON.parse(readFileSync(resolve(root, relativePath), "utf8")) as Record<string, unknown>;
}

function buildChecks(n7Status: Record<string, unknown>, n8Status: Record<string, unknown>): N7N8PrepCheck[] {
  const n7Eng =
    n7Status.engineeringHarness === "CLEARED" &&
    n7Status.realObservationAcceptance === "BLOCKED" &&
    n7Status.realObservationClaimed === false &&
    n7Status.scientificApproval === false &&
    n7Status.graphPromotable === false;
  const n8Eng =
    n8Status.engineeringHarness === "CLEARED" &&
    n8Status.scientificAcceptance === "BLOCKED" &&
    n8Status.n6Usefulness === "BLOCKED" &&
    n8Status.modelActivationAllowed === false &&
    n8Status.liveProviderCalled === false &&
    n8Status.activationDefault === false;

  return [
    {
      id: "n7_offline_ledger_harness_present",
      title: "N7 offline experiment ledger harness present",
      plane: "engineering",
      track: "N7",
      status: n7Eng ? "CLEARED" : "BLOCKED",
      evidence: "bun run n7:ledger / n7:check; research/domain-graph/n7/; experimentLedger.ts.",
    },
    {
      id: "n7_fixture_outcomes_only_documented",
      title: "N7 fixture outcomes only (dataBasis=fixture_engineering)",
      plane: "engineering",
      track: "N7",
      status: n7Status.inventedRealOutcomesPermitted === false ? "CLEARED" : "BLOCKED",
      evidence: "STATUS.json inventedRealOutcomesPermitted=false; fixtureHonesty on fixture rows.",
    },
    {
      id: "n7_real_observation_forced_false",
      title: "N7 realObservationClaimed forced false",
      plane: "engineering",
      track: "N7",
      status: n7Status.realObservationClaimed === false ? "CLEARED" : "BLOCKED",
      evidence: "Ledger + STATUS keep realObservationClaimed=false until authorised data exists.",
    },
    {
      id: "n8_offline_adapter_harness_present",
      title: "N8 offline specialised-model adapter harness present",
      plane: "engineering",
      track: "N8",
      status: n8Eng ? "CLEARED" : "BLOCKED",
      evidence: "bun run n8:adapter / n8:check; research/domain-graph/n8/; specialisedModelAdapter.ts.",
    },
    {
      id: "n8_live_provider_refused_by_default",
      title: "N8 live_provider mode refused by default",
      plane: "engineering",
      track: "N8",
      status: n8Status.liveProviderCalled === false ? "CLEARED" : "BLOCKED",
      evidence: "Executor refuses live_provider; offline dry-run/fixture only.",
    },
    {
      id: "n8_activation_disallowed_by_default",
      title: "N8 modelActivationAllowed / activationDefault forced false",
      plane: "engineering",
      track: "N8",
      status:
        n8Status.modelActivationAllowed === false && n8Status.activationDefault === false
          ? "CLEARED"
          : "BLOCKED",
      evidence: "STATUS + adapter honesty keep activation disallowed.",
    },
    {
      id: "empty_real_data_slots_reserved",
      title: "Empty N7/N8 real-data / licence slots reserved",
      plane: "engineering",
      track: "shared",
      status: "CLEARED",
      evidence: "Eight slots with organisationName/artifactUri/licenceId/modelId null; attested=false.",
    },
    {
      id: "n7n8_checklist_published",
      title: "N7/N8 real-data checklist published",
      plane: "engineering",
      track: "shared",
      status: "CLEARED",
      evidence: "docs/engineering/N7_N8_REAL_DATA_CHECKLIST.md — ENG CLEARED / SCIENCE NO-GO.",
    },
    {
      id: "n7_authorised_public_or_partner_data",
      title: "N7 authorised public data or partner lab agreement",
      plane: "human",
      track: "N7",
      status: "NO_GO",
      evidence: "realDataSlotsFilled=0. Near-term NO-GO — do not invent datasets or MoU.",
    },
    {
      id: "n7_protocol_human_approved",
      title: "N7 prospective protocol human-approved",
      plane: "human",
      track: "N7",
      status: "PENDING_HUMAN",
      evidence: "Empty N7-PROTOCOL slot. Fixture ledger ≠ protocol approval.",
    },
    {
      id: "n7_non_fixture_observation_recorded",
      title: "N7 non-fixture observation recorded under authorised dataBasis",
      plane: "human",
      track: "N7",
      status: "NO_GO",
      evidence: "realObservationGoNoGo=NO_GO until authorised data + attestor exist.",
    },
    {
      id: "n8_compatible_model_licence",
      title: "N8 compatible live model licence + weights access",
      plane: "human",
      track: "N8",
      status: "NO_GO",
      evidence: "Empty N8-LICENCE / N8-WEIGHTS slots. Never invent commercial model rights.",
    },
    {
      id: "n8_n6_usefulness_prerequisite",
      title: "N8 waits on N6 blinded usefulness (#4/#7)",
      plane: "human",
      track: "N8",
      status: "BLOCKED",
      evidence: "n6Usefulness=BLOCKED; usefulness pilot NO-GO until N3 SME freeze.",
    },
    {
      id: "n8_held_out_multimodal_eval",
      title: "N8 held-out multimodal / organoid evaluation",
      plane: "human",
      track: "N8",
      status: "PENDING_HUMAN",
      evidence: "Empty N8-EVAL slot; separately approved protocol required.",
    },
    {
      id: "n8_live_provider_activation",
      title: "N8 live provider activation after licence + N6 + protocol",
      plane: "human",
      track: "N8",
      status: "NO_GO",
      evidence: "liveModelGoNoGo=NO_GO; modelActivationAllowed stays false near-term.",
    },
  ];
}

/** Build fail-closed Phase #10 N7/N8 real-data prep (offline; never invents live runs). */
export function buildN7N8RealDataPrep(input: {generatedAt: string}): N7N8RealDataPrep {
  const n7Status = readJsonStatus("research/domain-graph/n7/STATUS.json");
  const n8Status = readJsonStatus("research/domain-graph/n8/STATUS.json");

  if (n7Status.realObservationClaimed !== false || n7Status.realObservationAcceptance !== "BLOCKED") {
    throw new N7N8RealDataPrepError(
      "N7/N8 prep refuses realObservationClaimed=true or realObservationAcceptance≠BLOCKED under near-term scaffold",
    );
  }
  if (
    n8Status.modelActivationAllowed !== false ||
    n8Status.liveProviderCalled !== false ||
    n8Status.scientificAcceptance !== "BLOCKED"
  ) {
    throw new N7N8RealDataPrepError(
      "N7/N8 prep refuses N8 activation, live provider calls, or scientificAcceptance≠BLOCKED under near-term scaffold",
    );
  }

  const realDataSlots = defaultRealDataSlots();
  const checks = buildChecks(n7Status, n8Status);
  const eng = checks.filter((c) => c.plane === "engineering");
  const human = checks.filter((c) => c.plane === "human");
  const engCleared = eng.filter((c) => c.status === "CLEARED").length;
  const humanPending = human.filter(
    (c) => c.status === "PENDING_HUMAN" || c.status === "NO_GO" || c.status === "BLOCKED",
  ).length;
  if (engCleared !== eng.length) {
    throw new N7N8RealDataPrepError(
      "Engineering N7/N8 checks must all CLEARED before writing artifact",
    );
  }
  if (humanPending !== human.length) {
    throw new N7N8RealDataPrepError(
      "Human N7/N8 checks must remain PENDING_HUMAN/NO_GO/BLOCKED while real-data slots are empty",
    );
  }

  return seal({
    schemaVersion: N7N8_REAL_DATA_PREP_SCHEMA,
    phase: "N7_N8",
    programme: "gut_immune_t2d",
    remediationPhase: "production_readiness_audit_phase_10",
    generatedAt: input.generatedAt,
    auditRank: 10,
    nearTermGoNoGo: "NO_GO",
    engineeringScaffold: "CLEARED",
    scientificAcceptance: "BLOCKED",
    n7: {
      offlineHarness: "CLEARED",
      realObservationAcceptance: "BLOCKED",
      realObservationClaimed: false,
      realObservationGoNoGo: "NO_GO",
      inventedRealOutcomesPermitted: false,
      fixtureHonestyRequired: true,
      ledgerStatusPin: {
        engineeringHarness: "CLEARED",
        realObservationAcceptance: "BLOCKED",
        realObservationClaimed: false,
      },
    },
    n8: {
      offlineHarness: "CLEARED",
      scientificAcceptance: "BLOCKED",
      n6UsefulnessPrerequisite: "BLOCKED",
      modelActivationAllowed: false,
      activationDefault: false,
      liveProviderCalled: false,
      liveModelGoNoGo: "NO_GO",
      inventedLicensedModelsPermitted: false,
      statusPin: {
        engineeringHarness: "CLEARED",
        scientificAcceptance: "BLOCKED",
        n6Usefulness: "BLOCKED",
        modelActivationAllowed: false,
        liveProviderCalled: false,
      },
    },
    honesty: {
      offlineFixturesAreNotWetLab: true,
      emptySlotsAreNotAgreements: true,
      realObservationRequiresAuthorisedData: true,
      liveModelsRequireLicenceAndN6: true,
      noInventedPartnerData: true,
      noInventedMoU: true,
      noGateCAutoApprove: true,
      noLiveCdsPhi: true,
      redWaveOnlyForHsi: true,
      nearTermNoGoDocumented: true,
    },
    realDataSlots,
    humanMustSupply: [
      "Authorised public experimental dataset accession / URI (or partner lab agreement) before any non-fixture N7 dataBasis.",
      "Human-approved prospective protocol for wet-lab / authorised observation (separate from fixture harness).",
      "Audit #8 founder MoU / written confirm before treating partner lab data as authorised (never invent MoU).",
      "Compatible model licence + private weights/provider access pointer before any N8 live path.",
      "Complete Audit #4 N3 SME freeze + #7 N6 usefulness before claiming specialised-model benefit.",
      "Held-out multimodal / organoid eval protocol under a separately approved study plan.",
      "Founder/human attestation before flipping modelActivationAllowed or calling a paid provider.",
    ],
    codeCanAutomate: [
      "Assert N7 STATUS keeps realObservationClaimed=false and realObservationAcceptance=BLOCKED.",
      "Assert N8 STATUS keeps activationDefault=false, modelActivationAllowed=false, liveProviderCalled=false.",
      "Reserve empty real-data / licence slots (all null / false).",
      "Refuse prep packets that invent org names, artefact URIs, licences, or attested=true.",
      "Seal prepHash + offline check harness (n7n8:real-data-prep / n7n8:real-data-prep:check).",
      "Operator checklist + Audit #10 receipt stamps (ENG CLEARED / SCIENCE NO-GO).",
      "Keep offline n7:check / n8:check as engineering authority — no invented live runs.",
    ],
    checks,
    summary: {
      engineeringChecksCleared: engCleared,
      engineeringChecksTotal: eng.length,
      humanChecksPending: humanPending,
      humanChecksTotal: human.length,
      realDataSlotsReserved: realDataSlots.length,
      realDataSlotsFilled: 0,
      nearTermGoNoGo: "NO_GO",
      scientificAcceptance: "BLOCKED",
    },
    residualHumanSteps: [
      "STOP further eng automation on N7/N8 live paths — near-term NO-GO is intentional.",
      "Prioritise human residuals: #2 N1 rights, #3 cite HITL, #4 N3 SMEs, #5 two-account, #8 MoU.",
      "Fill empty real-data slots only with real authorised pointers after human agreements exist.",
      "Never set realObservationClaimed=true, modelActivationAllowed=true, or invent licensed models from chat.",
      "Do not claim wet-lab clearance, specialised-model usefulness, Gate C, or CDS readiness from this scaffold.",
    ],
    stopNote:
      "Audit #10 is the last ranked eng-safe scaffold. Further production-readiness progress is human residuals (#2 rights, #3 cite HITL, #4 SMEs, #5 two-account, #8 MoU). Do not invent N7/N8 live runs.",
  });
}

export function parseN7N8RealDataPrep(value: unknown): N7N8RealDataPrep {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new N7N8RealDataPrepError("Invalid N7/N8 real-data prep packet");
  }
  const prep = value as N7N8RealDataPrep;
  if (
    prep.schemaVersion !== N7N8_REAL_DATA_PREP_SCHEMA ||
    prep.phase !== "N7_N8" ||
    prep.remediationPhase !== "production_readiness_audit_phase_10" ||
    prep.auditRank !== 10
  ) {
    throw new N7N8RealDataPrepError("Unsupported N7/N8 real-data prep schema");
  }
  if (
    prep.nearTermGoNoGo !== "NO_GO" ||
    prep.scientificAcceptance !== "BLOCKED" ||
    prep.n7.realObservationClaimed !== false ||
    prep.n7.realObservationAcceptance !== "BLOCKED" ||
    prep.n7.realObservationGoNoGo !== "NO_GO" ||
    prep.n7.inventedRealOutcomesPermitted !== false ||
    prep.n8.modelActivationAllowed !== false ||
    prep.n8.activationDefault !== false ||
    prep.n8.liveProviderCalled !== false ||
    prep.n8.liveModelGoNoGo !== "NO_GO" ||
    prep.n8.inventedLicensedModelsPermitted !== false ||
    prep.n8.scientificAcceptance !== "BLOCKED" ||
    prep.n8.n6UsefulnessPrerequisite !== "BLOCKED" ||
    prep.summary.realDataSlotsFilled !== 0 ||
    prep.summary.nearTermGoNoGo !== "NO_GO" ||
    prep.summary.scientificAcceptance !== "BLOCKED"
  ) {
    throw new N7N8RealDataPrepError(
      "N7/N8 prep cannot claim scientific acceptance, real observation, live models, or filled real-data slots",
    );
  }
  if (!Array.isArray(prep.realDataSlots) || prep.realDataSlots.length < 6) {
    throw new N7N8RealDataPrepError("N7/N8 prep must reserve empty real-data slots");
  }
  for (const slot of prep.realDataSlots) {
    if (
      slot.organisationName !== null ||
      slot.artifactUri !== null ||
      slot.licenceId !== null ||
      slot.modelId !== null ||
      slot.approvedAt !== null ||
      slot.attested !== false
    ) {
      throw new N7N8RealDataPrepError(
        "N7/N8 prep cannot invent partner data, licence artifacts, or attestations",
      );
    }
  }
  if (!Array.isArray(prep.checks) || prep.checks.length === 0) {
    throw new N7N8RealDataPrepError("N7/N8 real-data prep checks missing");
  }
  for (const check of prep.checks) {
    if (check.plane === "human" && check.status === "CLEARED") {
      throw new N7N8RealDataPrepError(`Human check ${check.id} cannot be CLEARED in empty real-data prep`);
    }
  }
  if (typeof prep.stopNote !== "string" || prep.stopNote.length < 20) {
    throw new N7N8RealDataPrepError("N7/N8 prep must include an explicit STOP note for human residuals");
  }
  const {prepHash, ...body} = prep;
  const expected = digest(body);
  if (prepHash !== expected) {
    throw new N7N8RealDataPrepError("N7/N8 real-data prep hash mismatch");
  }
  return prep;
}
