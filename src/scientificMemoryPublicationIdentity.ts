import {normalizeEvidenceDoi} from "./scientificMemoryCrossref";
import {normalizePmid} from "./scientificMemoryPubmed";
export interface PublicationIdentityAssertion {authority:"crossref"|"pubmed"|"europe_pmc"|"publisher";doi?:string;pmid?:string;pmcid?:string;version?:string}
const authorities=new Set(["crossref","pubmed","europe_pmc","publisher"]);
/** Candidate reconciliation only: identifiers and authority labels are not authenticated. */
export function reconcilePublicationIdentity(anchor:PublicationIdentityAssertion,assertions:readonly PublicationIdentityAssertion[]){
 function normalize(a:PublicationIdentityAssertion){
 if(!a||!authorities.has(a.authority))throw Error("Invalid authority");
 const doi=a.doi===undefined?undefined:normalizeEvidenceDoi(a.doi);
 const pmid=a.pmid===undefined?undefined:normalizePmid(a.pmid);
 const pmcid=a.pmcid;
 if(pmcid!==undefined&&(typeof pmcid!=="string"||!/^PMC[1-9][0-9]{0,11}$/.test(pmcid)))throw Error("Invalid PMCID");
 if(a.version!==undefined&&(typeof a.version!=="string"||!a.version.trim()||a.version.length>128))throw Error("Invalid version");
 if(!doi&&!pmid&&!pmcid)throw Error("Missing publication identifier");
 return {doi,pmid,pmcid,version:a.version,authority:a.authority};
 }
 if(!Array.isArray(assertions)||assertions.length>100)throw Error("Invalid assertions");
 const root=normalize(anchor),rows=assertions.map(normalize);
 const ids=["doi","pmid","pmcid"] as const;
 const fields=[...ids,"version"] as const;
 const linked=rows.filter(r=>ids.some(k=>root[k]!==undefined&&root[k]===r[k]));
 const conflicts=fields.filter(k=>new Set([root,...linked].map(r=>r[k]).filter(v=>v!==undefined)).size>1);
 const unresolved=rows.length-linked.length;
 const candidate=Object.fromEntries(fields.map(k=>[k,conflicts.includes(k)?null:([root,...linked].find(r=>r[k]!==undefined)?.[k]??null)]));
 return {candidate,decision:conflicts.length?"conflict":unresolved||!linked.length?"insufficient_linkage":"candidate_match",conflicts,unresolved,linkedAuthorities:[...new Set([root,...linked].map(r=>r.authority))].sort(),identityVerified:false as const,independentCorroborationVerified:false as const,ingestionAllowed:false as const,scientificClaimAllowed:false as const};
}
