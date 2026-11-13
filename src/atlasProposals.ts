/**
 * ATLAS proposal path: turns audited evidence units into DRAFT canonical contextual edges, nothing more. A proposal is a
 * candidate for review: it is never approved, never promotable and never written to a graph here. Context the passage did
 * not report stays "not_reported" (unknown is never filled in), proximity or co-reporting is never treated as causation,
 * and a proposal without an https source URL or evidence record is refused rather than padded. Publication needs an
 * ARBITER review and a human decision elsewhere.
 */
import {createHash} from "node:crypto";
import type {ContextConflictAudit} from "./evidence/contextConflictAudit";
import {CANONICAL_EDGE_SCHEMA_VERSION,REQUIRED_CONTEXT,validateCanonicalEdge,type CanonicalContext,type CanonicalEvidenceEdge,type ContextKey,type ContextValue} from "./evidence/canonicalContextualEdge";
import type {DetailedContextField} from "./evidence/passageLinkedContext";

export type EdgeProposal={edge:CanonicalEvidenceEdge;auditHash:string;proposalHash:string;graphPromotable:false;scientificApproval:false};
export type ProposalRefusal={unitId:string;reasons:string[]};
export type ProposalBatch={schemaVersion:"hsi-atlas-proposals-1";auditHash:string;proposals:EdgeProposal[];refused:ProposalRefusal[];graphPromotable:false;scientificApproval:false};

/** Only unambiguous field mappings. Disease, parent gate and denominator are never inferred from a passage. */
const FIELD_FOR:Partial<Record<ContextKey,DetailedContextField>>={species:"species",tissue:"tissueCompartment",cellPopulation:"cellType",assay:"assay",timepoint:"timing",experimentalSystem:"experimentalSystem",endpoint:"readout"};
const sha=(t:string)=>createHash("sha256").update(t).digest("hex");
const stable=(v:unknown):string=>Array.isArray(v)?"["+v.map(stable).join(",")+"]":v&&typeof v==="object"?"{"+Object.keys(v as object).sort().map(k=>JSON.stringify(k)+":"+stable((v as Record<string,unknown>)[k])).join(",")+"}":JSON.stringify(v)??"null";
const polarity=(p:string):CanonicalEvidenceEdge["direction"]=>p==="supporting"||p==="supports"?"supports":p==="opposing"||p==="opposes"?"opposes":"inconclusive";

export function proposeEdgesFromAudit(input:{audit:ContextConflictAudit;submitterId:string;sourceUrls:Readonly<Record<string,string>>}):ProposalBatch{
 const {audit,submitterId,sourceUrls}=input;
 if(!submitterId||/^(reviewer|approver)/i.test(submitterId))throw Error("A proposer identity is required");
 const proposals:EdgeProposal[]=[],refused:ProposalRefusal[]=[];
 for(const unit of audit.units){
  const sourceId=unit.evidenceSourceIds[0]??"",url=sourceUrls[sourceId]??"",dc=unit.detailedContext??null,locator=dc?.locator??"";
  const context={} as Record<ContextKey,ContextValue>;
  for(const key of REQUIRED_CONTEXT){
   const field=FIELD_FOR[key],v=field&&dc?dc.fields[field]:undefined;
   context[key]=v&&v.status==="reported"&&v.originalText?{value:v.originalText,status:"reported",sourceLocator:locator}:{value:null,status:"not_reported"};
  }
  const edge:CanonicalEvidenceEdge={schemaVersion:CANONICAL_EDGE_SCHEMA_VERSION,id:"proposal-"+sha(audit.auditHash+"|"+unit.id).slice(0,24),
   subjectId:`${unit.subject.system}:${unit.subject.value}`,predicate:unit.predicate,objectId:`${unit.object.system}:${unit.object.value}`,direction:polarity(unit.findingPolarity),
   context:context as CanonicalContext,provenance:{sourceId,sourceUrl:url,sourceLocator:locator,evidenceRecordIds:[unit.id],extractionMethod:/^fixture-source-/.test(sourceId)?"synthetic":"assisted"},
   review:{state:"draft"},submitterId,synthetic:/^fixture-source-/.test(sourceId),
   limitations:["Candidate relationship from a single passage; not causal, not approved.","Unreported context is left unknown, not assumed."]};
  const errors=validateCanonicalEdge(edge);
  if(errors.length){refused.push({unitId:unit.id,reasons:errors});continue}
  proposals.push({edge,auditHash:audit.auditHash,proposalHash:sha(stable(edge)),graphPromotable:false,scientificApproval:false});
 }
 return {schemaVersion:"hsi-atlas-proposals-1",auditHash:audit.auditHash,proposals,refused,graphPromotable:false,scientificApproval:false};
}

/** Guard for any future write path: only untouched drafts may be stored as proposals. */
export function assertProposalOnly(p:EdgeProposal):void{
 if(p.edge.review.state!=="draft"||p.graphPromotable!==false||p.scientificApproval!==false)throw Error("Only draft proposals may be stored");
 if(p.proposalHash!==sha(stable(p.edge)))throw Error("Proposal was altered after it was built");
}
