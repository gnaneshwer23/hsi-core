/**
 * P3.0 thin RDKit adapter spike — ModelProposalArtifacts only.
 *
 * Prefer BSD RDKit (research_ok_documented; blockedUntilSignOff=false).
 * Optional live RDKit via Python subprocess; otherwise deterministic stub.
 * Never sets hsiGrade / autoApprove / partnerSigned; no PHI; no CDS;
 * no multi-GB weights.
 *
 * See docs/P3_ADAPTER_RFC.md.
 */
import { spawnSync } from "node:child_process";
import {
  assertSafeModelProposal,
  type ModelProposalArtifact,
} from "../modelProposal";
import { assertP3AdapterRunnable } from "../p3AdapterGate";

export const RDKIT_ADAPTER_ID = "adapter-rdkit" as const;
export const RDKIT_ADAPTER_EXPORT_SCHEMA =
  "hsi-rdkit-adapter-proposals-1" as const;
export const RDKIT_ADAPTER_RUNTIME_SCHEMA =
  "hsi-rdkit-adapter-runtime-1" as const;

export type RdkitRuntime = "stub" | "rdkit";

export type RdkitMoleculeFixture = {
  fixtureId: string;
  label: string;
  /** Public research SMILES only — never clinic / identifiable sequences. */
  smiles: string;
  /** Pack / edge citation context for proposal evidenceHints. */
  packHint: string;
  edgeHint: string;
  proposedObject: string;
  contextFrame: string;
};

/** Deterministic public research fixtures (RA MTX + gut SCFA neighbourhoods). */
export const RDKIT_PUBLIC_MOLECULE_FIXTURES: readonly RdkitMoleculeFixture[] = [
  {
    fixtureId: "mtx",
    label: "Methotrexate",
    // Canonical public SMILES (research cheminformatics fixture).
    smiles:
      "CN(Cc1cnc2nc(N)nc(N)c2n1)c1ccc(C(=O)N[C@@H](CCC(=O)O)C(=O)O)cc1",
    packHint: "pack:hsi-pilot-evidence-pack",
    edgeHint: "edge:HSI-E-RA-012",
    proposedObject:
      "research cheminformatics property profile (MW/LogP/TPSA) in anti-TNF + MTX neighbourhood",
    contextFrame:
      "P3.0 RDKit spike — descriptor draft for public MTX SMILES tied to seeded ATTRACT/MTX combo edge. Not dosing, not CDS, not partnerSigned.",
  },
  {
    fixtureId: "butyrate",
    label: "Butyrate (butyric acid)",
    smiles: "CCCC(=O)O",
    packHint: "pack:hsi-gut-immune-pack",
    edgeHint: "edge:HSI-E-GUT-003",
    proposedObject:
      "SCFA chemotype descriptor profile for mucosal SCFA↔Treg research framing",
    contextFrame:
      "P3.0 RDKit spike — descriptor draft for public butyrate SMILES tied to gut–immune pack. Not a therapeutic claim; hypothesized only.",
  },
] as const;

export type RdkitDescriptorSnapshot = {
  fixtureId: string;
  label: string;
  smiles: string;
  mw: number;
  logp: number;
  tpsa: number;
  hbd: number;
  hba: number;
  runtime: RdkitRuntime;
};

/**
 * Literature-stable stub descriptors for fixtures (deterministic; no RDKit required).
 * Values are approximate public cheminformatics references — not clinical claims.
 */
export const RDKIT_STUB_DESCRIPTORS: Record<
  string,
  Omit<RdkitDescriptorSnapshot, "runtime" | "fixtureId" | "label" | "smiles">
> = {
  mtx: { mw: 454.44, logp: -1.85, tpsa: 210.54, hbd: 5, hba: 12 },
  butyrate: { mw: 88.11, logp: 0.79, tpsa: 37.3, hbd: 1, hba: 2 },
};

export type RdkitAdapterBundle = {
  schemaVersion: typeof RDKIT_ADAPTER_EXPORT_SCHEMA;
  runtimeSchema: typeof RDKIT_ADAPTER_RUNTIME_SCHEMA;
  adapterId: typeof RDKIT_ADAPTER_ID;
  runtime: RdkitRuntime;
  notCds: true;
  autoApprove: false;
  autoApproveIntoKg: false;
  mayFlipEvidenceGrade: false;
  vendorsModelWeights: false;
  emitsModelProposalOnly: true;
  containsPhi: false;
  partnerSigned: false;
  licenseGate: {
    adapterId: typeof RDKIT_ADAPTER_ID;
    signOffStatus: "research_ok_documented";
    blockedUntilSignOff: false;
    docsUrl: string;
  };
  generatedAt: string;
  descriptors: RdkitDescriptorSnapshot[];
  proposals: ModelProposalArtifact[];
  instructions: string[];
};

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Try optional RDKit via python3; return null if unavailable. */
export function tryComputeRdkitDescriptors(
  smiles: string,
): Omit<
  RdkitDescriptorSnapshot,
  "fixtureId" | "label" | "smiles" | "runtime"
