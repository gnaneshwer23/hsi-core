import {test,expect} from "@playwright/test";
import {planSscInterrogation} from "../../src/interrogativeQuestionEngine";
const release={id:"ssc-browser-test-release",version:"1.0.0",manifestHash:"a".repeat(64)};
const id="hsi-interrogative-browser-test-12345678";
const question="Which mechanisms contribute to SSc fibrosis?";
const record=()=>({...planSscInterrogation({question,actorPrincipal:"browser-test-researcher",createdAt:"2026-11-05T12:00:00.000Z",dataClass:"public_biomedical",focus:"systemic_sclerosis",release}),id});
const workspace=(items:unknown[]=[])=>({items,releases:[release],nextCursor:null,writesEnabled:true,canCreate:true});
// HTTP fixtures exercise UI contracts. They do not certify Neon persistence or provider login.
test("create, leave and reopen a saved investigation with release references intact",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 let saved=false,creates=0;
 await page.route("**/api/research/investigations",async route=>{
  if(route.request().method()==="POST"){
   creates++;const body=route.request().postDataJSON();expect(body.question).toBe(question);expect(body.releaseId).toBe(release.id);expect(body.requestId).toMatch(/^[a-f0-9-]{36}$/);expect(Object.keys(body).sort()).toEqual(["question","releaseId","requestId"]);
   saved=true;await route.fulfill({status:201,json:{id,created:true}});
  }else await route.fulfill({json:workspace(saved?[{id,question,createdAt:"2026-11-05T12:00:00.000Z",state:"draft",release}]:[])});
 });
 await page.route("**/api/research/interrogative/"+id,route=>route.fulfill({json:record()}));
 await page.goto("/research/scientific-workbench");
 await expect(page.getByRole("heading",{name:"Your saved investigations"})).toBeVisible();
 await page.getByLabel("Research question",{exact:true}).fill(question);
 await page.getByRole("button",{name:"Create and save investigation"}).click();
 await expect(page).toHaveURL(new RegExp("decision-workbench\\?investigation="+id));
 await expect(page.locator(".iw-question")).toHaveText(question);
 await expect(page.locator("p.iw-meta")).toContainText(release.id);
 await page.getByText("Release provenance",{exact:true}).click();
 await expect(page.getByText("Manifest SHA-256: "+release.manifestHash,{exact:true})).toBeVisible();
 await page.getByRole("tab",{name:"Evidence trace"}).click();
 await expect(page.getByText("No approved evidence traces available.",{exact:false})).toBeVisible();
 await page.getByRole("link",{name:"Your saved investigations"}).click();
 await page.getByRole("link",{name:question,exact:true}).click();
 await expect(page.locator(".iw-question")).toHaveText(question);expect(creates).toBe(1);expect(errors).toEqual([]);
});
test("a lost save acknowledgement keeps the same request ID on retry",async({page})=>{
 const requests:string[]=[];
 await page.route("**/api/research/investigations",async route=>{
  if(route.request().method()==="GET")return route.fulfill({json:workspace()});
  requests.push(route.request().postDataJSON().requestId);
  if(requests.length===1)return route.abort("failed");
  return route.fulfill({status:200,json:{id,created:false}});
 });
 await page.route("**/api/research/interrogative/"+id,route=>route.fulfill({json:record()}));
 await page.goto("/research/scientific-workbench");await page.getByLabel("Research question",{exact:true}).fill(question);
 await page.getByRole("button",{name:"Create and save investigation"}).click();
 await expect(page.locator(".research-workspace [role=alert]")).toBeVisible();
 await expect(page.getByLabel("Research question",{exact:true})).toHaveValue(question);
 await page.getByRole("button",{name:"Create and save investigation"}).click();
 await expect(page.locator(".iw-question")).toHaveText(question);expect(requests).toHaveLength(2);expect(requests[0]).toBe(requests[1]);
});
test("read-only and missing-release workspaces never offer an enabled creation action",async({page})=>{
 let state={...workspace(),writesEnabled:false,canCreate:false};
 await page.route("**/api/research/investigations",route=>route.fulfill({json:state}));
 await page.goto("/research/scientific-workbench");
 await expect(page.getByRole("button",{name:"Create and save investigation"})).toBeDisabled();
 await expect(page.getByText("New investigations are not enabled on this deployment.",{exact:false})).toBeVisible();
 state={...workspace(),releases:[],canCreate:false};await page.reload();
 await expect(page.getByText("No published SSc evidence release is available",{exact:false})).toBeVisible();
 await expect(page.getByRole("button",{name:"Create and save investigation"})).toBeDisabled();
});
test("denied workspace can retry; malformed success cannot display protected records",async({page})=>{
 let attempt=0;
 await page.route("**/api/research/investigations",async route=>{
  attempt++;if(attempt===1)return route.fulfill({status:401,json:{error:"Authentication required"}});
  return route.fulfill({json:{...workspace(),items:[{id:"not-valid",question:"Should never display"}]}});
 });
 await page.goto("/research/scientific-workbench");await expect(page.locator(".research-workspace [role=alert]")).toContainText("Sign in with a verified research account");
 await page.getByRole("button",{name:"Retry workspace"}).click();
 await expect(page.locator(".research-workspace [role=alert]")).toBeVisible();await expect(page.getByText("Should never display")).toHaveCount(0);
});
test("saved list paginates and remains within a narrow viewport",async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.route("**/api/research/investigations**",async route=>{
  const next=new URL(route.request().url()).searchParams.get("cursor");
  const item={id,question,release,state:"draft",createdAt:"2026-11-05T12:00:00.000Z"};
  await route.fulfill({json:{...workspace([next?{...item,id:id+"-older",question:"Earlier SSc question"}:item]),nextCursor:next?null:{id,createdAt:"2026-11-05T12:00:00.123456Z"}}});
 });
 await page.goto("/research/scientific-workbench");await page.getByRole("button",{name:"Load more investigations"}).click();
 await expect(page.getByRole("link",{name:"Earlier SSc question"})).toBeVisible();await expect(page.getByRole("link",{name:question,exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
