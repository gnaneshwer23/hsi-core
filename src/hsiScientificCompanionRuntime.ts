/** Owner-authorized HSI Scientific Companion runtime (U41 + U42 live-evidence).
 *
 * Text-first conversational turns grounded in existing interrogative /
 * evidence services (Living Knowledge Graph planning path). Deterministic —
 * no unfenced LLM free-text, no voice, no avatar, no networking.
 *
 * Modes:
 * - discuss: plan mechanisms + missing evidence
 * - critique: falsification / disagreement surface
 * - experiment_planning: falsification tests as next experiments
 *
 * U42: optional caller-supplied public literature metadata may be bound into
 * the turn. The companion never performs network retrieval itself.
 */
import {evaluateSscFalsification} from "./interrogativeFalsificationEngine";
import {
  validateInterrogativeInvestigation,
  type InterrogativeInvestigation,
} from "./interrogativeContracts";
import {
  planSscInterrogation,
  type QuestionPlanInput,
} from "./interrogativeQuestionEngine";
import {
  assertHsiScientificCompanionOwnerAuthorized,
  HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
  type HsiScientificCompanionOwnerApproval,
} from "./hsiScientificCompanionAuthorization";
import {
  assertHsiScientificCompanionLiveEvidenceOwnerAuthorized,
  HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL,
  type HsiScientificCompanionLiveEvidenceOwnerApproval,
} from "./hsiScientificCompanionLiveEvidenceAuthorization";

export const HSI_SCIENTIFIC_COMPANION_RUNTIME_SCHEMA =
  "hsi-scientific-companion-runtime-1" as const;

export type HsiScientificCompanionMode =
  | "discuss"
  | "critique"
  | "experiment_planning";

export type HsiScientificCompanionCitation = {
  kind:
    | "planned_mechanism"
    | "falsification_test"
    | "missing_evidence"
    | "limitation"
    | "live_evidence";
  label: string;
  detail: string;
};

/** Caller-supplied public literature metadata (never claim-verified). */
export type HsiScientificCompanionBoundEvidence = {
  sourceId: string;
  title: string;
  provider: "europe-pmc" | "openalex" | "workspace";
  sourceUrl: string;
  verificationState: "metadata_retrieved_not_claim_verified";
  reviewState: "unreviewed";
};

export type HsiScientificCompanionHonesty = {
  scientificApproval: false;
  voiceEnabled: false;
  avatarEnabled: false;
  nuanceIntegrationApproved: false;
  networkingMatchingEnabled: false;
  llmUnfencedFreeText: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  phiAllowed: false;
  clinicalAdvice: false;
  productionWritesEnabled: false;
  restrictedPreviewClaimed: false;
  liveEvidenceBound: boolean;
  companionPerformedNetworkRetrieval: false;
  claimVerified: false;
};

export type HsiScientificCompanionService =
  | "interrogativeQuestionEngine"
  | "interrogativeFalsificationEngine"
  | "caller_supplied_live_evidence";

export type HsiScientificCompanionTurnResult = {
  schemaVersion: typeof HSI_SCIENTIFIC_COMPANION_RUNTIME_SCHEMA;
  authorization: HsiScientificCompanionOwnerApproval;
  liveEvidenceAuthorization: HsiScientificCompanionLiveEvidenceOwnerApproval | null;
  mode: HsiScientificCompanionMode;
  question: string;
  replyMarkdown: string;
  citations: readonly HsiScientificCompanionCitation[];
  limitations: readonly string[];
  investigation: InterrogativeInvestigation;
  falsificationSummary: {
    branchCount: number;
    insufficientEvidenceCount: number;
    opposingSignalCount: number;
  } | null;
  boundEvidence: readonly HsiScientificCompanionBoundEvidence[];
  servicesUsed: readonly HsiScientificCompanionService[];
  honesty: HsiScientificCompanionHonesty;
};

const DEFAULT_RELEASE = {
  id: "HSI-GR-SSC",
  version: "1.0.0",
  manifestHash: "a".repeat(64),
} as const;

const BASE_LIMITATIONS: readonly string[] = [
  "Text-first Scientific Companion engineering path only — not scientific approval.",
  "Deterministic interrogative planning over the approved SSc mechanism catalogue; not live literature retrieval in this turn.",
  "Voice, avatar/Nuance, and networking/matching remain out of scope (Phase 3+).",
  "Not clinical advice. No PHI. No Gate C auto-approve. No production writes.",
];

