/**
 * Aksh Health agent catalog in hsi-core.
 *
 * Inventory only — not an executable clinical loop, not live CDS.
 * Provenance: gnaneshwer23/aksh-health-redesign@404026eaada304f732226a51b9434b32fb6c6d47
 * See docs/AKSH_AGENTS_IN_HSI.md and aksh/PROVENANCE.md.
 */

export const AKSH_AGENT_CATALOG_SCHEMA = "hsi-aksh-agent-catalog-1" as const;

export const AKSH_AGENT_PROVENANCE = {
  repo: "https://github.com/gnaneshwer23/aksh-health-redesign",
  commit: "404026eaada304f732226a51b9434b32fb6c6d47",
  directoryPath: "packages/platform-uk/lib/agents.ts",
  registerPath: "packages/platform-uk/lib/agents/register.ts",
} as const;

export type AkshDirectoryAgentName =
  | "CANVAS"
  | "SYNTHESIS"
  | "BRIDGE"
  | "NEXUS"
  | "GUARDIAN"
  | "PRISM"
  | "HORIZON"
  | "PATHWAY"
  | "COMPASS"
  | "ATLAS"
  | "SHIELD"
  | "CONDUCTOR";

export type AkshRegisterAgentId =
  | "CONDUCTOR"
  | "VOICE"
  | "CANVAS"
  | "SYNTHESIS"
  | "DrASSIST"
  | "GUARDIAN"
  | "HORIZON"
  | "NEXUS"
  | "PATHWAY"
  | "BRIDGE"
  | "SHIELD"
  | "COMPASS"
  | "PRISM"
  | "ATLAS";

export type AkshDirectoryEntry = {
  name: AkshDirectoryAgentName;
  role: string;
  category: string;
  phase: number;
  live: boolean;
  status: "in_validation" | "roadmap";
  kind: string;
  previously: string;
};

export type AkshRegisterEntry = {
  id: AkshRegisterAgentId;
  productName: string;
  role: string;
  stage: string;
  trigger: string;
  partOf: AkshRegisterAgentId | null;
  legacyIds: string[];
  status: "in_validation" | "planned";
  environment: "simulation" | "none";
};

export type AkshAgentCatalog = {
  schemaVersion: typeof AKSH_AGENT_CATALOG_SCHEMA;
  notCds: true;
  clinicalActive: false;
  autoApprove: false;
  purpose: string;
  provenance: typeof AKSH_AGENT_PROVENANCE;
  directory: readonly AkshDirectoryEntry[];
  register: readonly AkshRegisterEntry[];
  subCapabilities: readonly {
    id: string;
    label: string;
    partOf: AkshRegisterAgentId;
    note: string;
  }[];
  outOfRegistry: readonly { id: string; label: string; note: string }[];
  aliasMap: readonly { canonical: string; legacy: readonly string[] }[];
  reviewOrder: {
    normal: readonly string[];
    urgent: readonly string[];
  };
  hsiRelation: {
    akenoConsumerPath: "/akeno";
    akshAgentsPath: "/aksh-agents";
    note: string;
  };
};

/** Canonical 12-agent directory (July 2026 naming). */
export const AKSH_AGENT_DIRECTORY: readonly AkshDirectoryEntry[] = [
  {
    name: "CANVAS",
    role: "Clinical Intake Agent",
    category: "Intake",
    phase: 1,
    live: true,
    status: "in_validation",
    kind: "intelligence_llm",
    previously: "unnamed (intake generation / shared patient context)",
  },
  {
    name: "SYNTHESIS",
    role: "Clinical Documentation Agent",
    category: "Documentation",
    phase: 1,
    live: true,
    status: "in_validation",
    kind: "intelligence_llm",
    previously: "SYNTHESIS",
  },
  {
    name: "BRIDGE",
    role: "Interoperability Agent",
    category: "Integration",
    phase: 1,
    live: true,
    status: "in_validation",
    kind: "data_interop",
    previously: "unnamed (Medplum staging / FHIR mapping)",
  },
  {
    name: "NEXUS",
    role: "Clinical Intelligence Agent",
    category: "Intelligence",
    phase: 1,
    live: true,
    status: "in_validation",
    kind: "intelligence_llm",
    previously: "new capability",
  },
  {
    name: "GUARDIAN",
    role: "Medication Intelligence Agent",
    category: "Safety",
    phase: 1,
    live: true,
    status: "in_validation",
    kind: "safety_governance",
    previously: "GUARDIAN",
  },
  {
    name: "PRISM",
    role: "Imaging Intelligence Agent",
    category: "Imaging",
    phase: 2,
    live: false,
    status: "in_validation",
    kind: "intelligence_llm",
    previously: "new agent (roadmap)",
  },
  {
    name: "HORIZON",
    role: "Predictive Risk Agent",
    category: "Risk",
    phase: 1,
    live: true,
    status: "in_validation",
    kind: "intelligence_llm",
    previously: "ORACLE",
  },
  {
    name: "PATHWAY",
    role: "Care Coordination Agent",
    category: "Coordination",
    phase: 1,
    live: true,
    status: "in_validation",
    kind: "intervention",
    previously: "REFERRAL",
  },
  {
    name: "COMPASS",
    role: "Population Health Agent",
    category: "Population",
    phase: 1,
    live: true,
    status: "in_validation",
    kind: "intelligence_llm",
    previously: "EQUITY",
  },
  {
    name: "ATLAS",
    role: "Clinical Research Agent",
    category: "Research",
    phase: 2,
    live: false,
    status: "in_validation",
    kind: "intelligence_llm",
    previously: "new agent (roadmap)",
  },
  {
    name: "SHIELD",
    role: "Regulatory & Audit Agent",
    category: "Governance",
    phase: 1,
    live: true,
    status: "in_validation",
    kind: "safety_governance",
    previously: "SHIELD",
  },
  {
    name: "CONDUCTOR",
    role: "Supervisor Agent",
    category: "Orchestration",
    phase: 1,
    live: true,
    status: "in_validation",
    kind: "orchestration",
    previously: "unnamed (clinical-spine orchestrate)",
  },
] as const;

