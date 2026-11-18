/**
 * A1.2 / SEC-02 — kill switch + spend-cap recording soft-land.
 *
 * Catalogues the env flags that disable model calls and the places owner
 * spend caps must be recorded. Does not invent numeric caps, provider-console
 * limits, or on-call destinations. Live model steps stay opt-in and fail closed.
 */

export const SEC02_CATALOG_SCHEMA = "hsi-sec02-kill-switch-catalog-1" as const;

export type Sec02ControlKind =
  | "live_model_step_enable"
  | "live_model_daily_runs"
  | "rehearsal_kill"
  | "capability_kill"
  | "pilot_provider_switch"
  | "provider_console_spend_cap";

export type Sec02OwnerStatus =
  | "unset_owner_pending"
  | "documented_in_code"
  | "provider_console_owner_pending";

export type Sec02Control = {
  kind: Sec02ControlKind;
  packRef: "SEC-02";
  title: string;
  envVar: string | null;
  /** How the control fails closed when engaged or unreadable. */
  failClosedBehaviour: string;
  /** Where the owner records the real limit (never invented here). */
  recordedCapLocation: string;
  ownerStatus: Sec02OwnerStatus;
  numericCapInvented: false;
  onCallInvented: false;
};

export type Sec02Catalog = {
  schemaVersion: typeof SEC02_CATALOG_SCHEMA;
  purpose: "sec02_kill_switch_spend_caps_soft_land";
  scientificApproval: false;
  ownerCapsClaimed: false;
  providerConsoleCapsClaimed: false;
  controls: readonly Sec02Control[];
};

export type Sec02Env = Readonly<Record<string, string | undefined>>;

export type Sec02Assessment = {
  schemaVersion: "hsi-sec02-assessment-1";
  modelStepOptIn: boolean;
  killEngaged: boolean;
  ownerDailyCapSet: boolean;
  providerConsoleCapsRecorded: false;
  mayStartModelCheckedRun: boolean;
  reasons: string[];
  scientificApproval: false;
  ownerCapsInvented: false;
};

const CONTROLS: readonly Sec02Control[] = [
  {
    kind: "live_model_step_enable",
    packRef: "SEC-02",
    title: "Live model-step enable (primary kill / enable flag)",
    envVar: "HSI_LIVE_MODEL_STEP_ENABLED",
    failClosedBehaviour:
      "Model challenge runs only when the flag is exactly \"true\". Any other value (including unset) keeps the model step disabled; retrieval may still run.",
    recordedCapLocation: ".env.example + deployment env; redeploy within a minute to engage or clear",
    ownerStatus: "documented_in_code",
    numericCapInvented: false,
    onCallInvented: false,
  },
  {
    kind: "live_model_daily_runs",
    packRef: "SEC-02",
    title: "Per-instance daily model-checked run ceiling",
    envVar: "HSI_LIVE_MODEL_DAILY_RUNS",
    failClosedBehaviour:
      "When set to an integer 0–10000, caps model-checked runs per UTC day on this instance. Unset uses the code default safety net only — not a shared or exact spend cap.",
    recordedCapLocation: "Deployment env + provider console daily spend limit (owner)",
    ownerStatus: "unset_owner_pending",
    numericCapInvented: false,
    onCallInvented: false,
  },
  {
    kind: "rehearsal_kill",
    packRef: "SEC-02",
    title: "Live-run rehearsal kill switch",
    envVar: "HSI_REHEARSAL_KILL",
    failClosedBehaviour:
      "When the configured killSwitchEnv value is truthy, liveRun refuses before model calls (Warden kill_switch).",
    recordedCapLocation: "Rehearsal / readiness config limits.killSwitchEnv",
    ownerStatus: "documented_in_code",
    numericCapInvented: false,
    onCallInvented: false,
  },
  {
    kind: "capability_kill",
    packRef: "SEC-02",
    title: "Capability-lab kill switch",
    envVar: null,
    failClosedBehaviour:
      "UI killSwitch=true unmounts capability panels and blocks new actions; reload restores default-off.",
    recordedCapLocation: "site CapabilityLab local rehearsal state (not production)",
    ownerStatus: "documented_in_code",
    numericCapInvented: false,
    onCallInvented: false,
  },
  {
    kind: "pilot_provider_switch",
    packRef: "SEC-02",
    title: "Pilot operations provider/write switches",
    envVar: null,
    failClosedBehaviour:
      "Trusted receipt required to flip jobs/providers/writes; recovery_required blocks reactivation.",
    recordedCapLocation: "Pilot SQLite config switches (not production on-call)",
    ownerStatus: "documented_in_code",
    numericCapInvented: false,
    onCallInvented: false,
  },
  {
    kind: "provider_console_spend_cap",
    packRef: "SEC-02",
    title: "Provider-console spend caps (authoritative)",
    envVar: null,
    failClosedBehaviour:
      "Authoritative spend limits live in OpenAI / Anthropic (or other) consoles. This soft-land records that they are owner-pending and never invents dollar or token caps.",
    recordedCapLocation: "Provider billing consoles + private owner runbook (not git)",
    ownerStatus: "provider_console_owner_pending",
    numericCapInvented: false,
    onCallInvented: false,
  },
];

