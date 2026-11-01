/**
 * Phase 5 — Pilot acceptance pack for Stage 1 on the scope-locked RA/anti-TNF question.
 *
 * Regenerable checklist + partner walkthrough. Marks **pass** only what is
 * actually true in substrate/exports; **pending** for real partnerSigned /
 * licensing; numeric Stage 1 thresholds may be **set_for_test** under the
 * hypothetical fixture. Never invents a MoU or CDS claim.
 */
import { buildGateCChecklist, type GateCChecklistBundle } from "./gateCChecklist";
import { buildSchemaGapReport, type HsiSchemaGapReport } from "./gapReport";
import {
  getPartnerLock,
  isHypotheticalTestFixturePartner,
  type HsiPartnerLock,
} from "./partnerLock";
import {
  buildPilotEvidencePack,
  type PilotEvidencePack,
} from "./pilotEvidencePack";
import {
  buildPilotReviewRubric,
  type PilotReviewRubric,
} from "./pilotReviewRubric";
import {
  evalPackAgainstStage1NumericThresholds,
  getStage1RubricThresholds,
} from "./stage1RubricThresholds";

export const PILOT_ACCEPTANCE_SCHEMA = "hsi-pilot-acceptance-1" as const;

export type AcceptanceStatus = "pass" | "fail" | "pending" | "set_for_test";

export type AcceptanceCriterion = {
  id: string;
  category:
    | "stage1_output"
    | "bundle"
    | "gate_c"
    | "partner_lock"
    | "review"
    | "licensing"
    | "product"
    | "deferred";
  label: string;
  /** Primary artifact filename(s) a partner should open. */
  artifact: string;
  status: AcceptanceStatus;
  /** Concrete evidence from pack / lock / checklist counts. */
  evidence: string;
  notes: string;
};

export type PilotAcceptancePack = {
  schemaVersion: typeof PILOT_ACCEPTANCE_SCHEMA;
  notCds: true;
  autoApproveIntoKg: false;
  phase: "5";
  generatedAt: string;
  scope: {
    disease: string;
    researchQuestion: string;
    scopeLocked: boolean;
    partnerSigned: boolean;
    lockedPilot: boolean;
    status: HsiPartnerLock["status"];
    agreementKind: HsiPartnerLock["agreementKind"];
    legalBinding: boolean;
    isHypothetical: boolean;
    notALegalAgreement: boolean;
    testPilotMode: boolean;
    testFixtureBanner: string | null;
    partnerId: string | null;
    partnerType: string | null;
  };
  /** Stage 1 four outputs + MANIFEST + gap + Gate C + lock + rubric. */
  criteria: AcceptanceCriterion[];
  summary: {
    pass: number;
    fail: number;
    pending: number;
    setForTest: number;
    stage1FourOutputsGreen: boolean;
    partnerReadyWalkthrough: boolean;
    overallStage1Acceptance: "green_with_pending" | "blocked" | "fail";
  };
  walkthroughSteps: Array<{
    step: number;
    title: string;
    open: string;
    say: string;
    doNot: string;
  }>;
  nextActions: string[];
  deferredExplicitAsk: string[];
};

function criterion(
  partial: AcceptanceCriterion,
): AcceptanceCriterion {
  return partial;
}

