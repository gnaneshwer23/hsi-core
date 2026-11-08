import {test,expect,type Page} from "@playwright/test";
import {readFile} from "node:fs/promises";
import {deliveryHarness} from "../../test/fixtures/deliveryHarness";
import {renderResearchOutcome} from "../../src/researchOutcome";
import {deliveryHash} from "../../src/server/investigationDeliveryService";
async function wire(page:Page,f:ReturnType<typeof deliveryHarness>,actor:string){
 await page.route("**/api/research/scientific-review/queue**",async route=>{
  if(!["alice","reviewer"].includes(actor))return route.fulfill({status:403,json:{error:"Denied"}});
  const all=[...f.states.values()],items=all.filter(s=>s.submission&&!s.decision&&s.record.actorPrincipal!==actor).map(s=>({id:s.record.id,submissionId:s.submission!.id,packageHash:s.package!.packageHash,contextHash:s.package!.context.contentHash,question:s.record.question,submittedAt:s.submission!.submittedAt}));
  const history=all.filter(s=>s.decision?.reviewerPrincipal===actor).map(s=>({id:s.record.id,decisionId:s.decision!.id,outcome:s.decision!.outcome,reviewedAt:s.decision!.reviewedAt,decisionHash:s.decision!.decisionHash,packageHash:s.decision!.packageHash}));
  return route.fulfill({json:{items,nextCursor:null,history}});
 });
 await page.route("**/api/research/interrogative/**",async route=>{
  const url=new URL(route.request().url()),match=/\/interrogative\/(hsi-interrogative-[a-zA-Z0-9-]+)(?:\/([^/]+))?$/.exec(url.pathname);if(!match)return route.fulfill({status:404});const id=match[1]!,action=match[2];
  try{
   if(!action){await f.service.view(actor,id);return route.fulfill({json:f.states.get(id)!.record})}
   if(action==="outcome"){
    const o=await f.service.outcome(actor,id),format=url.searchParams.get("format");
    if(!format)return route.fulfill({json:o});
    if(format!=="json"&&format!=="markdown")return route.fulfill({status:400});
    const text=renderResearchOutcome(o,format);return route.fulfill({body:text,headers:{"content-type":format==="json"?"application/json":"text/markdown","x-hsi-content-sha256":deliveryHash(text),"x-hsi-package-sha256":o.binding.packageHash,"x-hsi-outcome-sha256":o.outcomeHash}});
   }
   if(action==="review-package")return route.fulfill({json:await f.service.view(actor,id)});
   if(action==="graph-context"){const v=await f.service.view(actor,id);if(route.request().method()==="POST")f.capture(id);const c=f.contexts.get(id);return route.fulfill({json:c?{status:"saved",canCapture:false,context:c}:{status:"not_captured",canCapture:v.capabilities.writesEnabled&&actor==="alice",context:null}})}
   if(action==="submit-review")return route.fulfill({json:await f.service.submit(actor,id)});
   if(action==="decision"){const body=route.request().postDataJSON();expect(body).not.toHaveProperty("reviewerPrincipal");expect(body).not.toHaveProperty("reviewedAt");return route.fulfill({json:await f.service.decide(actor,id,body)})}
   if(action==="revision")return route.fulfill({status:201,json:await f.service.revise(actor,id,route.request().postDataJSON())});
   if(action==="brief"){const format=url.searchParams.get("format")==="markdown"?"markdown":"json",b=await f.service.brief(actor,id,format);return route.fulfill({body:b.content,headers:{"content-type":b.mime,"x-hsi-content-sha256":b.hash,"x-hsi-package-sha256":b.packageHash}})}
   return route.fulfill({status:404});
  }catch{return route.fulfill({status:403,json:{error:"Access denied or package changed"}})}
 });
}
test("two identities complete submit, revision request, linked revision and resubmission",async({browser})=>{
 const f=deliveryHarness(),author=await browser.newPage(),reviewer=await browser.newPage();await wire(author,f,"alice");await wire(reviewer,f,"reviewer");
 await author.goto("/research/decision-workbench?investigation="+f.initial.id);
 await author.getByRole("button",{name:"Submit evidence brief for independent review"}).click();
 await expect(author.locator(".investigation-delivery")).toContainText("awaiting review");
 await reviewer.goto("/research/scientific-review");await reviewer.getByRole("link",{name:f.initial.question,exact:true}).click();
 await reviewer.getByLabel("Scientific rationale",{exact:true}).fill("Please clarify the question while preserving source model context and all stated uncertainty.");
 await reviewer.getByLabel("I have disclosed conflicts of interest",{exact:false}).check();
 await reviewer.getByRole("button",{name:"Record independent brief decision"}).click();
 await expect(reviewer.getByRole("article",{name:"Recorded independent decision"})).toContainText("request revision");
 await author.getByRole("button",{name:"Refresh brief status"}).click();await expect(author.locator(".investigation-delivery")).toContainText("revision requested");
 await author.getByLabel("Revised research question",{exact:true}).fill("Which SSc mechanisms require further source-context review?");
 await author.getByLabel("Response to the reviewer",{exact:true}).fill("I clarified the question and retained the separation between human and animal source findings.");
 await author.getByRole("button",{name:"Create linked revision",exact:true}).click();
 const child=f.states.get(f.initial.id)!.successor!;await expect(author).toHaveURL(new RegExp(child.id));
 await author.getByRole("button",{name:"Capture release-bound evidence view"}).click();await author.getByRole("button",{name:"Refresh brief status"}).click();
 await author.getByRole("button",{name:"Submit evidence brief for independent review"}).click();
 await reviewer.goto("/research/scientific-review");await expect(reviewer.getByRole("link",{name:"Which SSc mechanisms require further source-context review?",exact:true})).toBeVisible();
 expect(f.states.get(f.initial.id)!.decision).not.toBeNull();expect(f.states.get(child.id)!.revision!.number).toBe(2);await author.close();await reviewer.close();
});
test("downloaded JSON and cited Markdown reproduce the bound package and source hashes",async({page})=>{
 const f=deliveryHarness();await wire(page,f,"alice");await page.goto("/research/decision-workbench?investigation="+f.initial.id);
 const jsonDownload=page.waitForEvent("download");await page.getByRole("button",{name:"Download evidence JSON",exact:true}).click();const j=await jsonDownload,text=await readFile((await j.path())!,"utf8"),brief=JSON.parse(text);
 expect(brief.package.context.contentHash).toBe(f.contexts.get(f.initial.id)!.contentHash);expect(brief.graphPublicationApproved).toBe(false);expect(j.suggestedFilename()).toContain(deliveryHash(text).slice(0,12));
 const mdDownload=page.waitForEvent("download");await page.getByRole("button",{name:"Download cited brief",exact:true}).click();const md=await mdDownload,markdown=await readFile((await md.path())!,"utf8");expect(markdown).toContain(brief.package.packageHash);expect(markdown).toContain("Passage SHA-256:");expect(markdown).toContain("Not independently reviewed");
});
test("author self-review is unavailable even with a reviewer role",async({page})=>{
 const f=deliveryHarness();await f.service.submit("alice",f.initial.id);await wire(page,f,"alice");await page.goto("/research/scientific-review?investigation="+f.initial.id);
 await expect(page.getByText("Authors cannot review their own investigations.",{exact:false})).toBeVisible();await expect(page.getByRole("button",{name:"Record independent brief decision"})).toHaveCount(0);
 await page.goto("/research/scientific-review");await expect(page.getByRole("region",{name:"Awaiting independent review"})).toContainText("No undecided investigations");
});
test("acceptance requires examined claims and limitations and stays brief-scoped",async({page})=>{
 const f=deliveryHarness();await f.service.submit("alice",f.initial.id);await wire(page,f,"reviewer");await page.goto("/research/scientific-review?investigation="+f.initial.id);
 await page.getByLabel("Review outcome",{exact:true}).selectOption("approve_with_limitations");await page.getByLabel("Scientific rationale",{exact:true}).fill("The source versions and limitations have been independently examined for this evidence brief.");await page.getByLabel("I have disclosed conflicts of interest",{exact:false}).check();
 await expect(page.getByRole("button",{name:"Record independent brief decision"})).toBeDisabled();await page.getByLabel("HSI-C-TEST-001",{exact:true}).check();await page.getByLabel("Limitations (up to eight lines, 250 characters each)",{exact:true}).fill(Array.from({length:9},()=>"A limitation").join("\n"));await expect(page.getByRole("alert")).toContainText("Use up to eight");await expect(page.getByRole("button",{name:"Record independent brief decision"})).toBeDisabled();await page.getByLabel("Limitations (up to eight lines, 250 characters each)",{exact:true}).fill("Source associations do not validate a causal mechanism.");
 await page.getByRole("button",{name:"Record independent brief decision"}).click();await expect(page.getByRole("article",{name:"Recorded independent decision"})).toContainText("approve with limitations");expect(f.states.get(f.initial.id)!.record.conclusion.assessment).toBe("insufficient_evidence");
});
test("tampered download is rejected and reviewer queue fits mobile width",async({page})=>{
 const f=deliveryHarness();await f.service.submit("alice",f.initial.id);await wire(page,f,"reviewer");await page.route("**/brief?format=json",route=>route.fulfill({body:"forged brief",headers:{"x-hsi-content-sha256":"f".repeat(64),"x-hsi-package-sha256":f.states.get(f.initial.id)!.package!.packageHash}}));
 await page.goto("/research/scientific-review?investigation="+f.initial.id);await page.getByRole("button",{name:"Download evidence JSON"}).click();await expect(page.getByText("Download could not be verified.",{exact:false})).toBeVisible();
 await page.setViewportSize({width:375,height:812});await page.goto("/research/scientific-review");await expect(page.getByRole("link",{name:f.initial.question,exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test("Phase E baseline shows exact, bound source excerpts without enabling AI or changing the investigation",async({page})=>{
 const f=deliveryHarness(),before=JSON.stringify(f.states.get(f.initial.id)),calls:string[]=[];
 page.on("request",r=>{if(/\/api\//.test(r.url()))calls.push(r.url())});await wire(page,f,"alice");await page.goto("/research/decision-workbench?investigation="+f.initial.id);
 await page.getByText("Inspect source-grounded baseline",{exact:true}).click();const panel=page.getByRole("region",{name:"Source-grounded baseline",exact:true});await expect(panel).toContainText("Matching source observations");await expect(panel.getByRole("blockquote")).toHaveText(f.contexts.get(f.initial.id)!.primary.bundle.passages[0]!.text);
 await panel.getByText("Inspect citation binding",{exact:true}).click();await expect(panel).toContainText(f.contexts.get(f.initial.id)!.primary.bundle.passages[0]!.sha256!);await expect(panel).toContainText("Model assistance remains disabled");expect(JSON.stringify(f.states.get(f.initial.id))).toBe(before);expect(calls.some(u=>/\/api\/(?:ai|model|assist)/.test(u))).toBe(false);
 await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test("Phase E assistance disappears if the package cannot be verified",async({page})=>{
 const f=deliveryHarness();await wire(page,f,"alice");await page.route("**/review-package",async route=>{const v=await f.service.view("alice",f.initial.id);v.package!.context.primary.bundle.passages[0]!.text="Forged source text";return route.fulfill({json:v})});
 await page.goto("/research/decision-workbench?investigation="+f.initial.id);await expect(page.getByText("The evidence brief could not be verified.",{exact:false})).toBeVisible();await expect(page.getByRole("region",{name:"Source-grounded baseline",exact:true})).toHaveCount(0);
});


test("unified outcome connects source passages, candidate questions, trial gaps and verified downloads",async({page})=>{
 const f=deliveryHarness();await wire(page,f,"alice");await page.goto("/research/decision-workbench?investigation="+f.initial.id);
 const panel=page.getByRole("region",{name:"Unified research outcome",exact:true});
 await expect(panel).toContainText("Not calibrated");
 await panel.getByRole("button",{name:"02 Evidence",exact:true}).click();
 await expect(panel.getByRole("blockquote").first()).toHaveText(f.contexts.get(f.initial.id)!.primary.bundle.passages[0]!.text);
 await expect(panel).toContainText("no branch assigned");await expect(panel.getByLabel("Select a relationship")).toHaveValue("rel-test");
 await expect(panel).toContainText("Reverse trace");
 await panel.getByRole("button",{name:"05 Action plan",exact:true}).click();
 await expect(panel).toContainText(f.initial.questions[0]!.text);await panel.getByText(f.initial.branches[0]!.statement,{exact:true}).click();
 await expect(panel).toContainText("not specified in the saved record");
 await panel.getByRole("button",{name:"04 Translational",exact:true}).click();await expect(panel).toContainText("No registry search is attached");
 await panel.getByRole("button",{name:"06 Package",exact:true}).click();await expect(panel).toContainText("This projection invokes no model");
 const event=page.waitForEvent("download");await panel.getByRole("button",{name:"Download outcome JSON",exact:true}).click();const download=await event,body=JSON.parse(await readFile((await download.path())!,"utf8"));
 expect(body.binding.contextHash).toBe(f.contexts.get(f.initial.id)!.contentHash);expect(body.trials.eligibilityAssessed).toBe(false);expect(body.answer.confidence.value).toBeNull();
 const mdEvent=page.waitForEvent("download");await panel.getByRole("button",{name:"Download research outcome",exact:true}).click();const md=await mdEvent;expect(await readFile((await md.path())!,"utf8")).toContain(body.outcomeHash);
});

test("outcome refuses a forged answer and hides stale content when source access is revoked",async({page})=>{
 const f=deliveryHarness();await wire(page,f,"alice");
 await page.route("**/outcome",async route=>{const o=await f.service.outcome("alice",f.initial.id);o.answer.summary="Invented scientific conclusion";return route.fulfill({json:o})});
 await page.goto("/research/decision-workbench?investigation="+f.initial.id);const panel=page.getByRole("region",{name:"Unified research outcome",exact:true});
 await expect(panel).toContainText("could not be verified");await expect(panel).not.toContainText("Invented scientific conclusion");await expect(panel.getByRole("button",{name:"Download research outcome",exact:true})).toHaveCount(0);
 await page.unroute("**/outcome");await panel.getByRole("button",{name:"Refresh outcome"}).click();await expect(panel).toContainText("Not calibrated");
 f.revokeSources();await panel.getByRole("button",{name:"Refresh outcome"}).click();await expect(panel).toContainText("could not be verified");await expect(panel).not.toContainText("Not calibrated");
});

test("outcome is keyboard navigable and fits a 320px viewport",async({page})=>{
 const f=deliveryHarness();await wire(page,f,"alice");await page.setViewportSize({width:320,height:740});await page.goto("/research/decision-workbench?investigation="+f.initial.id);
 const panel=page.getByRole("region",{name:"Unified research outcome",exact:true});await expect(panel).toContainText("Not calibrated");
 const button=panel.getByRole("button",{name:"02 Evidence",exact:true});await button.focus();await page.keyboard.press("Enter");await expect(panel.getByLabel("Select a relationship")).toBeVisible();
 for(const name of ["01 Landscape","02 Evidence","03 Gaps","04 Translational","05 Action plan","06 Package"]){await panel.getByRole("button",{name,exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)}
});
