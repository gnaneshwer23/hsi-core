import AxeBuilder from "@axe-core/playwright";
import {expect,test,type Page} from "@playwright/test";

const STEPS=["/onboarding","/onboarding/role","/onboarding/identity","/onboarding/science","/onboarding/objectives","/onboarding/methods","/onboarding/resources","/onboarding/preferences","/onboarding/review"];

async function seed(page:Page){
 await page.goto("/onboarding/role");
 await page.getByRole("radio",{name:/PhD researcher/}).click();
 await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("button",{name:"Skip for now"}).click();
 await page.getByRole("radio",{name:"Primary"}).first().click();
 await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("checkbox",{name:/Investigate conflicting evidence/}).click();
 await page.getByRole("button",{name:"Continue"}).click();
}

test("required steps block with a clear message, optional steps can be skipped",async({page})=>{
 await page.goto("/onboarding/role");
 await page.getByRole("button",{name:"Continue"}).click();
 await expect(page.getByRole("alert").filter({hasText:"Choose the role"}).first()).toBeVisible();
 await expect(page).toHaveURL(/\/onboarding\/role$/);
 await page.getByRole("radio",{name:/Undergraduate student/}).click();
 await page.getByRole("button",{name:"Continue"}).click();
 await expect(page).toHaveURL(/\/identity$/);
 await expect(page.getByRole("button",{name:"Skip for now"})).toBeVisible();
 await page.getByRole("button",{name:"Skip for now"}).click();
 await expect(page).toHaveURL(/\/science$/);
 await page.getByRole("button",{name:"Continue"}).click();
 await expect(page.getByRole("alert").filter({hasText:"Choose a primary domain"}).first()).toBeVisible();
});

test("welcome labels unavailable sign-in methods as planned and does not offer to connect them",async({page})=>{
 await page.goto("/onboarding");
 await expect(page.getByRole("heading",{level:1})).toContainText("Science begins");
 for(const name of ["Google","ORCID","Institutional SSO"]){
  const row=page.locator("li",{hasText:name}).first();
  await expect(row).toContainText("Planned");
  await expect(row.getByRole("button")).toHaveCount(0);
 }
 await expect(page.getByText("does not grant access").first()).toBeVisible();
});

test("a full journey reaches a plan built only from the answers, with honest statements",async({page})=>{
 await seed(page);
 await page.getByRole("button",{name:"Skip for now"}).click(); // methods
 await page.getByRole("button",{name:"Continue"}).click(); // resources
 await page.getByRole("button",{name:"Continue"}).click(); // preferences
 await expect(page).toHaveURL(/\/review$/);
 await expect(page.getByRole("heading",{level:1})).toContainText("workspace we would build");
 await expect(page.getByText("PhD researcher").first()).toBeVisible();
 await expect(page.getByText("Nothing has been created on a server")).toBeVisible();
 await expect(page.getByText("does not grant access to any group")).toBeVisible();
 await page.getByRole("button",{name:"Finish setup"}).click();
 await expect(page.getByRole("heading",{name:"Your setup is saved."})).toBeVisible();
 await expect(page.getByRole("link",{name:/Create an account/})).toBeVisible();
});

test("answers persist across reload and the six domains are all offered equally",async({page})=>{
 await seed(page);
 await page.goto("/onboarding/science");
 const cards=page.locator(".ob-domain");
 await expect(cards).toHaveCount(6);
 const boxes=await cards.evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]}));
 expect(new Set(boxes.map(b=>b.join("x"))).size).toBe(1);
 await page.reload();
 await expect(page.getByRole("radio",{name:"Primary"}).first()).toHaveAttribute("aria-checked","true");
});

test("the institutional path asks for an organisation and never implies access",async({page})=>{
 await page.goto("/onboarding");
 await page.getByRole("button",{name:/institutional path/}).click();
 await page.getByRole("radio",{name:/Institution administrator/}).click();
 await page.getByRole("button",{name:"Continue"}).click();
 await expect(page).toHaveURL(/\/institution$/);
 await page.getByRole("button",{name:"Continue"}).click();
 await expect(page.getByRole("alert").filter({hasText:"organisation"}).first()).toBeVisible();
 await expect(page.getByText("does not give anyone access")).toBeVisible();
 await page.getByLabel("Organisation name").fill("Example University");
 await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("button",{name:"Skip for now"}).click(); // identity
 await expect(page).toHaveURL(/\/science$/);
});

