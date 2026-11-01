/**
 * Thin TDC adapter spike — ModelProposalArtifacts only (stub runtime).
 *
 * Unblocked via research sign-off fixture (research_ok_documented):
 * notCommercial=true · replaceWithLegalSignOff=true.
 * Per-dataset licenses still need curator review before any download.
 *
 * See docs/P3_ADAPTER_RFC.md · docs/P3_WEIGHTS_AND_LICENSE_POLICY.md.
 */
import {
  assertSafeModelProposal,
  type ModelProposalArtifact,
} from "../modelProposal";
import { assertP3AdapterRunnable } from "../p3AdapterGate";
import { getResearchSignOffFixture } from "../researchSignOffFixture";

export const TDC_ADAPTER_ID = "adapter-tdc" as const;
export const TDC_ADAPTER_EXPORT_SCHEMA =
  "hsi-tdc-adapter-proposals-1" as const;
export const TDC_ADAPTER_RUNTIME_SCHEMA =
  "hsi-tdc-adapter-runtime-1" as const;

export type TdcRuntime = "stub";

export type TdcBenchmarkFixture = {
  fixtureId: string;
  label: string;
  /** Public benchmark name only — no dataset download in stub. */
  taskHint: string;
  packHint: string;
  edgeHint: string;
  proposedObject: string;
  contextFrame: string;
};

export const TDC_PUBLIC_BENCHMARK_FIXTURES: readonly TdcBenchmarkFixture[] = [
  {
    fixtureId: "admet",
    label: "TDC ADMET stub benchmark frame",
    taskHint: "ADMET_Prediction",
    packHint: "pack:hsi-pilot-evidence-pack",
    edgeHint: "edge:HSI-E-RA-012",
    proposedObject:
      "research TDC stub offline-eval draft vs MTX neighbourhood claim (not seed authority)",
    contextFrame:
      "TDC research-test stub — per-dataset licenses still need review before download. Gate C pending only.",
  },
  {
    fixtureId: "dti",
    label: "TDC DTI stub benchmark frame",
    taskHint: "DTI_DG",
    packHint: "pack:hsi-gut-immune-pack",
    edgeHint: "edge:HSI-E-GUT-003",
    proposedObject:
      "research TDC stub offline-eval draft near SCFA↔Treg neighbourhood (hypothesized)",
    contextFrame:
      "TDC research-test stub — no dataset download; cite pack edges only. notCommercial fixture.",
  },
] as const;

export type TdcAdapterBundle = {
  schemaVersion: typeof TDC_ADAPTER_EXPORT_SCHEMA;
  runtimeSchema: typeof TDC_ADAPTER_RUNTIME_SCHEMA;
  adapterId: typeof TDC_ADAPTER_ID;
  runtime: TdcRuntime;
  notCds: true;
  autoApprove: false;
  autoApproveIntoKg: false;
  mayFlipEvidenceGrade: false;
  vendorsModelWeights: false;
  emitsModelProposalOnly: true;
  containsPhi: false;
  partnerSigned: false;
  notCommercial: true;
  replaceWithLegalSignOff: true;
  banner: string;
  licenseGate: {
    adapterId: typeof TDC_ADAPTER_ID;
    signOffStatus: string;
    blockedUntilSignOff: false;
    docsUrl: string;
  };
  generatedAt: string;
  fixtures: TdcBenchmarkFixture[];
  proposals: ModelProposalArtifact[];
  instructions: string[];
};

function fixtureToProposal(
  fixture: TdcBenchmarkFixture,
  createdAt: string,
): ModelProposalArtifact {
  const proposal: ModelProposalArtifact = {
    proposalId: `HSI-MP-TDC-${fixture.fixtureId.toUpperCase()}-001`,
    sourceAdapterOrAgent: TDC_ADAPTER_ID,
    proposedSubject: fixture.label,
    proposedPredicate: "associated_with",
    proposedObject: fixture.proposedObject,
    contextNote: [
      fixture.contextFrame,
      `taskHint=${fixture.taskHint}`,
      "runtime=stub",
      "ModelProposalArtifact only → Gate C pending; autoApprove=false; does not set hsiGrade.",
    ].join(" "),
    evidenceHints: [
      fixture.packHint,
      fixture.edgeHint,
      `tdcTask:${fixture.taskHint}`,
      "runtime:stub",
      "adapter:adapter-tdc",
      "notCommercial:true",
      "replaceWithLegalSignOff:true",
    ],
    suggestedTeachingStatus: "hypothesized",
    createdAt,
  };
  const safety = assertSafeModelProposal(
    proposal as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(
      `TDC adapter produced unsafe proposal ${proposal.proposalId}: ${safety.reason}`,
    );
  }
  return proposal;
}

export function runTdcAdapter(opts?: {
  generatedAt?: string;
}): TdcAdapterBundle {
  const licenseRow = assertP3AdapterRunnable(TDC_ADAPTER_ID);
  const fixture = getResearchSignOffFixture(TDC_ADAPTER_ID);
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const banner =
    fixture?.banner ??
    "RESEARCH SIGN-OFF FIXTURE — TDC research-test only; per-dataset licenses still need curator review";

  const proposals = TDC_PUBLIC_BENCHMARK_FIXTURES.map((f) =>
    fixtureToProposal(f, generatedAt),
  );

  return {
    schemaVersion: TDC_ADAPTER_EXPORT_SCHEMA,
    runtimeSchema: TDC_ADAPTER_RUNTIME_SCHEMA,
    adapterId: TDC_ADAPTER_ID,
    runtime: "stub",
    notCds: true,
    autoApprove: false,
    autoApproveIntoKg: false,
    mayFlipEvidenceGrade: false,
    vendorsModelWeights: false,
    emitsModelProposalOnly: true,
    containsPhi: false,
    partnerSigned: false,
    notCommercial: true,
    replaceWithLegalSignOff: true,
    banner,
    licenseGate: {
      adapterId: TDC_ADAPTER_ID,
      signOffStatus: licenseRow.signOffStatus,
      blockedUntilSignOff: false,
      docsUrl: licenseRow.docsUrl,
    },
    generatedAt,
    fixtures: [...TDC_PUBLIC_BENCHMARK_FIXTURES],
    proposals,
    instructions: [
      "TDC thin adapter spike — stub ModelProposalArtifacts only → Gate C pending.",
      banner,
      "No dataset download in stub. Re-check per-task licenses before live TDC.",
      "Never set hsiGrade / autoApprove / partnerSigned=true.",
    ],
  };
}

export function buildTdcAdapterProposals(opts?: {
  createdAt?: string;
}): ModelProposalArtifact[] {
  return runTdcAdapter({ generatedAt: opts?.createdAt }).proposals;
}

export function serializeTdcAdapterBundle(
  bundle: TdcAdapterBundle = runTdcAdapter(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeTdcAdapterMarkdown(
  bundle: TdcAdapterBundle = runTdcAdapter(),
): string {
  const lines: string[] = [
    "# HSI TDC adapter proposals (research-test stub)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · runtime: **${bundle.runtime}** · generated ${bundle.generatedAt}`,
    "",
    `> **${bundle.banner}**`,
    "",
    "> ModelProposalArtifacts only. Gate C pending. No dataset download in stub.",
    "",
    "## Proposals",
    "",
    ...bundle.proposals.map(
      (p) =>
        `- \`${p.proposalId}\` ${p.proposedSubject} — ${p.proposedPredicate} — ${p.proposedObject}`,
    ),
    "",
    "## Instructions",
    "",
    ...bundle.instructions.map((i) => `- ${i}`),
    "",
  ];
  return `${lines.join("\n")}\n`;
}
