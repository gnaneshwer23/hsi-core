import {normalizePmid,interpretPubmedStatus} from "./scientificMemoryPubmed";
import type {EuropePmcCandidate} from "./scientificMemoryEuropePmc";
/** Internal normalized notice contract, not a claim about the live Europe PMC schema. */
export function interpretEuropePmcNotices(identity:EuropePmcCandidate,projection:unknown){
 const pmid=normalizePmid(identity.pmid);
 if(!projection||typeof projection!=="object")throw Error("Invalid notice projection");
 const p=projection as {source?:unknown;pmid?:unknown;links?:unknown};
 if(p.source!=="MED"||p.pmid!==pmid||!Array.isArray(p.links)||p.links.length>1000)throw Error("Invalid notice identity");
 const commentsCorrections=p.links.map(link=>{
 if(!link||typeof link!=="object"||typeof link.relation!=="string"||link.source!=="MED")throw Error("Invalid notice link");
 const notice=normalizePmid(link.pmid);
 if(notice===pmid)throw Error("Self-referencing notice");
 return {refType:link.relation,pmid:notice};
 });
 const status=interpretPubmedStatus(pmid,{pmid,commentsCorrections});
 return {...identity,status:status.status,noticePmids:status.noticePmids,authority:"europe_pmc" as const,ingestionAllowed:false as const,scientificClaimAllowed:false as const};
}