> | null {
  const py = `
import json, sys
try:
    from rdkit import Chem
    from rdkit.Chem import Descriptors, Crippen, rdMolDescriptors
except Exception:
    sys.exit(2)
s = sys.argv[1]
m = Chem.MolFromSmiles(s)
if m is None:
    sys.exit(3)
print(json.dumps({
    "mw": float(Descriptors.MolWt(m)),
    "logp": float(Crippen.MolLogP(m)),
    "tpsa": float(rdMolDescriptors.CalcTPSA(m)),
    "hbd": int(rdMolDescriptors.CalcNumHBD(m)),
    "hba": int(rdMolDescriptors.CalcNumHBA(m)),
}))
`.trim();

  const result = spawnSync("python3", ["-c", py, smiles], {
    encoding: "utf8",
    timeout: 15_000,
  });
  if (result.status !== 0 || !result.stdout?.trim()) {
    return null;
  }
  try {
    const parsed = JSON.parse(result.stdout.trim()) as {
      mw: number;
      logp: number;
      tpsa: number;
      hbd: number;
      hba: number;
    };
    if (
      typeof parsed.mw !== "number" ||
      typeof parsed.logp !== "number" ||
      typeof parsed.tpsa !== "number" ||
      typeof parsed.hbd !== "number" ||
      typeof parsed.hba !== "number"
    ) {
      return null;
    }
    return {
      mw: round3(parsed.mw),
      logp: round3(parsed.logp),
      tpsa: round3(parsed.tpsa),
      hbd: parsed.hbd,
      hba: parsed.hba,
    };
  } catch {
    return null;
  }
}

export function resolveRdkitDescriptors(
  fixture: RdkitMoleculeFixture,
  opts?: { preferRuntime?: RdkitRuntime; forceStub?: boolean },
): RdkitDescriptorSnapshot {
  const stubBase = RDKIT_STUB_DESCRIPTORS[fixture.fixtureId];
  if (!stubBase) {
    throw new Error(`Missing stub descriptors for fixture ${fixture.fixtureId}`);
  }

  if (opts?.forceStub || opts?.preferRuntime === "stub") {
    return {
      fixtureId: fixture.fixtureId,
      label: fixture.label,
      smiles: fixture.smiles,
      ...stubBase,
      runtime: "stub",
    };
  }

  const live = tryComputeRdkitDescriptors(fixture.smiles);
  if (live) {
    return {
      fixtureId: fixture.fixtureId,
      label: fixture.label,
      smiles: fixture.smiles,
      ...live,
      runtime: "rdkit",
    };
  }

  return {
    fixtureId: fixture.fixtureId,
    label: fixture.label,
    smiles: fixture.smiles,
    ...stubBase,
    runtime: "stub",
  };
}

export function descriptorToModelProposal(
  fixture: RdkitMoleculeFixture,
  desc: RdkitDescriptorSnapshot,
  createdAt: string,
): ModelProposalArtifact {
  const proposal: ModelProposalArtifact = {
    proposalId: `HSI-MP-RDKIT-${fixture.fixtureId.toUpperCase()}-001`,
    sourceAdapterOrAgent: RDKIT_ADAPTER_ID,
    proposedSubject: `${fixture.label} (public SMILES)`,
    proposedPredicate: "associated_with",
    proposedObject: fixture.proposedObject,
    contextNote: [
      fixture.contextFrame,
      `runtime=${desc.runtime}`,
      `descriptors: MW=${desc.mw}; LogP=${desc.logp}; TPSA=${desc.tpsa}; HBD=${desc.hbd}; HBA=${desc.hba}`,
      "ModelProposalArtifact only → Gate C pending; autoApprove=false; does not set hsiGrade.",
    ].join(" "),
    evidenceHints: [
      fixture.packHint,
      fixture.edgeHint,
      `smiles:${fixture.smiles}`,
      `runtime:${desc.runtime}`,
      "adapter:adapter-rdkit",
      "axis:cheminformatics",
    ],
    suggestedTeachingStatus: "hypothesized",
    createdAt,
  };
  const safety = assertSafeModelProposal(
    proposal as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(
      `RDKit adapter produced unsafe proposal ${proposal.proposalId}: ${safety.reason}`,
    );
  }
  return proposal;
}

/**
 * Run the thin RDKit adapter (license-gated).
 * Defaults to stub when RDKit Python package is absent.
 */
