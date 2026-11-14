import {expect,test} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {readFile} from "node:fs/promises";

async function open(page:any){
 await page.goto("/research/knowledge-graph?experience=advanced");
 await page.getByRole("tab",{name:"Departments",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Six departments, one graph"})).toBeVisible();
}
const pick=async(page:any,concept:string)=>{await page.getByLabel("Find a concept in this department").fill(concept);await page.getByRole("button",{name:concept,exact:true}).click()};

test.describe("Evidence by context",()=>{
 test("a concept shows its records split by context, with what is missing and what is not assessed",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  const b=page.getByRole("region",{name:"Evidence by context for Butyrate",exact:true});
  await expect(b).toBeVisible();
  await expect(b.locator(".cb-summary")).toContainText(/\d+ sources? in \d+ contexts?/);
  await expect(b.getByRole("table")).toContainText("Study system");
  await expect(b).toContainText("Records not stating");
  await expect(b).toContainText("Counts are distinct sources");
  await expect(b).toContainText("Not assessed here: effect size, independence of replication, retraction status, study quality");
  await expect(b).toContainText("No score or conclusion is given");
  await expect(b).not.toContainText("supports");
 });

 test("the relationship dossier carries the same breakdown for that pair",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("article",{name:"Path 1"}).getByRole("button",{name:/Inspect relationship 1/}).click();
  const d=page.getByRole("region",{name:"Relationship dossier"});
  await expect(d.getByRole("region",{name:"Evidence by context for this pair",exact:true})).toBeVisible();
  await expect(d.getByRole("region",{name:"Evidence by context for this pair",exact:true})).toContainText(/sources? in \d+ contexts?|No source-linked candidate records/);
 });

 test("export keeps the graph version and approves nothing",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  const b=page.getByRole("region",{name:"Evidence by context for Butyrate",exact:true});
  const [download]=await Promise.all([page.waitForEvent("download"),b.getByRole("button",{name:"Export this breakdown"}).click()]);
  const out=JSON.parse(await readFile(await download.path()!,"utf8"));
  expect(out.schemaVersion).toBe("hsi-context-breakdown-1");expect(out.graphVersion).toMatch(/^[0-9a-f]{64}$/);
  expect(out.scientificApproval).toBe(false);expect(out.causalConclusionAllowed).toBe(false);
  expect(out.totals.records).toBe(out.strata.reduce((n:number,s:{recordIds:string[]})=>n+s.recordIds.length,0));
 });

 test("is accessible and does not overflow the page at 320, 390, 768 and 1440",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  const r=await new AxeBuilder({page}).include(".dl-page").withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
  expect(r.violations.map(v=>v.id+": "+v.nodes[0]?.html.slice(0,100))).toEqual([]);
  for(const w of [320,390,768,1440]){await page.setViewportSize({width:w,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),"width "+w).toBe(true)}
 });
});
