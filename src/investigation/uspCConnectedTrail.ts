/**
 * USP C — Connected research intelligence (personal path): pure trail helpers.
 * Device-local profile + browser-saved live runs. Does not invent org sharing,
 * live alerts, server profile persistence, or production writes.
 * Browser-safe (no Node-only imports).
 */

export const USP_C_TRAIL_SCHEMA = "hsi-usp-c-connected-trail-1" as const;

export type UspCTrailStepId =
  | "profile"
  | "workspace"
  | "save"
  | "reopen"
  | "brief";

export type UspCTrailStepState = "pending" | "ready" | "active" | "complete";

export type UspCTrailStep = {
  id: UspCTrailStepId;
  label: string;
  state: UspCTrailStepState;
  detail: string;
};

export type UspCTrailHonesty = {
  scientificApproval: false;
  productionWritesEnabled: false;
  serverProfileDurableClaimed: false;
  orgSharingBlocked: true;
  alertsArePreferencesNotLiveDelivery: true;
  browserSaveOnly: true;
  usp: "C";
};

export const USP_C_TRAIL_HONESTY: UspCTrailHonesty = {
  scientificApproval: false,
  productionWritesEnabled: false,
  serverProfileDurableClaimed: false,
  orgSharingBlocked: true,
  alertsArePreferencesNotLiveDelivery: true,
  browserSaveOnly: true,
  usp: "C",
};

export type UspCTrailInput = {
  profileOnboarded: boolean;
  hasResearchQuestion: boolean;
  interestCount: number;
  alertCadence: "off" | "weekly" | "daily";
  hasRun: boolean;
  libraryCount: number;
  savedThisSession: boolean;
  reopenedThisSession: boolean;
  briefOpen: boolean;
};

/** Build the five-step USP C personal connected trail. */
export function buildUspCConnectedTrail(input: UspCTrailInput): {
  schemaVersion: typeof USP_C_TRAIL_SCHEMA;
  honesty: UspCTrailHonesty;
  steps: readonly UspCTrailStep[];
  activeStep: UspCTrailStepId;
} {
  let active: UspCTrailStepId = "profile";
  if (input.briefOpen && input.hasRun) active = "brief";
  else if (input.reopenedThisSession) active = "reopen";
  else if (input.savedThisSession || input.libraryCount > 0) active = "save";
  else if (input.hasRun) active = "workspace";
  else if (input.profileOnboarded) active = "workspace";
  else active = "profile";

  const step = (
    id: UspCTrailStepId,
    label: string,
    complete: boolean,
    ready: boolean,
    detail: string,
  ): UspCTrailStep => ({
    id,
    label,
    state:
      active === id
        ? "active"
        : complete
          ? "complete"
          : ready
            ? "ready"
            : "pending",
    detail,
  });

  const cadenceNote =
    input.alertCadence === "off"
      ? "Update cadence off — preference only, not live delivery"
      : `Cadence “${input.alertCadence}” is a preference — live alerts not delivered`;

  const steps: UspCTrailStep[] = [
    step(
      "profile",
      "Profile",
      input.profileOnboarded,
      true,
      input.profileOnboarded
        ? `${input.interestCount} interest(s)${input.hasResearchQuestion ? " · question kept" : ""} · device-local`
        : "Tell us what you work on (/welcome) — stays on this device",
    ),
    step(
      "workspace",
      "Workspace",
      input.hasRun,
      input.profileOnboarded || true,
      input.hasRun
        ? "Live investigation open on this device"
        : "Open Ask / run from Research Home",
    ),
    step(
      "save",
      "Save",
      input.savedThisSession || input.libraryCount > 0,
      input.hasRun,
      input.libraryCount > 0
        ? `${input.libraryCount} browser-saved run(s) — not a server store`
        : input.hasRun
          ? "Browser library only (production writes off)"
          : "Available after a run",
    ),
    step(
      "reopen",
      "Reopen",
      input.reopenedThisSession,
      input.libraryCount > 0,
      input.libraryCount > 0
        ? "Reopen the same briefHash version from this browser"
        : "Needs a browser-saved run first",
    ),
    step(
      "brief",
      "Brief continuity",
      input.briefOpen && input.hasRun,
      input.hasRun,
      input.hasRun
        ? `${cadenceNote}. Org sharing blocked.`
        : "Evidence-linked brief after a run",
    ),
  ];

  return {
    schemaVersion: USP_C_TRAIL_SCHEMA,
    honesty: USP_C_TRAIL_HONESTY,
    steps,
    activeStep: active,
  };
}

export function assertUspCTrailHonesty(honesty: UspCTrailHonesty): UspCTrailHonesty {
  if (honesty.usp !== "C") throw new Error("trail must be labelled USP C");
  if (
    honesty.scientificApproval !== false ||
    honesty.productionWritesEnabled !== false ||
    honesty.serverProfileDurableClaimed !== false ||
    honesty.orgSharingBlocked !== true ||
    honesty.alertsArePreferencesNotLiveDelivery !== true ||
    honesty.browserSaveOnly !== true
  ) {
    throw new Error("USP C trail must keep fail-closed honesty flags");
  }
  return honesty;
}
