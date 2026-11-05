import {test,expect} from "@playwright/test";
import {readFile} from "node:fs/promises";
const routes=["/","/platform","/technology","/products","/solutions","/research","/evidence-safety","/community","/pricing","/contact","/how-it-works","/science","/for-aksh","/for-isi","/for-trials"];
test("public pages have a single main/title, working navigation and no narrow-screen overflow",async({page},info)=>{
 test.setTimeout(90000);
 for(const route of routes){
  await page.setViewportSize({width:1440,height:900});await page.goto(route);await expect(page.getByRole("main")).toHaveCount(1);await expect(page.getByRole("heading",{level:1})).toHaveCount(1);
  await expect(page.getByRole("heading",{level:1})).toBeVisible();await expect(page.getByText("This page doesn’t exist",{exact:true})).toHaveCount(0);
  if(route==="/")await page.screenshot({path:info.outputPath("home-desktop.png"),fullPage:true});
  await page.setViewportSize({width:320,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route).toBe(true);
  if(route==="/")await page.screenshot({path:info.outputPath("home-mobile.png"),fullPage:true});
 }
});
test("home context map, journey and live fixture preview are accessible and truthful",async({page})=>{
 await page.goto("/");await expect(page.getByRole("heading",{level:1})).toContainText("Make sense of the connections.");
 const map=page.getByRole("group",{name:"Explore connected domains"});await map.getByRole("button",{name:"Microbiome",exact:true}).focus();await page.keyboard.press("Enter");await expect(page.locator(".xp-context-figure figcaption")).toContainText("causal link");
 const journey=page.getByRole("group",{name:"Explore the research journey"});await journey.getByRole("button",{name:/Review/}).click();await expect(page.locator(".xp-journey")).toContainText("An authorised independent reviewer");
 const panel=page.locator(".xp-product-preview");await panel.getByRole("button",{name:"Load verified example"}).click();await expect(panel).toContainText("SYN-P-000001");
 await expect(panel.getByRole("img")).toHaveAccessibleName(/HbA1c synthetic trend: 7.81/);
 await panel.getByLabel("Lab marker",{exact:true}).selectOption("hs-CRP");await expect(panel.getByRole("img")).toHaveAccessibleName(/8.15 mg\/L/);await expect(panel).toContainText("Reference intervals are not supplied");
 await panel.getByRole("link",{name:"Open this profile and its provenance"}).click();await expect(page).toHaveURL(/research\/validation\?patient=SYN-P-000001/);
});
test("mobile menu opens, closes with Escape and connects public destinations",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/");const menu=page.locator(".nav-toggle");await menu.click();await expect(menu).toHaveAttribute("aria-expanded","true");
 await page.keyboard.press("Escape");await expect(menu).toHaveAttribute("aria-expanded","false");await expect(menu).toBeFocused();
 await menu.click();await page.locator("#primary-menu").getByRole("link",{name:"Evidence & safety",exact:true}).click();await expect(page).toHaveURL(/evidence-safety$/);
 await expect(page.getByRole("heading",{level:1})).toContainText("Trust starts with");
});
test("evidence overview uses the real working catalogue and keeps confidence separate",async({page})=>{
 await page.goto("/evidence-safety");const preview=page.getByRole("region",{name:"Verified working evidence preview"});await expect(preview).toContainText("Unreviewed candidates");
 await expect(preview).toContainText("Release-eligible claims");await expect(preview).toContainText("Source rights and scientific clearance remain pending");
 await page.getByRole("group",{name:"Understand evidence states"}).getByRole("button",{name:"Supported",exact:true}).click();await expect(page.locator(".xp-evidence-legend")).toContainText("Not calibrated");
 await preview.getByRole("link",{name:"Open sources, passages and candidate details"}).click();await expect(page).toHaveURL(/evidence-readiness$/);
});
test("access and contact flows create a local preparation file without pretending submission",async({page})=>{
 const posts:string[]=[];page.on("request",r=>{if(r.method()==="POST")posts.push(r.url())});await page.goto("/pricing");await page.getByRole("link",{name:"Prepare a pilot brief"}).click();await expect(page).toHaveURL(/contact\?interest=pilot/);
 await expect(page.getByLabel("Your interest",{exact:true})).toHaveValue("pilot");await page.getByLabel("The research workflow (no identifying data)",{exact:true}).fill("Review permitted RA mechanism sources with an independent scientist.");
 const event=page.waitForEvent("download");await page.getByRole("button",{name:"Download preparation brief"}).click();const d=await event,p=JSON.parse(await readFile((await d.path())!,"utf8"));expect(p.submitted).toBe(false);expect(p.permissionsGranted).toBe(false);expect(posts).toEqual([]);
 await expect(page.getByRole("status")).toContainText("It has not been sent");await page.getByRole("link",{name:"Create an account",exact:true}).click();await expect(page).toHaveURL(/sign-up$/);
});
test("community drafts allow source-linked replies, flags and export without fake publication",async({page})=>{
 const posts:string[]=[];page.on("request",r=>{if(r.method()==="POST")posts.push(r.url())});await page.goto("/community");await page.getByLabel("Research question or claim challenge",{exact:true}).fill("Which tissue and assay details should travel with the source?");await page.getByLabel("Optional source URL",{exact:true}).fill("https://pubmed.ncbi.nlm.nih.gov/18375541/");
 await page.getByRole("button",{name:"Add local comment",exact:true}).click();await expect(page.getByRole("main")).toContainText("Nothing has been published");await page.getByRole("button",{name:"Reply",exact:true}).click();await page.getByLabel("Reply to local-comment-1",{exact:true}).fill("Please preserve population and timepoint context as well.");await page.getByRole("button",{name:"Add local comment",exact:true}).click();
 await page.getByRole("button",{name:"Flag for review",exact:true}).first().click();await expect(page.getByRole("main")).toContainText("No moderator has been notified");
 const event=page.waitForEvent("download");await page.getByRole("button",{name:"Export discussion draft",exact:true}).click();const d=await event,p=JSON.parse(await readFile((await d.path())!,"utf8"));expect(p.comments).toHaveLength(2);expect(p.published).toBe(false);expect(p.scientificApproval).toBe(false);expect(posts).toEqual([]);
 await page.reload();await expect(page.getByRole("main")).toContainText("No local comments yet");
});
test("research dashboard shows backend-controlled empty and denied states without fake activity",async({page})=>{
 await page.route("**/api/research/investigations",r=>r.fulfill({json:{items:[],releases:[],nextCursor:null,writesEnabled:false,canCreate:false}}));await page.goto("/research/dashboard");await expect(page.getByRole("heading",{name:"Your saved investigations",exact:true})).toBeVisible();await expect(page.getByRole("button",{name:"Create and save investigation",exact:true})).toBeDisabled();await expect(page.getByRole("main")).toContainText("New investigations are not enabled");
 await page.unroute("**/api/research/investigations");await page.route("**/api/research/investigations",r=>r.fulfill({status:403,json:{error:"Denied"}}));await page.reload();await expect(page.getByRole("alert")).toContainText("Research access has not been confirmed");
});
test("governance does not invent account-wide metrics when access is denied",async({page})=>{
 await page.route("**/api/research/scientific-review/queue",r=>r.fulfill({status:403,json:{error:"Denied"}}));await page.goto("/research/governance");await expect(page.getByRole("heading",{level:1})).toHaveCount(1);await expect(page.getByRole("alert")).toContainText("reviewer authority");await expect(page.getByRole("main")).toContainText("No platform-wide approval statistics");
});
test("graph controls, bookmarks and SVG/PNG/JSON exports preserve draft scope",async({page})=>{
 await page.goto("/science/graph?node=pancreas");const frame=page.locator(".xp-graph-frame");await frame.getByRole("button",{name:"Zoom in graph",exact:true}).click();await expect(frame).toContainText("120%");
 await frame.getByRole("button",{name:"Pan graph right",exact:true}).click();await page.getByLabel("Depth",{exact:true}).selectOption("2");await expect(page).toHaveURL(/depth=2/);await page.reload();await expect(page.getByLabel("Depth",{exact:true})).toHaveValue("2");
 for(const format of ["SVG","PNG","JSON"]){const event=page.waitForEvent("download");await frame.getByRole("button",{name:"Download graph "+format,exact:true}).click();const d=await event;expect(d.suggestedFilename()).toContain("."+format.toLowerCase());if(format==="JSON"){const p=JSON.parse(await readFile((await d.path())!,"utf8"));expect(p.scientificApproval).toBe(false);expect(p.scope).toBe("public_educational_draft")}}
});
test("reduced-motion mode retains functional navigation without animated nuclei",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/");expect(await page.locator(".xp-map-nucleus").evaluate(el=>getComputedStyle(el).animationName)).toBe("none");await page.getByRole("group",{name:"Explore connected domains"}).getByRole("button",{name:"Trials",exact:true}).click();await expect(page.locator(".xp-context-figure figcaption")).toContainText("eligibility");
});


test("trial entry opens the actual trial view and PDF printing keeps labels and inert text",async({page})=>{
 await page.addInitScript(()=>{window.print=()=>{(window as unknown as {printCalled:boolean}).printCalled=true}});
 await page.goto("/for-trials");await page.getByRole("link",{name:"Open synthetic trial context",exact:true}).click();await expect(page).toHaveURL(/view=trials/);
 await expect(page.getByRole("button",{name:"Trials",exact:true})).toHaveAttribute("aria-pressed","true");await expect(page.getByRole("main")).toContainText("15 synthetic trial records");
 await page.getByRole("button",{name:"Review & brief",exact:true}).click();await page.getByRole("button",{name:"Print / Save PDF",exact:true}).click();
 expect(await page.evaluate(()=>(window as unknown as {printCalled:boolean}).printCalled)).toBe(true);
 await expect(page.locator("#hsi-print-document")).toContainText("Synthetic software-validation output only");await expect(page.locator("#hsi-print-document")).toContainText("No scientific conclusion");
 await page.evaluate(()=>window.dispatchEvent(new Event("afterprint")));await expect(page.locator("#hsi-print-document")).toHaveCount(0);
});
