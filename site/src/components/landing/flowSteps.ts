/** Shared investigation-path steps for public landing diagrams. Product truth only. */

export type FlowStep = {
  id: string;
  label: string;
  /** One-line explanation for the numbered flow list. */
  line: string;
};

/** Six-step spine used on Home and audience landings. */
export const INVESTIGATION_FLOW: readonly FlowStep[] = [
  {id: "question", label: "Question", line: "Frame the biological scope and decision the investigation must inform."},
  {id: "evidence", label: "Evidence", line: "Retrieve permitted public sources with provenance intact."},
  {id: "context", label: "Context", line: "Compare model, tissue, dose and endpoint before treating findings as contradiction."},
  {id: "graph", label: "Graph", line: "Inspect candidate relationships with source and review status attached."},
  {id: "gaps", label: "Gaps", line: "Surface what the graph does not yet connect; leave priority to human review."},
  {id: "brief", label: "Brief", line: "Export a reviewable brief that preserves limitations — not an auto-approved conclusion."},
] as const;

/** Eight-step platform path on How it works. */
export const PLATFORM_PATH: readonly FlowStep[] = [
  {id: "question", label: "Research question", line: "Define scope and the decision the work must inform."},
  {id: "evidence", label: "Permitted evidence", line: "Query configured public sources; failed retrievals stay visible."},
  {id: "context", label: "Experimental context", line: "Keep model, tissue, dose and endpoint visible — including Not stated."},
  {id: "conflict", label: "Conflicting findings", line: "Compare before declaring contradiction; abstain when contexts differ."},
  {id: "graph", label: "Mechanism graph", line: "Inspect candidate relationships on the published snapshot."},
  {id: "uncertainty", label: "Uncertainty", line: "Separate missing extraction, weak support and unresolved disagreement."},
  {id: "gaps", label: "Candidate gaps", line: "Surface unconnected areas; scientific priority stays human."},
  {id: "brief", label: "Reviewable brief", line: "Leave a structured brief with limitations — not an approved conclusion."},
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
    {id: "brief", label: "Brief", line: "State support, gaps and what a human must decide."},
  ],
  groups: [
    {id: "share-path", label: "Shared path", line: "Keep questions, evidence and briefs on one spine."},
    {id: "private", label: "Private work", line: "Personal notes stay private until sharing is enabled."},
    {id: "orient", label: "Orient", line: "Demonstration shells preview group orientation only."},
    {id: "review", label: "Human review", line: "Gate C stays human for collaborative scientific reviews."},
  ],
  biotech: [
    {id: "inspect", label: "Inspect", line: "Open provenance and missing fields before a claim."},
    {id: "traverse", label: "Traverse", line: "Follow candidate mechanisms with filters."},
    {id: "verify", label: "Verify", line: "Directional checks stay separate from publication."},
    {id: "pilot", label: "Pilot talk", line: "Contact is a draft — no MoU or performance claim."},
  ],
  clinical: [
    {id: "literature", label: "Literature", line: "Retrieve permitted evidence on the scientific plane."},
    {id: "context", label: "Context", line: "Compare experimental context before disagreement."},
    {id: "boundary", label: "Boundary", line: "Patient work stays on a separate governed plane."},
    {id: "synthetic", label: "Synthetic only", line: "This preview uses synthetic patients; no live CDS."},
  ],
  laboratories: [
    {id: "assay", label: "Assay context", line: "Keep assay and endpoint fields visible, including absence."},
    {id: "link", label: "Link", line: "Connect readouts to candidate mechanisms on the graph."},
    {id: "demo", label: "Lab shell", line: "Omics chrome is demonstration — not live instruments."},
    {id: "private", label: "Private data", line: "Private datasets and PHI stay out of this plane."},
  ],
  community: [
    {id: "vocab", label: "Vocabulary", line: "Point discussion at inspectable artefacts."},
    {id: "shell", label: "Shell", line: "Community chrome is demonstration-labelled."},
    {id: "circles", label: "Circles", line: "Durable collaboration store is not enabled."},
    {id: "gate", label: "Gate C", line: "Nothing auto-publishes; review stays human."},
  ],
  validation: [
    {id: "states", label: "States", line: "Observation, interpretation, verification and publication stay separate."},
    {id: "context", label: "Context first", line: "Opposite findings are not collapsed without review."},
    {id: "gold", label: "Gold sets", line: "Adjudicated cases stay human-gated."},
    {id: "provenance", label: "Provenance", line: "Source, context and review status stay attached."},
  ],
};
