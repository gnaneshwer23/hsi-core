import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";

const ev=(o:Record<string,number>)=>["genetic_association","somatic_mutation","clinical","affected_pathway","rna_expression","literature","animal_model"].map(id=>({id,label:id.replace(/_/g," "),score:o[id]??null}));
const cand=(rank:number,symbol:string,score:number,o:Record<string,number>,obs:string[])=>({rank,ensemblId:"ENSG0000000000"+rank,symbol,score,evidence:ev(o),present:Object.keys(o),absent:[],observations:obs});
const profile={diseaseId:"MONDO_0005100",diseaseName:"systemic sclerosis",retrievedAt:"2026-11-15T00:00:00.000Z",associationScope:"direct",totalAssociations:412,shown:2,
 candidates:[cand(1,"TARGB",0.9,{literature:0.9},["No human genetic association evidence is recorded for this target and disease.","No clinical-precedence evidence (drugs or trials) is recorded for this target and disease.","All recorded evidence is one type (literature)."]),cand(2,"TARGA",0.8,{genetic_association:0.5,clinical:0.6,literature:0.7},[])],
 honesty:{scoreIsNotCausation:true,scoreIsNotEfficacy:true,scoreIsNotTargetValidation:true,notARecommendation:true,noClinicalAdvice:true}};
const ok={profile,caveat:"A score summarises public evidence of association between a target and a disease. It is not evidence that changing the target would help, and it is not a recommendation.",source:"Open Targets Platform (public association metadata)"};

test("targets: find candidates, see missing evidence, shortlist with a reason against a hypothesis, remove; axe is clean",async({page})=>{
 await page.route("**/api/research/target-evidence",r=>r.fulfill({json:ok}));
 await page.goto("/research/ledger");
 await page.getByLabel("Hypothesis (one sentence)").fill("Blocking IL-21 signalling reduces fibrotic activity in systemic sclerosis.");
 await page.getByRole("button",{name:"Add to ledger"}).click();
 await page.getByRole("link",{name:/Find candidate targets for this hypothesis/}).click();
 await expect(page.getByRole("note")).toContainText("not recommendations");
 await page.getByRole("button",{name:"Find candidate targets"}).click();
 const list=page.getByRole("list",{name:"Candidate targets"}).locator(":scope > li");
 await expect(list).toHaveCount(2);
 await expect(list.first()).toContainText("TARGB");
 await expect(list.first()).toContainText("No human genetic association evidence is recorded");
 await expect(page.getByText(/showing the top 2 of 412 direct associations/)).toBeVisible();
 await list.first().getByText("Shortlist for a hypothesis").click();
 await list.first().getByRole("button",{name:"Shortlist TARGB"}).click();
 await expect(list.first()).toContainText("at least 10 characters");
 await list.first().getByLabel(/Why is this target worth investigating/).fill("Literature signal in the disease of interest");
 await list.first().getByRole("button",{name:"Shortlist TARGB"}).click();
 await expect(list.first()).toContainText("not a recommendation");
 await list.first().getByRole("button",{name:"Shortlist TARGB"}).click();
 await expect(list.first()).toContainText("already shortlisted");
 const r=await new AxeBuilder({page}).analyze();
 expect(r.violations.filter(v=>["serious","critical"].includes(v.impact??""))).toEqual([]);

 await page.goto("/research/ledger");
 const card=page.getByRole("list",{name:"Hypotheses"}).getByRole("listitem").first();
 await expect(card.locator(".gr-status")).toHaveText("Proposed");
 await expect(card).toContainText("Candidate targets (1)");
 await expect(card).toContainText("not a recommendation");
 await card.getByRole("button",{name:"Remove TARGB"}).click();
 await expect(card).not.toContainText("Candidate targets (1)");
});

test("targets: provider failure and unknown disease are stated, nothing is shown",async({page})=>{
 await page.route("**/api/research/target-evidence",r=>r.fulfill({status:502,json:{error:"x"}}));
 await page.goto("/research/targets");
 await page.getByRole("button",{name:"Find candidate targets"}).click();
 await expect(page.getByRole("alert")).toContainText("no targets are shown");
 await expect(page.getByRole("list",{name:"Candidate targets"})).toHaveCount(0);
 await page.unroute("**/api/research/target-evidence");
 await page.route("**/api/research/target-evidence",r=>r.fulfill({status:404,json:{error:"x"}}));
 await page.getByRole("button",{name:"Find candidate targets"}).click();
 await expect(page.getByRole("alert")).toContainText("does not recognise");
});
