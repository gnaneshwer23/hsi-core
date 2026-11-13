import {describe,expect,test} from "bun:test";
import {mkdtemp,readdir,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {readFileSync} from "node:fs";
import {extractOpenAccessSections,retrieveOpenAccessSections,sectionsToPassages,classifySectionTitle} from "../src/researchV2/openAccessSections";
import {createModelEvidenceExtractor,type ExtractionRejection} from "../src/evidence/modelEvidenceExtraction";
import {createEntailmentVerifier} from "../src/evidence/entailmentVerifier";
import {createAuditFileStore,AuditChainConflictError} from "../src/evidence/auditFileStore";
import {buildSearchTerms,orientByPathways,validateOrientationEntities} from "../src/investigationOrientation";
import {FIXTURE_NOTICE,runFixtureInvestigation,validateRunnerFixture,type RunnerFixture} from "../src/investigationRunner";
import {createContextConflictAuditRunner,type ContextAuditHit,type ContextAuditTarget} from "../src/evidence/contextConflictAudit";
import {contextUnit,fixtureHash} from "./fixtures/contextConflictAudit";

const fixtureNamed=(name:string):RunnerFixture=>JSON.parse(readFileSync(new URL("../research/runner-fixtures/"+name+".v1.json",import.meta.url),"utf8"));
const PASSAGE_A="In a synthetic mouse study, colonic Metabolite M1 levels rose with Cytokine B production by regulatory T cells after 7 days (flow cytometry, n=10).";
const hitFor=(text:string,id="h1"):ContextAuditHit=>{
 const f=fixtureNamed("gut-immune-metabolic-crossdomain");const base=structuredClone(f);base.searches.support[0]!.text=text;base.searches.support[0]!.id=id;
 const probe=contextUnit("x");
 return {id,clearanceReceiptId:"fixture-clearance-"+id,source:{...probe.source,id:"fixture-source-"+id,url:"https://example.org/fixture/"+id},
  passage:{...probe.passage,id:"fixture-source-"+id+":p1",sourceId:"fixture-source-"+id,text,sha256:fixtureHash(text)}};
};
const target:ContextAuditTarget={investigationId:"synthetic-runner",diseaseScope:"gut-immune-metabolic",question:"How might a metabolite influence immune signalling?",release:{id:"r",version:"1",manifestHash:fixtureHash("r")}};
const goodOutput=(over:Record<string,unknown>={})=>({claim:{subject:{system:"FIXTURE",value:"metabolite-m1",label:"Metabolite M1"},predicate:"associated_with",object:{system:"FIXTURE",value:"cytokine-b",label:"Cytokine B"},polarity:"supporting",quote:"Metabolite M1 levels rose with Cytokine B production"},context:{species:{quote:"mouse"},tissueCompartment:{quote:"colonic"},assay:{quote:"flow cytometry"},timing:{status:"not_reported",reason:"not stated"}},note:null,...over});

describe("open-access section extraction (P2-02)",()=>{
 const xml=`<article><front><article-meta><abstract><p>Abstract paragraph that is long enough to be kept as a paragraph.</p></abstract></article-meta></front>
 <body><sec><title>Materials and Methods</title><p>Mice were housed under standard conditions and sampled at seven days after treatment.</p>
 <sec><title>Flow cytometry</title><p>Cells were stained and acquired on a flow cytometer; gating followed the pre-specified plan.</p></sec></sec>
 <sec><title>Results</title><p>Metabolite M1 rose in the colon of treated mice compared with controls (n=10 per group).</p>
 <fig><caption><p>Figure caption paragraph that must never be treated as body prose by the parser.</p></caption></fig>
 <p>Too short.</p><p>This paragraph has an unsupported entity &nbsp; that must be skipped entirely by the parser.</p></sec></body>
 <back><ref-list><ref><p>Reference list paragraph that should be excluded from every extracted section here.</p></ref></ref-list></back></article>`;
 test("returns abstract, methods and results paragraphs with hashes and locators; excludes figures, references, short and unsupported text",()=>{
  const out=extractOpenAccessSections(xml,"PMC1234567");
  const kinds=out.sections.map(s=>s.kind);expect(kinds).toContain("abstract");expect(kinds).toContain("methods");expect(kinds).toContain("results");
  const all=out.sections.flatMap(s=>s.paragraphs);
  expect(all.some(p=>/Figure caption|Reference list/.test(p.text))).toBe(false);
  expect(out.skippedParagraphs).toBeGreaterThanOrEqual(2);
  expect(out.sections.find(s=>s.title==="Materials and Methods > Flow cytometry")?.kind).toBe("methods");
  for(const p of all){expect(p.sha256).toMatch(/^[a-f0-9]{64}$/);expect(p.locator.length).toBeGreaterThan(0)}
  expect(out.reuseRightsVerified).toBe(false);expect(out.correctionStatusVerified).toBe(false);
 });
 test("passages are public_real candidates with matching digests and are filtered by section kind",()=>{
  const out=extractOpenAccessSections(xml,"PMC1234567");
  const passages=sectionsToPassages(out,{sourceId:"src-1",sourceVersion:"v1",kinds:["results"]});
  expect(passages.length).toBeGreaterThan(0);expect(passages.every(p=>p.dataClass==="public_real"&&p.sourceId==="src-1"&&p.sha256!==null)).toBe(true);
  expect(passages.some(p=>/Mice were housed/.test(p.text))).toBe(false);
 });
 test("fails closed on DTD/entity declarations, bad ids, missing content and oversize input",()=>{
  expect(()=>extractOpenAccessSections("<!DOCTYPE x><article></article>","PMC1")).toThrow();
  expect(()=>extractOpenAccessSections(xml,"../evil")).toThrow();
  expect(()=>extractOpenAccessSections("<article><front/></article>","PMC1")).toThrow();
  expect(()=>extractOpenAccessSections("<article>"+"x".repeat(2_000_001)+"</article>","PMC1")).toThrow();
 });
 test("bounds the number of paragraphs and says so",()=>{
  const many="<article><body><sec><title>Results</title>"+Array.from({length:450},(_,i)=>`<p>Paragraph number ${i} with enough characters to pass the minimum length check.</p>`).join("")+"</sec></body></article>";
  const out=extractOpenAccessSections(many,"PMC9");expect(out.paragraphCount).toBe(400);expect(out.truncated).toBe(true);
 });
 test("retrieval requires an XML response and a valid id; classification is title based",async()=>{
  const ok=async()=>new Response(xml,{status:200,headers:{"content-type":"application/xml"}});
  expect((await retrieveOpenAccessSections("PMC1234567",ok)).paragraphCount).toBeGreaterThan(0);
  await expect(retrieveOpenAccessSections("PMC1234567",async()=>new Response(xml,{status:200,headers:{"content-type":"text/html"}}))).rejects.toThrow();
  await expect(retrieveOpenAccessSections("PMC1234567",async()=>new Response("",{status:404}))).rejects.toThrow();
  expect(classifySectionTitle("Patients and Methods")).toBe("methods");expect(classifySectionTitle("Results and Discussion")).toBe("results");expect(classifySectionTitle("Acknowledgements")).toBe("other");
 });
});

describe("span-grounded model extraction",()=>{
 const run=async(output:unknown,text=PASSAGE_A)=>{const rejections:ExtractionRejection[]=[];
  const unit=await createModelEvidenceExtractor({runner:async()=>output,onRejection:r=>rejections.push(r)})(hitFor(text),target);return {unit,rejections}};
 test("stores each reported context value as a span that equals the quoted text",async()=>{
  const {unit,rejections}=await run(goodOutput());
  expect(rejections).toEqual([]);expect(unit.findingPolarity).toBe("supporting");
  const f=unit.detailedContext!.fields as Record<string,{status:string;originalText:string|null;span:{start:number;end:number}|null}>;
  for(const k of ["species","tissueCompartment","assay"]){expect(f[k]!.status).toBe("reported");expect(PASSAGE_A.slice(f[k]!.span!.start,f[k]!.span!.end)).toBe(f[k]!.originalText!)}
  expect(f.timing!.status).toBe("not_reported");expect(f.estimand!.status).toBe("not_extracted");
 });
 test("a quote that is not in the passage becomes an explicit gap and is logged, never a value",async()=>{
  const {unit,rejections}=await run(goodOutput({context:{species:{quote:"rhesus macaque"},assay:{quote:"flow cytometry"}}}));
  const f=unit.detailedContext!.fields as Record<string,{status:string}>;
  expect(f.species!.status).toBe("not_extracted");expect(f.assay!.status).toBe("reported");
  expect(rejections.some(r=>r.field==="species")).toBe(true);
 });
 test("an ungrounded or malformed claim degrades to an unresolved, uncertain unit with no extracted context",async()=>{
  for(const bad of [goodOutput({claim:{...goodOutput().claim,quote:"text that is not in the passage"}}),{unexpected:true},null,"text",goodOutput({claim:{...goodOutput().claim,polarity:"proves"}}),goodOutput({claim:{...goodOutput().claim,predicate:"Bad Predicate!"}})]){
   const {unit,rejections}=await run(bad);
   expect(unit.findingPolarity).toBe("uncertain");expect(unit.subject.system).toBe("HSI-UNRESOLVED");
   expect(Object.values(unit.detailedContext!.fields).every(v=>v.status!=="reported")).toBe(true);expect(rejections.length).toBeGreaterThan(0);
  }
 });
 test("a failing model runner degrades the same way and never throws into the audit",async()=>{
  const rejections:ExtractionRejection[]=[];
  const unit=await createModelEvidenceExtractor({runner:async()=>{throw Error("outage")},onRejection:r=>rejections.push(r)})(hitFor(PASSAGE_A),target);
  expect(unit.subject.system).toBe("HSI-UNRESOLVED");expect(rejections[0]!.reason).toBe("Model runner failed");
 });
});

describe("entailment verifier adapter",()=>{
 const comparisonsFor=async(texts:string[])=>{
  const extract=createModelEvidenceExtractor({runner:async()=>goodOutput()});
  const units=[];for(const [i,t] of texts.entries())units.push(await extract(hitFor(t,"u"+i),target));
  return units.length<2?[]:[{left:units[0]!,right:units[1]!}] as unknown as Parameters<ReturnType<typeof createEntailmentVerifier>>[0]["comparisons"];
 };
 const supports=(span:string)=>async()=>({verdict:"supports",evidenceSpan:span,reason:"stated directly"});
 const two=[PASSAGE_A,PASSAGE_A.replace("mouse","rat")];
 test("all verifiers supporting every unit gives a deterministic receipt; any dissent or ungrounded span gives needs_evidence",async()=>{
  const material={target,comparisons:await comparisonsFor(two),gaps:[]};
  const span="Metabolite M1 levels rose";
  const mk=(ra:ReturnType<typeof supports>,rb:ReturnType<typeof supports>)=>createEntailmentVerifier({verifiers:[{verifierId:"va",modelId:"m",runner:ra},{verifierId:"vb",modelId:"m",runner:rb}]});
  const a=await mk(supports(span),supports(span))(material),b=await mk(supports(span),supports(span))(material);
  expect(a.status).toBe("checked_with_limitations");expect(a.receiptId).toBe(b.receiptId);
  expect((await mk(supports(span),async()=>({verdict:"contradicts",evidenceSpan:span,reason:"no"}))(material)).status).toBe("needs_evidence");
  expect((await mk(supports(span),supports("a quote that is not in the passage"))(material)).status).toBe("needs_evidence");
 });
 test("unresolved units are never sent to a model and block a clean verdict; verifiers must be distinct",async()=>{
  let calls=0;const unit=await createModelEvidenceExtractor({runner:async()=>null})(hitFor(PASSAGE_A,"z0"),target);
  const material={target,comparisons:[{left:unit,right:unit}] as never,gaps:[]};
  const v=createEntailmentVerifier({verifiers:[{verifierId:"va",modelId:"m",runner:async()=>{calls++;return {}}}]});
  expect((await v(material)).status).toBe("needs_evidence");expect(calls).toBe(0);
  expect(()=>createEntailmentVerifier({verifiers:[{verifierId:"va",modelId:"m",runner:supports("x")},{verifierId:"va",modelId:"n",runner:supports("x")}]})).toThrow();
  expect(()=>createEntailmentVerifier({verifiers:[]})).toThrow();
 });
});

describe("append-only audit store",()=>{
 async function twoVersions(dir:string){
  const f=fixtureNamed("ssc-regression");const first=await runFixtureInvestigation({fixture:f,storeDirectory:dir});
  const second=await runFixtureInvestigation({fixture:f,storeDirectory:dir});return {first,second};
 }
 test("versions chain by hash, history is ordered and reopen returns the latest",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"hsi-audit-"));
  try{
   const {first,second}=await twoVersions(dir);
   expect(first.audit.version).toBe(1);expect(second.audit.version).toBe(2);expect(second.audit.parentAuditHash).toBe(first.audit.auditHash);
   const store=createAuditFileStore(dir),history=await store.history(first.audit.investigationId);
   expect(history.map(a=>a.version)).toEqual([1,2]);expect((await store.latest(first.audit.investigationId))!.auditHash).toBe(second.audit.auditHash);
   await expect(store.append(first.audit,null)).rejects.toBeInstanceOf(AuditChainConflictError);
   await expect(store.latest("../escape")).rejects.toThrow();
  }finally{await rm(dir,{recursive:true,force:true})}
 });
 test("concurrent writers cannot create the same version twice",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"hsi-audit-"));
  try{
   const f=fixtureNamed("ssc-regression"),first=await runFixtureInvestigation({fixture:f,storeDirectory:dir});
   // Two real runs start from the same latest version and race to append version 2.
   const results=await Promise.allSettled([runFixtureInvestigation({fixture:f,storeDirectory:dir}),runFixtureInvestigation({fixture:f,storeDirectory:dir})]);
   expect(results.filter(x=>x.status==="fulfilled")).toHaveLength(1);expect(results.filter(x=>x.status==="rejected")).toHaveLength(1);
   const files=(await readdir(join(dir,first.audit.investigationId))).filter(n=>/^v2-.*\.json$/.test(n));expect(files).toHaveLength(1);
   expect((await createAuditFileStore(dir).history(first.audit.investigationId)).map(a=>a.version)).toEqual([1,2]);
  }finally{await rm(dir,{recursive:true,force:true})}
 });
});