export function runRdkitAdapter(opts?: {
  generatedAt?: string;
  forceStub?: boolean;
  preferRuntime?: RdkitRuntime;
}): RdkitAdapterBundle {
  const licenseRow = assertP3AdapterRunnable(RDKIT_ADAPTER_ID);
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();

  const descriptors = RDKIT_PUBLIC_MOLECULE_FIXTURES.map((f) =>
    resolveRdkitDescriptors(f, {
      forceStub: opts?.forceStub,
      preferRuntime: opts?.preferRuntime,
    }),
  );

  // Bundle runtime = rdkit only when every descriptor came from live RDKit.
  const runtime: RdkitRuntime = descriptors.every((d) => d.runtime === "rdkit")
    ? "rdkit"
    : "stub";

  const proposals = RDKIT_PUBLIC_MOLECULE_FIXTURES.map((f, i) =>
    descriptorToModelProposal(f, descriptors[i]!, generatedAt),
  );

  return {
    schemaVersion: RDKIT_ADAPTER_EXPORT_SCHEMA,
    runtimeSchema: RDKIT_ADAPTER_RUNTIME_SCHEMA,
    adapterId: RDKIT_ADAPTER_ID,
    runtime,
    notCds: true,
    autoApprove: false,
    autoApproveIntoKg: false,
    mayFlipEvidenceGrade: false,
    vendorsModelWeights: false,
    emitsModelProposalOnly: true,
    containsPhi: false,
    partnerSigned: false,
    licenseGate: {
      adapterId: RDKIT_ADAPTER_ID,
      signOffStatus: "research_ok_documented",
      blockedUntilSignOff: false,
      docsUrl: licenseRow.docsUrl,
    },
    generatedAt,
    descriptors,
    proposals,
    instructions: [
      "P3.0 RDKit thin adapter spike — ModelProposalArtifacts only → Gate C pending.",
      "License gate: refuse adapters with blockedUntilSignOff=true (this row is research_ok_documented).",
      "runtime=stub when RDKit Python is absent; runtime=rdkit when python3+rdkit compute succeeds.",
      "Never set hsiGrade / curationReview / autoApprove / partnerSigned=true.",
      "No PHI · no CDS · no multi-GB weights · packs remain evidence authority.",
      "See docs/P3_ADAPTER_RFC.md · src/adapters/rdkitAdapter.ts.",
    ],
  };
}

export function buildRdkitAdapterProposals(opts?: {
  createdAt?: string;
  forceStub?: boolean;
}): ModelProposalArtifact[] {
  return runRdkitAdapter({
    generatedAt: opts?.createdAt,
    forceStub: opts?.forceStub ?? true,
  }).proposals;
}

export function serializeRdkitAdapterBundle(
  bundle: RdkitAdapterBundle = runRdkitAdapter({ forceStub: true }),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeRdkitAdapterMarkdown(
  bundle: RdkitAdapterBundle = runRdkitAdapter({ forceStub: true }),
): string {
  const lines: string[] = [
    "# HSI RDKit adapter proposals (P3.0 spike)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · runtime: **${bundle.runtime}** · generated ${bundle.generatedAt}`,
    "",
    "> ModelProposalArtifacts only. Gate C pending. autoApprove=false. does not set hsiGrade. notCds. partnerSigned=false.",
    "",
    "## License gate",
    "",
    `- adapterId: \`${bundle.licenseGate.adapterId}\``,
    `- signOffStatus: ${bundle.licenseGate.signOffStatus}`,
    `- blockedUntilSignOff: ${bundle.licenseGate.blockedUntilSignOff}`,
    `- docs: ${bundle.licenseGate.docsUrl}`,
    "",
    "## Descriptors",
    "",
    "| Fixture | MW | LogP | TPSA | HBD | HBA | runtime |",
    "|---------|----|------|------|-----|-----|---------|",
    ...bundle.descriptors.map(
      (d) =>
        `| ${d.label} (\`${d.fixtureId}\`) | ${d.mw} | ${d.logp} | ${d.tpsa} | ${d.hbd} | ${d.hba} | ${d.runtime} |`,
    ),
    "",
    "## Proposals",
    "",
    "| Proposal | S — P — O | Teaching | Evidence |",
    "|----------|-----------|----------|----------|",
    ...bundle.proposals.map((p) => {
      const hints = p.evidenceHints.slice(0, 3).join("; ");
      return `| \`${p.proposalId}\` | ${p.proposedSubject} — ${p.proposedPredicate} — ${p.proposedObject} | ${p.suggestedTeachingStatus} | ${hints} |`;
    }),
    "",
    "## Instructions",
    "",
    ...bundle.instructions.map((i) => `- ${i}`),
    "",
  ];
  return `${lines.join("\n")}\n`;
}
