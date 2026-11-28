/**
 * LEA-04K: the bounded-neighbourhood endpoint. Returns the relationships within a few hops of one or more concepts in
 * the published graph, never more than a fixed budget, with every relationship still a candidate and unreviewed.
 * Read-only over the packaged, digest-verified snapshot. No database, session, provider or write dependency.
 */
import {createHash} from "node:crypto";
import {verifyDomainBundle,type DomainBundle} from "../knowledgeGraph/domainGraph";
import {buildGraphModel,type GraphAssertionView,type GraphModel} from "../graphWorkspace/assertionView";
import {expand,finishSlice} from "../graphWorkspace/slice";

export const NEIGHBOURHOOD_LIMITS={maxSeeds:8,maxDepth:3,maxAssertions:200,defaultDepth:1,defaultLimit:60} as const;

export type NeighbourhoodResponse={
 graphVersion:string;seeds:string[];depth:number;limit:number;truncated:boolean;
 assertions:GraphAssertionView[];
 nodes:{id:string;name:string;kind:string}[];
 gapIds:string[];questionIds:string[];
 status:"candidate_unreviewed";scientificApproval:false;
};

const NODE_ID=/^[A-Za-z0-9][A-Za-z0-9:_.-]{1,120}$/;
const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"public, max-age=300","X-Content-Type-Options":"nosniff","X-HSI-Graph-Backend":"published-candidate-snapshot","X-Robots-Tag":"noindex, nofollow"};
const fail=(status:number,code:string,error:string)=>new Response(JSON.stringify({code,error}),{status,headers:{...headers,"Cache-Control":"no-store"}});

/** Pure: compute a bounded neighbourhood. Exported for tests and for the client fallback. */
export function boundedNeighbourhood(m:GraphModel,seeds:readonly string[],depth:number,limit:number):NeighbourhoodResponse{
 const d=Math.max(1,Math.min(NEIGHBOURHOOD_LIMITS.maxDepth,Math.trunc(depth)||NEIGHBOURHOOD_LIMITS.defaultDepth));
 const l=Math.max(1,Math.min(NEIGHBOURHOOD_LIMITS.maxAssertions,Math.trunc(limit)||NEIGHBOURHOOD_LIMITS.defaultLimit));
 const known=[...new Set(seeds)].filter(s=>m.nodes.has(s)).slice(0,NEIGHBOURHOOD_LIMITS.maxSeeds);
 const x=expand(m,new Set(known),d,l);
 const slice=finishSlice(m,x.assertions);
 return{
  graphVersion:m.version,seeds:known,depth:d,limit:l,truncated:x.truncated,
  assertions:[...x.assertions],
  nodes:[...slice.nodeIds].map(id=>{const n=m.nodes.get(id)!;return{id,name:n.name,kind:n.kind}}),
  gapIds:[...slice.gapIds],questionIds:[...slice.questionIds],
  status:"candidate_unreviewed",scientificApproval:false,
 };
}

export function createGraphNeighbourhoodHandler(config:{currentVersion:string;readPublishedSnapshot:(version:string)=>Promise<unknown>}){
 let cached:{version:string;model:GraphModel}|null=null;
 const model=async(version:string)=>{
  if(cached?.version===version)return cached.model;
  const raw=await config.readPublishedSnapshot(version);
  const b:DomainBundle=await verifyDomainBundle(raw,async s=>createHash("sha256").update(s).digest("hex"),version);
  cached={version,model:buildGraphModel(b)};return cached.model;
 };
 return async(request:Request):Promise<Response>=>{
  if(request.method!=="GET")return fail(405,"METHOD_NOT_ALLOWED","Method not allowed");
  const u=new URL(request.url),p=u.searchParams;
  const allowed=new Set(["node","depth","limit","version","_vercel_share","x-vercel-protection-bypass","x-vercel-set-bypass-cookie","path","...path"]);
  if([...p.keys()].some(k=>!allowed.has(k)))return fail(400,"INVALID_REQUEST","Unknown parameter");
  const seeds=p.getAll("node");
  if(!seeds.length)return fail(400,"NODE_REQUIRED","Give at least one node");
  if(seeds.length>NEIGHBOURHOOD_LIMITS.maxSeeds||seeds.some(s=>!NODE_ID.test(s)))return fail(400,"INVALID_NODE","Invalid node");
  const version=p.get("version")??config.currentVersion;
  if(!/^[a-f0-9]{64}$/.test(version))return fail(400,"INVALID_GRAPH_VERSION","Invalid graph version");
  const depth=Number(p.get("depth")??NEIGHBOURHOOD_LIMITS.defaultDepth),limit=Number(p.get("limit")??NEIGHBOURHOOD_LIMITS.defaultLimit);
  if(!Number.isFinite(depth)||!Number.isFinite(limit))return fail(400,"INVALID_BOUNDS","Invalid depth or limit");
  try{
   const m=await model(version);
   const r=boundedNeighbourhood(m,seeds,depth,limit);
   if(!r.seeds.length)return fail(404,"NODE_NOT_FOUND","None of those concepts is in this graph version");
   return new Response(JSON.stringify(r),{status:200,headers:{...headers,"X-HSI-Graph-Version":version}});
  }catch{return fail(503,"GRAPH_SNAPSHOT_UNAVAILABLE","Published graph unavailable or unverifiable. No substitute neighbourhood was returned.")}
 };
}