test("identity: sample publications are labelled, a bad ORCID iD is rejected, the CV is never read",async({page})=>{
 await page.goto("/onboarding/identity");
 await page.getByRole("radio",{name:/Preview a publication import/}).click();
 await page.getByRole("button",{name:"Show sample records"}).click();
 await expect(page.getByText("Sample record A").first()).toBeVisible();
 await expect(page.getByText("They are not your publications")).toBeVisible();
 await page.getByRole("radio",{name:/Add your ORCID iD/}).click();
 await page.getByLabel(/ORCID iD/).fill("0000-0002-1825-0098");
 await page.getByRole("button",{name:"Continue"}).click();
 await expect(page.getByRole("alert").filter({hasText:"not a valid ORCID"}).first()).toBeVisible();
 await page.getByLabel(/ORCID iD/).fill("0000-0002-1825-0097");
 await expect(page.locator(".ob-proposed").getByText("Not verified")).toBeVisible();
 await page.getByRole("radio",{name:/Preview a CV upload/}).click();
 let uploaded=false;page.on("request",r=>{if(r.method()==="POST")uploaded=true});
 await page.locator('input[type=file]').setInputFiles({name:"cv.pdf",mimeType:"application/pdf",buffer:Buffer.from("x")});
 await expect(page.getByText("Selected: cv.pdf")).toBeVisible();
 expect(uploaded).toBe(false);
});

test("objectives adapt to the role and warn about identifying text",async({page})=>{
 await page.goto("/onboarding/role");
 await page.getByRole("radio",{name:/Professor or principal investigator/}).click();
 await page.getByRole("button",{name:"Continue"}).click();await page.getByRole("button",{name:"Skip for now"}).click();
 await page.getByRole("radio",{name:"Primary"}).nth(2).click();await page.getByRole("button",{name:"Continue"}).click();
 await expect(page.getByRole("heading",{name:/Suggested for professor/i})).toBeVisible();
 await expect(page.getByRole("checkbox")).toHaveCount(12);
 await page.getByLabel(/research question/i).fill("Patient 943 476 5919 responded");
 await expect(page.getByText(/may contain an identifier/)).toBeVisible();
});

test("context and memory pages separate data classes and default to private",async({page})=>{
 await seed(page);
 await page.getByRole("button",{name:"Skip for now"}).click();
 await expect(page.getByRole("heading",{name:"Public metadata"})).toBeVisible();
 await expect(page.getByRole("heading",{name:"Your private documents"})).toBeVisible();
 await expect(page.getByRole("heading",{name:"Restricted research data"})).toBeVisible();
 await expect(page.getByText(/does not accept them/)).toBeVisible();
 await page.getByRole("button",{name:"Continue"}).click();
 await expect(page.getByRole("radio",{name:/Private memory/})).toHaveAttribute("aria-checked","true");
 await expect(page.getByRole("radio",{name:/Private to me/})).toHaveAttribute("aria-checked","true");
 await expect(page.getByText("Access is enforced by your administrator")).toBeVisible();
});

for(const path of STEPS){
 test(`accessible and without horizontal scroll at 390px: ${path}`,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:"reduce"}); // axe must not sample mid-fade colours
  if(path!=="/onboarding")await seed(page);
  await page.goto(path);
  await expect(page.getByRole("heading",{level:1})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 });
}

test("focus moves to the step heading and progress is exposed",async({page})=>{
 await page.goto("/onboarding/role");
 await expect(page.getByRole("heading",{level:1})).toBeFocused();
 await expect(page.getByRole("navigation",{name:"Setup progress"}).locator("[aria-current=step]")).toContainText("Role");
 await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow","2");
});

test("finishing setup leads to the graph workspace, which opens where the answers point",async({page})=>{
 await seed(page);
 await page.getByRole("button",{name:"Skip for now"}).click();
 await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("button",{name:"Continue"}).click();
 await expect(page.getByRole("link",{name:"Contradiction analysis"})).toHaveAttribute("href","/workspace/graph");
 await page.getByRole("button",{name:"Finish setup"}).click();
 await expect(page.getByText("The Living Intelligence Graph runs on the published candidate graph")).toBeVisible();
 await page.getByRole("link",{name:"Open the Living Intelligence Graph"}).click();
 await expect(page).toHaveURL(/\/workspace\/graph$/);
 await expect(page.getByRole("heading",{level:1,name:"Living Intelligence Graph"})).toBeVisible();
 await expect(page.getByLabel("Mode",{exact:true})).toHaveValue("contradiction");
 await page.getByText("Why the workspace opened here").click();
 await expect(page.getByText("Opened in this mode because you chose to investigate conflicting evidence.")).toBeVisible();
});
