import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";

const row=(label:string,kind:string,agent:string,differs:boolean,a:string,b:string)=>({kind,agent,label,differs,papersReporting:2,byPaper:[{paperId:"PMC1000001",values:[{display:a,quote:`Cells were stimulated with ${label} at ${a}.`}]},{paperId:"PMC1000002",values:[{display:b,quote:`${label} was used at ${b} in complete medium.`}]}]});
const ok={query:"Tfh differentiation IL-21",retrievedAt:"2026-11-15T00:00:00Z",source:"Europe PMC open-access full text (CC BY or CC0 only)",
 papers:[{id:"PMC1000001",title:"First open paper on Tfh",url:"https://europepmc.org/article/PMC/1000001",licence:"cc by",methodsFound:true,parameters:5},{id:"PMC1000002",title:"Second open paper on Tfh",url:"https://europepmc.org/article/PMC/1000002",licence:"cc by",methodsFound:true,parameters:4}],
 rows:[row("Concentration · anti-cd3","concentration","anti-cd3",true,"1 µg/mL","5 µg/mL"),row("Incubation or culture temperature","temperature","",false,"37 °C","37 °C")],
 notes:["Values are read from the text by patterns, not by a model, and accuracy has not been measured. Each value shows the sentence it came from; read it before relying on it. A difference between papers is not a judgement that one is better."]};

test("methods: compare papers, see where they differ with quotes, record what I did, keep failures, export; private; axe is clean",async({page})=>{
 await page.route("**/api/research/methods-compare",r=>r.fulfill({json:ok}));
 await page.goto("/research/methods");
 await expect(page.getByRole("note")).toContainText("Private to this browser");
 await expect(page.getByRole("note")).toContainText("Sharing with other researchers is not available yet");
 await page.getByLabel("Technique and topic").fill("Tfh differentiation IL-21");
 await page.getByRole("button",{name:"Compare open-access papers"}).click();
 await expect(page.getByText(/2 papers compared/)).toBeVisible();
 await expect(page.getByText(/not by a model/)).toBeVisible();
 const rows=page.getByRole("list",{name:"Where papers differ"}).locator(":scope > li");
 await expect(rows).toHaveCount(2);
 await expect(rows.first()).toContainText("Papers differ");
 await expect(rows.nth(1)).toContainText("Papers agree");
 await rows.first().getByText("Quoted sentence").first().click();
 await expect(rows.first()).toContainText("Cells were stimulated with Concentration · anti-cd3");
 await expect(page.locator("body")).not.toContainText(/\bbest\b|recommended method/i);
 await rows.first().getByRole("button",{name:"Record what I did for this"}).click();
 await expect(page.getByLabel("Technique",{exact:true})).toHaveValue("Tfh differentiation IL-21");
 await expect(page.getByLabel("Parameter").first()).toHaveValue("Concentration · anti-cd3");
 await expect(page.getByLabel("As published").first()).toHaveValue("1 µg/mL");
 await page.getByLabel("What I did").first().fill("2 µg/mL");
 await page.getByLabel("Why").first().fill("Lower background in my donors");
 await page.getByLabel("What happened").selectOption("failed");
 await page.getByRole("button",{name:"Save to my notebook"}).click();
 await expect(page.getByText(/Failures are as useful/)).toBeVisible();
 await page.getByLabel(/Details \(required/).fill("Cells died after day 2 at the higher dose");
 await page.getByRole("button",{name:"Save to my notebook"}).click();
 await expect(page.getByText("Saved to your private notebook.")).toBeVisible();
 const rec=page.getByRole("list",{name:"Notebook records"}).locator(":scope > li").first();
 await expect(rec).toContainText("Failed");await expect(rec).toContainText("1 µg/mL → 2 µg/mL");
 await expect(page.getByText(/1 records: 0 worked, 0 partly, 1 failed/)).toBeVisible();
 await page.reload();
 await expect(page.getByRole("list",{name:"Notebook records"}).locator(":scope > li")).toHaveCount(1);
 const dl=page.waitForEvent("download");await page.getByRole("button",{name:/Export notebook/}).click();const file=await dl;
 expect(file.suggestedFilename()).toBe("hsi-methods-notebook.json");
 const r=await new AxeBuilder({page}).analyze();
 expect(r.violations.filter(v=>["serious","critical"].includes(v.impact??""))).toEqual([]);
});

test("methods: provider failure and no comparable parameters are stated; a bad query is refused",async({page})=>{
 await page.route("**/api/research/methods-compare",r=>r.fulfill({status:502,json:{error:"x"}}));
 await page.goto("/research/methods");
 await page.getByLabel("Technique and topic").fill("Tfh differentiation IL-21");
 await page.getByRole("button",{name:"Compare open-access papers"}).click();
 await expect(page.getByRole("alert")).toContainText("nothing is shown");
 await page.unroute("**/api/research/methods-compare");
 await page.route("**/api/research/methods-compare",r=>r.fulfill({json:{...ok,rows:[],notes:["No open-access paper with a CC BY or CC0 licence matched. Nothing is shown."]}}));
 await page.getByRole("button",{name:"Compare open-access papers"}).click();
 await expect(page.getByText(/nothing to compare/)).toBeVisible();
 await expect(page.getByRole("button",{name:"Compare open-access papers"})).toBeEnabled();
 await page.getByLabel("Technique and topic").fill("ab");
 await expect(page.getByRole("button",{name:"Compare open-access papers"})).toBeDisabled();
});

test("methods: import merges a notebook file without overwriting and rejects hostile content",async({page})=>{
 await page.goto("/research/methods");
 const good={schema:"hsi-methods-notebook-1",records:[{id:"mth:0badc0de",createdAt:"2026-01-01T00:00:00Z",technique:"Imported technique record",outcome:"worked",deviations:[],reference:{title:"",doi:"javascript:alert(1)",pmcid:""},context:{},effort:{},sharing:"public"}]};
 await page.setInputFiles("input[type=file]",{name:"nb.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(good))});
 await expect(page.getByText("Imported 1; skipped 0.")).toBeVisible();
 await page.setInputFiles("input[type=file]",{name:"nb.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(good))});
 await expect(page.getByText("Imported 0; skipped 1.")).toBeVisible();
 const rec=page.getByRole("list",{name:"Notebook records"}).locator(":scope > li");
 await expect(rec).toHaveCount(1);await expect(rec.first()).toContainText("Imported technique record");
 await expect(rec.first().locator("a")).toHaveCount(0);
});
