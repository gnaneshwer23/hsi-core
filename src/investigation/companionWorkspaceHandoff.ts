/**
 * U45 — map workspace / live-run public literature metadata into Companion
 * bound-evidence records. Browser-safe. Never retrieves over the network and
 * never escalates verification state.
 */
import type {LiveEvidenceRecord} from "../evidence/liveSources";
import type {HsiScientificCompanionBoundEvidence} from "../hsiScientificCompanionRuntime";
import {
  assertHsiCompanionWorkspaceHandoffOwnerAuthorized,
  HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL,
  type HsiCompanionWorkspaceHandoffOwnerApproval,
} from "../hsiCompanionWorkspaceHandoffAuthorization";
import {LIVE_SCENARIOS} from "./scenarios";
import type {Candidate} from "./liveRun";

export const HSI_COMPANION_WORKSPACE_HANDOFF_SCHEMA =
  "hsi-companion-workspace-handoff-1" as const;

export type CompanionWorkspaceHandoffHonesty = {
  companionPerformedNetworkRetrieval: false;
  claimVerified: false;
  scientificApproval: false;
  inventsLiterature: false;
  workspaceDerivedOnly: true;
};

export const COMPANION_WORKSPACE_HANDOFF_HONESTY: CompanionWorkspaceHandoffHonesty = {
  companionPerformedNetworkRetrieval: false,
  claimVerified: false,
  scientificApproval: false,
  inventsLiterature: false,
  workspaceDerivedOnly: true,
};

/** Slim workspace handoff row (candidates or bibliographic metadata). */
export type CompanionWorkspaceEvidenceInput = {
  sourceId: string;
  title: string;
  sourceUrl: string;
  provider?: "europe-pmc" | "openalex" | "workspace";
};

export type CompanionWorkspaceHandoffResult = {
  schemaVersion: typeof HSI_COMPANION_WORKSPACE_HANDOFF_SCHEMA;
  authorization: HsiCompanionWorkspaceHandoffOwnerApproval;
  scenarioId: string | null;
  question: string | null;
  records: readonly HsiScientificCompanionBoundEvidence[];
  honesty: CompanionWorkspaceHandoffHonesty;
  note: string;
};

function providerFromSourceId(
  sourceId: string,
  explicit?: CompanionWorkspaceEvidenceInput["provider"],
): HsiScientificCompanionBoundEvidence["provider"] {
  if (explicit) return explicit;
  if (sourceId.startsWith("europepmc:") || sourceId.includes("europepmc")) return "europe-pmc";
  if (sourceId.startsWith("openalex:") || sourceId.includes("openalex")) return "openalex";
  return "workspace";
}

export function mapLiveEvidenceRecordsToCompanionBound(
  records: readonly LiveEvidenceRecord[],
  limit = 8,
): HsiScientificCompanionBoundEvidence[] {
  return records.slice(0, limit).map((r) => ({
    sourceId: r.sourceId.trim(),
    title: r.title.trim().slice(0, 500),
    provider: r.provider,
    sourceUrl: r.sourceUrl.trim(),
    verificationState: "metadata_retrieved_not_claim_verified" as const,
    reviewState: "unreviewed" as const,
  }));
}

