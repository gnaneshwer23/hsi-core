/**
 * P3.1 thin OpenMM adapter spike — ModelProposalArtifacts only.
 *
 * Prefer OpenMM (research_ok_documented; blockedUntilSignOff=false) over
 * REINVENT4 for this slice: classical MD (no generative clinic path),
 * complements RDKit cheminformatics, no multi-GB weights, low commercial risk.
 * Optional live OpenMM via Python subprocess; otherwise deterministic stub.
 * Never sets hsiGrade / autoApprove / partnerSigned; no PHI; no CDS;
 * simulation metrics are not Gate C evidence alone.
 *
 * See docs/P3_ADAPTER_RFC.md.
 */
import { spawnSync } from "node:child_process";
import {
  assertSafeModelProposal,
  type ModelProposalArtifact,
} from "../modelProposal";
import { assertP3AdapterRunnable } from "../p3AdapterGate";

export const OPENMM_ADAPTER_ID = "adapter-openmm" as const;
export const OPENMM_ADAPTER_EXPORT_SCHEMA =
  "hsi-openmm-adapter-proposals-1" as const;
export const OPENMM_ADAPTER_RUNTIME_SCHEMA =
  "hsi-openmm-adapter-runtime-1" as const;

export type OpenmmRuntime = "stub" | "openmm";

