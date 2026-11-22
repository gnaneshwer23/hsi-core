/**
 * POST /api/access-requests — public research access enquiry.
 * Delivers to the owner only when notification env is configured. Never claims delivery on failure.
 * GET  /api/access-requests — {deliveryConfigured:boolean} so the UI stays honest.
 */
import {createHash} from "node:crypto";
import type {FetchLike} from "../fetchLike";
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {boundedRequestText,RequestBodyTooLarge,RequestBodyTimeout} from "./boundedRequestBody";

type Env=Readonly<Record<string,string|undefined>>;
const hits=new Map<string,number[]>();
const recentAccepted=new Map<string,number>();
export const resetAccessRequestLimiter=()=>{hits.clear();recentAccepted.clear();};
const BODY_LIMIT=4000;
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});

function validEmail(v:string):boolean{
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<=254&&!/[\r\n]/.test(v);
}

function validWebhook(url:string):boolean{
 try{
  const parsed=new URL(url);
  return parsed.protocol==="https:"&&Boolean(parsed.hostname)&&!parsed.username&&!parsed.password;
 }catch{return false}
}

function resendApiKey(env:Env):string{
 return env.RESEND_API_KEY?.trim()||env.HSI_ACCESS_REQUEST_RESEND_API_KEY?.trim()||"";
}

export function accessRequestDeliveryConfigured(env:Env):boolean{
 const webhook=env.HSI_ACCESS_REQUEST_WEBHOOK_URL?.trim()??"";
 const to=env.HSI_ACCESS_REQUEST_TO?.trim()??"";
 const resend=resendApiKey(env);
 return Boolean((webhook&&validWebhook(webhook))||(to&&resend&&validEmail(to)));
}

function rememberHit(ip:string,at:number):void{
 hits.set(ip,[...(hits.get(ip)??[]).filter(t=>at-t<3_600_000),at]);
 if(hits.size<=5000)return;
 const oldest=hits.keys().next().value;
 if(oldest!==undefined)hits.delete(oldest);
}

function requestFingerprint(parts:string[]):string{
 return createHash("sha256").update(parts.join("\u0000")).digest("hex");
}

function logDeliveryFailure(reason:string):void{
 // Redacted: no secrets, no question/email content — operator diagnostics only.
 console.error(JSON.stringify({event:"access_request_delivery_failed",reason:reason.slice(0,120)}));
}

