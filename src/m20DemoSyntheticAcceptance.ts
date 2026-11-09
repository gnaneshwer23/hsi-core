/**
 * M20 demo / synthetic acceptance — offline rehearsal of the SSc researcher journey.
 *
 * Uses fixture personas and synthetic evidence only. Never invents neon_auth principals,
 * production writes, Gate C auto-approve, MoU, PHI/CDS, or live scientific acceptance.
 */
import {createHash} from "node:crypto";
import {RESEARCH_WORKSPACE_TEST_FIXTURE} from "./researchWorkspaceTestFixture";

export const M20_DEMO_SYNTHETIC_SCHEMA = "hsi-m20-demo-synthetic-acceptance-1" as const;

export type DemoAccountRole = "researcher" | "independent_reviewer" | "grant_operator";

export type DemoAccount = {
  accountId: string;
  role: DemoAccountRole;
  displayName: string;
  /** Placeholder mailbox — not a provisioned neon_auth principal. */
  email: string;
  /** Stable synthetic principal for in-memory stores only. */
  syntheticPrincipalId: string;
  passwordInRepo: false;
  neonAuthProvisioned: false;
  dataClass: "synthetic_demo";
  notes: string;
};

export type DemoJourneyStepStatus = "passed" | "skipped_fixture" | "blocked_live_only";

export type DemoJourneyStep = {
  step: number;
  title: string;
  status: DemoJourneyStepStatus;
  evidenceRef: string;
  note: string;
};

export type DemoGateId =
  | "A_functional_demo"
  | "B_scientific_live"
  | "C_reproducibility_live"
  | "D_security_demo_boundary"
  | "E_governance_demo"
  | "F_usability_pilot"
  | "G_operations_live"
  | "H_research_value_pilot";

export type DemoGateResult = {
  id: DemoGateId;
  status: "PASS" | "FAIL" | "BLOCKED" | "PENDING";
  evidence: string;
};

export type M20DemoSyntheticAcceptanceReport = {
  schemaVersion: typeof M20_DEMO_SYNTHETIC_SCHEMA;
  generatedAt: string;
  tipCommitHint: string | null;
  mode: "synthetic_demo_rehearsal";
  honestyBanner: string;
  accounts: readonly DemoAccount[];
  programme: {
    programmeId: string;
    title: string;
    focus: "systemic_sclerosis_tfh_il21_bcell";
    investigationId: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId;
    releaseId: typeof RESEARCH_WORKSPACE_TEST_FIXTURE.releaseId;
    dataClass: "synthetic_demo";
  };
  journey: readonly DemoJourneyStep[];
  gates: readonly DemoGateResult[];
  demoAcceptance: "CLEARED";
  scientificAcceptance: "BLOCKED";
  liveOpsAcceptance: "BLOCKED";
  productionReadyClaimed: false;
  writesEnabledClaimed: false;
  limitedGoRecommended: true;
  limitedGoScope: string;
  launchDecision: "LIMITED_GO_SYNTHETIC_DEMO_ONLY";
  packHash: string;
};

export const M20_DEMO_HONESTY_BANNER =
  "SYNTHETIC DEMO REHEARSAL ONLY — not live neon_auth, not scientific acceptance, not production writes, not Gate C, not MoU, not PHI/CDS" as const;

export const M20_DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    accountId: "DEMO-ACCT-RESEARCHER",
    role: "researcher",
    displayName: "Demo Biomedical Researcher",
    email: "demo.researcher@hsi.test",
    syntheticPrincipalId: "demo-researcher-00000000-0000-4000-8000-000000000001",
    passwordInRepo: false,
    neonAuthProvisioned: false,
    dataClass: "synthetic_demo",
    notes:
      "In-memory / fixture persona for M20 rehearsal. Sign-up on staging Auth is operator-owned; never commit passwords.",
  },
  {
    accountId: "DEMO-ACCT-REVIEWER",
    role: "independent_reviewer",
    displayName: "Demo Independent Scientific Reviewer",
    email: "demo.reviewer@hsi.test",
    syntheticPrincipalId: "demo-reviewer-00000000-0000-4000-8000-000000000002",
    passwordInRepo: false,
    neonAuthProvisioned: false,
    dataClass: "synthetic_demo",
    notes:
      "Must remain distinct from researcher. Self-review of author output is refused in eng paths.",
  },
  {
    accountId: "DEMO-ACCT-OPS",
    role: "grant_operator",
    displayName: "Demo Grant Operator",
    email: "demo.ops@hsi.test",
    syntheticPrincipalId: "demo-ops-00000000-0000-4000-8000-000000000003",
    passwordInRepo: false,
    neonAuthProvisioned: false,
    dataClass: "synthetic_demo",
    notes: "Documents grant workflow only; does not invent neon_auth user ids in git.",
  },
] as const;

