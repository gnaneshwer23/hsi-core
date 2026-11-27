import AxeBuilder from "@axe-core/playwright";
import {expect,test,type Page} from "@playwright/test";
import {EMPTY_STATE,ONBOARDING_KEY,serializeState,type OnboardingState} from "../../src/onboarding/scientificOnboarding";

const open=async(page:Page)=>{await page.goto("/workspace/graph");await expect(page.getByRole("heading",{level:1,name:"Living Intelligence Graph"})).toBeVisible();await expect(page.locator("g.gw-node").first()).toBeVisible()};
/** Opens the 3D view when the browser provides WebGL; otherwise checks it is disabled with the reason. Returns whether 3D opened. */
const threeD=async(page:Page)=>{
 const r=page.getByRole("radio",{name:"3D"});
 if(await r.isDisabled()){await expect(page.getByText("3D is unavailable in this browser because WebGL is not provided.")).toBeVisible();return false}
 await r.click();await expect(page.locator("#gw-3d canvas")).toBeVisible();return true;
};
const table=async(page:Page)=>{await page.getByRole("radio",{name:"Table"}).click();await expect(page.locator("table.gw-table")).toBeVisible()};

test("it opens on the real published slice and says every relationship is a candidate",async({page})=>{
 await open(page);
 await expect(page.locator(".gw-banner")).toContainText("Every relationship is a candidate: unreviewed, confidence not calibrated, source not verified");
 expect(await page.locator("g.gw-node").count()).toBeGreaterThan(30);
 expect(await page.locator("line.gw-edge").count()).toBeGreaterThan(20);
 await expect(page.getByLabel("Scope",{exact:true})).toContainText("Immunology × Microbiome");
});

test("a relationship's inspector shows status, explicit missing context with reasons, and the source",async({page})=>{
 await open(page);await table(page);
 await page.locator("table.gw-table tbody th button").first().click();
 const side=page.getByRole("complementary",{name:"Inspector"});
 await expect(side.getByRole("heading",{name:"Relationship"})).toBeVisible();
 for(const t of ["Candidate","Unreviewed","Confidence not calibrated","Source not verified"])await expect(side).toContainText(t);
 await expect(side).toContainText("No relationship in the published graph is reviewed or approved");
 await expect(side).toContainText("Not stated");
 await expect(side).toContainText("HSI does not record this field yet.");
 await expect(side).toContainText("Cell type");await expect(side).toContainText("Dose");
 await expect(side).toContainText("HSI shows a passage only where one is recorded and rights allow. None is invented.");
 await expect(side.getByRole("link",{name:/DOI|PubMed/}).first()).toHaveAttribute("rel","noopener noreferrer");
});

test("selecting a concept lists its relationships and never claims an identifier",async({page})=>{
 await open(page);
 await page.locator("g.gw-node").nth(4).click();
 const side=page.getByRole("complementary",{name:"Inspector"});
 await expect(side.getByRole("heading",{name:/Relationships \(\d+\)/})).toBeVisible();
 await expect(side.getByRole("heading",{name:"Identifiers"})).toBeVisible();
 await expect(side).toContainText(/Not a canonical identifier|No canonical identifier is shown/);
});

test("the table is an equivalent accessible view with source links",async({page})=>{
 await open(page);
 const nodes=await page.locator("g.gw-node").count();
 await table(page);
 const rows=page.locator("table.gw-table tbody tr");
 expect(await rows.count()).toBeGreaterThan(20);
 await expect(page.locator("table.gw-table caption")).toContainText("None is reviewed or approved");
 await expect(rows.first().getByRole("link",{name:"DOI"})).toHaveAttribute("target","_blank");
 expect(nodes).toBeGreaterThan(0);
});

test("filters narrow the view, count 'Not stated' as a value, and say an empty result is not evidence of absence",async({page})=>{
 await open(page);await table(page);
 const all=await page.locator("table.gw-table tbody tr").count();
 await page.getByRole("group",{name:"Species"}).getByLabel(/Not stated/).check();
 const some=await page.locator("table.gw-table tbody tr").count();
 expect(some).toBeGreaterThan(0);expect(some).toBeLessThan(all);
 await page.getByRole("button",{name:"Reset"}).click();
 expect(await page.locator("table.gw-table tbody tr").count()).toBe(all);
 await page.getByLabel(/Context stated: at least/).fill("8");
 await expect(page.getByRole("status").filter({hasText:"not evidence of absence"})).toBeVisible();
});

