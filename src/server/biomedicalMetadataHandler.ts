/**
 * POST /api/research/biomedical-metadata {accession, stableId}
 * Server-side UniProt + Reactome metadata for the scientific workbench panel.
 * Browser must not call UniProt or Reactome directly (ING-01). Metadata only.
 */
import type {FetchLike} from "../fetchLike";
import {lookupUniProtProtein} from "../evidence/uniProtProteinLookup";
import {lookupReactomePathway} from "../evidence/reactomePathwayLookup";
import {boundedRequestText,RequestBodyTooLarge,RequestBodyTimeout} from "./boundedRequestBody";

type Env=Readonly<Record<string,string|undefined>>;
const hits=new Map<string,number[]>();
export const resetBiomedicalMetadataLimiter=()=>hits.clear();
const BODY_LIMIT=500;
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});

function rememberHit(ip:string,at:number):void{
 hits.set(ip,[...(hits.get(ip)??[]).filter(t=>at-t<600_000),at]);
 if(hits.size<=2000)return;
 const oldest=hits.keys().next().value;
 if(oldest!==undefined)hits.delete(oldest);
}

export async function handleBiomedicalMetadata(request:Request,env:Env,deps:{fetcher?:FetchLike;now?:()=>Date}={}):Promise<Response>{
 if(request.method!=="POST")return json({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405,{Allow:"POST"});
 const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
 if(pub&&origin&&origin!==pub)return json({code:"ORIGIN_NOT_ALLOWED",error:"Origin not allowed"},403);
 if(!/^application\/json/i.test(request.headers.get("content-type")??""))return json({code:"JSON_REQUIRED",error:"JSON body required"},415);
 if(Number(request.headers.get("content-length")??0)>BODY_LIMIT)return json({code:"PAYLOAD_TOO_LARGE",error:"Request too large"},413);
 let raw:string;
 try{raw=await boundedRequestText(request,BODY_LIMIT)}
 catch(error){
  if(error instanceof RequestBodyTooLarge)return json({code:"PAYLOAD_TOO_LARGE",error:"Request too large"},413);
  if(error instanceof RequestBodyTimeout)return json({code:"REQUEST_TIMEOUT",error:"Request body timed out"},408);
  return json({code:"INVALID_JSON",error:"Invalid JSON"},400);
 }
 let body:unknown;try{body=JSON.parse(raw)}catch{return json({code:"INVALID_JSON",error:"Invalid JSON"},400)}
 const record=body&&typeof body==="object"&&!Array.isArray(body)?body as Record<string,unknown>:{};
 const accession=typeof record.accession==="string"?record.accession.trim().slice(0,20):"";
 const stableId=typeof record.stableId==="string"?record.stableId.trim().slice(0,30):"";
 if(!accession||!stableId)return json({code:"INVALID_INPUT",error:"Provide a UniProt accession and a Reactome stable ID"},400);
 const now=deps.now??(()=>new Date()),ip=(request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now().getTime()-t<600_000);
 if(recent.length>=15)return json({code:"RATE_LIMITED",error:"Rate limit reached. Try again later."},429,{"Retry-After":"600"});
 rememberHit(ip,now().getTime());
 const [protein,pathway]=await Promise.all([
  lookupUniProtProtein({accession,fetcher:deps.fetcher}),
  lookupReactomePathway({stableId,fetcher:deps.fetcher}),
 ]);
 if(!protein.ok||!pathway.ok){
  return json({
   ok:false,
   code:"RETRIEVAL_UNAVAILABLE",
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
