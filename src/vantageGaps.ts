/**
 * VANTAGE (deterministic): lists the evidence an audit is missing and phrases falsifiable follow-ups, always labelled
 * unvalidated. It reads only what the audit states is unreported, invents no findings, and never approves itself.
 * A model-backed proposer needs model approval and a preregistered comparison and is not built here.
 */
import type {ContextConflictAudit} from "./evidence/contextConflictAudit";

export type EvidenceGap={unitId:string;label:string;field:string;reason:string};
export type FalsifiableFollowUp={pairId:string;classification:string;proposal:string;wouldFalsify:string;status:"unvalidated_proposal";approved:false};
export type VantageResult={gaps:EvidenceGap[];followUps:FalsifiableFollowUp[];notice:string};
export const VANTAGE_NOTICE="VANTAGE items are unvalidated proposals derived from what the audit reports as missing. They are not findings, not knowledge, and need human review.";
const FOLLOW_UP=new Set(["insufficient_evidence","potential_conflict","context_dependent","methodological_difference"]);

export function proposeGaps(audit:ContextConflictAudit):VantageResult{
 const gaps:EvidenceGap[]=[];
 for(const u of audit.units){
  const fields=u.detailedContext?.fields;if(!fields)continue;
  for(const [field,v] of Object.entries(fields)){
   if(v.status!=="reported"&&v.status!=="not_applicable")gaps.push({unitId:u.id,label:u.label,field,reason:v.missingReason??v.status});
  }
 }
 const followUps:FalsifiableFollowUp[]=[];
 for(const r of audit.report){
  if(!FOLLOW_UP.has(r.classification))continue;
  const cmp=audit.comparisons.find(c=>c.id===r.comparisonId);if(!cmp)continue;
  const missing=gaps.filter(g=>g.unitId===cmp.left.id||g.unitId===cmp.right.id).map(g=>g.field);
  const fieldsText=[...new Set(missing)].slice(0,4).join(", ")||"the context axes that differ";
  followUps.push({pairId:r.comparisonId,classification:r.classification,
   proposal:`Report or measure ${fieldsText} for "${cmp.left.label}" and "${cmp.right.label}" under matched conditions.`,
   wouldFalsify:`If the findings still differ once ${fieldsText} are matched, a context explanation is not supported; if they agree, the apparent conflict is explained by context.`,
   status:"unvalidated_proposal",approved:false});
 }
 return {gaps,followUps,notice:VANTAGE_NOTICE};
}