test("modes without data or blocked by a decision cannot be opened, and say why",async({page})=>{
 await open(page);
 const mode=page.getByLabel("Mode",{exact:true});
 await expect(mode.locator("option",{hasText:"Multi-omics Graph"})).toHaveJSProperty("disabled",true);
 await expect(mode.locator("option",{hasText:"Multi-omics Graph"})).toContainText("No data yet");
 await expect(mode.locator("option",{hasText:"Collaboration Graph"})).toHaveJSProperty("disabled",true);
 await expect(mode.locator("option",{hasText:"Collaboration Graph"})).toContainText("Blocked");
 await expect(mode.locator("option",{hasText:"Biological Atlas"})).toHaveJSProperty("disabled",false);
});

test("the contradiction mode never invents a conflict",async({page})=>{
 await open(page);
 await page.getByLabel("Mode",{exact:true}).selectOption({label:"Contradiction Graph"});
 const empty=page.getByRole("status").filter({hasText:"nothing to compare"});
 const pairs=page.locator('line.gw-edge[data-pair]');
 await expect(empty.or(pairs.first())).toBeVisible();
 await expect(page.getByText(/confirmed contradiction/i)).toHaveCount(0);
});

test("the coverage strip reports no coverage for genomics instead of drawing it",async({page})=>{
 await open(page);
 const cov=page.getByRole("region",{name:/Coverage in the published graph/}).or(page.locator("section[aria-labelledby=gw-cov]"));
 await expect(cov.locator("li",{hasText:"Genomics & Multi-omics"})).toContainText("No coverage");
 await expect(cov).toContainText("not a measure of how well a domain is understood");
});

test("the whole published graph is larger than the slice, and neighbours can be added within a bound",async({page})=>{
 await open(page);
 const slice=await page.locator("g.gw-node").count();
 await page.getByRole("radio",{name:"1 hop"}).click();
 await expect(page.getByText(/Added \d+ relationship/)).toBeVisible();
 expect(await page.locator("g.gw-node").count()).toBeGreaterThanOrEqual(slice);
 await page.getByLabel("Scope",{exact:true}).selectOption("all");
 expect(await page.locator("g.gw-node").count()).toBeGreaterThan(slice);
});

test("pathway tracing lists association chains and says they are not mechanisms",async({page})=>{
 await open(page);await table(page);
 const first=page.locator("table.gw-table tbody tr").first();
 const from=await first.locator("th button").innerText(),to=await first.locator("td").nth(2).innerText();
 await page.getByLabel("From",{exact:true}).selectOption({label:from});
 await page.getByLabel("To",{exact:true}).selectOption({label:to});
 await expect(page.getByRole("list",{name:"Association chains"})).toBeVisible();
 await expect(page.getByText("It is not a mechanism and not a causal claim.")).toBeVisible();
});

test("export carries the statuses and the not-stated markers",async({page})=>{
 await open(page);
 const dl=page.waitForEvent("download");
 await page.getByRole("button",{name:"Export this view"}).click();
 const d=await dl;expect(d.suggestedFilename()).toMatch(/^hsi-graph-044eb4d6-/);
 const text=await (await import("node:fs/promises")).readFile((await d.path())!,"utf8");
 expect(text).toContain('"approved": false');expect(text).toContain("unreviewed");expect(text).toContain("not_recorded_in_graph_schema");
});

test("a failing snapshot shows no substitute graph",async({page})=>{
 await page.route("**/api/research/graph-snapshot**",r=>r.fulfill({status:500,body:"x"}));
 await page.goto("/workspace/graph");
 await expect(page.getByText("Snapshot unavailable. No substitute graph is shown.")).toBeVisible();
 await expect(page.locator("g.gw-node")).toHaveCount(0);
});

