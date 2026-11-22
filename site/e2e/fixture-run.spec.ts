import {test,expect,type Page,type Route} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {buildLiteratureBrief} from "../../src/literatureBrief";
import {hashHsiCheckpointInput} from "../../src/hsiAgentDurableCheckpoint";
import type {LiteratureCandidateSet} from "../../src/governedLiteratureRetrievalExecutor";

// HTTP fixtures exercise the page's contract. They do not certify the worker, the gateway, any provider or any deployment:
// the briefs below are built by the REAL builder from a recorded-style candidate set so the browser's verification is the real one.
const JOB="fl-0123456789abcdef",INV="inv-browser";
const set=(title="[FIXTURE] Synthetic literature record A"):LiteratureCandidateSet=>({
 schemaVersion:"hsi-literature-candidates-1",investigationId:INV,taskId:"retrieve",terms:["IL-21"],evidenceStatus:"candidate_only",
 candidates:[{canonicalId:"PMID:90000001",sourceUrl:"https://europepmc.org/article/MED/90000001",title,doi:"10.5555/fixture.a",pmid:"90000001",publicationYear:"2020",providers:["europe-pmc"],sourceIds:["europepmc:MED:90000001"],reviewStatus:"unreviewed"}],
 calls:[{provider:"europe-pmc",ok:true,code:null,replayed:false,auditSeq:1,requestHash:"a".repeat(64),responseHash:"b".repeat(64),records:1,flagged:0}],quarantined:0,limitations:[],
});
const brief=(title?:string)=>buildLiteratureBrief({dataMode:"fixture_recorded",set:set(title)});
const rehash=<T extends {contentHash:string}>(b:T):T=>{const {contentHash:_,...body}=b;return {...b,contentHash:hashHsiCheckpointInput(body)}};
const job=(over:Record<string,unknown>={})=>({jobId:JOB,status:"queued",attempts:0,cancelRequested:false,progress:null,errorCode:null,briefAvailable:false,dataMode:"fixture_recorded",...over});
const health=(status="ok",reasons:string[]=[])=>({status,reasons,at:"2026-11-22T12:00:00.000Z",dataMode:"fixture_recorded"});

async function mock(page:Page,o:{health?:{status:number;json?:unknown};post?:(route:Route)=>Promise<void>;jobs?:unknown[];brief?:{status:number;json?:unknown;headers?:Record<string,string>}}={}){
 const seen={briefRequests:0,posts:[] as unknown[]};let n=0;
 await page.route("**/api/research/nexus/health",r=>o.health?r.fulfill({status:o.health.status,json:o.health.json??{}}):r.fulfill({json:health()}));
 await page.route("**/api/research/nexus/jobs",async r=>{seen.posts.push(r.request().postDataJSON());if(o.post)await o.post(r);else await r.fulfill({status:202,json:{jobId:JOB,created:true,dataMode:"fixture_recorded"}})});
 await page.route(`**/api/research/nexus/jobs/${JOB}`,r=>{const seq=o.jobs??[job({status:"completed",briefAvailable:true})];const x=seq[Math.min(n++,seq.length-1)];return r.fulfill({json:x})});
 await page.route(`**/api/research/nexus/jobs/${JOB}/brief`,r=>{seen.briefRequests++;const b=o.brief??{status:200,json:brief()};return r.fulfill({status:b.status,json:b.json??{},headers:b.headers})});
 return seen;
}
const fill=async(page:Page,inv=INV,terms="IL-21\nfibrosis")=>{await page.getByLabel("Investigation id").fill(inv);await page.getByLabel(/Search terms/).fill(terms);await page.getByRole("button",{name:"Start recorded run"}).click()};

