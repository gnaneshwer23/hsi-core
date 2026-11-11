/** B-04.4.4: live Europe PMC metadata resolver with explicit unverified fields. */
import type {SourceFetcher} from "./sourceAdapters";
import type {VerifiedSourceEnvelope} from "./passageVerification";
const pmid=/^[1-9][0-9]{0,11}$/;
export interface LivePublicationResult{source:VerifiedSourceEnvelope;title:string|null;doi:string|null;isRetracted:boolean|null;verifiedAt:string;warnings:string[];}
export async function resolveEuropePmcPmid(id:string,fetcher:SourceFetcher=fetch):Promise<LivePublicationResult>{
 if(!pmid.test(id))throw Error("Invalid PMID");
 const url="https://www.ebi.ac.uk/europepmc/webservices/rest/search?query="+encodeURIComponent("EXT_ID:"+id+" AND SRC:MED")+"&format=json&pageSize=2";
 const response=await fetcher(url,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error("Europe PMC HTTP "+response.status);
 const json=await response.json() as {resultList?:{result?:unknown[]}};
 if(!Array.isArray(json.resultList?.result))throw Error("Unexpected Europe PMC schema");
 const matches=json.resultList.result.filter((x):x is Record<string,unknown>=>!!x&&typeof x==="object"&&!Array.isArray(x)&&(x as Record<string,unknown>).id===id&&(x as Record<string,unknown>).source==="MED");
 if(matches.length!==1)throw Error("PMID not uniquely resolved");
 const record=matches[0]!;
 const isRetracted=record.isRetracted===true?true:record.isRetracted===false?false:null;
 // A false flag alone cannot establish complete current correction/retraction status.
 const warnings=["Full text and reuse rights not verified","Correction/retraction status requires independent current-source check"];
 return {source:{sourceId:"europepmc:MED:"+id,canonicalId:"PMID:"+id,sourceUrl:"https://europepmc.org/article/MED/"+id,retrievedAt:new Date().toISOString(),sourceKind:"publication",identifierKind:"PMID",identityChecked:true,correctionStatus:isRetracted===true?"retracted":"unknown",rights:{passageUsePermitted:false,licenceId:null,basis:null},passage:null},title:typeof record.title==="string"?record.title:null,doi:typeof record.doi==="string"?record.doi:null,isRetracted,verifiedAt:new Date().toISOString(),warnings};
}