test("a conflict goal opens the contradiction mode, and every other mode stays reachable",async({page})=>{
 await page.goto("/onboarding/role");
 await page.getByRole("radio",{name:/Postdoctoral researcher/}).click();
 await page.getByRole("button",{name:"Continue"}).click();await page.getByRole("button",{name:"Skip for now"}).click();
 await page.getByRole("radio",{name:"Primary"}).first().click();await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("checkbox",{name:/Investigate conflicting evidence/}).click();await page.getByRole("button",{name:"Continue"}).click();
 await page.goto("/workspace/graph");
 await expect(page.getByLabel("Mode",{exact:true})).toHaveValue("contradiction");
 await page.getByText("Why the workspace opened here").click();
 await expect(page.getByText("Opened in this mode because you chose to investigate conflicting evidence.")).toBeVisible();
 await expect(page.getByText("Every other mode, including conflicts, stays one click away.").first()).toBeVisible();
 await page.getByLabel("Mode",{exact:true}).selectOption({label:"Mechanism Graph"});
 await expect(page.getByLabel("Mode",{exact:true})).toHaveValue("mechanism");
});

for(const [name,vp] of [["desktop",{width:1440,height:900}],["390px",{width:390,height:844}]] as const){
 for(const v of ["Graph","Table","3D"]){
  test(`accessible and no horizontal scroll, ${v} view: ${name}`,async({page})=>{
   await page.setViewportSize(vp);await page.emulateMedia({reducedMotion:"reduce"});
   await open(page);
   if(v==="Table")await table(page);
   if(v==="3D")await threeD(page);
   await page.getByRole("button",{name:/./}).first().isVisible();
   for(const w of [vp.width,320]){
    await page.setViewportSize({width:w,height:vp.height});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`width ${w}`).toBe(true);
   }
   await page.setViewportSize(vp);
   const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
   expect(r.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))).toEqual([]);
  });
 }
}

const wholeContradictions=async(page:Page)=>{
 await open(page);
 await page.getByLabel("Mode",{exact:true}).selectOption({label:"Contradiction Graph"});
 await page.getByRole("button",{name:/Show the \d+ disagreements? recorded in the whole published graph/}).click();
 await expect(page.locator("ul.gw-units li").first()).toBeVisible();
};

test("the default slice records no disagreement, and says where disagreements are recorded instead of inventing one",async({page})=>{
 await open(page);
 await page.getByLabel("Mode",{exact:true}).selectOption({label:"Contradiction Graph"});
 const empty=page.locator("#gw-compare-panel").getByRole("status");
 await expect(empty).toContainText("nothing to compare");
 await expect(empty).toContainText("does not show that nothing conflicts");
 await expect(page.locator("ul.gw-units")).toHaveCount(0);
});

test("the recorded disagreements keep potential contradiction, context dependence and insufficient context apart",async({page})=>{
 await wholeContradictions(page);
 const units=page.locator("ul.gw-units li");
 expect(await units.count()).toBe(5);
 await expect(page.locator(".gw-reading",{hasText:"Potential contradiction"})).toHaveCount(1);
 await expect(page.locator(".gw-reading",{hasText:"Possible context dependence"})).toHaveCount(2);
 await expect(page.locator(".gw-reading",{hasText:"Insufficient context to tell"})).toHaveCount(2);
 await expect(page.locator("#gw-compare-panel")).toContainText("never called resolved");
 // red is reserved for the one potential contradiction
 expect(await page.locator('line.gw-edge[data-reading="potential_contradiction"]').count()).toBeGreaterThan(0);
 expect(await page.locator('line.gw-edge[data-reading="context_dependence"]').count()).toBeGreaterThan(0);
});