test("not available in this deployment: an honest message and no form, no fake results",async({page})=>{
 await mock(page,{health:{status:404}});
 await page.goto("/research/runs");
 await expect(page.getByRole("heading",{name:"Recorded fixture run"})).toBeVisible();
 await expect(page.getByText("Recorded runs are not available in this deployment.")).toBeVisible();
 await expect(page.getByRole("button",{name:"Start recorded run"})).toHaveCount(0);await expect(page.getByTestId("brief-view")).toHaveCount(0);
});
test("an HTML fallback page where the API should be is treated as unavailable, not as a result",async({page})=>{
 await page.route("**/api/research/nexus/health",r=>r.fulfill({status:200,contentType:"text/html",body:"<html>app shell</html>"}));
 await page.goto("/research/runs");await expect(page.getByText("Recorded runs are not available in this deployment.")).toBeVisible();
});
test("JSON that is not a health answer (another service, an error body) is treated as unavailable, never as a ready worker",async({page})=>{
 for(const json of [{},{status:"fine",reasons:[]},{status:"fine"},{status:"ok"},{status:"ok",reasons:"none"},[],null]){
  await page.route("**/api/research/nexus/health",r=>r.fulfill({status:200,json}));await page.goto("/research/runs");
  await expect(page.getByText("Recorded runs are not available in this deployment.")).toBeVisible();await expect(page.getByLabel("Investigation id")).toHaveCount(0);
  await page.unrouteAll({behavior:"ignoreErrors"});
 }
});
test("signed out: asks for verified access and shows no form",async({page})=>{
 await mock(page,{health:{status:401}});await page.goto("/research/runs");
 await expect(page.getByText("Recorded runs need verified research access.")).toBeVisible();await expect(page.getByRole("link",{name:/Sign in or set up/})).toBeVisible();
 await expect(page.getByLabel("Investigation id")).toHaveCount(0);
});
test("start a run, watch it progress, and see a brief that this browser has verified, with the ladder and honesty labels",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 const seen=await mock(page,{jobs:[job(),job({status:"running",progress:{stage:"retrieve",step:1,of:3}}),job({status:"completed",briefAvailable:true})]});
 await page.goto("/research/runs");
 await expect(page.getByText(/Worker status: ok/)).toBeVisible();
 await fill(page);
 expect(seen.posts).toEqual([{investigationId:INV,terms:["IL-21","fibrosis"]}]); // exactly these two fields: identity and roles are the server's business
 await expect(page.getByTestId("run-status")).toHaveText("Queued, waiting for a worker");
 await expect(page.getByLabel("Run progress")).toBeVisible();await expect(page.getByText("Step 1 of 3: retrieve")).toBeVisible();
 const view=page.getByTestId("brief-view");await expect(view).toBeVisible({timeout:15000});
 await expect(page.getByTestId("run-status")).toHaveText("Completed");
 await expect(view.getByText("RECORDED FIXTURE DATA",{exact:false})).toBeVisible();
 for(const chip of ["Research preview","Search hits, not evidence","All sources unreviewed","No clinical use","Not eligible for publication or the graph"])await expect(view.getByText(chip,{exact:true})).toBeVisible();
 await expect(view.getByText(/Verified in your browser/)).toBeVisible();
 const ladder=view.getByRole("list",{name:"Evidence ladder"});
 await expect(ladder.getByRole("listitem")).toHaveCount(6);await expect(ladder.locator("[aria-current=step]")).toContainText("Retrieved");
 await expect(ladder.getByRole("listitem").nth(4)).toContainText("Needs a named human reviewer");await expect(ladder.getByRole("listitem").nth(5)).toContainText("cannot happen in this brief");
 await expect(view.getByText("[FIXTURE] Synthetic literature record A")).toBeVisible();await expect(view.getByText("State: retrieved · Review status: unreviewed",{exact:false})).toBeVisible();
 await expect(view.getByText("No claims. No extraction has run, so this brief lists sources only.")).toBeVisible();
 const link=view.getByRole("link",{name:/Open the source record/});await expect(link).toHaveAttribute("href","https://europepmc.org/article/MED/90000001");await expect(link).toHaveAttribute("rel","noopener noreferrer");
 expect(errors).toEqual([]);
});
test("download re-emits the verified brief, byte for byte what verification accepted",async({page})=>{
 await mock(page);await page.goto("/research/runs");await fill(page);
 await expect(page.getByTestId("brief-view")).toBeVisible({timeout:15000});
 const [dl]=await Promise.all([page.waitForEvent("download"),page.getByRole("button",{name:"Download verified brief (JSON)"}).click()]);
 expect(dl.suggestedFilename()).toMatch(/^inv-browser-literature-brief-[a-f0-9]{12}\.json$/);
 const text=await (await import("node:fs/promises")).readFile(await dl.path()!,"utf8");const got=JSON.parse(text);
 expect(got.contentHash).toBe(brief().contentHash);expect(got.dataMode).toBe("fixture_recorded");
});
test("a brief whose content was edited is refused by the browser and nothing from it is shown",async({page})=>{
 const bad=structuredClone(brief());bad.sources[0]!.title="EDITED TITLE SHOULD NEVER APPEAR";
 await mock(page,{brief:{status:200,json:bad}});await page.goto("/research/runs");await fill(page);
 await expect(page.getByText("This brief could not be verified in your browser, so it is not shown.")).toBeVisible({timeout:15000});
 await expect(page.getByTestId("brief-view")).toHaveCount(0);await expect(page.getByText("EDITED TITLE SHOULD NEVER APPEAR")).toHaveCount(0);
});
test("a brief that was promoted and re-hashed is still refused: the state rules, not just the hash, are checked here",async({page})=>{
 for(const edit of [(b:any)=>{b.sources[0].reviewStatus="approved"},(b:any)=>{b.graphPromotion="direct"},(b:any)=>{delete b.dataMode},(b:any)=>{b.claims=[{claimId:"c-001",sourceCanonicalId:"PMID:90000001",statement:"x",state:"approved",context:{species:null,tissue:null,cellType:null,method:null},contextNormalised:false,assessmentRef:null,independentlyVerified:false,promotable:false}]}]){
  const b:any=structuredClone(brief());edit(b);
  await mock(page,{brief:{status:200,json:rehash(b)}});await page.goto("/research/runs");await fill(page);
  await expect(page.getByText("could not be verified in your browser",{exact:false})).toBeVisible({timeout:15000});await expect(page.getByTestId("brief-view")).toHaveCount(0);
  await page.unrouteAll({behavior:"ignoreErrors"});
 }
});
test("a valid brief for a different investigation, or whose hash differs from the one the server announced, is refused",async({page})=>{
 const other=buildLiteratureBrief({dataMode:"fixture_recorded",set:{...set(),investigationId:"inv-someone-else"}});
 await mock(page,{brief:{status:200,json:other}});await page.goto("/research/runs");await fill(page);
 await expect(page.getByText("does not match the run you asked for",{exact:false})).toBeVisible({timeout:15000});await expect(page.getByTestId("brief-view")).toHaveCount(0);
 await page.unrouteAll({behavior:"ignoreErrors"});
 await mock(page,{brief:{status:200,json:brief(),headers:{"x-hsi-brief-sha256":"f".repeat(64)}}});await page.goto("/research/runs");await fill(page);
 await expect(page.getByText("does not match the run you asked for",{exact:false})).toBeVisible({timeout:15000});
});
test("hostile text in a brief is rendered as inert text: no markup, no script, no link beyond the validated source link",async({page})=>{
 const evil="<img src=x onerror=window.__pwn=1> <script>window.__pwn=2</script> [x](javascript:window.__pwn=3)";
 await mock(page,{brief:{status:200,json:brief(evil)}});await page.goto("/research/runs");await fill(page);
 const view=page.getByTestId("brief-view");await expect(view).toBeVisible({timeout:15000});
 await expect(view.getByText("<img src=x onerror=window.__pwn=1>",{exact:false})).toBeVisible();
 expect(await page.evaluate(()=>(window as unknown as {__pwn?:number}).__pwn)).toBeUndefined();
 await expect(view.locator("img,script")).toHaveCount(0);await expect(view.locator("a")).toHaveCount(1);
});
test("failure states: a failed run, a dead-lettered run, a cancelled run and a completed run without a brief never fetch or show a brief",async({page})=>{
 for(const [o,text] of [[{status:"failed",errorCode:"error",attempts:1},"The run failed (error)"],[{status:"dead_lettered",errorCode:"error",attempts:3},"will not run again"],[{status:"cancelled"},"This run was cancelled."],[{status:"completed",briefAvailable:false},"no brief is available"]] as const){
  const seen=await mock(page,{jobs:[job(o)]});await page.goto("/research/runs");await fill(page);
  await expect(page.getByText(text,{exact:false})).toBeVisible({timeout:15000});await expect(page.getByTestId("brief-view")).toHaveCount(0);expect(seen.briefRequests).toBe(0);
  await page.unrouteAll({behavior:"ignoreErrors"});
 }
});
test("server refusals are explained without leaking detail: not signed in, writes disabled, not your investigation, invalid input",async({page})=>{
 for(const [status,text] of [[401,"Sign in with verified research access"],[403,"Research writes may be disabled"],[404,"not found, or it is not yours"],[400,"The request was not valid"],[503,"not available right now"]] as const){
  await mock(page,{post:r=>r.fulfill({status,json:{code:"X",error:"internal detail should not be shown"}})});await page.goto("/research/runs");await fill(page);
  await expect(page.getByRole("alert")).toContainText(text);await expect(page.getByText("internal detail should not be shown")).toHaveCount(0);
  await page.unrouteAll({behavior:"ignoreErrors"});
 }
});
test("input validation: the button stays disabled until the investigation id and 1 to 8 short terms are valid, and nothing is sent",async({page})=>{
 const seen=await mock(page);await page.goto("/research/runs");
 const btn=page.getByRole("button",{name:"Start recorded run"});await expect(btn).toBeDisabled();
 await page.getByLabel("Investigation id").fill("bad id!");await page.getByLabel(/Search terms/).fill("x");await expect(btn).toBeDisabled();
 await page.getByLabel("Investigation id").fill(INV);await page.getByLabel(/Search terms/).fill("");await expect(btn).toBeDisabled();
 await page.getByLabel(/Search terms/).fill(Array(9).fill("x").join("\n"));await expect(btn).toBeDisabled();
 await page.getByLabel(/Search terms/).fill("x".repeat(161));await expect(btn).toBeDisabled();
 await page.getByLabel(/Search terms/).fill("ok");await expect(btn).toBeEnabled();
 expect(seen.posts).toEqual([]);
});
test("worker down is shown plainly before a run is started",async({page})=>{
 await mock(page,{health:{status:200,json:health("down",["no_live_worker"])}});await page.goto("/research/runs");
 await expect(page.getByText(/Worker status: down/)).toBeVisible();await expect(page.getByText("No worker is running, so a started run will wait in the queue.")).toBeVisible();
});
test("accessibility: no axe violations with the brief shown, and it fits a 320px phone without sideways scrolling",async({page})=>{
 await mock(page);await page.goto("/research/runs");await fill(page);await expect(page.getByTestId("brief-view")).toBeVisible({timeout:15000});
 const r=await new AxeBuilder({page}).analyze();
 // The three moderate landmark findings (nested <main> inside the site shell) are the shell's existing structure on every ResearchAppShell page, as in gap-register.spec.ts; everything else must be clean.
 const shellLandmarks=new Set(["landmark-main-is-top-level","landmark-no-duplicate-main","landmark-unique"]);
 expect(r.violations.filter(v=>!shellLandmarks.has(v.id)).map(v=>v.id+": "+v.nodes[0]?.html?.slice(0,120))).toEqual([]);
 expect(r.violations.filter(v=>["serious","critical"].includes(v.impact??""))).toEqual([]);
 await page.setViewportSize({width:320,height:700});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
});
