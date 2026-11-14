import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {parseOboFlat,parseOboJson} from "../src/ontology/oboTerms";
import {ingestRelease,sha256Hex,type ImportManifest,type ImportSource} from "../src/ontology/ontologyImport";
import {mapConcepts,normaliseLabel,type TermTable} from "../src/ontology/conceptMapping";
import {HSI_ONTOLOGY_NAMESPACES,validateHsiOntologyIdentifier} from "../src/hsiOntologyRegistry";

const OBO=`format-version: 1.2
data-version: eco/releases/2026-07-10/eco-basic.owl

[Term]
id: ECO:0000000
name: evidence
synonym: "evidence code" EXACT []
synonym: "loose" RELATED []

[Term]
id: ECO:0000001
name: old thing
is_obsolete: true

[Term]
id: ECO:0000002
name: child
is_a: ECO:0000000 ! evidence
is_a: GO:0000001 ! foreign parent

[Typedef]
id: part_of
name: part of
`;
const JSON_DOC=JSON.stringify({graphs:[{meta:{version:"http://purl.obolibrary.org/obo/mondo/releases/2026-11-03/mondo.owl"},nodes:[
 {id:"http://purl.obolibrary.org/obo/MONDO_0000001",type:"CLASS",lbl:"disease",meta:{synonyms:[{pred:"hasExactSynonym",val:"illness"},{pred:"hasRelatedSynonym",val:"sickness"}]}},
 {id:"http://purl.obolibrary.org/obo/MONDO_0000002",type:"CLASS",lbl:"child disease"},
 {id:"http://purl.obolibrary.org/obo/MONDO_0000003",type:"CLASS",lbl:"gone",meta:{deprecated:true}},
 {id:"http://purl.obolibrary.org/obo/BFO_0000001",type:"CLASS",lbl:"foreign"},
 {id:"http://purl.obolibrary.org/obo/mondo#prop",type:"PROPERTY",lbl:"prop"}],
 edges:[{sub:"http://purl.obolibrary.org/obo/MONDO_0000002",pred:"is_a",obj:"http://purl.obolibrary.org/obo/MONDO_0000001"},{sub:"http://purl.obolibrary.org/obo/MONDO_0000002",pred:"is_a",obj:"http://purl.obolibrary.org/obo/BFO_0000001"}]}]});

describe("OBO term extraction",()=>{
 test("flat OBO keeps exact synonyms, obsolete flags and same-ontology parents only",()=>{
  const r=parseOboFlat(OBO,"ECO");expect(r.dataVersion).toBe("eco/releases/2026-07-10/eco-basic.owl");
  expect(r.terms.map(t=>t.id)).toEqual(["ECO:0000000","ECO:0000001","ECO:0000002"]);
  expect(r.terms[0]!.synonyms).toEqual(["evidence code"]);expect(r.terms[1]!.obsolete).toBe(true);
  expect(r.terms[2]!.parents).toEqual(["ECO:0000000"]);
 });
 test("OBO JSON keeps class nodes under the prefix, exact synonyms and in-ontology is_a parents",()=>{
  const r=parseOboJson(JSON_DOC,"MONDO");expect(r.terms.map(t=>t.id)).toEqual(["MONDO:0000001","MONDO:0000002","MONDO:0000003"]);
  expect(r.terms[0]!.synonyms).toEqual(["illness"]);expect(r.terms[1]!.parents).toEqual(["MONDO:0000001"]);expect(r.terms[2]!.obsolete).toBe(true);
  expect(r.dataVersion).toContain("2026-11-03");
 });
 test("a file that is not OBO Graphs is rejected",()=>{expect(()=>parseOboJson("{}","MONDO")).toThrow()});
});

describe("release ingestion",()=>{
 const many=JSON.stringify({graphs:[{nodes:Array.from({length:150},(_,i)=>({id:`http://purl.obolibrary.org/obo/CL_${String(i).padStart(7,"0")}`,type:"CLASS",lbl:`cell ${i}`})),edges:[]}]});
 const src=(sha:string|null):ImportSource=>({prefix:"CL",name:"x",licence:"CC BY 4.0",release:"v1",format:"obo-json",url:"https://example.test/cl.json",sha256:sha,bytes:null,termCount:null});
 test("accepts a matching hash, rejects a mismatch, and rejects a file with too few terms",async()=>{
  const bytes=new TextEncoder().encode(many),h=await sha256Hex(bytes);
  expect((await ingestRelease(src(h),bytes)).extracted.terms.length).toBe(150);
  await expect(ingestRelease(src("0".repeat(64)),bytes)).rejects.toThrow("pinned sha256");
  await expect(ingestRelease(src(null),new TextEncoder().encode(JSON_DOC.replace(/MONDO/g,"CL")))).rejects.toThrow("refusing");
 });
});

