import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";
import {readFileSync} from "node:fs";

async function rateFirst(page:any,name:string,independent:boolean,score:number){
 await page.goto("/research/evaluation");
 await page.getByLabel(/Your pseudonym/).fill(name);
 if(independent)await page.getByLabel(/I had no part in building/).check();
 const group=page.getByRole("radiogroup");
 await expect(group.first()).toBeVisible();
 for(const g of await group.all())await g.getByRole("radio",{name:String(score),exact:true}).click();
 await page.getByRole("button",{name:"Save ratings for this item"}).click();
}

test("evaluation: banner, blinded rating needs every score, persists, exports; no condition words shown; axe is clean",async({page})=>{
 await page.goto("/research/evaluation");
 await expect(page.getByRole("note")).toContainText("does not show that HSI is better");
 await expect(page.getByRole("note")).toContainText("excluded from every result");
 await expect(page.getByText("Enter a pseudonym to start rating.")).toBeVisible();
 await page.getByLabel(/Your pseudonym/).fill("a@b.co");
 await expect(page.getByText("Enter a pseudonym to start rating.")).toBeVisible();
 await page.getByLabel(/Your pseudonym/).fill("Reviewer one");
 await page.getByLabel(/I had no part in building/).check();
 await expect(page.getByText(/0 of \d+ items rated/)).toBeVisible();
 await expect(page.locator("#rh-main")).not.toContainText(/\bbaseline\b|comparison output/i);
 await page.getByRole("button",{name:"Save ratings for this item"}).click();
 await expect(page.getByRole("alert")).toContainText("Score every dimension");
 const groups=await page.getByRole("radiogroup").all();
 for(const g of groups)await g.getByRole("radio",{name:"4",exact:true}).click();
 await page.getByRole("button",{name:"Save ratings for this item"}).click();
 await expect(page.getByText(/1 of \d+ items rated/)).toBeVisible();
 await page.reload();
 await expect(page.getByText(/1 of \d+ items rated/)).toBeVisible();
 const r=await new AxeBuilder({page}).analyze();
 expect(r.violations.filter(v=>["serious","critical"].includes(v.impact??""))).toEqual([]);
 const dl=page.waitForEvent("download");await page.getByRole("button",{name:/Export my ratings/}).click();const f=await dl;
 const json=JSON.parse(readFileSync(await f.path()!,"utf8"));
 expect(json.schema).toBe("hsi-eval-ratings-1");expect(json.rater).toMatchObject({raterId:"Reviewer one",independent:true});expect(json.ratings).toHaveLength(1);expect(json.itemsDigest).toMatch(/^[a-f0-9]{64}$/);
 expect(Object.keys(json.ratings[0].scores).sort()).toEqual(["accuracy","novelty","relevance","specificity"]);
});

test("evaluation: preparing a comparison output creates a two-output item set that raters see blinded",async({page})=>{
 await page.goto("/research/evaluation");
 await page.getByRole("tab",{name:"Prepare an item set"}).click();
 const first=page.getByRole("list",{name:"Items"}).locator(":scope > li").first();
 await first.getByLabel(/Comparison output for the same question/).fill("A comparison gap statement written by another tool.");
 await first.getByLabel(/Where it came from/).fill("Another tool, run 15 Nov");
 const dl=page.waitForEvent("download");await page.getByRole("button",{name:/Export item set/}).click();const f=await dl;
 const set=JSON.parse(readFileSync(await f.path()!,"utf8"));
 expect(set.items[0].outputs.map((o:any)=>o.condition).sort()).toEqual(["baseline","hsi"]);expect(set.digest).toMatch(/^[a-f0-9]{64}$/);
});

test("evaluation: analysis refuses to show results without enough independent raters, and excludes non-independent ones",async({page})=>{
 await rateFirst(page,"Reviewer one",true,4);
 const dl=page.waitForEvent("download");await page.getByRole("button",{name:/Export my ratings/}).click();const f=await dl;
 const base=JSON.parse(readFileSync(await f.path()!,"utf8"));
 const other=(id:string,independent:boolean)=>({...base,rater:{...base.rater,raterId:id,independent}});
 await page.getByRole("tab",{name:"Analyse ratings"}).click();
 await page.getByRole("button",{name:/use the built-in gaps/}).click();
 await expect(page.getByText(/Built-in item set loaded/)).toBeVisible();
 const files=[base,other("Reviewer two",true),other("Builder",false)].map((j,i)=>({name:`r${i}.json`,mimeType:"application/json",buffer:Buffer.from(JSON.stringify(j))}));
 await page.getByLabel(/2\. Import rating files/).setInputFiles(files);
 await expect(page.getByText("3 rating files loaded.")).toBeVisible();
 await expect(page.getByText("Not enough independent ratings to show results.")).toBeVisible();
 await expect(page.getByRole("table",{name:"Raters",exact:true})).toContainText("No (excluded)");
 await expect(page.getByText(/excluded from every result/).first()).toBeVisible();
 const cells=await page.getByRole("table",{name:/Mean rating by dimension/}).locator("td").allInnerTexts();
 expect(cells.join(" ")).toContain("not shown");expect(cells.join(" ")).not.toMatch(/\d\.\d\d \(/);
 await page.getByLabel(/2\. Import rating files/).setInputFiles({name:"bad.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify({...base,itemsDigest:"0".repeat(64)}))});
 await expect(page.getByText(/different item set/)).toBeVisible();
});
