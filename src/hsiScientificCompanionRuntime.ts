/** Owner-authorized HSI Scientific Companion runtime (U41).
 *
 * Text-first conversational turns grounded in existing interrogative /
 * evidence services (Living Knowledge Graph planning path). Deterministic —
 * no unfenced LLM free-text, no voice, no avatar, no networking.
 *
 * Modes:
 * - discuss: plan mechanisms + missing evidence
 * - critique: falsification / disagreement surface
 * - experiment_planning: falsification tests as next experiments
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

export const HSI_SCIENTIFIC_COMPANION_RUNTIME_SCHEMA =
  "hsi-scientific-companion-runtime-1" as const;

export type HsiScientificCompanionMode =
  | "discuss"
  | "critique"
  | "experiment_planning";

export type HsiScientificCompanionCitation = {
  kind: "planned_mechanism" | "falsification_test" | "missing_evidence" | "limitation";
  label: string;
  detail: string;
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
};

export type HsiScientificCompanionTurnResult = {
  schemaVersion: typeof HSI_SCIENTIFIC_COMPANION_RUNTIME_SCHEMA;
  authorization: HsiScientificCompanionOwnerApproval;
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
  servicesUsed: readonly [
    "interrogativeQuestionEngine",
    "interrogativeFalsificationEngine",
  ];
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
    honesty.restrictedPreviewClaimed !== false
  ) {
    throw Error("Scientific companion honesty flags must remain fail-closed");
  }
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
 */
export function runHsiScientificCompanionTurn(input: {
  authorization: HsiScientificCompanionOwnerApproval;
  mode: HsiScientificCompanionMode;
  question: string;
  actorPrincipal?: string;
  createdAt?: string;
  release?: QuestionPlanInput["release"];
}): HsiScientificCompanionTurnResult {
  assertHsiScientificCompanionOwnerAuthorized(input.authorization);
  const question = input.question.trim();
  if (!question || question.length > 500) throw Error("Invalid companion question");
  const actor = (input.actorPrincipal ?? "companion-researcher").trim();
  if (!actor || actor.length > 100) throw Error("Invalid companion actor");

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

  const limitations = [
    ...BASE_LIMITATIONS,
    ...plan.conclusion.limitations,
    ...rendered.citations
      .filter((c) => c.kind === "limitation")
      .map((c) => c.detail),
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
  };
  assertHonesty(honesty);

  return {
    schemaVersion: HSI_SCIENTIFIC_COMPANION_RUNTIME_SCHEMA,
    authorization: HSI_SCIENTIFIC_COMPANION_OWNER_APPROVAL,
    mode: input.mode,
    question,
    replyMarkdown: rendered.markdown,
    citations: rendered.citations,
    limitations,
    investigation: plan,
    falsificationSummary,
    servicesUsed: ["interrogativeQuestionEngine", "interrogativeFalsificationEngine"],
    honesty,
  };
}
