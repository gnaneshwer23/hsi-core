import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";

test("loop: gap to hypothesis to synthetic cohort result attached back, without changing status or outcome",async({page})=>{
 await page.goto("/research/gaps");
 const list=page.getByRole("list",{name:"Gaps"}).getByRole("listitem");
 await expect(list.first()).toBeVisible();
 await expect(list.first()).toContainText("No hypothesis in your ledger is linked to this gap");
 await list.first().getByRole("link",{name:"Add a hypothesis for this gap"}).click();

 await expect(page.getByRole("heading",{level:1,name:"Hypothesis Ledger"})).toBeVisible();
 await expect(page.locator(".hl-gaps input[type=checkbox]:checked")).toHaveCount(1);
 await page.getByLabel("Hypothesis (one sentence)").fill("Higher human butyrate exposure is associated with better glycaemic control.");
 await page.getByRole("button",{name:"Add to ledger"}).click();
 const card=page.getByRole("list",{name:"Hypotheses"}).getByRole("listitem").first();
 await expect(card).toContainText("Linked gaps:");
 await expect(card.getByRole("link",{name:/Explore this definition/})).toHaveCount(0);
 await card.getByLabel("Synthetic cohort definition to explore (illustrative)").selectOption({label:"Adults with raised HbA1c (illustrative)"});
 await card.getByRole("link",{name:/Explore this definition on the synthetic cohort/}).click();

 await expect(page.getByRole("note").filter({hasText:"Exploring for your hypothesis"})).toContainText("butyrate exposure");
 await page.getByRole("button",{name:/Evaluate cohort/}).click();
 await expect(page.getByRole("button",{name:/Attach to/})).toHaveCount(0);
 await page.getByRole("button",{name:/Release with reviewer approval/}).click();
 await expect(page.getByRole("heading",{name:"Released aggregate"})).toBeVisible();
 await page.getByRole("button",{name:/Attach to/}).click();
 await expect(page.getByText(/Attached to your hypothesis as a synthetic observation/)).toBeVisible();
 await page.getByRole("button",{name:/Attach to/}).click();
 await expect(page.getByText("already attached")).toBeVisible();

 await page.goto("/research/ledger");
 const back=page.getByRole("list",{name:"Hypotheses"}).getByRole("listitem").first();
 await expect(back.locator(".gr-status")).toHaveText("Proposed");
 await expect(back).toContainText("Synthetic cohort observations (1)");
 await expect(back).toContainText("not evidence");
 await expect(back).not.toContainText("Consistent with my observation");

 await page.goto("/research/gaps");
 await expect(page.getByRole("list",{name:"Gaps"}).getByRole("listitem").first()).toContainText("Hypotheses in your ledger linked to this gap (1)");
 const r=await new AxeBuilder({page}).analyze();
 expect(r.violations.filter(v=>["serious","critical"].includes(v.impact??""))).toEqual([]);
});

test("cohort page: a result cannot be attached to a hypothesis linked to a different definition",async({page})=>{
 await page.goto("/research/ledger");
 await page.getByLabel("Hypothesis (one sentence)").fill("A hypothesis linked to the other illustrative definition.");
 await page.getByRole("button",{name:"Add to ledger"}).click();
 const card=page.getByRole("list",{name:"Hypotheses"}).getByRole("listitem").first();
 await card.getByLabel("Synthetic cohort definition to explore (illustrative)").selectOption({label:"Type 2 diabetes subset (illustrative)"});
 const href=await card.getByRole("link",{name:/Explore this definition/}).getAttribute("href");
 await page.goto(href!.replace("t2d-glycaemic-response-illustrative","raised-hba1c-adults-illustrative"));
 await expect(page.getByRole("note").filter({hasText:"Exploring for your hypothesis"})).toContainText("different definition");
 await page.getByRole("button",{name:/Evaluate cohort/}).click();
 await page.getByRole("button",{name:/Release with reviewer approval/}).click();
 await expect(page.getByRole("button",{name:/Attach to/})).toBeDisabled();
});