function assertHonesty(honesty: HsiScientificCompanionHonesty): void {
  if (
    honesty.scientificApproval !== false ||
    honesty.voiceEnabled !== false ||
    honesty.avatarEnabled !== false ||
    honesty.nuanceIntegrationApproved !== false ||
    honesty.networkingMatchingEnabled !== false ||
    honesty.llmUnfencedFreeText !== false ||
    honesty.graphPromotable !== false ||
    honesty.gateCAutoApprove !== false ||
    honesty.phiAllowed !== false ||
    honesty.clinicalAdvice !== false ||
    honesty.productionWritesEnabled !== false ||
    honesty.restrictedPreviewClaimed !== false ||
    honesty.companionPerformedNetworkRetrieval !== false ||
    honesty.claimVerified !== false
  ) {
    throw Error("Scientific companion honesty flags must remain fail-closed");
  }
}

function normalizeBoundEvidence(
  records: readonly HsiScientificCompanionBoundEvidence[] | undefined,
): HsiScientificCompanionBoundEvidence[] {
  if (!records || records.length === 0) return [];
  if (records.length > 12) throw Error("Companion live-evidence binding limited to 12 records");
  const out: HsiScientificCompanionBoundEvidence[] = [];
  for (const row of records) {
    const sourceId = row.sourceId?.trim() ?? "";
    const title = row.title?.trim() ?? "";
    const sourceUrl = row.sourceUrl?.trim() ?? "";
    if (!sourceId || sourceId.length > 200) throw Error("Invalid bound evidence sourceId");
    if (!title || title.length > 500) throw Error("Invalid bound evidence title");
    if (!sourceUrl || sourceUrl.length > 1000) throw Error("Invalid bound evidence sourceUrl");
    if (row.verificationState !== "metadata_retrieved_not_claim_verified") {
      throw Error("Bound evidence must stay metadata_retrieved_not_claim_verified");
    }
    if (row.reviewState !== "unreviewed") {
      throw Error("Bound evidence must stay unreviewed");
    }
    switch (row.provider) {
      case "europe-pmc":
      case "openalex":
      case "workspace":
        break;
      default: {
        const _exhaustive: never = row.provider;
        throw Error(`Unknown bound evidence provider: ${String(_exhaustive)}`);
      }
    }
    out.push({
      sourceId,
      title,
      provider: row.provider,
      sourceUrl,
      verificationState: "metadata_retrieved_not_claim_verified",
      reviewState: "unreviewed",
    });
  }
  return out;
}

function renderBoundEvidenceSection(
  records: readonly HsiScientificCompanionBoundEvidence[],
): {markdown: string; citations: HsiScientificCompanionCitation[]} {
  if (records.length === 0) return {markdown: "", citations: []};
  const citations: HsiScientificCompanionCitation[] = records.map((r) => ({
    kind: "live_evidence" as const,
    label: r.sourceId,
    detail: `${r.title} (${r.provider}; metadata only, not claim-verified)`,
  }));
  const lines = [
    ``,
    `### Bound public literature (caller-supplied)`,
    ``,
    `These records were supplied by the caller (for example from the investigation workspace). The companion did **not** retrieve them over the network in this turn. They remain metadata-only and unreviewed.`,
    ``,
  ];
  for (const r of records) {
    lines.push(`- **${r.title}** — \`${r.sourceId}\` via ${r.provider}`);
  }
  return {markdown: lines.join("\n"), citations};
}

function renderDiscuss(
  investigation: InterrogativeInvestigation,
): {markdown: string; citations: HsiScientificCompanionCitation[]} {
  const citations: HsiScientificCompanionCitation[] = [];
  const lines = [
    `## Companion discussion`,
    ``,
    `You asked: **${investigation.question}**`,
    ``,
    `Here is a text-first, evidence-planning discussion grounded in the Living Knowledge Graph interrogative path (not an unfenced model answer).`,
    ``,
    `### Candidate mechanisms to investigate`,
  ];
  for (const branch of investigation.branches) {
    lines.push(`- **${branch.statement}** — assessment: \`${branch.assessment}\``);
    citations.push({
      kind: "planned_mechanism",
      label: branch.id,
      detail: branch.statement,
    });
    for (const missing of branch.missingEvidence.slice(0, 2)) {
      citations.push({
        kind: "missing_evidence",
        label: branch.id,
        detail: missing,
      });
    }
  }
  lines.push(``, `### What is still missing`);
  const missing = [
    ...new Set(investigation.branches.flatMap((b) => b.missingEvidence)),
  ].slice(0, 6);
  for (const item of missing) lines.push(`- ${item}`);
  lines.push(
    ``,
    `### Conclusion (non-approved)`,
    investigation.conclusion.text,
  );
  return {markdown: lines.join("\n"), citations};
}

