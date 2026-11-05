/** Reproducible investigation evidence view. No identity or release authority is established here. */
import {parseResearchBundle,type ResearchBundle} from "./researchContracts";
import {buildImmuneMechanismDossier} from "./immuneMechanismInvestigation";
import {compareSscRaEvidence} from "./sscRaEvidenceComparison";
import {validateHsiLogicalGraph,type HsiGraphNode,type HsiGraphRelationship} from "./livingHealthKnowledgeGraph";
import type {HsiGraphPage} from "./hsiGovernedGraphQuery";
import {validateWorkspaceRelease,type InvestigationRelease} from "./interrogativeWorkspace";
import {rejectPhiPayload} from "./cdsPhiBoundary";
export type ReleasedEvidenceBundle={release:InvestigationRelease;disease:"systemic_sclerosis"|"rheumatoid_arthritis";bundle:ResearchBundle;studyContexts:Record<string,string>;epistemicTypes:Record<string,"association"|"established_evidence">};
export type InvestigationGraphContext={
 schemaVersion:"hsi-investigation-graph-context-1";investigationId:string;question:string;capturedAt:string;contentHash:string;
 primary:ReleasedEvidenceBundle;comparison:ReleasedEvidenceBundle|null;
 workingEvidence:{version:string;claimIds:string[];relation:"bibliographic_context_only"};
 clinicalAdvice:false;graphPromotable:false;
};
export function canonicalGraphContext(value:unknown):string{
 return JSON.stringify(value,(_key,row:unknown)=>row&&typeof row==="object"&&!Array.isArray(row)?Object.fromEntries(Object.entries(row).sort(([a],[b])=>a<b?-1:a>b?1:0)):row);
}
export function validateReleasedEvidence(value:ReleasedEvidenceBundle):void{
 validateWorkspaceRelease(value.release);
 const b=parseResearchBundle(value.bundle);
 if(!["systemic_sclerosis","rheumatoid_arthritis"].includes(value.disease)||b.context.dataClass!=="public_real"||b.sources.some(s=>s.dataClass!=="public_real")||b.relationships.length<1||b.relationships.length>100||b.claims.length>100||b.context.provenance.product!=="hsi"||b.context.provenance.datasetId!==value.release.id||b.context.provenance.version!==value.release.version)throw Error("Invalid released evidence context");
 if(b.claims.length!==b.relationships.length||Object.keys(value.studyContexts).length!==b.relationships.length||Object.keys(value.epistemicTypes).length!==b.relationships.length)throw Error("Incomplete release context");
 const expected=value.disease==="systemic_sclerosis"?/systemic sclerosis|\bssc\b/i:/rheumatoid arthritis|\bra\b/i;
 const other=value.disease==="systemic_sclerosis"?/rheumatoid arthritis|\bra\b/i:/systemic sclerosis|\bssc\b/i;
 for(const r of b.relationships){
  const c=b.claims.filter(c=>c.relationshipId===r.id);
  if(c.length!==1||c[0]!.curation!=="approved"||c[0]!.assessmentKind!=="human"||c[0]!.support!=="supports"||!c[0]!.passageIds.length||!c[0]!.review||!["association","established_evidence"].includes(value.epistemicTypes[r.id]??"")||!expected.test(value.studyContexts[r.id]??"")||other.test(value.studyContexts[r.id]??""))throw Error("Unreviewed, ambiguous or wrong-disease evidence");
 }
 for(const p of b.passages)if(!/^[a-f0-9]{64}$/.test(p.sha256??""))throw Error("Passage hash required");
 if(!rejectPhiPayload({textBlobs:[b.context.question,...b.claims.map(c=>c.statement),...b.passages.map(p=>p.text),...Object.values(value.studyContexts)]}).ok)throw Error("Research-only context required");
}
export function parseInvestigationGraphContext(value:unknown,expected:{id:string;question:string;release:InvestigationRelease}):InvestigationGraphContext{
 const c=value as InvestigationGraphContext;
 if(canonicalGraphContext(value).length>1_400_000)throw Error("Evidence context budget exceeded");
 if(!c||c.schemaVersion!=="hsi-investigation-graph-context-1"||c.investigationId!==expected.id||c.question!==expected.question||typeof c.capturedAt!=="string"||!Number.isFinite(Date.parse(c.capturedAt))||!(/^[a-f0-9]{64}$/).test(c.contentHash)||c.clinicalAdvice!==false||c.graphPromotable!==false)throw Error("Invalid investigation graph context");
 validateReleasedEvidence(c.primary);
 if(c.primary.disease!=="systemic_sclerosis"||canonicalGraphContext(c.primary.release)!==canonicalGraphContext(expected.release)||c.primary.bundle.context.question!==expected.question)throw Error("Investigation release mismatch");
 if(c.comparison!==null){validateReleasedEvidence(c.comparison);if(c.comparison.disease!=="rheumatoid_arthritis"||c.comparison.release.id===c.primary.release.id)throw Error("Invalid comparison release")}
 if(!c.workingEvidence||!(/^[a-f0-9]{64}$/).test(c.workingEvidence.version)||!Array.isArray(c.workingEvidence.claimIds)||c.workingEvidence.claimIds.length>100||new Set(c.workingEvidence.claimIds).size!==c.workingEvidence.claimIds.length||c.workingEvidence.claimIds.some(id=>!/^HSI-C-(?:RA|SSC)-[A-Z0-9-]+$/.test(id))||c.workingEvidence.relation!=="bibliographic_context_only")throw Error("Invalid working-evidence link");
 return c;
}
export async function verifyInvestigationGraphContext(value:unknown,expected:Parameters<typeof parseInvestigationGraphContext>[1],digest:(text:string)=>Promise<string>){
 const c=parseInvestigationGraphContext(value,expected);const {contentHash,...body}=c;
 if(await digest(canonicalGraphContext(body))!==contentHash)throw Error("Evidence context hash mismatch");
 for(const b of [c.primary,c.comparison])if(b)for(const p of b.bundle.passages)if(await digest(p.text)!==p.sha256)throw Error("Evidence passage hash mismatch");
 return c;
}
export function graphPageForReleasedEvidence(e:ReleasedEvidenceBundle):HsiGraphPage{
 validateReleasedEvidence(e);
 const nodes:HsiGraphNode[]=e.bundle.entities.map(n=>({schemaVersion:"hsi-lhkg-node-1",id:n.id,kind:n.type,preferredLabel:n.label,layer:"human_biology",aliases:[],sourceIdentifiers:[],version:e.release.version,visibility:"governed_research",reviewState:"draft",sourceProvenance:[e.release.manifestHash]}));
 const relationships:HsiGraphRelationship[]=e.bundle.relationships.map(r=>{
  const c=e.bundle.claims.find(c=>c.relationshipId===r.id)!;
  return {schemaVersion:"hsi-lhkg-edge-1",id:r.id,subjectId:r.subjectId,predicate:r.predicate,objectId:r.objectId,layer:"human_biology",epistemicType:e.epistemicTypes[r.id]!,visibility:"governed_research",reviewState:"approved",sourceEvidenceIds:c.passageIds.map(id=>e.bundle.passages.find(p=>p.id===id)!.sourceId),version:e.release.version,context:{studyContext:e.studyContexts[r.id]!,species:r.context.species??"not supplied",assay:r.context.assay??"not supplied",timepoint:r.context.timepoint??"not supplied"},causalClaim:false,reviewDecisionId:c.review!.decisionId};
 });
 validateHsiLogicalGraph(nodes,relationships);
 return {scope:"governed_research",limit:100,nodes,relationships};
}
export function projectInvestigationGraphContext(c:InvestigationGraphContext){
 parseInvestigationGraphContext(c,{id:c.investigationId,question:c.question,release:c.primary.release});
 const graph=graphPageForReleasedEvidence(c.primary);
 const comparison=compareSscRaEvidence(graph,c.comparison?graphPageForReleasedEvidence(c.comparison):{scope:"governed_research",limit:100,nodes:[],relationships:[]});
 return {graph,dossier:buildImmuneMechanismDossier(c.primary.bundle),comparisonDossier:c.comparison?buildImmuneMechanismDossier(c.comparison.bundle):null,comparison};
}
