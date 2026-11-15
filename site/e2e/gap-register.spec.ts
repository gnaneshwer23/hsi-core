import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";

test("gap register lists graph gaps, keeps status in this browser, flags nothing as reviewed; axe is clean",async({page})=>{
 await page.goto("/research/gaps");
 await expect(page.getByRole("heading",{level:1,name:"Gap Register"})).toBeVisible();
 const items=page.getByRole("list",{name:"Gaps"}).getByRole("listitem");
 await expect(items.first()).toBeVisible();
 expect(await items.count()).toBeGreaterThanOrEqual(1);
 await expect(page.getByText("kept in this browser only")).toBeVisible();
 const first=items.first();
 await first.getByRole("button",{name:"Investigating"}).click();
 await expect(first.locator(".gr-status")).toHaveText("Investigating");
 await first.getByText(/^History/).click();
 await page.reload();
 await expect(page.getByRole("list",{name:"Gaps"}).getByRole("listitem").first().locator(".gr-status")).toHaveText("Investigating");
 await page.getByRole("button",{name:"Resolved"}).first().click();
 await page.getByRole("group",{name:"Filter by your status"}).getByRole("button",{name:"Open"}).click();
 const r=await new AxeBuilder({page}).analyze();
 expect(r.violations.filter(v=>["serious","critical"].includes(v.impact??""))).toEqual([]);
});

test("gap register shows an honest failure when the graph cannot load",async({page})=>{
 await page.route(/graph-snapshot|claim-graph\/versions/,r=>r.abort());
 await page.goto("/research/gaps");
 await expect(page.getByRole("alert")).toContainText("No substitute gaps are shown");
});
