import {describe,expect,test} from "bun:test";
import {compareMethods,extractParameters,type PaperParams} from "../src/methods/extract";

const A="Cells were cultured at 37 °C in RPMI. PBMCs were seeded at 1 × 10^6 cells/mL and stimulated with anti-CD3 at 1 µg/mL and IL-21 at 50 ng/mL for 72 h. Samples were centrifuged at 400 × g for 5 min.";
const B="Cells were cultured at 37 °C. Cells were plated at 2 x 10^6 cells/mL and stimulated with anti-CD3 at 5 µg/mL and IL-21 at 50 ng/mL for 5 days. Pellets were spun at 1,500 rpm.";
const pp=(id:string,t:string):PaperParams=>({id,title:id,url:"u",licence:"cc by",params:extractParameters(t)});

describe("extractParameters",()=>{
 test("finds duration, temperature, concentration, cell density and centrifugation, each with a quote",()=>{
  const p=extractParameters(A),kinds=new Set(p.map(x=>x.kind));
  for(const k of ["duration","temperature","concentration","cell_density","centrifugation"])expect(kinds.has(k as never)).toBe(true);
  for(const x of p){expect(x.quote.length).toBeGreaterThan(5);expect(x.quote.length).toBeLessThanOrEqual(250)}
  const il=p.find(x=>x.kind==="concentration"&&x.display.startsWith("50"))!;expect(il.agent).toContain("il-21");expect(il.normalized).toBe("50ng/ml");
  expect(p.find(x=>x.kind==="duration")!.normalized).toBe("4320min");expect(p.find(x=>x.kind==="cell_density")!.normalized).toBe("1000000/ml");
  expect(p.find(x=>x.kind==="centrifugation")!.normalized).toBe("400g");
 });
 test("normalises µ and μ, hours, days and 1,500 rpm; ignores out-of-range numbers",()=>{
  expect(extractParameters("Cells were stimulated with IL-2 at 20 μg/mL.").find(x=>x.kind==="concentration")!.normalized).toBe("20ug/ml");
  expect(extractParameters("Cells were incubated for 5 days.")[0]!.normalized).toBe("7200min");
  expect(extractParameters("Pellets were spun at 1,500 rpm.")[0]!.normalized).toBe("1500rpm");
  expect(extractParameters("Cells were centrifuged at 5 g.")).toHaveLength(0);
  expect(extractParameters("Samples were incubated at 900 °C.")).toHaveLength(0);
 });
 test("bounded: returns at most max items and handles empty or hostile text",()=>{
  expect(extractParameters("")).toEqual([]);
  expect(extractParameters(("Cells were cultured at 37 °C for "+"1 h. ").repeat(500),30).length).toBeLessThanOrEqual(30);
  expect(()=>extractParameters("a".repeat(2_000_000).slice(0,200_000))).not.toThrow();
 });
});

describe("compareMethods",()=>{
 const rows=compareMethods([pp("p1",A),pp("p2",B)]);
 test("flags parameters that differ and keeps ones that match, without saying which is better",()=>{
  const anti=rows.find(r=>r.kind==="concentration"&&r.agent.includes("anti-cd3"))!,il=rows.find(r=>r.kind==="concentration"&&r.agent.includes("il-21"))!,temp=rows.find(r=>r.kind==="temperature")!;
  expect(anti.differs).toBe(true);expect(il.differs).toBe(false);expect(temp.differs).toBe(false);
  expect(rows.find(r=>r.kind==="cell_density")!.differs).toBe(true);
  expect(JSON.stringify(rows)).not.toMatch(/\bbest\b|recommended|optimal/i);
 });
 test("differing rows sort first; every value carries its quote; a parameter in one paper only is not compared",()=>{
  const named=rows.filter(r=>!(r.agent===""&&(r.kind==="duration"||r.kind==="concentration"))),firstSame=named.findIndex(r=>!r.differs),lastDiff=named.map(r=>r.differs).lastIndexOf(true);expect(firstSame===-1||lastDiff<firstSame).toBe(true);
  for(const r of rows)for(const bp of r.byPaper)for(const v of bp.values)expect(v.quote.length).toBeGreaterThan(5);
  expect(compareMethods([pp("p1",A)])).toEqual([]);
  expect(rows.find(r=>r.kind==="centrifugation")).toBeUndefined();
  const g2=compareMethods([pp("p1",A),pp("p3","Samples were centrifuged at 300 × g for 10 min.")]).find(r=>r.kind==="centrifugation")!;expect(g2.differs).toBe(true);expect(g2.agent).toBe("g");
 });
});

describe("precision rules",()=>{
 test("nm and mm are lengths, not concentrations; nM and mM are",()=>{
  expect(extractParameters("Absorbance was measured at 450 nm and wells were 5 mm wide.").filter(x=>x.kind==="concentration")).toEqual([]);
  const c=extractParameters("Cells were treated with rapamycin at 20 nM and EDTA at 5 mM.").filter(x=>x.kind==="concentration");
  expect(c.map(x=>x.normalized).sort()).toEqual(["20nM".replace("nM","nM"),"5mM"].sort());
 });
 test("storage and on-ice temperatures are not treated as incubation temperatures",()=>{
  expect(extractParameters("Samples were stored at -80 °C until analysis.").filter(x=>x.kind==="temperature")).toEqual([]);
  expect(extractParameters("Cells were kept on ice at 4 °C and then incubated at 37 °C for 1 h.").filter(x=>x.kind==="temperature")).toEqual([]);
  expect(extractParameters("Cells were incubated at 37 °C for 1 h.").filter(x=>x.kind==="temperature").map(x=>x.display)).toEqual(["37 °C"]);
 });
 test("clause-like agent hints are dropped",()=>{
  const c=extractParameters("The plate was then read and IL-2 added at 20 ng/mL.").find(x=>x.kind==="concentration")!;
  expect(c.agent===""||!/\b(was|were|added|read)\b/.test(c.agent)).toBe(true);
 });
});
