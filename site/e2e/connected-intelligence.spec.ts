import {expect,test} from "@playwright/test";

const NAMES=/Aksh|HSI Clinical|HSI Trials|\bISI\b|Immune Super Intelligence|Akeno/;
test.describe("Connected intelligence page and the retired product URLs",()=>{
 for(const viewport of [{width:1440,height:900},{width:768,height:1024},{width:390,height:844},{width:320,height:720}]){
  test(`connected intelligence at ${viewport.width}px`,async({page})=>{
   await page.setViewportSize(viewport);await page.goto("/connected-intelligence");
   await expect(page.getByRole("heading",{level:1})).toContainText("Connected intelligence");
   for(const title of ["Scientific discovery","Longitudinal clinical context","Patient-reported health context","Translational study intelligence"])await expect(page.getByRole("heading",{level:3,name:title})).toBeVisible();
   await expect(page.locator(".ci-card .dept-status").first()).toHaveText("Research preview");
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   expect(await page.getByRole("main").innerText()).not.toMatch(NAMES);
  });
 }
 test("the call to action is keyboard operable",async({page})=>{
  await page.goto("/connected-intelligence");
  const cta=page.getByRole("link",{name:/Explore the science/});await cta.focus();await expect(cta).toBeFocused();
  await page.keyboard.press("Enter");await expect(page).toHaveURL(/\/departments$/);
 });
 for(const path of ["/modules","/modules/aksh-health","/modules/clinical","/modules/isi","/modules/trials","/products","/for-aksh","/for-isi","/for-trials","/akeno","/aksh-agents"]){
  test(`${path} lands on connected intelligence with no product names`,async({page})=>{
   await page.goto(path);await expect(page).toHaveURL(/\/connected-intelligence$/);
   await expect(page.getByRole("heading",{level:1})).toContainText("Connected intelligence");
   expect(await page.locator("body").innerText()).not.toMatch(NAMES);
  });
 }
});