describe("candidate concept mapping",()=>{
 const t=(prefix:string,terms:TermTable["terms"]):TermTable=>({prefix,release:"r",terms});
 const tables=[t("MONDO",[{id:"MONDO:1",label:"Crohn disease",synonyms:["Crohn's disease"],parents:[],obsolete:false},{id:"MONDO:2",label:"gone disease",synonyms:[],parents:[],obsolete:true}]),
  t("CL",[{id:"CL:1",label:"B cell",synonyms:[],parents:[],obsolete:false}]),t("UBERON",[{id:"UBERON:1",label:"B cell",synonyms:[],parents:[],obsolete:false}])];
 test("normalises punctuation, case and diacritics",()=>{expect(normaliseLabel("Crohn’s  Disease")).toBe("crohn s disease");expect(normaliseLabel("Blood–brain barrier")).toBe("blood-brain barrier")});
 test("matches on exact synonym, flags ambiguity across ontologies, and leaves the rest unmapped",()=>{
  const m=mapConcepts([{id:"c:1",name:"Crohn's disease"},{id:"c:2",name:"B cell"},{id:"c:3",name:"Gone disease"},{id:"c:4",name:"Something unrelated"}],tables);
  expect(m.map(x=>x.status)).toEqual(["candidate","ambiguous","obsolete_only","unmapped"]);
  expect(m[0]!.candidates[0]).toMatchObject({id:"MONDO:1",matchedOn:"exact_synonym"});
  expect(m[2]!.candidates).toEqual([]);expect(m[2]!.obsoleteMatches[0]!.id).toBe("MONDO:2");
 });
 test("every result is unreviewed and none is an approved exact mapping",()=>{
  for(const x of mapConcepts([{id:"c:1",name:"B cell"}],tables)){expect(x.reviewStatus).toBe("unreviewed");expect(x.exactMappingApproved).toBe(false)}
 });
});

describe("committed import artefacts",()=>{
 const manifest=JSON.parse(readFileSync("research/ontology/import-manifest.v1.json","utf8")) as ImportManifest;
 test("manifest pins exactly the approved set, with hashes, and skips HPO",()=>{
  expect(manifest.sources.map(s=>s.prefix)).toEqual(["MONDO","UBERON","CL","GO","ECO"]);
  for(const s of manifest.sources){expect(s.sha256,s.prefix).toMatch(/^[0-9a-f]{64}$/);expect(s.termCount!,s.prefix).toBeGreaterThan(1000);expect(/\/(latest|current)\//.test(s.url),s.prefix).toBe(false)}
  expect(manifest.skipped.map(s=>s.prefix)).toEqual(["HP"]);expect(manifest.sources.some(s=>s.prefix==="HP")).toBe(false);
 });
 test("candidate mappings are all unreviewed and never approved",()=>{
  const c=JSON.parse(readFileSync("research/ontology/candidate-mappings.v1.json","utf8")) as {conceptCount:number;summary:Record<string,number>;mappings:{reviewStatus:string;exactMappingApproved:boolean;status:string;candidates:unknown[]}[]};
  expect(c.mappings.length).toBe(c.conceptCount);
  expect(c.mappings.every(m=>m.reviewStatus==="unreviewed"&&m.exactMappingApproved===false)).toBe(true);
  expect(c.mappings.filter(m=>m.status==="candidate").every(m=>m.candidates.length===1)).toBe(true);
  expect(Object.values(c.summary).reduce((a,b)=>a+b,0)).toBe(c.conceptCount);
 });
 test("ECO is a registered namespace and validates",()=>{
  expect(HSI_ONTOLOGY_NAMESPACES.some(n=>n.prefix==="ECO")).toBe(true);
  validateHsiOntologyIdentifier("ECO","ECO:0000006");expect(()=>validateHsiOntologyIdentifier("ECO","ECO:6")).toThrow();
 });
});
