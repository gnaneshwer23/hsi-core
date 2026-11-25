import {normalizeEvidenceDoi} from "./scientificMemoryCrossref";
export type PublicationStatus="current"|"unknown"|"retracted"|"corrected"|"superseded"|"expression_of_concern";
export interface PublicationObservation {authority:"crossref"|"pubmed"|"europe_pmc"|"publisher";doi:string;version:string;status:PublicationStatus;checkedAt:string;noticeRefs:readonly string[]}
const adverse:readonly PublicationStatus[]=["retracted","expression_of_concern","corrected","superseded"];
const authorities=new Set(["crossref","pubmed","europe_pmc","publisher"]);
/** Offline decision candidate. Authority labels are not authenticated provenance. */
export function adjudicatePublication(doiInput:string,version:string,observations:readonly PublicationObservation[],nowMs:number,maxAgeMs=86400000){
 const doi=normalizeEvidenceDoi(doiInput);
 if(!version||version.length>128||!Number.isFinite(nowMs)||!Number.isFinite(maxAgeMs)||maxAgeMs<=0||maxAgeMs>2592000000||!Array.isArray(observations)||observations.length>100)throw Error("Invalid adjudication input");
 const matched:PublicationObservation[]=[];let identityConflict=false;
 for(const o of observations){
 if(!o||!authorities.has(o.authority)||!["current","unknown",...adverse].includes(o.status)||!Array.isArray(o.noticeRefs)||o.noticeRefs.length>100||o.noticeRefs.some((r:unknown)=>typeof r!=="string"||r.length>2048))throw Error("Invalid observation");
 const checked=Date.parse(o.checkedAt);if(!Number.isFinite(checked)||checked>nowMs)throw Error("Invalid observation time");
 if(normalizeEvidenceDoi(o.doi)!==doi||o.version!==version){identityConflict=true;continue;}
 matched.push(o);
 }
 const statuses=[...new Set(matched.map(o=>o.status))].sort();
 const status=adverse.find(s=>statuses.includes(s))??"unknown";
 const fresh=matched.filter(o=>nowMs-Date.parse(o.checkedAt)<=maxAgeMs);
 const decision=status==="retracted"||status==="expression_of_concern"?"quarantine":status!=="unknown"||identityConflict?"recheck_required":"insufficient_verified_provenance";
 return {doi,version,status,decision,identityConflict,statusConflict:statuses.filter(s=>s!=="unknown").length>1,observedStatuses:statuses,authorities:[...new Set(matched.map(o=>o.authority))].sort(),freshAuthorities:[...new Set(fresh.map(o=>o.authority))].sort(),noticeRefs:[...new Set(matched.flatMap(o=>o.noticeRefs))].sort(),independentCorroborationVerified:false as const,ingestionAllowed:false as const,scientificClaimAllowed:false as const};
}
