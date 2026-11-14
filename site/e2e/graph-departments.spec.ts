import {expect,test} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {readFile} from "node:fs/promises";

async function open(page:any){
 await page.goto("/research/knowledge-graph?experience=advanced");
 await expect(page.getByRole("heading",{name:"Connected research network",exact:true})).toBeVisible();
 await page.getByRole("tab",{name:"Departments",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Six departments, one graph"})).toBeVisible();
}
const pick=async(page:any,concept:string)=>{await page.getByLabel("Find a concept in this department").fill(concept);await page.getByRole("button",{name:concept,exact:true}).click()};

test.describe("Departments tab on the knowledge graph",()=>{
 test("shows six departments with honest coverage and states what is not covered",async({page})=>{
  await open(page);
  const rail=page.getByRole("group",{name:"Choose a department"});
  await expect(rail.getByRole("button")).toHaveCount(6);
  await expect(rail.getByRole("button",{name:/Immunology/})).toContainText("127 candidate concepts");
  await expect(rail.getByRole("button",{name:/Genomics/})).toContainText("No graph coverage");
  await rail.getByRole("button",{name:/Human Physiology/}).click();
  await expect(page.getByText("Nothing is shown rather than inferred")).toBeVisible();
  await expect(page.getByRole("note")).toContainText("none is validated knowledge");
 });

 test("a connection into another department keeps evidence per hop and marks where it stops",async({page})=>{
  await open(page);
  await pick(page,"Butyrate");
  await expect(page.getByRole("status").or(page.locator(".dl-result")).first()).toContainText("paths found");
  const first=page.getByRole("article",{name:"Path 1"});
  await expect(first).toContainText("Evidence stops");
  await expect(first).toContainText("not an established causal mechanism");
  await expect(first).toContainText(/Reconstructable from graph version [0-9a-f]{8}/);
  await expect(page.locator(".dl-path").first().locator(".dl-hop-stop").first()).toContainText("Evidence stops here");
  // a path with complete candidate evidence is listed and labelled
  await page.getByLabel("Find a concept in this department").fill("Endotoxin exposure");
  await page.getByRole("button",{name:"Endotoxin exposure",exact:true}).click();
  await expect(page.getByRole("article",{name:"Path 1"})).toContainText("Candidate evidence at every hop");
 });

 test("a target department with no coverage reports a gap, not an answer",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByLabel("Into department").selectOption({label:"Genomics & Multi-omics"});
  await expect(page.locator(".dl-result")).toContainText("coverage gap, not evidence of absence");
  await expect(page.locator(".dl-path")).toHaveCount(0);
 });

 test("the relationship dossier shows context, source, review state and other records",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("article",{name:"Path 1"}).getByRole("button",{name:/Inspect relationship 1/}).click();
  const d=page.getByRole("region",{name:"Relationship dossier"});
  await expect(d).toBeVisible();
  for(const t of ["Study model","Tissue","Limitations","Review status: Unreviewed","Confidence: Not calibrated","Scientific claim: Not allowed","Other records for this pair"])await expect(d).toContainText(t);
  await d.getByRole("button",{name:"Close dossier"}).click();await expect(d).toHaveCount(0);
 });

 test("an exported path preserves the graph version, ids and verification, and approves nothing",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  const [download]=await Promise.all([page.waitForEvent("download"),page.getByRole("article",{name:"Path 1"}).getByRole("button",{name:"Export path"}).click()]);
  const out=JSON.parse(await readFile(await download.path()!,"utf8"));
  expect(out.schemaVersion).toBe("hsi-cross-department-path-1");expect(out.graphVersion).toMatch(/^[0-9a-f]{64}$/);
  expect(out.path.edgeIds.length).toBe(out.hops.length);expect(out.path.nodeIds.length).toBe(out.hops.length+1);
  expect(out.verification.reconstructs).toBe(true);expect(out.causalConclusionAllowed).toBe(false);expect(out.scientificApproval).toBe(false);
 });

 test("show in graph returns to the network with that concept selected",async({page})=>{
  await open(page);await pick(page,"Butyrate");
  await page.getByRole("button",{name:"Show in graph"}).click();
  await expect(page.getByRole("tab",{name:"Connected graph",exact:true})).toHaveAttribute("aria-selected","true");
  await expect(page.getByRole("complementary",{name:"Cross-domain evidence inspector"})).toContainText("Butyrate");
 });

 test("keyboard operable, accessible, and no horizontal overflow at 320, 390, 768 and 1440",async({page})=>{
  await open(page);
  const imm=page.getByRole("group",{name:"Choose a department"}).getByRole("button",{name:/Immunology/});await imm.focus();await page.keyboard.press("Enter");await expect(imm).toHaveAttribute("aria-pressed","true");
  await pick(page,"Butyrate");
  const axe=await new AxeBuilder({page}).include(".dl-page").analyze();expect(axe.violations.map(v=>({id:v.id,n:v.nodes.map(n=>n.target)}))).toEqual([]);
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),String(width)).toBe(true)}
 });
});
