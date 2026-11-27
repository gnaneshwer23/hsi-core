import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";

/** Public pages that describe the graph workspace link to it, show real screenshots, and keep the candidate labels. */
const PAGES:[string,string,RegExp][]=[
 ["/","Open the graph workspace",/\/workspace\/graph$/],
 ["/knowledge-graph","Open the graph workspace",/\/workspace\/graph$/],
 ["/how-it-works","Open the graph workspace",/\/workspace\/graph$/],
 ["/platform/contradiction-analysis","Open contradiction mode",/\/workspace\/graph\?mode=contradiction$/],
 ["/platform/agents","Open the workspace",/\/workspace\/graph$/],
 ["/platform/discovery-engine","Open hypothesis mode",/\/workspace\/graph\?mode=hypothesis$/],
];

for(const [path,name,href] of PAGES){
 test(`${path} links to the graph workspace`,async({page})=>{
  await page.goto(path);
  await expect(page.getByRole("link",{name,exact:true}).first()).toHaveAttribute("href",href);
 });
}

for(const path of ["/knowledge-graph","/platform/contradiction-analysis","/platform/agents","/platform/discovery-engine","/how-it-works"]){
 test(`${path} screenshots load, describe themselves and say every relationship is unreviewed`,async({page})=>{
  await page.goto(path);
  const imgs=page.locator('img[src^="/images/product/workspace-"]');
  await expect(imgs.first()).toBeAttached();
  for(let i=0;i<await imgs.count();i++){
   const img=imgs.nth(i);await img.scrollIntoViewIfNeeded();
   await expect(img).toHaveAttribute("alt",/.{40,}/);
   await expect.poll(()=>img.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.getByText("every relationship shown is unreviewed").first()).toBeVisible();
 });
}

test("the contradiction page never calls a disagreement resolved, and the agents page says model interpretation is off",async({page})=>{
 await page.goto("/platform/contradiction-analysis");
 await expect(page.getByRole("heading",{name:"Three readings, kept apart, never resolved."})).toBeVisible();
 await expect(page.getByText("adjudication: not performed").first()).toBeVisible();
 await page.goto("/platform/agents");
 await expect(page.getByRole("heading",{name:"Model interpretation is off"})).toBeVisible();
 await page.goto("/platform/discovery-engine");
 await expect(page.getByText("Planned").first()).toBeVisible();
 await expect(page.getByText("Labelled “not a protocol”.",{exact:false})).toBeVisible();
});

for(const [name,vp] of [["desktop",{width:1440,height:900}],["390px",{width:390,height:844}]] as const){
 for(const path of ["/knowledge-graph","/platform/contradiction-analysis","/platform/agents","/platform/discovery-engine"]){
  test(`${path} is accessible with no horizontal scroll: ${name}`,async({page})=>{
   await page.setViewportSize(vp);await page.emulateMedia({reducedMotion:"reduce"});
   await page.goto(path);
   await expect(page.locator('img[src^="/images/product/workspace-"]').first()).toBeAttached();
   for(const w of [vp.width,320]){
    await page.setViewportSize({width:w,height:vp.height});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`width ${w}`).toBe(true);
   }
   await page.setViewportSize(vp);
   const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
   expect(r.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))).toEqual([]);
  });
 }
}
