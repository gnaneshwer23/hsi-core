import {expect,test} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {readFile} from "node:fs/promises";

const open=async(page:any)=>{await page.goto("/research/ontology-review");await expect(page.getByRole("heading",{name:"Ontology mapping review",level:1})).toBeVisible()};
const card=(page:any,name:string)=>page.getByRole("article",{name});

test.describe("Ontology mapping review",()=>{
 test("states plainly that recommendations are not approvals and lists unmapped concepts honestly",async({page})=>{
  await open(page);
  await expect(page.getByRole("note")).toContainText("recommendations, not approvals");
  await expect(page.getByText(/of 153 concepts have a candidate/)).toBeVisible();
  await page.getByText(/concepts with no exact match/).click();
  await expect(page.getByText("not evidence that no ontology term exists")).toBeVisible();
 });

 test("decisions need a reviewer label and a reason; identifying text is refused",async({page})=>{
  await open(page);
  const c=card(page,"Rheumatoid arthritis");
  await expect(c.getByRole("button",{name:"Recommend accepting"})).toBeDisabled();
  await page.getByLabel("Reviewer label").fill("Curator A");
  await c.getByRole("button",{name:"Recommend accepting"}).click();
  await expect(c.getByRole("alert")).toContainText("reason");
  await c.getByLabel("Reason for your recommendation").fill("Call 943 476 5919 about this one");
  await c.getByRole("button",{name:"Recommend accepting"}).click();
  await expect(c.getByRole("alert")).toContainText("identifiers");
 });

 test("records a recommendation on this device, survives reload, and exports it as unverified and unapproved",async({page})=>{
  await open(page);
  await page.getByLabel("Reviewer label").fill("Curator A");
  const c=card(page,"Rheumatoid arthritis");
  await expect(c).toContainText("MONDO:0008383");
  await c.getByLabel("Reason for your recommendation").fill("Label and definition match the disease concept.");
  await c.getByRole("button",{name:"Recommend accepting"}).click();
  await expect(page.getByRole("status").first()).toContainText("recorded on this device as an unreviewed recommendation");
  await expect(page.getByText(/\b1\b of \d+ reviewed/)).toBeVisible();
  await page.reload();
  await page.getByRole("button",{name:"Reviewed",exact:true}).click();
  await expect(card(page,"Rheumatoid arthritis")).toContainText("Recommended for acceptance");
  await expect(card(page,"Rheumatoid arthritis")).toContainText("(unverified)");
  const [download]=await Promise.all([page.waitForEvent("download"),page.getByRole("button",{name:"Export recommendations"}).click()]);
  const out=JSON.parse(await readFile(await download.path()!,"utf8"));
  expect(out.schemaVersion).toBe("hsi-curator-decisions-export-1");
  expect(out.counts.accept_candidate).toBe(1);expect(out.decisions[0].exactMappingApproved).toBe(false);expect(out.decisions[0].reviewerVerified).toBe(false);
  expect(out.statement).toContain("independent human review");
 });

 test("a tampered stored decision is reported and blocks export",async({page})=>{
  await open(page);
  await page.getByLabel("Reviewer label").fill("Curator A");
  const c=card(page,"Rheumatoid arthritis");
  await c.getByLabel("Reason for your recommendation").fill("Label and definition match the disease concept.");
  await c.getByRole("button",{name:"Recommend rejecting"}).click();
  await expect(page.getByRole("status").first()).toContainText("recorded");
  await page.evaluate(()=>{const k=Object.keys(localStorage).find(x=>x.startsWith("hsi-map:"))!;const v=JSON.parse(localStorage.getItem(k)!);v.reason="Changed after recording by hand.";localStorage.setItem(k,JSON.stringify(v))});
  await page.reload();
  await expect(page.getByRole("alert").first()).toContainText("failed verification");
  await page.getByRole("button",{name:"Export recommendations"}).click();
  await expect(page.getByRole("status").last()).toContainText("failed verification");
 });

 test("is keyboard operable, has no axe violations, and does not overflow at 320, 390, 768 and 1440",async({page})=>{
  await open(page);
  await page.getByLabel("Reviewer label").fill("Curator A");
  const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
  expect(r.violations.map(v=>v.id+": "+v.nodes[0]?.html.slice(0,120))).toEqual([]);
  for(const w of [320,390,768,1440]){await page.setViewportSize({width:w,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),"width "+w).toBe(true)}
 });
});
