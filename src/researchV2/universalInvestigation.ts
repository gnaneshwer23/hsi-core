/** B-04.1 additive, disease-independent research contract. No PHI or persistence. */
export const INVESTIGATION_V2_VERSION = "hsi-investigation-v2" as const;
export const EVIDENCE_STATES = ["raw_evidence","extracted_candidate","researcher_proposal","reviewed","approved","rejected","superseded"] as const;
export type EvidenceState = typeof EVIDENCE_STATES[number];
export type Domain = "immunology"|"genomics"|"neurobiology"|"metabolism"|"microbiome"|"drug_discovery"|"physiology"|"clinical_trials"|"other";
export interface InvestigationV2 {
 schemaVersion: typeof INVESTIGATION_V2_VERSION;
 id:string; question:string; diseaseIds:string[]; domains:Domain[];
 purpose:"research_only"; containsPhi:false; clinicalAdvice:false; livePersistence:false;
 sourceIds:string[]; createdAt:string;
}
export interface ContextualRelationshipV2 {
 id:string; subjectId:string; predicate:string; objectId:string;
 context:{diseaseIds:string[];species:string|null;tissueId:string|null;cellStateId:string|null;cohortId:string|null;method:string|null;timepoint:string|null};
 sourceRefs:string[]; state:EvidenceState; uncertainty:string|null;
 review:{reviewerRef:string;decisionId:string;at:string}|null;
 previousVersionId:string|null;
}
const safeId=/^[A-Za-z0-9][A-Za-z0-9:_.-]{0,127}$/;
function validId(s:unknown):s is string{return typeof s==="string"&&safeId.test(s)}
function uniqueIds(xs:unknown,max=100):xs is string[]{return Array.isArray(xs)&&xs.length<=max&&xs.every(validId)&&new Set(xs).size===xs.length}
export function parseInvestigationV2(v:unknown):InvestigationV2 {
 if(!v||typeof v!=="object"||Array.isArray(v))throw Error("Invalid investigation");
 const x=v as Record<string,unknown>;
 if(x.schemaVersion!==INVESTIGATION_V2_VERSION||!validId(x.id)||typeof x.question!=="string"||!x.question.trim()||x.question.length>4000||!uniqueIds(x.diseaseIds)||!uniqueIds(x.sourceIds)||!Array.isArray(x.domains)||x.domains.length>20||new Set(x.domains).size!==x.domains.length||x.domains.some(d=>!["immunology","genomics","neurobiology","metabolism","microbiome","drug_discovery","physiology","clinical_trials","other"].includes(d))||x.purpose!=="research_only"||x.containsPhi!==false||x.clinicalAdvice!==false||x.livePersistence!==false||typeof x.createdAt!=="string"||!Number.isFinite(Date.parse(x.createdAt)))throw Error("Invalid investigation contract");
 return x as unknown as InvestigationV2;
}
export function assertRelationshipV2(x:ContextualRelationshipV2):ContextualRelationshipV2 {
 if(!validId(x.id)||!validId(x.subjectId)||!validId(x.objectId)||!x.predicate||!x.context||!uniqueIds(x.context.diseaseIds)||!uniqueIds(x.sourceRefs,200)||!EVIDENCE_STATES.includes(x.state)||!x.sourceRefs.length)throw Error("Invalid contextual relationship");
 if(x.state==="approved"&&(!x.review?.reviewerRef||!x.review.decisionId))throw Error("Approved relationship requires recorded review");
 return x;
}
/** This transition guard is not a substitute for server-side authorization or independent review. */
export function transitionEvidenceState(current:EvidenceState,next:EvidenceState,reviewDecisionRecorded=false):EvidenceState {
 const allowed:Record<EvidenceState,EvidenceState[]>={
 raw_evidence:["extracted_candidate"],
 extracted_candidate:["researcher_proposal","rejected"],
 researcher_proposal:["reviewed","rejected"],
 reviewed:["approved","rejected","researcher_proposal"],
 approved:["superseded"],
 rejected:["researcher_proposal"],
 superseded:[]
 };
 if(!allowed[current].includes(next))throw Error("Disallowed evidence transition");
 if((next==="reviewed"||next==="approved")&&!reviewDecisionRecorded)throw Error("Independent review record required");
 return next;
}