/** Full register (14 named agents including VOICE + DrASSIST sub-capabilities). */
export const AKSH_AGENT_REGISTER: readonly AkshRegisterEntry[] = [
  {
    id: "CONDUCTOR",
    productName: "Aksh Orchestrator",
    role: "Supervisor: runs the agents in a fixed order against one shared patient context, sets priority, review order and safety route, hands drafts to the clinician",
    stage: "orchestrate",
    trigger: "case_run",
    partOf: null,
    legacyIds: [],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "VOICE",
    productName: "Aksh Voice",
    role: "Consultation capture: dictation to a transcript with a confidence score",
    stage: "intake",
    trigger: "intake_session",
    partOf: "CANVAS",
    legacyIds: [],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "CANVAS",
    productName: "Aksh Canvas",
    role: "Clinical intake: structures the consultation into draft resources with a trace from each value to its source",
    stage: "intake",
    trigger: "intake_session",
    partOf: null,
    legacyIds: [],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "SYNTHESIS",
    productName: "Aksh Synthesis",
    role: "Clinical documentation: structured consultation note (SOAP) draft",
    stage: "draft",
    trigger: "conductor_parallel",
    partOf: null,
    legacyIds: [],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "DrASSIST",
    productName: "DrAssist AI",
    role: "Coding support and context: SNOMED CT / ICD-10 suggestions with confidence",
    stage: "code",
    trigger: "conductor_after",
    partOf: "SYNTHESIS",
    legacyIds: ["DR_ASSIST"],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "GUARDIAN",
    productName: "Aksh Guardian",
    role: "Medication safety: interactions, allergies and low-glucose risk; the only source of safety urgency",
    stage: "safety",
    trigger: "conductor_parallel",
    partOf: null,
    legacyIds: [],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "HORIZON",
    productName: "Aksh Horizon",
    role: "Risk and trajectory: the single composite risk score, with contributing factors",
    stage: "risk",
    trigger: "conductor_parallel",
    partOf: null,
    legacyIds: ["ORACLE"],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "NEXUS",
    productName: "Aksh Nexus",
    role: "Clinical correlation: two or three cross-signal links worth considering, always a draft",
    stage: "correlate",
    trigger: "conductor_parallel",
    partOf: null,
    legacyIds: [],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "PATHWAY",
    productName: "Aksh Pathway",
    role: "Care coordination: referral package once the assessment is accepted",
    stage: "coordinate",
    trigger: "after_note_and_codes_accepted",
    partOf: null,
    legacyIds: ["REFERRAL"],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "BRIDGE",
    productName: "Aksh Bridge",
    role: "Interoperability: stages the accepted case as FHIR R4; never writes to a live record",
    stage: "stage",
    trigger: "after_case_accepted",
    partOf: null,
    legacyIds: [],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "SHIELD",
    productName: "Aksh Shield",
    role: "Governance and audit: append-only, hash-chained record of every agent run and every decision",
    stage: "audit",
    trigger: "every_event",
    partOf: null,
    legacyIds: [],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "COMPASS",
    productName: "Aksh Compass",
    role: "Population health: aggregate disparity brief; never names a patient",
    stage: "population",
    trigger: "on_request",
    partOf: null,
    legacyIds: ["EQUITY"],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "PRISM",
    productName: "Aksh Prism",
    role: "Imaging intelligence: synthetic DICOM-metadata eval scaffold (Phase 2 / P4)",
    stage: "imaging",
    trigger: "on_request",
    partOf: null,
    legacyIds: [],
    status: "in_validation",
    environment: "simulation",
  },
  {
    id: "ATLAS",
    productName: "Aksh Trials Agent",
    role: "Clinical research: protocol eligibility eval on controlled synthetic data (Phase 2 / P4)",
    stage: "research",
    trigger: "on_request",
    partOf: null,
    legacyIds: [],
    status: "in_validation",
    environment: "simulation",
  },
] as const;

