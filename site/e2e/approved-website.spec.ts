import {test,expect} from "@playwright/test";
import {readFile} from "node:fs/promises";
const pages={"/":"A knowledge graph for biomedical research, with the evidence attached.","/how-it-works":"How HSI works: one loop, eight steps.","/knowledge-graph":"Relationships between biological entities, with the evidence attached.","/context-conflict-audit":"When findings differ, check whether the context differs.","/evidence-intelligence":"Inspect what supports a connection before relying on it.","/trust":"How HSI separates evidence from approval.","/about":"What HSI is for.","/contact":"Contact HSI and start from your research question."};
for(const [path,title] of Object.entries(pages))test(`approved public page, image and responsive layout ${path}`,async({page},info)=>{
 test.setTimeout(60000);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(path);await expect(page.getByRole("heading",{level:1})).toHaveText(title);await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${path} at ${width}`).toBe(true);
  await page.evaluate(()=>{for(const i of document.querySelectorAll<HTMLImageElement>("main img"))i.loading="eager"}); // below-the-fold images are lazy in production
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
test("mobile focus is contained, Escape restores it, and trust notices resolve",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/");const open=page.getByRole("button",{name:"Open menu",exact:true});await open.click();const dialog=page.getByRole("dialog",{name:"Public navigation"});await expect(dialog.getByRole("button",{name:"Close menu"})).toBeFocused();expect(await page.locator("main").evaluate(e=>(e as HTMLElement).inert)).toBe(true);expect(await page.locator("footer.hsi-footer").evaluate(e=>(e as HTMLElement).inert)).toBe(true);
 await page.keyboard.press("Shift+Tab");await expect(dialog.getByRole("link",{name:"Sign up",exact:true})).toBeFocused();await page.keyboard.press("Tab");await expect(dialog.getByRole("button",{name:"Close menu"})).toBeFocused();await page.keyboard.press("Escape");await expect(open).toBeFocused();await expect(dialog).toHaveCount(0);
 for(const id of ["privacy","terms","accessibility","security"]){await page.goto("/trust#"+id);await expect(page.locator("#"+id)).toBeInViewport();}
});
test("reduced motion retains the audit without scientific approval",async({page})=>{await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/context-conflict-audit");await page.getByRole("button",{name:"Load Insufficient evidence example"}).click();await expect(page.locator(".hsi-audit-result h3")).toHaveText("Insufficient evidence");});