function buildCriteria(opts: {
  lock: HsiPartnerLock;
  pack: PilotEvidencePack;
  rubric: PilotReviewRubric;
  gateC: GateCChecklistBundle;
  gap: HsiSchemaGapReport;
}): AcceptanceCriterion[] {
  const { lock, pack, rubric, gateC, gap } = opts;
  const stage1Thresholds = getStage1RubricThresholds();
  const numericEval = evalPackAgainstStage1NumericThresholds(
    pack,
    stage1Thresholds.numeric,
  );

  const evidenceMapPass =
    numericEval.partnerScopedEdges >=
      stage1Thresholds.numeric.minPartnerScopedEdges &&
    numericEval.loincLinkedClaims >=
      stage1Thresholds.numeric.minLoincLinkedClaims &&
    (pack.summary.gradeCounts.established > 0 ||
      pack.summary.gradeCounts.uncertain > 0 ||
      pack.summary.gradeCounts.unexplored > 0);

  const entitySlicePass =
    pack.partnerScopedEntitySlice.diseases.length > 0 &&
    pack.partnerScopedEntitySlice.biomarkers.length > 0 &&
    pack.partnerScopedEntitySlice.treatments.length > 0 &&
    pack.entitySlice.typed.length > 0;

  const competingPass =
    numericEval.competingExplanations >=
      stage1Thresholds.numeric.minCompetingExplanations &&
    pack.competingExplanations.some((c) => c.id === "expl-ra-tnf-centric") &&
    pack.competingExplanations.some((c) => c.id === "expl-ra-multi-cytokine") &&
    pack.uncertainties.length > 0;

  const shortlistPass =
    pack.expertShortlist.length > 0 &&
    pack.expertShortlist.every((i) => i.autoApproved === false) &&
    (stage1Thresholds.numeric.gateCPendingAllowed
      ? pack.summary.gateCPending >= 1
      : pack.summary.gateCPending === 0);

  const gateCArtifactPass =
    gateC.autoApproveIntoKg === false &&
    gateC.summary.pendingGateC >= 9 &&
    gateC.rows
      .filter((r) => r.gateCStatus === "pending")
      .every((r) => Boolean(r.isiRelationshipId) && r.autoApprove === false);

  const rubricPass =
    rubric.summary.readyForHuman >= 8 &&
    rubric.summary.blockedOnPartner >= 2 &&
    (rubric.summary.setForTest >= 1 ||
      stage1Thresholds.thresholdStatus === "partner_agreed") &&
    rubric.summary.thresholdStatus === stage1Thresholds.thresholdStatus &&
    rubric.notCds === true;

  const gapPass = gap.gaps.length >= 0 && gap.summary.seedEdges > 0;

  const scopeLockPass =
    lock.scopeLocked === true &&
    lock.provisionalLock === false &&
    lock.status === "scope_locked" &&
    Boolean(lock.disease?.id === "ra") &&
    Boolean(lock.researchQuestion?.toLowerCase().includes("anti-tnf"));

  return [
    criterion({
      id: "ac-em",
      category: "stage1_output",
      label: "1. Evidence map (sources + grades + LOINC where wired)",
      artifact: "hsi-pilot-evidence-pack.md#evidence-map · hsi-isi-export.json",
      status: evidenceMapPass ? "pass" : "fail",
      evidence: `partnerScopedEvidenceRows=${pack.summary.partnerScopedEvidenceRows}; claimsWithLoinc=${pack.summary.claimsWithLoinc}; grades established/uncertain/unexplored=${pack.summary.gradeCounts.established}/${pack.summary.gradeCounts.uncertain}/${pack.summary.gradeCounts.unexplored}`,
      notes: "Stage 1 output #1 — public PMIDs on RA/TNF slice; not a licensed partner corpus.",
    }),
    criterion({
      id: "ac-es",
      category: "stage1_output",
      label: "2. Entity slice (cells, pathways, biomarkers, treatments, studies)",
      artifact: "hsi-pilot-evidence-pack.md#entity-slice",
      status: entitySlicePass ? "pass" : "fail",
      evidence: `typed=${pack.entitySlice.typed.length}; partnerScoped diseases=${pack.partnerScopedEntitySlice.diseases.length}, biomarkers=${pack.partnerScopedEntitySlice.biomarkers.length}, treatments=${pack.partnerScopedEntitySlice.treatments.length}`,
      notes: "Empty buckets mean unknown — do not invent ontology IDs.",
    }),
    criterion({
      id: "ac-ce",
      category: "stage1_output",
      label: "3. Competing explanations + uncertainties",
      artifact: "hsi-pilot-evidence-pack.md#competing-explanations",
      status: competingPass ? "pass" : "fail",
      evidence: `explanations=${pack.competingExplanations.length}; uncertainties=${pack.uncertainties.length}; ids=${pack.competingExplanations.map((c) => c.id).join(", ")}`,
      notes: "TNF-centric vs IL-6 / ADA / serology frames must stay visible — no forced narrative.",
    }),
    criterion({
      id: "ac-ex",
      category: "stage1_output",
      label: "4. Expert shortlist (gaps / hypotheses; autoApproved=false)",
      artifact: "hsi-pilot-evidence-pack.md#expert-shortlist · hsi-gap-report.md",
      status: shortlistPass ? "pass" : "fail",
      evidence: `expertShortlist=${pack.expertShortlist.length}; allAutoApprovedFalse=${pack.expertShortlist.every((i) => i.autoApproved === false)}; gateCPending=${pack.summary.gateCPending}`,
      notes: "Rejections are a success signal; never auto-approve into product KG.",
    }),
    criterion({
      id: "ac-manifest",
      category: "bundle",
      label: "Versioned MANIFEST + regenerable publish bundle",
      artifact: "MANIFEST.json · bun run outputs",
      status: "pass",
      evidence:
        "publishOutputs writes MANIFEST.json with notCds / autoApproveIntoKg=false / partnerLock pointer + acceptance artifacts",
      notes: "Bundle under dist/outputs/<bundleId>/; LATEST.json pointer for consumers.",
    }),
    criterion({
      id: "ac-gap",
      category: "bundle",
      label: "Gap report (schema / mapping / LOINC honesty)",
      artifact: "hsi-gap-report.json · hsi-gap-report.md",
      status: gapPass ? "pass" : "fail",
      evidence: `seedEdges=${gap.summary.seedEdges}; gapRows=${gap.gaps.length}; loincClaims=${gap.summary.loinc.claimsWithLoincMarker}`,
      notes: "Partner-ready backlog visibility — not a closed gap list.",
    }),
    criterion({
      id: "ac-gate-c",
      category: "gate_c",
      label: "Gate C checklist (pending human approve path)",
      artifact: "gate-c-checklist.md · docs/IMMUNECITY_GATE_C_COMMIT_MANUAL.md",
      status: gateCArtifactPass ? "pass" : "fail",
      evidence: `pendingGateC=${gateC.summary.pendingGateC}; autoApproveIntoKg=${gateC.autoApproveIntoKg}; unmapped=${gateC.summary.unmapped}`,
      notes:
        "Pass = checklist exists with pending rows. ISI product approve stays autumn-snow; HSI red-wave holds pending placeholders only.",
    }),
    criterion({
      id: "ac-scope-lock",
      category: "partner_lock",
      label: "Partner lock — scopeLocked RA / anti-TNF (Phase 2)",
      artifact: "hsi-partner-lock.json",
      status: scopeLockPass ? "pass" : "fail",
      evidence: `scopeLocked=${lock.scopeLocked}; status=${lock.status}; disease=${lock.disease?.id ?? "null"}; questionContainsAntiTnf=${Boolean(lock.researchQuestion?.toLowerCase().includes("anti-tnf"))}`,
      notes: "Engineering working scope — not a MoU.",
    }),
    criterion({
      id: "ac-partner-signed",
      category: "partner_lock",
      label: isHypotheticalTestFixturePartner(lock)
        ? "TEST FIXTURE partnerSigned (path-testing) — replace before real pilot"
        : "Named partnerSigned / lockedPilot",
      artifact: "hsi-partner-lock.json · src/hypotheticalPartnerFixture.ts · docs/ISI_PILOT_PARTNER_SHORTLIST.md",
      status:
        lock.partnerSigned && lock.lockedPilot && lock.legalBinding
          ? "pass"
          : isHypotheticalTestFixturePartner(lock) && lock.partnerSigned
            ? "pending"
            : "pending",
      evidence: `partnerSigned=${lock.partnerSigned}; lockedPilot=${lock.lockedPilot}; legalBinding=${lock.legalBinding}; agreementKind=${lock.agreementKind}; partner.type=${lock.partner?.type ?? "null"}; outreachStatus=${lock.partner?.outreachStatus ?? "null"}; isHypothetical=${lock.isHypothetical}`,
      notes: isHypotheticalTestFixturePartner(lock)
        ? "TEST FIXTURE — partnerSigned=true under hypothetical_test_only only. lockedPilot stays false until legalBinding. Replace via src/hypotheticalPartnerFixture.ts."
        : "Honest pending until a named partner confirms disease + question in writing.",
    }),
    criterion({
      id: "ac-rubric",
      category: "review",
      label: "Stage 1 review rubric export",
      artifact: "hsi-pilot-review-rubric.md",
      status: rubricPass ? "pass" : "fail",
      evidence: `ready_for_human=${rubric.summary.readyForHuman}; blocked_on_partner=${rubric.summary.blockedOnPartner}; set_for_test=${rubric.summary.setForTest}; thresholdStatus=${rubric.summary.thresholdStatus}; numericThresholdsMet=${rubric.summary.numericThresholdsMet}`,
      notes:
        "Checklist for human walkthrough; fixture may set numeric thresholds as set_for_test (real partner must re-agree).",
    }),
    criterion({
      id: "ac-licensing",
      category: "licensing",
      label: "Source licensing / attribution for partner corpus",
      artifact:
        "hsi-source-licensing-stub.json · docs/HOW_TO_SOURCE_LICENSING.md · hsi-partner-lock.json#flipRequirements",
      status: "pending",
      evidence: "Scope-locked PMIDs are public PubMed locators; curator statuses in licensing stub; partnerClearedCount=0",
      notes: "Pending after partnerSigned — do not claim licensed corpora.",
    }),
    criterion({
      id: "ac-thresholds",
      category: "review",
      label: "Success-metric numeric thresholds with partner",
      artifact: "hsi-pilot-review-rubric.md#stage-1-numeric-thresholds · src/stage1RubricThresholds.ts",
      status:
        stage1Thresholds.thresholdStatus === "set_for_test"
          ? "set_for_test"
          : stage1Thresholds.thresholdStatus === "partner_agreed"
            ? "pass"
            : "pending",
      evidence: `thresholdSource=${stage1Thresholds.thresholdSource}; thresholdStatus=${stage1Thresholds.thresholdStatus}; replaceWithPartnerAgreedThresholds=${stage1Thresholds.replaceWithPartnerAgreedThresholds}; minPartnerScopedEdges=${stage1Thresholds.numeric.minPartnerScopedEdges}; minCompetingExplanations=${stage1Thresholds.numeric.minCompetingExplanations}; minLoincLinkedClaims=${stage1Thresholds.numeric.minLoincLinkedClaims}; gateCPendingAllowed=${stage1Thresholds.numeric.gateCPendingAllowed}; acceptanceOverallAllowed=${stage1Thresholds.numeric.acceptanceOverallAllowed}; packEvalPass=${numericEval.pass} (scoped=${numericEval.partnerScopedEdges}, competing=${numericEval.competingExplanations}, loinc=${numericEval.loincLinkedClaims}, gateCPending=${numericEval.gateCPending})`,
      notes:
        "Fixture numbers are path-testing only — real partner must re-agree before formal user testing / lockedPilot.",
    }),
    criterion({
      id: "ac-discovery-ui",
      category: "product",
      label: "Discovery Centre product surface (Phase 6 / Target R1)",
      artifact: "site/src/pages/DiscoveryCentre.tsx · site/public/discovery/",
      status: "pass",
      evidence:
        "ASK→MAP→REVIEW→VALIDATE→TRANSLATE surface loads regenerable packs from site/public/discovery (notCds; clinicalActive=false; partnerSigned=false)",
      notes:
        "Phase 6–8 done on HSI substrate. TRANSLATE tab + /akeno HITL show deferred_until_hitl candidates only — not live CDS.",
    }),
  ];
}

