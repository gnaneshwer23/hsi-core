/**
 * POST /api/access-requests — public research access enquiry.
 * Delivers to the owner only when notification env is configured. Never claims delivery on failure.
 * GET  /api/access-requests — {deliveryConfigured:boolean} so the UI stays honest.
 */
import type {FetchLike} from "../fetchLike";

type Env=Readonly<Record<string,string|undefined>>;
const hits=new Map<string,number[]>();
export const resetAccessRequestLimiter=()=>hits.clear();
const json=(b:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(b),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});

export function accessRequestDeliveryConfigured(env:Env):boolean{
 const webhook=env.HSI_ACCESS_REQUEST_WEBHOOK_URL?.trim();
 const to=env.HSI_ACCESS_REQUEST_TO?.trim();
 const resend=env.RESEND_API_KEY?.trim()||env.HSI_ACCESS_REQUEST_RESEND_API_KEY?.trim();
 return Boolean((webhook&&/^https:\/\//.test(webhook))||(to&&resend&&to.includes("@")));
}

function validEmail(v:string):boolean{
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<=254&&!/[\r\n]/.test(v);
}

export async function handleAccessRequest(request:Request,env:Env,deps:{fetcher?:FetchLike;now?:()=>number}={}):Promise<Response>{
 if(request.method==="GET"){
  return json({
   schemaVersion:"hsi-access-request-status-1",
   deliveryConfigured:accessRequestDeliveryConfigured(env),
   note:accessRequestDeliveryConfigured(env)
    ?"Access requests can be delivered to the configured owner channel."
    :"Delivery is not configured on this deployment. Use a browser draft only; nothing is sent.",
  });
 }
 if(request.method!=="POST")return json({error:"Method not allowed"},405,{Allow:"GET, POST"});
 const origin=request.headers.get("origin"),pub=env.HSI_PUBLIC_ORIGIN;
 if(pub&&origin&&origin!==pub)return json({code:"ORIGIN_NOT_ALLOWED",error:"Origin not allowed"},403);
 if(!/^application\/json/i.test(request.headers.get("content-type")??""))return json({error:"JSON body required"},415);
 if(!accessRequestDeliveryConfigured(env)){
  return json({code:"ACCESS_REQUEST_NOT_CONFIGURED",error:"Access-request delivery is not configured on this deployment. Nothing was sent. Save a browser draft instead."},503);
 }
 const raw=await request.text();
 if(raw.length>4000)return json({error:"Request too large"},413);
 let body:any;try{body=JSON.parse(raw)}catch{return json({error:"Invalid JSON"},400)}
 // Honeypot: bots fill hidden fields; humans leave company_website empty.
 if(typeof body?.company_website==="string"&&body.company_website.trim()){
  return json({ok:true,delivered:false,note:"Accepted."},202);
 }
 const question=typeof body?.question==="string"?body.question.trim():"";
 if(question.length<12||question.length>1000)return json({code:"INVALID_QUESTION",error:"Describe your research question in 12 to 1000 characters."},400);
 if(/\b(nhs\s*number|patient\s+id|date of birth|dob)\b/i.test(question)){
  return json({code:"PHI_REFUSED",error:"Do not include patient identifiers or clinical records. Rephrase as a research question only."},400);
 }
 const email=typeof body?.email==="string"?body.email.trim():"";
 if(email&&!validEmail(email))return json({code:"INVALID_EMAIL",error:"Email looks invalid."},400);
 const domain=typeof body?.domain==="string"?body.domain.trim().slice(0,80):"";
 const scenarioId=typeof body?.scenarioId==="string"?body.scenarioId.trim().slice(0,80):"";
 const now=deps.now??Date.now;
 const ip=(request.headers.get("x-forwarded-for")??"unknown").split(",")[0]!.trim().slice(0,64);
 const recent=(hits.get(ip)??[]).filter(t=>now()-t<3_600_000);
 if(recent.length>=5)return json({code:"RATE_LIMITED",error:"Hourly limit reached. Try again later."},429,{"Retry-After":"3600"});
 hits.set(ip,[...recent,now()]);if(hits.size>5000)hits.clear();

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
 }catch{
  return json({code:"DELIVERY_FAILED",error:"The access request could not be delivered. Nothing was claimed as sent. Try again later or save a browser draft."},502);
 }
 return json({ok:true,delivered:true,note:"Delivered to the HSI operator channel. This does not grant research access or enable writes."});
}

async function deliverAccessRequest(env:Env,payload:Record<string,unknown>,fetcher:FetchLike):Promise<void>{
 const webhook=env.HSI_ACCESS_REQUEST_WEBHOOK_URL?.trim();
 if(webhook&&/^https:\/\//.test(webhook)){
  const headers:Record<string,string>={"content-type":"application/json",accept:"application/json"};
  const token=env.HSI_ACCESS_REQUEST_WEBHOOK_TOKEN?.trim();
  if(token)headers.authorization="Bearer "+token;
  const response=await fetcher(webhook,{method:"POST",headers,body:JSON.stringify(payload),redirect:"error",signal:AbortSignal.timeout(10_000)});
  if(!response.ok)throw Error("Webhook delivery failed");
  return;
 }
 const to=env.HSI_ACCESS_REQUEST_TO?.trim();
 const key=(env.RESEND_API_KEY??env.HSI_ACCESS_REQUEST_RESEND_API_KEY)?.trim();
 if(!to||!key)throw Error("No delivery channel");
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
