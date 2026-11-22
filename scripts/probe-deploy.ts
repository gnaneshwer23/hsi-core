/** Read-only post-deploy probe. Usage: bun scripts/probe-deploy.ts <base-url>
 * Protected preview deployments: export VERCEL_AUTOMATION_BYPASS_SECRET (never pass it as an argument or commit it).
 * Sends only GET/POST requests that the handlers reject before any upstream call (bad input, wrong method,
 * missing session) or that return a public JSON honesty payload. No literature or model request is triggered; no data is written.
 */
export type Probe={name:string;method:"GET"|"POST";path:string;status:number[];bodyMustNotMatch?:RegExp;expectAppJson?:boolean};
const VERCEL_PLAIN_NOT_FOUND=/The page could not be found/;
export const probes:Probe[]=[
 {name:"pubmed bad query",method:"GET",path:"/api/scientific-pubmed?q=a",status:[400]},
 {name:"pubmed wrong method",method:"POST",path:"/api/scientific-pubmed",status:[405]},
 {name:"abstract bad pmid",method:"GET",path:"/api/scientific-abstract?pmid=abc",status:[400]},
 {name:"abstract wrong method",method:"POST",path:"/api/scientific-abstract",status:[405]},
 {name:"trace bad question",method:"GET",path:"/api/scientific-investigation-trace?q=a",status:[400]},
 {name:"trace wrong method",method:"POST",path:"/api/scientific-investigation-trace",status:[405]},
 {name:"research liveness",method:"GET",path:"/api/research/live",status:[200]},
 {name:"research health has no endpoint ids",method:"GET",path:"/api/research/health",status:[200,503],bodyMustNotMatch:/ep-[a-z0-9-]{6,}/i},
 {name:"research session required",method:"GET",path:"/api/research/investigations",status:[401]},
 {name:"workspace example is app json",method:"GET",path:"/api/research/workspace/example",status:[200],expectAppJson:true},
 {name:"community example is app json",method:"GET",path:"/api/research/community/example",status:[200],expectAppJson:true},
 {name:"graph-workspace status is app json",method:"GET",path:"/api/research/graph-workspace/status",status:[200],expectAppJson:true},
 {name:"onboarding-profile status is app json",method:"GET",path:"/api/research/onboarding-profile/status",status:[200],expectAppJson:true},
];
export const NESTED_RESEARCH_PROBE_PATHS=[
 "/api/research/workspace/example",
 "/api/research/community/example",
 "/api/research/graph-workspace/status",
 "/api/research/onboarding-profile/status",
] as const;

export function probeFailureReason(probe:Probe,status:number,body:string,contentType:string|null):string|null{
 if(!probe.status.includes(status))return "status "+status;
 if(probe.bodyMustNotMatch?.test(body))return "body matched a forbidden pattern";
 if(VERCEL_PLAIN_NOT_FOUND.test(body))return "Vercel plain-text NOT_FOUND";
 if(/FUNCTION_INVOCATION_FAILED/.test(body))return "FUNCTION_INVOCATION_FAILED";
 if(probe.expectAppJson){
  const type=(contentType??"").toLowerCase();
  if(!type.includes("application/json"))return "content-type "+(contentType??"missing");
  try{JSON.parse(body)}catch{return "body is not JSON"}
 }
 return null;
}

async function main(){
 const base=process.argv[2]?.replace(/\/$/,"");
 if(!base||!/^https:\/\//.test(base)){console.error("Usage: bun scripts/probe-deploy.ts https://<deployment>");process.exit(2)}
 const bypass=process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
 const headers:Record<string,string>=bypass?{"x-vercel-protection-bypass":bypass}:{};
 let failed=0;
 for(const p of probes){
  try{
   const response=await fetch(base+p.path,{method:p.method,headers,signal:AbortSignal.timeout(20000),redirect:"manual"});
   const body=await response.text();
   if(response.status>=300&&response.status<400&&/vercel\.com\/(sso|login)/.test(response.headers.get("location")??"")){failed++;console.log("FAIL "+p.name+" -> deployment protection redirect; set VERCEL_AUTOMATION_BYPASS_SECRET");continue}
   const reason=probeFailureReason(p,response.status,body,response.headers.get("content-type"));
   if(reason)failed++;
   console.log((reason?"FAIL ":"PASS ")+p.name+" -> "+response.status+(reason?" "+reason:""));
  }catch(error){failed++;console.log("FAIL "+p.name+" -> "+(error instanceof Error?error.message:"request failed"))}
 }
 process.exit(failed?1:0);
}

if(import.meta.main)void main();