test("the side-by-side comparison marks which variables differ, and a missing value is 'cannot tell', not 'differs'",async({page})=>{
 await wholeContradictions(page);
 await page.locator("ul.gw-units li",{hasText:"Anti-CCP antibodies and Anti-TNF treatment response"}).getByRole("button",{name:"Compare these findings"}).click();
 const t=page.locator("table.gw-compare");
 await expect(t).toBeVisible();
 await expect(t.locator("tr",{hasText:"Direction of the finding"})).toContainText("Differs");
 await expect(t.locator("tr",{hasText:"Population"})).toContainText("Differs");
 await expect(t.locator("tr",{hasText:"Tissue"})).toContainText("Cannot tell");
 await expect(t.locator("tr",{hasText:"Tissue"})).toContainText("Not stated");
 const verdict=page.locator(".gw-verdict");
 await expect(verdict).toContainText("Possible context dependence");
 await expect(verdict).toContainText("does not decide which finding is correct");
 await expect(verdict).toContainText("Adjudication: not performed.");
 await expect(page.locator("#gw-compare-panel")).toContainText("not validated protocols and do not favour either finding");
 await expect(page.locator("#gw-compare-panel").getByRole("heading",{name:"Candidate checks"})).toBeVisible();
});

test("any two to six findings can be compared from the table, and no more",async({page})=>{
 await open(page);await table(page);
 const boxes=page.locator("table.gw-table tbody input[type=checkbox]");
 await boxes.nth(0).check();
 await expect(page.locator("table.gw-compare")).toHaveCount(0);
 await boxes.nth(1).check();
 await expect(page.locator("table.gw-compare")).toBeVisible();
 for(let i=2;i<6;i++)await boxes.nth(i).check();
 await expect(boxes.nth(6)).toBeDisabled();
 await page.getByRole("button",{name:"Clear comparison"}).click();
 await expect(page.locator("table.gw-compare")).toHaveCount(0);
});

for(const [name,vp] of [["desktop",{width:1440,height:900}],["390px",{width:390,height:844}]] as const){
 test(`the open comparison is accessible with no horizontal scroll: ${name}`,async({page})=>{
  await page.setViewportSize(vp);await page.emulateMedia({reducedMotion:"reduce"});
  await wholeContradictions(page);
  await page.locator("ul.gw-units li").first().getByRole("button",{name:"Compare these findings"}).click();
  await expect(page.locator("table.gw-compare")).toBeVisible();
  for(const w of [vp.width,320]){
   await page.setViewportSize({width:w,height:vp.height});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`width ${w}`).toBe(true);
  }
  await page.setViewportSize(vp);
  const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(r.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))).toEqual([]);
 });
}

test("the 3D view shows the same concepts as the graph, with a keyboard list by scale that drives the inspector",async({page})=>{
 await open(page);
 const n2d=await page.locator("g.gw-node").count();
 if(!(await threeD(page)))return;
 const nav=page.getByRole("navigation",{name:"Concepts in the 3D view by scale"});
 await expect(nav).toBeVisible();
 await expect(nav).toContainText("Scale not recorded");
 const summaries=nav.locator("summary");
 for(let i=0;i<await summaries.count();i++)await summaries.nth(i).click();
 expect(await nav.getByRole("button").count()).toBe(n2d);
 await nav.getByRole("button").first().click();
 await expect(page.getByRole("complementary",{name:"Inspector"}).getByRole("heading",{name:"Biological scale"})).toBeVisible();
});

test("scale navigation narrows every view to the relationships touching a scale, and says where scale comes from",async({page})=>{
 await open(page);await table(page);
 const all=await page.locator("table.gw-table tbody tr").count();
 const scales=page.getByRole("radiogroup",{name:"Biological scale"});
 await expect(scales).toContainText("Scale not recorded");
 await expect(page.getByText("the published graph records no scale of its own").first()).toBeVisible();
 await scales.getByRole("radio",{name:/^Molecule/}).click();
 const mol=await page.locator("table.gw-table tbody tr").count();
 expect(mol).toBeGreaterThan(0);expect(mol).toBeLessThan(all);
 await scales.getByRole("radio",{name:"All scales"}).click();
 await expect(page.locator("table.gw-table tbody tr")).toHaveCount(all);
});

test("the scale panel reports how much is unplaced and never calls a cross-scale link a mechanism",async({page})=>{
 await open(page);
 const card=page.getByRole("region",{name:"Across biological scales"});
 await expect(card).toContainText(/Of \d+ relationships in view, \d+ join two concepts with a recorded scale, \d+ have one, and \d+ have none\./);
 await expect(card).toContainText("not a demonstrated mechanism that spans them");
 await expect(card.getByRole("list",{name:"Relationships that cross scales"})).toContainText("Organism ↔ Molecule");
});

