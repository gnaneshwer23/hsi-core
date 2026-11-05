import {test,expect} from "@playwright/test";
test("pilot research surfaces have a single main landmark and a working keyboard skip link",async({page})=>{
 await page.route("**/api/research/**",r=>r.fulfill({status:403,json:{error:"Local denial fixture; not a live permission check"}}));
 for(const path of ["/research/coverage","/research/evidence-readiness","/research/scientific-workbench","/research/scientific-review"]){
  await page.goto(path);await expect(page.getByRole("main")).toHaveCount(1);await page.keyboard.press("Tab");const skip=page.getByRole("link",{name:"Skip to content",exact:true});await expect(skip).toBeFocused();await page.keyboard.press("Enter");await expect(page.locator("#main-content")).toBeFocused();
 }
});
test("coverage task stays keyboard operable with reduced motion at 320px and meets local render budget",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await page.setViewportSize({width:320,height:812});const started=Date.now();await page.goto("/research/coverage?pack=t2d-inflammatory-context");await expect(page.getByRole("article",{name:"Selected research protocol",exact:true})).toBeVisible();expect(Date.now()-started).toBeLessThan(10000);
 const species=page.getByRole("combobox",{name:"Research species",exact:true});await species.focus();await page.keyboard.press("h");await page.keyboard.press("Enter");await expect(species).toHaveValue("human");
 const button=page.getByRole("button",{name:/Multiple sclerosis/});await button.focus();await page.keyboard.press("Enter");await expect(page).toHaveURL(/pack=ms-neuroimmune-context/);await expect(page.getByRole("article",{name:"Selected research protocol",exact:true})).toContainText("Multiple sclerosis");expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
