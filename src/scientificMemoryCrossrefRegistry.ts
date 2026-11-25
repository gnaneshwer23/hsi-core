import {normalizeEvidenceDoi,type CrossrefStatusCandidate} from "./scientificMemoryCrossref";
import type {EvidenceStatus} from "./scientificMemoryEvidenceFreshness";
export interface CrossrefRegistryCandidate {
 sourceId:string; sourceVersion:string; authority:"crossref"; status:EvidenceStatus;
 checkedAt:string; noticeRefs:readonly string[]; scientificClaimAllowed:false;
 ingestionAllowed:false;
}
/** Offline preparation only: version linkage and public identity must be independently verified before persistence. */
export function prepareCrossrefRegistryCandidate(candidate:CrossrefStatusCandidate,version:string,checkedAt:string,nowMs:number):CrossrefRegistryCandidate{
 if(!candidate||candidate.scientificClaimAllowed!==false||typeof version!=="string"||!version.trim()||version.length>1000||!Number.isSafeInteger(nowMs)||nowMs<0||typeof checkedAt!=="string"||!Number.isFinite(Date.parse(checkedAt))||Date.parse(checkedAt)>nowMs)throw Error("Invalid registry candidate");
 if(!["retracted","corrected","superseded","expression_of_concern","unknown"].includes(candidate.status)||!Array.isArray(candidate.noticeDois)||candidate.noticeDois.length>1000)throw Error("Invalid Crossref status");
 const noticeRefs=[...new Set(candidate.noticeDois.map(d=>"doi:"+normalizeEvidenceDoi(d)))].sort();
 if(candidate.status!=="unknown"&&!noticeRefs.length)throw Error("Missing adverse status notice");
 return {sourceId:"doi:"+normalizeEvidenceDoi(candidate.doi),sourceVersion:version,authority:"crossref",status:candidate.status,checkedAt:new Date(checkedAt).toISOString(),noticeRefs,scientificClaimAllowed:false,ingestionAllowed:false};
}