test("a concept's inspector says when its scale is not recorded instead of guessing",async({page})=>{
 await open(page);await table(page);
 await page.getByRole("radiogroup",{name:"Biological scale"}).getByRole("radio",{name:/^Scale not recorded/}).click();
 await page.locator("table.gw-table tbody th button").first().click();
 const side=page.getByRole("complementary",{name:"Inspector"});
 await side.getByRole("button").first().click();
 await expect(side.getByRole("heading",{name:"Biological scale"})).toBeVisible();
 await expect(side).toContainText(/Scale not recorded|from the concept type|Not a biological level/);
 await expect(side).toContainText("Derived from the stated scale map, version 1.0.0");
});

const wholeSearch=async(page:Page,q:string)=>{
 await open(page);
 await page.getByLabel("Scope",{exact:true}).selectOption("all");
 await table(page);
 await page.getByPlaceholder("Search concepts…").fill(q);
};

test("a concept's evidence summary counts its sources, says what is not stated, and shows candidate identifiers as candidates",async({page})=>{
 await wholeSearch(page,"Rheumatoid arthritis");
 await page.locator("table.gw-table tbody tr").first().getByRole("button").click();
 const side=page.getByRole("complementary",{name:"Inspector"});
 await side.getByRole("button",{name:"Rheumatoid arthritis",exact:true}).first().click();
 await expect(side.getByRole("heading",{level:2,name:"Rheumatoid arthritis"})).toBeVisible();
 const ev=side.locator("section.gw-sec",{has:page.getByRole("heading",{name:"Evidence",exact:true})});
 await expect(ev).toContainText(/\d+ candidate relationships?/);
 await expect(ev).toContainText("Counted over the whole published graph");
 await expect(ev).toContainText("counts are not a measure of strength");
 const ids=side.locator("section.gw-sec",{has:page.getByRole("heading",{name:"Identifiers"})});
 await expect(ids).toContainText("MONDO:0008383");
 await expect(ids).toContainText("Candidate label match, unreviewed. Not a canonical identifier");
});

test("recorded passages show text only where rights allow, and the correction check is never implied",async({page})=>{
 await wholeSearch(page,"Anti-CCP");
 const rows=page.locator("table.gw-table tbody tr");
 await expect(rows.first()).toBeVisible();
 const side=page.getByRole("complementary",{name:"Inspector"});
 let found=false;
 for(let i=0;i<await rows.count()&&!found;i++){
  await rows.nth(i).getByRole("button").first().click();
  found=await side.getByText(/show recorded text/).count()>0;
 }
 expect(found).toBe(true);
 await expect(side).toContainText("human clearance of permitted use is pending");
 await expect(side).toContainText("Correction and retraction status not checked");
 await expect(side).toContainText("No absence of retraction or correction is inferred");
 await side.getByText(/Passage 1: show recorded text/).click();
 await expect(side.locator("blockquote").first()).toBeVisible();
});

test("a source with unverified rights shows locators only, never text",async({page})=>{
 await open(page);await table(page);
 await page.locator("table.gw-table tbody th button").first().click();
 const side=page.getByRole("complementary",{name:"Inspector"});
 await expect(side).toContainText("Usage rights unverified");
 await expect(side.locator("blockquote")).toHaveCount(0);
});

for(const [name,vp] of [["desktop",{width:1440,height:900}],["390px",{width:390,height:844}]] as const){
 test(`the concept evidence inspector is accessible with no horizontal scroll: ${name}`,async({page})=>{
  await page.setViewportSize(vp);await page.emulateMedia({reducedMotion:"reduce"});
  await wholeSearch(page,"Rheumatoid arthritis");
  await page.locator("table.gw-table tbody tr").first().getByRole("button").click();
  const side=page.getByRole("complementary",{name:"Inspector"});
  await side.getByRole("button",{name:"Rheumatoid arthritis",exact:true}).first().click();
  await expect(side.getByRole("heading",{name:"Evidence",exact:true})).toBeVisible();
  await side.getByText(/^Sources \(\d+\)$/).click();
  for(const w of [vp.width,320]){
   await page.setViewportSize({width:w,height:vp.height});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`width ${w}`).toBe(true);
  }
  await page.setViewportSize(vp);
  const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(r.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))).toEqual([]);
 });
}
const modeTo=async(page:Page,label:string)=>{await page.getByLabel("Mode",{exact:true}).selectOption({label})};

