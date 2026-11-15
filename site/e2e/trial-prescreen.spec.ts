import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";

test("pre-screening: banner, computable vs human-review criteria, gate, categories never say eligible, hidden small groups, audit; axe is clean",async({page})=>{
 await page.goto("/research/prescreen");
 await expect(page.getByRole("note")).toContainText("not an eligibility decision");
 await expect(page.getByRole("note")).toContainText("uses no AI model");
 await expect(page.getByRole("heading",{name:"Needs a person"})).toBeVisible();
 await expect(page.getByText("Able to give informed consent").first()).toBeVisible();
 const run=page.getByRole("button",{name:/Pre-screen 200 synthetic profiles/});
 await expect(run).toBeEnabled();
 await expect(page.getByRole("button",{name:"Request counts without approval"})).toBeDisabled();
 await run.click();
 await expect(page.getByText(/counts are held inside the plane/)).toBeVisible();
 await page.getByRole("button",{name:"Request counts without approval"}).click();
 await expect(page.getByText("Refused: A release reviewer must approve")).toBeVisible();
 await expect(page.getByText("Pre-screening result")).toHaveCount(0);
 await page.getByRole("button",{name:/Release with reviewer approval/}).click();
 await expect(page.getByText(/Released\. A reviewer approved/)).toBeVisible();
 await expect(page.getByText("Possibly eligible, needs clinical-team review")).toBeVisible();
 await expect(page.getByText("Not eligible on recorded data")).toBeVisible();
 await expect(page.getByText("Not enough information on recorded data")).toBeVisible();
 await expect(page.getByText(/not an enrolment forecast/)).toBeVisible();
 await expect(page.getByRole("table",{name:"Criteria that exclude the most profiles"})).toBeVisible();
 await expect(page.locator("body")).not.toContainText(/SYN-P-\d{6}/);
 await expect(page.getByText("Chain verifies.")).toBeVisible();
 await expect(page.getByRole("table",{name:"Audit entries"}).getByRole("row")).toHaveCount(4); // header + evaluated + refusal + release

 await page.getByRole("button",{name:/Immune:/}).click();
 await page.getByRole("button",{name:/Pre-screen 200/}).click();
 await page.getByRole("button",{name:/Release with reviewer approval/}).click();
 await expect(page.getByText(/hidden to protect small groups, so no feasibility figure/)).toBeVisible();
 await expect(page.locator(".co-sup").first()).toBeVisible();
 const r=await new AxeBuilder({page}).analyze();
 expect(r.violations.filter(v=>["serious","critical"].includes(v.impact??""))).toEqual([]);
});

test("pre-screening refuses an altered synthetic cohort file",async({page})=>{
 await page.route("**/clinical-plane/synthetic-cohort.v1.json",async r=>{const resp=await r.fetch();const j=await resp.json();j.patients[0].age=1;await r.fulfill({json:j})});
 await page.goto("/research/prescreen");
 await expect(page.getByRole("alert")).toContainText("could not be loaded or verified");
 await expect(page.getByRole("button",{name:/Pre-screen/})).toBeDisabled();
});
