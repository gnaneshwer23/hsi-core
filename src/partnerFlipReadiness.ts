/**
 * P0.2-HSI — Partner flip-readiness pack.
 *
 * Honest checklist of flipRequirements with current status fail|pending.
 * Never sets partnerSigned=true without a named partner confirmation.
 */

import { getPartnerLock, type HsiPartnerLock } from "./partnerLock";

export const PARTNER_FLIP_READINESS_SCHEMA =
  "hsi-partner-flip-readiness-1" as const;

export type FlipRequirementStatus = "pass" | "fail" | "pending";

export type FlipRequirementId =
  | "named_org"
  | "question_confirm"
  | "licensing"
  | "thresholds"
  | "shortlist_row"
  | "partner_signed_flip"
  | "outputs_refresh";

export type FlipRequirementRow = {
  id: FlipRequirementId;
  label: string;
  requirement: string;
  status: FlipRequirementStatus;
  evidence: string;
  blocksPartnerSigned: boolean;
};

export type PartnerFlipReadinessBundle = {
  schemaVersion: typeof PARTNER_FLIP_READINESS_SCHEMA;
  phase: "P0.2-HSI";
  notCds: true;
  containsPhi: false;
  generatedAt: string;
  /** Always false until named partner confirms — never invent. */
  partnerSigned: false;
  lockedPilot: false;
  scopeLocked: boolean;
  partner: {
    id: string;
    label: string;
    type: string;
    outreachStatus: string;
  } | null;
  disease: string | null;
  researchQuestion: string | null;
  flipRequirements: FlipRequirementRow[];
  summary: {
    total: number;
    pass: number;
    fail: number;
    pending: number;
    readyToFlipPartnerSigned: false;
    blockingIds: FlipRequirementId[];
  };
  nextHumanActions: string[];
  honesty: string[];
};

function buildRows(lock: HsiPartnerLock): FlipRequirementRow[] {
  const partner = lock.partner;
  const isNamed =
    partner?.type === "named_partner" &&
    partner.outreachStatus === "confirmed";
  const shortlistHasNamedRow = false; // tracking table still category-only

  return [
    {
      id: "named_org",
      label: "Named partner organisation",
      requirement:
        "Named partner confirms disease = rheumatoid arthritis (or explicitly chooses a different disease — then re-lock scope).",
      status: isNamed ? "pass" : "fail",
      evidence: isNamed
        ? `partner.id=${partner!.id} type=named_partner`
        : `Current partner is outreach category only (${partner?.id ?? "none"}); type=${partner?.type ?? "none"}; outreachStatus=${partner?.outreachStatus ?? "none"}.`,
      blocksPartnerSigned: true,
    },
    {
      id: "question_confirm",
      label: "Research question confirmation",
      requirement:
        "Named partner confirms or rewrites the research question in their words.",
      status: "fail",
      evidence:
        "Working Stage 1 question is scope-locked engineering text only — no written partner confirmation recorded.",
      blocksPartnerSigned: true,
    },
    {
      id: "licensing",
      label: "Source licensing / attribution",
      requirement:
        "Agree source licensing / attribution for the partner source set.",
      status: "pending",
      evidence:
        "hsi-source-licensing-stub.json lists pack PMIDs with licenseStatus=needs_review — partner agreement still open.",
      blocksPartnerSigned: true,
    },
    {
      id: "thresholds",
      label: "Numeric review thresholds",
      requirement:
        "Agree scientific review rubric thresholds (time saved, usefulness, rejections) with the partner.",
      status: "pending",
      evidence:
        "hsi-pilot-review-rubric.* framing exists; cut-offs TBD with partner (blockedOnPartner).",
      blocksPartnerSigned: true,
    },
    {
      id: "shortlist_row",
      label: "Shortlist tracking row",
      requirement:
        "Record real outreach row in ISI_PILOT_PARTNER_SHORTLIST.md (org, type, region, status) — still no invented emails.",
      status: shortlistHasNamedRow ? "pass" : "fail",
      evidence:
        "docs/ISI_PILOT_PARTNER_SHORTLIST.md still shows category row awaiting_named_partner; no confirmed named org row.",
      blocksPartnerSigned: true,
    },
    {
      id: "partner_signed_flip",
      label: "Flip partnerSigned / lockedPilot",
      requirement:
        "Set partnerSigned=true, lockedPilot=true (scopeLocked already true), status=scoping|active, partner.type=named_partner, partner.outreachStatus=confirmed.",
      status: "fail",
      evidence: `partnerSigned=${lock.partnerSigned}; lockedPilot=${lock.lockedPilot}; status=${lock.status} — correctly false until named confirm.`,
      blocksPartnerSigned: true,
    },
    {
      id: "outputs_refresh",
      label: "Refresh outputs after sign",
      requirement:
        "Re-run bun run outputs and refresh the pilot evidence pack + review rubric against the signed question.",
      status: "pending",
      evidence:
        "Blocked until partnerSigned flip; regenerable publish path already green for unsigned scope.",
      blocksPartnerSigned: false,
    },
  ];
}