test("the hypothesis mode shows recorded questions as candidates, with what would count against them",async({page})=>{
 await open(page);await modeTo(page,"Hypothesis Graph");
 const card=page.getByRole("region",{name:/Candidate hypotheses \(\d+\)/});
 await expect(card).toContainText("A candidate question recorded with the graph, not a validated hypothesis.");
 const items=card.locator("ol.gw-qs > li");
 expect(await items.count()).toBeGreaterThan(0);
 await expect(items.first()).toContainText("What would count against it");
 await expect(items.first()).toContainText("Not validated");
 await expect(card).toContainText("It is not evidence for the prediction.");
 await expect(card.getByText("No chain of up to 4 reported relationships connects these two concepts in this view.").first()).toBeVisible();
});

test("tracing a question's association chain highlights it in the graph",async({page})=>{
 await open(page);await modeTo(page,"Hypothesis Graph");
 const chain=page.getByRole("list",{name:/Association chains for/}).first().getByRole("button").first();
 await chain.click();
 await expect(chain).toHaveAttribute("aria-pressed","true");
 expect(await page.locator('line.gw-edge[data-selected]').count()).toBeGreaterThan(0);
});

test("the experimental mode labels designs as candidates, never protocols, and the brief carries the caveats",async({page})=>{
 await open(page);await modeTo(page,"Experimental Graph");
 const card=page.getByRole("region",{name:/Candidate experiments \(\d+\)/});
 await expect(card).toContainText("A candidate design, not a validated protocol. It has not been reviewed, powered, costed or approved by an ethics body.");
 const first=card.locator("ol.gw-qs > li").first();
 await expect(first).toContainText("Not a protocol");
 await expect(first.getByRole("heading",{name:"Controls recorded with the question"})).toBeVisible();
 const [dl]=await Promise.all([page.waitForEvent("download"),first.getByRole("button",{name:"Download candidate brief"}).click()]);
 const text=await (await dl.createReadStream()).toArray().then(c=>Buffer.concat(c).toString("utf8"));
 expect(text).toContain("Status: A candidate design, not a validated protocol.");
 expect(text).toContain("What would count against it:");
 expect(text).toContain("Every relationship in the graph is an unreviewed candidate.");
});

test("the research gap mode shows the candidate next study and the questions that cite a gap",async({page})=>{
 await open(page);await modeTo(page,"Research Gap Graph");
 const gaps=page.getByRole("region",{name:/Recorded research gaps/});
 await expect(gaps).toContainText("Candidate next study:");
 await expect(gaps).toContainText("A suggested next study is a candidate, not a protocol.");
 await expect(gaps).toContainText(/Cited by \d+ recorded question/);
});

for(const [name,vp] of [["desktop",{width:1440,height:900}],["390px",{width:390,height:844}]] as const){
 for(const label of ["Hypothesis Graph","Experimental Graph"]){
  test(`${label} is accessible with no horizontal scroll: ${name}`,async({page})=>{
   await page.setViewportSize(vp);await page.emulateMedia({reducedMotion:"reduce"});
   await open(page);await modeTo(page,label);
   await expect(page.locator("ol.gw-qs > li").first()).toBeVisible();
   for(const w of [vp.width,320]){
    await page.setViewportSize({width:w,height:vp.height});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`width ${w}`).toBe(true);
   }
   await page.setViewportSize(vp);
   const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
   expect(r.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))).toEqual([]);
  });
 }
}

const withProfile=async(page:Page,p:Partial<OnboardingState>)=>{
 const raw=serializeState({...EMPTY_STATE,...p});
 await page.addInitScript(([k,v])=>{try{localStorage.setItem(k!,v!)}catch{}},[ONBOARDING_KEY,raw]);
};

