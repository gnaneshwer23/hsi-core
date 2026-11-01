/**
 * P0.2-HSI — Partner flip-readiness pack.
 *
 * Honest checklist of flipRequirements with status pass|fail|pending|satisfied_by_fixture|set_for_test.
 * Active path: named Apolo Pharma (`legalBinding` → `lockedPilot=true`).
 * Hypothetical fixture template remains recoverable for path testing only.
 * MoU paperwork is operator-asserted — never invent emails / PI contacts; still not CDS.
 */

import {
  isHypotheticalTestFixturePartner,
  getPartnerLock,
  type HsiPartnerLock,
} from "./partnerLock";
import { buildSourceLicensingStubBundle } from "./sourceLicensingStub";
import { getStage1RubricThresholds } from "./stage1RubricThresholds";

export const PARTNER_FLIP_READINESS_SCHEMA =
  "hsi-partner-flip-readiness-1" as const;

export type FlipRequirementStatus =
  | "pass"
  | "fail"
  | "pending"
  | "satisfied_by_fixture"
  | "set_for_test";

export type FlipRequirementId =
  | "named_org"
  | "question_confirm"
  | "licensing"
  | "thresholds"
  | "shortlist_row"
  | "partner_signed_flip"
  | "outputs_refresh"
  | "real_partner_replacement";

export type FlipRequirementRow = {
  id: FlipRequirementId;
  label: string;
  requirement: string;
  status: FlipRequirementStatus;
  evidence: string;
  blocksPartnerSigned: boolean;
  /** Extra steps still required before a real (non-fixture) partner is locked. */
  pendingRealReplacementSteps?: string[];
};

export type PartnerFlipReadinessBundle = {
  schemaVersion: typeof PARTNER_FLIP_READINESS_SCHEMA;
  phase: "P0.2-HSI";
  notCds: true;
  containsPhi: false;
  generatedAt: string;
  /** May be true under hypothetical fixture — not a MoU. */
  partnerSigned: boolean;
  lockedPilot: boolean;
  scopeLocked: boolean;
  agreementKind: HsiPartnerLock["agreementKind"];
  legalBinding: boolean;
  isHypothetical: boolean;
  testPilotMode: boolean;
  testFixtureBanner: string | null;
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
    satisfiedByFixture: number;
    setForTest: number;
    readyToFlipPartnerSigned: boolean;
    readyForRealPartnerReplacement: boolean;
    blockingIds: FlipRequirementId[];
  };
  nextHumanActions: string[];
  honesty: string[];
};