export const AKSH_AGENT_ALIASES = [
  { canonical: "HORIZON", legacy: ["ORACLE"] as const },
  { canonical: "COMPASS", legacy: ["EQUITY"] as const },
  { canonical: "PATHWAY", legacy: ["REFERRAL"] as const },
  { canonical: "DrASSIST", legacy: ["DR_ASSIST", "Dr.Assist"] as const },
] as const;

export const AKSH_OUT_OF_REGISTRY = [
  {
    id: "VOICE_CARE",
    label: "VOICE CARE",
    note: "Synthetic Day-3 outbound escalation — not the VOICE agent; not a directory peer.",
  },
  {
    id: "CAUSAL_AI",
    label: "Causal AI",
    note: "Precision-health hypothesis stub.",
  },
  {
    id: "NUTRITION",
    label: "NUTRITION",
    note: "Deterministic coaching module (precision-health).",
  },
  {
    id: "SLEEP",
    label: "SLEEP",
    note: "Deterministic coaching module (precision-health).",
  },
  {
    id: "EXERCISE",
    label: "EXERCISE",
    note: "Deterministic coaching module (precision-health).",
  },
  {
    id: "MENTAL_HEALTH",
    label: "MENTAL_HEALTH",
    note: "Deterministic coaching module (precision-health).",
  },
  {
    id: "GUARDIAN_GATEWAY",
    label: "Guardian Gateway",
    note: "PASS/REVIEW/BLOCK pre-enqueue gate — not the GUARDIAN agent itself.",
  },
] as const;

export function listAkshDirectoryNames(): AkshDirectoryAgentName[] {
  return AKSH_AGENT_DIRECTORY.map((a) => a.name);
}

export function listAkshRegisterIds(): AkshRegisterAgentId[] {
  return AKSH_AGENT_REGISTER.map((a) => a.id);
}

export function listAllAkshAgentNames(): string[] {
  const names = new Set<string>();
  for (const a of AKSH_AGENT_DIRECTORY) names.add(a.name);
  for (const a of AKSH_AGENT_REGISTER) {
    names.add(a.id);
    for (const leg of a.legacyIds) names.add(leg);
  }
  for (const a of AKSH_AGENT_ALIASES) {
    names.add(a.canonical);
    for (const leg of a.legacy) names.add(leg);
  }
  for (const m of AKSH_OUT_OF_REGISTRY) names.add(m.id);
  return [...names].sort();
}

export function canonicalAkshAgentId(id: string): string {
  const upper = id.trim();
  for (const a of AKSH_AGENT_REGISTER) {
    if (a.id === upper || a.legacyIds.includes(upper)) return a.id;
  }
  for (const alias of AKSH_AGENT_ALIASES) {
    if (alias.canonical === upper || (alias.legacy as readonly string[]).includes(upper)) {
      return alias.canonical;
    }
  }
  return upper;
}

export function buildAkshAgentCatalog(): AkshAgentCatalog {
  return {
    schemaVersion: AKSH_AGENT_CATALOG_SCHEMA,
    notCds: true,
    clinicalActive: false,
    autoApprove: false,
    purpose:
      "Inventory of Aksh Health agent names/roles for HSI HITL / translation consumers — not an executable clinical loop.",
    provenance: AKSH_AGENT_PROVENANCE,
    directory: AKSH_AGENT_DIRECTORY,
    register: AKSH_AGENT_REGISTER,
    subCapabilities: [
      {
        id: "VOICE",
        label: "VOICE",
        partOf: "CANVAS",
        note: "Dictation feeds CANVAS — not a peer directory entry.",
      },
      {
        id: "DrASSIST",
        label: "Dr.Assist",
        partOf: "SYNTHESIS",
        note: "Coding drafts under SYNTHESIS / HITL — not a peer directory entry.",
      },
    ],
    outOfRegistry: [...AKSH_OUT_OF_REGISTRY],
    aliasMap: AKSH_AGENT_ALIASES.map((a) => ({
      canonical: a.canonical,
      legacy: [...a.legacy],
    })),
    reviewOrder: {
      normal: ["SYNTHESIS", "GUARDIAN", "HORIZON", "NEXUS", "DrASSIST"],
      urgent: ["GUARDIAN", "HORIZON", "SYNTHESIS", "NEXUS", "DrASSIST"],
    },
    hsiRelation: {
      akenoConsumerPath: "/akeno",
      akshAgentsPath: "/aksh-agents",
      note: "HSI consumes translation handoff with HITL fail-closed stubs. Agent names are reference inventory; no Aksh/Akeno Neon; no live CDS in hsi-core.",
    },
  };
}

export function serializeAkshAgentCatalog(catalog = buildAkshAgentCatalog()): string {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}