test("a profile chooses only where the workspace opens, gives its reasons, and can be undone",async({page})=>{
 await withProfile(page,{primaryRole:"postdoc",objectives:["hypotheses"],primaryDomain:"neuroscience",secondaryDomains:["microbiome"]});
 await open(page);
 await expect(page.getByLabel("Mode",{exact:true})).toHaveValue("hypothesis");
 await expect(page.getByLabel("Scope",{exact:true})).toHaveValue("mic-neu");
 await page.getByText("Why the workspace opened here").click();
 const why=page.locator("details.gw-why");
 await expect(why).toContainText("you chose to generate testable hypotheses");
 await expect(why).toContainText("Scoped to Microbiome × Neuroscience because these are your primary and secondary domains.");
 await expect(why).toContainText("No relationship is hidden");
 await expect(page.getByRole("button",{name:"Reset",exact:true})).toHaveCount(0);
 await why.getByRole("button",{name:"Open the default view"}).click();
 await expect(page.getByLabel("Mode",{exact:true})).toHaveValue("mechanism");
 await expect(page.getByLabel("Scope",{exact:true})).toHaveValue("imm-mic");
});

test("a primary domain with no two-domain view opens the whole graph and says why",async({page})=>{
 await withProfile(page,{primaryRole:"postdoc",primaryDomain:"genomics"});
 await open(page);
 await expect(page.getByLabel("Scope",{exact:true})).toHaveValue("all");
 await page.getByText("Why the workspace opened here").click();
 await expect(page.locator("details.gw-why")).toContainText("there is no two-domain view for your primary domain yet");
});

test("asking for foundations shows plain-language guidance; without a profile nothing is personalised",async({page,browser})=>{
 await withProfile(page,{primaryRole:"undergraduate",methods:{...EMPTY_STATE.methods,level:"foundations"}});
 await open(page);
 await expect(page.locator(".gw-guide")).toContainText("Each dot is a concept");
 await expect(page.locator(".gw-guide")).toContainText("every relationship is an unreviewed candidate");
 await expect(page.getByLabel("Mode",{exact:true})).toHaveValue("atlas");
 const fresh=await browser.newPage();
 await open(fresh);
 await expect(fresh.locator("details.gw-why")).toHaveCount(0);
 await expect(fresh.locator(".gw-guide")).toHaveCount(0);
 await fresh.close();
});

for(const [name,vp] of [["desktop",{width:1440,height:900}],["390px",{width:390,height:844}]] as const){
 test(`the personalised opening is accessible with no horizontal scroll: ${name}`,async({page})=>{
  await page.setViewportSize(vp);await page.emulateMedia({reducedMotion:"reduce"});
  await withProfile(page,{primaryRole:"undergraduate",objectives:["conflicts"],primaryDomain:"immunology",methods:{...EMPTY_STATE.methods,level:"foundations"}});
  await page.goto("/workspace/graph");await expect(page.getByLabel("Mode",{exact:true})).toHaveValue("contradiction");
  await page.getByText("Why the workspace opened here").click();
  for(const w of [vp.width,320]){
   await page.setViewportSize({width:w,height:vp.height});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`width ${w}`).toBe(true);
  }
  await page.setViewportSize(vp);
  const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(r.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))).toEqual([]);
 });
}

const dock=(page:Page)=>page.getByRole("region",{name:"NEXUS"});

test("the NEXUS dock runs nothing until there is a selection, and says model interpretation is off",async({page})=>{
 await open(page);
 const d=dock(page);
 await expect(d.getByRole("button",{name:"Compare the selected findings"})).toBeDisabled();
 await expect(d.getByRole("button",{name:"List candidate chains"})).toBeDisabled();
 await expect(d.getByRole("button",{name:"Interpret with a language model"})).toBeDisabled();
 await expect(d).toContainText("Interpretation by a language model is not enabled.");
 await expect(d).toContainText("Add exactly two concepts.");
});

