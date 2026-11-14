import {expect,test} from "@playwright/test";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

// The report-only policy in vercel.json must not be violated by the built site. The preview server does not send
// Vercel headers, so the policy is applied here, enforced, to the document responses and every violation is collected.
const config=JSON.parse(readFileSync(fileURLToPath(new URL("../vercel.json",import.meta.url)),"utf8")) as {headers:{source:string;headers:{key:string;value:string}[]}[]};
const csp=config.headers.find(h=>h.source==="/(.*)")!.headers.find(h=>h.key==="Content-Security-Policy-Report-Only")?.value??"";
const ROUTES=["/","/platform","/intelligence","/departments","/connected-intelligence","/research","/research/knowledge-graph?experience=advanced","/research/ontology-review","/research/validation","/research/scientific-workbench","/science/graph","/context-conflict-audit","/sign-in","/trust","/science/literature","/nonexistent-route"];

test("the policy is strict where it matters",()=>{
 expect(csp).toContain("default-src 'self'");expect(csp).toContain("object-src 'none'");expect(csp).toContain("frame-ancestors 'none'");expect(csp).toContain("base-uri 'self'");expect(csp).toContain("form-action 'self'");
 expect(csp).not.toContain("'unsafe-eval'");expect(/script-src[^;]*(\*|'unsafe-inline'|https?:)/.test(csp)).toBe(false);
 expect(csp.match(/connect-src ([^;]*)/)![1]).toBe("'self' https://www.ebi.ac.uk");
});

for(const route of ROUTES){
 test("no policy violations on "+route,async({page})=>{
  const issues:string[]=[];
  await page.route("**/*",async r=>{
   if(r.request().resourceType()!=="document")return r.continue();
   const resp=await r.fetch();return r.fulfill({response:resp,headers:{...resp.headers(),"content-security-policy":csp}});
  });
  page.on("console",m=>{if(/Content Security Policy|Refused to/i.test(m.text()))issues.push(m.text().slice(0,160))});
  await page.goto(route,{waitUntil:"networkidle"});await page.waitForTimeout(300);
  expect(issues).toEqual([]);
 });
}
