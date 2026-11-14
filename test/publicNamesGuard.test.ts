import {describe,expect,test} from "bun:test";
import {existsSync,mkdtempSync,mkdirSync,rmSync,writeFileSync,readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {ALLOWED_PAGES,DATA_FEEDS,findProductNames,scanDist} from "../site/scripts/check-public-names";

describe("public product-name guard",()=>{
 test("finds each separately governed product name in text, attributes and metadata",()=>{
  for(const n of ["Aksh Health","HSI Clinical","HSI Trials","ISI","Immune Super Intelligence","Akeno","AKSH"]){
   expect(findProductNames(`<p>About ${n} today</p>`),n).toContain(n);
   expect(findProductNames(`<svg aria-label="map of ${n}"></svg>`),n).toContain(n);
   expect(findProductNames(`<meta name="description" content="${n} things">`),n).toContain(n);
  }
 });
 test("capability language and unrelated words pass",()=>{
  expect(findProductNames("<p>Scientific discovery, clinical context, patient-reported health and study intelligence. Visit the island. IS I.</p>")).toEqual([]);
  expect(findProductNames("<p>AKSHAY and ISIS</p>").length).toBe(1); // 'AKSH' matches inside AKSHAY: acceptable, flagged for review
 });
 test("external script bundles are ignored, inline page content is not",()=>{
  expect(findProductNames('<script type="module" src="/assets/Aksh-chunk.js"></script><p>ok</p>')).toEqual([]);
  expect(findProductNames("<script>window.__d={a:'Aksh Health'}</script>")).toContain("Aksh Health");
 });
 test("no page is exempt from the guard",()=>{
  expect([...ALLOWED_PAGES]).toEqual([]);
 });

 test("top-level static files are scanned too, not only pages",async()=>{
  const d=mkdtempSync(join(tmpdir(),"hsi-names-"));
  try{
   mkdirSync(join(d,"_pages"));writeFileSync(join(d,"index.html"),"<p>clean</p>");writeFileSync(join(d,"_pages","a.html"),"<p>clean</p>");
   writeFileSync(join(d,"llms.txt"),"Governed modules Aksh Health retain separate responsibilities.");writeFileSync(join(d,"capability-status.json"),'{"public_label":"HSI Trials matching"}');
   writeFileSync(join(d,"sitemap.xml"),"<urlset/>");writeFileSync(join(d,"discovery.json"),'{"x":"ISI Akeno"}'); // engineering data feed: exempt
   const found=await scanDist(d);
   expect(found.map(f=>f.file).sort()).toEqual(["capability-status.json","llms.txt"]);
  }finally{rmSync(d,{recursive:true,force:true})}
 });
 test("the only exempt top-level file is the engineering discovery data feed",()=>{expect([...DATA_FEEDS]).toEqual(["discovery.json"])});
 test("the real crawler-facing files in the repo are free of product names",()=>{
  for(const f of ["site/public/llms.txt","site/public/capability-status.json","docs/capability-status.json"])expect(findProductNames(readFileSync(resolve(f),"utf8")),f).toEqual([]);
  expect(readFileSync(resolve("site/public/capability-status.json"),"utf8")).toBe(readFileSync(resolve("docs/capability-status.json"),"utf8"));
 });
 test("the Aksh agent catalog is not published on the public site",()=>{
  expect(existsSync(resolve("site/public/aksh"))).toBe(false);
  expect(existsSync(resolve("aksh/agent-catalog.json"))).toBe(true); // the durable catalog stays in the repo
 });
});
