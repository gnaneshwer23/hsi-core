/** P1.2: source-linked mechanism dossier projection over a governed research bundle.
 * Read-only: never approves claims, writes graph facts or infers causality.
 * The caller must authenticate and authorize access before supplying the bundle.
 */
import { parseResearchBundle, type ResearchBundle, type ResearchRelationship } from "./researchContracts";

export const MECHANISM_DOSSIER_VERSION = "hsi-mechanism-p1.2-1" as const;
export interface MechanismEvidence {
  claimId: string;
  support: ResearchBundle["claims"][number]["support"];
  curation: ResearchBundle["claims"][number]["curation"];
  assessmentKind: ResearchBundle["claims"][number]["assessmentKind"];
  sources: Array<{ sourceId: string; title: string; doi: string | null; pmid: string | null; url: string | null; passageId: string; locator: string; sourceVersion: string }>;
}
export interface MechanismEdge {
  relationshipId: string; subject: { id: string; label: string; type: string };
  predicate: string; object: { id: string; label: string; type: string };
  context: ResearchRelationship["context"];
  provenance: ResearchRelationship["provenance"];
  evidence: MechanismEvidence[];
  evidenceStatus: "approved_supported" | "mixed" | "unreviewed_or_insufficient";
}
export interface MechanismDossier {
  version: typeof MECHANISM_DOSSIER_VERSION;
  question: string; dataset: ResearchBundle["context"]["provenance"];
  diseaseContexts: Array<{ id: string; label: string }>;
  edges: MechanismEdge[];
  unsupportedRelationshipIds: string[];
  limitations: string[];
  status: "research_draft"; clinicalAdvice: false; kgWrite: false;
}
export function buildImmuneMechanismDossier(input: unknown, relationshipIds?: readonly string[]): MechanismDossier {
  const bundle = parseResearchBundle(input);
  if (bundle.context.containsPhi || bundle.clinicalAdvice || bundle.kgWrite) throw new Error("Research-only data required");
  if (relationshipIds && (relationshipIds.length > 120 || new Set(relationshipIds).size !== relationshipIds.length)) throw new Error("Invalid relationship selection");
  const entity = new Map(bundle.entities.map(e => [e.id, e]));
  const source = new Map(bundle.sources.map(s => [s.id, s]));
  const passage = new Map(bundle.passages.map(p => [p.id, p]));
  const relationships = new Map(bundle.relationships.map(r => [r.id, r]));
  if (relationshipIds?.some(id => !relationships.has(id))) throw new Error("Unknown relationship");
  const selected = (relationshipIds ?? bundle.relationships.map(r => r.id)).slice(0, 120);
  const edges = selected.map(id => {
    const r = relationships.get(id)!;
    const subject = entity.get(r.subjectId)!;
    const object = entity.get(r.objectId)!;
    const evidence = bundle.claims.filter(c => c.relationshipId === id).map(c => ({
      claimId: c.id, support: c.support, curation: c.curation, assessmentKind: c.assessmentKind,
      sources: c.passageIds.map(pid => {
        const p = passage.get(pid)!;
        const s = source.get(p.sourceId)!;
        return { sourceId: s.id, title: s.title, doi: s.doi, pmid: s.pmid, url: s.url, passageId: p.id, locator: p.locator, sourceVersion: p.sourceVersion };
      }),
    }));
    const approvedSupport = evidence.some(e => e.curation === "approved" && e.assessmentKind === "human" && e.support === "supports" && e.sources.length > 0);
    const conflicting = evidence.some(e => e.support === "contradicts" || e.support === "partial");
    return {
      relationshipId: id,
      subject: { id: subject.id, label: subject.label, type: subject.type },
      predicate: r.predicate, object: { id: object.id, label: object.label, type: object.type },
      context: r.context, provenance: r.provenance, evidence,
      evidenceStatus: conflicting ? "mixed" : approvedSupport ? "approved_supported" : "unreviewed_or_insufficient",
    } satisfies MechanismEdge;
  });
  return {
    version: MECHANISM_DOSSIER_VERSION, question: bundle.context.question, dataset: bundle.context.provenance,
    diseaseContexts: bundle.entities.filter(e => e.type === "disease" && (bundle.context.conceptIds.includes(e.id) || edges.some(x => x.subject.id === e.id || x.object.id === e.id))).map(e => ({ id: e.id, label: e.label })),
    edges, unsupportedRelationshipIds: edges.filter(e => e.evidenceStatus !== "approved_supported").map(e => e.relationshipId),
    limitations: [
      "Read-only projection of caller-supplied, validated research evidence; no live ISI query or external literature search.",
      "A graph relationship is not a causal finding; preserve species, tissue, assay and experimental context.",
      "No mapped contradiction does not establish consensus. Human scientific review is required before publication.",
      ...(bundle.relationships.length > 120 && !relationshipIds ? ["Graph projection limited to first 120 relationships."] : []),
    ],
    status: "research_draft", clinicalAdvice: false, kgWrite: false,
  };
}