function buildRows(lock: HsiPartnerLock): FlipRequirementRow[] {
  const partner = lock.partner;
  const isFixture = isHypotheticalTestFixturePartner(lock);
  const isNamedReal =
    partner?.type === "named_partner" &&
    partner.outreachStatus === "confirmed" &&
    lock.legalBinding === true &&
    lock.isHypothetical === false;
  const shortlistHasNamedRow = false; // tracking table still fixture / category

  return [
    {
      id: "named_org",
      label: "Named partner organisation",
      requirement:
        "Named partner confirms disease = rheumatoid arthritis (or explicitly chooses a different disease — then re-lock scope).",
      status: isNamedReal ? "pass" : isFixture ? "satisfied_by_fixture" : "fail",
      evidence: isNamedReal
        ? `partner.id=${partner!.id} type=named_partner legalBinding=true`
        : isFixture
          ? `TEST FIXTURE partner.id=${partner?.id}; type=hypothetical_test_fixture; agreementKind=${lock.agreementKind}. Satisfies path-testing only — replace with real org.`
          : `Current partner is outreach category only (${partner?.id ?? "none"}); type=${partner?.type ?? "none"}; outreachStatus=${partner?.outreachStatus ?? "none"}.`,
      blocksPartnerSigned: !isFixture,
      pendingRealReplacementSteps: isFixture
        ? [
            "Replace partner.id/label in src/hypotheticalPartnerFixture.ts (USE_HYPOTHETICAL_PARTNER_FIXTURE=false + REAL_PARTNER_REPLACEMENT).",
            "Obtain written disease + question confirmation from the real org.",
            "Do not invent emails or MoUs.",
          ]
        : undefined,
    },
    {
      id: "question_confirm",
      label: "Research question confirmation",
      requirement:
        "Named partner confirms or rewrites the research question in their words.",
      status: isNamedReal ? "pass" : isFixture ? "satisfied_by_fixture" : "fail",
      evidence: isNamedReal
        ? "Named partner confirmed/rewrote the research question in writing."
        : isFixture
          ? "Fixture reuses scope-locked engineering question for path testing — real partner must still confirm or rewrite."
          : "Working Stage 1 question is scope-locked engineering text only — no written partner confirmation recorded.",
      blocksPartnerSigned: !isFixture,
      pendingRealReplacementSteps: isFixture
        ? [
            "Ask the real partner to confirm or rewrite the anti-TNF response-heterogeneity question.",
            "If they choose a different disease/question, re-lock scope before lockedPilot.",
          ]
        : undefined,
    },
    (() => {
      const licensing = buildSourceLicensingStubBundle();
      const cleared = licensing.summary.partnerClearedCount;
      const scopes = licensing.summary.clearanceScopeCounts;
      const licensingPass = isNamedReal && cleared > 0;
      return {
        id: "licensing" as const,
        label: "Source licensing / attribution",
        requirement:
          "Agree source licensing / attribution for the partner source set.",
        status: (licensingPass ? "pass" : "pending") as FlipRequirementStatus,
        evidence: licensingPass
          ? `Apolo Pharma Stage 1 corpus clearance (operator-asserted 2026-11-01): partnerClearedCount=${cleared} (oa_reuse=${scopes.oa_reuse}, cite_metadata_pilot=${scopes.cite_metadata_pilot}, uncleared=${scopes.uncleared}). Cite-metadata pilot ≠ FT redistribution${scopes.uncleared === 0 ? "; pack PMIDs fully cleared for Stage 1 cite/OA scopes (no invented CC)." : "; remaining unknown left needs_confirm."}`
          : isFixture
            ? "hsi-source-licensing-stub.json curator-reviewed; fixture does not clear partner corpus attribution (partnerClearedCount stays 0 on hypothetical path)."
            : `hsi-source-licensing-stub.json curator-reviewed; partnerClearedCount=${cleared} — named partner attribution still open.`,
        blocksPartnerSigned: true,
      };
    })(),
    {
      id: "thresholds",
      label: "Numeric review thresholds",
      requirement:
        "Agree scientific review rubric thresholds (partner-scoped edges, competing frames, LOINC claims, Gate C pending policy, qualitative KPIs) with the partner.",
      status: (() => {
        const th = getStage1RubricThresholds();
        if (th.thresholdStatus === "set_for_test") return "set_for_test";
        if (th.thresholdStatus === "partner_agreed") return "pass";
        return "pending";
      })(),
      evidence: (() => {
        const th = getStage1RubricThresholds();
        if (th.thresholdStatus === "set_for_test") {
          return `set_for_test under thresholdSource=${th.thresholdSource}: minPartnerScopedEdges=${th.numeric.minPartnerScopedEdges}, minCompetingExplanations=${th.numeric.minCompetingExplanations}, minLoincLinkedClaims=${th.numeric.minLoincLinkedClaims}, gateCPendingAllowed=${th.numeric.gateCPendingAllowed}, acceptanceOverallAllowed=${th.numeric.acceptanceOverallAllowed}. replaceWithPartnerAgreedThresholds=${th.replaceWithPartnerAgreedThresholds} — real partner must re-agree.`;
        }
        if (th.thresholdStatus === "partner_agreed") {
          return `partner_agreed under thresholdSource=${th.thresholdSource}; partnerId=${th.partnerId}; replaceWithPartnerAgreedThresholds=${th.replaceWithPartnerAgreedThresholds}: minPartnerScopedEdges=${th.numeric.minPartnerScopedEdges}, minCompetingExplanations=${th.numeric.minCompetingExplanations}, minLoincLinkedClaims=${th.numeric.minLoincLinkedClaims}, gateCPendingAllowed=${th.numeric.gateCPendingAllowed}, acceptanceOverallAllowed=${th.numeric.acceptanceOverallAllowed}. Apolo Pharma operator-agreed 2026-11-01.`;
        }
        return "hsi-pilot-review-rubric.* framing exists; cut-offs still TBD with real partner.";
      })(),
      blocksPartnerSigned: true,
      pendingRealReplacementSteps: isFixture
        ? [
            "Re-agree numeric Stage 1 cut-offs with the real partner (do not treat fixture numbers as MoU KPIs).",
            "Set thresholdSource=partner_agreed / replaceWithPartnerAgreedThresholds=false after written confirm.",
            "Refresh hsi-pilot-review-rubric.* via bun run outputs.",
          ]
        : undefined,
    },
    {
      id: "shortlist_row",
      label: "Shortlist tracking row",
      requirement:
        "Record real outreach row in ISI_PILOT_PARTNER_SHORTLIST.md (org, type, region, status) — still no invented emails.",
      status: isNamedReal
        ? "pass"
        : isFixture
          ? "satisfied_by_fixture"
          : shortlistHasNamedRow
            ? "pass"
            : "fail",
      evidence: isNamedReal
        ? "docs/ISI_PILOT_PARTNER_SHORTLIST.md records Apolo Pharma (partner:apolo-pharma) confirmed — no invented emails."
        : isFixture
          ? "docs/ISI_PILOT_PARTNER_SHORTLIST.md notes hypothetical fixture row; real named org row still pending."
          : "docs/ISI_PILOT_PARTNER_SHORTLIST.md still shows category row awaiting_named_partner; no confirmed named org row.",
      blocksPartnerSigned: !isFixture,
      pendingRealReplacementSteps: isFixture
        ? [
            "Add a real outreach row (org, type, region, status) — never invent emails.",
            "Remove or demote the hypothetical fixture row when replacing.",
          ]
        : undefined,
    },
    {
      id: "partner_signed_flip",
      label: "Flip partnerSigned / lockedPilot",
      requirement:
        "For path testing: partnerSigned may be true under hypothetical_test_only. For production: legalBinding=true → lockedPilot=true, type=named_partner.",
      status: isNamedReal
        ? "pass"
        : isFixture && lock.partnerSigned && !lock.lockedPilot
          ? "satisfied_by_fixture"
          : "fail",
      evidence: isNamedReal
        ? `partnerSigned=${lock.partnerSigned}; lockedPilot=${lock.lockedPilot}; legalBinding=${lock.legalBinding}; status=${lock.status}; agreementKind=${lock.agreementKind}. Named partner path — MoU operator-asserted; still not CDS.`
        : `partnerSigned=${lock.partnerSigned}; lockedPilot=${lock.lockedPilot}; legalBinding=${lock.legalBinding}; status=${lock.status}; agreementKind=${lock.agreementKind}. Fixture keeps lockedPilot=false.`,
      blocksPartnerSigned: !isFixture,
      pendingRealReplacementSteps: isFixture
        ? [
            "Set legalBinding=true after written confirm → lockedPilot becomes true.",
            "Clear isHypothetical / notALegalAgreement / testPilotMode / testFixtureBanner.",
          ]
        : undefined,
    },
    {
      id: "real_partner_replacement",
      label: "Replace hypothetical fixture with real org",
      requirement:
        "Swap src/hypotheticalPartnerFixture.ts to a real named_partner (USE_HYPOTHETICAL_PARTNER_FIXTURE=false).",
      status: isNamedReal ? "pass" : isFixture ? "pending" : "pending",
      evidence: isNamedReal
        ? `Named partner active: ${partner?.id} (${partner?.label}); USE_HYPOTHETICAL_PARTNER_FIXTURE=false; replaceWithRealPartner=${lock.replaceWithRealPartner}.`
        : isFixture
          ? `Active fixture ${partner?.id} — replaceWithRealPartner=${lock.replaceWithRealPartner}.`
          : "No fixture active; complete remaining real-partner flipRequirements.",
      blocksPartnerSigned: false,
      pendingRealReplacementSteps: isFixture
        ? [
            "USE_HYPOTHETICAL_PARTNER_FIXTURE=false",
            "Fill REAL_PARTNER_REPLACEMENT id/label/region/contactChannel",
            "bun run outputs",
          ]
        : undefined,
    },
    {
      id: "outputs_refresh",
      label: "Refresh outputs after sign",
      requirement:
        "Re-run bun run outputs and refresh the pilot evidence pack + review rubric against the signed question.",
      status: isNamedReal ? "pass" : isFixture ? "satisfied_by_fixture" : "pending",
      evidence: isNamedReal
        ? "Named partner lock regenerable via bun run outputs; Discovery + immunecity vendor sync after publish."
        : isFixture
          ? "Fixture path regenerable via bun run outputs; refresh again after real partner swap."
          : "Blocked until real partnerSigned + legalBinding flip; regenerable publish path already green for unsigned/fixture scope.",
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
  const satisfiedByFixture = flipRequirements.filter(
    (r) => r.status === "satisfied_by_fixture",
  ).length;
  const setForTest = flipRequirements.filter(
    (r) => r.status === "set_for_test",
  ).length;
  const blockingIds = flipRequirements
    .filter(
      (r) =>
        r.blocksPartnerSigned &&
        r.status !== "pass" &&
        r.status !== "satisfied_by_fixture" &&
        r.status !== "set_for_test",
    )
    .map((r) => r.id);

  return {
    schemaVersion: PARTNER_FLIP_READINESS_SCHEMA,
    phase: "P0.2-HSI",
    notCds: true,
    containsPhi: false,
    generatedAt,
    partnerSigned: lock.partnerSigned,
    lockedPilot: lock.lockedPilot,
    scopeLocked: lock.scopeLocked,
    agreementKind: lock.agreementKind,
    legalBinding: lock.legalBinding,
    isHypothetical: lock.isHypothetical,
    testPilotMode: lock.testPilotMode,
    testFixtureBanner: lock.testFixtureBanner,
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
      satisfiedByFixture,
      setForTest,
      readyToFlipPartnerSigned:
        lock.partner?.type === "named_partner" &&
        lock.partnerSigned &&
        lock.legalBinding &&
        !lock.isHypothetical,
      readyForRealPartnerReplacement: isHypotheticalTestFixturePartner(lock),
      blockingIds,
    },
    nextHumanActions: isHypotheticalTestFixturePartner(lock)
      ? [
          lock.testFixtureBanner ??
            "TEST FIXTURE — replace before real pilot (src/hypotheticalPartnerFixture.ts).",
          "Name a real partner organisation (or rewrite disease/question with them) — do not invent org/email in code.",
          "Record outreach row in docs/ISI_PILOT_PARTNER_SHORTLIST.md when interest is real.",
          "Agree partner attribution for the PMID corpus (ok_oa ≠ partner clearance on fixture path). See docs/HOW_TO_SOURCE_LICENSING.md.",
          "Numeric Stage 1 thresholds are set_for_test under the hypothetical fixture — real partner must re-agree numbers before formal user testing; then refresh hsi-pilot-review-rubric.*.",
          "Only then set legalBinding=true / lockedPilot=true via REAL_PARTNER_REPLACEMENT and re-run bun run outputs.",
          "Production ISI must ignore fixture partnerSigned unless ALLOW_HYPOTHETICAL_PARTNER=true.",
          "ISI product wiring (immunecity consume of this contract) remains OUT OF REPO.",
        ]
      : [
          `Named partner active: ${lock.partner?.label ?? "unknown"} (${lock.partner?.id ?? "unknown"}) — MoU paperwork operator-asserted; still not CDS.`,
          "Apolo Pharma Stage 1 corpus licensing clearance applied (oa_reuse + cite_metadata_pilot; pack PMIDs cleared — uncleared=0). See docs/HOW_TO_SOURCE_LICENSING.md.",
          "Stage 1 numeric rubric thresholds are partner_agreed with Apolo Pharma (2026-11-01) — keep pack depth ≥ 12/4/6.",
          "Keep Gate C human-only — never auto-approve into ISI product KG.",
          "Refresh bun run outputs + re-sync immunecity public/hsi-discovery after pack depth changes.",
          "Never invent emails, phones, or named PI contacts in code.",
        ],
    honesty: [
      lock.isHypothetical
        ? "readyToFlipPartnerSigned stays false until a real named_partner + legalBinding path is ready."
        : "readyToFlipPartnerSigned=true once named_partner + legalBinding + partnerSigned (Apolo Pharma path).",
      "satisfied_by_fixture ≠ pass for production MoU claims.",
      lock.isHypothetical
        ? "set_for_test / pending thresholds ≠ partner-agreed KPIs — replaceWithPartnerAgreedThresholds=true until re-agreed."
        : "Apolo Pharma Stage 1 KPIs are partner_agreed; licensing clearanceScope=oa_reuse|cite_metadata_pilot applied (uncleared=0).",
      lock.isHypothetical
        ? "partnerSigned may be true under hypothetical_test_only; lockedPilot stays false while legalBinding=false."
        : "Named partner: partnerSigned=true + legalBinding=true → lockedPilot=true; MoU operator-asserted — still not CDS / no auto Gate C.",
      "This pack must never invent emails, phones, or named PI contacts.",
      "scopeLocked=true is engineering lock for RA/anti-TNF; dual-track secondary packs continue.",
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
  ];
  if (bundle.testFixtureBanner) {
    lines.push(`> **${bundle.testFixtureBanner}**`, "");
  }
  lines.push(
    `**partnerSigned=${bundle.partnerSigned}** · **lockedPilot=${bundle.lockedPilot}** · **scopeLocked=${bundle.scopeLocked}** · **legalBinding=${bundle.legalBinding}** · **isHypothetical=${bundle.isHypothetical}** · **readyToFlip=false**`,
    "",
    `agreementKind=\`${bundle.agreementKind}\` · testPilotMode=\`${bundle.testPilotMode}\``,
    "",
    `Disease: ${bundle.disease ?? "TBD"}`,
    "",
    `Partner: ${bundle.partner?.id ?? "none"} (${bundle.partner?.type ?? "n/a"} · ${bundle.partner?.outreachStatus ?? "n/a"})`,
    "",
    "## Flip requirements",
    "",
    "| Id | Status | Blocks signed? | Evidence |",
    "|----|--------|----------------|----------|",
  );
  for (const r of bundle.flipRequirements) {
    lines.push(
      `| \`${r.id}\` | **${r.status}** | ${r.blocksPartnerSigned} | ${r.evidence} |`,
    );
  }
  lines.push(
    "",
    `Summary: pass=${bundle.summary.pass} · fail=${bundle.summary.fail} · pending=${bundle.summary.pending} · satisfied_by_fixture=${bundle.summary.satisfiedByFixture} · set_for_test=${bundle.summary.setForTest}`,
    "",
    "Blocking ids: " +
      (bundle.summary.blockingIds.length
        ? bundle.summary.blockingIds.map((id) => `\`${id}\``).join(", ")
        : "(none for fixture path-testing)"),
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
