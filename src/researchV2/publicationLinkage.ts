/** B-04.4: live PMID to PMCID mapping; no rights/retraction clearance inferred. */
import type {SourceFetcher} from "./sourceAdapters";
import {resolveEuropePmcPmid} from "./livePublicationVerification";
import {retrieveOpenAccessExcerpt,type OpenAccessExcerpt} from "./openAccessPassages";
export interface LinkedPublication {pmid:string;pmcid:string;doi:string|null;excerpt:OpenAccessExcerpt;rightsStatus:"unverified";retractionStatus:"unverified";readyForScientificApproval:false;}
export async function retrieveLinkedPublication(pmid:string,fetcher:SourceFetcher=fetch):Promise<LinkedPublication>{
 const metadata=await resolveEuropePmcPmid(pmid,fetcher);
 const url="https://www.ebi.ac.uk/europepmc/webservices/rest/search?query="+encodeURIComponent("EXT_ID:"+pmid+" AND SRC:MED")+"&format=json&pageSize=2";
 const response=await fetcher(url,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error("Publication mapping HTTP "+response.status);
 const json=await response.json() as {resultList?:{result?:unknown[]}};
 const rows=json.resultList?.result;
 if(!Array.isArray(rows))throw Error("Invalid mapping response");
 const matches=rows.filter((v):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v)&&(v as Record<string,unknown>).id===pmid&&(v as Record<string,unknown>).source==="MED");
 if(matches.length!==1)throw Error("Ambiguous PMID mapping");
 const pmcid=matches[0]!.pmcid;
 if(typeof pmcid!=="string"||!/^PMC[1-9][0-9]{0,11}$/.test(pmcid))throw Error("No verified PMCID linkage");
 const excerpt=await retrieveOpenAccessExcerpt(pmcid,fetcher);
 if(excerpt.pmcid!==pmcid)throw Error("Full text linkage mismatch");
 return {pmid,pmcid,doi:metadata.doi,excerpt,rightsStatus:"unverified",retractionStatus:"unverified",readyForScientificApproval:false};
}
