import {expect,test} from "@playwright/test";

const GRAPH="**/api/research/graph-snapshot**";

test("a failing graph snapshot says so and shows no substitute graph",async({page})=>{
 await page.route(GRAPH,r=>r.fulfill({status:500,body:"x"}));
 const errors:string[]=[];page.on("pageerror",e=>errors.push(String(e)));
 await page.goto("/knowledge-graph");
 await expect(page.getByText("Snapshot unavailable. No substitute graph is shown.").first()).toBeVisible();
 await expect(page.getByText(/Live from the published snapshot/)).toHaveCount(0);
 expect(errors).toEqual([]);
});

test("a malformed or aborted snapshot is treated as unavailable, on the homepage too",async({page})=>{
 await page.route(GRAPH,r=>r.fulfill({status:200,contentType:"application/json",body:'{"nope":1}'}));
 await page.goto("/");
 await expect(page.getByText("Snapshot unavailable. No substitute graph is shown.").first()).toBeVisible();
 await expect(page.getByRole("heading",{level:1})).toBeVisible(); // the page itself still works
});

test("while the snapshot loads the page says it is verifying, not that it is live",async({page})=>{
 await page.route(GRAPH,()=>{});
 await page.goto("/knowledge-graph");
 await expect(page.getByText("Verifying the published snapshot…").first()).toBeVisible();
 await expect(page.getByText(/Live from the published snapshot/)).toHaveCount(0);
});

test("when the access service is down the form keeps a draft and never claims it was sent",async({page})=>{
 await page.route("**/api/access-requests**",r=>r.fulfill({status:500,body:"x"}));
 await page.goto("/contact");
 await page.getByLabel(/Research question/).fill("Does butyrate change barrier function in humans?");
 await page.getByRole("button",{name:"Save my question"}).click();
 await expect(page.getByText("Saved in this browser only. No access request was sent to HSI servers.")).toBeVisible();
 await expect(page.getByRole("button",{name:/Send access request/})).toHaveCount(0);
});

test("blocked browser storage does not break onboarding, settings or the preview",async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,"localStorage",{get(){throw new Error("blocked")}})});
 const errors:string[]=[];page.on("pageerror",e=>errors.push(String(e)));
 await page.goto("/onboarding/role");
 await page.getByRole("radio",{name:/PhD researcher/}).click();
 await page.getByRole("button",{name:"Continue"}).click();
 await expect(page).toHaveURL(/\/identity$/); // progress still works for this visit
 await page.goto("/settings/scientific-profile");
 await expect(page.getByRole("heading",{level:1})).toHaveText("Your scientific profile");
 await page.goto("/workspace/preview/student");
 await expect(page.getByRole("heading",{level:1})).toBeVisible();
 expect(errors).toEqual([]);
});

test("a corrupted saved profile falls back to an empty one instead of failing",async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem("hsi-scientific-onboarding-v1",'{"v":1,"primaryRole":"root","objectives":["<script>"],"projects":"no"}')});
 await page.goto("/settings/scientific-profile");
 await expect(page.getByText("You have not set anything up yet")).toBeVisible();
 await expect(page.getByRole("heading",{level:1})).toBeVisible();
});

test("an unknown workspace preview or onboarding path lands on a clear page, not a blank screen",async({page})=>{
 await page.goto("/workspace/preview/not-a-role");
 await expect(page.getByRole("heading",{level:1})).toContainText("Page not found");
 await page.goto("/onboarding/not-a-step");
 await expect(page.getByRole("heading",{level:1})).toContainText("Page not found");
});

test("a page that cannot load offline shows a clear message with a way back, then recovers",async({page,context,browserName})=>{
 test.skip(browserName==="webkit","Playwright's offline emulation does not restore the connection reliably in WebKit; this is covered in Chromium and Firefox.");
 await page.goto("/trust");
 await expect(page.getByRole("heading",{level:1}).first()).toBeVisible(); // fully loaded before the connection drops
 await context.setOffline(true);
 await page.locator('a[href="/about"]').first().click();
 await expect(page.getByRole("heading",{level:1,name:"This page couldn’t load."})).toBeVisible();
 await expect(page.getByText("Nothing you entered has been lost or sent.")).toBeVisible();
 await context.setOffline(false);
 await page.getByRole("button",{name:"Reload this page"}).click();
 await expect(page.getByRole("heading",{name:"This page couldn’t load."})).toHaveCount(0); // retries until the reload has finished
 await expect(page.getByRole("heading",{level:1,name:"What HSI is for."})).toBeVisible();
});
