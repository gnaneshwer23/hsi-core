/** B-01: public bibliographic metadata normalization; never authorizes abstract/full-text reuse. */
import {createHash} from "node:crypto";
import {parseResearchBundle,type ResearchSource,type ResearchProvenance} from "./researchContracts";
import type {PubmedResult} from "./scientificPubmedRetrieval";
export type NormalizedBibliography={sources:ResearchSource[];sourceHashes:Record<string,string>;duplicates:number;rejected:number;retrievedAt:string;provider:"pubmed"|"europepmc"};
export type EuropePmcResult={hitCount?:number;resultList?:{result?:unknown[]}};
const digest=(v:string)=>createHash("sha256").update(v).digest("hex");
const clean=(v:unknown,max=4000)=>typeof v==="string"&&v.trim()&&v.length<=max&&!/[<>\u0000-\u001f]/.test(v)?v.trim().replace(/\s+/g," "):null;
const pmid=(v:unknown)=>typeof v==="string"&&/^[1-9]\d{0,8}$/.test(v)?v:null;
const doi=(v:unknown)=>{const s=clean(v,512);return s&&/^10\.\d{4,9}\/\S+$/i.test(s)?s:null};
const iso=(v:string)=>{if(!Number.isFinite(Date.parse(v)))throw Error("Invalid retrieval timestamp");return new Date(v).toISOString()};
function source(provider:"pubmed"|"europepmc",id:string,title:string,doiValue:string|null,when:string):ResearchSource{
 const provenance:ResearchProvenance={product:"hsi",datasetId:provider+"-pmid-"+id,version:"bibliography-metadata-v1",retrievedAt:when};
 return {id:"pmid-"+id,title,kind:"publication",dataClass:"public_real",pmid:id,doi:doiValue,url:"https://pubmed.ncbi.nlm.nih.gov/"+id+"/",licence:{status:"unknown",identifier:null,passageUsePermitted:false},provenance};
}
function finish(provider:"pubmed"|"europepmc",rows:Array<{pmid:string;title:string;doi:string|null}>,rejected:number,when:string):NormalizedBibliography{
 const map=new Map<string,ResearchSource>();let duplicates=0;
 for(const row of rows){if(map.has(row.pmid)){duplicates++;continue}map.set(row.pmid,source(provider,row.pmid,row.title,row.doi,when))}
 const sources=[...map.values()];
 const sourceHashes:Object=Object.fromEntries(sources.map(s=>[s.id,digest(JSON.stringify({pmid:s.pmid,doi:s.doi,title:s.title,provider,version:s.provenance.version}))]));
 return {sources,sourceHashes:sourceHashes as Record<string,string>,duplicates,rejected,retrievedAt:when,provider};
}
export function normalizePubmed(result:PubmedResult):NormalizedBibliography{
 if(!result||!Array.isArray(result.hits))throw Error("Malformed PubMed result");
 const when=iso(result.retrievedAt);let rejected=0;const rows:Array<{pmid:string;title:string;doi:string|null}>=[];
 for(const hit of result.hits){const id=pmid(hit?.pmid),title=clean(hit?.title);if(!id||!title){rejected++;continue}rows.push({pmid:id,title,doi:null})}
 return finish("pubmed",rows,rejected,when);
}
export function normalizeEuropePmc(input:EuropePmcResult,retrievedAt:string):NormalizedBibliography{
 if(!input||!Array.isArray(input.resultList?.result))throw Error("Malformed Europe PMC result");
 const when=iso(retrievedAt);let rejected=0;const rows:Array<{pmid:string;title:string;doi:string|null}>=[];
 for(const raw of input.resultList.result){if(!raw||typeof raw!=="object"||Array.isArray(raw)){rejected++;continue}
  const hit=raw as Record<string,unknown>;const id=pmid(hit.pmid),title=clean(hit.title);
  if(!id||!title){rejected++;continue}
  rows.push({pmid:id,title,doi:doi(hit.doi)});
 }
 return finish("europepmc",rows,rejected,when);
}
/** Deduplicate across providers by PMID. Preserve the first verified metadata snapshot. */
export function mergeBibliographies(...inputs:NormalizedBibliography[]):{sources:ResearchSource[];sourceHashes:Record<string,string>;duplicates:number;rejected:number}{
 const map=new Map<string,ResearchSource>();const hashes:Record<string,string>={};let duplicates=0,rejected=0;
 for(const input of inputs){duplicates+=input.duplicates;rejected+=input.rejected;for(const s of input.sources){
  if(map.has(s.id)){duplicates++;continue}map.set(s.id,s);hashes[s.id]=input.sourceHashes[s.id]!;
 }}
 return {sources:[...map.values()],sourceHashes:hashes,duplicates,rejected};
}
/** Validate that metadata-only sources can be attached to an existing public research bundle. */
export function withNormalizedSources(bundle:unknown,normalized:NormalizedBibliography){
 const base=parseResearchBundle(bundle);
 if(base.context.dataClass!=="public_real"||base.sources.length||base.passages.length||base.claims.length)throw Error("B-01 requires an empty metadata-only public bundle");
 return parseResearchBundle({...base,sources:normalized.sources});
}
