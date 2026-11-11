/** B-04.2 public metadata adapters. No PHI, full-text copying or graph promotion. */
export type PublicSourceKind="publication"|"target_disease";
export interface PublicSourceRecord {
 sourceId:string;kind:PublicSourceKind;canonicalId:string;sourceUrl:string;
 retrievedAt:string;sourceVersion:string;licenceId:null;
 passageUsePermitted:false;accessClass:"public";metadata:Record<string,unknown>;
}
export interface PublicSourceAdapter {
 id:string;search(terms:string[],limit?:number):Promise<PublicSourceRecord[]>;
}
/** Callable fetch subset, compatible with Bun and injected test doubles. */
export type SourceFetcher=(input: string | URL | Request, init?: RequestInit)=>Promise<Response>;
function termsOk(terms:string[],limit:number){
 if(!Array.isArray(terms)||terms.length===0||terms.length>8||terms.some(x=>typeof x!=="string"||!x.trim()||x.length>160)||!Number.isInteger(limit)||limit<1||limit>50)throw Error("Invalid source search");
}
async function json(url:string,fetcher:SourceFetcher):Promise<any>{
 const response=await fetcher(url,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error("Biomedical source HTTP "+response.status);
 return response.json();
}
export function europePmcAdapter(fetcher:SourceFetcher=fetch):PublicSourceAdapter {
 return {id:"europe-pmc",async search(terms,limit=20){
  termsOk(terms,limit);
  const url=new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
  url.searchParams.set("query",terms.map(t=>'"'+t.replace(/"/g,"")+'"').join(" OR "));
  url.searchParams.set("format","json");url.searchParams.set("pageSize",String(limit));
  const body=await json(url.toString(),fetcher);
  if(!Array.isArray(body?.resultList?.result))throw Error("Unexpected Europe PMC response");
  return body.resultList.result.filter((r:any)=>typeof r?.id==="string"&&typeof r?.source==="string").map((r:any)=>({
   sourceId:"europepmc:"+r.source+":"+r.id,kind:"publication" as const,
   canonicalId:r.pmid?"PMID:"+r.pmid:r.source+":"+r.id,
   sourceUrl:"https://europepmc.org/article/"+encodeURIComponent(r.source)+"/"+encodeURIComponent(r.id),
   retrievedAt:new Date().toISOString(),sourceVersion:"europepmc-rest-search-v1",
   licenceId:null,passageUsePermitted:false as const,accessClass:"public" as const,
   metadata:{title:r.title??null,doi:r.doi??null,pmid:r.pmid??null,publicationYear:r.pubYear??null}
  }));
 }};
}
/** Open Targets GraphQL requires canonical disease EFO/MONDO identifiers, not free-text names. */
export function openTargetsAdapter(fetcher:SourceFetcher=fetch):PublicSourceAdapter {
 return {id:"open-targets",async search(diseaseIds,limit=20){
  termsOk(diseaseIds,limit);
  if(diseaseIds.some(x=>!/^(EFO|MONDO|Orphanet|HP)_[0-9]+$/.test(x)))throw Error("Canonical disease identifier required");
  const query=`query HsiDiseaseTargets($id:String!,$size:Int!){disease(efoId:$id){id name associatedTargets(page:{index:0,size:$size}){rows{target{id approvedSymbol}score}}}}`;
  const results:PublicSourceRecord[]=[];
  for(const id of diseaseIds){
   const response=await fetcher("https://api.platform.opentargets.org/api/v4/graphql",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({query,variables:{id,size:limit}}),signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error("Open Targets HTTP "+response.status);
   const body=await response.json() as any;
   if(body.errors?.length||!body.data?.disease||!Array.isArray(body.data.disease.associatedTargets?.rows))throw Error("Unexpected Open Targets response");
   for(const row of body.data.disease.associatedTargets.rows){
    if(typeof row?.target?.id!=="string"||typeof row.score!=="number")continue;
    results.push({sourceId:"opentargets:"+id+":"+row.target.id,kind:"target_disease",canonicalId:row.target.id,sourceUrl:"https://platform.opentargets.org/disease/"+encodeURIComponent(id),retrievedAt:new Date().toISOString(),sourceVersion:"open-targets-graphql-v4",licenceId:null,passageUsePermitted:false,accessClass:"public",metadata:{diseaseId:id,diseaseName:body.data.disease.name??null,targetSymbol:row.target.approvedSymbol??null,associationScore:row.score,associationNotCausality:true}});
   }
  }
  return results;
 }};
}
