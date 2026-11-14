import {test,expect} from "@playwright/test";
import {readFile} from "node:fs/promises";
const routes=["/","/platform","/technology","/connected-intelligence","/departments","/solutions","/research","/evidence-safety","/community","/pricing","/contact","/how-it-works","/science"];
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
test("home opens the existing versioned graph and preserves selected context",async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toContainText('Biological research,');
 await expect(page.locator('#home-knowledge-graph')).toContainText('Public research snapshot');
 await page.locator('#home-knowledge-graph [data-graph-edge]').first().press('Enter');
 await expect(page.locator('.hd-inspector')).toContainText('Unreviewed source candidate');
 await page.locator('.hd-inspector').getByText('Source passages and permissions',{exact:true}).click();
 await expect(page.locator('.hd-inspector a').first()).toHaveAttribute('href',/^https:/);
 await page.getByRole('link',{name:'Open this selection in the research workspace ↗',exact:true}).click();
 await expect(page).toHaveURL(/domainVersion=[a-f0-9]{64}/);await expect(page.getByRole('heading',{level:1})).toContainText('Investigate a biological connection');
});
test("mobile menu opens, closes with Escape and connects public destinations",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/");const menu=page.getByRole("button",{name:"Open menu",exact:true});await menu.click();await expect(menu).toHaveAttribute("aria-expanded","true");
 await page.keyboard.press("Escape");await expect(menu).toHaveAttribute("aria-expanded","false");await expect(menu).toBeFocused();
 await menu.click();await page.locator("#public-menu").getByRole("link",{name:"Evidence intelligence",exact:true}).click();await expect(page).toHaveURL(/evidence-intelligence$/);
 await expect(page.getByRole("heading",{level:1})).toContainText("A connection is a starting point");
});
test("evidence overview explains source context without presenting unreviewed records as results",async({page})=>{
 await page.goto("/evidence-safety");await expect(page.getByRole("main")).toContainText("Sources and candidate claims require appropriate reuse rights");
 await page.getByRole("group",{name:"Understand evidence states"}).getByRole("button",{name:"Supported",exact:true}).click();await expect(page.locator(".xp-evidence-legend")).toContainText("Not calibrated");
 await page.getByRole("link",{name:"Follow the research workflow",exact:true}).click();await expect(page).toHaveURL(/how-it-works$/);
});
test("public access paths lead to the real account process without a pretend submission",async({page})=>{
 const posts:string[]=[];page.on("request",r=>{if(r.method()==="POST")posts.push(r.url())});await page.goto("/pricing");await page.getByRole("main").getByRole("link",{name:"Research access",exact:true}).first().click();await expect(page).toHaveURL(/contact$/);
 await expect(page.getByRole("main")).toContainText("permissions are provisioned independently");
 await expect(page.getByRole("main")).toContainText("does not write an access request");
 await expect(page.getByRole("heading",{name:/Keep a browser draft of your question/i})).toBeVisible();
 await page.getByLabel(/Research question or investigation focus/i).fill("How might cytokine signalling vary across tissues in research models?");
 await page.getByRole("button",{name:/Save browser draft/i}).click();
 await expect(page.getByRole("status")).toContainText("Saved in this browser only");
 expect(posts).toEqual([]);
 await page.getByRole("link",{name:"Create an account",exact:true}).first().click();await expect(page).toHaveURL(/sign-up/);expect(posts).toEqual([]);
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
 await page.goto("/science/graph?node=pancreas");const frame=page.locator(".xp-graph-frame").first();const zoomPct=frame.getByTestId("graph-zoom-pct");await expect(zoomPct).toBeVisible();const before=Number((await zoomPct.textContent())?.replace("%","")??"100");await frame.getByRole("button",{name:"Zoom in graph",exact:true}).click();await expect.poll(async()=>Number((await zoomPct.textContent())?.replace("%","")??"0")).toBeGreaterThan(before);
 await frame.getByRole("button",{name:"Pan graph right",exact:true}).click();await page.getByLabel("Depth",{exact:true}).selectOption("2");await expect(page).toHaveURL(/depth=2/);await page.reload();await expect(page.getByLabel("Depth",{exact:true})).toHaveValue("2");
 for(const format of ["SVG","PNG","JSON"]){const event=page.waitForEvent("download");await frame.getByRole("button",{name:"Download graph "+format,exact:true}).click();const d=await event;expect(d.suggestedFilename()).toContain("."+format.toLowerCase());if(format==="JSON"){const p=JSON.parse(await readFile((await d.path())!,"utf8"));expect(p.scientificApproval).toBe(false);expect(p.scope).toBe("public_educational_draft")}}
});
test("reduced-motion mode retains functional graph and verifier navigation",async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.getByRole('button',{name:'Inspect this evidence',exact:true}).click();await expect(page.locator('.hd-inspector')).toContainText('Unreviewed source candidate');
 await page.getByRole('link',{name:'Open this selection in the research workspace ↗',exact:true}).click();await expect(page).toHaveURL(/domainVersion=[a-f0-9]{64}/);
 await expect(page.getByRole('heading',{level:1})).toHaveText('Investigate a biological connection.');
});

