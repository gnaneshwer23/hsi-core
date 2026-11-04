import { test, expect } from "@playwright/test";
for(const width of [320,390,768,1440]){
 test(`Science Body Explorer at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto("/science/body");
  await expect(page.getByRole("heading",{name:/Explore the human body/i})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Pancreas",exact:true})).toBeVisible();
  await page.getByRole("button",{name:/Liver/}).first().click();
  await expect(page.getByRole("heading",{name:"Liver",exact:true})).toBeVisible();
  await page.getByLabel("Find an organ").fill("heart");
  await expect(page.getByRole("button",{name:/Heart/}).first()).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
  expect(overflow).toBe(false);
 });
}
test("Science landing opens Body Explorer",async({page})=>{await page.goto("/science");await page.getByRole("link",{name:/Explore the human body/}).click();await expect(page).toHaveURL(/\/science\/body/);});
