/**
 * POST /api/csp-report. Receives browser Content-Security-Policy violation reports (report-uri). Logs a reduced, structured
 * record (directive, blocked origin, page path; never query strings, fragments or sample text) so a policy that is now
 * enforced can still be monitored for breakage and tightened on evidence. Stores nothing. Per-instance log cap prevents log flooding.
 */
const TYPES=/^application\/(csp-report|reports\+json|json)/i;
const MAX_BYTES=8192,LOG_CAP_PER_HOUR=200;
const window_={hour:-1,count:0};
export const resetCspReportLimiter=()=>{window_.hour=-1;window_.count=0};
const origin=(v:unknown)=>{if(typeof v!=="string"||!v)return"";if(/^(inline|eval|data|blob|about)$/.test(v))return v;try{return new URL(v).origin}catch{return"invalid"}};
const path=(v:unknown)=>{if(typeof v!=="string")return"";try{return new URL(v).pathname.slice(0,120)}catch{return""}};
const dir=(v:unknown)=>typeof v==="string"&&/^[a-z-]{3,40}$/.test(v)?v:"unknown";
export function reduceReport(body:any):{directive:string;blocked:string;page:string}|null{
 const r=body?.["csp-report"]??(Array.isArray(body)?body.find((x:any)=>x?.type==="csp-violation")?.body:body?.body);
 if(!r||typeof r!=="object")return null;
 return {directive:dir(r["effective-directive"]??r.effectiveDirective??r["violated-directive"]),blocked:origin(r["blocked-uri"]??r.blockedURL),page:path(r["document-uri"]??r.documentURL)};
}
export async function handleCspReport(request:Request,deps:{now?:()=>number;log?:(line:string)=>void}={}):Promise<Response>{
 if(request.method!=="POST")return new Response(null,{status:405,headers:{Allow:"POST"}});
 if(!TYPES.test(request.headers.get("content-type")??""))return new Response(null,{status:415});
 const raw=await request.text();
 if(raw.length>MAX_BYTES)return new Response(null,{status:413});
 let body:unknown;try{body=JSON.parse(raw)}catch{return new Response(null,{status:400})}
 const rec=reduceReport(body);
 if(!rec)return new Response(null,{status:400});
 const hour=Math.floor((deps.now??Date.now)()/3_600_000);
 if(window_.hour!==hour){window_.hour=hour;window_.count=0}
 if(window_.count<LOG_CAP_PER_HOUR){window_.count++;(deps.log??console.log)(JSON.stringify({event:"csp_violation",...rec}))}
 return new Response(null,{status:204});
}
