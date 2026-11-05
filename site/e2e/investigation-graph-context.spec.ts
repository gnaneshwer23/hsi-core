import {test,expect} from "@playwright/test";
import {contextFixture,investigation,hash} from "../../test/fixtures/investigationGraphContext";
import {canonicalGraphContext} from "../../src/investigationGraphContext";
const record=investigation(),path="/api/research/interrogative/"+record.id;
test("capture, inspect graph/source context and reopen the same pinned evidence",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));let saved=false,captures=0;
 const c=contextFixture();
 await page.route("**"+path,route=>route.fulfill({json:record}));
 await page.route("**"+path+"/graph-context",async route=>{if(route.request().method()==="POST"){expect(route.request().postDataJSON()).toEqual({});saved=true;captures++}await route.fulfill({json:saved?{status:"saved",canCapture:false,context:c}:{status:"not_captured",canCapture:true,context:null}})});
 await page.goto("/research/decision-workbench?investigation="+record.id);
 await page.getByRole("button",{name:"Capture release-bound evidence view"}).click();
 await expect(page.getByRole("img",{name:/Tfh cell/})).toBeVisible();
 await page.getByRole("button",{name:/Tfh cell/}).click();
 const mechanism=page.getByRole("article",{name:"Selected mechanism evidence"});
 await mechanism.getByText("Test-only source citation · test abstract",{exact:true}).click();
 await expect(mechanism.locator("blockquote")).toContainText("Test-only source passage");
 await expect(mechanism.getByText("Source version:",{exact:false})).toBeVisible();
 const comparison=page.getByRole("region",{name:"Release-bound disease comparison"});await expect(comparison).toContainText("comparison candidate only");
 await comparison.getByText("Inspect RA source",{exact:false}).click();await expect(comparison.locator("blockquote")).toBeVisible();
 await page.reload();await expect(page.getByRole("img",{name:/Tfh cell/})).toBeVisible();expect(captures).toBe(1);expect(errors).toEqual([]);
});
test("bibliographic context opens the exact archived catalogue and keeps it unreviewed",async({page})=>{
 await page.route("**"+path,route=>route.fulfill({json:record}));
 await page.route("**"+path+"/graph-context",route=>route.fulfill({json:{status:"saved",canCapture:false,context:contextFixture()}}));
 await page.goto("/research/decision-workbench?investigation="+record.id);
 await page.getByRole("link",{name:"HSI-C-SSC-001 · inspect the pinned working evidence"}).click();
 await expect(page).toHaveURL(/version=[a-f0-9]{64}&claim=HSI-C-SSC-001/);
 await expect(page.getByRole("region",{name:"Selected source evidence"})).toContainText("30760472");
 await expect(page.getByText("Human clearance is pending.",{exact:true})).toBeVisible();
});
test("wrong release or altered passage is never rendered",async({page})=>{
 await page.route("**"+path,route=>route.fulfill({json:record}));
 const c=contextFixture();c.primary.bundle.passages[0]!.text="Forged mechanism evidence";const {contentHash,...body}=c;c.contentHash=hash(canonicalGraphContext(body));
 await page.route("**"+path+"/graph-context",route=>route.fulfill({json:{status:"saved",canCapture:false,context:c}}));
 await page.goto("/research/decision-workbench?investigation="+record.id);
 await expect(page.locator(".investigation-evidence-graph [role=alert]")).toContainText("could not be verified");
 await expect(page.getByRole("article",{name:"Selected mechanism evidence"})).toHaveCount(0);await expect(page.getByText("Forged mechanism evidence")).toHaveCount(0);
});
test("unavailable source permissions can retry without displaying stale evidence",async({page})=>{
 await page.route("**"+path,route=>route.fulfill({json:record}));let allowed=false;
 await page.route("**"+path+"/graph-context",route=>allowed?route.fulfill({json:{status:"saved",canCapture:false,context:contextFixture(false)}}):route.fulfill({status:403,json:{error:"Evidence context unavailable"}}));
 await page.goto("/research/decision-workbench?investigation="+record.id);
 await expect(page.locator(".investigation-evidence-graph [role=alert]")).toBeVisible();allowed=true;
 await page.getByRole("button",{name:"Refresh evidence view"}).click();await expect(page.getByRole("img",{name:/Tfh cell/})).toBeVisible();
 await expect(page.getByRole("region",{name:"Release-bound disease comparison"})).toContainText("No independently verified RA comparison release");
});
test("read-only deployments offer no capture and the saved graph fits mobile width",async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.route("**"+path,route=>route.fulfill({json:record}));let saved=false;
 await page.route("**"+path+"/graph-context",route=>route.fulfill({json:saved?{status:"saved",canCapture:false,context:contextFixture()}:{status:"not_captured",canCapture:false,context:null}}));
 await page.goto("/research/decision-workbench?investigation="+record.id);await expect(page.getByText("No saved evidence context is attached",{exact:false})).toBeVisible();await expect(page.getByRole("button",{name:"Capture release-bound evidence view"})).toHaveCount(0);
 saved=true;await page.getByRole("button",{name:"Refresh evidence view"}).click();await expect(page.getByRole("img",{name:/Tfh cell/})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
