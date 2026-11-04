/** ARCH-002 Phase 3.3: contextualised, source-versioned evidence dossier.
 * This contract does not approve claims or publish releases. Scientific review
 * authority remains in the authenticated review store and graphRelease gate.
 */
import type {HsiGraphRelationship} from "./livingHealthKnowledgeGraph";
import type {SourceEvidence,ReviewDecisionSnapshot} from "./graphRelease";
export type HsiEvidenceObservation={
 evidenceId:string;sourceVersion:string;retrievedAt:string;
 licenceStatus:SourceEvidence["licenceStatus"];retractionStatus:SourceEvidence["retractionStatus"];
 polarity:SourceEvidence["polarity"];context:Readonly<{
  species?:string;tissue?:string;cellState?:string;assay?:string;population?:string;
  diseaseStage?:string;intervention?:string;dose?:string;experimentalModel?:string;
 }>;observedFrom?:string;observedUntil?:string;uncertainty:string;
};
export type HsiTemporalScope={validFrom?:string;validUntil?:string;assertedAt:string;sourceAsOf:string};
export type HsiRelationshipDossier={
 schemaVersion:"hsi-lhkg-dossier-1";relationship:HsiGraphRelationship;
 temporal:HsiTemporalScope;observations:readonly HsiEvidenceObservation[];
 reviews:readonly ReviewDecisionSnapshot[];generationMethod:"human_curated"|"extracted"|"tool"|"llm_draft"|"computational";
};
const timestamp=(s:string)=>Number.isFinite(Date.parse(s))&&/^\d{4}-\d\d-\d\dT/.test(s);
const optionalTime=(s:string|undefined)=>s===undefined||timestamp(s);
export type HsiDossierAssessment={valid:boolean;reasons:string[];evidenceAssessment:"unassessed"|"supported"|"contested"|"context_limited"};
export function assessHsiRelationshipDossier(d:HsiRelationshipDossier):HsiDossierAssessment{
 const reasons:string[]=[];
 if(d.schemaVersion!=="hsi-lhkg-dossier-1")reasons.push("unknown_dossier_schema");
 if(!timestamp(d.temporal.assertedAt)||!timestamp(d.temporal.sourceAsOf)||!optionalTime(d.temporal.validFrom)||!optionalTime(d.temporal.validUntil))reasons.push("invalid_temporal_scope");
 if(d.temporal.validFrom&&d.temporal.validUntil&&Date.parse(d.temporal.validFrom)>Date.parse(d.temporal.validUntil))reasons.push("reversed_validity_window");
 if(d.observations.some(o=>!o.evidenceId.trim()||!o.sourceVersion.trim()||!timestamp(o.retrievedAt)||!o.uncertainty.trim()||!optionalTime(o.observedFrom)||!optionalTime(o.observedUntil)))reasons.push("incomplete_evidence_provenance");
 if(d.observations.some(o=>o.observedFrom&&o.observedUntil&&Date.parse(o.observedFrom)>Date.parse(o.observedUntil)))reasons.push("reversed_observation_window");
 const ids=d.observations.map(o=>o.evidenceId);
 if(new Set(ids).size!==ids.length)reasons.push("duplicate_evidence_id");
 if(d.relationship.sourceEvidenceIds.some(id=>!ids.includes(id)))reasons.push("unresolved_evidence_reference");
 const latest=[...d.reviews].sort((a,b)=>b.reviewedAt.localeCompare(a.reviewedAt)||b.id.localeCompare(a.id))[0];
 if(d.relationship.reviewState==="approved"&&(!latest||latest.decision!=="approve"||!latest.reviewerAuthorised||latest.claimId!==d.relationship.id||latest.id!==d.relationship.reviewDecisionId))reasons.push("missing_current_authorised_review");
 if(d.relationship.visibility==="public_biomedical"&&d.observations.some(o=>o.licenceStatus==="unverified"||o.licenceStatus==="prohibited"||o.retractionStatus!=="none_reported"))reasons.push("source_rights_or_retraction_unresolved");
 if(d.relationship.visibility==="public_biomedical"&&!d.observations.some(o=>o.polarity==="supports"&&["metadata_only","passage_permitted","restricted"].includes(o.licenceStatus)))reasons.push("missing_licensed_support");
 if(d.relationship.visibility==="public_biomedical"&&d.observations.some(o=>o.polarity==="contradicts"))reasons.push("contradiction_requires_adjudication");
 if(d.relationship.visibility==="public_biomedical"&&["computational_inference","unvalidated_hypothesis","patient_fact"].includes(d.relationship.epistemicType))reasons.push("nonpublishable_epistemic_type");
 const evidenceAssessment:dossierEvidenceAssessment=d.observations.length===0?"unassessed":d.observations.some(o=>o.polarity==="contradicts")?"contested":d.observations.some(o=>o.polarity==="supports")?"supported":"context_limited";
 return {valid:reasons.length===0,reasons,evidenceAssessment};
}
type dossierEvidenceAssessment=HsiDossierAssessment["evidenceAssessment"];
export function toHsiReleaseSources(d:HsiRelationshipDossier):readonly SourceEvidence[]{
 const assessment=assessHsiRelationshipDossier(d);
 if(!assessment.valid)throw Error("Invalid relationship dossier: "+assessment.reasons.join(","));
 return d.observations.map(o=>({id:o.evidenceId,sourceVersion:o.sourceVersion,licenceStatus:o.licenceStatus,retractionStatus:o.retractionStatus,polarity:o.polarity}));
}
