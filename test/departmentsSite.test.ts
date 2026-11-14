import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {departments,departmentPath,DEPARTMENT_BY_LABEL} from "../site/src/lib/departments";

const graph=JSON.parse(readFileSync(resolve("research/domain-graph/graph.v1.json"),"utf8")) as {nodes:{domains?:string[]}[]};
const vercel=JSON.parse(readFileSync(resolve("site/vercel.json"),"utf8")) as {rewrites:{source:string;destination:string}[]};
const app=readFileSync(resolve("site/src/App.tsx"),"utf8");

describe("public department pages",()=>{
 test("exactly the six departments, with unique slugs",()=>{
  expect(departments.map(d=>d.slug)).toEqual(["immunology","neuroscience","microbiome","metabolism","genomics-multi-omics","human-physiology"]);
  expect(new Set(departments.map(d=>d.slug)).size).toBe(6);
 });
 test("graph coverage counts equal the real public graph, so they cannot drift or be inflated",()=>{
  for(const d of departments){
   const n=graph.nodes.filter(x=>(x.domains??[]).some(t=>d.graphTags.includes(t))).length;
   expect(d.graphConcepts,d.slug).toBe(n);
  }
  expect(departments.filter(d=>d.graphConcepts===0).map(d=>d.slug)).toEqual(["genomics-multi-omics","human-physiology"]);
 });
 test("every department has a route and a prerender rewrite, plus the index",()=>{
  const rewrites=new Map(vercel.rewrites.map(r=>[r.source,r.destination]));
  expect(rewrites.get("/departments")).toBe("/_pages/departments.html");
  for(const d of departments){
   expect(rewrites.get(departmentPath(d.slug)),d.slug).toBe(`/_pages/departments--${d.slug}.html`);
   expect(app.includes(`path="departments/${d.slug}"`),d.slug).toBe(true);
  }
 });
 test("connections point at real departments, never self, and each department has questions and topics",()=>{
  const slugs=new Set(departments.map(d=>d.slug));
  for(const d of departments){
   expect(d.questions.length).toBe(3);expect(d.explore.length).toBeGreaterThanOrEqual(4);expect(d.connections.length).toBeGreaterThanOrEqual(2);
   for(const c of d.connections){expect(slugs.has(c.slug)).toBe(true);expect(c.slug).not.toBe(d.slug)}
  }
 });
 test("the home page labels all map to a department",()=>{
  for(const label of ["Immunology","Neuroscience","Microbiome","Metabolism","Genomics & multi-omics","Human physiology"])expect(departments.some(d=>d.slug===DEPARTMENT_BY_LABEL[label])).toBe(true);
 });
 test("public copy makes no validation or discovery claims and names none of the separately governed products",()=>{
  const text=JSON.stringify(departments);
  expect(/\b(proven|validated knowledge established|breakthrough|cure)\b/i.test(text.replace(/not validated knowledge/gi,""))).toBe(false);
  for(const name of ["Aksh","HSI Clinical","HSI Trials","Immune Super Intelligence"])expect(text.includes(name),name).toBe(false);
 });
});
