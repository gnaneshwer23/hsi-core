/**
 * Thin ISI agents adapter spike — ModelProposalArtifacts only (stub runtime).
 *
 * Unblocked via research sign-off fixture (signed_research_test_only).
 * Catalog / proposal stubs in hsi-core; executable runtime remains ISI product.
 *
 * See docs/P3_ADAPTER_RFC.md · docs/P3_WEIGHTS_AND_LICENSE_POLICY.md.
 */
import {
  assertSafeModelProposal,
  type ModelProposalArtifact,
} from "../modelProposal";
import { assertP3AdapterRunnable } from "../p3AdapterGate";
import { getResearchSignOffFixture } from "../researchSignOffFixture";

export const ISI_AGENTS_ADAPTER_ID = "adapter-isi-agents" as const;
export const ISI_AGENTS_ADAPTER_EXPORT_SCHEMA =
  "hsi-isi-agents-adapter-proposals-1" as const;
export const ISI_AGENTS_ADAPTER_RUNTIME_SCHEMA =
  "hsi-isi-agents-adapter-runtime-1" as const;

export type IsiAgentsRuntime = "stub";

export type IsiAgentFixture = {
  fixtureId: string;
  label: string;
  agentRole: string;
  packHint: string;
  edgeHint: string;
  proposedObject: string;
  contextFrame: string;
};

export const ISI_AGENT_PUBLIC_FIXTURES: readonly IsiAgentFixture[] = [
  {
    fixtureId: "literature",
    label: "ISI literature specialist stub",
    agentRole: "literature_specialist",
    packHint: "pack:hsi-pilot-evidence-pack",
    edgeHint: "edge:HSI-E-RA-001",
    proposedObject:
      "research agent stub draft citing RA TNF edge (supervised; not auto Gate C)",
    contextFrame:
      "ISI agents research-test stub — runtime out of hsi-core. Catalog pattern only. Gate C pending.",
  },
  {
    fixtureId: "pathway",
    label: "ISI pathway specialist stub",
    agentRole: "pathway_specialist",
    packHint: "pack:hsi-ssc-pathway-pack",
    edgeHint: "edge:HSI-E-SSC-001",
    proposedObject:
      "research agent stub draft citing SSc Tfh edge (dual-track secondary; not ASK replace)",
    contextFrame:
      "ISI agents research-test stub — notCommercial fixture; replaceWithLegalSignOff=true.",
  },
] as const;

export type IsiAgentsAdapterBundle = {
  schemaVersion: typeof ISI_AGENTS_ADAPTER_EXPORT_SCHEMA;
  runtimeSchema: typeof ISI_AGENTS_ADAPTER_RUNTIME_SCHEMA;
  adapterId: typeof ISI_AGENTS_ADAPTER_ID;
  runtime: IsiAgentsRuntime;
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
  runtimeOutOfRepo: true;
  banner: string;
  licenseGate: {
    adapterId: typeof ISI_AGENTS_ADAPTER_ID;
    signOffStatus: string;
    blockedUntilSignOff: false;
    docsUrl: string;
  };
  generatedAt: string;
  fixtures: IsiAgentFixture[];
  proposals: ModelProposalArtifact[];
  instructions: string[];
};

function fixtureToProposal(
  fixture: IsiAgentFixture,
  createdAt: string,
): ModelProposalArtifact {
  const proposal: ModelProposalArtifact = {
    proposalId: `HSI-MP-ISI-AGENTS-${fixture.fixtureId.toUpperCase()}-001`,
    sourceAdapterOrAgent: ISI_AGENTS_ADAPTER_ID,
    proposedSubject: fixture.label,
    proposedPredicate: "associated_with",
    proposedObject: fixture.proposedObject,
    contextNote: [
      fixture.contextFrame,
      `agentRole=${fixture.agentRole}`,
      "runtime=stub",
      "Executable agent runtime = ISI product (out of repo).",
      "ModelProposalArtifact only → Gate C pending; autoApprove=false; does not set hsiGrade.",
    ].join(" "),
    evidenceHints: [
      fixture.packHint,
      fixture.edgeHint,
      `agentRole:${fixture.agentRole}`,
      "runtime:stub",
      "adapter:adapter-isi-agents",
      "notCommercial:true",
      "replaceWithLegalSignOff:true",
      "runtimeOutOfRepo:true",
    ],
    suggestedTeachingStatus: "hypothesized",
    createdAt,
  };
  const safety = assertSafeModelProposal(
    proposal as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(
      `ISI agents adapter produced unsafe proposal ${proposal.proposalId}: ${safety.reason}`,
    );
  }
  return proposal;
}

export function runIsiAgentsAdapter(opts?: {
  generatedAt?: string;
}): IsiAgentsAdapterBundle {
  const licenseRow = assertP3AdapterRunnable(ISI_AGENTS_ADAPTER_ID);
  const fixture = getResearchSignOffFixture(ISI_AGENTS_ADAPTER_ID);
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const banner =
    fixture?.banner ??
    "RESEARCH SIGN-OFF FIXTURE — ISI agents catalog/stub proposals only; runtime remains ISI product";

  const proposals = ISI_AGENT_PUBLIC_FIXTURES.map((f) =>
    fixtureToProposal(f, generatedAt),
  );

  return {
    schemaVersion: ISI_AGENTS_ADAPTER_EXPORT_SCHEMA,
    runtimeSchema: ISI_AGENTS_ADAPTER_RUNTIME_SCHEMA,
    adapterId: ISI_AGENTS_ADAPTER_ID,
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
    runtimeOutOfRepo: true,
    banner,
    licenseGate: {
      adapterId: ISI_AGENTS_ADAPTER_ID,
      signOffStatus: licenseRow.signOffStatus,
      blockedUntilSignOff: false,
      docsUrl: licenseRow.docsUrl,
    },
    generatedAt,
    fixtures: [...ISI_AGENT_PUBLIC_FIXTURES],
    proposals,
    instructions: [
      "ISI agents thin adapter spike — stub ModelProposalArtifacts only → Gate C pending.",
      banner,
      "Executable runtime remains ISI product (out of hsi-core).",
      "Never set hsiGrade / autoApprove / partnerSigned=true.",
    ],
  };
}

export function buildIsiAgentsAdapterProposals(opts?: {
  createdAt?: string;
}): ModelProposalArtifact[] {
  return runIsiAgentsAdapter({ generatedAt: opts?.createdAt }).proposals;
}

export function serializeIsiAgentsAdapterBundle(
  bundle: IsiAgentsAdapterBundle = runIsiAgentsAdapter(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeIsiAgentsAdapterMarkdown(
  bundle: IsiAgentsAdapterBundle = runIsiAgentsAdapter(),
): string {
  const lines: string[] = [
    "# HSI ISI agents adapter proposals (research-test stub)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · runtime: **${bundle.runtime}** · generated ${bundle.generatedAt}`,
    "",
    `> **${bundle.banner}**`,
    "",
    "> ModelProposalArtifacts only. Gate C pending. Runtime out of repo.",
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