describe("fixture-mode investigations (two unlike scopes, one code path)",()=>{
 for(const [name,scope] of [["ssc-regression","ssc"],["gut-immune-metabolic-crossdomain","gut-immune-metabolic"]] as const){
  test(name+": reproducible, passage-traced, non-promotable, labelled synthetic",async()=>{
   const fixture=fixtureNamed(name);
   const a=await runFixtureInvestigation({fixture}),b=await runFixtureInvestigation({fixture});
   expect(a.audit.diseaseScope).toBe(scope);expect(a.audit.auditHash).toBe(b.audit.auditHash);
   expect(a.audit.units).toHaveLength(2);expect(a.rejections).toEqual([]);expect(a.audit.verifier.status).toBe("checked_with_limitations");expect(a.entailments).toHaveLength(4);
   for(const u of a.audit.units){const c=u.detailedContext!;expect(c.passageText.length).toBeGreaterThan(0);expect(c.sourceId).toBe(u.evidenceSourceIds[0]);
    for(const field of Object.values(c.fields))if(field.status==="reported")expect(c.passageText.slice(field.span!.start,field.span!.end)).toBe(field.originalText!)}
   for(const c of a.entailments)expect(c.verdict==="supports"?c.evidenceSpan!==null:true).toBe(true);
   expect(a.audit.scientificApproval).toBe(false);expect(a.audit.graphPromotable).toBe(false);expect(a.audit.consensusEstablished).toBe(false);expect(a.audit.humanReview.status).toBe("required");
   expect(a.brief).toContain(FIXTURE_NOTICE);expect(a.audit.report[0]!.classification).not.toBe("consistent");
   expect(a.audit.gaps.length).toBeGreaterThan(0);
  });
 }
 test("a missing recorded output is a rejection in the failure ledger, not an invented value",async()=>{
  const fixture=fixtureNamed("gut-immune-metabolic-crossdomain");delete fixture.recorded.extraction["g2"];
  const r=await runFixtureInvestigation({fixture});
  expect(r.rejections.some(x=>x.hitId==="g2")).toBe(true);expect(r.audit.units.find(u=>u.id==="g2")!.findingPolarity).toBe("uncertain");
  expect(r.audit.verifier.status).toBe("needs_evidence");expect(r.brief).toContain("Extraction rejections");
 });
 test("an empty oppose search is reported as missing evidence, never as consensus",async()=>{
  const fixture=fixtureNamed("ssc-regression");fixture.searches.oppose=[];
  const r=await runFixtureInvestigation({fixture});
  expect(r.audit.consensusEstablished).toBe(false);expect(r.audit.gaps.join(" ")).toContain("oppose");
 });
 test("fixtures must declare themselves synthetic and stay bounded",()=>{
  const f=fixtureNamed("ssc-regression");
  expect(()=>validateRunnerFixture({...f,notice:"real evidence"})).toThrow();
  expect(()=>validateRunnerFixture({...f,scope:"sle"})).toThrow();
  expect(()=>validateRunnerFixture({...f,searches:{support:[],oppose:[]}})).toThrow();
 });
 test("the audit runner still rejects a target scope that is not registered",async()=>{
  const runner=createContextConflictAuditRunner({enabled:true,search:async()=>{throw Error("no")},authorizePassage:async()=>true,extract:async()=>{throw Error("no")},verify:async()=>({status:"not_executed",receiptId:null}),append:async()=>{}});
  await expect(runner.run({...target,diseaseScope:"sle" as never})).rejects.toThrow();
 });
});

