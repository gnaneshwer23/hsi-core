import {createHash} from 'node:crypto';
import {verifyDomainBundle} from '../knowledgeGraph/domainGraph';
const MAX_BYTES=2_000_000;
/** Public candidate snapshots only. This service has no DB, session, provider or write dependency. */
export function createPublicGraphSnapshotHandler(config:{currentVersion:string;readPublishedSnapshot:(version:string)=>Promise<Uint8Array>}){
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-HSI-Graph-Backend':'published-candidate-snapshot','X-Robots-Tag':'noindex, nofollow'};
 const fail=(status:number,error:string,extra:Record<string,string>={})=>new Response(JSON.stringify({error}),{status,headers:{...headers,...extra}});
 return async(request:Request):Promise<Response>=>{
  if(request.method!=='GET')return fail(405,'Method not allowed',{Allow:'GET'});
  const url=new URL(request.url),values=url.searchParams.getAll('version');
  // Vercel catch-all routing may attach the matched path; it is not a data selector.
  const routedPath=url.searchParams.getAll('path');
  if(routedPath.length>1||routedPath.some(p=>p!=='graph-snapshot')||values.length>1||[...url.searchParams.keys()].some(k=>k!=='version'&&k!=='_vercel_share'&&k!=='x-vercel-protection-bypass'&&k!=='x-vercel-set-bypass-cookie'&&k!=='path'))return fail(400,'Invalid graph request');
  const version=values[0]??config.currentVersion;
  if(!/^[a-f0-9]{64}$/.test(version))return fail(400,'Invalid graph version');
  if(request.signal.aborted)return fail(499,'Request cancelled');
  try{
   const bytes=await config.readPublishedSnapshot(version);
   if(request.signal.aborted)return fail(499,'Request cancelled');
   if(bytes.byteLength>MAX_BYTES)throw Error('Snapshot exceeds response budget');
   const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
   const graph=await verifyDomainBundle(JSON.parse(text),async s=>createHash('sha256').update(s).digest('hex'),version);
   if(graph.method!=='explicit_repository_and_editorial_candidate_mapping_v2')throw Error('Retired mapping');
   return new Response(text,{status:200,headers:{...headers,'X-HSI-Graph-Version':version}});
  }catch{return fail(503,'Published graph unavailable or unverifiable. No substitute graph was returned.');}
 };
}
