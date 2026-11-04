import {test,expect} from "@playwright/test";
import {DISEASE_JOURNEYS,validateDiseaseJourneys} from "../src/features/science/diseaseJourneys";
test("disease catalogue keeps editorial review boundaries",()=>{
 expect(validateDiseaseJourneys()).toEqual([]);
 expect(DISEASE_JOURNEYS.map(j=>j.id)).toContain("systemic-sclerosis");
});
test("Phase 3 disease journeys navigate, deep link and disclose uncertainty",async({page})=>{
 await page.goto("/science/disease?disease=systemic-sclerosis");
 await expect(page.getByRole("heading",{name:"Systemic sclerosis",exact:true})).toBeVisible();
 await page.getByRole("button",{name:/Fibroblast activation/}).click();
 await expect(page).toHaveURL(/step=fibroblast/);
 await expect(page.getByRole("heading",{name:"Fibroblast activation",exact:true})).toBeVisible();
 await expect(page.getByText(/not a proven linear causal chain/)).toBeVisible();
 await page.reload();
 await expect(page.getByRole("heading",{name:"Fibroblast activation",exact:true})).toBeVisible();
 await page.getByRole("button",{name:/Type 2 diabetes/}).click();
 await expect(page.getByRole("heading",{name:"Type 2 diabetes",exact:true})).toBeVisible();
});
for(const width of [320,390,768,1440])test(`Phase 3 responsive ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto("/science/disease");
 await expect(page.getByRole("heading",{name:/Understand disease/})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2)).toBe(false);
});
