/** Phase 4 evidence snapshot builder. Produces a portable immutable payload;
 * persistence requires a separately reviewed store and database permissions.
 * Metadata verification is NOT scientific claim approval.
 */
import {createHash} from "node:crypto";
import type {LiteratureRecord} from "./europePmcSscDiscovery";
import {prepareSscLiteratureVerification,type SscCandidatePack} from "./sscLiteratureVerification";

export type SscEvidenceSnapshot={
 schemaVersion:"hsi-ssc-evidence-snapshot-1";
 datasetId:string;capturedAt:string;contentHash:string;
 sourceRecords:readonly {pmid:string;doi:string|null;title:string;sourceId:string;retrievedAt:string;verificationState:string}[];
 claimAssessments:ReturnType<typeof prepareSscLiteratureVerification>;
 reviewState:"pending_independent_scientific_review";graphPromotable:false;
};
export function buildSscEvidenceSnapshot(input:{pack:SscCandidatePack;records:readonly LiteratureRecord[];capturedAt:string;datasetId:string}):SscEvidenceSnapshot{
 if(!Number.isFinite(Date.parse(input.capturedAt))||!/^\d{4}-\d{2}-\d{2}T/.test(input.capturedAt))throw Error("Invalid snapshot time");
 if(!/^ssc-[a-z0-9-]{3,80}-v\d+$/.test(input.datasetId))throw Error("Invalid dataset identity");
 const assessments=prepareSscLiteratureVerification(input.pack,input.records);
 const sourceRecords=input.records.filter(r=>r.sourceType==="MED"&&r.pmid).map(r=>({
  pmid:r.pmid!,doi:r.doi,title:r.title,sourceId:r.sourceId,retrievedAt:r.retrievedAt,verificationState:r.verificationState
 })).sort((a,b)=>a.pmid.localeCompare(b.pmid)||a.sourceId.localeCompare(b.sourceId));
 if(sourceRecords.some(r=>!/^\d{1,9}$/.test(r.pmid)||r.verificationState!=="metadata_retrieved_not_claim_verified"||!Number.isFinite(Date.parse(r.retrievedAt))))throw Error("Invalid source metadata");
 if(new Set(sourceRecords.map(r=>r.pmid)).size!==sourceRecords.length)throw Error("Duplicate source PMID in snapshot");
 const base={schemaVersion:"hsi-ssc-evidence-snapshot-1" as const,datasetId:input.datasetId,capturedAt:input.capturedAt,sourceRecords,claimAssessments:assessments,reviewState:"pending_independent_scientific_review" as const,graphPromotable:false as const};
 const contentHash=createHash("sha256").update(JSON.stringify(base)).digest("hex");
 return {...base,contentHash};
}
export function verifySscEvidenceSnapshot(snapshot:SscEvidenceSnapshot):boolean{
 const {contentHash,...body}=snapshot;
 return /^[a-f0-9]{64}$/.test(contentHash)&&createHash("sha256").update(JSON.stringify(body)).digest("hex")===contentHash&&snapshot.reviewState==="pending_independent_scientific_review"&&snapshot.graphPromotable===false;
}
