import {expect,test} from "@playwright/test";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

// The policy in vercel.json is enforced. The built site must not violate it. The preview server does not send
// Vercel headers, so the policy is applied here, enforced, to the document responses and every violation is collected.
const config=JSON.parse(readFileSync(fileURLToPath(new URL("../vercel.json",import.meta.url)),"utf8")) as {headers:{source:string;headers:{key:string;value:string}[]}[]};
const csp=config.headers.find(h=>h.source==="/(.*)")!.headers.find(h=>h.key==="Content-Security-Policy")?.value??"";
const ROUTES=["/","/platform","/intelligence","/departments","/connected-intelligence","/research","/research/knowledge-graph?experience=advanced","/research/ontology-review","/research/validation","/research/scientific-workbench","/science/graph","/context-conflict-audit","/sign-in","/trust","/science/literature","/nonexistent-route"];

test("the policy is enforced, not report-only, and still reports violations",()=>{
 const root=config.headers.find(h=>h.source==="/(.*)")!.headers.map(h=>h.key);
 expect(root).toContain("Content-Security-Policy");
 expect(root).not.toContain("Content-Security-Policy-Report-Only");
 expect(csp).toContain("report-uri /api/csp-report"); // enforced policies still send reports
});

test("the policy is strict where it matters",()=>{
 expect(csp).toContain("default-src 'self'");expect(csp).toContain("object-src 'none'");expect(csp).toContain("frame-ancestors 'none'");expect(csp).toContain("base-uri 'self'");expect(csp).toContain("form-action 'self'");
 expect(csp).not.toContain("'unsafe-eval'");expect(/script-src[^;]*(\*|'unsafe-inline'|https?:)/.test(csp)).toBe(false);
 expect(csp.match(/connect-src ([^;]*)/)![1]).toBe("'self'");
 expect(csp).not.toContain("ebi.ac.uk");expect(csp).not.toContain("reactome.org");expect(csp).not.toContain("uniprot.org");
});

for(const route of ROUTES){
 test("no policy violations on "+route,async({page})=>{
  const issues:string[]=[];
  await page.route("**/*",async r=>{
   const url=new URL(r.request().url());
   // Literature and biomedical metadata go through same-origin APIs (ING-01); stub them locally.
   if(url.pathname==="/api/research/literature-search")return r.fulfill({json:{hitCount:0,nextCursorMark:null,records:[],note:"stub"},headers:{"content-type":"application/json"}});
   if(url.pathname==="/api/research/biomedical-metadata")return r.fulfill({json:{ok:true,protein:null,pathway:null},headers:{"content-type":"application/json"}});
   if(r.request().resourceType()!=="document")return r.continue();
   const resp=await r.fetch();return r.fulfill({response:resp,headers:{...resp.headers(),"content-security-policy":csp}});
  });
  page.on("console",m=>{if(/Content Security Policy|Refused to/i.test(m.text()))issues.push(m.text().slice(0,160))});
  await page.goto(route,{waitUntil:"networkidle"});await page.waitForTimeout(300);
  if(route==="/science/literature")await expect(page.getByRole("status")).toHaveText("0 matching records · 0 displayed");
  expect(issues).toEqual([]);
 });
}

// Every static route in the router, not a sample. Loading a page loads its lazy chunk, so a blocked worker, font, image or
// connection in a route that is not in the hand-picked list above would still surface here. Interactive flows that only
// create a violation after a click are NOT covered by this loop.
const app=readFileSync(fileURLToPath(new URL("../src/App.tsx",import.meta.url)),"utf8");
const STATIC_ROUTES=[...new Set([...app.matchAll(/path="([^"]+)"/g)].map(m=>"/"+m[1]!.replace(/^\//,"")).filter(p=>!p.includes(":")&&!p.includes("*")&&p!=="/design/identity"))].sort();

test("the router has a meaningful number of static routes to check",()=>{expect(STATIC_ROUTES.length).toBeGreaterThan(100)});

test("no policy violations on any static route (event listener and console)",async({page})=>{
 test.setTimeout(420_000);
 const issues:string[]=[];
 await page.addInitScript(()=>{
  (window as unknown as {__csp:string[]}).__csp=[];
  document.addEventListener("securitypolicyviolation",e=>(window as unknown as {__csp:string[]}).__csp.push(`${e.effectiveDirective} blocked ${e.blockedURI.slice(0,80)}`));
 });
 await page.route("**/*",async r=>{
  const url=new URL(r.request().url());
  if(url.pathname.startsWith("/api/"))return r.fulfill({status:401,json:{},headers:{"content-type":"application/json"}});
  if(r.request().resourceType()!=="document")return r.continue();
  const resp=await r.fetch();return r.fulfill({response:resp,headers:{...resp.headers(),"content-security-policy":csp}});
 });
 let current="";
 page.on("console",m=>{if(/Content Security Policy|Refused to/i.test(m.text()))issues.push(`${current}: ${m.text().slice(0,140)}`)});
 for(const route of STATIC_ROUTES){
  current=route;
  await page.goto(route,{waitUntil:"load"});
  await page.waitForLoadState("networkidle").catch(()=>{});
  const v=await page.evaluate(()=>(window as unknown as {__csp?:string[]}).__csp??[]);
  for(const x of v)issues.push(`${route}: ${x}`);
 }
 expect(issues).toEqual([]);
});