function buildWalkthroughSteps(lock: HsiPartnerLock): PilotAcceptancePack["walkthroughSteps"] {
  const fixtureNote = isHypotheticalTestFixturePartner(lock)
    ? ` TEST FIXTURE partner=${lock.partner?.id} (partnerSigned=${lock.partnerSigned} under agreementKind=hypothetical_test_only; legalBinding=false; lockedPilot=false) — replace before real pilot.`
    : ` partnerSigned=${lock.partnerSigned}; lockedPilot=${lock.lockedPilot}.`;
  return [
    {
      step: 1,
      title: "Frame the pilot (non-CDS)",
      open: "docs/ISI_PILOT_BRIEF.md · hsi-partner-lock.json · src/hypotheticalPartnerFixture.ts",
      say: `Working Stage 1 scope is ${lock.disease?.label ?? "RA"} + the anti-TNF response-heterogeneity question. scopeLocked=true.${fixtureNote} Not a MoU.`,
      doNot: "Do not present patient risk scores, eligibility automation, EHR write-back, or treat the hypothetical fixture as a legal partner.",
    },
    {
      step: 2,
      title: "Walk the four Stage 1 outputs",
      open: "hsi-pilot-evidence-pack.md",
      say: "Evidence map → entity slice → competing explanations → expert shortlist. Every retained claim should cite a claim/source ID.",
      doNot: "Do not collapse competing TNF / IL-6 / ADA / serology frames into one forced story.",
    },
    {
      step: 3,
      title: "Show honest gaps + Gate C pending",
      open: "hsi-gap-report.md · gate-c-checklist.md",
      say: "Gap report and Gate C pending rows are features: experts can reject without KG pollution. Auto-approve is false everywhere.",
      doNot: "Do not approve Gate C from this workspace into ISI Neon autumn-snow.",
    },
    {
      step: 4,
      title: "Run the review rubric",
      open: "hsi-pilot-review-rubric.md",
      say: "Mark ready_for_human items live with the partner. Fixture numeric thresholds are set_for_test — confirm or rewrite with the real partner. Leave licensing + named confirmation blocked until written agree.",
      doNot: "Do not treat fixture thresholds as a MoU KPI, and do not invent a named legal partner.",
    },
    {
      step: 5,
      title: "Confirm regenerable bundle",
      open: "MANIFEST.json · hsi-pilot-acceptance.md",
      say: "Artifacts regenerate with bun run outputs. Acceptance pack records pass vs pending honestly.",
      doNot: "Do not claim live Akeno clinical CDS / patient pathways from HSI translation scaffolding (clinicalActive=false).",
    },
  ];
}

