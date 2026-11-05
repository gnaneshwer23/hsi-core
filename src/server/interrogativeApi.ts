/** ARCH-003 trusted Bun API entrypoint (separate from static Vite hosting).
 * Deploy only behind a same-origin reverse proxy and secure HTTPS session cookies.
 * Never accept identity, session tokens or roles from request bodies.
 */
import {loadAuthenticatedInterrogativeInvestigation} from "../db/authenticatedInterrogativeStore";
import {submitInterrogativeForReview,recordAuthenticatedScientificReview} from "../db/authenticatedScientificReviewStore";
import type {HsiScientificReviewDecision} from "../interrogativeScientificReview";
import {loadResearchAccount} from "../db/researchAccountStore";
import {loadScientificReviewHistory} from "../db/scientificReviewHistory";
import {loadSscResearchGraph} from "./sscGraphReadService";
import {investigateGovernedDiseaseGraph} from "../governedDiseaseDiscovery";
import type {HsiGraphPage} from "../hsiGovernedGraphQuery";
import type {ResearchAccountAccess} from "../researchAccount";
import {createNeonInvestigationWorkspace} from "../db/investigationWorkspaceStore";
import {InvestigationWorkspaceError} from "./investigationWorkspaceService";
import {parseCreateInvestigation,parseInvestigationCursor,type InvestigationCursor} from "../interrogativeWorkspace";
import {loadOrCaptureInvestigationGraphContext} from "../db/investigationGraphContextStore";

