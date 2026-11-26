import AxeBuilder from "@axe-core/playwright";
import {expect,test,type Page} from "@playwright/test";

const PERSONAS=["student","researcher","professor","laboratory","computational","clinical","biotech","institution"] as const;

async function setup(page:Page,role:RegExp,objective:RegExp,domainIndex=0){
 await page.goto("/onboarding/role");
 await page.getByRole("radio",{name:role}).click();
 await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("button",{name:"Skip for now"}).click();
 await page.getByRole("radio",{name:"Primary"}).nth(domainIndex).click();
 await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("checkbox",{name:objective}).click();
 await page.getByRole("button",{name:"Continue"}).click();
}
const sectionTitles=async(page:Page)=>{await page.locator(".ws-panel").first().waitFor();return page.locator(".ws-panel h2").allTextContents()};

test("the chooser lists eight previews and flags that all content is sample content",async({page})=>{
 await page.goto("/workspace/preview");
 await expect(page.getByRole("heading",{level:1})).toContainText("Eight workspaces");
 await expect(page.locator(".ws-choose li")).toHaveCount(8);
 await expect(page.getByRole("note").first()).toContainText("No live service is connected");
});

test("every persona has its own information architecture",async({page})=>{
 const seen=new Map<string,string>();
 for(const p of PERSONAS){
  await page.goto(`/workspace/preview/${p}`);
  await expect(page.getByRole("heading",{level:1})).toBeVisible();
  const titles=(await sectionTitles(page)).join("|");
  expect(titles.length,p).toBeGreaterThan(10);
  expect(seen.get(titles),`${p} repeats the layout of ${seen.get(titles)}`).toBeUndefined();
  seen.set(titles,p);
  await expect(page.locator("#ws-first-h")).toBeVisible();
 }
});

test("the first action shows a clearly labelled illustrative output",async({page})=>{
 await page.goto("/workspace/preview/student");
 await page.getByRole("button",{name:"Show an illustrative output"}).click();
 await expect(page.getByText("not produced by HSI from evidence")).toBeVisible();
 await expect(page.locator("#ws-first-out")).toContainText("Butyrate");
 await page.getByRole("button",{name:"Hide the illustrative output"}).click();
 await expect(page.locator("#ws-first-out")).toHaveCount(0);
});

test("without onboarding the preview says it is a sample and does not personalise",async({page})=>{
 await page.goto("/workspace/preview/professor");
 await expect(page.getByRole("note").first()).toContainText("sample profile");
 await expect(page.getByLabel("Built from your answers")).toHaveCount(0);
});

test("the leading panel and header change with the role and objectives",async({page})=>{
 await setup(page,/Postdoctoral researcher/,/Plan experiments/);
 await page.goto("/workspace/preview/researcher");
 await expect(page.getByRole("heading",{level:1})).toContainText("postdoctoral researcher workspace");
 const titles=await sectionTitles(page);
 expect(titles[0]).toBe("Experimental planning");
 expect(titles).toContain("Mechanism under investigation");
 expect(titles).not.toContain("Thesis map");
 await expect(page.locator("#experiments .ws-match")).toContainText("Plan experiments");
 await expect(page.getByLabel("Built from your answers")).toContainText("Plan experiments");

 await setup(page,/PhD researcher/,/Identify research gaps/);
 await page.goto("/workspace/preview/researcher");
 const phd=await sectionTitles(page);
 expect(phd).toContain("Thesis map");expect(phd).not.toContain("Experimental planning");
});

test("a preview for a different role than your setup does not borrow your answers",async({page})=>{
 await setup(page,/Postdoctoral researcher/,/Plan experiments/);
 await page.goto("/workspace/preview/clinical");
 await expect(page.getByRole("note").first()).toContainText("different role");
 await expect(page.getByLabel("Built from your answers")).toHaveCount(0);
});

test("professor access panel states that nothing is provisioned and drafts stay local",async({page})=>{
 await page.goto("/workspace/preview/professor");
 await expect(page.getByText("No research group is provisioned for you")).toBeVisible();
 await page.getByLabel("Project name").fill("Barrier conflict study");
 await page.getByRole("button",{name:"Add local draft"}).click();
 await expect(page.getByText("Not shared, not saved")).toBeVisible();
});

test("institution permissions are all unprovisioned",async({page})=>{
 await page.goto("/workspace/preview/institution");
const cells=page.locator("#permissions tbody td");
 await expect(cells.first()).toBeVisible();
 const n=await cells.count();expect(n).toBeGreaterThan(0);
 for(let i=0;i<n;i++)await expect(cells.nth(i)).toHaveText("Not provisioned");
});

test("laboratory observation form flags missing context rather than filling it",async({page})=>{
 await page.goto("/workspace/preview/laboratory");
 await page.getByLabel("Assay").fill("Flow");
 await expect(page.getByText(/Context 1 of 5\. Missing/)).toBeVisible();
});

test("clinical preview states research-only boundaries and has no trial data",async({page})=>{
 await page.goto("/workspace/preview/clinical");
 await expect(page.getByText("No trial data is connected")).toBeVisible();
 await expect(page.getByText(/Not diagnostic/)).toBeVisible();
});

for(const p of PERSONAS){
 test(`accessible and no horizontal scroll at 390px: ${p}`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto(`/workspace/preview/${p}`);
  await page.getByRole("button",{name:"Show an illustrative output"}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.setViewportSize({width:320,height:700}); // hidden screen-reader text in tables must not widen the page
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.setViewportSize({width:390,height:844});
  const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 });
}
test("the chooser is accessible",async({page})=>{
 await page.goto("/workspace/preview");
 const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
 expect(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});
