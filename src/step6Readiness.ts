/** ARCH-002 Step 6: evidence-based readiness gate. No synthetic passing production status. */
import { readFileSync } from "node:fs";
import { validateSscCuration } from "./sscCuration";
export type GateStatus = "pass" | "blocked";
export type ReadinessGate = {id:string;status:GateStatus;reason:string};
export type ReadinessReport = {scope:"HSI ARCH-002 SSc evidence pipeline";productionReady:false;gates:ReadinessGate[];blockedCount:number};
export type VerifiedEvidence = {
  liveEuropePmcRetrieval:boolean;hsiDatabaseMigrationsApplied:boolean;
  sourceClaimsImportedAndQCPassed:boolean;trustedReviewerAuthentication:boolean;
  qualifiedHumanReviewCompleted:boolean;immutableAuditVerified:boolean;
  publishedReleaseInDatabase:boolean;authenticatedGraphRetrieval:boolean;
  workbenchConnectedToDatabase:boolean;endToEndSecurityAndScientificTests:boolean;
  akshIsiDisconnectedTest:boolean;
};
const gateDescriptions: {key:keyof VerifiedEvidence;id:string;reason:string}[]=[
 {key:"liveEuropePmcRetrieval",id:"G01",reason:"Live Europe PMC retrieval and PMID/DOI verification"},
 {key:"hsiDatabaseMigrationsApplied",id:"G02",reason:"Migrations 001–003 applied and verified in isolated HSI staging"},
 {key:"sourceClaimsImportedAndQCPassed",id:"G03",reason:"Evidence claim/source linkage, rights and QC verified"},
 {key:"trustedReviewerAuthentication",id:"G04",reason:"Trusted identity provider and scientist role enforcement"},
 {key:"qualifiedHumanReviewCompleted",id:"G05",reason:"Qualified human Gate C decisions on actual SSc claims"},
 {key:"immutableAuditVerified",id:"G06",reason:"Append-only review audit and database permission tests"},
 {key:"publishedReleaseInDatabase",id:"G07",reason:"Authorised versioned graph release published to HSI database"},
 {key:"authenticatedGraphRetrieval",id:"G08",reason:"Database-backed, release-scoped authenticated retrieval"},
 {key:"workbenchConnectedToDatabase",id:"G09",reason:"Research UI and workbench use trusted HSI graph API"},
 {key:"endToEndSecurityAndScientificTests",id:"G10",reason:"End-to-end scientific, security, concurrency and rollback tests"},
 {key:"akshIsiDisconnectedTest",id:"G11",reason:"HSI independently operates with Aksh and ISI disconnected"},
];
export function assessStep6Readiness(verified:VerifiedEvidence):ReadinessReport {
 const gates=gateDescriptions.map(g=>({id:g.id,status:verified[g.key]?"pass" as const:"blocked" as const,reason:g.reason}));
 return {scope:"HSI ARCH-002 SSc evidence pipeline",productionReady:false,gates,blockedCount:gates.filter(g=>g.status==="blocked").length};
}
/** Repository-only checks are not evidence of staging, scientific approval or production readiness. */
export function checkRepositoryEvidence(corpusPath="research/ssc-tfh-il21/curation-candidates.v1.json") {
 const corpus=validateSscCuration(JSON.parse(readFileSync(corpusPath,"utf8")));
 return {corpusCandidates:corpus.claims.length,reviewedByHuman:corpus.reviewedByHuman,graphPromotable:corpus.graphPromotable,epistemicTypes:[...new Set(corpus.claims.map(c=>c.epistemicType))].sort()};
}
export const NO_VERIFIED_RUNTIME_EVIDENCE:VerifiedEvidence={
 liveEuropePmcRetrieval:false,hsiDatabaseMigrationsApplied:false,sourceClaimsImportedAndQCPassed:false,
 trustedReviewerAuthentication:false,qualifiedHumanReviewCompleted:false,immutableAuditVerified:false,
 publishedReleaseInDatabase:false,authenticatedGraphRetrieval:false,workbenchConnectedToDatabase:false,
 endToEndSecurityAndScientificTests:false,akshIsiDisconnectedTest:false,
};
