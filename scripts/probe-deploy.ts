/** Read-only post-deploy probe. Usage: bun scripts/probe-deploy.ts <base-url>
 * Sends only GET/POST requests that the handlers reject before any upstream call (bad input, wrong method,
 * missing session). No literature or model request is triggered; no data is written.
 */
type Probe={name:string;method:"GET"|"POST";path:string;status:number[];bodyMustNotMatch?:RegExp};
const probes:Probe[]=[
 {name:"pubmed bad query",method:"GET",path:"/api/scientific-pubmed?q=a",status:[400]},
 {name:"pubmed wrong method",method:"POST",path:"/api/scientific-pubmed",status:[405]},
 {name:"abstract bad pmid",method:"GET",path:"/api/scientific-abstract?pmid=abc",status:[400]},
 {name:"abstract wrong method",method:"POST",path:"/api/scientific-abstract",status:[405]},
 {name:"trace bad question",method:"GET",path:"/api/scientific-investigation-trace?q=a",status:[400]},
 {name:"trace wrong method",method:"POST",path:"/api/scientific-investigation-trace",status:[405]},
 {name:"research liveness",method:"GET",path:"/api/research/live",status:[200]},
 {name:"research health has no endpoint ids",method:"GET",path:"/api/research/health",status:[200,503],bodyMustNotMatch:/ep-[a-z0-9-]{6,}/i},
 {name:"research session required",method:"GET",path:"/api/research/investigations",status:[401]},
];
const base=process.argv[2]?.replace(/\/$/,"");
if(!base||!/^https:\/\//.test(base)){console.error("Usage: bun scripts/probe-deploy.ts https://<deployment>");process.exit(2)}
let failed=0;
for(const p of probes){
 try{
  const response=await fetch(base+p.path,{method:p.method,signal:AbortSignal.timeout(20000),redirect:"manual"});
  const body=await response.text();
  const statusOk=p.status.includes(response.status);
  const bodyOk=!p.bodyMustNotMatch||!p.bodyMustNotMatch.test(body);
  const crashed=/FUNCTION_INVOCATION_FAILED/.test(body);
  const ok=statusOk&&bodyOk&&!crashed;
  if(!ok)failed++;
  console.log((ok?"PASS ":"FAIL ")+p.name+" -> "+response.status+(crashed?" FUNCTION_INVOCATION_FAILED":"")+(bodyOk?"":" (body leaks an endpoint id)"));
 }catch(error){failed++;console.log("FAIL "+p.name+" -> "+(error instanceof Error?error.message:"request failed"))}
}
process.exit(failed?1:0);

export {};
