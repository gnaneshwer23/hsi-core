import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {connectedCapabilities,GOVERNANCE_PRINCIPLES} from "../site/src/lib/connectedIntelligence";

const read=(p:string)=>readFileSync(resolve(p),"utf8");
const NAMES=/Aksh|HSI Clinical|HSI Trials|\bISI\b|Immune Super Intelligence|Akeno/;
const vercel=JSON.parse(read("site/vercel.json")) as {rewrites:{source:string;destination:string}[]};

describe("connected intelligence: the wider vision, by capability, with no product names",()=>{
 test("four capabilities, each with a maturity label, a 'today', a 'not' and a governance statement",()=>{
  expect(connectedCapabilities.map(c=>c.id)).toEqual(["scientific-discovery","clinical-context","patient-context","translational-studies"]);
  for(const c of connectedCapabilities){for(const f of [c.summary,c.today,c.isNot,c.governance])expect(f.length,c.id).toBeGreaterThan(30);expect(["research_preview","in_development","planned"]).toContain(c.status)}
 });
 test("only scientific discovery is a research preview; nothing is presented as available",()=>{
  expect(connectedCapabilities.filter(c=>c.status==="research_preview").map(c=>c.id)).toEqual(["scientific-discovery"]);
  const text=JSON.stringify(connectedCapabilities)+JSON.stringify(GOVERNANCE_PRINCIPLES);
  expect(/\b(available now|live now|production[- ]ready|fully operational|validated)\b/i.test(text.replace(/Not validated discovery|clinical validation|is not evidence that something is available or validated/gi,""))).toBe(false);
 });
 test("the clinical and trial capabilities state their hard limits",()=>{
  const by=Object.fromEntries(connectedCapabilities.map(c=>[c.id,c]));
  expect(by["clinical-context"]!.isNot).toContain("Not clinical decision support");
  expect(by["clinical-context"]!.today).toContain("no patient data");
  expect(by["translational-studies"]!.isNot).toContain("not confirmed eligibility");
  expect(by["translational-studies"]!.governance).toContain("Investigator confirmation");
 });
 test("data and governance statements keep patient data separate and unpooled",()=>{
  const text=GOVERNANCE_PRINCIPLES.map(p=>p.text).join(" ")+connectedCapabilities.map(c=>c.governance).join(" ");
  expect(text).toContain("distinct from restricted patient and clinical records");
  expect(text).toContain("never pooled");
 });
 test("no product names in the page data, the page, or the home strip it replaced",()=>{
  for(const f of ["site/src/lib/connectedIntelligence.ts","site/src/pages/ConnectedIntelligence.tsx","site/src/styles/connected-intelligence.css","site/src/pages/ScientificPublic.tsx"])expect(NAMES.test(read(f)),f).toBe(false);
 });
 test("the secondary page remains routed, prerendered and in the SEO map",()=>{
  expect(read("site/src/App.tsx")).toContain('path="connected-intelligence"');
  expect(vercel.rewrites.find(r=>r.source==="/connected-intelligence")?.destination).toBe("/_pages/connected-intelligence.html");
  const seo=read("site/src/lib/seo/siteSeo.ts");expect(seo).toContain("'/connected-intelligence'");
  expect(NAMES.test(seo.slice(seo.indexOf("'/connected-intelligence'"),seo.indexOf("'/connected-intelligence'")+400))).toBe(false);

 });
});
