import {normalizePmid} from "./scientificMemoryPubmed";
import {normalizeEvidenceDoi} from "./scientificMemoryCrossref";
export interface EuropePmcCandidate {pmid:string;doi:string|null;pmcid:string|null;status:"unknown";ingestionAllowed:false;scientificClaimAllowed:false}
/** Interpret a single exact MED result; absence of notices is not evidence of current status. */
export function interpretEuropePmcIdentity(requested:string,payload:unknown):EuropePmcCandidate{
 const pmid=normalizePmid(requested);
 if(!payload||typeof payload!=="object")throw Error("Invalid Europe PMC response");
 const p=payload as {hitCount?:unknown;resultList?:{result?:unknown}};
 const rows=p.resultList?.result;
 if(p.hitCount!==1||!Array.isArray(rows)||rows.length!==1)throw Error("Ambiguous Europe PMC identity");
 const row=rows[0];
 if(!row||row.source!=="MED"||row.id!==pmid||row.pmid!==pmid)throw Error("Europe PMC identity mismatch");
 const doi=row.doi===undefined?null:normalizeEvidenceDoi(row.doi);
 const pmcid=row.pmcid===undefined?null:row.pmcid;
 if(pmcid!==null&&(typeof pmcid!=="string"||!/^PMC[1-9][0-9]*$/.test(pmcid)))throw Error("Invalid PMCID");
 return {pmid,doi,pmcid,status:"unknown",ingestionAllowed:false,scientificClaimAllowed:false};
}
