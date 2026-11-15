import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";

test("ledger: a hypothesis cannot be tested without a falsifier; outcome needs a real note; persists; axe is clean",async({page})=>{
 await page.goto("/research/ledger");
 await expect(page.getByText("Your ledger is empty")).toBeVisible();
 await page.getByLabel("Hypothesis (one sentence)").fill("Butyrate exposure mediates better glycaemic control in people with type 2 diabetes.");
 await page.getByRole("button",{name:"Add to ledger"}).click();
 await expect(page.getByText("Added to your ledger.")).toBeVisible();
 const card=page.getByRole("list",{name:"Hypotheses"}).getByRole("listitem").first();
 await expect(card).toContainText("Unvalidated hypothesis");
 await expect(card).toContainText("Not yet testable: needs a prediction, an experiment, a falsifier");
 await card.getByRole("button",{name:"Testing",exact:true}).click();
 await expect(card.getByRole("alert")).toContainText("falsifier");
 await card.getByText("Edit the test plan").click();
 await card.getByLabel("Prediction if true").fill("Higher butyrate, lower HbA1c");
 await card.getByLabel("A feasible experiment").fill("Matched cohort comparison");
 await card.getByLabel("What result would show it is false").fill("No HbA1c difference after adjustment");
 await card.getByRole("button",{name:"Save test plan"}).click();
 await expect(card).not.toContainText("Not yet testable");
 await card.getByRole("button",{name:"Testing",exact:true}).click();
 await expect(card.locator(".gr-status")).toHaveText("Testing");
 await card.getByRole("button",{name:"Record outcome"}).click();
 await expect(card.getByRole("alert")).toContainText("not a validation");
 await card.getByLabel(/What did you observe/).fill("No difference seen in a small pilot subset");
 await card.getByRole("button",{name:"Record outcome"}).click();
 await expect(card).toContainText("Inconclusive");
 await page.reload();
 const again=page.getByRole("list",{name:"Hypotheses"}).getByRole("listitem").first();
 await expect(again.locator(".gr-status")).toHaveText("Testing");
 await expect(again).toContainText("Inconclusive");
 await again.getByText(/^History/).click();
 await expect(again).toContainText("outcome");
 const r=await new AxeBuilder({page}).analyze();
 expect(r.violations.filter(v=>["serious","critical"].includes(v.impact??""))).toEqual([]);
});

test("ledger: filter by status and an honest empty state",async({page})=>{
 await page.goto("/research/ledger");
 await page.getByLabel("Hypothesis (one sentence)").fill("A second hypothesis about gut microbiome metabolites.");
 await page.getByRole("button",{name:"Add to ledger"}).click();
 await page.getByRole("group",{name:"Filter by status"}).getByRole("button",{name:"Retired"}).click();
 await expect(page.getByText("No hypotheses with this status.")).toBeVisible();
 await page.getByLabel("Hypothesis (one sentence)").fill("short");
 await page.getByRole("button",{name:"Add to ledger"}).click();
 await expect(page.getByText("at least 10 characters")).toBeVisible();
});
