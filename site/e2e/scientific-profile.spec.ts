import AxeBuilder from "@axe-core/playwright";
import {expect,test,type Page} from "@playwright/test";

async function setup(page:Page){
 await page.goto("/onboarding/role");
 await page.getByRole("radio",{name:/PhD researcher/}).click();
 await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("button",{name:"Skip for now"}).click();
 await page.getByRole("radio",{name:"Primary"}).first().click();
 await page.getByRole("button",{name:"Continue"}).click();
 await page.getByRole("checkbox",{name:/Conduct literature reviews/}).click();
 await page.getByRole("button",{name:"Continue"}).click();
}

test("an empty profile says nothing is set up and offers setup",async({page})=>{
 await page.goto("/settings/scientific-profile");
 await expect(page.getByRole("heading",{level:1})).toHaveText("Your scientific profile");
 await expect(page.getByText("You have not set anything up yet")).toBeVisible();
 await expect(page.getByText("Stored on this device only").first()).toBeVisible();
 await expect(page.getByText("Choose a role and a primary domain to preview the payload")).toBeVisible();
});

test("the role can be changed at any time and the reasons follow the answers",async({page})=>{
 await setup(page);
 await page.goto("/settings/scientific-profile");
 await expect(page.locator("#summary")).toContainText("PhD researcher");
 await expect(page.locator("#why")).toContainText("Because you chose: Conduct literature reviews");
 await page.locator("#role").getByRole("radio",{name:"Professor or principal investigator"}).click();
 await expect(page.locator("#summary")).toContainText("Professor or principal investigator");
 await expect(page.locator("#why li").first()).toBeVisible();
 await page.reload();
 await expect(page.locator("#summary")).toContainText("Professor or principal investigator");
});

test("objectives, interests, expertise and projects are editable and persist",async({page})=>{
 await setup(page);
 await page.goto("/settings/scientific-profile");
 await page.locator("#objectives").getByRole("checkbox",{name:"Investigate conflicting evidence"}).click();
 await page.locator("#why").getByText("Because you chose: Investigate conflicting evidence").first().waitFor();
 await page.getByLabel("Name",{exact:true}).fill("IL-10");
 await page.getByRole("button",{name:"Add",exact:true}).click();
 await expect(page.getByRole("list",{name:"Your interests"})).toContainText("IL-10");
 await page.getByLabel("Areas of expertise").fill("T-cell biology");
 await page.getByLabel("Project name").fill("Barrier study");
 await page.getByRole("button",{name:"Add project"}).click();
 await page.reload();
 await expect(page.getByRole("list",{name:"Your interests"})).toContainText("IL-10");
 await expect(page.getByLabel("Areas of expertise")).toHaveValue("T-cell biology");
 await expect(page.locator("#projects")).toContainText("Barrier study");
 await page.getByRole("button",{name:"Remove Barrier study"}).click();
 await expect(page.locator("#projects")).toContainText("No projects");
});

test("publications: nothing imported, ORCID is format-checked and never called verified",async({page})=>{
 await page.goto("/settings/scientific-profile");
 await expect(page.locator("#publications")).toContainText("Imported publications: none");
 await page.getByLabel(/ORCID iD/).fill("0000-0002-1825-0098");
 await expect(page.getByText("That is not a valid ORCID iD.")).toBeVisible();
 await page.getByLabel(/ORCID iD/).fill("0000-0002-1825-0097");
 await expect(page.getByText(/Not verified with ORCID/)).toBeVisible();
});

test("sharing is inspected: a group or institution preference never becomes effective access",async({page})=>{
 await setup(page);
 await page.goto("/settings/scientific-profile");
 await page.getByRole("radio",{name:"Institution",exact:true}).click();
 const row=page.locator("#memory tbody tr").first();
 await expect(row).toContainText("Institution");
 await expect(row).toContainText("No institutional access is provisioned");
 await expect(page.locator("#memory")).toContainText("Not provisioned");
});

test("external connections: interest only, none connected",async({page})=>{
 await page.goto("/settings/scientific-profile");
 await expect(page.locator("#connections")).toContainText("Connected: none");
 await page.locator("#connections").getByRole("checkbox").first().click();
 await expect(page.locator("#connections").getByRole("checkbox").first()).toHaveAttribute("aria-checked","true");
});

test("what would be sent is shown, has no access fields, and is blocked for identifying text",async({page})=>{
 await setup(page);
 await page.goto("/settings/scientific-profile");
 const pre=page.getByLabel("Profile payload preview");
 await expect(pre).toContainText("hsi-scientific-profile-extension-1");
 await expect(page.getByText("Access-granting fields in this payload: none")).toBeVisible();
 await expect(page.locator("#data").getByText("Planned").first()).toBeVisible();
 const dl=page.waitForEvent("download");
 await page.getByRole("button",{name:"Download a copy (JSON)"}).click();
 expect((await dl).suggestedFilename()).toBe("hsi-scientific-profile.json");
 await page.locator("#objectives").getByLabel("Current research question").fill("Patient 943 476 5919 responded");
 await expect(page.getByText(/looks like personal or patient information/)).toBeVisible();
 await expect(pre).toHaveCount(0);
});

test("removing the setup needs a confirmation and clears everything",async({page})=>{
 await setup(page);
 await page.goto("/settings/scientific-profile");
 await page.getByRole("button",{name:"Remove setup…"}).click();
 await page.getByRole("button",{name:"Keep it"}).click();
 await expect(page.locator("#summary")).toContainText("PhD researcher");
 await page.getByRole("button",{name:"Remove setup…"}).click();
 await page.getByRole("button",{name:"Yes, remove it"}).click();
 await expect(page.getByText("You have not set anything up yet")).toBeVisible();
 await page.reload();
 await expect(page.getByText("You have not set anything up yet")).toBeVisible();
});

test("institutional onboarding records departments and data classes without implying access",async({page})=>{
 await page.goto("/onboarding");
 await page.getByRole("button",{name:/institutional path/}).click();
 await page.getByRole("radio",{name:/Institution administrator/}).click();
 await page.getByRole("button",{name:"Continue"}).click();
 await page.getByLabel("Organisation name").fill("Example University");
 await page.getByLabel("Name",{exact:true}).fill("Immunology");
 await page.getByRole("button",{name:"Add",exact:true}).click();
 await expect(page.getByRole("list",{name:"Departments"})).toContainText("Immunology");
 await page.getByRole("checkbox",{name:"Restricted research data"}).click();
 await expect(page.getByText("A plan, not an authorisation")).toBeVisible();
 await page.getByRole("button",{name:"Continue"}).click();
 await page.goto("/settings/scientific-profile");
 await expect(page.getByLabel("Profile payload preview")).toHaveCount(0); // no domain chosen yet
});

for(const [name,viewport] of [["desktop",{width:1280,height:900}],["390px",{width:390,height:844}]] as const){
 test(`settings is accessible with answers present, no horizontal scroll: ${name}`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.emulateMedia({reducedMotion:"reduce"});
  await setup(page);
  await page.goto("/settings/scientific-profile");
  await expect(page.getByRole("heading",{level:1})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  const r=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 });
}