export function mapCandidatesToCompanionBound(
  candidates: readonly Candidate[],
  limit = 8,
): HsiScientificCompanionBoundEvidence[] {
  const seen = new Set<string>();
  const out: HsiScientificCompanionBoundEvidence[] = [];
  for (const c of candidates) {
    if (seen.has(c.sourceId)) continue;
    seen.add(c.sourceId);
    out.push({
      sourceId: c.sourceId.trim(),
      title: `${c.subject} ~ ${c.object}`.slice(0, 500),
      provider: providerFromSourceId(c.sourceId),
      sourceUrl: c.sourceUrl.trim(),
      verificationState: "metadata_retrieved_not_claim_verified",
      reviewState: "unreviewed",
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function mapWorkspaceEvidenceInputsToCompanionBound(
  rows: readonly CompanionWorkspaceEvidenceInput[],
  limit = 8,
): HsiScientificCompanionBoundEvidence[] {
  return rows.slice(0, limit).map((r) => {
    const sourceId = r.sourceId.trim();
    const title = r.title.trim();
    const sourceUrl = r.sourceUrl.trim();
    if (!sourceId || !title || !sourceUrl) {
      throw Error("Workspace handoff evidence rows require sourceId, title, and sourceUrl");
    }
    return {
      sourceId: sourceId.slice(0, 200),
      title: title.slice(0, 500),
      provider: providerFromSourceId(sourceId, r.provider),
      sourceUrl: sourceUrl.slice(0, 1000),
      verificationState: "metadata_retrieved_not_claim_verified" as const,
      reviewState: "unreviewed" as const,
    };
  });
}

/**
 * Illustrative curated metadata for companion handoff demos — not live retrieval.
 * Marked workspace provider so companion honesty stays caller-supplied.
 */
export const COMPANION_WORKSPACE_HANDOFF_FIXTURES: Readonly<
  Record<string, readonly CompanionWorkspaceEvidenceInput[]>
> = Object.freeze({
  "il21-autoimmune": [
    {
      sourceId: "workspace:il21-autoimmune:fixture-1",
      title: "IL-21 signalling across autoimmune contexts (illustrative workspace metadata)",
      sourceUrl: "https://europepmc.org/",
      provider: "workspace",
    },
    {
      sourceId: "workspace:il21-autoimmune:fixture-2",
      title: "Tfh / B-cell responses under IL-21 (illustrative workspace metadata)",
      sourceUrl: "https://openalex.org/",
      provider: "workspace",
    },
  ],
});

/** Build a Companion handoff packet from workspace-shaped evidence (or curated fixture). */
export function buildCompanionWorkspaceHandoff(input: {
  authorization: HsiCompanionWorkspaceHandoffOwnerApproval;
  scenarioId?: string | null;
  question?: string | null;
  records?: readonly LiveEvidenceRecord[];
  candidates?: readonly Candidate[];
  rows?: readonly CompanionWorkspaceEvidenceInput[];
  useFixtureIfEmpty?: boolean;
}): CompanionWorkspaceHandoffResult {
  assertHsiCompanionWorkspaceHandoffOwnerAuthorized(input.authorization);
  const scenarioId =
    typeof input.scenarioId === "string" && input.scenarioId.trim() && LIVE_SCENARIOS[input.scenarioId.trim()]
      ? input.scenarioId.trim()
      : null;
  const scenario = scenarioId ? LIVE_SCENARIOS[scenarioId] : null;

  let records: HsiScientificCompanionBoundEvidence[] = [];
  if (input.records?.length) {
    records = mapLiveEvidenceRecordsToCompanionBound(input.records);
  } else if (input.candidates?.length) {
    records = mapCandidatesToCompanionBound(input.candidates);
  } else if (input.rows?.length) {
    records = mapWorkspaceEvidenceInputsToCompanionBound(input.rows);
  } else if (input.useFixtureIfEmpty !== false && scenarioId && COMPANION_WORKSPACE_HANDOFF_FIXTURES[scenarioId]) {
    records = mapWorkspaceEvidenceInputsToCompanionBound(
      COMPANION_WORKSPACE_HANDOFF_FIXTURES[scenarioId]!,
    );
  }

  return {
    schemaVersion: HSI_COMPANION_WORKSPACE_HANDOFF_SCHEMA,
    authorization: HSI_COMPANION_WORKSPACE_HANDOFF_OWNER_APPROVAL,
    scenarioId,
    question: (input.question?.trim() || scenario?.question || null) as string | null,
    records,
    honesty: COMPANION_WORKSPACE_HANDOFF_HONESTY,
    note:
      records.length > 0
        ? "Workspace-derived metadata bound for Companion — companion did not retrieve these records; they remain unreviewed."
        : "No workspace evidence supplied. Run a live investigation or choose a curated scenario with a handoff fixture.",
  };
}
