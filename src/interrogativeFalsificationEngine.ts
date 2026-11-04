/** ARCH-003 Step 5: falsification-first, conservative uncertainty analysis.
 * This module produces research-review signals, never scientific approval.
 * It does not search unpublished literature or infer causation from graph edges.
 */
import {validateInterrogativeInvestigation,type InterrogativeInvestigation,type EvidenceTrace,type HypothesisBranch} from "./interrogativeContracts";
export type ContradictionSignal={
 branchId:string;claimIds:readonly string[];
 kind:"opposing_reviewed_claims"|"context_divergence"|"evidence_gap";
 status:"candidate_requires_scientific_review";
 rationale:string;
};
export type FalsificationReport={
 schemaVersion:"hsi-falsification-report-1";
 investigationId:string;releaseManifestHash:string;
 signals:readonly ContradictionSignal[];
 branches:readonly {branchId:string;assessment:"contested"|"context_limited"|"insufficient_evidence";falsificationTest:string;missingEvidence:readonly string[];uncertainties:readonly string[]}[];
 limitations:readonly string[];
};
const OPPOSITES:Readonly<Record<string,string>>={promotes:"inhibits",inhibits:"promotes",increased_in:"decreased_in",decreased_in:"increased_in"};
function contextKey(x:EvidenceTrace){return JSON.stringify(Object.entries(x.context).sort(([a],[b])=>a.localeCompare(b)))}
function graphPair(x:EvidenceTrace){return x.graphPath.length===3?x.graphPath[0]+"|"+x.graphPath[2]:null}
function signalsForBranch(branch:HypothesisBranch):ContradictionSignal[]{
 const signals:ContradictionSignal[]=[];
 const traces=[...branch.supporting,...branch.opposing];
 const seen=new Set<string>();
 for(let i=0;i<traces.length;i++)for(let j=i+1;j<traces.length;j++){
  const a=traces[i]!,b=traces[j]!;
  if(a.claimId===b.claimId||!graphPair(a)||graphPair(a)!==graphPair(b))continue;
  const opposing=a.polarity!==b.polarity||OPPOSITES[a.graphPath[1]!]===b.graphPath[1];
  if(!opposing)continue;
  const sameContext=contextKey(a)===contextKey(b);
  const kind=sameContext?"opposing_reviewed_claims":"context_divergence";
  const ids=[a.claimId,b.claimId].sort();
  const key=kind+":"+ids.join("|");
  if(seen.has(key))continue;
  seen.add(key);
  signals.push({branchId:branch.id,claimIds:ids,kind,status:"candidate_requires_scientific_review",
   rationale:sameContext?"Potentially opposing reviewed graph assertions in the same represented context; study-level adjudication required":"Opposing directions across different represented contexts; not a confirmed contradiction"});
 }
 if(!branch.supporting.length&&!branch.opposing.length)signals.push({branchId:branch.id,claimIds:[],kind:"evidence_gap",status:"candidate_requires_scientific_review",rationale:"No eligible source-linked evidence in this investigation branch; absence is not negative evidence"});
 return signals;
}
export function evaluateSscFalsification(investigation:InterrogativeInvestigation):FalsificationReport{
 validateInterrogativeInvestigation(investigation);
 if(investigation.state!=="draft"||investigation.review!==null)throw Error("Falsification analysis requires an unreviewed investigation");
 const signals=investigation.branches.flatMap(signalsForBranch);
 return {schemaVersion:"hsi-falsification-report-1",investigationId:investigation.id,releaseManifestHash:investigation.release.manifestHash,
  signals,branches:investigation.branches.map(b=>{
   const local=signals.filter(s=>s.branchId===b.id);
   const contested=local.some(s=>s.kind==="opposing_reviewed_claims");
   const contextLimited=local.some(s=>s.kind==="context_divergence")||b.supporting.some(e=>Object.keys(e.context).length===0);
   return {branchId:b.id,assessment:contested?"contested" as const:contextLimited?"context_limited" as const:"insufficient_evidence" as const,
    falsificationTest:b.falsificationTest,
    missingEvidence:[...new Set([...b.missingEvidence,...(!b.opposing.length?["Independent null or opposing findings have not been established in this branch"]:[])])],
    uncertainties:[...new Set([...b.uncertainty,...local.map(s=>s.rationale),"Evidence coverage is restricted to the selected approved graph release; no causal conclusion is justified"])]};
  }),
  limitations:["Candidate contradiction signals require expert adjudication","Unpublished, retracted or unreviewed claims are not searched","Context equivalence uses exact represented fields and does not establish experimental comparability","No automatic publication or patient-level decision"]};
}
