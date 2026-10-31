/**
 * HSI Phase 0 — Safety release criteria v0 (shared checklist).
 * Enforce in product gates / CI later; this module is the canonical wording.
 */

export type HsiReleaseCriterion = {
  id: string;
  product: "aksh" | "isi" | "both";
  rule: string;
  /** What fails closed when violated. */
  failClosed: string;
};

export const HSI_SAFETY_RELEASE_CRITERIA_V0: readonly HsiReleaseCriterion[] = [
  {
    id: "HSI-SAFE-001",
    product: "both",
    rule: "No unsupported or automatic diagnosis.",
    failClosed: "Block any path that emits a diagnosis without clinician confirmation.",
  },
  {
    id: "HSI-SAFE-002",
    product: "aksh",
    rule: "CDS is HITL-only; no auto write-back to EHR / patient record.",
    failClosed: "Disable write-back adapters; suggestions remain advisory cards.",
  },
  {
    id: "HSI-SAFE-003",
    product: "both",
    rule: "No patient / identifiable data to LLMs in production.",
    failClosed: "Reject requests containing PHI markers; staging drills must pass.",
  },
  {
    id: "HSI-SAFE-004",
    product: "isi",
    rule: "ISI is educational / discovery — never marketed or labelled as CDS.",
    failClosed: "UI and exports must carry not-CDS labelling on research surfaces.",
  },
  {
    id: "HSI-SAFE-005",
    product: "both",
    rule: "Edges without hsiGrade=established + curation=approved are not CDS-actionable.",
    failClosed: "Aksh rules engine must refuse unsupported diagnosis / action paths.",
  },
  {
    id: "HSI-SAFE-006",
    product: "both",
    rule: "Agent surfaces stay frozen to allowed list until density exit criteria met.",
    failClosed: "Reject net-new agent demos without density KPI gate.",
  },
] as const;

export const HSI_ALLOWED_AGENT_SURFACES_V0 = [
  "isi-ask",
  "isi-research-radar",
  "isi-workbench-readonly",
  "aksh-hitl-cds",
] as const;

export function criterionIds(): string[] {
  return HSI_SAFETY_RELEASE_CRITERIA_V0.map((c) => c.id);
}