export type OpenmmSystemFixture = {
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

/**
 * Deterministic public research fixtures:
 * - acetylcholine → α7 nAChR neighbourhood (neuroimmune HSI-E-NI-003)
 * - butyrate → mucosal SCFA neighbourhood (gut HSI-E-GUT-003)
 */
export const OPENMM_PUBLIC_SYSTEM_FIXTURES: readonly OpenmmSystemFixture[] = [
  {
    fixtureId: "ach",
    label: "Acetylcholine",
    // Canonical public SMILES (research MD fixture).
    smiles: "CC(=O)OCC[N+](C)(C)C",
    packHint: "pack:hsi-neuroimmune-pack",
    edgeHint: "edge:HSI-E-NI-003",
    proposedObject:
      "research MD energy/stability profile near α7 nAChR cholinergic anti-inflammatory neighbourhood",
    contextFrame:
      "P3.1 OpenMM spike — short vacuum minimization draft for public acetylcholine SMILES tied to seeded α7 nAChR edge. Not dosing, not CDS, not partnerSigned; MD ≠ Gate C evidence alone.",
  },
  {
    fixtureId: "butyrate",
    label: "Butyrate (butyric acid)",
    smiles: "CCCC(=O)O",
    packHint: "pack:hsi-gut-immune-pack",
    edgeHint: "edge:HSI-E-GUT-003",
    proposedObject:
      "research MD energy/stability profile for SCFA chemotype in mucosal SCFA↔Treg framing",
    contextFrame:
      "P3.1 OpenMM spike — short vacuum minimization draft for public butyrate SMILES tied to gut–immune pack. Not a therapeutic claim; hypothesized only; MD ≠ Gate C evidence alone.",
  },
] as const;

export type OpenmmSimulationSnapshot = {
  fixtureId: string;
  label: string;
  smiles: string;
  /** Potential energy after short minimize (kJ/mol). */
  potentialEnergyKjMol: number;
  /** Temperature set for integrator framing (K). */
  temperatureK: number;
  /** Minimization / dynamics steps attempted. */
  steps: number;
  /** Platform label when live; stub otherwise. */
  platform: string;
  runtime: OpenmmRuntime;
};

/**
 * Literature-stable stub MD metrics for fixtures (deterministic; no OpenMM required).
 * Approximate public research placeholders — not clinical claims / not trajectory evidence.
 */
export const OPENMM_STUB_METRICS: Record<
  string,
  Omit<
    OpenmmSimulationSnapshot,
    "runtime" | "fixtureId" | "label" | "smiles" | "platform"
  >
> = {
  ach: { potentialEnergyKjMol: -42.15, temperatureK: 300, steps: 50 },
  butyrate: { potentialEnergyKjMol: -18.62, temperatureK: 300, steps: 50 },
};

export type OpenmmAdapterBundle = {
  schemaVersion: typeof OPENMM_ADAPTER_EXPORT_SCHEMA;
  runtimeSchema: typeof OPENMM_ADAPTER_RUNTIME_SCHEMA;
  adapterId: typeof OPENMM_ADAPTER_ID;
  runtime: OpenmmRuntime;
  notCds: true;
  autoApprove: false;
  autoApproveIntoKg: false;
  mayFlipEvidenceGrade: false;
  vendorsModelWeights: false;
  emitsModelProposalOnly: true;
  containsPhi: false;
  partnerSigned: false;
  licenseGate: {
    adapterId: typeof OPENMM_ADAPTER_ID;
    signOffStatus: "research_ok_documented";
    blockedUntilSignOff: false;
    docsUrl: string;
  };
  generatedAt: string;
  simulations: OpenmmSimulationSnapshot[];
  proposals: ModelProposalArtifact[];
  instructions: string[];
};

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Try optional OpenMM via python3; return null if unavailable.
 * Uses a tiny vacuum HarmonicBond toy system keyed by SMILES length —
 * never downloads force-field files or multi-GB assets.
 */
export function tryComputeOpenmmMetrics(
  smiles: string,
): Omit<
  OpenmmSimulationSnapshot,
  "fixtureId" | "label" | "smiles" | "runtime"
> | null {
  const py = `
import json, sys
try:
    from openmm import Context, HarmonicBondForce, LangevinMiddleIntegrator, Platform, System, Vec3, unit
except Exception:
    sys.exit(2)

s = sys.argv[1]
n = max(2, min(8, len(s) // 4 + 2))
system = System()
for _ in range(n):
    system.addParticle(12.0 * unit.amu)
force = HarmonicBondForce()
k = 1000.0 * unit.kilojoule_per_mole / unit.nanometer**2
r0 = 0.15 * unit.nanometer
for i in range(n - 1):
    force.addBond(i, i + 1, r0, k)
system.addForce(force)
integrator = LangevinMiddleIntegrator(
    300 * unit.kelvin, 1.0 / unit.picosecond, 0.002 * unit.picoseconds
)
try:
    platform = Platform.getPlatformByName("Reference")
except Exception:
    platform = Platform.getPlatform(0)
ctx = Context(system, integrator, platform)
positions = [Vec3(i * 0.15, 0.0, 0.0) for i in range(n)] * unit.nanometer
ctx.setPositions(positions)
for _ in range(50):
    ctx.getIntegrator().step(1)
state = ctx.getState(getEnergy=True)
pe = state.getPotentialEnergy().value_in_unit(unit.kilojoule_per_mole)
print(json.dumps({
    "potentialEnergyKjMol": float(pe),
    "temperatureK": 300.0,
    "steps": 50,
    "platform": platform.getName(),
}))
`.trim();

  const result = spawnSync("python3", ["-c", py, smiles], {
    encoding: "utf8",
    timeout: 20_000,
  });
  if (result.status !== 0 || !result.stdout?.trim()) {
    return null;
  }
  try {
    const parsed = JSON.parse(result.stdout.trim()) as {
      potentialEnergyKjMol: number;
      temperatureK: number;
      steps: number;
      platform: string;
    };
    if (
      typeof parsed.potentialEnergyKjMol !== "number" ||
      typeof parsed.temperatureK !== "number" ||
      typeof parsed.steps !== "number" ||
      typeof parsed.platform !== "string"
    ) {
      return null;
    }
    return {
      potentialEnergyKjMol: round3(parsed.potentialEnergyKjMol),
      temperatureK: round3(parsed.temperatureK),
      steps: parsed.steps,
      platform: parsed.platform,
    };
  } catch {
    return null;
  }
}

export function resolveOpenmmSimulation(
  fixture: OpenmmSystemFixture,
  opts?: { preferRuntime?: OpenmmRuntime; forceStub?: boolean },
): OpenmmSimulationSnapshot {
  const stubBase = OPENMM_STUB_METRICS[fixture.fixtureId];
  if (!stubBase) {
    throw new Error(`Missing stub metrics for fixture ${fixture.fixtureId}`);
  }

  if (opts?.forceStub || opts?.preferRuntime === "stub") {
    return {
      fixtureId: fixture.fixtureId,
      label: fixture.label,
      smiles: fixture.smiles,
      ...stubBase,
      platform: "stub",
      runtime: "stub",
    };
  }

  const live = tryComputeOpenmmMetrics(fixture.smiles);
  if (live) {
    return {
      fixtureId: fixture.fixtureId,
      label: fixture.label,
      smiles: fixture.smiles,
      ...live,
      runtime: "openmm",
    };
  }

  return {
    fixtureId: fixture.fixtureId,
    label: fixture.label,
    smiles: fixture.smiles,
    ...stubBase,
    platform: "stub",
    runtime: "stub",
  };
}

export function simulationToModelProposal(
  fixture: OpenmmSystemFixture,
  sim: OpenmmSimulationSnapshot,
  createdAt: string,
): ModelProposalArtifact {
  const proposal: ModelProposalArtifact = {
    proposalId: `HSI-MP-OPENMM-${fixture.fixtureId.toUpperCase()}-001`,
    sourceAdapterOrAgent: OPENMM_ADAPTER_ID,
    proposedSubject: `${fixture.label} (public SMILES)`,
    proposedPredicate: "associated_with",
    proposedObject: fixture.proposedObject,
    contextNote: [
      fixture.contextFrame,
      `runtime=${sim.runtime}`,
      `md: PE=${sim.potentialEnergyKjMol} kJ/mol; T=${sim.temperatureK} K; steps=${sim.steps}; platform=${sim.platform}`,
      "ModelProposalArtifact only → Gate C pending; autoApprove=false; does not set hsiGrade.",
    ].join(" "),
    evidenceHints: [
      fixture.packHint,
      fixture.edgeHint,
      `smiles:${fixture.smiles}`,
      `runtime:${sim.runtime}`,
      "adapter:adapter-openmm",
      "axis:molecular-dynamics",
    ],
    suggestedTeachingStatus: "hypothesized",
    createdAt,
  };
  const safety = assertSafeModelProposal(
    proposal as unknown as Record<string, unknown>,
  );
  if (!safety.ok) {
    throw new Error(
      `OpenMM adapter produced unsafe proposal ${proposal.proposalId}: ${safety.reason}`,
    );
  }
  return proposal;
}

/**
 * Run the thin OpenMM adapter (license-gated).
 * Defaults to stub when OpenMM Python package is absent.
 */
export function runOpenmmAdapter(opts?: {
  generatedAt?: string;
  forceStub?: boolean;
  preferRuntime?: OpenmmRuntime;
}): OpenmmAdapterBundle {
  const licenseRow = assertP3AdapterRunnable(OPENMM_ADAPTER_ID);
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();

  const simulations = OPENMM_PUBLIC_SYSTEM_FIXTURES.map((f) =>
    resolveOpenmmSimulation(f, {
      forceStub: opts?.forceStub,
      preferRuntime: opts?.preferRuntime,
    }),
  );

  // Bundle runtime = openmm only when every simulation came from live OpenMM.
  const runtime: OpenmmRuntime = simulations.every((d) => d.runtime === "openmm")
    ? "openmm"
    : "stub";

  const proposals = OPENMM_PUBLIC_SYSTEM_FIXTURES.map((f, i) =>
    simulationToModelProposal(f, simulations[i]!, generatedAt),
  );

  return {
    schemaVersion: OPENMM_ADAPTER_EXPORT_SCHEMA,
    runtimeSchema: OPENMM_ADAPTER_RUNTIME_SCHEMA,
    adapterId: OPENMM_ADAPTER_ID,
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
      adapterId: OPENMM_ADAPTER_ID,
      signOffStatus: "research_ok_documented",
      blockedUntilSignOff: false,
      docsUrl: licenseRow.docsUrl,
    },
    generatedAt,
    simulations,
    proposals,
    instructions: [
      "P3.1 OpenMM thin adapter spike — ModelProposalArtifacts only → Gate C pending.",
      "Chosen over REINVENT4: classical MD (no generative clinic path), complements RDKit, no multi-GB weights.",
      "License gate: refuse adapters with blockedUntilSignOff=true (this row is research_ok_documented).",
      "runtime=stub when OpenMM Python is absent; runtime=openmm when python3+openmm compute succeeds.",
      "MD trajectories / energies are not Gate C evidence alone; packs remain authority.",
      "Never set hsiGrade / curationReview / autoApprove / partnerSigned=true.",
      "No PHI · no CDS · no multi-GB weights · no force-field asset vendoring.",
      "See docs/P3_ADAPTER_RFC.md · src/adapters/openmmAdapter.ts.",
    ],
  };
}

