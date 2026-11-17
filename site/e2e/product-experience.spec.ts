import {test,expect} from "@playwright/test";
import {readFile} from "node:fs/promises";
const routes=["/","/platform","/connected-intelligence","/departments","/research","/community","/contact","/how-it-works","/science"];
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
test("the knowledge graph page opens the existing versioned graph and preserves selected context",async({page})=>{
 await page.goto('/knowledge-graph');await expect(page.getByRole('heading',{level:1})).toContainText('Relationships between biological entities');
 await expect(page.locator('#home-knowledge-graph')).toContainText('Public research snapshot');
 await page.locator('#home-knowledge-graph').getByRole('button',{name:'Inspect this evidence',exact:true}).click();
 await expect(page.locator('.hd-inspector')).toContainText('Unreviewed source candidate');
 await page.locator('.hd-inspector').getByText('Source passages and permissions',{exact:true}).click();
 await expect(page.locator('.hd-inspector a').first()).toHaveAttribute('href',/^https:/);
 await page.getByRole('link',{name:'Open this selection in the research workspace ↗',exact:true}).click();
 await expect(page).toHaveURL(/domainVersion=[a-f0-9]{64}/);await expect(page.getByRole('heading',{level:1})).toContainText('Investigate a biological connection');
});
test("mobile menu opens, closes with Escape and connects public destinations",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/");const menu=page.getByRole("button",{name:"Open menu",exact:true});await menu.click();await expect(menu).toHaveAttribute("aria-expanded","true");
 await page.keyboard.press("Escape");await expect(menu).toHaveAttribute("aria-expanded","false");await expect(menu).toBeFocused();
 await menu.click();await page.locator("#public-menu").getByRole("link",{name:"How it works",exact:true}).click();await expect(page).toHaveURL(/how-it-works$/);
 await expect(page.getByRole("heading",{level:1})).toContainText("How HSI works");
});
test("public access paths lead to the real account process without a pretend submission",async({page})=>{
 const posts:string[]=[];page.on("request",r=>{if(r.method()==="POST")posts.push(r.url())});
 await page.route("**/api/access-requests",async r=>{
  if(r.request().method()==="GET")return r.fulfill({json:{deliveryConfigured:false,note:"stub"}});
  return r.fulfill({status:503,json:{code:"ACCESS_REQUEST_NOT_CONFIGURED",error:"not configured"}});
 });
 await page.goto("/pricing");await expect(page).toHaveURL(/contact$/);
 await expect(page.getByRole("main")).toContainText("permissions are provisioned independently");
 await expect(page.getByRole("main")).toContainText("never claims a request was sent unless the server confirms delivery");
 await expect(page.getByRole("heading",{name:/Keep a browser draft of your question/i})).toHaveCount(1);
 await page.getByLabel(/Research question or investigation focus/i).fill("How might cytokine signalling vary across tissues in research models?");
 await page.getByRole("button",{name:/Save browser draft/i}).first().click();
 await expect(page.getByRole("status")).toContainText("Saved in this browser only");
 expect(posts).toEqual([]);
 await page.getByRole("link",{name:"Create an account",exact:true}).first().click();await expect(page).toHaveURL(/sign-up/);expect(posts).toEqual([]);
});
test("configured access request delivery posts once and only claims success after the server confirms",async({page})=>{
 const posts:string[]=[];
 await page.route("**/api/access-requests",async r=>{
  if(r.request().method()==="GET")return r.fulfill({json:{deliveryConfigured:true}});
  posts.push(r.request().url());
  return r.fulfill({json:{ok:true,delivered:true,note:"Delivered to the HSI operator channel. This does not grant research access or enable writes."}});
 });
 await page.goto("/contact");
 await expect(page.getByRole("heading",{name:/Request research access/i})).toHaveCount(1);
 await page.getByLabel(/Research question or investigation focus/i).fill("How might cytokine signalling vary across tissues in research models?");
 await page.getByRole("button",{name:/Send access request/i}).click();
 await expect(page.getByRole("status")).toContainText("Delivered to the HSI operator channel");
 expect(posts).toHaveLength(1);
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
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/knowledge-graph');
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
