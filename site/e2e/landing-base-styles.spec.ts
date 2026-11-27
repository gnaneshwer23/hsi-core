import {expect,test} from "@playwright/test";

// The landing pages must not depend on the legacy stylesheet: it loads only with the old tool pages.
for(const path of ["/","/about","/knowledge-graph","/contact"]){
 test(`landing base styles hold without the legacy stylesheet: ${path}`,async({page})=>{
  await page.goto(path);await page.locator(".lv2").first().waitFor();
  const base=await page.evaluate(()=>({margin:getComputedStyle(document.body).margin,fontSize:getComputedStyle(document.body).fontSize}));
  expect(base.margin).toBe("0px");
  expect(base.fontSize).toBe("17px");
 });
}

test("mobile menu button and pilot request form have touch-sized targets",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/contact");
 const menu=await page.getByRole("button",{name:"Open menu"}).boundingBox();
 expect(menu!.width).toBeGreaterThanOrEqual(44);expect(menu!.height).toBeGreaterThanOrEqual(44);
 for(const el of [page.locator("#access-intent-question"),page.locator("#access-intent-email"),page.getByRole("button",{name:"Save my question"})]){
  const box=await el.boundingBox();expect(box!.height).toBeGreaterThanOrEqual(44);
 }
});
