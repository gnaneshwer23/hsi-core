/** Test-only approved-record fixtures; not a scientific evidence corpus or a publishable release. */
import {createHash} from "node:crypto";
import {planSscInterrogation} from "../../src/interrogativeQuestionEngine";
import {canonicalGraphContext,type ReleasedEvidenceBundle,type InvestigationGraphContext} from "../../src/investigationGraphContext";
import {WORKING_EVIDENCE_INDEX} from "../../src/evidence/generatedWorkingEvidenceIndex";
export const hash=(text:string)=>createHash("sha256").update(text).digest("hex");
export const question="Which SSc mechanism has source-linked evidence?";
export function released(disease:ReleasedEvidenceBundle["disease"]="systemic_sclerosis"):ReleasedEvidenceBundle{
 const ssc=disease==="systemic_sclerosis";const release={id:ssc?"HSI-GR-SSC-TEST":"HSI-GR-RA-TEST",version:ssc?"1.0.0":"2.0.0",manifestHash:(ssc?"a":"b").repeat(64)};
 const provenance={product:"hsi" as const,datasetId:release.id,version:release.version,retrievedAt:"2026-11-05T00:00:00.000Z"};
 const sourceVersion="c".repeat(64),text="Test-only source passage. This fixture establishes no scientific finding.";
 return {release,disease,studyContexts:{"rel-test":ssc?"Systemic sclerosis; human ex-vivo test fixture":"Rheumatoid arthritis; mouse in-vivo test fixture"},epistemicTypes:{"rel-test":"association"},bundle:{schemaVersion:"hsi-research-contract-1",containsPhi:false,clinicalAdvice:false,kgWrite:false,
  context:{id:"ctx-test",question,conceptIds:[],dataClass:"public_real",purpose:"research_only",containsPhi:false,provenance},
  sources:[{id:"pmid:123",title:"Test-only source citation",kind:"publication",dataClass:"public_real",pmid:"123",doi:null,url:"https://pubmed.ncbi.nlm.nih.gov/123/",licence:{status:"permitted",identifier:"https://creativecommons.org/licenses/by/4.0/",passageUsePermitted:true},provenance:{...provenance,version:sourceVersion}}],
  passages:[{id:"passage-test",sourceId:"pmid:123",sourceVersion,text,locator:"test abstract",dataClass:"public_real",sha256:hash(text)}],
  entities:[{id:"cell:tfh",label:"Tfh cell",type:"cell",dataClass:"public_real",provenance},{id:"molecule:il21",label:"IL-21",type:"molecule",dataClass:"public_real",provenance}],
  relationships:[{id:"rel-test",subjectId:"cell:tfh",predicate:"associated_with",objectId:"molecule:il21",dataClass:"public_real",context:{species:ssc?"human":"mouse",experimentalSystem:ssc?"ex_vivo":"in_vivo",tissueId:null,assay:"Test assay",timepoint:null},provenance}],
  claims:[{id:"HSI-C-TEST-001",statement:"Test-only association",relationshipId:"rel-test",passageIds:["passage-test"],dataClass:"public_real",support:"supports",assessmentKind:"human",curation:"approved",review:{decisionId:"review-test",reviewerRef:"independent-test-reviewer",role:"reviewer",reviewedAt:"2026-11-05T01:00:00.000Z",rationale:"Test-only human record fixture, not real scientific approval."}}],runs:[]}};
}
export function investigation(){return {...planSscInterrogation({question,actorPrincipal:"alice",createdAt:"2026-11-05T02:00:00.000Z",dataClass:"public_biomedical",release:released().release,focus:"systemic_sclerosis"}),id:"hsi-interrogative-test-12345678"}}
export function contextFixture(comparison=true):InvestigationGraphContext{
 const i=investigation();const body={schemaVersion:"hsi-investigation-graph-context-1" as const,investigationId:i.id,question:i.question,capturedAt:"2026-11-05T03:00:00.000Z",primary:released(),comparison:comparison?released("rheumatoid_arthritis"):null,workingEvidence:{version:WORKING_EVIDENCE_INDEX.version,claimIds:["HSI-C-SSC-001"],relation:"bibliographic_context_only" as const},clinicalAdvice:false as const,graphPromotable:false as const};
 return {...body,contentHash:hash(canonicalGraphContext(body))};
}