test("PARALLAX compares recorded disagreements as candidates and the record downloads with no approval",async({page})=>{
 await wholeContradictions(page);
 await page.locator("ul.gw-units li").first().getByRole("button",{name:"Compare these findings"}).click();
 const d=dock(page);
 await d.getByRole("button",{name:"Add compared findings"}).click();
 await expect(d.getByRole("list",{name:"NEXUS selection"}).locator("li")).not.toHaveCount(0);
 await d.getByRole("button",{name:"Compare the selected findings"}).click();
 const ans=d.getByRole("article",{name:"PARALLAX answer"});
 await expect(ans).toContainText("Candidate finding");await expect(ans).toContainText("No scientific approval");
 await expect(ans).toContainText("No pair is confirmed as a contradiction.");
 const [dl]=await Promise.all([page.waitForEvent("download"),d.getByRole("button",{name:"Download investigation record"}).click()]);
 const rec=JSON.parse(await (await dl.createReadStream()).toArray().then(c=>Buffer.concat(c).toString("utf8")));
 expect(rec.scientificApproval).toBe(false);
 expect(rec.responses.every((r:{modelBacked:boolean;graphPromotable:boolean})=>r.modelBacked===false&&r.graphPromotable===false)).toBe(true);
 const [p]=await Promise.all([page.waitForEvent("download"),ans.getByRole("button",{name:"Download as a proposal for review"}).first().click()]);
 const prop=JSON.parse(await (await p.createReadStream()).toArray().then(c=>Buffer.concat(c).toString("utf8")));
 expect(prop).toMatchObject({status:"proposed_unreviewed",requiresIndependentReview:true,approved:false});
 await expect(d).toContainText("Nothing was changed in the graph.");
});

test("HELIX lists candidate chains between two concepts or abstains, and VANTAGE separates gaps from coverage",async({page})=>{
 await open(page);
 const d=dock(page);
 const pick=async(i:number)=>{const n=page.locator("g.gw-node").nth(i);await n.focus();await n.press("Enter");await d.getByRole("button",{name:"Add selected concept"}).click()};
 await pick(0);await pick(1);
 await expect(d.getByLabel("Question")).toHaveValue(/What does the graph record between .+ and .+\?/);
 await d.getByRole("button",{name:"List candidate chains"}).click();
 const helix=d.getByRole("article",{name:"HELIX answer"});
 await expect(helix).toContainText(/Completed|Abstained/);
 await expect(helix).toContainText("Model-backed mechanism interpretation is not enabled");
 await d.getByRole("button",{name:"Separate gaps from coverage limits"}).click();
 await expect(d.getByRole("article",{name:"VANTAGE answer"})).toContainText("Neither shows what the wider literature contains.");
 await d.getByRole("button",{name:/^Remove /}).first().click();
 await expect(d.getByRole("button",{name:"List candidate chains"})).toBeDisabled();
});

test("a question that looks like a personal identifier is refused before any agent runs",async({page})=>{
 await open(page);
 const d=dock(page);
 await page.locator("g.gw-node").nth(0).click();await d.getByRole("button",{name:"Add selected concept"}).click();
 await d.getByLabel("Question").fill("Patient john.smith@example.com seen on 12/03/2024");
 await expect(d.getByText("The question appears to contain personal or clinical identifiers and cannot be used")).toBeVisible();
});

for(const [name,vp] of [["desktop",{width:1440,height:900}],["390px",{width:390,height:844}]] as const){
 test(`the NEXUS dock with answers is accessible with no horizontal scroll: ${name}`,async({page})=>{
  await page.setViewportSize(vp);await page.emulateMedia({reducedMotion:"reduce"});
  await wholeContradictions(page);
  await page.locator("ul.gw-units li").first().getByRole("button",{name:"Compare these findings"}).click();
  const d=dock(page);
  await d.getByRole("button",{name:"Add compared findings"}).click();
  await d.getByRole("button",{name:"Compare the selected findings"}).click();
  await d.getByRole("button",{name:"Separate gaps from coverage limits"}).click();
  await expect(d.getByRole("article",{name:"VANTAGE answer"})).toBeVisible();
  for(const w of [vp.width,320]){
   await page.setViewportSize({width:w,height:vp.height});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`width ${w}`).toBe(true);
  }
  await page.setViewportSize(vp);
  const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(r.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))).toEqual([]);
 });
}