export function buildPartnerFlipReadinessBundle(opts?: {
  generatedAt?: string;
  lock?: HsiPartnerLock;
}): PartnerFlipReadinessBundle {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = opts?.lock ?? getPartnerLock();
  const flipRequirements = buildRows(lock);

  const pass = flipRequirements.filter((r) => r.status === "pass").length;
  const fail = flipRequirements.filter((r) => r.status === "fail").length;
  const pending = flipRequirements.filter((r) => r.status === "pending").length;
  const blockingIds = flipRequirements
    .filter((r) => r.blocksPartnerSigned && r.status !== "pass")
    .map((r) => r.id);

  return {
    schemaVersion: PARTNER_FLIP_READINESS_SCHEMA,
    phase: "P0.2-HSI",
    notCds: true,
    containsPhi: false,
    generatedAt,
    partnerSigned: false,
    lockedPilot: false,
    scopeLocked: lock.scopeLocked,
    partner: lock.partner
      ? {
          id: lock.partner.id,
          label: lock.partner.label,
          type: lock.partner.type,
          outreachStatus: lock.partner.outreachStatus,
        }
      : null,
    disease: lock.disease?.label ?? null,
    researchQuestion: lock.researchQuestion,
    flipRequirements,
    summary: {
      total: flipRequirements.length,
      pass,
      fail,
      pending,
      readyToFlipPartnerSigned: false,
      blockingIds,
    },
    nextHumanActions: [
      "Name a real partner organisation (or rewrite disease/question with them) — do not invent org/email in code.",
      "Record outreach row in docs/ISI_PILOT_PARTNER_SHORTLIST.md when interest is real.",
      "Agree licensing for the PMID corpus (promote rows in hsi-source-licensing-stub beyond needs_review).",
      "Agree numeric rubric thresholds; refresh hsi-pilot-review-rubric.*.",
      "Only then flip partnerSigned=true / lockedPilot=true in partnerLock.ts and re-run bun run outputs.",
      "ISI product wiring (immunecity consume of this contract) remains OUT OF REPO.",
    ],
    honesty: [
      "readyToFlipPartnerSigned is always false until named_org + question_confirm + shortlist_row pass.",
      "This pack must never set partnerSigned=true by itself.",
      "scopeLocked=true is engineering lock only — not a MoU.",
      "Technical adapter spikes do not satisfy flipRequirements.",
    ],
  };
}

export function serializePartnerFlipReadiness(
  bundle: PartnerFlipReadinessBundle,
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializePartnerFlipReadinessMarkdown(
  bundle: PartnerFlipReadinessBundle,
): string {
  const lines = [
    "# Partner flip-readiness (P0.2-HSI)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · generated ${bundle.generatedAt}`,
    "",
    `**partnerSigned=${bundle.partnerSigned}** · **lockedPilot=${bundle.lockedPilot}** · **scopeLocked=${bundle.scopeLocked}** · **readyToFlip=false**`,
    "",
    `Disease: ${bundle.disease ?? "TBD"}`,
    "",
    `Partner: ${bundle.partner?.id ?? "none"} (${bundle.partner?.type ?? "n/a"} · ${bundle.partner?.outreachStatus ?? "n/a"})`,
    "",
    "## Flip requirements",
    "",
    "| Id | Status | Blocks signed? | Evidence |",
    "|----|--------|----------------|----------|",
  ];
  for (const r of bundle.flipRequirements) {
    lines.push(
      `| \`${r.id}\` | **${r.status}** | ${r.blocksPartnerSigned} | ${r.evidence} |`,
    );
  }
  lines.push(
    "",
    `Summary: pass=${bundle.summary.pass} · fail=${bundle.summary.fail} · pending=${bundle.summary.pending}`,
    "",
    "Blocking ids: " +
      bundle.summary.blockingIds.map((id) => `\`${id}\``).join(", "),
    "",
    "## Next human actions",
    "",
  );
  for (const a of bundle.nextHumanActions) {
    lines.push(`- ${a}`);
  }
  lines.push("", "## Honesty", "");
  for (const h of bundle.honesty) {
    lines.push(`- ${h}`);
  }
  lines.push("");
  return lines.join("\n");
}
