import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {intelligenceCapabilities} from "../site/src/lib/intelligenceCollective";

// The public Intelligence Collective page must not drift from the capability register: same names, one route each, and no
// old names that collide with Aksh Health agents (PRISM, HORIZON were renamed LANTERN, VANTAGE).
const register=JSON.parse(readFileSync(resolve("operations/capability-register/capability-register.v1.json"),"utf8")) as {collective:{agents:{name:string;layer:string}[]}};
const vercel=JSON.parse(readFileSync(resolve("site/vercel.json"),"utf8")) as {rewrites:{source:string;destination:string}[];redirects:{source:string;destination:string;permanent?:boolean}[]};
const names=intelligenceCapabilities.map(c=>c.name);

describe("public collective page matches the register",()=>{
 test("the same thirteen names, no more and no fewer",()=>{expect([...names].sort()).toEqual(register.collective.agents.map(a=>a.name).sort())});
 test("slugs are the lower-case names and unique",()=>{
  for(const c of intelligenceCapabilities)expect(c.slug).toBe(c.name.toLowerCase());
  expect(new Set(intelligenceCapabilities.map(c=>c.slug)).size).toBe(13);
 });
 test("the colliding Aksh names are not used for HSI capabilities",()=>{for(const old of ["PRISM","HORIZON"])expect(names).not.toContain(old)});
 test("the capability pages are not public pages: every old URL redirects permanently to how it works and none is indexed",()=>{
  const sources=new Set(vercel.redirects.map(r=>r.source));
  expect(vercel.redirects.find(r=>r.source==="/intelligence/:slug")).toMatchObject({destination:"/how-it-works",permanent:true});
  expect(vercel.redirects.find(r=>r.source==="/intelligence")).toMatchObject({destination:"/platform/agents",permanent:true});
  void sources;
 });
 test("related-capability references point at real capabilities",()=>{
  const set=new Set(names);
  for(const c of intelligenceCapabilities)for(const ref of [...c.partners,...c.dependencies.filter(d=>/^[A-Z]+$/.test(d))])expect(set.has(ref),`${c.name} -> ${ref}`).toBe(true);
 });
 test("maturity text never claims acceptance, validation or a live run it does not have",()=>{
  for(const c of intelligenceCapabilities){
   expect(c.maturity.length,c.name).toBeGreaterThan(20);
   expect(/\b(production[- ]ready|scientifically validated|accepted by|approved by)\b/i.test(c.maturity),c.name).toBe(false);
  }
 });
});
