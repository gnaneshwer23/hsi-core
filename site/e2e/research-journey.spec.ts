import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";

test("walkthrough: honest banner, real-vs-not table, eight steps with links, empty progress; axe is clean",async({page})=>{
 await page.goto("/research/journey");
 await expect(page.getByRole("note")).toContainText("Model checks are off");
 await expect(page.getByRole("table",{name:"Status of each part of the prototype"})).toContainText("Synthetic. Generated profiles");
 await expect(page.getByRole("table",{name:"Status of each part of the prototype"})).toContainText("None claimed");
 const steps=page.getByRole("list",{name:"Walkthrough steps"}).locator(":scope > li");
 await expect(steps).toHaveCount(8);
 await expect(steps.nth(3)).toContainText("Synthetic data");
 await expect(steps.nth(3)).toContainText("What it does not");
 await expect(page.getByRole("status").filter({hasText:"trackable steps"})).toContainText("0 of 6");
 await expect(page.getByRole("heading",{name:"Before any real patient data"})).toBeVisible();
 const hrefs=await steps.getByRole("link").evaluateAll(els=>els.map(e=>(e as HTMLAnchorElement).getAttribute("href")));
 expect(hrefs).toEqual(["/research/home","/research/knowledge-graph","/research/gaps","/research/cohort","/research/ledger","/research/targets","/research/prescreen","/research/ledger"]);
 const r=await new AxeBuilder({page}).analyze();
 expect(r.violations.filter(v=>["serious","critical"].includes(v.impact??""))).toEqual([]);
});

test("walkthrough: progress reflects real records in this browser and nothing else",async({page})=>{
 await page.goto("/research/ledger");
 await page.getByLabel("Hypothesis (one sentence)").fill("Higher butyrate exposure improves glycaemic control in type 2 diabetes.");
 await page.getByRole("button",{name:"Add to ledger"}).click();
 await page.goto("/research/journey");
 const steps=page.getByRole("list",{name:"Walkthrough steps"}).locator(":scope > li");
 await expect(steps.nth(4)).toContainText("Done");
 await expect(steps.nth(4)).toContainText("1 hypothesis in your ledger");
 await expect(steps.nth(5)).toContainText("Not yet");
 await expect(steps.nth(7)).toContainText("Not yet");
 await expect(steps.nth(1)).toContainText("Not tracked");
 await expect(page.getByRole("status").filter({hasText:"trackable steps"})).toContainText("1 of 6");
});

test("walkthrough: mobile has no horizontal scroll and steps link through",async({page})=>{
 await page.setViewportSize({width:375,height:800});
 await page.goto("/research/journey");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
 await page.getByRole("link",{name:"Open trial pre-screening"}).click();
 await expect(page).toHaveURL(/\/research\/prescreen/);
 await expect(page.getByRole("heading",{level:1,name:"Trial pre-screening"})).toBeVisible();
});