export function buildOpenmmAdapterProposals(opts?: {
  createdAt?: string;
  forceStub?: boolean;
}): ModelProposalArtifact[] {
  return runOpenmmAdapter({
    generatedAt: opts?.createdAt,
    forceStub: opts?.forceStub ?? true,
  }).proposals;
}

export function serializeOpenmmAdapterBundle(
  bundle: OpenmmAdapterBundle = runOpenmmAdapter({ forceStub: true }),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function serializeOpenmmAdapterMarkdown(
  bundle: OpenmmAdapterBundle = runOpenmmAdapter({ forceStub: true }),
): string {
  const lines: string[] = [
    "# HSI OpenMM adapter proposals (P3.1 spike)",
    "",
    `Schema: \`${bundle.schemaVersion}\` · runtime: **${bundle.runtime}** · generated ${bundle.generatedAt}`,
    "",
    "> ModelProposalArtifacts only. Gate C pending. autoApprove=false. does not set hsiGrade. notCds. partnerSigned=false. MD ≠ Gate C evidence alone.",
    "",
    "## License gate",
    "",
    `- adapterId: \`${bundle.licenseGate.adapterId}\``,
    `- signOffStatus: ${bundle.licenseGate.signOffStatus}`,
    `- blockedUntilSignOff: ${bundle.licenseGate.blockedUntilSignOff}`,
    `- docs: ${bundle.licenseGate.docsUrl}`,
    "",
    "## Simulations",
    "",
    "| Fixture | PE (kJ/mol) | T (K) | steps | platform | runtime |",
    "|---------|-------------|-------|-------|----------|---------|",
    ...bundle.simulations.map(
      (d) =>
        `| ${d.label} (\`${d.fixtureId}\`) | ${d.potentialEnergyKjMol} | ${d.temperatureK} | ${d.steps} | ${d.platform} | ${d.runtime} |`,
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
