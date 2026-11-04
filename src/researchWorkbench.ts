/** ARCH-002 Step 5: evidence-first research workbench on trusted graph snapshots.
 * No model inference, no scientific approval, no PHI, no autonomous publication.
 * The caller MUST obtain a trusted release snapshot from an authorised HSI service.
 */
import { assessReleaseClaim, queryPublishedGraph, type GraphQuery, type PublishedReleaseSnapshot, type ReleaseClaim } from "./graphRelease";
import { createHash } from "node:crypto";

export type ResearchEvidence = {
  claimId: string; assertion: string; subjectId: string; predicate: string; objectId: string;
  epistemicType: string; context: Record<string, unknown>;
  sources: ReleaseClaim["sources"]; reviewDecisionId: string | undefined;
};
export type ResearchInvestigation = {
  id: string; question: string; status: "evidence_found" | "insufficient_evidence";
  mode: "deterministic_release_analysis"; generatedAt: string;
  release: { id: string; version: string; manifestHash: string };
  evidence: ResearchEvidence[];
  contradictions: {claimIds: string[]; status: "candidate_requires_scientific_review"; reason: string}[];
  gaps: string[];
  hypotheses: {status: "unvalidated_hypothesis"; text: string}[];
  methods: string[]; limitations: string[];
};

function canonicalQuery(q: GraphQuery): GraphQuery {
  if (q.subjectId && q.subjectId.length > 200) throw Error("Invalid subject");
  if (q.objectId && q.objectId.length > 200) throw Error("Invalid object");
  if (q.predicate && q.predicate.length > 200) throw Error("Invalid predicate");
  return {subjectId:q.subjectId,objectId:q.objectId,predicate:q.predicate,limit:Math.min(q.limit ?? 50,100)};
}
export function investigatePublishedEvidence(
  question: string, snapshot: PublishedReleaseSnapshot, query: GraphQuery = {},
  generatedAt = new Date().toISOString(),
): ResearchInvestigation {
  const trimmed=question.trim();
  if (!trimmed || trimmed.length>500) throw Error("Research question must be 1–500 characters");
  if (!Number.isFinite(Date.parse(generatedAt))) throw Error("Invalid investigation time");
  const bounded=canonicalQuery(query);
  const found=queryPublishedGraph(snapshot,bounded);
  const evidence:ResearchEvidence[]=found.results.map(x=>({
    claimId:x.claimId,assertion:x.assertion,subjectId:x.subjectId,predicate:x.predicate,
    objectId:x.objectId,epistemicType:x.epistemicType,context:x.biologicalContext,
    sources:x.sources,reviewDecisionId:x.reviewDecisionId,
  }));
  const contradictions:ResearchInvestigation["contradictions"]=[];
  // Flag only directly opposite predicates on the same directed pair and comparable context.
  // Context matching is conservative: missing/unequal context never implies contradiction.
  const opposites:Record<string,string>={increased_in:"decreased_in",decreased_in:"increased_in",promotes:"inhibits",inhibits:"promotes"};
  for(let i=0;i<evidence.length;i++)for(let j=i+1;j<evidence.length;j++){
    const a=evidence[i]!,b=evidence[j]!;
    if(a.subjectId===b.subjectId && a.objectId===b.objectId &&
       opposites[a.predicate]===b.predicate &&
       JSON.stringify(a.context)===JSON.stringify(b.context)){
      contradictions.push({claimIds:[a.claimId,b.claimId],status:"candidate_requires_scientific_review",reason:"Opposing predicates with matching represented context; study-level review required"});
    }
  }
  const gaps:string[]=[];
  if(!evidence.length)gaps.push("No eligible evidence in the selected published release and query scope");
  if(evidence.length && evidence.every(e=>e.epistemicType==="observational_association"))gaps.push("Only observational associations found; mechanistic causality is not established");
  if(evidence.length===(bounded.limit??50))gaps.push("Query limit reached; additional evidence may be outside this result set");
  const hash=createHash("sha256").update(JSON.stringify({question:trimmed,releaseId:found.releaseId,manifestHash:found.manifestHash,query:bounded,claimIds:evidence.map(e=>e.claimId)})).digest("hex");
  return {
    id:"hsi-investigation-"+hash.slice(0,24),question:trimmed,status:evidence.length?"evidence_found":"insufficient_evidence",
    mode:"deterministic_release_analysis",generatedAt,
    release:{id:found.releaseId,version:found.releaseVersion,manifestHash:found.manifestHash},
    evidence,contradictions,gaps,hypotheses:[],
    methods:["Bounded exact-identifier graph filtering","Release eligibility re-evaluation","Conservative opposing-predicate comparison"],
    limitations:[
      "Not an LLM or autonomous multi-agent investigation",
      "No live literature retrieval, durable investigation storage or reviewer authentication",
      "A caller-provided snapshot is not independently authenticated by this module",
      "No hypothesis generation or clinical interpretation; no inference from absent evidence",
      "Release hash is not a cryptographic signature of scientific content",
    ],
  };
}
