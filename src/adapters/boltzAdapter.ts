/**
 * Thin Boltz adapter spike — ModelProposalArtifacts only (stub runtime).
 *
 * License: research_ok_documented (MIT documented) but proposals require
 * WEIGHTS_POLICY_ACK=true. Never vendor multi-GB weights; optional
 * BOLTZ_WEIGHTS_CACHE external path only.
 *
 * See docs/P3_WEIGHTS_AND_LICENSE_POLICY.md · docs/P3_ADAPTER_RFC.md.
 */
import {
  assertSafeModelProposal,
  type ModelProposalArtifact,
} from "../modelProposal";
import {
  assertBoltzAdapterRunnable,
  getOptionalBoltzWeightsCache,
  isWeightsPolicyAcked,
} from "../p3AdapterGate";

export const BOLTZ_ADAPTER_ID = "adapter-boltz" as const;
export const BOLTZ_ADAPTER_EXPORT_SCHEMA =
  "hsi-boltz-adapter-proposals-1" as const;
export const BOLTZ_ADAPTER_RUNTIME_SCHEMA =
  "hsi-boltz-adapter-runtime-1" as const;

export type BoltzRuntime = "stub";

export type BoltzStructureFixture = {
  fixtureId: string;
  label: string;
  uniprotAccession: string;
  packHint: string;
  edgeHint: string;
  proposedObject: string;
  contextFrame: string;
};

export const BOLTZ_PUBLIC_STRUCTURE_FIXTURES: readonly BoltzStructureFixture[] =
  [
    {
      fixtureId: "tnf",
      label: "TNF-α Boltz stub structure hypothesis",
      uniprotAccession: "P01375",
      packHint: "pack:hsi-pilot-evidence-pack",
      edgeHint: "edge:HSI-E-RA-001",
      proposedObject:
        "research Boltz stub complex/structure draft for TNF neighbourhood (hash/ref only; no weights vendored)",
      contextFrame:
        "Boltz stub — WEIGHTS_POLICY_ACK required. Optional BOLTZ_WEIGHTS_CACHE external only. Gate C pending.",
    },
    {
      fixtureId: "foxp3",
      label: "FOXP3 Boltz stub structure hypothesis",
      uniprotAccession: "Q9BZS1",
      packHint: "pack:hsi-gut-immune-pack",
      edgeHint: "edge:HSI-E-GUT-003",
      proposedObject:
        "research Boltz stub structure draft near mucosal Treg neighbourhood (hypothesized)",
      contextFrame:
        "Boltz stub — no multi-GB weight commit. See docs/P3_WEIGHTS_AND_LICENSE_POLICY.md.",
    },
  ] as const;

export type BoltzAdapterBundle = {
  schemaVersion: typeof BOLTZ_ADAPTER_EXPORT_SCHEMA;
  runtimeSchema: typeof BOLTZ_ADAPTER_RUNTIME_SCHEMA;
  adapterId: typeof BOLTZ_ADAPTER_ID;
  runtime: BoltzRuntime;
  notCds: true;
  autoApprove: false;
  autoApproveIntoKg: false;
  mayFlipEvidenceGrade: false;
  vendorsModelWeights: false;
  emitsModelProposalOnly: true;
  containsPhi: false;
  partnerSigned: false;
  weightsPolicyAck: true;
  externalWeightsCache: string | null;
  licenseGate: {
    adapterId: typeof BOLTZ_ADAPTER_ID;
    signOffStatus: string;
    blockedUntilSignOff: false;
    docsUrl: string;
    weightsPolicyDoc: "docs/P3_WEIGHTS_AND_LICENSE_POLICY.md";
  };
  generatedAt: string;
  fixtures: BoltzStructureFixture[];
  proposals: ModelProposalArtifact[];
  instructions: string[];
};