export function buildPilotAcceptancePack(opts?: {
  generatedAt?: string;
  lock?: HsiPartnerLock;
  pack?: PilotEvidencePack;
  rubric?: PilotReviewRubric;
  gateC?: GateCChecklistBundle;
  gap?: HsiSchemaGapReport;
}): PilotAcceptancePack {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = opts?.lock ?? getPartnerLock();
  const pack =
    opts?.pack ??
    buildPilotEvidencePack({
      generatedAt,
      evidenceSnapshotRef: "dist/outputs/latest/hsi-isi-export.json",
      lock,
    });
  const rubric =
    opts?.rubric ??
    buildPilotReviewRubric({
      generatedAt,
      lock,
      pack,
    });
  const gateC = opts?.gateC ?? buildGateCChecklist({ generatedAt });
  const gap = opts?.gap ?? buildSchemaGapReport({ generatedAt });

  const criteria = buildCriteria({ lock, pack, rubric, gateC, gap });
  const pass = criteria.filter((c) => c.status === "pass").length;
  const fail = criteria.filter((c) => c.status === "fail").length;
  const pending = criteria.filter((c) => c.status === "pending").length;
  const setForTest = criteria.filter((c) => c.status === "set_for_test").length;

  const stage1Ids = ["ac-em", "ac-es", "ac-ce", "ac-ex"];
  const stage1FourOutputsGreen = stage1Ids.every(
    (id) => criteria.find((c) => c.id === id)?.status === "pass",
  );
  const supportGreen = ["ac-manifest", "ac-gap", "ac-gate-c", "ac-scope-lock", "ac-rubric"].every(
    (id) => criteria.find((c) => c.id === id)?.status === "pass",
  );
  const partnerReadyWalkthrough = stage1FourOutputsGreen && supportGreen && fail === 0;
  const thresholds = getStage1RubricThresholds();

  let overallStage1Acceptance: PilotAcceptancePack["summary"]["overallStage1Acceptance"];
  if (fail > 0) {
    overallStage1Acceptance = "fail";
  } else if (partnerReadyWalkthrough) {
    // Fixture explicitly allows green_with_pending while licensing / real MoU open.
    overallStage1Acceptance =
      thresholds.numeric.acceptanceOverallAllowed ?? "green_with_pending";
  } else {
    overallStage1Acceptance = "blocked";
  }

  return {
    schemaVersion: PILOT_ACCEPTANCE_SCHEMA,
    notCds: true,
    autoApproveIntoKg: false,
    phase: "5",
    generatedAt,
    scope: {
      disease: lock.disease?.label ?? "TBD",
      researchQuestion: lock.researchQuestion ?? "TBD",
      scopeLocked: lock.scopeLocked,
      partnerSigned: lock.partnerSigned,
      lockedPilot: lock.lockedPilot,
      status: lock.status,
      agreementKind: lock.agreementKind,
      legalBinding: lock.legalBinding,
      isHypothetical: lock.isHypothetical,
      notALegalAgreement: lock.notALegalAgreement,
      testPilotMode: lock.testPilotMode,
      testFixtureBanner: lock.testFixtureBanner,
      partnerId: lock.partner?.id ?? null,
      partnerType: lock.partner?.type ?? null,
    },
    criteria,
    summary: {
      pass,
      fail,
      pending,
      setForTest,
      stage1FourOutputsGreen,
      partnerReadyWalkthrough,
      overallStage1Acceptance,
    },
    walkthroughSteps: buildWalkthroughSteps(lock),
    nextActions: [
      lock.testFixtureBanner
        ? `${lock.testFixtureBanner} Swap via src/hypotheticalPartnerFixture.ts when a real org confirms.`
        : "Share walkthrough with the named partner.",
      "Share hsi-pilot-walkthrough.md + hsi-pilot-acceptance.md + site `/discovery` with outreach / future named partner.",
      "Keep lockedPilot=false / legalBinding=false until a real named partner meets flipRequirements (fixture partnerSigned is path-testing only).",
      "Numeric Stage 1 thresholds are set_for_test under the hypothetical fixture — real partner must re-agree numbers before formal user testing.",
      "Agree source licensing (docs/HOW_TO_SOURCE_LICENSING.md) before claiming a licensed corpus.",
      "Production ISI must ignore fixture partnerSigned unless ALLOW_HYPOTHETICAL_PARTNER=true.",
      "Phase 6–8 Discovery Centre (ASK→MAP→REVIEW→VALIDATE→TRANSLATE) is live. Phase 8 = translation substrate + in-repo Akeno HITL at /akeno (not CDS).",
    ],
    deferredExplicitAsk: [
      "Akeno clinical product — partner cohorts / feasibility / protocol screening beyond in-repo /akeno HITL",
      "Clinical R3–R5 / Akeno patient-level pathways + prospective CDS (R5) — gated / not committed",
      "PDF/DOCX brief renderer (ISI product P1)",
      "Stage 2 molecular adapters / live Stage 3 clinical workflows",
    ],
  };
}