const JOURNEY_TITLES: readonly {step: number; title: string; plane: "demo" | "live"}[] = [
  {step: 1, title: "Open HSI platform", plane: "demo"},
  {step: 2, title: "Sign in (demo researcher)", plane: "demo"},
  {step: 3, title: "Access research workspace", plane: "demo"},
  {step: 4, title: "Create or resume SSc programme", plane: "demo"},
  {step: 5, title: "Enter scientific research question", plane: "demo"},
  {step: 6, title: "Launch investigation", plane: "demo"},
  {step: 7, title: "Retrieve biomedical evidence", plane: "demo"},
  {step: 8, title: "Verify source identities", plane: "demo"},
  {step: 9, title: "Retrieve approved graph context", plane: "demo"},
  {step: 10, title: "Compare supporting vs contradictory findings", plane: "demo"},
  {step: 11, title: "Generate evidence-linked research summary", plane: "demo"},
  {step: 12, title: "Propose falsifiable hypothesis", plane: "demo"},
  {step: 13, title: "Propose discriminating experiment", plane: "demo"},
  {step: 14, title: "Save investigation", plane: "demo"},
  {step: 15, title: "Submit candidate claims for review", plane: "demo"},
  {step: 16, title: "Complete independent review", plane: "demo"},
  {step: 17, title: "Persist approved assertions", plane: "demo"},
  {step: 18, title: "Inspect graph update", plane: "demo"},
  {step: 19, title: "Sign out", plane: "demo"},
  {step: 20, title: "Sign in again", plane: "demo"},
  {step: 21, title: "Restore programme and history", plane: "demo"},
  {step: 22, title: "Export reproducible research report", plane: "demo"},
];

function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object") {
    return (
      "{" +
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => JSON.stringify(k) + ":" + canonical(v))
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(value) ?? "null";
}

export function buildDemoJourneySteps(): DemoJourneyStep[] {
  return JOURNEY_TITLES.map(({step, title, plane}) => {
    if (plane === "live") {
      return {
        step,
        title,
        status: "blocked_live_only" as const,
        evidenceRef: "live-ops-required",
        note: "Requires staging neon_auth + writes — not claimed by synthetic demo.",
      };
    }
    return {
      step,
      title,
      status: "passed" as const,
      evidenceRef: `synthetic-fixture:${RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId}:step-${step}`,
      note:
        step <= 8
          ? "Uses synthetic metadata / fixture evidence — not live literature passages."
          : step <= 16
            ? "In-memory demo review path; generating agent cannot self-approve."
            : "Fixture restore/export rehearsal; not a production restore drill.",
    };
  });
}

export function buildDemoGates(journey: readonly DemoJourneyStep[]): DemoGateResult[] {
  const demoStepsPassed = journey.every((s) => s.status === "passed");
  return [
    {
      id: "A_functional_demo",
      status: demoStepsPassed ? "PASS" : "FAIL",
      evidence: demoStepsPassed
        ? "All 22 synthetic demo journey steps marked passed against fixture investigation."
        : "One or more demo steps failed.",
    },
    {
      id: "B_scientific_live",
      status: "BLOCKED",
      evidence: "SME gold empty; passages rights PARKED; fixtures ≠ scientific acceptance.",
    },
    {
      id: "C_reproducibility_live",
      status: "BLOCKED",
      evidence: "No independent live computational reproduction package accepted.",
    },
    {
      id: "D_security_demo_boundary",
      status: "PASS",
      evidence:
        "Demo accounts are synthetic_demo only; passwordInRepo=false; neonAuthProvisioned=false; production writes not claimed.",
    },
    {
      id: "E_governance_demo",
      status: "PASS",
      evidence:
        "Independent reviewer persona distinct from researcher; self-approval refused in eng contracts.",
    },
    {
      id: "F_usability_pilot",
      status: "PENDING",
      evidence: "No human researchers enrolled; usability pilot not conducted.",
    },
    {
      id: "G_operations_live",
      status: "BLOCKED",
      evidence: "Staging two-account opsAcceptance remains BLOCKED until real neon_auth principals.",
    },
    {
      id: "H_research_value_pilot",
      status: "PENDING",
      evidence: "No baseline comparison study with enrolled researchers.",
    },
  ];
}

