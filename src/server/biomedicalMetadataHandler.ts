/**
 * POST /api/research/biomedical-metadata {accession, stableId}
 * Server-side UniProt + Reactome metadata for the scientific workbench panel.
 * Browser must not call UniProt or Reactome directly (ING-01). Metadata only.
 */
import type {FetchLike} from "../fetchLike";
import {lookupUniProtProtein} from "../evidence/uniProtProteinLookup";
import {lookupReactomePathway} from "../evidence/reactomePathwayLookup";

type Env=Readonly<Record<string,string|undefined>>;
const hits=new Map<string,number[]>();
export const resetBiomedicalMetadataLimiter=()=>hits.clear();
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});

export async function handleBiomedicalMetadata(request:Request,env:Env,deps:{fetcher?:FetchLike;now?:()=>Date}={}):Promise<Response>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405,{Allow:"POST"});
 const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
 if(pub&&origin&&origin!==pub)return json({error:"Origin not allowed"},403);
 if(!/^application\/json/i.test(request.headers.get("content-type")??""))return json({error:"JSON body required"},415);
 const raw=await request.text();
 if(raw.length>500)return json({error:"Request too large"},413);
 let body:any;try{body=JSON.parse(raw)}catch{return json({error:"Invalid JSON"},400)}
 const accession=typeof body?.accession==="string"?body.accession.trim().slice(0,20):"";
 const stableId=typeof body?.stableId==="string"?body.stableId.trim().slice(0,30):"";
 if(!accession||!stableId)return json({error:"Provide a UniProt accession and a Reactome stable ID"},400);
 const now=deps.now??(()=>new Date()),ip=(request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now().getTime()-t<600_000);
 if(recent.length>=15)return json({error:"Rate limit reached. Try again later."},429,{"Retry-After":"600"});
 hits.set(ip,[...recent,now().getTime()]);if(hits.size>2000)hits.clear();
 const [protein,pathway]=await Promise.all([
  lookupUniProtProtein({accession,fetcher:deps.fetcher}),
  lookupReactomePathway({stableId,fetcher:deps.fetcher}),
 ]);
 if(!protein.ok||!pathway.ok){
  return json({
   ok:false,
   error:[
    !protein.ok?`UniProt: ${protein.detail}`:"",
    !pathway.ok?`Reactome: ${pathway.detail}`:"",
   ].filter(Boolean).join(" · "),
  },502);
 }
 return json({
  ok:true,
  schemaVersion:"hsi-biomedical-metadata-1",
  note:"Unreviewed public metadata. No mechanism, membership, clinical use, or graph promotion.",
  protein:{accession:protein.protein.accession,name:protein.protein.proteinName,url:protein.protein.url,retrievedAt:protein.protein.retrievedAt},
  pathway:{id:pathway.pathway.stableId,name:pathway.pathway.displayName,url:pathway.pathway.url,retrievedAt:pathway.pathway.retrievedAt},
 });
}