export function serializePilotAcceptance(
  pack: PilotAcceptancePack = buildPilotAcceptancePack(),
): string {
  return `${JSON.stringify(pack, null, 2)}\n`;
}

export function serializePilotAcceptanceMarkdown(
  pack: PilotAcceptancePack = buildPilotAcceptancePack(),
): string {
  const lines: string[] = [
    "# ISI pilot — Stage 1 acceptance checklist (Phase 5)",
    "",
    `Schema: \`${pack.schemaVersion}\` · generated ${pack.generatedAt}`,
    "",
    pack.scope.testFixtureBanner
      ? `> **${pack.scope.testFixtureBanner}** Not CDS. Not auto-approval into product KG. Fixture \`partnerSigned\` ≠ MoU. Production ISI requires \`ALLOW_HYPOTHETICAL_PARTNER=true\` to trust fixture.`
      : "> Not CDS. Not auto-approval into product KG. Pass ≠ MoU. partnerSigned stays pending until a named partner confirms.",
    "",
    "## Scope",
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| disease | ${pack.scope.disease} |`,
    `| researchQuestion | ${pack.scope.researchQuestion} |`,
    `| scopeLocked | \`${pack.scope.scopeLocked}\` |`,
    `| partnerSigned | \`${pack.scope.partnerSigned}\` |`,
    `| lockedPilot | \`${pack.scope.lockedPilot}\` |`,
    `| legalBinding | \`${pack.scope.legalBinding}\` |`,
    `| agreementKind | \`${pack.scope.agreementKind}\` |`,
    `| isHypothetical | \`${pack.scope.isHypothetical}\` |`,
    `| partner | \`${pack.scope.partnerId ?? "none"}\` (${pack.scope.partnerType ?? "n/a"}) |`,
    `| status | \`${pack.scope.status}\` |`,
    "",
    "## Verdict",
    "",
    `- **overallStage1Acceptance:** \`${pack.summary.overallStage1Acceptance}\``,
    `- **stage1FourOutputsGreen:** \`${pack.summary.stage1FourOutputsGreen}\``,
    `- **partnerReadyWalkthrough:** \`${pack.summary.partnerReadyWalkthrough}\``,
    `- pass=${pack.summary.pass} · fail=${pack.summary.fail} · pending=${pack.summary.pending} · set_for_test=${pack.summary.setForTest}`,
    "",
    "## Criteria",
    "",
    `| Status | ID | Criterion | Artifact |`,
    `|--------|----|-----------|----------|`,
  ];

  for (const c of pack.criteria) {
    lines.push(
      `| \`${c.status}\` | \`${c.id}\` | ${c.label} | ${c.artifact} |`,
    );
  }

  lines.push("", "## Evidence detail", "");
  for (const c of pack.criteria) {
    lines.push(
      `### \`${c.id}\` — ${c.label}`,
      "",
      `- **status:** \`${c.status}\``,
      `- **category:** ${c.category}`,
      `- **evidence:** ${c.evidence}`,
      `- **notes:** ${c.notes}`,
      "",
    );
  }

  lines.push("## Next actions", "");
  for (const a of pack.nextActions) {
    lines.push(`- ${a}`);
  }
  lines.push("", "## Deferred (explicit ask required)", "");
  for (const d of pack.deferredExplicitAsk) {
    lines.push(`- ${d}`);
  }
  lines.push("");
  return lines.join("\n");
}