export function sec02KillSwitchCatalog(): Sec02Catalog {
  return {
    schemaVersion: SEC02_CATALOG_SCHEMA,
    purpose: "sec02_kill_switch_spend_caps_soft_land",
    scientificApproval: false,
    ownerCapsClaimed: false,
    providerConsoleCapsClaimed: false,
    controls: CONTROLS,
  };
}

export function sec02ControlByKind(kind: Sec02ControlKind): Sec02Control {
  const control = CONTROLS.find((c) => c.kind === kind);
  if (!control) throw new Error("Unknown SEC-02 control: " + kind);
  return control;
}

/** Soft-land assessor — does not invent caps; reports whether a model-checked run may start. */
export function assessSec02ModelGate(env: Sec02Env): Sec02Assessment {
  const modelStepOptIn = env.HSI_LIVE_MODEL_STEP_ENABLED === "true";
  const killEngaged = !modelStepOptIn;
  const rawDaily = env.HSI_LIVE_MODEL_DAILY_RUNS?.trim();
  const ownerDailyCapSet =
    rawDaily !== undefined &&
    rawDaily !== "" &&
    Number.isInteger(Number(rawDaily)) &&
    Number(rawDaily) >= 0 &&
    Number(rawDaily) <= 10000;
  const reasons: string[] = [];
  if (killEngaged) {
    reasons.push("HSI_LIVE_MODEL_STEP_ENABLED is not exactly \"true\"; model step stays disabled (fail closed).");
  }
  if (!ownerDailyCapSet) {
    reasons.push(
      "HSI_LIVE_MODEL_DAILY_RUNS is unset or invalid; only the code default safety net applies until the owner records a ceiling.",
    );
  }
  reasons.push("Provider-console spend caps are owner-pending; this assessor never invents them.");
  return {
    schemaVersion: "hsi-sec02-assessment-1",
    modelStepOptIn,
    killEngaged,
    ownerDailyCapSet,
    providerConsoleCapsRecorded: false,
    mayStartModelCheckedRun: modelStepOptIn,
    reasons,
    scientificApproval: false,
    ownerCapsInvented: false,
  };
}

export function assertSec02CatalogSoftLand(catalog: Sec02Catalog = sec02KillSwitchCatalog()): {
  controlCount: number;
  ownerCapsClaimed: false;
  providerConsoleCapsClaimed: false;
} {
  if (catalog.schemaVersion !== SEC02_CATALOG_SCHEMA) throw new Error("Invalid SEC-02 catalog schema");
  if (catalog.scientificApproval !== false) throw new Error("SEC-02 catalog must not claim scientific approval");
  if (catalog.ownerCapsClaimed !== false || catalog.providerConsoleCapsClaimed !== false) {
    throw new Error("SEC-02 catalog must not claim owner or provider-console caps");
  }
  if (catalog.controls.length !== 6) throw new Error("SEC-02 catalog expects six controls");
  for (const c of catalog.controls) {
    if (c.numericCapInvented !== false || c.onCallInvented !== false || c.packRef !== "SEC-02") {
      throw new Error("SEC-02 control honesty flags invalid: " + c.kind);
    }
  }
  return {
    controlCount: catalog.controls.length,
    ownerCapsClaimed: false,
    providerConsoleCapsClaimed: false,
  };
}
