/**
 * Thin AlphaFold3 adapter spike — ModelProposalArtifacts only (stub runtime).
 *
 * Unblocked via research sign-off fixture (signed_research_test_only):
 * notCommercial=true · replaceWithLegalSignOff=true · NEVER commercial AF3 rights.
 * Never vendors weights. Gate C pending only.
 *
 * See docs/P3_ADAPTER_RFC.md · docs/P3_WEIGHTS_AND_LICENSE_POLICY.md.
 */
import {
  assertSafeModelProposal,
  type ModelProposalArtifact,
} from "../modelProposal";
import { assertP3AdapterRunnable } from "../p3AdapterGate";
import { getResearchSignOffFixture } from "../researchSignOffFixture";

export const AF3_ADAPTER_ID = "adapter-af3" as const;
export const AF3_ADAPTER_EXPORT_SCHEMA =
  "hsi-af3-adapter-proposals-1" as const;
export const AF3_ADAPTER_RUNTIME_SCHEMA =
  "hsi-af3-adapter-runtime-1" as const;

export type Af3Runtime = "stub";

export type Af3StructureFixture = {
  fixtureId: string;
  label: string;
  /** Public UniProt accession only — never PHI sequences. */
  uniprotAccession: string;
  packHint: string;
  edgeHint: string;
  proposedObject: string;
  contextFrame: string;
};

export const AF3_PUBLIC_STRUCTURE_FIXTURES: readonly Af3StructureFixture[] = [
  {
    fixtureId: "tnf",
    label: "TNF-α (public UniProt) structure hypothesis",
    uniprotAccession: "P01375",
    packHint: "pack:hsi-pilot-evidence-pack",
    edgeHint: "edge:HSI-E-RA-001",
    proposedObject:
      "research AF3 stub structure-confidence draft for TNF pathway neighbourhood (not a grade; not CDS)",
    contextFrame:
      "AF3 research-test stub — NOT commercial AF3 rights. Loud fixture banner. Gate C pending only.",
  },
  {
    fixtureId: "il21",
    label: "IL-21 (public UniProt) structure hypothesis",
    uniprotAccession: "Q9HBE4",
    packHint: "pack:hsi-ssc-pathway-pack",
    edgeHint: "edge:HSI-E-SSC-002",
    proposedObject:
      "research AF3 stub structure draft for IL-21 / Tfh neighbourhood (hypothesized; dual-track SSc)",
    contextFrame:
      "AF3 research-test stub — SSc secondary pack cite only. notCommercial=true. No weight vendoring.",
  },
] as const;

export type Af3AdapterBundle = {
  schemaVersion: typeof AF3_ADAPTER_EXPORT_SCHEMA;
  runtimeSchema: typeof AF3_ADAPTER_RUNTIME_SCHEMA;
  adapterId: typeof AF3_ADAPTER_ID;
  runtime: Af3Runtime;
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
  commercialAf3RightsClaimed: false;
  banner: string;
  licenseGate: {
    adapterId: typeof AF3_ADAPTER_ID;
    signOffStatus: string;
    blockedUntilSignOff: false;
    docsUrl: string;
  };
  generatedAt: string;
  fixtures: Af3StructureFixture[];
  proposals: ModelProposalArtifact[];
  instructions: string[];
};

function fixtureToProposal(
  fixture: Af3StructureFixture,
  createdAt: string,
): ModelProposalArtifact {
  const proposal: ModelProposalArtifact = {
    proposalId: `HSI-MP-AF3-${fixture.fixtureId.toUpperCase()}-001`,
    sourceAdapterOrAgent: AF3_ADAPTER_ID,
    proposedSubject: `${fixture.label} (${fixture.uniprotAccession})`,
    proposedPredicate: "associated_with",
    proposedObject: fixture.proposedObject,
    contextNote: [
      fixture.contextFrame,
      "runtime=stub",
      "ModelProposalArtifact only → Gate C pending; autoApprove=false; does not set hsiGrade.",
      "NOT commercial AlphaFold3 rights.",
    ].join(" "),
    evidenceHints: [
      fixture.packHint,
      fixture.edgeHint,
      `uniprot:${fixture.uniprotAccession}`,
      "runtime:stub",
      "adapter:adapter-af3",
      "notCommercial:true",
      "replaceWithLegalSignOff:true",
      "commercialAf3RightsClaimed:false",
    ],
    suggestedTeachingStatus: "hypothesized",
    createdAt,
  };
  const safety = assertSafeModelProposal(
    proposal as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(
      `AF3 adapter produced unsafe proposal ${proposal.proposalId}: ${safety.reason}`,
    );
  }
  return proposal;
}

export function runAf3Adapter(opts?: {
  generatedAt?: string;
}): Af3AdapterBundle {
  const licenseRow = assertP3AdapterRunnable(AF3_ADAPTER_ID);
  const fixture = getResearchSignOffFixture(AF3_ADAPTER_ID);
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const banner =
    fixture?.banner ??
    "RESEARCH SIGN-OFF FIXTURE — AF3 non-commercial / research-test only; NOT commercial AF3 rights";

  const proposals = AF3_PUBLIC_STRUCTURE_FIXTURES.map((f) =>
    fixtureToProposal(f, generatedAt),
  );

  return {
    schemaVersion: AF3_ADAPTER_EXPORT_SCHEMA,
    runtimeSchema: AF3_ADAPTER_RUNTIME_SCHEMA,
    adapterId: AF3_ADAPTER_ID,
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
    commercialAf3RightsClaimed: false,
    banner,
    licenseGate: {
      adapterId: AF3_ADAPTER_ID,
      signOffStatus: licenseRow.signOffStatus,
      blockedUntilSignOff: false,
      docsUrl: licenseRow.docsUrl,
    },
    generatedAt,
    fixtures: [...AF3_PUBLIC_STRUCTURE_FIXTURES],
    proposals,
    instructions: [
      "AF3 thin adapter spike — stub ModelProposalArtifacts only → Gate C pending.",
      banner,
      "notCommercial=true · replaceWithLegalSignOff=true · commercialAf3RightsClaimed=false.",
      "Never vendor AF3 weights into hsi-core. See docs/P3_WEIGHTS_AND_LICENSE_POLICY.md.",
      "Never set hsiGrade / autoApprove / partnerSigned=true.",
    ],
  };
}

export function buildAf3AdapterProposals(opts?: {
  createdAt?: string;
}): ModelProposalArtifact[] {
  return runAf3Adapter({ generatedAt: opts?.createdAt }).proposals;
}

export function serializeAf3AdapterBundle(
  bundle: Af3AdapterBundle = runAf3Adapter(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeAf3AdapterMarkdown(
  bundle: Af3AdapterBundle = runAf3Adapter(),
): string {
  const lines: string[] = [
    "# HSI AlphaFold3 adapter proposals (research-test stub)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · runtime: **${bundle.runtime}** · generated ${bundle.generatedAt}`,
    "",
    `> **${bundle.banner}**`,
    "",
    "> ModelProposalArtifacts only. Gate C pending. autoApprove=false. notCommercial=true. NOT commercial AF3 rights. No weight vendoring.",
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
