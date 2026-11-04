/** ARCH-003 trusted Bun API entrypoint (separate from static Vite hosting).
 * Deploy only behind a same-origin reverse proxy and secure HTTPS session cookies.
 * Never accept identity, session tokens or roles from request bodies.
 */
import {loadAuthenticatedInterrogativeInvestigation} from "../db/authenticatedInterrogativeStore";
import {submitInterrogativeForReview,recordAuthenticatedScientificReview} from "../db/authenticatedScientificReviewStore";
import type {HsiScientificReviewDecision} from "../interrogativeScientificReview";
import {loadResearchAccount} from "../db/researchAccountStore";
import type {ResearchAccountAccess} from "../researchAccount";

type ApiServices={
 account?:(input:{serverSessionToken:string|null})=>Promise<ResearchAccountAccess|null>;
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
export function createNeonInterrogativeApiServices(config:{databaseUrl:string;neonProjectId?:string|null}):ApiServices{
 return {
  account:args=>loadResearchAccount({...config,...args}),
  load:args=>loadAuthenticatedInterrogativeInvestigation({...config,...args}),
  submit:args=>submitInterrogativeForReview({...config,...args}),
  review:args=>recordAuthenticatedScientificReview({...config,...args})
 };
}
