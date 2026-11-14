import {expect,test} from "@playwright/test";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {getSeoMetadata} from "../src/lib/seo/siteSeo";

const config=JSON.parse(readFileSync(fileURLToPath(new URL("../vercel.json",import.meta.url)),"utf8")) as {rewrites:{source:string;destination:string}[]};
const routes=[...new Set(config.rewrites.filter(r=>r.destination.startsWith("/_pages/")).map(r=>r.source))];

test("every routed page has its own title, and none is the old shared fallback",()=>{
 const generic=getSeoMetadata("/zz-not-a-route").title,seen=new Map<string,string>();
 for(const r of routes){
  const t=getSeoMetadata(r).title;
  expect(t,r+" falls back to the generic title").not.toBe(generic);
  expect(seen.get(t),`${r} and ${seen.get(t)} share a title`).toBeUndefined();seen.set(t,r);
 }
});

test("a tool page shows its own title in the browser tab",async({page})=>{
 await page.goto("/research/ontology-review");
 await expect(page).toHaveTitle("Ontology Mapping Review | Human Super Intelligence");
});

test("an unknown route renders the not-found page with a clear title",async({page})=>{
 await page.goto("/definitely-not-a-page");
 await expect(page.getByRole("heading",{name:"Page not found",level:1})).toBeVisible();
 await expect(page).toHaveTitle("Page Not Found | Human Super Intelligence");
});

test("the build emits a noindex 404.html that the host can serve for unmatched paths",()=>{
 const html=readFileSync(fileURLToPath(new URL("../dist/404.html",import.meta.url)),"utf8");
 expect(html).toContain("<title>Page Not Found | Human Super Intelligence</title>");
 expect(html).toContain('content="noindex, follow"');expect(html).toContain('<div id="root"></div>');
});
