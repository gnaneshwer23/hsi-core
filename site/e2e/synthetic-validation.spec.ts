import {test,expect,type Page} from "@playwright/test";
import {readFile} from "node:fs/promises";
const scenario=(page:Page)=>page.getByRole("region",{name:"Connected validation scenario",exact:true});
test("connected profile preserves five-visit lab values and shows supplied flags with missing references",async({page},testInfo)=>{
 await page.goto("/research/validation");const s=scenario(page);await expect(s.getByRole("heading",{name:"Type 2 diabetes",exact:true})).toBeVisible();
 await expect(page.getByLabel("Condition",{exact:true}).locator("option")).toHaveCount(20);
 await expect(s.getByRole("img")).toHaveAccessibleName(/HbA1c trend in %; visit 1: 7.81/);
 await page.getByLabel("Visit context",{exact:true}).selectOption("5");await expect(s.getByRole("table")).toContainText("6.75");await expect(s.getByRole("table")).toContainText("Visit 5 lab report");
 await page.getByLabel("Lab marker",{exact:true}).selectOption("hs-CRP");await expect(s.getByRole("img")).toHaveAccessibleName(/hs-CRP trend in mg\/L/);
 await expect(s).toContainText("reference intervals not supplied");
 await page.screenshot({path:testInfo.outputPath("validation-lab.png"),fullPage:true});
});
test("all twenty conditions load their own profile and condition-scoped data",async({page})=>{
 await page.goto("/research/validation");await expect(scenario(page)).toBeVisible();const choices=await page.getByLabel("Condition",{exact:true}).locator("option").allTextContents();
 for(const label of choices){const condition=label.replace(/ \(10 profiles\)$/,"");await page.getByLabel("Condition",{exact:true}).selectOption({label});await expect(scenario(page).getByRole("heading",{level:2})).toHaveText(condition);await expect(page.getByLabel("Generated profile",{exact:true}).locator("option")).toHaveCount(10)}
});
test("immune, gut, therapy and record-map selection stay aligned to the selected visit",async({page})=>{
 await page.goto("/research/validation?patient=SYN-P-000001");const s=scenario(page);await expect(s).toBeVisible();
 await s.getByRole("button",{name:"Immune & gut",exact:true}).click();await expect(s).toContainText("989");await expect(s).toContainText("2.53");await expect(s).toContainText("Count units and Treg denominator are missing");
 await page.getByLabel("Visit context",{exact:true}).selectOption("2");await expect(s).toContainText("Immune profile · visit 2");
 await s.getByRole("button",{name:"Lifestyle & medications",exact:true}).click();await expect(s).toContainText("Self-reported and wearable sleep values are kept separate");
 await s.getByRole("button",{name:"Context map",exact:true}).click();await s.getByRole("button",{name:"microbiome",exact:true}).click();await expect(s.getByRole("article",{name:"Selected context node"})).toContainText("visit 2");await expect(s).toContainText("do not supply biological mechanism");
});
test("evidence pages and trial filters retain synthetic-only status and missing-criteria eligibility",async({page})=>{
 await page.goto("/research/validation");const s=scenario(page);await expect(s).toBeVisible();await s.getByRole("button",{name:"Evidence & hypotheses",exact:true}).click();await expect(s).toContainText("50 synthetic cards");
 await s.getByRole("button",{name:"Next evidence",exact:true}).click();await expect(s.getByRole("navigation",{name:"Evidence pages",exact:true})).toContainText("2 / 5");await expect(s).toContainText("AI draft · pending");
 await s.getByRole("button",{name:"Trials",exact:true}).click();await expect(s).toContainText("15 synthetic trial records");
 await s.getByLabel("Supplied trial status",{exact:true}).selectOption("recruiting");await expect(s).toContainText("5 synthetic trial records");await expect(s).toContainText("Missing criteria");await expect(s.getByRole("article")).toHaveCount(5);await expect(s.getByRole("button",{name:/enrol/i})).toHaveCount(0);
});
test("review rehearsal refuses author review and exports reproducible guarded data without research API writes",async({page})=>{
 const writes:string[]=[];page.on("request",r=>{if(r.method()!=="GET")writes.push(r.url())});
 await page.goto("/research/validation");const s=scenario(page);await expect(s).toBeVisible();await s.getByRole("button",{name:"Review & brief",exact:true}).click();
 await s.getByLabel("Simulated reviewer",{exact:true}).selectOption("demo-author");await s.getByLabel("Review rationale (test text only)",{exact:true}).fill("I checked the workflow and missing data for this UI test.");
 await s.getByRole("button",{name:"Record simulated review",exact:true}).click();await expect(s).toContainText("Select the separate simulated reviewer");
 await s.getByLabel("Simulated reviewer",{exact:true}).selectOption("demo-reviewer");await s.getByRole("button",{name:"Record simulated review",exact:true}).click();await expect(s).toContainText("All source hypotheses remain AI draft / pending");
 const event=page.waitForEvent("download");await s.getByRole("button",{name:"Download validation JSON",exact:true}).click();const download=await event,payload=JSON.parse(await readFile((await download.path())!,"utf8"));
 expect(payload.brief.scientific_claim_allowed).toBe(false);expect(payload.brief.actualResearchReview).toBe("not_performed");expect(payload.brief.hypotheses.every((h:{review_status:string})=>h.review_status==="pending")).toBe(true);expect(payload.brief.reviewRehearsal[0].reviewScope).toBe("ui_workflow_only");expect(payload.brief.trials.every((t:{enrolmentAllowed:boolean})=>!t.enrolmentAllowed)).toBe(true);expect(payload.brief.observations.lab_results).toHaveLength(65);expect(payload.provenance.profileSha256).toMatch(/^[a-f0-9]{64}$/);
 const mdEvent=page.waitForEvent("download");await s.getByRole("button",{name:"Download validation brief",exact:true}).click();const md=await mdEvent;expect(await readFile((await md.path())!,"utf8")).toContain(payload.provenance.profileSha256);
 expect(writes).toEqual([]);
 await page.getByLabel("Generated profile",{exact:true}).selectOption({index:1});await expect(scenario(page)).not.toContainText("I checked the workflow");
});
test("tampered profile fails closed; retry restores the original and idle timers do not erase it",async({page})=>{
 await page.clock.install();await page.route("**/validation/v0.1/SYN-P-000001.json",async route=>{const response=await route.fetch(),body=await response.json();body.patient.condition="Forged condition";await route.fulfill({json:body})});
 await page.goto("/research/validation");await expect(page.getByRole("alert")).toContainText("could not be verified");await expect(scenario(page)).toHaveCount(0);
 await page.unroute("**/validation/v0.1/SYN-P-000001.json");await page.getByRole("button",{name:"Reload verified data",exact:true}).click();await expect(scenario(page)).toContainText("Type 2 diabetes");
 await page.clock.fastForward(25000);await expect(page.getByRole("alert")).toHaveCount(0);await expect(scenario(page)).toBeVisible();
});
test("invalid profile IDs and altered catalogue never trigger arbitrary data loads",async({page})=>{
 await page.goto("/research/validation?patient=../../private");await expect(page.getByRole("alert")).toContainText("could not be verified");await expect(scenario(page)).toHaveCount(0);
 await page.route("**/validation/v0.1/catalogue.json",route=>route.fulfill({json:{data_class:"public_real",patients:[]}}));await page.goto("/research/validation");await expect(page.getByRole("alert")).toContainText("catalogue could not be verified");await expect(scenario(page)).toHaveCount(0);
});
test("validation navigation works from research and supports keyboard and 320px layouts",async({page})=>{
 await page.goto("/research/scientific-workbench");await page.getByRole("link",{name:"Open synthetic validation lab",exact:false}).click();await expect(page).toHaveURL(/\/research\/validation$/);const s=scenario(page);await expect(s).toBeVisible();
 await page.setViewportSize({width:320,height:760});const b=s.getByRole("button",{name:"Context map",exact:true});await b.focus();await page.keyboard.press("Enter");await expect(s.getByRole("heading",{name:"Navigate the connected record map"})).toBeVisible();
 for(const name of ["Labs & timeline","Immune & gut","Lifestyle & medications","Context map","Evidence & hypotheses","Trials","Review & brief"]){await s.getByRole("button",{name,exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
