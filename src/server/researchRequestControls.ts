/** Request-local correlation and process admission. No identity/IP/token/question logging. */
import {randomUUID} from "node:crypto";
export type ResearchRouteGroup="health"|"auth"|"diagnostics"|"research_read"|"research_write"|"other";
export type Admission={allowed:boolean;retryAfterSeconds:number};
export type ResearchOperationalEvent={schemaVersion:"hsi-research-http-event-1";requestId:string;routeGroup:ResearchRouteGroup;method:"GET"|"POST"|"other";status:number;durationMs:number;admission:"allowed"|"rate_limited"|"over_capacity"|"shared_limiter_required"|"shared_limiter_unavailable";limiterScope:"process_only"|"shared_and_process"};
export type SharedResearchAdmission=(group:ResearchRouteGroup,signal:AbortSignal)=>Promise<Admission>;
export function researchRouteGroup(request:Request):ResearchRouteGroup{
 const p=new URL(request.url).pathname;
 if(["/api/research/health","/api/research/live","/api/research/configuration","/api/research/ready"].includes(p))return "health";
 if(p==="/api/auth/diagnostics"||p==="/api/research/session-diagnostics")return "diagnostics";
 if(p.startsWith("/api/auth/"))return "auth";
 if(p.startsWith("/api/research/"))return request.method==="GET"?"research_read":"research_write";
 return "other";
}
/** Global per-process buckets and concurrency bounds, NOT a global serverless or per-user quota. */
export function createResearchProcessAdmission(options:{windowMs?:number;maxConcurrent?:number;budgets?:Partial<Record<ResearchRouteGroup,number>>;now?:()=>number}={}){
 const windowMs=options.windowMs??60000,maxConcurrent=options.maxConcurrent??8,now=options.now??Date.now;
 const budgets:Record<ResearchRouteGroup,number>={health:120,auth:120,diagnostics:30,research_read:360,research_write:60,other:60,...options.budgets};
 if(!Number.isSafeInteger(windowMs)||windowMs<1||!Number.isSafeInteger(maxConcurrent)||maxConcurrent<1||Object.values(budgets).some(n=>!Number.isSafeInteger(n)||n<1))throw Error("Invalid process request budget");
 let active=0;const buckets=new Map<ResearchRouteGroup,{started:number;used:number}>();
 return {enter(group:ResearchRouteGroup){
  const time=now();let b=buckets.get(group);if(!b||time<b.started||time-b.started>=windowMs){b={started:time,used:0};buckets.set(group,b)}
  if(b.used>=budgets[group])return {allowed:false,reason:"rate_limited" as const,retryAfterSeconds:Math.max(1,Math.ceil((windowMs-(time-b.started))/1000)),release:()=>{}};
  if(active>=maxConcurrent)return {allowed:false,reason:"over_capacity" as const,retryAfterSeconds:1,release:()=>{}};
  b.used++;active++;let released=false;return {allowed:true,reason:"allowed" as const,retryAfterSeconds:0,release:()=>{if(!released){active--;released=true}}};
 }};
}
export type ResearchProcessAdmission=ReturnType<typeof createResearchProcessAdmission>;
const defaultAdmission=createResearchProcessAdmission();
export type ResearchControls={processAdmission?:ResearchProcessAdmission;sharedAdmission?:SharedResearchAdmission;requireShared?:boolean;emit?:(event:ResearchOperationalEvent)=>void;now?:()=>number};
function failure(code:string,status:number,retry=0){return Response.json({code,error:status===429?"Request budget exceeded; retry later":"Research service temporarily unavailable"},{status,headers:{...(retry?{"Retry-After":String(retry)}:{}),"Cache-Control":"no-store"}})}
/** No forced timeout of a write: a timed-out acknowledgement must not imply a transaction was rolled back. */
export async function withResearchRequestControls(request:Request,handler:()=>Promise<Response>,controls:ResearchControls={}):Promise<Response>{
 const requestId=randomUUID(),routeGroup=researchRouteGroup(request),now=controls.now??performance.now.bind(performance),started=now();let reason:ResearchOperationalEvent["admission"]="allowed",scope:ResearchOperationalEvent["limiterScope"]="process_only",response:Response;
 const entry=(controls.processAdmission??defaultAdmission).enter(routeGroup);
 let headerBytes=0;const encoder=new TextEncoder();request.headers.forEach((value,key)=>{headerBytes+=encoder.encode(key+value).byteLength});
 try{
  if(!entry.allowed){reason=entry.reason;response=failure(reason==="rate_limited"?"RATE_LIMITED":"OVER_CAPACITY",reason==="rate_limited"?429:503,entry.retryAfterSeconds)}
  else if(request.url.length>8192)response=failure("REQUEST_URI_TOO_LONG",414);
  else if(headerBytes>24576)response=failure("REQUEST_HEADERS_TOO_LARGE",431);
  else if(controls.requireShared&&!controls.sharedAdmission){reason="shared_limiter_required";response=failure("SHARED_REQUEST_LIMITER_REQUIRED",503,30)}
  else{
   let permitted=true;
   if(controls.sharedAdmission){scope="shared_and_process";try{const abort=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
    let shared:Admission;
    try{const raw=await Promise.race([controls.sharedAdmission(routeGroup,abort.signal),new Promise<never>((_resolve,reject)=>{timer=setTimeout(()=>{abort.abort();reject(Error("Shared admission deadline"))},1000)})]);shared={allowed:raw?.allowed,retryAfterSeconds:raw?.retryAfterSeconds}}finally{clearTimeout(timer);abort.abort()}if(typeof shared?.allowed!=="boolean"||!Number.isSafeInteger(shared.retryAfterSeconds)||shared.retryAfterSeconds<0||shared.retryAfterSeconds>86400)throw Error();if(!shared.allowed){reason="rate_limited";response=failure("RATE_LIMITED",429,Math.max(1,shared.retryAfterSeconds));permitted=false}}catch{reason="shared_limiter_unavailable";response=failure("SHARED_REQUEST_LIMITER_UNAVAILABLE",503,30);permitted=false}}
   if(permitted){
    response=await handler();
   }
  }
 }catch{response=failure("RESEARCH_SERVICE_UNAVAILABLE",503)}finally{entry.release()}
 const headers=new Headers(response!.headers);headers.set("X-Request-ID",requestId);headers.set("Cache-Control","no-store");headers.set("X-Content-Type-Options","nosniff");headers.set("Referrer-Policy","no-referrer");
 const durationMs=Math.max(0,Math.round(now()-started));headers.set("Server-Timing",`hsi;dur=${durationMs}`);
 const event:ResearchOperationalEvent={schemaVersion:"hsi-research-http-event-1",requestId,routeGroup,method:request.method==="GET"?"GET":request.method==="POST"?"POST":"other",status:response!.status,durationMs,admission:reason,limiterScope:scope};
 try{controls.emit?.(event)}catch{/* Logging failure cannot change a committed decision or its response. */}
 return new Response(response!.body,{status:response!.status,statusText:response!.statusText,headers});
}
export function researchOperationalLogger(allRequests=false){return (event:ResearchOperationalEvent)=>{if(allRequests||event.status>=500||event.admission!=="allowed")console.info(JSON.stringify(event))}}
