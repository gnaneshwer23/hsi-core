import {test,expect} from "@playwright/test";
test("Phase 2 Biology Zoom navigates across levels and preserves deep links",async({page})=>{
 await page.goto("/science/zoom?organ=pancreas");
 await expect(page.getByRole("heading",{name:"Zoom into biology."})).toBeVisible();
 await page.getByRole("button",{name:/Beta cell/}).first().click();
 await expect(page).toHaveURL(/step=beta-cell/);
 await expect(page.getByRole("heading",{name:"Beta cell",exact:true})).toBeVisible();
 await page.reload();
 await expect(page.getByRole("heading",{name:"Beta cell",exact:true})).toBeVisible();
 await page.getByRole("button",{name:"Next layer"}).click();
 await expect(page.getByRole("heading",{name:"Glucose sensing",exact:true})).toBeVisible();
});
test("Phase 2 Connections filters and navigates draft links",async({page})=>{
 await page.goto("/science/connections?organ=pancreas");
 await expect(page.getByRole("heading",{name:"Pancreas",exact:true})).toBeVisible();
 await page.getByRole("button",{name:/Skeletal muscle/}).last().click();
 await expect(page).toHaveURL(/organ=muscle/);
 await expect(page.getByRole("heading",{name:"Skeletal muscle",exact:true})).toBeVisible();
 await page.getByRole("textbox",{name:"Find an organ or tissue"}).fill("kidney");
 await expect(page.getByRole("group",{name:"Choose a biological entity"}).getByRole("button")).toHaveCount(0);
});
for(const width of [320,390,768,1440])test(`Phase 2 responsive ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});
 for(const route of ["/science/zoom","/science/connections"]){
  await page.goto(route);
  await expect(page.locator("main")).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2)).toBe(false);
 }
});
