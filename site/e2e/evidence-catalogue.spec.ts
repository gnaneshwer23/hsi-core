import {test,expect} from "@playwright/test";
test("catalogue shows bounded evidence and keeps human clearance explicit",async({page})=>{
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto("/research/evidence-readiness");
 await expect(page.getByRole("region",{name:"Evidence readiness summary"})).toBeVisible();
 await expect(page.getByText("Human clearance is pending.",{exact:true})).toBeVisible();
 await expect(page.getByRole("status")).toHaveText("5 publications match your filters.");
 const nav=page.getByRole("navigation",{name:"Evidence publications"});await expect(nav.getByRole("button")).toHaveCount(5);
 await page.getByLabel("Indication",{exact:true}).selectOption("systemic_sclerosis");
 await expect(nav.getByRole("button")).toHaveCount(3);
 const detail=page.getByRole("region",{name:"Selected source evidence"});await expect(detail).toContainText("No verified reuse licence recorded");
 await detail.getByText("Locator only — passage verification pending",{exact:false}).first().click();
 await expect(detail.getByText("No passage text or hash is available.",{exact:false}).first()).toBeVisible();
 expect(errors).toEqual([]);
});
test("RA passages retain hashes, source versions and study limitations",async({page})=>{
 await page.goto("/research/evidence-readiness");await page.getByLabel("Indication",{exact:true}).selectOption("rheumatoid_arthritis");
 await page.getByLabel("Find a source or claim",{exact:true}).fill("18375541");
 await expect(page.getByRole("status")).toHaveText("1 publications match your filters.");
 const detail=page.getByRole("region",{name:"Selected source evidence"});
 await expect(detail).toContainText("Licence reported in import receipt");
 await detail.getByText("Inspect imported passage",{exact:false}).first().click();
 await expect(detail.locator("blockquote").first()).toContainText("642 patients");
 await expect(detail.getByText("Text SHA-256:",{exact:false}).first()).toBeVisible();
 await detail.getByText("Study context and limitations",{exact:true}).click();
 await expect(detail).toContainText("No individual treatment recommendation.");
});
test("tampered evidence fails closed and can be retried",async({page})=>{
 let corrupt=true;
 await page.route("**/research/evidence-corpus/corpus.v1.json",async route=>{
  const original=await route.fetch();const data=await original.json();
  if(corrupt)data.claims[0].assertion="Injected supported claim";
  return route.fulfill({json:data});
 });
 await page.goto("/research/evidence-readiness");await expect(page.getByRole("alert")).toContainText("could not be verified");
 await expect(page.getByRole("region",{name:"Selected source evidence"})).toHaveCount(0);
 await expect(page.getByText("Injected supported claim")).toHaveCount(0);
 corrupt=false;await page.getByRole("button",{name:"Retry evidence catalogue"}).click();
 await expect(page.getByRole("region",{name:"Evidence readiness summary"})).toBeVisible();
});
test("review packet is unassigned and matches the displayed corpus version",async({page})=>{
 await page.goto("/research/evidence-readiness");await expect(page.getByRole("region",{name:"Evidence readiness summary"})).toBeVisible();
 const response=await page.request.get("/research/evidence-corpus/review-packet.v1.json"),packet=await response.json();
 await expect(page.getByText(packet.corpusVersion,{exact:true})).toBeVisible();
 expect(packet.grantsAuthority).toBe(false);expect(packet.claims.every((c:{decision:unknown})=>c.decision===null)).toBe(true);
 await expect(page.getByRole("link",{name:"Download review preparation packet"})).toHaveAttribute("download","hsi-evidence-review-packet.v1.json");
});
test("catalogue is linked from the workspace and fits mobile width",async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.goto("/research/scientific-workbench");await page.getByRole("link",{name:"Evidence catalogue",exact:true}).click();
 await expect(page.getByRole("region",{name:"Evidence readiness summary"})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
