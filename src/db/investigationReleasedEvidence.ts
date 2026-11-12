/** Load public, rights-cleared passages from the exact independently verified release. */
import {SQL} from "bun";
import {createHash} from "node:crypto";
import {loadHsiPublishedRelease} from "./authoritativeReleaseStore";
import {verifyHsiReviewerAuthority,reviewerScopeForDisease} from "./reviewerAuthority";
import type {TrustedResearchActor} from "./researchInvestigationStore";
import {parseResearchBundle,type ResearchBundle,type ResearchEntity} from "../researchContracts";
import {validateReleasedEvidence,type ReleasedEvidenceBundle} from "../investigationGraphContext";
import type {InvestigationRelease} from "../interrogativeWorkspace";
const hash=(s:string)=>createHash("sha256").update(s).digest("hex");
export async function loadInvestigationReleasedEvidence(input:{actor:TrustedResearchActor;release:InvestigationRelease;question:string;disease:ReleasedEvidenceBundle["disease"];databaseUrl:string;neonProjectId?:string|null}):Promise<ReleasedEvidenceBundle>{
 const scope=reviewerScopeForDisease(input.disease);
 if(!scope)throw Error("Unsupported scientific review scope");
 const snapshot=await loadHsiPublishedRelease({...input,version:input.release.version,verifyReviewer:(principal,reviewedAt)=>verifyHsiReviewerAuthority({...input,principal,reviewedAt,scope})});
 if(snapshot.manifest.releaseId!==input.release.id||snapshot.manifest.manifestHash!==input.release.manifestHash||snapshot.claims.length>100)throw Error("Pinned release mismatch or graph budget exceeded");
 const provenance={product:"hsi" as const,datasetId:input.release.id,version:input.release.version,retrievedAt:snapshot.manifest.generatedAt};
 const bundle:ResearchBundle={schemaVersion:"hsi-research-contract-1",containsPhi:false,clinicalAdvice:false,kgWrite:false,context:{id:"ctx-"+hash(input.question+input.release.manifestHash).slice(0,24),question:input.question,conceptIds:[],dataClass:"public_real",purpose:"research_only",containsPhi:false,provenance},sources:[],passages:[],entities:[],relationships:[],claims:[],runs:[]};
 const studyContexts:Record<string,string>={},epistemicTypes:ReleasedEvidenceBundle["epistemicTypes"]={};
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  for(const claim of snapshot.claims){
   const ctx=claim.biologicalContext;
   if(ctx.layer==="patient_context"||ctx.visibility==="restricted_clinical"||ctx.containsPhi===true)throw Error("Clinical evidence context denied");
   if(typeof ctx.studyContext!=="string")throw Error("Explicit disease study context required");
   const relationshipId="rel-"+claim.id;
   studyContexts[relationshipId]=[ctx.studyContext,...["population","cohort","tissue","diseaseStage","limitations"].flatMap(key=>typeof ctx[key]==="string"?[key+": "+ctx[key]]:[])].join("; ");
   epistemicTypes[relationshipId]=claim.epistemicType==="established_evidence"?"established_evidence":"association";
   for(const [id,label,type] of [[claim.subjectId,ctx.subjectLabel,ctx.subjectType],[claim.objectId,ctx.objectLabel,ctx.objectType]]){
    const existing=bundle.entities.find(e=>e.id===id);
    if(existing){if((typeof label==="string"&&label.trim()&&label!==existing.label)||(typeof type==="string"&&type!==existing.type))throw Error("Conflicting canonical entity mapping");continue}
    const kinds=["cell","molecule","receptor","pathway","tissue","disease","biomarker","intervention","trial","other"];
    bundle.entities.push({id:String(id),label:typeof label==="string"&&label.trim()?label:String(id),type:typeof type==="string"&&kinds.includes(type)?type as ResearchEntity["type"]:"other",dataClass:"public_real",provenance});
   }
   const rows=await sql`SELECT p.id AS passage_id,p.source_id,p.source_locator,p.passage_text,p.passage_hash,p.rights_verified_by,p.rights_verified_at,
     s.title,s.source_url,s.doi,s.pmid,s.licence_status,s.retraction_status,s.metadata,s.retrieved_at
    FROM hsi_evidence_claim_support cs JOIN hsi_evidence_sources s ON s.id=cs.source_id
    JOIN hsi_evidence_passages p ON p.id=cs.passage_id AND p.source_id=s.id
    WHERE cs.claim_id=${claim.id} AND cs.polarity='supports' ORDER BY p.id LIMIT 41`;
   if(!rows.length||rows.length>40)throw Error("Cleared, source-linked supporting passages required");
   const sourceIds=new Set(rows.map((r:Record<string,unknown>)=>String(r.source_id)));
   if(claim.sources.filter(s=>s.polarity==="supports").some(s=>!sourceIds.has(s.id)))throw Error("Supporting source passage missing");
   const passageIds:string[]=[];
   for(const row of rows){
    const sourceId=String(row.source_id),meta=row.metadata as Record<string,unknown>;
    const version=String(meta?.version??meta?.recordHash??"");
    if(meta?.dataClass!=="public_biomedical"||row.licence_status!=="passage_permitted"||row.retraction_status!=="none_reported"||!row.rights_verified_by||!row.rights_verified_at||typeof meta.licenceIdentifier!=="string"||claim.sources.find(s=>s.id===sourceId)?.sourceVersion!==version||typeof row.passage_text!=="string"||hash(row.passage_text)!==row.passage_hash)throw Error("Source rights, version or passage integrity not verified");
    if(!Number.isFinite(Date.parse(String(row.rights_verified_at)))||Date.parse(String(row.rights_verified_at))>Date.now()||row.passage_text.length>20000)throw Error("Invalid rights attestation time or passage budget");
    const licence=new URL(meta.licenceIdentifier);if(licence.protocol!=="https:"||licence.username||licence.password)throw Error("Rights evidence URI required");
    const authority=await sql`SELECT 1 FROM hsi_research_access a JOIN neon_auth."user" u ON u.id::text=a.principal_id
     WHERE a.principal_id=${String(row.rights_verified_by)} AND a.access_role='research_admin'
      AND a.granted_at<=${new Date(String(row.rights_verified_at)).toISOString()}::timestamptz AND a.revoked_at IS NULL AND u."emailVerified"=true AND COALESCE(u.banned,false)=false LIMIT 1`;
    if(authority.length!==1)throw Error("Source-rights authority not verified");
    if(!bundle.sources.some(s=>s.id===sourceId))bundle.sources.push({id:sourceId,title:String(row.title),kind:"publication",dataClass:"public_real",pmid:row.pmid===null?null:String(row.pmid),doi:row.doi===null?null:String(row.doi),url:row.source_url===null?null:String(row.source_url),licence:{status:"permitted",identifier:meta.licenceIdentifier,passageUsePermitted:true},provenance:{product:"hsi",datasetId:input.release.id,version,retrievedAt:new Date(String(row.retrieved_at)).toISOString()}});
    const passageId=String(row.passage_id);passageIds.push(passageId);
    if(!bundle.passages.some(p=>p.id===passageId))bundle.passages.push({id:passageId,sourceId,sourceVersion:version,text:row.passage_text,locator:String(row.source_locator),dataClass:"public_real",sha256:String(row.passage_hash)});
   }
   const review=claim.reviews[0]!;
   const decisions=await sql`SELECT rationale,evidence_reviewed FROM hsi_evidence_review_decisions WHERE id=${review.id} AND claim_id=${claim.id} AND decision='approve' LIMIT 1`;
   if(decisions.length!==1)throw Error("Review record missing");
   if(!Array.isArray(decisions[0]!.evidence_reviewed)||rows.some((row:Record<string,unknown>)=>!row.pmid||!decisions[0]!.evidence_reviewed.includes("pmid:"+String(row.pmid))))throw Error("Supporting source was not covered by the human review");
   bundle.relationships.push({id:relationshipId,subjectId:claim.subjectId,predicate:claim.predicate,objectId:claim.objectId,dataClass:"public_real",context:{species:["human","mouse","other"].includes(String(ctx.species))?ctx.species as "human"|"mouse"|"other":null,experimentalSystem:["in_vitro","in_vivo","ex_vivo","in_silico"].includes(String(ctx.experimentalSystem))?ctx.experimentalSystem as "in_vitro"|"in_vivo"|"ex_vivo"|"in_silico":null,tissueId:null,assay:typeof ctx.assay==="string"?ctx.assay:null,timepoint:typeof ctx.timepoint==="string"?ctx.timepoint:null},provenance});
   bundle.claims.push({id:claim.id,statement:claim.assertion,relationshipId,passageIds:[...new Set(passageIds)],dataClass:"public_real",support:"supports",assessmentKind:"human",curation:"approved",review:{decisionId:review.id,reviewerRef:review.reviewerPrincipal,role:"reviewer",reviewedAt:review.reviewedAt,rationale:String(decisions[0]!.rationale)}});
  }
  const result={release:input.release,disease:input.disease,bundle:parseResearchBundle(bundle),studyContexts,epistemicTypes};validateReleasedEvidence(result);return result;
 }finally{await sql.close()}
}