test("internal validation opens the actual trial view and PDF printing keeps labels and inert text",async({page})=>{
 await page.addInitScript(()=>{window.print=()=>{(window as unknown as {printCalled:boolean}).printCalled=true}});
 await page.goto("/research/validation?patient=SYN-P-000001&view=trials");await expect(page).toHaveURL(/view=trials/);
 await expect(page.getByRole("button",{name:"Trials",exact:true})).toHaveAttribute("aria-pressed","true");await expect(page.getByRole("main")).toContainText("15 synthetic trial records");
 await page.getByRole("button",{name:"Review & brief",exact:true}).click();await page.getByRole("button",{name:"Print / Save PDF",exact:true}).click();
 expect(await page.evaluate(()=>(window as unknown as {printCalled:boolean}).printCalled)).toBe(true);
 await expect(page.locator("#hsi-print-document")).toContainText("Synthetic software-validation output only");await expect(page.locator("#hsi-print-document")).toContainText("No scientific conclusion");
 await page.evaluate(()=>window.dispatchEvent(new Event("afterprint")));await expect(page.locator("#hsi-print-document")).toHaveCount(0);
});

test("investigation opens on the question carried in the URL and ignores unknown ids",async({page})=>{
 await page.goto("/research/investigate?question=metabolic");
 await expect(page.getByRole("button",{name:/metabolic inflammation relate to insulin resistance/i})).toHaveAttribute("aria-pressed","true");
 await page.goto("/research/investigate?question=not-a-question");
 await expect(page.getByRole("button",{name:/gut microbial metabolites influence neuroinflammation/i})).toHaveAttribute("aria-pressed","true");
});

test("access draft restores, downloads and clears without submission",async({page})=>{
 const posts:string[]=[];page.on('request',r=>{if(r.method()==='POST')posts.push(r.url())});
 await page.goto('/contact');await page.getByRole('button',{name:'Save browser draft',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('at least 12 characters');
 const question='How does cytokine signalling differ across experimental tissue compartments?';
 await page.getByLabel('Research question or investigation focus',{exact:true}).fill(question);
 await page.getByRole('button',{name:'Save browser draft',exact:true}).click();await page.reload();
 await expect(page.getByLabel('Research question or investigation focus',{exact:true})).toHaveValue(question);
 await page.getByLabel('Research question or investigation focus',{exact:true}).fill(question+' Compare assays.');
 await expect(page.getByRole('main')).toContainText('latest edits have not been saved');
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download text draft',exact:true}).click();
 const file=await event;const text=await readFile((await file.path())!,'utf8');expect(text).toContain(question+' Compare assays.');expect(text).toContain('Not submitted to HSI');
 await page.getByRole('button',{name:'Clear draft',exact:true}).click();await page.reload();
 await expect(page.getByLabel('Research question or investigation focus',{exact:true})).toHaveValue('');
 expect(posts).toEqual([]);
});
test("blocked browser storage never reports a successful save",async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError')}});
 await page.goto('/contact');await page.getByLabel('Research question or investigation focus',{exact:true}).fill('Compare immune cell states across tissue compartments.');
 await page.getByRole('button',{name:'Save browser draft',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('could not save your draft');
 await expect(page.getByLabel('Research question or investigation focus',{exact:true})).toHaveValue('Compare immune cell states across tissue compartments.');
 await expect(page.getByRole('status')).not.toContainText('Saved in this browser only');
});