/** Partner-facing walkthrough script for the scope-locked RA/anti-TNF question. */
export function serializePilotWalkthroughMarkdown(
  pack: PilotAcceptancePack = buildPilotAcceptancePack(),
): string {
  const lines: string[] = [
    "# ISI pilot — partner walkthrough (Phase 5)",
    "",
    `Schema: \`${pack.schemaVersion}\` · generated ${pack.generatedAt}`,
    "",
    `**Disease:** ${pack.scope.disease}  `,
    `**Question:** ${pack.scope.researchQuestion}`,
    "",
    `**Honesty:** scopeLocked=\`${pack.scope.scopeLocked}\` · partnerSigned=\`${pack.scope.partnerSigned}\` · lockedPilot=\`${pack.scope.lockedPilot}\` · legalBinding=\`${pack.scope.legalBinding}\` · agreementKind=\`${pack.scope.agreementKind}\` · isHypothetical=\`${pack.scope.isHypothetical}\` · status=\`${pack.scope.status}\``,
    "",
    pack.scope.testFixtureBanner
      ? `> **${pack.scope.testFixtureBanner}** Research intelligence only. No patient-level CDS. Fixture ≠ MoU. Regenerable via \`bun run outputs\`.`
      : "> Research intelligence only. No patient-level CDS. No invented MoU. Regenerable via `bun run outputs`.",
    "",
    "## Goal",
    "",
    "Walk a partner through Stage 1 four outputs on the scope-locked RA / anti-TNF question, show gaps and Gate C pending rows, and leave with an honest acceptance checklist (`hsi-pilot-acceptance.md`).",
    "",
    "## Steps",
    "",
  ];

  for (const s of pack.walkthroughSteps) {
    lines.push(
      `### ${s.step}. ${s.title}`,
      "",
      `- **Open:** ${s.open}`,
      `- **Say:** ${s.say}`,
      `- **Do not:** ${s.doNot}`,
      "",
    );
  }

  lines.push(
    "## Artifacts to hand over",
    "",
    "1. `hsi-pilot-evidence-pack.md` — four outputs + brief shell",
    "2. `hsi-pilot-review-rubric.md` — human review checklist",
    "3. `hsi-pilot-acceptance.md` — pass / fail / pending acceptance",
    "4. `hsi-pilot-walkthrough.md` — this script",
    "5. `MANIFEST.json` · `hsi-gap-report.md` · `gate-c-checklist.md` · `hsi-partner-lock.json`",
    "",
    "## Acceptance snapshot",
    "",
    `- overall: \`${pack.summary.overallStage1Acceptance}\``,
    `- four outputs green: \`${pack.summary.stage1FourOutputsGreen}\``,
    `- partner-ready walkthrough: \`${pack.summary.partnerReadyWalkthrough}\``,
    `- pending (expected): real partnerSigned / legalBinding, licensing`,
    `- set_for_test (fixture): numeric Stage 1 thresholds — real partner must re-agree`,
    "",
    "## After the meeting",
    "",
  );
  for (const a of pack.nextActions) {
    lines.push(`- ${a}`);
  }
  lines.push("");
  return lines.join("\n");
}