export async function handleAccessRequest(request:Request,env:Env,deps:{fetcher?:FetchLike;now?:()=>number}={}):Promise<Response>{
 if(request.method==="GET"){
  const configured=accessRequestDeliveryConfigured(env);
  return json({
   schemaVersion:"hsi-access-request-status-1",
   deliveryConfigured:configured,
   note:configured
    ?"Access requests can be accepted by the configured notification provider. Operator receipt is not confirmed by this status."
    :"Delivery is not configured on this deployment. Use a browser draft only; nothing is sent.",
  });
 }
 if(request.method!=="POST")return json({code:"METHOD_NOT_ALLOWED",error:"Method not allowed"},405,{Allow:"GET, POST"});
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
 // Honeypot first: never reveal deliveryConfigured via 503 when the trap field is filled.
 if(typeof record.company_website==="string"&&record.company_website.trim()){
  return json({ok:true,providerAccepted:false,delivered:false,note:"Accepted.",honeypot:true},202);
 }
 if(!accessRequestDeliveryConfigured(env)){
  return json({code:"ACCESS_REQUEST_NOT_CONFIGURED",error:"Access-request delivery is not configured on this deployment. Nothing was sent. Save a browser draft instead."},503);
 }
 const question=typeof record.question==="string"?record.question.trim():"";
 if(question.length<12||question.length>1000)return json({code:"INVALID_QUESTION",error:"Describe your research question in 12 to 1000 characters."},400);
 const email=typeof record.email==="string"?record.email.trim():"";
 if(email&&!validEmail(email))return json({code:"INVALID_EMAIL",error:"Email looks invalid."},400);
 const domain=typeof record.domain==="string"?record.domain.trim().slice(0,80):"";
 const scenarioId=typeof record.scenarioId==="string"?record.scenarioId.trim().slice(0,80):"";
 const phi=rejectPhiPayload({textBlobs:[question,domain,scenarioId,email]});
 if(!phi.ok||/\b(nhs\s*number|patient\s+id|date of birth|\bdob\b)\b/i.test([question,domain,scenarioId].join(" "))){
  return json({code:"PHI_REFUSED",error:"Do not include patient identifiers or clinical records. Rephrase as a research question only."},400);
 }
 const now=deps.now??Date.now;
 // Prefer platform client IP when present; X-Forwarded-For alone is not a trusted abuse control.
 const ip=(request.headers.get("x-vercel-forwarded-for")??request.headers.get("x-real-ip")??request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now()-t<3_600_000);
 if(recent.length>=5)return json({code:"RATE_LIMITED",error:"Hourly limit reached. Try again later."},429,{"Retry-After":"3600"});
 const fingerprint=requestFingerprint([question.toLowerCase(),email.toLowerCase(),domain.toLowerCase(),scenarioId.toLowerCase()]);
 for(const [key,at] of recentAccepted){if(now()-at>=3_600_000)recentAccepted.delete(key)}
 if(recentAccepted.has(fingerprint)){
  return json({
   ok:true,
   providerAccepted:true,
   delivered:true,
   note:"This enquiry was already accepted by the notification provider within the last hour. Operator receipt is not reconfirmed. This does not grant research access or enable writes.",
  });
 }
 rememberHit(ip,now());

 const payload={
  schemaVersion:"hsi-access-request-1",
  receivedAt:new Date(now()).toISOString(),
  question,
  email:email||null,
  domain:domain||null,
  scenarioId:scenarioId||null,
  note:"Research access enquiry only. Does not grant permissions or enable writes.",
 };
 const fetcher=deps.fetcher??fetch;
 try{
  await deliverAccessRequest(env,payload,fetcher);
 }catch(error){
  const reason=error instanceof Error?error.message:"delivery_failed";
  logDeliveryFailure(reason.includes("Webhook")?"webhook_rejected_or_timeout":reason.includes("Resend")?"resend_rejected_or_timeout":"provider_unavailable");
  return json({code:"DELIVERY_FAILED",error:"The access request could not be accepted by the notification provider. Nothing was claimed as delivered. Try again later or save a browser draft."},502);
 }
 recentAccepted.set(fingerprint,now());
 if(recentAccepted.size>5000){
  const oldest=recentAccepted.keys().next().value;
  if(oldest!==undefined)recentAccepted.delete(oldest);
 }
 return json({
  ok:true,
  providerAccepted:true,
  delivered:true,
  note:"Accepted by the configured notification provider. Operator inbox receipt is not confirmed by this response. This does not grant research access or enable writes.",
 });
}

async function deliverAccessRequest(env:Env,payload:Record<string,unknown>,fetcher:FetchLike):Promise<void>{
 const webhook=env.HSI_ACCESS_REQUEST_WEBHOOK_URL?.trim()??"";
 if(webhook&&validWebhook(webhook)){
  const headers:Record<string,string>={"content-type":"application/json",accept:"application/json"};
  const token=env.HSI_ACCESS_REQUEST_WEBHOOK_TOKEN?.trim();
  if(token)headers.authorization="Bearer "+token;
  const response=await fetcher(webhook,{method:"POST",headers,body:JSON.stringify(payload),redirect:"error",signal:AbortSignal.timeout(10_000)});
  if(!response.ok)throw Error("Webhook delivery failed");
  return;
 }
 const to=env.HSI_ACCESS_REQUEST_TO?.trim()??"";
 const key=resendApiKey(env);
 if(!to||!key||!validEmail(to))throw Error("No delivery channel");
 const from=(env.HSI_ACCESS_REQUEST_FROM?.trim())||"HSI Access <onboarding@resend.dev>";
 const response=await fetcher("https://api.resend.com/emails",{
  method:"POST",
  headers:{"content-type":"application/json",authorization:"Bearer "+key},
  body:JSON.stringify({
   from,
   to:[to],
   subject:"HSI research access request",
   text:[
    "A research access enquiry was submitted on the public site.",
    "",
    "Question:",
    String(payload.question),
    "",
    "Email: "+(payload.email??"(not provided)"),
    "Domain: "+(payload.domain??"(none)"),
    "Scenario: "+(payload.scenarioId??"(none)"),
    "Received: "+String(payload.receivedAt),
    "",
    "This does not grant research access or enable writes.",
   ].join("\n"),
  }),
  redirect:"error",
  signal:AbortSignal.timeout(10_000),
 });
 if(!response.ok)throw Error("Resend delivery failed");
}