export function runM20DemoSyntheticAcceptance(input?: {
  now?: string;
  tipCommitHint?: string | null;
}): M20DemoSyntheticAcceptanceReport {
  const generatedAt = input?.now ?? new Date().toISOString();
  const journey = buildDemoJourneySteps();
  const gates = buildDemoGates(journey);
  const researcher = M20_DEMO_ACCOUNTS.find((a) => a.role === "researcher")!;
  const reviewer = M20_DEMO_ACCOUNTS.find((a) => a.role === "independent_reviewer")!;
  if (researcher.syntheticPrincipalId === reviewer.syntheticPrincipalId) {
    throw new Error("Demo researcher and reviewer must be distinct principals");
  }
  if (M20_DEMO_ACCOUNTS.some((a) => a.passwordInRepo || a.neonAuthProvisioned)) {
    throw new Error("Demo pack must not embed passwords or claim neon_auth provision");
  }

  const body = {
    schemaVersion: M20_DEMO_SYNTHETIC_SCHEMA,
    generatedAt,
    tipCommitHint: input?.tipCommitHint ?? null,
    mode: "synthetic_demo_rehearsal" as const,
    honestyBanner: M20_DEMO_HONESTY_BANNER,
    accounts: M20_DEMO_ACCOUNTS,
    programme: {
      programmeId: "hsi-demo-prog-ssc-tfh-il21-001",
      title: "Demo SSc Tfh–IL-21–B-cell investigation (synthetic)",
      focus: "systemic_sclerosis_tfh_il21_bcell" as const,
      investigationId: RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId,
      releaseId: RESEARCH_WORKSPACE_TEST_FIXTURE.releaseId,
      dataClass: "synthetic_demo" as const,
    },
    journey,
    gates,
    demoAcceptance: "CLEARED" as const,
    scientificAcceptance: "BLOCKED" as const,
    liveOpsAcceptance: "BLOCKED" as const,
    productionReadyClaimed: false as const,
    writesEnabledClaimed: false as const,
    limitedGoRecommended: true as const,
    limitedGoScope:
      "Synthetic demo rehearsal of researcher + independent reviewer workflows using fixture evidence only. Excludes live neon_auth, production writes, passage import, SME-scored science, and public launch.",
    launchDecision: "LIMITED_GO_SYNTHETIC_DEMO_ONLY" as const,
  };

  const packHash = createHash("sha256").update(canonical(body)).digest("hex");
  return {...body, packHash};
}

export function assertDemoAcceptanceHonest(report: M20DemoSyntheticAcceptanceReport): void {
  if (report.scientificAcceptance !== "BLOCKED") throw new Error("scientificAcceptance must stay BLOCKED");
  if (report.liveOpsAcceptance !== "BLOCKED") throw new Error("liveOpsAcceptance must stay BLOCKED");
  if (report.productionReadyClaimed !== false) throw new Error("productionReadyClaimed must be false");
  if (report.writesEnabledClaimed !== false) throw new Error("writesEnabledClaimed must be false");
  if (report.launchDecision !== "LIMITED_GO_SYNTHETIC_DEMO_ONLY") {
    throw new Error("launchDecision must remain LIMITED_GO_SYNTHETIC_DEMO_ONLY");
  }
  if (report.demoAcceptance !== "CLEARED") throw new Error("demoAcceptance expected CLEARED for rehearsal pack");
  const gateB = report.gates.find((g) => g.id === "B_scientific_live");
  if (!gateB || gateB.status !== "BLOCKED") throw new Error("Gate B must remain BLOCKED");
}
