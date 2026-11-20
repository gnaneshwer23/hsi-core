/** Shared investigation-path steps for public landing diagrams. Product truth only. */

export type FlowStep = {
  id: string;
  label: string;
  /** One-line explanation for the numbered flow list. */
  line: string;
};

/** Six-step spine used on Home and audience landings. */
export const INVESTIGATION_FLOW: readonly FlowStep[] = [
  {id: "question", label: "Question", line: "Frame scope and the decision to inform."},
  {id: "evidence", label: "Evidence", line: "Retrieve permitted sources with provenance."},
  {id: "context", label: "Context", line: "Compare model, tissue, dose and endpoint."},
  {id: "graph", label: "Graph", line: "Inspect candidates with source and status."},
  {id: "gaps", label: "Gaps", line: "Surface what is not yet connected."},
  {id: "brief", label: "Brief", line: "Export a reviewable brief — not an approval."},
] as const;

/** Eight-step platform path on How it works. */
export const PLATFORM_PATH: readonly FlowStep[] = [
  {id: "question", label: "Research question", line: "Define scope and decision."},
  {id: "evidence", label: "Permitted evidence", line: "Query public sources; failures stay visible."},
  {id: "context", label: "Experimental context", line: "Model, tissue, dose, endpoint — including Not stated."},
  {id: "conflict", label: "Conflicting findings", line: "Compare before contradiction; abstain when contexts differ."},
  {id: "graph", label: "Mechanism graph", line: "Candidate relationships on the published snapshot."},
  {id: "uncertainty", label: "Uncertainty", line: "Missing extraction, weak support, unresolved disagreement."},
  {id: "gaps", label: "Candidate gaps", line: "Unconnected areas; priority stays human."},
  {id: "brief", label: "Reviewable brief", line: "Structured brief with limitations — not an approval."},
] as const;

export type AudienceFlowVariant =
  | "researchers"
  | "groups"
  | "biotech"
  | "clinical"
  | "laboratories"
  | "community"
  | "validation";

/** Role-specific four-step entry flows (same engine, different entry emphasis). */
export const AUDIENCE_FLOWS: Record<AudienceFlowVariant, readonly FlowStep[]> = {
  researchers: [
    {id: "frame", label: "Frame", line: "Match concepts on the published graph."},
    {id: "retrieve", label: "Retrieve", line: "Query permitted sources with a run trace."},
    {id: "compare", label: "Compare", line: "Abstain when model, tissue or dose differ."},
    {id: "brief", label: "Brief", line: "State support, gaps and the human decision."},
  ],
  groups: [
    {id: "share-path", label: "Shared path", line: "Questions, evidence and briefs on one spine."},
    {id: "private", label: "Private work", line: "Notes stay private until sharing is enabled."},
    {id: "orient", label: "Orient", line: "Demo shells preview group orientation only."},
    {id: "review", label: "Human review", line: "Gate C stays human for collaborative reviews."},
  ],
  biotech: [
    {id: "inspect", label: "Inspect", line: "Open provenance and missing fields first."},
    {id: "traverse", label: "Traverse", line: "Follow candidate mechanisms with filters."},
    {id: "verify", label: "Verify", line: "Directional checks stay off publication."},
    {id: "pilot", label: "Pilot talk", line: "Contact is a draft — no MoU claimed."},
  ],
  clinical: [
    {id: "literature", label: "Literature", line: "Permitted evidence on the scientific plane."},
    {id: "context", label: "Context", line: "Compare experimental context before disagreement."},
    {id: "boundary", label: "Boundary", line: "Patient work stays on a separate plane."},
    {id: "synthetic", label: "Synthetic only", line: "Synthetic patients only; no live CDS."},
  ],
  laboratories: [
    {id: "assay", label: "Assay context", line: "Assay and endpoint stay visible, including absence."},
    {id: "link", label: "Link", line: "Connect readouts to candidate mechanisms."},
    {id: "demo", label: "Lab shell", line: "Omics chrome is demonstration — not instruments."},
    {id: "private", label: "Private data", line: "Private datasets and PHI stay out."},
  ],
  community: [
    {id: "vocab", label: "Vocabulary", line: "Point discussion at inspectable artefacts."},
    {id: "shell", label: "Shell", line: "Community chrome is demonstration-labelled."},
    {id: "circles", label: "Circles", line: "Durable collaboration store is not enabled."},
    {id: "gate", label: "Gate C", line: "Nothing auto-publishes; review stays human."},
  ],
  validation: [
    {id: "states", label: "States", line: "Observation through publication stay separate."},
    {id: "context", label: "Context first", line: "Opposite findings are not collapsed without review."},
    {id: "gold", label: "Gold sets", line: "Adjudicated cases stay human-gated."},
    {id: "provenance", label: "Provenance", line: "Source, context and review status stay attached."},
  ],
};
