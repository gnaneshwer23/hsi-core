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
 test("every capability has a pre-rendered route; the old URLs redirect permanently",()=>{
  const rewrites=new Map(vercel.rewrites.map(r=>[r.source,r.destination]));
  for(const c of intelligenceCapabilities)expect(rewrites.get("/intelligence/"+c.slug),c.slug).toBe(`/_pages/intelligence--${c.slug}.html`);
  for(const [old,now] of [["prism","lantern"],["horizon","vantage"]]){
   // like every client-side redirect route, the old path keeps a rewrite (deployment test), but the platform redirect runs first
   expect(rewrites.get("/intelligence/"+old)).toBe(`/_pages/intelligence--${old}.html`);
   expect(vercel.redirects.find(r=>r.source==="/intelligence/"+old)).toMatchObject({destination:"/intelligence/"+now,permanent:true});
  }
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
