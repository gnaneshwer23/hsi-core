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

test("URL context, schematic selection and pancreas learning pathway",async({page})=>{
 await page.goto("/science/body?organ=liver");
 await expect(page.getByRole("heading",{name:"Liver",exact:true})).toBeVisible();
 await page.getByRole("button",{name:"Select Pancreas"}).click();
 await expect(page).toHaveURL(/organ=pancreas/);
 await page.getByRole("button",{name:"Beta cell"}).click();
 await expect(page.getByText(/Beta cells detect metabolic changes/)).toBeVisible();
 await page.reload();
 await expect(page.getByRole("heading",{name:"Pancreas",exact:true})).toBeVisible();
});
test("Biology Zoom follows only organs that have a pathway",async({page})=>{
 await page.goto("/science/body?organ=liver");
 await expect(page.getByRole("heading",{name:"Liver",exact:true})).toBeVisible();
 await expect(page.getByRole("link",{name:/Open Biology Zoom/})).toHaveCount(0);
 await expect(page.getByText(/This organ stays on the body explorer/)).toBeVisible();
 await page.getByRole("button",{name:/Heart/}).first().click();
 await expect(page.getByRole("link",{name:/Open Biology Zoom/})).toHaveAttribute("href","/science/zoom?organ=heart");
 await page.goto("/science/zoom?organ=liver");
 await expect(page.getByRole("heading",{name:"Pancreas",exact:true})).toHaveCount(0);
 await expect(page.getByText(/does not open the pancreas pathway/)).toBeVisible();
});
test("filters and keyboard markers",async({page})=>{
 await page.goto("/science/body");
 await page.getByLabel("Biological system").selectOption("immune");
 await expect(page.getByRole("button",{name:/Spleen/}).first()).toBeVisible();
 await expect(page.getByRole("group",{name:"Choose an organ"}).getByRole("button",{name:/Pancreas/})).toHaveCount(0);
 await page.getByLabel("Biological system").selectOption("all");
 await page.getByRole("button",{name:"Select Heart"}).focus();
 await page.keyboard.press("Enter");
 await expect(page.getByRole("heading",{name:"Heart",exact:true})).toBeVisible();
});

test("Phase 1 spatial model rotates and retains accessible 2D fallback",async({page})=>{
 await page.goto("/science/body");
 await expect(page.getByRole("group",{name:/Spatial body illustration, front view/})).toBeVisible();
 await page.getByRole("button",{name:"Rotate anatomy right"}).click();
 await expect(page.getByText("front view · 30°")).toBeVisible();
 await page.getByRole("button",{name:"2D fallback"}).click();
 await expect(page.getByText("2D accessible fallback")).toBeVisible();
 await page.getByRole("button",{name:"Select Heart"}).click();
 await expect(page.getByRole("heading",{name:"Heart",exact:true})).toBeVisible();
 await expect(page.getByText(/Claim definition:heart/)).toBeVisible();
 await page.getByRole("button",{name:"Reset"}).click();
 await expect(page.getByText("front view · 0°")).toBeVisible();
});
