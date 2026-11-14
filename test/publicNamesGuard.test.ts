import {describe,expect,test} from "bun:test";
import {ALLOWED_PAGES,findProductNames} from "../site/scripts/check-public-names";

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
});
