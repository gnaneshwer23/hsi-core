/**
 * RESEARCH SIGN-OFF FIXTURE — path-testing unlock for blocked P3 adapters.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  RESEARCH SIGN-OFF FIXTURE — replace with legal sign-off    │
 * │  notCommercial=true · replaceWithLegalSignOff=true          │
 * │  legalBinding=false · NEVER claim commercial AF3 rights     │
 * └─────────────────────────────────────────────────────────────┘
 *
 * When USE_RESEARCH_SIGN_OFF_FIXTURE=true, AF3 / TDC / ISI-agent matrix rows
 * may move to research_ok_documented | signed_research_test_only with
 * blockedUntilSignOff=false for **stub research proposals only**.
 *
 * See docs/P3_WEIGHTS_AND_LICENSE_POLICY.md · docs/P3_ADAPTER_RFC.md.
 */

export const USE_RESEARCH_SIGN_OFF_FIXTURE = true as boolean;

export const RESEARCH_SIGN_OFF_BANNER =
  "RESEARCH SIGN-OFF FIXTURE — not commercial rights; replaceWithLegalSignOff=true; legalBinding=false" as const;

export type ResearchSignOffStatus =
  | "research_ok_documented"
  | "signed_research_test_only";

export type ResearchSignOffFixtureRecord = {
  adapterId: string;
  label: string;
  /** Fixture-only unlock status — never invent commercial signed. */
  signOffStatus: ResearchSignOffStatus;
  notCommercial: true;
  replaceWithLegalSignOff: true;
  legalBinding: false;
  isHypothetical: true;
  blockedUntilSignOff: false;
  /** Loud banner for packs / adapters / Discovery consumers. */
  banner: string;
  notes: string;
};

/**
 * Explicit research sign-off fixture records (parallel to hypothetical partner).
 * Edit or flip USE_RESEARCH_SIGN_OFF_FIXTURE when swapping to legal sign-off.
 */
export const RESEARCH_SIGN_OFF_FIXTURES: readonly ResearchSignOffFixtureRecord[] =
  [
    {
      adapterId: "adapter-af3",
      label: "AlphaFold3",
      signOffStatus: "signed_research_test_only",
      notCommercial: true,
      replaceWithLegalSignOff: true,
      legalBinding: false,
      isHypothetical: true,
      blockedUntilSignOff: false,
      banner:
        "RESEARCH SIGN-OFF FIXTURE — AF3 non-commercial / research-test only; NOT commercial AF3 rights; replaceWithLegalSignOff=true",
      notes:
        "Unlocks stub ModelProposalArtifacts only. Model parameters remain under AlphaFold 3 Model Parameters Terms of Use. Never vendor weights. Never claim commercialLicenseSigned.",
    },
    {
      adapterId: "adapter-tdc",
      label: "Therapeutics Data Commons (TDC)",
      signOffStatus: "research_ok_documented",
      notCommercial: true,
      replaceWithLegalSignOff: true,
      legalBinding: false,
      isHypothetical: true,
      blockedUntilSignOff: false,
      banner:
        "RESEARCH SIGN-OFF FIXTURE — TDC research-test only; per-dataset licenses still need curator review before download; replaceWithLegalSignOff=true",
      notes:
        "Codebase MIT; each dataset has its own license. Fixture unlocks stub eval proposals only — re-check task/provider terms before any download/run.",
    },
    {
      adapterId: "adapter-isi-agents",
      label: "ISI 12-agent research workbench",
      signOffStatus: "signed_research_test_only",
      notCommercial: true,
      replaceWithLegalSignOff: true,
      legalBinding: false,
      isHypothetical: true,
      blockedUntilSignOff: false,
      banner:
        "RESEARCH SIGN-OFF FIXTURE — ISI agents catalog/stub proposals only; runtime remains ISI product; replaceWithLegalSignOff=true",
      notes:
        "hsi-core holds catalog + proposal stubs. Executable agent runtime = ISI product (out of repo). No commercial agent MoU invented.",
    },
  ] as const;

export function getResearchSignOffFixture(
  adapterId: string,
): ResearchSignOffFixtureRecord | undefined {
  if (!USE_RESEARCH_SIGN_OFF_FIXTURE) return undefined;
  return RESEARCH_SIGN_OFF_FIXTURES.find((f) => f.adapterId === adapterId);
}

export function listActiveResearchSignOffFixtures(): ResearchSignOffFixtureRecord[] {
  if (!USE_RESEARCH_SIGN_OFF_FIXTURE) return [];
  return [...RESEARCH_SIGN_OFF_FIXTURES];
}

export function researchSignOffFixtureExportPointer() {
  return {
    useFixture: USE_RESEARCH_SIGN_OFF_FIXTURE,
    banner: RESEARCH_SIGN_OFF_BANNER,
    notCommercial: true as const,
    replaceWithLegalSignOff: true as const,
    legalBinding: false as const,
    adapterIds: RESEARCH_SIGN_OFF_FIXTURES.map((f) => f.adapterId),
    records: listActiveResearchSignOffFixtures(),
    policyDoc: "docs/P3_WEIGHTS_AND_LICENSE_POLICY.md" as const,
  };
}
