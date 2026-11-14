import {test,expect} from "@playwright/test";
import {readFile} from "node:fs/promises";
const pages={"/":"Biological research,connected by evidence.","/platform":"The intelligence behind connected biomedical research.","/context-conflict-audit":"Different findings. Deeper understanding.","/evidence-intelligence":"Scientific evidence is more than a confidence score.","/research":"A connected workspace for scientific investigation.","/research-briefs":"Research decisions deserve an evidence trail.","/science":"Explore the biological context behind disease mechanisms.","/applications":"One research foundation. Three connected applications.","/trust":"No silent promotion.","/about":"Building a more connected understanding of human health."};
for(const [path,title] of Object.entries(pages))test(`approved public page, image and responsive layout ${path}`,async({page},info)=>{
 test.setTimeout(60000);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(path);await expect(page.getByRole("heading",{level:1})).toHaveText(title);await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${path} at ${width}`).toBe(true);
  await expect.poll(()=>page.locator("main img").evaluateAll(imgs=>imgs.filter(i=>!(i as HTMLImageElement).complete||(i as HTMLImageElement).naturalWidth===0).map(i=>(i as HTMLImageElement).src))).toEqual([]);
  if(width===390||width===1440)await page.screenshot({path:info.outputPath((path==="/"?"home":path.slice(1))+`-${width}.png`),fullPage:true});
 }
 expect(errors).toEqual([]);
});
test("audit context changes and all five fictional scenarios preserve the no-live boundary",async({page})=>{
 const posts:string[]=[];page.on("request",r=>{if(r.method()==="POST")posts.push(r.url())});await page.goto("/context-conflict-audit");
 await expect(page.locator(".hsi-audit-result h3")).toHaveText("Not directly comparable");await page.getByLabel("Study B species",{exact:true}).selectOption("Human");await expect(page.locator(".hsi-audit-result h3")).toHaveText("Unresolved disagreement");
 await page.getByLabel("Study B tissue",{exact:true}).selectOption("Lung");await expect(page.locator(".hsi-audit-result h3")).toHaveText("Contextual difference");
 await page.getByLabel("Required context supplied in this example").uncheck();await expect(page.locator(".hsi-audit-result h3")).toHaveText("Insufficient evidence");
 for(const label of ["Genuine contradiction","Contextual difference","Insufficient evidence","Unresolved disagreement","Not directly comparable"]){await page.getByRole("button",{name:`Load ${label} example`,exact:true}).click();await expect(page.locator(".hsi-audit-result h3")).toHaveText(label);}
 await page.getByRole("button",{name:"Load Genuine contradiction example",exact:true}).click();await expect(page.locator(".hsi-audit-result")).toContainText("fictional controlled scenario");await expect(page.getByRole("main")).toContainText("No real study, live audit or scientific approval");expect(posts).toEqual([]);
});
test("evidence page connects the actual graph and original publications without implying approval",async({page})=>{
 await page.goto('/evidence-intelligence');await expect(page.locator('#home-knowledge-graph')).toHaveCount(0);
 await expect(page.getByRole('link',{name:/T follicular helper-like cells contribute/})).toHaveAttribute('href','https://pubmed.ncbi.nlm.nih.gov/29514998/');
 await expect(page.getByRole('main')).toContainText('does not validate HSI');
});
test("brief exports carry source-free and non-approved status",async({page})=>{
 await page.goto("/research-briefs");await page.locator("#example-brief summary").filter({hasText:"Evidence inventory and provenance"}).click();await expect(page.locator("#example-brief")).toContainText("No source-cleared study packet");
 const waiting=page.waitForEvent("download");await page.getByRole("button",{name:"Download illustrative JSON",exact:true}).click();const d=await waiting,payload=JSON.parse(await readFile((await d.path())!,"utf8"));expect(payload.scientificApproval).toBe(false);expect(payload.graphPublicationApproved).toBe(false);expect(payload.sourcePacket).toBeNull();expect(payload.reviewStatus).toBe("not_reviewed");
 const mdWaiting=page.waitForEvent("download");await page.getByRole("button",{name:"Download illustrative Markdown",exact:true}).click();const md=await mdWaiting;expect(await readFile((await md.path())!,"utf8")).toContain("No scientific or graph approval");
});
test("mobile focus is contained, Escape restores it, and trust notices resolve",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/");const open=page.getByRole("button",{name:"Open menu",exact:true});await open.click();const dialog=page.getByRole("dialog",{name:"Public navigation"});await expect(dialog.getByRole("button",{name:"Close menu"})).toBeFocused();expect(await page.locator("main").evaluate(e=>(e as HTMLElement).inert)).toBe(true);expect(await page.locator("footer.hsi-footer").evaluate(e=>(e as HTMLElement).inert)).toBe(true);
 await page.keyboard.press("Shift+Tab");await expect(dialog.getByRole("link",{name:"Sign up",exact:true})).toBeFocused();await page.keyboard.press("Tab");await expect(dialog.getByRole("button",{name:"Close menu"})).toBeFocused();await page.keyboard.press("Escape");await expect(open).toBeFocused();await expect(dialog).toHaveCount(0);
 for(const id of ["privacy","terms","accessibility","security"]){await page.goto("/trust#"+id);await expect(page.locator("#"+id)).toBeInViewport();}
});
test("reduced motion retains the audit and brief without scientific approval",async({page})=>{await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/context-conflict-audit");await page.getByRole("button",{name:"Load Insufficient evidence example"}).click();await expect(page.locator(".hsi-audit-result h3")).toHaveText("Insufficient evidence");await page.getByRole("main").locator('a[href="/research-briefs"]').first().click();await expect(page).toHaveURL(/research-briefs$/);await expect(page.locator(".hsi-brief-meta")).toContainText("not reviewed");});
