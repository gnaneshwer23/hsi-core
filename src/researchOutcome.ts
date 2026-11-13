import {verifyContextAuditReview,type ContextAuditReview} from "./evidence/contextAuditReview";
import {validateContextConflictAudit,renderValidatedContextConflictAudit,contextAuditInvestigation,type ContextConflictAudit} from "./evidence/contextConflictAudit";
/** Deterministic composition of a saved, verified research package. No new scientific inference or approval. */
import {canonicalGraphContext} from "./investigationGraphContext";
import {verifyReviewPackage,verifyDeliveryDecision,type EvidenceBrief} from "./investigationDelivery";
import type {EvidenceTrace} from "./interrogativeValidation";
import {
  projectLivingEvidenceForOutcome,
  type LivingEvidenceExpansionSnapshot,
  type LivingEvidenceOutcomeSection,
} from "./evidence/livingEvidenceExpansion";
import {
  projectGapVerificationForOutcome,
  type GapVerificationOutcomeSection,
} from "./evidence/gapVerification";
import {
  projectTranslationalForOutcome,
  type TranslationalLandscapeSnapshot,
  type TranslationalOutcomeSection,
} from "./evidence/translationalEvidenceAttach";
import {
  integrateResearchBrief,
  type IntegratedResearchBrief,
} from "./evidence/researchBriefIntegration";
import type {ContradictionInvestigationAssessment} from "./evidence/structuredEvidenceComparison";
export const RESEARCH_OUTCOME_VERSION="hsi-research-outcome-1" as const;
export const RESEARCH_OUTCOME_METHOD="hsi-bound-outcome-projection-1" as const;
export type Digest=(text:string)=>Promise<string>;
export type ResearchOutcomeOptions={
  contextConflictAudit?:ContextConflictAudit|null;
  contextConflictAuditReview?:ContextAuditReview|null;
  livingEvidenceSnapshot?:LivingEvidenceExpansionSnapshot|null;
  /** PR 7 / O-04 translational landscape bind. */
  translationalLandscape?:TranslationalLandscapeSnapshot|null;
  /** Optional pre-built integrated brief; otherwise composed when translational is bound. */
  researchBrief?:IntegratedResearchBrief|null;
  /** M2 deepen — thin O-02 hook for structured contradiction investigation categories. */
  contradictionInvestigation?:ContradictionInvestigationAssessment|null;
};
export type OutcomeAttachmentBinding={investigationId:string;packageHash:string;contextHash:string;releaseId:string;manifestHash:string;attachmentsHash:string};
/** Trusted backend authority must bind independently stored attachments to this exact package. */
export type OutcomeAttachmentAuthority={authorize:(binding:Readonly<OutcomeAttachmentBinding>)=>Promise<boolean>};
const unique=<T>(values:readonly T[])=>[...new Set(values)];
function exact(value:unknown,keys:string[]){if(!value||typeof value!=="object"||Array.isArray(value)||Object.keys(value).sort().join(",")!==[...keys].sort().join(","))throw Error("Invalid research outcome input fields")}
function contextFor(brief:EvidenceBrief,relationshipId:string){
 const e=brief.package.context.primary,r=e.bundle.relationships.find(r=>r.id===relationshipId)!;
 return {disease:e.disease,studyContext:e.studyContexts[r.id]!,species:r.context.species,experimentalSystem:r.context.experimentalSystem,tissueId:r.context.tissueId,assay:r.context.assay,timepoint:r.context.timepoint,diseaseStage:null,cellState:null,dose:null,cohort:null};
}
function projectResearchOutcome(brief:EvidenceBrief,options:ResearchOutcomeOptions={},attachmentBinding:OutcomeAttachmentBinding|null=null){
 const p=brief.package,i=p.investigation,e=p.context.primary,b=e.bundle;
 const claimById=new Map(b.claims.map(c=>[c.id,c])),relationshipById=new Map(b.relationships.map(r=>[r.id,r]));
 const sourceIdsFor=(claimId:string)=>unique(claimById.get(claimId)!.passageIds.map(id=>b.passages.find(p=>p.id===id)!.sourceId));
 function trace(t:EvidenceTrace){
  const c=claimById.get(t.claimId);if(!c||t.reviewDecisionId!==c.review!.decisionId||!t.sourceIds.length||!unique(t.sourceIds).every(id=>sourceIdsFor(c.id).includes(id))||t.evidenceKind!==e.epistemicTypes[c.relationshipId]||t.graphPath.some(id=>!relationshipById.has(id))||(t.graphPath.length>0&&!t.graphPath.includes(c.relationshipId)))throw Error("Outcome trace is outside the reviewed primary source context");
  const actual=contextFor(brief,c.relationshipId);
  if(!t.context||Object.entries(t.context).some(([key,value])=>!Object.hasOwn(actual,key)||canonicalGraphContext(value)!==canonicalGraphContext(actual[key as keyof typeof actual])))throw Error("Outcome trace overrides or invents biological context");
  for(let n=1;n<t.graphPath.length;n++){const a=relationshipById.get(t.graphPath[n-1]!)!,r=relationshipById.get(t.graphPath[n]!)!;if(![a.subjectId,a.objectId].some(id=>id===r.subjectId||id===r.objectId))throw Error("Disconnected outcome graph path")}
  return c.id;
 }
 const branches=i.branches.map(branch=>{
  const supporting=branch.supporting.map(trace),opposing=branch.opposing.map(trace);
  if(unique(supporting).length!==supporting.length||unique(opposing).length!==opposing.length||supporting.some(id=>opposing.includes(id)))throw Error("Ambiguous or duplicated branch evidence binding");
  if(!["supported","partially_supported","contested","context_limited","inconclusive","insufficient_evidence"].includes(branch.assessment)||!Array.isArray(branch.missingEvidence)||!Array.isArray(branch.uncertainty)||branch.missingEvidence.length>30||branch.uncertainty.length>30||[...branch.missingEvidence,...branch.uncertainty,branch.falsificationTest].some(s=>typeof s!=="string"||!s.trim()||s.length>2000))throw Error("Invalid bounded hypothesis metadata");
  return {id:branch.id,questionId:branch.questionId,statement:branch.statement,classification:branch.classification,assessment:branch.assessment,supportingClaimIds:supporting,opposingClaimIds:opposing,missingEvidence:[...branch.missingEvidence],uncertainty:[...branch.uncertainty],falsificationCriteria:branch.falsificationTest,predictedObservation:null,suggestedExperiment:null,requiredControls:null,experimentalPlanStatus:"not_specified" as const,interpretation:"saved_candidate_requires_independent_assessment" as const};
 });
 if(i.conclusion.assessment==="supported"&&!branches.some(b=>b.assessment==="supported"&&b.supportingClaimIds.length>0&&b.classification!=="unvalidated_hypothesis"))throw Error("Saved supported conclusion has no bound supported branch");
 const questions=i.questions.map(q=>{if(!["clarify","discriminate","falsify"].includes(q.purpose)||!["pending","answered","unanswerable"].includes(q.status))throw Error("Invalid recorded question state");return {id:q.id,parentId:q.parentId,text:q.text,purpose:q.purpose,depth:q.depth,status:q.status,branchIds:branches.filter(b=>b.questionId===q.id).map(b=>b.id)}});
 const scopeReview=/\b(?:this patient|my patient|diagnose|prescribe|diabetes|glyca?emic|hba1c|crohn|multiple sclerosis)\b/i.test(i.question);
 const supportingClaimIds=unique(branches.flatMap(b=>b.supportingClaimIds)),opposingClaimIds=unique(branches.flatMap(b=>b.opposingClaimIds));
 const methods=i.provenance.agentRuns.map(r=>{
  if([r.agentId,r.version,r.modelVersion,r.promptVersion].some(v=>typeof v!=="string"||!(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/).test(v))||!Array.isArray(r.toolCalls))throw Error("Unbounded method metadata");
  return {agentId:r.agentId,version:r.version,modelVersion:r.modelVersion,promptVersion:r.promptVersion,toolCallCount:r.toolCalls.length};
 });
 const d=brief.decision;
 const livingEvidence:LivingEvidenceOutcomeSection=projectLivingEvidenceForOutcome({
  sourcePmids:b.sources.map(s=>s.pmid),
  snapshot:options.livingEvidenceSnapshot??null,
 });
 const externalSearch=options.contextConflictAudit
  ?{id:"external_search" as const,status:"bounded_context_audit_recorded" as const,detail:"Bounded support/oppose search receipts attached. Inspect failed/empty searches and missing context; no exhaustive search or consensus is established."}
  :livingEvidence.status==="bound_metadata_refresh"
  ?{id:"external_search" as const,status:"living_evidence_metadata_bound" as const,detail:"Europe PMC / Open Targets / registry identity metadata bound for overlapping pins. Passage import remains fail-closed; not an exhaustive literature search."}
  :{id:"external_search" as const,status:"not_recorded" as const,detail:"This contract has no complete external literature or contradiction-search audit. Living evidence expansion may be available as a programme snapshot when source PMIDs overlap pins."};
 const derivedInvestigation=options.contextConflictAudit?contextAuditInvestigation(options.contextConflictAudit):null;
 if(derivedInvestigation&&options.contradictionInvestigation&&canonicalGraphContext(derivedInvestigation)!==canonicalGraphContext(options.contradictionInvestigation))throw Error("Contradiction assessment differs from the bound context audit");
 const investigation=derivedInvestigation??options.contradictionInvestigation??null;
 const investigationNote=investigation
  ?` Structured contradiction investigation attached (${investigation.items.length} categor${investigation.items.length===1?"y":"ies"}; predeterminedConclusions=false; not LLM-verified).`
  :"";
 const contradictions={recordedOpposingClaimIds:opposingClaimIds,searchStatus:options.contextConflictAudit?"bounded_context_audit_recorded" as const:"not_recorded" as const,consensusEstablished:false,note:(opposingClaimIds.length?"Recorded opposing references require context-specific expert interpretation. Their presence is not an exhaustive contradiction search.":"No opposing traces are recorded in this saved investigation. This does not establish that no contradictory evidence exists.")+investigationNote,investigationCategories:investigation?unique(investigation.items.map(i=>i.category)):[],structuredComparisonIds:investigation?unique(investigation.items.map(i=>i.comparisonId)):[],predeterminedConclusions:false as const,scientificallyVerified:false as const};
 const gapVerification:GapVerificationOutcomeSection=projectGapVerificationForOutcome({
  asOf:livingEvidence.asOf??p.context.capturedAt,
  branches,
  claimContexts:b.claims.map(c=>({claimId:c.id,context:contextFor(brief,c.relationshipId)})),
  localSourcePmids:b.sources.map(s=>s.pmid),
  contradictions,
  livingEvidence,
  contradictionInvestigation:investigation,
 });
 const trials=projectTrialsSection(options.translationalLandscape);
 const researchBrief=projectResearchBriefSection({
  question:i.question,
  options,
  trials,
  gapVerification,
  livingEvidence,
 });
 return {schemaVersion:RESEARCH_OUTCOME_VERSION,method:RESEARCH_OUTCOME_METHOD,investigationId:i.id,question:i.question,
  binding:{packageHash:p.packageHash,contextHash:p.context.contentHash,investigationHash:p.investigationHash,releaseId:e.release.id,releaseVersion:e.release.version,manifestHash:e.release.manifestHash,submissionId:brief.submission?.id??null,decisionHash:d?.decisionHash??null},
  scope:{purpose:"research_only" as const,sourceDisease:e.disease,patientDataConnected:false,clinicalAdvice:false,graphPublicationApproved:false,questionFit:scopeReview?"scope_review_required" as const:"pinned_scope_only" as const,semanticScopeValidated:false},
  answer:{summary:scopeReview?"The saved systemic-sclerosis source context does not establish an answer to this patient-specific or out-of-scope question.":i.conclusion.text,summaryOrigin:scopeReview?"scope_gate" as const:"saved_conclusion" as const,evidenceStatus:scopeReview?"insufficient_evidence" as const:i.conclusion.assessment,savedAssessment:i.conclusion.assessment,scientificTruthEstablished:false,confidence:{status:"not_calibrated" as const,value:null,method:null},limitations:unique([...i.conclusion.limitations,...p.limitations,"A source citation or brief acceptance does not establish that the overall answer is scientifically correct.","Question-scope checking is a conservative keyword screen, not semantic validation."])},
  stages:[{id:"question_plan",status:"recorded",detail:"Saved questions and candidate branches; no newly executed planner."},{id:"data_context",status:"research_sources_only",detail:"No clinical, wearable, microbiome, omics or patient timeline connection is supplied by this outcome."},{id:"source_context",status:"captured",detail:"Fixed source release, passages and current access are checked by the backend."},{id:"branch_evidence",status:supportingClaimIds.length||opposingClaimIds.length?"recorded_bindings":"not_bound",detail:"Capturing graph context does not assign it to candidate branches."},externalSearch,{id:"scientific_synthesis",status:"not_executed_by_projection",detail:"No LLM, new causal chain, ranking or model confidence is generated here."},{id:"human_review",status:d?"decision_recorded":"not_recorded",detail:"A recorded decision is scoped to the evidence brief."}],
  mechanismMap:{scope:"primary_release_context" as const,causalClaim:false,nodes:b.entities.map(n=>({id:n.id,label:n.label,type:n.type})),edges:b.relationships.map(r=>({id:r.id,subjectId:r.subjectId,predicate:r.predicate,objectId:r.objectId,claimIds:b.claims.filter(c=>c.relationshipId===r.id).map(c=>c.id),epistemicType:e.epistemicTypes[r.id]!,context:contextFor(brief,r.id),causalClaim:false}))},
  evidence:b.claims.map(c=>({claimId:c.id,statement:c.statement,relationshipId:c.relationshipId,passageIds:[...c.passageIds],sourceIds:sourceIdsFor(c.id),context:contextFor(brief,c.relationshipId),epistemicType:e.epistemicTypes[c.relationshipId]!,sourceHumanReview:{status:"recorded_approved_support" as const,decisionId:c.review!.decisionId,reviewedAt:c.review!.reviewedAt},supportingBranchIds:branches.filter(b=>b.supportingClaimIds.includes(c.id)).map(b=>b.id),opposingBranchIds:branches.filter(b=>b.opposingClaimIds.includes(c.id)).map(b=>b.id),semanticBranchSupportVerified:false})),
  sources:b.sources.map(s=>({id:s.id,title:s.title,pmid:s.pmid,doi:s.doi,url:s.url,sourceVersion:s.provenance.version,licence:{...s.licence}})),
  passages:b.passages.map(p=>({id:p.id,sourceId:p.sourceId,sourceVersion:p.sourceVersion,text:p.text,locator:p.locator,sha256:p.sha256!})),
  contradictions,
  ...(options.contextConflictAudit?{contextConflictAudit:options.contextConflictAudit}:{}),
  ...(options.contextConflictAuditReview?{contextConflictAuditReview:options.contextConflictAuditReview}:{}),
  missingData:unique(branches.flatMap(b=>b.missingEvidence)),decisionTree:{kind:"saved_investigation_questions" as const,diagnosticDecisionSupport:false,questions},hypotheses:branches,
  nextResearchSteps:branches.map(b=>({branchId:b.id,action:"Retrieve and independently assess evidence addressing the recorded falsification question; define population, specimen, assay, timepoint and controls before proposing an experiment.",falsificationQuestion:b.falsificationCriteria,experimentSpecified:false,patientMeasurementOrder:false})),
  trials,
  livingEvidence,
  gapVerification,
  researchBrief,
  review:{status:d?d.outcome:"not_independently_reviewed" as const,scope:"evidence_brief_only" as const,decisionId:d?.id??null,decisionHash:d?.decisionHash??null,reviewedAt:d?.reviewedAt??null,rationale:d?.rationale??null,limitations:d?[...d.limitations]:[],scientificApprovalTransferred:false},
  comparison:{available:p.context.comparison!==null,releaseId:p.context.comparison?.release.id??null,manifestHash:p.context.comparison?.release.manifestHash??null,role:"separate_disease_context_not_branch_evidence" as const},
  provenance:{attachmentBinding,methods,declaredRetrievalReferenceCount:i.provenance.retrievalIds.length,projectionInvokesModel:false,sourceSearchCompletenessVerified:false,deterministic:true},
  disclaimer:"Research use only. Not a diagnosis, treatment recommendation, patient measurement order or trial-eligibility decision."
 };
}
function projectTrialsSection(landscape:TranslationalLandscapeSnapshot|null|undefined):TranslationalOutcomeSection{
 return projectTranslationalForOutcome(landscape??null);
}
function projectResearchBriefSection(input:{
 question:string;
 options:ResearchOutcomeOptions;
 trials:TranslationalOutcomeSection;
 gapVerification:GapVerificationOutcomeSection;
 livingEvidence:LivingEvidenceOutcomeSection;
}):IntegratedResearchBrief|null{
 // Auto-compose a product brief when O-04 is bound so the outcome carries source-linked limitations.
 if(input.trials.status==="not_queried"){
  if(input.options.researchBrief)throw Error("Prebuilt brief has no bound composition inputs");
  return null;
 }
 const sourceLocators=[
  ...input.livingEvidence.bibliographic.flatMap(r=>r.pmid?[{kind:"pmid" as const,value:r.pmid}]:[]),
  ...input.trials.records.map(r=>({kind:"nct" as const,value:r.nctId})),
 ];
 const composed=integrateResearchBrief({
  question:input.question,
  translational:input.trials,
  gapVerification:input.gapVerification,
  sourceLocators,
 });
 if(input.options.researchBrief&&canonicalGraphContext(input.options.researchBrief)!==canonicalGraphContext(composed))throw Error("Prebuilt brief differs from bound composition inputs");
 return composed;
}
export type ResearchOutcome=ReturnType<typeof projectResearchOutcome>&{outcomeHash:string};
/** Reused by trusted audit storage and outcome compilation; unsupported diseases do not fall through to RA. */
export function assertContextAuditPackageBinding(audit:ContextConflictAudit,p:EvidenceBrief["package"]){
 validateContextConflictAudit(audit);
 const d=p.context.primary.disease,scope=d==="systemic_sclerosis"?"ssc":d==="rheumatoid_arthritis"?"ra":null;
 if(!scope||audit.investigationId!==p.investigation.id||audit.question!==p.investigation.question||audit.diseaseScope!==scope||canonicalGraphContext(audit.release)!==canonicalGraphContext(p.context.primary.release))throw Error("Context audit belongs to another investigation or source release");
 const sources=new Set(p.context.primary.bundle.sources.map(s=>s.id));
 if(audit.searches.some(s=>s.sourceIds.some(id=>!sources.has(id))))throw Error("Audit search references another source release");
 for(const unit of audit.units){const c=unit.detailedContext!;
  if(!p.context.primary.bundle.passages.some(row=>row.id===c.passageId&&row.sourceId===c.sourceId&&row.sourceVersion===c.sourceVersion&&row.sha256===c.passageSha256&&row.text===c.passageText))throw Error("Audit passage is outside the captured release");
 }
}
/** Trusted backend must authorise the current source read before invoking this pure compiler. */
export async function buildResearchOutcome(value:EvidenceBrief,digest:Digest,options:ResearchOutcomeOptions={},authority?:OutcomeAttachmentAuthority):Promise<ResearchOutcome>{
 value=structuredClone(value);options=structuredClone(options);
 if(Object.keys(options).some(k=>!["livingEvidenceSnapshot","translationalLandscape","researchBrief","contradictionInvestigation","contextConflictAudit","contextConflictAuditReview"].includes(k)))throw Error("Unknown outcome attachment field");
 const authorize=authority?.authorize;
 exact(value,["schemaVersion","package","submission","decision","scope","graphPublicationApproved"]);
 if(value.schemaVersion!=="hsi-investigation-brief-1"||value.scope!=="research_only"||value.graphPublicationApproved!==false)throw Error("Research-only brief required");
 const p=await verifyReviewPackage(value.package,digest),s=value.submission;
 if(s){exact(s,["id","packageHash","submittedAt","submittedBy"]);if(s.packageHash!==p.packageHash||s.submittedBy!==p.investigation.actorPrincipal||!/^submission-[a-f0-9]{32}$/.test(s.id)||!Number.isFinite(Date.parse(s.submittedAt))||p.investigation.state!=="awaiting_scientific_review")throw Error("Unbound outcome submission")}
 else if(value.decision||p.investigation.state!=="draft")throw Error("A submitted investigation requires its bound submission");
 if(value.decision)await verifyDeliveryDecision(value.decision,p,s!,digest);
 if(options.contextConflictAudit)assertContextAuditPackageBinding(options.contextConflictAudit,p);
 if(options.contextConflictAuditReview){
  if(!options.contextConflictAudit)throw Error("Audit review requires its exact audit");
  const review=options.contextConflictAuditReview;
  await verifyContextAuditReview(review,{auditHash:options.contextConflictAudit.auditHash,investigationId:p.investigation.id,packageHash:p.packageHash,contextHash:p.context.contentHash,diseaseScope:options.contextConflictAudit.diseaseScope},digest);
  if(review.ownerPrincipal!==p.investigation.actorPrincipal)throw Error("Audit review owner mismatch");
 }
 let attachmentBinding:OutcomeAttachmentBinding|null=null;
 if(Object.values(options).some(v=>v!==null&&v!==undefined)){
  if(typeof authorize!=="function")throw Error("Trusted outcome attachment authority required");
  attachmentBinding={investigationId:p.investigation.id,packageHash:p.packageHash,contextHash:p.context.contentHash,releaseId:p.context.primary.release.id,manifestHash:p.context.primary.release.manifestHash,attachmentsHash:await digest(canonicalGraphContext(options))};
  if(await authorize(Object.freeze({...attachmentBinding}))!==true)throw Error("Outcome attachments are outside the authorized investigation release");
 }
 const body=projectResearchOutcome(value,options,attachmentBinding),text=canonicalGraphContext(body);if(new TextEncoder().encode(text).byteLength>2_000_000)throw Error("Research outcome exceeds export budget");
 return {...body,outcomeHash:await digest(text)};
}
/** Recomputes a serialization projection to check binding; it performs no scientific inference. */
export async function verifyResearchOutcome(value:unknown,expected:EvidenceBrief,digest:Digest,options:ResearchOutcomeOptions={},authority?:OutcomeAttachmentAuthority):Promise<ResearchOutcome>{
 const checked=await buildResearchOutcome(expected,digest,options,authority);if(canonicalGraphContext(value)!==canonicalGraphContext(checked))throw Error("Outcome differs from the independently loaded evidence package or decision");return checked;
}
export type OutcomeVerificationReceipt={schemaVersion:'hsi-outcome-receipt-1';investigationId:string;packageHash:string;contextHash:string;attachmentsHash:string|null;outcomeHash:string};
/** Only expose after the backend freshly authenticates and reauthorizes stored source attachments. */
export function outcomeVerificationReceipt(outcome:ResearchOutcome):OutcomeVerificationReceipt{return {schemaVersion:'hsi-outcome-receipt-1',investigationId:outcome.investigationId,packageHash:outcome.binding.packageHash,contextHash:outcome.binding.contextHash,attachmentsHash:outcome.provenance.attachmentBinding?.attachmentsHash??null,outcomeHash:outcome.outcomeHash};}
/** Browser verification of a separately fetched authenticated server receipt. This is not browser scientific adjudication. */
export async function verifyReceiptedResearchOutcome(value:unknown,receipt:OutcomeVerificationReceipt,expected:EvidenceBrief,digest:Digest):Promise<ResearchOutcome>{
 exact(receipt,['schemaVersion','investigationId','packageHash','contextHash','attachmentsHash','outcomeHash']);
 const baseline=await buildResearchOutcome(expected,digest),o=value as ResearchOutcome;
 if(!o||!o.provenance?.attachmentBinding||receipt.schemaVersion!=='hsi-outcome-receipt-1'||receipt.investigationId!==baseline.investigationId||receipt.packageHash!==baseline.binding.packageHash||receipt.contextHash!==baseline.binding.contextHash||!/^[a-f0-9]{64}$/.test(receipt.attachmentsHash??'')||receipt.attachmentsHash!==o.provenance.attachmentBinding.attachmentsHash||receipt.outcomeHash!==o.outcomeHash)throw Error('Outcome receipt binding mismatch');
 for(const key of ['schemaVersion','method','investigationId','question','binding','scope','comparison'] as const)if(canonicalGraphContext(o[key])!==canonicalGraphContext(baseline[key]))throw Error('Receipted outcome changed saved provenance');
 const {outcomeHash,...body}=o;if(await digest(canonicalGraphContext(body))!==outcomeHash)throw Error('Receipted outcome content changed');
 return o;
}
const md=(text:string)=>text.replace(/\\/g,"\\\\").replace(/[<>\[\]*_`#|]/g,c=>"\\"+c).replace(/\r/g,"").replace(/\n/g," ");
export function renderResearchOutcome(outcome:ResearchOutcome,format:"json"|"markdown"):string{
 if(format==="json")return JSON.stringify(JSON.parse(canonicalGraphContext(outcome)),null,2)+"\n";
 const o=outcome,lines=["# Human Super Intelligence — research outcome","",md(o.question),"",`Outcome SHA-256: ${o.outcomeHash}`,`Package: ${o.binding.packageHash}`,`Source context: ${o.binding.contextHash}`,`Primary release: ${o.binding.releaseId} v${o.binding.releaseVersion}`,`Method: ${o.method}`,"","## Answer and limits","",md(o.answer.summary),`Saved assessment: ${o.answer.savedAssessment}; confidence: not calibrated.`,...o.answer.limitations.map(s=>"- "+md(s)),"","## Mechanism map — source context, not a causal chain","",...o.mechanismMap.edges.map(e=>"- "+md(e.subjectId+" → "+e.predicate+" → "+e.objectId)+"; claims: "+e.claimIds.map(md).join(", ")),"","## Source evidence and biological context",""];
 for(const c of o.evidence){lines.push("### "+md(c.claimId),"",md(c.statement),`Source review: ${c.sourceHumanReview.status}; decision ${md(c.sourceHumanReview.decisionId)}`,`Context: ${md(JSON.stringify(c.context))}`,`Supporting branches: ${c.supportingBranchIds.map(md).join(", ")||"none assigned"}; opposing branches: ${c.opposingBranchIds.map(md).join(", ")||"none assigned"}`);
  for(const id of c.passageIds){const p=o.passages.find(p=>p.id===id)!,s=o.sources.find(s=>s.id===p.sourceId)!;lines.push("",md(s.title),`PMID: ${s.pmid??"not recorded"}; DOI: ${md(s.doi??"not recorded")}`,`Source URL: ${md(s.url??"not recorded")}`,`Source version: ${md(p.sourceVersion)}; locator: ${md(p.locator)}`,`Passage SHA-256: ${p.sha256}`,"> "+md(p.text));}
 }
 lines.push("","## Conflicting evidence","",md(o.contradictions.note),...o.contradictions.recordedOpposingClaimIds.map(id=>"- "+md(id)),...(o.contradictions.investigationCategories??[]).map(c=>`- investigation_category: ${md(c)}`),"","## Missing data","",...o.missingData.map(s=>"- "+md(s)),"","## Gap verification (step 04)","",`Status: ${o.gapVerification.status}`,md(o.gapVerification.note),`SME gold filled: ${o.gapVerification.honesty.smeGoldFilled}; scientifically validated: ${o.gapVerification.honesty.scientificallyValidated}.`,...o.gapVerification.items.map(g=>`- [${g.kind}] ${md(g.recordedText)} — ${md(g.rationale)}`),...o.gapVerification.unavailableCapabilities.map(s=>`- Unavailable: ${md(s)}`),"","## Investigation question tree","",...o.decisionTree.questions.map(q=>"  ".repeat(q.depth)+"- "+md(q.text)+` (${q.status}; ${q.purpose})`),"","## Candidate hypotheses and falsification","");
 for(const b of o.hypotheses)lines.push("### "+md(b.statement),`Assessment: ${b.assessment}; classification: ${b.classification}`,md(b.falsificationCriteria),"Predicted observation, experiment and controls: not specified in the saved record.",...b.uncertainty.map(s=>"- "+md(s)));
 lines.push("","## Next research work","",...o.nextResearchSteps.map(s=>"- "+md(s.action)+" "+md(s.falsificationQuestion)),"","## Living evidence metadata (step 03)","",`Status: ${o.livingEvidence.status}`,md(o.livingEvidence.note),...o.livingEvidence.bibliographic.map(r=>`- ${md(r.title)} · PMID ${r.pmid??"n/a"} · ${md(r.url)}`),...o.livingEvidence.unavailableCapabilities.map(s=>`- Unavailable: ${md(s)}`),"","## Clinical-trial / translational context (O-04)","",md(o.trials.note),`Status: ${o.trials.status}; eligibility assessed: ${o.trials.eligibilityAssessed}.`);
 if(o.trials.status!=="not_queried"){
  lines.push("","### Trial registration and status",...o.trials.planes.trialRegistrationAndStatus.map(r=>`- ${md(r.nctId)} · ${md(r.briefTitle??"untitled")} · ${md(r.overallStatus??"status unknown")} · registration≠efficacy`),"","### Intervention and target mapping",...o.trials.planes.interventionAndTargetMapping.map(m=>`- ${md(m.nctId)} · interventions: ${m.interventions.map(i=>md(i.name)).join(", ")||"none"} · mapped targets: ${m.mappedTargets.map(t=>md(t.targetSymbol)).join(", ")||"none"}`),"","### Registry-reported results",...o.trials.planes.registryReportedResults.map(r=>`- ${md(r.nctId)} · hasResultsSection=${r.hasResultsSection} · primary measures: ${r.primaryOutcomeMeasures.map(p=>md(p.title)).join("; ")||"none extracted"} · registry results≠efficacy proof`),"","### Published outcomes (locators)",...o.trials.planes.publishedOutcomes.map(p=>`- ${md(p.nctId)} · PMID ${p.pmid??"n/a"} · ${md(p.referenceType??"ref")} · claim support not assessed`),...(o.trials.planes.publishedOutcomes.length?[]:["- None attached"]),"","### Missing or unresolved outcome evidence",...o.trials.planes.missingOrUnresolvedOutcomeEvidence.map(m=>`- ${md(m.nctId)} · ${m.kind}: ${md(m.detail)} · missing≠failure`),...(o.trials.limitations.map(s=>`- Limitation: ${md(s)}`)));
 }
 lines.push("No participant eligibility has been assessed.");
 if(o.researchBrief){
  lines.push("","## Integrated research brief (PR 7)","",`Question: ${md(o.researchBrief.question)}`,`Scientific validity claimed: ${o.researchBrief.scientificValidityClaimed}; candidates unapproved: ${o.researchBrief.candidatesRemainUnapproved}.`,"","### Source-linked claims",...o.researchBrief.claims.map(c=>`- ${md(c.text)} · support=${c.support} · traces: ${c.traceRefs.map(md).join(", ")}`),"","### Explicit limitations",...o.researchBrief.limitations.map(s=>`- ${md(s)}`),"","### Next research actions",...o.researchBrief.nextResearchActions.map(s=>`- ${md(s)}`));
 }
 if(o.contextConflictAudit)lines.push("",renderValidatedContextConflictAudit(o.contextConflictAudit,"markdown"));
 if(o.contextConflictAuditReview){const r=o.contextConflictAuditReview;lines.push("","## Independent context-audit review",`Audit ${r.auditHash}; decision ${r.decisionHash}; scope context audit only.`,md(r.decision),md(r.rationale),...r.limitations.map(x=>"- "+md(x)),"Evidence-brief acceptance and graph publication remain separate. No scientific approval is transferred.");}
 lines.push("","## Human review","",`Recorded outcome: ${o.review.status}; scope: evidence brief only.`,md(o.review.rationale??"No independent decision recorded."),...o.review.limitations.map(s=>"- "+md(s)),"","## Methods and provenance","",...o.provenance.methods.map(m=>"- "+md(`${m.agentId} v${m.version}; recorded model ${m.modelVersion}; prompt ${m.promptVersion}; tool-call count ${m.toolCallCount}`)),"No new model call, live patient connection or exhaustive literature search is performed by this projection.","",o.disclaimer,"");return lines.join("\n");
}