function renderCritique(
  investigation: InterrogativeInvestigation,
  falsification: ReturnType<typeof evaluateSscFalsification>,
): {markdown: string; citations: HsiScientificCompanionCitation[]} {
  const citations: HsiScientificCompanionCitation[] = [];
  const statementById = new Map(investigation.branches.map((b) => [b.id, b.statement]));
  const lines = [
    `## Companion critique`,
    ``,
    `You asked: **${investigation.question}**`,
    ``,
    `Critique uses the deterministic falsification engine over the planned investigation — not an avatar debate and not SME gold.`,
    ``,
    `### Branch pressure`,
  ];
  const opposingSignals = falsification.signals.filter(
    (s) => s.kind === "opposing_reviewed_claims" || s.kind === "context_divergence",
  ).length;
  for (const branch of falsification.branches) {
    const statement = statementById.get(branch.branchId) ?? branch.branchId;
    const localSignals = falsification.signals.filter((s) => s.branchId === branch.branchId).length;
    lines.push(
      `- **${statement}** — assessment \`${branch.assessment}\`; local signals: ${localSignals}`,
    );
    citations.push({
      kind: "planned_mechanism",
      label: branch.branchId,
      detail: `${statement} (${branch.assessment})`,
    });
    if (branch.falsificationTest) {
      citations.push({
        kind: "falsification_test",
        label: branch.branchId,
        detail: branch.falsificationTest,
      });
    }
  }
  lines.push(
    ``,
    `### Honesty`,
    `- Branches reviewed: ${falsification.branches.length}`,
    `- Contradiction / context signals recorded: ${opposingSignals}`,
    `- Scientific approval: **false**`,
  );
  return {markdown: lines.join("\n"), citations};
}

function renderExperimentPlanning(
  investigation: InterrogativeInvestigation,
): {markdown: string; citations: HsiScientificCompanionCitation[]} {
  const citations: HsiScientificCompanionCitation[] = [];
  const lines = [
    `## Companion experiment planning`,
    ``,
    `You asked: **${investigation.question}**`,
    ``,
    `Suggested next experiments are the falsification tests already attached to planned branches. They are **not** authorised protocols.`,
    ``,
    `### Testable next steps`,
  ];
  for (const branch of investigation.branches) {
    lines.push(`1. **${branch.statement}**`);
    lines.push(`   - Falsifier: ${branch.falsificationTest}`);
    citations.push({
      kind: "falsification_test",
      label: branch.id,
      detail: branch.falsificationTest,
    });
  }
  lines.push(
    ``,
    `Keep production writes disabled and require human review before any graph promotion.`,
  );
  return {markdown: lines.join("\n"), citations};
}

/**
 * Run one owner-authorized text-first Scientific Companion turn.
 * Optional U42 live-evidence binding requires the live-evidence approval envelope
 * and caller-supplied records (no network retrieval inside this function).
 */
