import {expect,test} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {readFile} from "node:fs/promises";

async function open(page:any){
 await page.goto("/research/knowledge-graph?experience=advanced");
 await page.getByRole("tab",{name:"Departments",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Six departments, one graph"})).toBeVisible();
}
const pick=async(page:any,concept:string)=>{await page.getByLabel("Find a concept in this department").fill(concept);await page.getByRole("button",{name:concept,exact:true}).click()};
const panel=(page:any)=>page.getByRole("region",{name:"Investigate this selection"});

test.describe("Investigating a selection with the collective's agents",()=>{
 test("with nothing selected the agents cannot run and the panel says why",async({page})=>{
  await open(page);
  const p=panel(page);
  await expect(p).toContainText("Add at least one concept or relationship");
  for(const n of ["Compare evidence","Identify gaps","Investigate mechanism"])await expect(p.getByRole("button",{name:n})).toBeDisabled();
 });

 test("shows the exact context sent, and agents propose without publishing",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("button",{name:"Add to investigation"}).first().click();
  const p=panel(page);
  await expect(p).toContainText("Concepts (1)");
  await p.getByText("Show the exact context the agents receive").click();
  await expect(p.locator("pre")).toContainText("hsi-graph-selection-1");
  await p.getByRole("button",{name:"Identify gaps"}).click();
  const card=p.getByRole("article",{name:"VANTAGE response"});
  await expect(card).toContainText("Candidate finding. No scientific approval. Nothing was published to the graph.");
  await expect(card).toContainText(/literature coverage/i);
  await p.getByRole("button",{name:"Investigate mechanism"}).click();
  await expect(p.getByRole("article",{name:"HELIX response"})).toContainText("Model-backed");
 });

 test("PARALLAX abstains rather than invent a comparison from one relationship",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("article",{name:"Path 1"}).getByRole("button",{name:/Add to investigation: relationship 1/}).click();
  const p=panel(page);
  await p.getByRole("button",{name:"Compare evidence"}).click();
  await expect(p.getByRole("article",{name:"PARALLAX response"})).toContainText("No conclusion offered");
 });

 test("a proposal stays unreviewed and the exported record reproduces from the graph",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("button",{name:"Add to investigation"}).first().click();
  const p=panel(page);
  await p.getByRole("button",{name:"Investigate mechanism"}).click();
  const propose=p.getByRole("button",{name:"Propose for review"}).first();
  if(await propose.count()){await propose.click();await expect(p.getByRole("region",{name:"Agent proposal"})).toContainText("proposed, unreviewed");}
  await p.getByRole("button",{name:"Identify gaps"}).click();
  await expect(p).toContainText(/This record reproduces from graph version [0-9a-f]{8}/);
  const [download]=await Promise.all([page.waitForEvent("download"),p.getByRole("button",{name:"Export investigation"}).click()]);
  const out=JSON.parse(await readFile(await download.path()!,"utf8"));
  expect(out.schemaVersion).toBe("hsi-graph-investigation-1");
  expect(out.context.graphVersion).toMatch(/^[0-9a-f]{64}$/);
  expect(JSON.stringify(out)).not.toMatch(/"scientificApproval":\s*true/);
 });

 test("a question containing identifiers is refused",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("button",{name:"Add to investigation"}).first().click();
  const p=panel(page);
  await p.getByLabel("Research question").fill("What about jane.doe@example.com in this pathway?");
  await expect(p.getByRole("alert")).toContainText("personal or clinical identifiers");
 });

 test("changing the selection clears earlier agent results",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("button",{name:"Add to investigation"}).first().click();
  const p=panel(page);
  await p.getByRole("button",{name:"Identify gaps"}).click();
  await expect(p.getByRole("article",{name:"VANTAGE response"})).toBeVisible();
  await p.getByRole("button",{name:/Remove Butyrate/}).click();
  await expect(p.getByRole("article",{name:"VANTAGE response"})).toHaveCount(0);
 });

 test("an investigation can be saved on this device, reopened, verified and reused; nothing is approved",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("button",{name:"Add to investigation"}).first().click();
  const p=panel(page);
  await expect(p).toContainText("Nothing saved yet");
  await p.getByRole("button",{name:"Identify gaps"}).click();
  await p.getByRole("button",{name:"Save on this device"}).click();
  await expect(p.getByRole("status")).toContainText("Saved as revision 1 on this device only");
  await p.getByRole("button",{name:"Save on this device"}).click();
  await expect(p.getByRole("status")).toContainText("Already saved as revision 1");
  await page.reload();await page.getByRole("tab",{name:"Departments",exact:true}).click();
  await p.getByRole("button",{name:/Open saved investigation/}).click();
  const o=p.getByRole("region",{name:"Opened saved investigation"});
  await expect(o).toContainText("Stored content is intact.");
  await expect(o).toContainText("Reproduces from the current graph.");
  await o.getByRole("button",{name:"Use this selection again"}).click();
  await expect(p).toContainText("Concepts (1)");
  const stored=await page.evaluate(()=>Object.entries(localStorage).filter(([k])=>k.startsWith("hsi-inv:")).map(([,v])=>JSON.parse(v)));
  expect(stored.length).toBe(1);expect(stored[0].scientificApproval).toBe(false);expect(stored[0].reviewStatus).toBe("unreviewed");
 });

 test("a tampered saved record is reported as failing its integrity check",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("button",{name:"Add to investigation"}).first().click();
  const p=panel(page);
  await p.getByRole("button",{name:"Identify gaps"}).click();
  await p.getByRole("button",{name:"Save on this device"}).click();
  await page.evaluate(()=>{const k=Object.keys(localStorage).find(x=>x.startsWith("hsi-inv:"))!;const v=JSON.parse(localStorage.getItem(k)!);v.record.context.question="Edited after saving";localStorage.setItem(k,JSON.stringify(v))});
  await page.reload();await page.getByRole("tab",{name:"Departments",exact:true}).click();
  await p.getByRole("button",{name:/Open saved investigation/}).click();
  await expect(p.getByRole("region",{name:"Opened saved investigation"})).toContainText("failed its integrity check");
 });

 test("has no axe violations and does not overflow at 320, 390, 768 and 1440",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("button",{name:"Add to investigation"}).first().click();
  await panel(page).getByRole("button",{name:"Identify gaps"}).click();
  const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
  expect(r.violations.map(v=>v.id+": "+v.nodes[0]?.html.slice(0,120))).toEqual([]);
  for(const w of [320,390,768,1440]){
   await page.setViewportSize({width:w,height:900});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),"width "+w).toBe(true);
  }
 });
});