type ApiServices={
 graphContext?:(input:{serverSessionToken:string|null;investigationId:string;capture:boolean})=>Promise<unknown>;
 workspace?:(input:{serverSessionToken:string|null;cursor:InvestigationCursor|null})=>Promise<unknown>;
 create?:(input:{serverSessionToken:string|null;request:unknown})=>Promise<{id:string;created:boolean}>;
 account?:(input:{serverSessionToken:string|null})=>Promise<ResearchAccountAccess|null>;
 history?:(input:{serverSessionToken:string|null})=>Promise<unknown>;
 graph?:(input:{serverSessionToken:string|null;nodeId:string})=>Promise<unknown>;
 discovery?:(input:{serverSessionToken:string|null;nodeId:string})=>Promise<unknown>;
 load:(input:{serverSessionToken:string|null;investigationId:string})=>Promise<unknown>;
 submit:(input:{serverSessionToken:string|null;investigationId:string})=>Promise<unknown>;
 review:(input:{serverSessionToken:string|null;decision:HsiScientificReviewDecision})=>Promise<unknown>;
};
const ID=/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/;
function sessionFromCookie(req:Request):string|null{
 const cookies=req.headers.get("cookie")??"";
 const values=cookies.split(";").map(s=>s.trim());
 for(const name of ["__Secure-better-auth.session_token","better-auth.session_token"]){
  const pair=values.find(s=>s.startsWith(name+"="));
  if(pair){try{return decodeURIComponent(pair.slice(name.length+1))}catch{return null}}
 }
 return null;
}
function json(data:unknown,status=200):Response{
 return Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Vary":"Cookie"}});
}
export async function handleInterrogativeApi(req:Request,services:ApiServices):Promise<Response>{
 const url=new URL(req.url);
 const graphContext=/^\/api\/research\/interrogative\/(hsi-interrogative-[a-zA-Z0-9-]{8,100})\/graph-context$/.exec(url.pathname);
 if(graphContext){
  if(req.method!=="GET"&&req.method!=="POST")return json({error:"Method not allowed"},405);
  const serverSessionToken=sessionFromCookie(req);if(!serverSessionToken)return json({error:"Authentication required"},401);
  if(url.search)return json({error:"Context does not accept query parameters"},400);
  if(req.method==="POST"){
   if(req.headers.get("origin")!==url.origin)return json({error:"Origin verification failed"},403);
   if((req.headers.get("content-type")??"").split(";")[0]?.trim().toLowerCase()!=="application/json")return json({error:"JSON required"},415);
   try{
    const reader=req.body?.getReader();let raw="",size=0;const decoder=new TextDecoder();
    if(reader){try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>64){await reader.cancel();return json({error:"Payload too large"},413)}raw+=decoder.decode(value,{stream:true})}}finally{reader.releaseLock()}}
    const body=JSON.parse(raw+decoder.decode());if(!body||typeof body!=="object"||Array.isArray(body)||Object.keys(body).length)return json({error:"No client evidence, identity or release overrides accepted"},400);
   }catch{return json({error:"Empty JSON object required"},400)}
  }
  if(!services.graphContext)return json({error:"Evidence context unavailable"},503);
  try{return json(await services.graphContext({serverSessionToken,investigationId:graphContext[1]!,capture:req.method==="POST"}))}
  catch{return json({code:"EVIDENCE_CONTEXT_UNAVAILABLE",error:"Evidence context unavailable, changed or access denied"},403)}
 }
 if(url.pathname==="/api/research/investigations"){
  if(req.method!=="GET"&&req.method!=="POST")return json({error:"Method not allowed"},405);
  const serverSessionToken=sessionFromCookie(req);
  if(!serverSessionToken)return json({error:"Authentication required"},401);
  if(req.method==="GET"){
   if([...url.searchParams.keys()].some(k=>k!=="cursor")||url.searchParams.getAll("cursor").length>1)return json({error:"Invalid workspace query"},400);
   let cursor:InvestigationCursor|null;
   try{const raw=url.searchParams.get("cursor");if(raw&&raw.length>512)throw Error();cursor=parseInvestigationCursor(raw===null?null:JSON.parse(raw))}catch{return json({error:"Invalid investigation cursor"},400)}
   if(!services.workspace)return json({error:"Workspace unavailable"},503);
   try{return json(await services.workspace({serverSessionToken,cursor}))}
   catch(error){return workspaceError(error)}
  }
  if(req.headers.get("origin")!==url.origin)return json({error:"Origin verification failed"},403);
  if((req.headers.get("content-type")??"").split(";")[0]?.trim().toLowerCase()!=="application/json")return json({error:"JSON content type required"},415);
  if(url.search)return json({error:"Invalid workspace query"},400);
  // Bound the incoming stream before parsing; content-length alone is untrusted.
  let request:unknown;
  try{
   const reader=req.body?.getReader();let size=0;const chunks:Uint8Array[]=[];
   if(reader){try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return json({error:"Payload too large"},413)}chunks.push(value)}}finally{reader.releaseLock()}}
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
   request=parseCreateInvestigation(JSON.parse(new TextDecoder().decode(bytes)));
  }catch{return json({error:"Provide a research question, published release and request ID only"},400)}
  if(!services.create)return json({error:"Workspace unavailable"},503);
  try{const result=await services.create({serverSessionToken,request});return json(result,result.created?201:200)}
  catch(error){return workspaceError(error)}
 }
 if(url.pathname==="/api/research/graph/ssc"||url.pathname==="/api/research/discovery/ssc"){
  if(req.method!=="GET")return json({error:"Method not allowed"},405);
  const token=sessionFromCookie(req);
  if(!token)return json({error:"Authentication required"},401);
  const nodeId=url.searchParams.get("node")??"";
  if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(nodeId))return json({error:"Valid graph node required"},400);
  const discovery=url.pathname==="/api/research/discovery/ssc";
  const handler=discovery?services.discovery:services.graph;
  if(!handler)return json({error:"Research service unavailable"},503);
  try{return json(await handler({serverSessionToken:token,nodeId}))}
  catch{return json({error:"Graph unavailable or access denied"},403)}
 }

 if(url.pathname==="/api/research/scientific-review/history"){
  if(req.method!=="GET")return json({error:"Method not allowed"},405);
  const token=sessionFromCookie(req);
  if(!token)return json({error:"Authentication required"},401);
  if(!services.history)return json({error:"Review history unavailable"},503);
  try{return json(await services.history({serverSessionToken:token}))}
  catch{return json({error:"Review history unavailable or access denied"},403)}
 }
 if(url.pathname==="/api/research/account"){
  if(req.method!=="GET")return json({error:"Method not allowed"},405);
  const token=sessionFromCookie(req);
  if(!token)return json({error:"Verified backend session required"},401);
  if(!services.account)return json({error:"Account service unavailable"},503);
  try{
   const account=await services.account({serverSessionToken:token});
   return account?json(account):json({error:"Verified backend session required"},401);
  }catch{return json({error:"Account service unavailable"},503)}
 }
 const match=/^\/api\/research\/interrogative\/(hsi-interrogative-[a-zA-Z0-9-]{8,100})(?:\/(submit-review|decision))?$/.exec(url.pathname);
 if(!match||!ID.test(match[1]??""))return json({error:"Not found"},404);
 const token=sessionFromCookie(req);
 if(!token)return json({error:"Authentication required"},401);
 if(req.method!=="GET"&&req.method!=="POST")return json({error:"Method not allowed"},405);
 if((req.method==="GET"&&match[2])||(req.method==="POST"&&!match[2]))return json({error:"Method not allowed"},405);
 if(req.method==="POST"){
  // A same-origin request and JSON content type are required for cookie-authenticated writes.
  if(req.headers.get("origin")!==url.origin)return json({error:"Origin verification failed"},403);
  if(!(req.headers.get("content-type")??"").toLowerCase().startsWith("application/json"))return json({error:"JSON content type required"},415);
 }
 const id=match[1]!;
 try{
  if(req.method==="GET"&&!match[2])return json(await services.load({serverSessionToken:token,investigationId:id}));
  if(req.method==="POST"&&match[2]==="submit-review")return json(await services.submit({serverSessionToken:token,investigationId:id}));
  if(req.method==="POST"&&match[2]==="decision"){
   const raw=await req.text();
   if(raw.length>20000)return json({error:"Payload too large"},413);
   let decision:HsiScientificReviewDecision;
   try{decision=JSON.parse(raw) as HsiScientificReviewDecision}catch{return json({error:"Invalid JSON"},400)}
   if(!decision||decision.investigationId!==id)return json({error:"Investigation mismatch"},400);
   return json(await services.review({serverSessionToken:token,decision}));
  }
  return json({error:"Not found"},404);
 }catch{
  // Do not expose DB errors, tokens, reviewer identities or source data.
  return json({error:"Research record unavailable or operation denied"},403);
 }
}
function workspaceError(error:unknown):Response{
 if(error instanceof InvestigationWorkspaceError)return json({code:error.code,error:error.publicMessage},error.status);
 return json({error:"Research workspace unavailable or operation denied"},403);
}
export function createNeonInterrogativeApiServices(config:{databaseUrl:string;neonProjectId?:string|null;writesEnabled?:boolean;sscReleaseId?:string;raComparisonReleaseId?:string}):ApiServices{
 const workspace=createNeonInvestigationWorkspace(config);
 return {
  graphContext:args=>loadOrCaptureInvestigationGraphContext({...config,...args}),
  workspace:args=>workspace.list(args),
  create:args=>workspace.create(args),
  account:args=>loadResearchAccount({...config,...args}),
  history:args=>loadScientificReviewHistory({...config,...args}),
  graph:args=>loadSscResearchGraph({...config,...args}),
  discovery:async args=>investigateGovernedDiseaseGraph(await loadSscResearchGraph({...config,...args}) as HsiGraphPage,"systemic_sclerosis"),
  load:args=>loadAuthenticatedInterrogativeInvestigation({...config,...args}),
  submit:args=>submitInterrogativeForReview({...config,...args}),
  review:args=>recordAuthenticatedScientificReview({...config,...args})
 };
}
