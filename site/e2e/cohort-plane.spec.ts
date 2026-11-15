import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";

test("cohort page: synthetic banner, evaluate, three gate outcomes, suppression, audit chain and tamper detection; axe is clean",async({page})=>{
 await page.goto("/research/cohort");
 await expect(page.getByRole("note")).toContainText("Synthetic data only");
 await expect(page.getByText("Linked to graph gap")).toBeVisible();
 const evalBtn=page.getByRole("button",{name:/Evaluate cohort \(200 synthetic profiles\)/});
 await expect(evalBtn).toBeEnabled();
 await expect(page.getByRole("button",{name:"Request release without approval"})).toBeDisabled();
 await evalBtn.click();
 await expect(page.getByText(/Held inside the plane, not released/)).toBeVisible();
 await page.getByRole("button",{name:"Request release without approval"}).click();
 await expect(page.getByText("Refused: A release reviewer must approve")).toBeVisible();
 await page.getByRole("button",{name:"Attempt to release patient ids"}).click();
 await expect(page.getByText(/Refused: The payload contained an identifier/)).toBeVisible();
 await expect(page.getByRole("heading",{name:"Released aggregate"})).toHaveCount(0);
 await page.getByRole("button",{name:/Release with reviewer approval/}).click();
 await expect(page.getByText(/Released\. The reviewer approved/)).toBeVisible();
 await expect(page.getByRole("heading",{name:"Released aggregate"})).toBeVisible();
 await expect(page.getByText("suppressed").first()).toBeVisible();
 await expect(page.locator("body")).not.toContainText(/SYN-P-\d{6}/);
 await expect(page.getByText("Chain verifies.")).toBeVisible();
 await expect(page.getByRole("table",{name:"Audit entries"}).getByRole("row")).toHaveCount(5); // header + evaluated + 2 refusals + release
 await page.getByRole("button",{name:/Simulate tampering/}).click();
 await expect(page.getByText(/Chain broken at entry 1/)).toBeVisible();
 await page.getByRole("button",{name:/Undo simulated tampering/}).click();
 await expect(page.getByText("Chain verifies.")).toBeVisible();
 const r=await new AxeBuilder({page}).analyze();
 expect(r.violations.filter(v=>["serious","critical"].includes(v.impact??""))).toEqual([]);
});

test("cohort page refuses a cohort file that fails its integrity check",async({page})=>{
 await page.route("**/clinical-plane/synthetic-cohort.v1.json",async r=>{const resp=await r.fetch();const j=await resp.json();j.patients[0].age=1;await r.fulfill({json:j})});
 await page.goto("/research/cohort");
 await expect(page.getByRole("alert")).toContainText("could not be loaded or verified");
 await expect(page.getByRole("button",{name:/Evaluate cohort/})).toBeDisabled();
});

test("cohort page: the generated cohort gives a meaningful released aggregate and strata, still with no ids",async({page})=>{
 await page.goto("/research/cohort");
 await page.getByRole("group",{name:"Choose a synthetic cohort"}).getByRole("button",{name:/Generated cohort/}).click();
 await expect(page.getByText(/Seeded, so it is identical every time/)).toBeVisible();
 await page.getByRole("button",{name:/Evaluate cohort \(5000 synthetic profiles\)/}).click();
 await page.getByRole("button",{name:/Release with reviewer approval/}).click();
 await expect(page.getByRole("heading",{name:"Released aggregate"})).toBeVisible();
 const counts=page.locator(".co-counts");
 await expect(counts).toContainText("5000");
 await expect(counts.locator(".co-sup")).toHaveCount(0);
 await expect(page.getByRole("table",{name:"Matched by sex and by condition"}).locator("td").filter({hasText:/^\d+$/}).first()).toBeVisible();
 await expect(page.locator("body")).not.toContainText(/SYN-[A-Z]-\d{6}/);
});
