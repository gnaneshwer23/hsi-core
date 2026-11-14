import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {HSI_ONTOLOGY_NAMESPACES} from "../src/hsiOntologyRegistry";

const audit=JSON.parse(readFileSync("research/ontology/ontology-sources.v1.json","utf8")) as {importAuthorised:boolean;sources:{prefix:string;licence:string;verification:string;inRegistry:boolean;recommendation:string;release:string}[]};
const RECS=["import_first","import_later","identifiers_only","decision_needed","verify_before_use","exclude_from_hsi_core","out_of_scope_for_hsi_core"];

const approved=(audit as unknown as {approvedPrefixes:string[];skippedByDecision:string[]});
test("import is authorised only for the approved prefixes, and HPO is skipped by decision",()=>{
 expect(audit.importAuthorised).toBe(true);
 expect(approved.approvedPrefixes.slice().sort()).toEqual(["CL","ECO","GO","MONDO","UBERON"]);
 expect(approved.skippedByDecision).toEqual(["HP"]);
 expect(approved.approvedPrefixes).not.toContain("HP");
});
test("every approved prefix was verified and recommended for first import",()=>{
 for(const p of approved.approvedPrefixes){const s=audit.sources.find(x=>x.prefix===p)!;expect(s.recommendation,p).toBe("import_first");expect(s.verification.startsWith("verified")||s.verification.startsWith("licence verified"),p).toBe(true)}
});
test("every registered ontology namespace is audited or is a non-ontology identifier",()=>{
 const audited=new Set(audit.sources.map(s=>s.prefix)),skip=new Set(["NCT","PMID"]);
 const missing=HSI_ONTOLOGY_NAMESPACES.map(n=>n.prefix).filter(p=>!audited.has(p)&&!skip.has(p));
 expect(missing).toEqual([]);
});
test("inRegistry flags match the namespace registry",()=>{
 const reg=new Set(HSI_ONTOLOGY_NAMESPACES.map(n=>n.prefix));
 for(const s of audit.sources)expect(s.inRegistry,s.prefix).toBe(reg.has(s.prefix));
});
test("every entry states a licence, how it was verified, and a known recommendation",()=>{
 for(const s of audit.sources){expect(s.licence.length,s.prefix).toBeGreaterThan(2);expect(s.verification.length,s.prefix).toBeGreaterThan(2);expect(RECS,s.prefix).toContain(s.recommendation)}
});
test("nothing is recommended for first import unless its licence was verified and is open",()=>{
 for(const s of audit.sources.filter(x=>x.recommendation==="import_first")){
  expect(s.verification.startsWith("verified")||s.verification.startsWith("licence verified"),s.prefix).toBe(true);
  expect(/^CC0|^CC BY/.test(s.licence),s.prefix).toBe(true);
 }
});
test("an unverified licence is never recommended for import",()=>{
 for(const s of audit.sources.filter(x=>x.verification==="not verified"))expect(["import_first","import_later"],s.prefix).not.toContain(s.recommendation);
});
