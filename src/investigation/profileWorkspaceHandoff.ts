/**
 * Profile → workspace handoff (audit Next-5 PR #4).
 * Continuity from Welcome interests/question → Research Home → live workspace
 * without claiming a durable server profile (023 held) or production writes.
 * Browser-safe (no Node-only imports).
 */

export const PROFILE_WORKSPACE_HANDOFF_SCHEMA = "hsi-profile-workspace-handoff-1" as const;

export type ProfileWorkspaceHandoffHonesty = {
  serverProfileDurableClaimed: false;
  productionWritesEnabled: false;
  deviceLocalProfile: true;
  inventsInterests: false;
  usp: "C";
};

export const PROFILE_WORKSPACE_HANDOFF_HONESTY: ProfileWorkspaceHandoffHonesty = {
  serverProfileDurableClaimed: false,
  productionWritesEnabled: false,
  deviceLocalProfile: true,
  inventsInterests: false,
  usp: "C",
};

export type ProfileHandoffInput = {
  onboarded: boolean;
  question: string;
  interests: readonly string[];
  role: string | null;
  cadence: string;
  /** Result of matchScenario(question) — curated live-run availability only. */
  matchedScenarioId: string | null;
};

export type ProfileWorkspaceHandoff = {
  schemaVersion: typeof PROFILE_WORKSPACE_HANDOFF_SCHEMA;
  honesty: ProfileWorkspaceHandoffHonesty;
  ready: boolean;
  activationStep: "welcome" | "home" | "workspace";
  question: string | null;
  interestLabels: readonly string[];
  role: string | null;
  cadence: string;
  matchedScenarioId: string | null;
  liveRunAvailable: boolean;
  /** Relative href into the live workspace (no auto-run). */
  workspaceHref: string;
  note: string;
};

export function assertProfileWorkspaceHandoffHonesty(
  honesty: ProfileWorkspaceHandoffHonesty,
): ProfileWorkspaceHandoffHonesty {
  if (honesty.serverProfileDurableClaimed !== false) {
    throw Error("serverProfileDurableClaimed must be false");
  }
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.deviceLocalProfile !== true) {
    throw Error("deviceLocalProfile must be true");
  }
  if (honesty.inventsInterests !== false) {
    throw Error("inventsInterests must be false");
  }
  if (honesty.usp !== "C") throw Error("usp must be C");
  return honesty;
}

/** Build the Welcome → Home → Workspace activation handoff from a device profile. */
export function buildProfileWorkspaceHandoff(
  input: ProfileHandoffInput,
  opts?: { workspacePath?: string },
): ProfileWorkspaceHandoff {
  const honesty = assertProfileWorkspaceHandoffHonesty(PROFILE_WORKSPACE_HANDOFF_HONESTY);
  const question = input.question.trim() || null;
  const interestLabels = input.interests.map((i) => i.trim()).filter(Boolean).slice(0, 8);
  const ready = input.onboarded && (Boolean(question) || interestLabels.length > 0);
  const workspacePath = opts?.workspacePath ?? "/research/workspace";
  const workspaceHref = `${workspacePath}?from=profile`;

  let activationStep: ProfileWorkspaceHandoff["activationStep"] = "welcome";
  if (ready) activationStep = "home";
  // Callers on the workspace page may treat ready as workspace step.

  return {
    schemaVersion: PROFILE_WORKSPACE_HANDOFF_SCHEMA,
    honesty,
    ready,
    activationStep,
    question,
    interestLabels,
    role: input.role,
    cadence: input.cadence,
    matchedScenarioId: input.matchedScenarioId,
    liveRunAvailable: Boolean(input.matchedScenarioId),
    workspaceHref,
    note: ready
      ? input.matchedScenarioId
        ? "Profile question matches a curated live scenario. Nothing starts until you press Run on the workspace."
        : "Profile is ready for Research Home continuity. Live runs cover curated scenarios only; other questions can be explored on Home."
      : "Finish Welcome (or Research Home setup) so interests and question can hand off to the live workspace. Profile stays on this device — durable server profile is not claimed.",
  };
}

/** Mark handoff as open on the workspace surface (still fail-closed on writes). */
export function markHandoffOnWorkspace(
  handoff: ProfileWorkspaceHandoff,
): ProfileWorkspaceHandoff {
  if (!handoff.ready) return handoff;
  return { ...handoff, activationStep: "workspace" };
}