describe("pathway orientation step",()=>{
 const listing=(rows:{id:string;name:string}[])=>async()=>new Response(JSON.stringify(rows.map(r=>({stId:r.id,displayName:r.name,speciesName:"Homo sapiens",schemaClass:"Pathway"}))),{status:200});
 test("lists pathways per entity, de-duplicates draft nodes shared by entities, and stays non-promotable navigation only",async()=>{
  const fetcher=listing([{id:"R-HSA-1",name:"Pathway one"},{id:"R-HSA-2",name:"Pathway two"}]);
  const o=await orientByPathways({entities:[{label:"Protein A",uniprot:"p00001"},{label:"Protein B",uniprot:"P00002"}],fetcher});
  expect(o.entities.map(e=>e.status)).toEqual(["listed","listed"]);expect(o.entities[0]!.accession).toBe("P00001");
  expect(o.draftNodes.map(n=>n.id)).toEqual(["pathway.reactome.R-HSA-1","pathway.reactome.R-HSA-2"]);
  expect(o.draftNodes.every(n=>n.reviewState==="draft")).toBe(true);
  expect(o.navigationOnly).toBe(true);expect(o.claimSupport).toBe(false);expect(o.graphPromotable).toBe(false);expect(o.membershipInterpretation).toBe("listed_by_provider_not_context_specific");
 });
 test("one failing lookup is recorded and does not stop the others or throw",async()=>{
  const fetcher=async(url:unknown)=>String(url).includes("/P00001/")?new Response("{}",{status:503}):listing([{id:"R-HSA-9",name:"Pathway nine"}])();
  const o=await orientByPathways({entities:[{label:"Protein A",uniprot:"P00001"},{label:"Protein B",uniprot:"P00002"}],fetcher});
  expect(o.entities[0]!.status).toBe("unavailable");expect(o.entities[0]!.reason).toContain("provider_error");expect(o.entities[1]!.status).toBe("listed");
  const bad=await orientByPathways({entities:[{label:"Protein A",uniprot:"P00001"}],fetcher:async()=>{throw Error("offline")}});
  expect(bad.entities[0]!.status).toBe("unavailable");expect(bad.draftNodes).toEqual([]);
 });
 test("entity input is validated: shape, label safety, duplicates and count",()=>{
  expect(()=>validateOrientationEntities([{label:"A",uniprot:"P00001",extra:1}])).toThrow();
  expect(()=>validateOrientationEntities([{label:"<script>",uniprot:"P00001"}])).toThrow();
  expect(()=>validateOrientationEntities([{label:"A",uniprot:"P00001"},{label:"B",uniprot:"p00001"}])).toThrow();
  expect(()=>validateOrientationEntities(Array.from({length:9},(_,i)=>({label:"E"+i,uniprot:"P0000"+i})))).toThrow();
  expect(validateOrientationEntities([{label:" Protein A ",uniprot:"p00001"}])).toEqual([{label:"Protein A",uniprot:"P00001"}]);
 });
 test("search terms are bounded, de-duplicated, safe, and put entity labels before pathway names",async()=>{
  const many=Array.from({length:20},(_,i)=>({id:"R-HSA-"+(i+1),name:"Pathway "+(i+1)}));
  const o=await orientByPathways({entities:[{label:"Protein A",uniprot:"P00001"}],fetcher:listing(many),maxPathwaysPerEntity:20});
  const terms=buildSearchTerms("How might protein A matter?",o);
  expect(terms.length).toBeLessThanOrEqual(8);expect(terms[0]).toBe("How might protein A matter?");expect(terms[1]).toBe("Protein A");
  expect(new Set(terms.map(t=>t.toLowerCase())).size).toBe(terms.length);expect(terms.every(t=>t.length<=120&&!/[<>]/.test(t))).toBe(true);
 });
 for(const name of ["ssc-regression","gut-immune-metabolic-crossdomain"]){
  test(name+": orientation is recorded in the result and brief, and uses no network",async()=>{
   const original=globalThis.fetch;globalThis.fetch=(()=>{throw Error("network call attempted")}) as unknown as typeof fetch;
   try{
    const r=await runFixtureInvestigation({fixture:fixtureNamed(name)});
    expect(r.orientation).not.toBeNull();expect(r.orientation!.entities.length).toBeGreaterThan(0);expect(r.orientation!.entities.some(e=>e.status==="listed")).toBe(true);
    expect(r.brief).toContain("Pathway orientation (navigation aid, not evidence)");expect(r.brief).toContain("not part of the audit");
    expect(r.orientation!.graphPromotable).toBe(false);expect(r.orientation!.claimSupport).toBe(false);
   }finally{globalThis.fetch=original}
  });
 }
 test("the audit does not depend on orientation: same units, comparisons and verifier without entities; an unavailable lookup never blocks",async()=>{
  const withEntities=await runFixtureInvestigation({fixture:fixtureNamed("gut-immune-metabolic-crossdomain")});
  expect(withEntities.orientation!.entities.some(e=>e.status==="unavailable")).toBe(true);
  const stripped=fixtureNamed("gut-immune-metabolic-crossdomain");delete stripped.entities;
  const without=await runFixtureInvestigation({fixture:stripped});
  expect(without.orientation).toBeNull();expect(without.brief).not.toContain("Pathway orientation");
  expect(withEntities.audit.units.map(u=>u.id)).toEqual(without.audit.units.map(u=>u.id));
  expect(withEntities.audit.report.map(r=>r.classification)).toEqual(without.audit.report.map(r=>r.classification));
  expect(withEntities.audit.verifier.status).toBe(without.audit.verifier.status);
 });
 test("invalid fixture entities are rejected before any run",()=>{
  const f=fixtureNamed("ssc-regression");
  expect(()=>validateRunnerFixture({...f,entities:[{label:"A",uniprot:"P00001"},{label:"B",uniprot:"P00001"}]})).toThrow();
 });
});