export function runHsiScientificCompanionTurn(input: {
  authorization: HsiScientificCompanionOwnerApproval;
  mode: HsiScientificCompanionMode;
  question: string;
  actorPrincipal?: string;
  createdAt?: string;
  release?: QuestionPlanInput["release"];
  liveEvidence?: {
    authorization: HsiScientificCompanionLiveEvidenceOwnerApproval;
    records: readonly HsiScientificCompanionBoundEvidence[];
  };
}): HsiScientificCompanionTurnResult {
  assertHsiScientificCompanionOwnerAuthorized(input.authorization);
  const question = input.question.trim();
  if (!question || question.length > 500) throw Error("Invalid companion question");
  const actor = (input.actorPrincipal ?? "companion-researcher").trim();
  if (!actor || actor.length > 100) throw Error("Invalid companion actor");

  const wantsLiveEvidence =
    input.liveEvidence !== undefined &&
    (input.liveEvidence.records?.length ?? 0) > 0;
  let boundEvidence: HsiScientificCompanionBoundEvidence[] = [];
  let liveEvidenceAuthorization: HsiScientificCompanionLiveEvidenceOwnerApproval | null = null;
  if (wantsLiveEvidence) {
    assertHsiScientificCompanionLiveEvidenceOwnerAuthorized(input.liveEvidence!.authorization);
    boundEvidence = normalizeBoundEvidence(input.liveEvidence!.records);
    liveEvidenceAuthorization = HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL;
  } else if (input.liveEvidence !== undefined) {
    // Explicit empty binding still requires U42 approval so callers cannot
    // silently claim a live-evidence path without the envelope.
    assertHsiScientificCompanionLiveEvidenceOwnerAuthorized(input.liveEvidence.authorization);
    liveEvidenceAuthorization = HSI_SCIENTIFIC_COMPANION_LIVE_EVIDENCE_OWNER_APPROVAL;
  }

  const plan = planSscInterrogation({
    question,
    actorPrincipal: actor,
    createdAt: input.createdAt ?? new Date().toISOString(),
    dataClass: "public_biomedical",
    focus: "systemic_sclerosis",
    release: input.release ?? DEFAULT_RELEASE,
  });
  validateInterrogativeInvestigation(plan);

  let rendered: {markdown: string; citations: HsiScientificCompanionCitation[]};
  let falsificationSummary: HsiScientificCompanionTurnResult["falsificationSummary"] = null;

  switch (input.mode) {
    case "discuss":
      rendered = renderDiscuss(plan);
      break;
    case "critique": {
      const falsification = evaluateSscFalsification(plan);
      falsificationSummary = {
        branchCount: falsification.branches.length,
        insufficientEvidenceCount: falsification.branches.filter(
          (b) => b.assessment === "insufficient_evidence",
        ).length,
        opposingSignalCount: falsification.signals.filter(
          (s) => s.kind === "opposing_reviewed_claims" || s.kind === "context_divergence",
        ).length,
      };
      rendered = renderCritique(plan, falsification);
      break;
    }
    case "experiment_planning":
      rendered = renderExperimentPlanning(plan);
      break;
    default: {
      const _exhaustive: never = input.mode;
      throw Error(`Unknown companion mode: ${String(_exhaustive)}`);
    }
  }

  const evidenceSection = renderBoundEvidenceSection(boundEvidence);
  const replyMarkdown = rendered.markdown + evidenceSection.markdown;
  const citations = [...rendered.citations, ...evidenceSection.citations];

  const limitations = [
    ...BASE_LIMITATIONS,
    ...(boundEvidence.length > 0
      ? [
          "Caller-supplied literature metadata is bound into this turn; the companion did not retrieve it over the network.",
          "Bound records remain metadata_retrieved_not_claim_verified and unreviewed.",
        ]
      : []),
    ...plan.conclusion.limitations,
    ...citations.filter((c) => c.kind === "limitation").map((c) => c.detail),
  ];

  const honesty: HsiScientificCompanionHonesty = {
    scientificApproval: false,
    voiceEnabled: false,
    avatarEnabled: false,
    nuanceIntegrationApproved: false,
    networkingMatchingEnabled: false,
    llmUnfencedFreeText: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    phiAllowed: false,
    clinicalAdvice: false,
    productionWritesEnabled: false,
    restrictedPreviewClaimed: false,
    liveEvidenceBound: boundEvidence.length > 0,
    companionPerformedNetworkRetrieval: false,
    claimVerified: false,
  };
  assertHonesty(honesty);

  const servicesUsed: HsiScientificCompanionService[] = [
    "interrogativeQuestionEngine",
    "interrogativeFalsificationEngine",
  ];
  if (boundEvidence.length > 0) servicesUsed.push("caller_supplied_live_evidence");

  return {
    schemaVersion: HSI_SCIENTIFIC_COMPANION_RUNTIME_SCHEMA,
    authorization: HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
    liveEvidenceAuthorization,
    mode: input.mode,
    question,
    replyMarkdown,
    citations,
    limitations,
    investigation: plan,
    falsificationSummary,
    boundEvidence,
    servicesUsed,
    honesty,
  };
}
