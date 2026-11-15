import {describe,expect,test} from "bun:test";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {sha256Hex} from "../src/clinicalPlane/sha256";
import {buildCohortFile} from "../scripts/build-synthetic-cohort";

describe("sha256Hex matches node:crypto",()=>{
 const cases=["","abc","The quick brown fox jumps over the lazy dog","é漢🧬 mixed unicode",..."0,1,55,56,57,63,64,65,119,120,121,1000".split(",").map(n=>"x".repeat(Number(n)))];
 for(const s of cases)test(`length ${s.length}: ${s.slice(0,12)}`,()=>{expect(sha256Hex(s)).toBe(createHash("sha256").update(s).digest("hex"))});
});
describe("synthetic cohort asset",()=>{
 test("the committed file is current with the source shards",()=>{expect(readFileSync("site/public/research/clinical-plane/synthetic-cohort.v1.json","utf8")).toBe(buildCohortFile())});
 test("only synthetic ids and the two needed labs are present",()=>{
  const x=JSON.parse(readFileSync("site/public/research/clinical-plane/synthetic-cohort.v1.json","utf8")) as {dataClass:string;patients:{id:string;labs:{test:string}[]}[]};
  expect(x.dataClass).toBe("synthetic");expect(x.patients).toHaveLength(200);
  for(const p of x.patients){expect(p.id).toMatch(/^SYN-P-\d{6}$/);for(const l of p.labs)expect(["HbA1c","hs-CRP"]).toContain(l.test)}
 });
});
