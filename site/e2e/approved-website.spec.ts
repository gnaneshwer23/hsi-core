import {test,expect} from "@playwright/test";
import {readFile} from "node:fs/promises";
const pages={"/":"See what the evidence supports, and where it does not.","/how-it-works":"From scientific questions to evidence-linked decisions.","/knowledge-graph":"Every connection, with the study behind it.","/solutions":"How different research teams use HSI.","/evidence-intelligence":"Inspect what supports a connection before relying on it.","/trust":"How HSI separates evidence from approval.","/about":"What HSI is for.","/contact":"Request a design-partner pilot."};
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
test("evidence page connects the actual graph and original publications without implying approval",async({page})=>{
 await page.goto('/evidence-intelligence');await expect(page.locator('#home-knowledge-graph')).toHaveCount(0);
 await expect(page.getByRole('link',{name:/T follicular helper-like cells contribute/})).toHaveAttribute('href','https://pubmed.ncbi.nlm.nih.gov/29514998/');
 await expect(page.getByRole('main')).toContainText('does not validate HSI');
});
test("mobile focus is contained, Escape restores it, and trust notices resolve",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/status");const open=page.getByRole("button",{name:"Open menu",exact:true});await open.click();const dialog=page.getByRole("dialog",{name:"Public navigation"});await expect(dialog.getByRole("button",{name:"Close menu"})).toBeFocused();expect(await page.locator("main").evaluate(e=>(e as HTMLElement).inert)).toBe(true);expect(await page.locator("footer.hsi-footer").evaluate(e=>(e as HTMLElement).inert)).toBe(true);
 await page.keyboard.press("Shift+Tab");await expect(dialog.getByRole("link",{name:"Create account",exact:true})).toBeFocused();await page.keyboard.press("Tab");await expect(dialog.getByRole("button",{name:"Close menu"})).toBeFocused();await page.keyboard.press("Escape");await expect(open).toBeFocused();await expect(dialog).toHaveCount(0);
 for(const id of ["privacy","terms","accessibility","security"]){await page.goto("/trust#"+id);await expect(page.locator("#"+id)).toBeInViewport();}
});