function fixtureToProposal(
  fixture: BoltzStructureFixture,
  createdAt: string,
  cache: string | null,
): ModelProposalArtifact {
  const proposal: ModelProposalArtifact = {
    proposalId: `HSI-MP-BOLTZ-${fixture.fixtureId.toUpperCase()}-001`,
    sourceAdapterOrAgent: BOLTZ_ADAPTER_ID,
    proposedSubject: `${fixture.label} (${fixture.uniprotAccession})`,
    proposedPredicate: "associated_with",
    proposedObject: fixture.proposedObject,
    contextNote: [
      fixture.contextFrame,
      "runtime=stub",
      `WEIGHTS_POLICY_ACK=true`,
      cache
        ? `BOLTZ_WEIGHTS_CACHE=${cache} (external; not vendored)`
        : "BOLTZ_WEIGHTS_CACHE unset",
      "ModelProposalArtifact only → Gate C pending; autoApprove=false; does not set hsiGrade.",
    ].join(" "),
    evidenceHints: [
      fixture.packHint,
      fixture.edgeHint,
      `uniprot:${fixture.uniprotAccession}`,
      "runtime:stub",
      "adapter:adapter-boltz",
      "WEIGHTS_POLICY_ACK:true",
      "vendorsModelWeights:false",
    ],
    suggestedTeachingStatus: "hypothesized",
    createdAt,
  };
  const safety = assertSafeModelProposal(
    proposal as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(
      `Boltz adapter produced unsafe proposal ${proposal.proposalId}: ${safety.reason}`,
    );
  }
  return proposal;
}

export function runBoltzAdapter(opts?: {
  generatedAt?: string;
  env?: NodeJS.ProcessEnv;
}): BoltzAdapterBundle {
  const env = opts?.env ?? process.env;
  const licenseRow = assertBoltzAdapterRunnable(undefined, env);
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const cache = getOptionalBoltzWeightsCache(env);

  const proposals = BOLTZ_PUBLIC_STRUCTURE_FIXTURES.map((f) =>
    fixtureToProposal(f, generatedAt, cache),
  );

  return {
    schemaVersion: BOLTZ_ADAPTER_EXPORT_SCHEMA,
    runtimeSchema: BOLTZ_ADAPTER_RUNTIME_SCHEMA,
    adapterId: BOLTZ_ADAPTER_ID,
    runtime: "stub",
    notCds: true,
    autoApprove: false,
    autoApproveIntoKg: false,
    mayFlipEvidenceGrade: false,
    vendorsModelWeights: false,
    emitsModelProposalOnly: true,
    containsPhi: false,
    partnerSigned: false,
    weightsPolicyAck: true,
    externalWeightsCache: cache,
    licenseGate: {
      adapterId: BOLTZ_ADAPTER_ID,
      signOffStatus: licenseRow.signOffStatus,
      blockedUntilSignOff: false,
      docsUrl: licenseRow.docsUrl,
      weightsPolicyDoc: "docs/P3_WEIGHTS_AND_LICENSE_POLICY.md",
    },
    generatedAt,
    fixtures: [...BOLTZ_PUBLIC_STRUCTURE_FIXTURES],
    proposals,
    instructions: [
      "Boltz thin adapter spike — stub ModelProposalArtifacts only → Gate C pending.",
      "Requires WEIGHTS_POLICY_ACK=true (docs/P3_WEIGHTS_AND_LICENSE_POLICY.md).",
      "Never vendor multi-GB weights; optional BOLTZ_WEIGHTS_CACHE is external only.",
      "Never set hsiGrade / autoApprove / partnerSigned=true.",
    ],
  };
}

export function buildBoltzAdapterProposals(opts?: {
  createdAt?: string;
  env?: NodeJS.ProcessEnv;
}): ModelProposalArtifact[] {
  return runBoltzAdapter({
    generatedAt: opts?.createdAt,
    env: opts?.env ?? { ...process.env, WEIGHTS_POLICY_ACK: "true" },
  }).proposals;
}

export function serializeBoltzAdapterBundle(
  bundle: BoltzAdapterBundle,
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeBoltzAdapterMarkdown(
  bundle: BoltzAdapterBundle,
): string {
  const lines: string[] = [
    "# HSI Boltz adapter proposals (weights-policy-gated stub)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · runtime: **${bundle.runtime}** · generated ${bundle.generatedAt}`,
    "",
    "> ModelProposalArtifacts only. WEIGHTS_POLICY_ACK=true. vendorsModelWeights=false. Gate C pending.",
    "",
    `External cache: ${bundle.externalWeightsCache ?? "(unset)"}`,
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

export { isWeightsPolicyAcked };
