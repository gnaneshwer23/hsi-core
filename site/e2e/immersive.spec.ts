import AxeBuilder from "@axe-core/playwright";
import {expect,test,type Page} from "@playwright/test";

const open=async(page:Page)=>{await page.goto("/workspace/immersive");await expect(page.getByRole("heading",{level:1})).toHaveText("Gut–immune–brain axis")};
const to2d=async(page:Page)=>{await page.getByRole("radio",{name:"2D map"}).click();await expect(page.locator("svg.im-map")).toBeVisible()};

test("the environment states plainly that it is illustrative and offers no live claims",async({page})=>{
 await open(page);
 await expect(page.getByRole("note").first()).toContainText("not verified findings");
 await expect(page.getByText("no model is connected").first()).toBeVisible();
 for(const n of ["Investigations","Hypotheses","Experiments","Collaboration"])await expect(page.locator(".im-planned",{hasText:n})).toContainText("Planned");
});

test("the 2D map is a keyboard-operable fallback with the same entities",async({page})=>{
 await open(page);await to2d(page);
 const nodes=page.locator("g.im-node");
 expect(await nodes.count()).toBeGreaterThan(8);
 await nodes.first().focus();await page.keyboard.press("Enter");
 await expect(nodes.first()).toHaveAttribute("aria-pressed","true");
 await expect(page.locator("#im-insp")).not.toHaveText("Inspector");
 await page.keyboard.press("Enter");
 await expect(page.locator("#im-insp")).toHaveText("Inspector");
});

test("selecting an entity shows its evidence status, relations and unresolved variables, without approving anything",async({page})=>{
 await open(page);await to2d(page);
 await page.getByLabel("Find a scientific entity").selectOption({label:"Intestinal barrier"});
 await expect(page.locator("#im-insp")).toHaveText("Intestinal barrier");
 const side=page.getByRole("complementary",{name:"Contextual intelligence"});
 await expect(side).toContainText("Unreviewed candidate. Nothing here is approved.");
 await expect(side).toContainText("Unresolved:");
 await expect(side).toContainText("None. No account is connected.");
});

test("layers and scales change what is emphasised and never remove entities",async({page})=>{
 await open(page);await to2d(page);
 const dimmed=()=>page.locator("g.im-node").evaluateAll(els=>els.filter(e=>Number(e.getAttribute("opacity"))<1).length);
 const total=await page.locator("g.im-node").count();
 await page.getByRole("radio",{name:"Conflicts"}).click();
 const inConflicts=await dimmed();expect(inConflicts).toBeGreaterThan(0);
 await page.getByRole("radio",{name:"Mechanisms"}).click();
 expect(await dimmed()).toBeLessThan(inConflicts);
 await page.getByRole("radio",{name:"Cell",exact:true}).click();
 expect(await dimmed()).toBeGreaterThan(0);
 expect(await page.locator("g.im-node").count()).toBe(total);
});

test("the companion answers from the atlas, needs a selection, and drives the canvas",async({page})=>{
 await open(page);await to2d(page);
 const ask=page.getByRole("button",{name:"Why is this contested?"});
 await expect(ask).toBeDisabled();
 await page.getByLabel("Find a scientific entity").selectOption({label:"Intestinal barrier"});
 await expect(ask).toBeEnabled();await ask.click();
 await expect(page.getByRole("list",{name:"Conversation"})).toContainText("Unresolved:");
 await expect(page.getByRole("radio",{name:"Conflicts"})).toHaveAttribute("aria-checked","true");
 await page.getByRole("button",{name:"Trace the gut barrier to the brain."}).click();
 await expect(page.getByRole("list",{name:"Conversation"})).toContainText("weakest link");
 await page.getByRole("button",{name:"Clear highlight"}).click();
 await expect(page.getByRole("button",{name:"Clear highlight"})).toHaveCount(0);
 await expect(page.getByText("no model is connected").first()).toBeVisible();
});

test("onboarding answers choose where the environment opens",async({page})=>{
 await page.goto("/onboarding/role");
 await page.getByRole("radio",{name:/Postdoctoral researcher/}).click();
 await page.getByRole("button",{name:"Continue"}).click();await page.getByRole("button",{name:"Skip for now"}).click();
 await page.getByRole("radio",{name:"Primary"}).first().click();await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("checkbox",{name:/Investigate conflicting evidence/}).click();await page.getByRole("button",{name:"Continue"}).click();
 await page.goto("/workspace/immersive");
 await expect(page.getByRole("radio",{name:"Conflicts"})).toHaveAttribute("aria-checked","true");
 await expect(page.getByText("Postdoctoral researcher").first()).toBeVisible();
});

test("a domain with no environment yet is said to be planned",async({page})=>{
 await page.goto("/onboarding/role");
 await page.getByRole("radio",{name:/PhD researcher/}).click();
 await page.getByRole("button",{name:"Continue"}).click();await page.getByRole("button",{name:"Skip for now"}).click();
 await page.getByRole("radio",{name:"Primary"}).nth(3).click(); // genomics
 await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("checkbox",{name:/Conduct literature reviews/}).click();await page.getByRole("button",{name:"Continue"}).click();
 await page.goto("/workspace/immersive");
 await expect(page.getByText("environment is planned")).toBeVisible();
});

test("reduced motion and a narrow screen both get the 2D map without loading 3D",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await open(page);
 await expect(page.locator("svg.im-map")).toBeVisible();
 await expect(page.locator("canvas")).toHaveCount(0);
});

test("the 3D view loads on request and survives selection, or reports that it cannot",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(String(e)));
 await open(page);
 await page.getByRole("radio",{name:"3D",exact:true}).click();
 await expect(page.locator("canvas").or(page.getByText("Loading the 3D environment…"))).toBeVisible();
 await page.getByLabel("Find a scientific entity").selectOption({label:"Butyrate"});
 await expect(page.locator("#im-insp")).toHaveText("Butyrate");
 await page.getByRole("radio",{name:"2D map"}).click();
 await expect(page.locator("svg.im-map")).toBeVisible();
 expect(errors).toEqual([]);
});

for(const [name,vp] of [["desktop",{width:1440,height:900}],["390px",{width:390,height:844}]] as const){
 test(`accessible with an entity selected, no horizontal scroll: ${name}`,async({page})=>{
  await page.setViewportSize(vp);await page.emulateMedia({reducedMotion:"reduce"});
  await open(page);
  await page.getByLabel("Find a scientific entity").selectOption({label:"Intestinal barrier"});
  await page.getByRole("button",{name:"Why is this contested?"}).click();
  for(const w of [vp.width,320]){
   await page.setViewportSize({width:w,height:vp.height});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`width ${w}`).toBe(true);
  }
  await page.setViewportSize(vp);
  const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 });
}
