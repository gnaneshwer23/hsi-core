/** Literature brief: provenance binding, claim-state ceiling, tamper evidence, inert rendering, export and reopen.
 * The candidate sets come from the REAL retrieval executor, orchestrator and gateway with injected fetchers; nothing live. */
import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,readFileSync,readdirSync,renameSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createToolAuditLog,createToolGateway,type AuditRecord} from "../src/governedToolGateway";
import {governedProviderCatalogue} from "../src/governedProviderTools";
import {createFileLiteratureSink,createLiteratureRetrievalExecutor,createMemoryLiteratureSink,type LiteratureCandidateSet} from "../src/governedLiteratureRetrievalExecutor";
import {runHsiAgentOrchestration} from "../src/hsiAgentOrchestrator";
import {canonicalHsiManifest} from "../src/gatewayCallerAuthority";
import {hashHsiCheckpointInput} from "../src/hsiAgentDurableCheckpoint";
import {buildLiteratureBrief,createFileBriefStore,exportLiteratureBrief,renderLiteratureBrief,verifyLiteratureBrief,verifyLiteratureBriefExport,type ClaimInput,type LiteratureBrief} from "../src/literatureBrief";

const dirs:string[]=[];const mkd=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-brief-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const j=(b:unknown,status=200)=>new Response(JSON.stringify(b),{status});
const epmcHit=(pmid:string,title:string)=>({id:pmid,source:"MED",pmid,title,doi:"10.1000/x",pubYear:"2020"});
const oaHit=(w:string,pmid:string,title:string)=>({id:`https://openalex.org/${w}`,title,doi:"https://doi.org/10.1000/x",publication_year:2020,type:"article",ids:{pmid:`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}});
const crHit=(doi:string,title:string)=>({DOI:doi,title:[title],issued:{"date-parts":[[2020]]},type:"journal-article","container-title":["J"]});

/** Runs the real retrieval step and returns its set, ref and the gateway's audit records. */
async function retrieve(opts:{epmc?:unknown[];openalex?:unknown[];crossref?:unknown[];failOpenalex?:boolean;sink?:ReturnType<typeof createMemoryLiteratureSink>|ReturnType<typeof createFileLiteratureSink>}={}){
 const audit=createToolAuditLog(),sink=opts.sink??createMemoryLiteratureSink();
 const f=(async(u:string)=>{const h=new URL(u).hostname;
  if(h==="www.ebi.ac.uk")return j({resultList:{result:opts.epmc??[epmcHit("42","Shared paper"),epmcHit("43","Second paper")]}});
  if(h==="api.openalex.org")return opts.failOpenalex?new Response("x",{status:500}):j({results:opts.openalex??[oaHit("W1","42","Shared paper OA")]});
  if(h==="api.crossref.org")return j({message:{items:opts.crossref??[crHit("10.1000/y","Crossref only")]}});
  throw Error("unexpected host");}) as never;
 const gw=createToolGateway({tools:governedProviderCatalogue({}),audit,fetcher:f,sleep:async()=>{}});
 const r=await runHsiAgentOrchestration({investigationId:"inv-brief",tasks:[{id:"retrieve",manifest:canonicalHsiManifest("evidence_retriever"),dependsOn:[]}],graphRelease:{id:"rel",version:"1.0.0",manifestHash:"a".repeat(64)},dataClass:"public_biomedical",toolGateway:gw,
  executors:{evidence_retriever:createLiteratureRetrievalExecutor({terms:()=>["IL-21","fibrosis"],sink})}});
 const ref=r.results.retrieve!.outputRef!;
 return {set:await (sink as {load:(r:string)=>Promise<LiteratureCandidateSet>}).load(ref),ref,audit:audit.records() as AuditRecord[],sink};
}
const claim=(over:Partial<ClaimInput>={}):ClaimInput=>({claimId:"c-001",sourceCanonicalId:"PMID:42",statement:"IL-21 signalling is reported in fibroblast activation.",state:"extracted",...over});
const rehash=(b:LiteratureBrief):LiteratureBrief=>{const {contentHash:_,...body}=b;return {...body,contentHash:hashHsiCheckpointInput(body)} as LiteratureBrief};

/* ---------- build from a real run ---------- */
test("a brief built from a real retrieval run lists unreviewed, retrieved sources bound to the gateway audit log",async()=>{
 const {set,ref,audit}=await retrieve();
 const b=buildLiteratureBrief({set,ref,audit,question:"Which cytokines drive fibroblast activation?"});
 expect(b).toMatchObject({schemaVersion:"hsi-literature-brief-1",investigationId:"inv-brief",scope:"research_only",clinicalUse:"none",publicationEligible:false,graphPromotion:"none",claimsNote:"No extraction has run"});
 expect(b.sources.map(s=>s.canonicalId)).toEqual(["DOI:10.1000/y","PMID:42","PMID:43"]);
 expect(b.sources.every(s=>s.state==="retrieved"&&s.reviewStatus==="unreviewed")).toBe(true);
 expect(b.sources.find(s=>s.canonicalId==="PMID:42")!.providers).toEqual(["europe-pmc","openalex"]);
 expect(b.provenance.audit).toMatchObject({status:"verified",records:3});expect(b.provenance.audit.headHash).toBe(audit[2]!.hash);
 expect(b.provenance.receipts.map(r=>r.provider)).toEqual(["europe-pmc","openalex","crossref"]);
 expect(b.sourceSet.ref).toBe(ref);expect(b.limitations.join(" ")).toContain("sources only");
 expect(verifyLiteratureBrief(b)).toEqual(b);
 expect(buildLiteratureBrief({set,ref,audit,question:"Which cytokines drive fibroblast activation?"}).contentHash).toBe(b.contentHash); // deterministic
});
test("the reference must match the set, and an unverified brief says so",async()=>{
 const {set,ref}=await retrieve();
 expect(()=>buildLiteratureBrief({set,ref:"lit://"+"0".repeat(40)})).toThrow("Reference");
 const b=buildLiteratureBrief({set,ref});
 expect(b.provenance.audit).toMatchObject({status:"not_supplied",headHash:null});expect(b.limitations.join(" ")).toContain("Not checked against the gateway audit log");
});
test("an incomplete retrieval is carried into the brief as a visible limitation",async()=>{
 const {set,audit}=await retrieve({failOpenalex:true});
 const b=buildLiteratureBrief({set,audit});
 expect(b.provenance.incomplete).toBe(true);expect(b.limitations.some(l=>l.includes("openalex")&&l.includes("did not answer"))).toBe(true);
 expect(b.provenance.audit.status).toBe("verified"); // the refused call is also bound to its audit record
});

/* ---------- audit binding ---------- */
test("receipts must match the audit log: a broken chain, an edited hash, another investigation, another provider and a success/refusal swap are all refused",async()=>{
 const {set,audit}=await retrieve({failOpenalex:true});
 buildLiteratureBrief({set,audit});
 const edit=(f:(a:AuditRecord[])=>void)=>{const a=structuredClone(audit);f(a);return a};
 expect(()=>buildLiteratureBrief({set,audit:edit(a=>{a[0]!.outcome="refused"})})).toThrow("Audit chain");
 expect(()=>buildLiteratureBrief({set:{...set,calls:set.calls.map((c,i)=>i===0?{...c,responseHash:"f".repeat(64)}:c)},audit})).toThrow("hashes");
 expect(()=>buildLiteratureBrief({set:{...set,investigationId:"inv-other"},audit})).toThrow("audit record");
 expect(()=>buildLiteratureBrief({set:{...set,calls:set.calls.map((c,i)=>i===0?{...c,provider:"crossref"}:c.provider==="crossref"?{...c,provider:"europe-pmc"}:c)},audit})).toThrow();
 expect(()=>buildLiteratureBrief({set:{...set,calls:set.calls.map(c=>c.provider==="openalex"?{...c,ok:true,code:null,requestHash:"a".repeat(64),responseHash:"b".repeat(64)}:c)},audit})).toThrow();
 expect(()=>buildLiteratureBrief({set:{...set,calls:set.calls.map(c=>c.provider==="openalex"?{...c,code:"timeout"}:c)},audit})).toThrow("Failure receipt");
 expect(()=>buildLiteratureBrief({set:{...set,calls:set.calls.map((c,i)=>i===0?{...c,auditSeq:99}:c)},audit})).toThrow();
});

/* ---------- set validation and source hygiene ---------- */
test("a set that is not candidate-only, has a reviewed candidate, repeats a provider or is malformed is refused",async()=>{
 const {set}=await retrieve();
 const bad:unknown[]=[{...set,evidenceStatus:"approved"},{...set,schemaVersion:"x"},{...set,candidates:set.candidates.map((c,i)=>i===0?{...c,reviewStatus:"approved"}:c)},{...set,calls:[...set.calls,...set.calls]},{...set,calls:[]},{...set,terms:[]},{...set,investigationId:"../x"},{...set,quarantined:-1},null,"str"];
 for(const s of bad)expect(()=>buildLiteratureBrief({set:s as never})).toThrow();
});
test("hits with an unapproved link or from a provider that never answered are dropped and counted, never listed",async()=>{
 const {set}=await retrieve();
 const bad=[{...set.candidates[0]!,canonicalId:"PMID:900",sourceUrl:"https://evil.example/paper"},{...set.candidates[0]!,canonicalId:"PMID:901",sourceUrl:"http://europepmc.org/abstract/MED/1"},{...set.candidates[0]!,canonicalId:"PMID:902",sourceUrl:"javascript:alert(1)"},{...set.candidates[0]!,canonicalId:"PMID:903",providers:["ghost-provider"]}];
 const b=buildLiteratureBrief({set:{...set,candidates:[...set.candidates,...bad]}});
 expect(b.sources.map(s=>s.canonicalId)).not.toEqual(expect.arrayContaining(["PMID:900"]));expect(b.sources.some(s=>/90[0-3]/.test(s.canonicalId))).toBe(false);
 expect(b.provenance.rejectedSources).toBe(4);expect(b.limitations.join(" ")).toContain("4 hit(s) were dropped");
});
test("possible personal health information in a question, term, title or claim refuses the brief",async()=>{
 const {set}=await retrieve();
 expect(()=>buildLiteratureBrief({set,question:"What is the NHS number 123 for this patient?"})).toThrow("personal health");
 expect(()=>buildLiteratureBrief({set:{...set,candidates:set.candidates.map((c,i)=>i===0?{...c,title:"MRN 4455"}:c)}})).toThrow("personal health");
 expect(()=>buildLiteratureBrief({set,claims:[claim({statement:"patient name is recorded"})]})).toThrow("personal health");
});

/* ---------- claims and the state ceiling ---------- */
test("claims in extracted, candidate and model_assessed states are carried, linked, and never promotable or verified",async()=>{
 const {set}=await retrieve();
 const b=buildLiteratureBrief({set,claims:[claim(),claim({claimId:"c-002",sourceCanonicalId:"pmid:43",state:"candidate",context:{species:"human",tissue:"skin",method:"RNA-seq"}}),claim({claimId:"c-003",state:"model_assessed",assessmentRef:"assess://run-7/claim-3"})]});
 expect(b.claims.map(c=>[c.claimId,c.state,c.sourceCanonicalId])).toEqual([["c-001","extracted","PMID:42"],["c-002","candidate","PMID:43"],["c-003","model_assessed","PMID:42"]]);
 expect(b.claims.every(c=>c.independentlyVerified===false&&c.promotable===false&&c.contextNormalised===false)).toBe(true);
 expect(b.claims[1]!.context).toEqual({species:"human",tissue:"skin",cellType:null,method:"RNA-seq"});
 expect(b.claimsNote).toBeNull();expect(b.limitations.join(" ")).toContain("not been normalised");
});
test("this module cannot create a claim above model_assessed, or one that is orphaned, duplicated or mis-referenced",async()=>{
 const {set}=await retrieve();
 for(const state of ["independently_reviewed","approved","retrieved","published","","APPROVED",undefined as never,42 as never])expect(()=>buildLiteratureBrief({set,claims:[claim({state})]})).toThrow("cannot be created");
 expect(()=>buildLiteratureBrief({set,claims:[claim({sourceCanonicalId:"PMID:999"})]})).toThrow("link to a source");
 expect(()=>buildLiteratureBrief({set,claims:[claim(),claim()]})).toThrow("duplicate");
 for(const claimId of ["c-","C-001","c-001;drop","x-001","c-"+"a".repeat(50)])expect(()=>buildLiteratureBrief({set,claims:[claim({claimId})]})).toThrow();
 expect(()=>buildLiteratureBrief({set,claims:[claim({statement:"  "})]})).toThrow();
 expect(()=>buildLiteratureBrief({set,claims:[claim({state:"model_assessed"})]})).toThrow("name its assessment");
 expect(()=>buildLiteratureBrief({set,claims:[claim({state:"model_assessed",assessmentRef:"bad ref!"})]})).toThrow();
 expect(()=>buildLiteratureBrief({set,claims:[claim({state:"candidate",assessmentRef:"assess://x/1"})]})).toThrow("Only a model-assessed");
 expect(()=>buildLiteratureBrief({set,claims:Array.from({length:201},(_,i)=>claim({claimId:`c-${String(i).padStart(4,"0")}`}))})).toThrow("Too many");
});

/* ---------- verification ---------- */
test("verification refuses every promotion or re-labelling, even when the attacker recomputes the hash",async()=>{
 const {set,audit}=await retrieve();
 const b=buildLiteratureBrief({set,audit,claims:[claim({state:"model_assessed",assessmentRef:"assess://run-7/claim-3"})]});
 const mut=(f:(x:LiteratureBrief)=>void)=>{const x=structuredClone(b);f(x);return x};
 const cases:[string,(x:LiteratureBrief)=>void][]=[
  ["claim approved",x=>{(x.claims[0] as {state:string}).state="approved"}],["claim reviewed",x=>{(x.claims[0] as {state:string}).state="independently_reviewed"}],
  ["claim verified",x=>{(x.claims[0] as {independentlyVerified:boolean}).independentlyVerified=true}],["claim promotable",x=>{(x.claims[0] as {promotable:boolean}).promotable=true}],
  ["context normalised",x=>{(x.claims[0] as {contextNormalised:boolean}).contextNormalised=true}],["source reviewed",x=>{(x.sources[0] as {reviewStatus:string}).reviewStatus="approved"}],
  ["source promoted",x=>{(x.sources[0] as {state:string}).state="candidate"}],["publication eligible",x=>{(x as {publicationEligible:boolean}).publicationEligible=true}],
  ["clinical use",x=>{(x as {clinicalUse:string}).clinicalUse="decision_support"}],["graph promotion",x=>{(x as {graphPromotion:string}).graphPromotion="direct"}],
  ["scope",x=>{(x as {scope:string}).scope="clinical"}],["ladder",x=>{(x as unknown as {stateLadder:string[]}).stateLadder=["retrieved","approved"]}],
  ["orphan claim",x=>{x.claims[0]!.sourceCanonicalId="PMID:999"}],["off-list link",x=>{x.sources[0]!.sourceUrl="https://evil.example/x"}],
  ["schema",x=>{(x as {schemaVersion:string}).schemaVersion="hsi-literature-brief-2"}],["assessment missing",x=>{x.claims[0]!.assessmentRef=null}],
 ];
 for(const [name,f] of cases){
  const x=mut(f);expect([name,()=>{verifyLiteratureBrief(x)}]).toEqual([name,expect.any(Function)]);
  expect(()=>verifyLiteratureBrief(x)).toThrow();          // hash now wrong
  expect(()=>verifyLiteratureBrief(rehash(x))).toThrow();  // and an invariant is violated even after re-hashing
 }
 expect(()=>verifyLiteratureBrief(null)).toThrow();expect(()=>verifyLiteratureBrief("x")).toThrow();
});
test("HONEST LIMIT: the hash is tamper-evident, not authenticated. Someone who edits descriptive text and recomputes the hash passes verification",async()=>{
 const {set}=await retrieve();const b=buildLiteratureBrief({set});
 const edited=structuredClone(b);edited.sources[0]!.title="A different title";
 expect(()=>verifyLiteratureBrief(edited)).toThrow(); // naive edit is caught
 expect(()=>verifyLiteratureBrief(rehash(edited))).not.toThrow(); // a rehashed edit is not: signing and ownership belong to the persistence layer
});

/* ---------- rendering ---------- */
test("Markdown is inert: hostile titles, claims, questions and terms cannot make links, images, HTML, headings, tables or lists",async()=>{
 const evil=["see www.evil.example and mail a@evil.example","[click](javascript:alert(1))","<script>alert(1)</script>","![x](http://evil.example/p.png)","# Injected heading\n## more","| a | b |\n|---|---|","- list item\n+ another","`code` & <b>bold</b> ~~s~~","line1\r\nline2​‮"];
 const {set}=await retrieve();
 const poisoned={...set,candidates:set.candidates.map((c,i)=>({...c,title:evil[i%evil.length]!})),terms:["IL-21","[t](javascript:1)"]};
 const b=buildLiteratureBrief({set:poisoned,question:evil[0]!+" "+evil[3],claims:evil.map((e,i)=>claim({claimId:`c-${String(i+1).padStart(3,"0")}`,statement:e,context:{species:e,tissue:e,cellType:e,method:e}}))});
 const m=renderLiteratureBrief(b,"markdown");
 // Remove every backslash-escaped character (inert in Markdown) and our own code spans; what is left must hold no live syntax.
 const bare=m.replace(/\\./g,"").replace(/`[^`\n]*`/g,"");
 expect(bare).not.toMatch(/<|>|\[|\]|!|\||~|\u202e|\u200b|\u0000/);
 expect(bare.includes("`")).toBe(false);
 const headings=m.split("\n").filter(l=>/^\s*#/.test(l)).map(l=>l.replace(/\\/g,""));
 expect(headings.every(h=>/^(# Human Super Intelligence — literature brief|## (Sources|Claims|Provenance|Limitations)( \(\d+\))?|### (DOI:|PMID:|c-\d{3}$).*)$/.test(h))).toBe(true);
 expect(m.split("\n").filter(l=>/^\s*[|]/.test(l))).toEqual([]);
 for(const l of m.split("\n"))if(/^\s*[-+*] /.test(l))expect(l.startsWith("- ")).toBe(true); // only our own list markers
 // untrusted text is defanged so a GitHub-style renderer has nothing to auto-link; the only live-looking URLs are validated links inside code spans
 expect(bare).not.toMatch(/\b(https?|ftp|javascript|data|mailto):/i);expect(bare).not.toMatch(/\bwww\./i);expect(bare).not.toMatch(/[\w.]+@[\w.]+/);
 for(const u of m.match(/https?:\/\/[^\s`]+/g)??[]){expect(m).toContain("`"+u+"`")}
});
test("JSON export is canonical (sorted keys) and Markdown carries the same hashes as the JSON",async()=>{
 const {set,ref,audit}=await retrieve();const b=buildLiteratureBrief({set,ref,audit});
 const json=renderLiteratureBrief(b,"json");expect(JSON.parse(json)).toEqual(b);
 const keys=Object.keys(JSON.parse(json));expect(keys).toEqual([...keys].sort((a,c)=>a.localeCompare(c)));
 const md=renderLiteratureBrief(b,"markdown");expect(md).toContain(b.contentHash);expect(md).toContain(b.sourceSet.hash);expect(md).toContain("Search hits, not evidence");
 expect(()=>renderLiteratureBrief({...b,clinicalUse:"x"} as never,"markdown")).toThrow(); // never renders an unverified brief
});

/* ---------- export ---------- */
test("an export is three files bound by SHA-256; any edit, swap, drop or substitution is detected",async()=>{
 const {set,ref,audit}=await retrieve();const b=buildLiteratureBrief({set,ref,audit,claims:[claim()]});
 const files=exportLiteratureBrief(b);
 expect(files.map(f=>f.name)).toEqual(["brief.json","brief.md","manifest.json"]);
 expect(verifyLiteratureBriefExport(files)).toEqual(b);
 expect(exportLiteratureBrief(buildLiteratureBrief({set,ref,audit,claims:[claim()]})).map(f=>f.sha256)).toEqual(files.map(f=>f.sha256));
 const swap=(name:string,content:string)=>files.map(f=>f.name===name?{...f,content}:f);
 expect(()=>verifyLiteratureBriefExport(swap("brief.md",files[1]!.content+"\nEdited"))).toThrow("manifest");
 expect(()=>verifyLiteratureBriefExport(swap("brief.json",files[0]!.content.replace("extracted","approved")))).toThrow();
 expect(()=>verifyLiteratureBriefExport(swap("manifest.json",files[2]!.content.replace(/[a-f0-9]{64}/,"0".repeat(64))))).toThrow();
 expect(()=>verifyLiteratureBriefExport(files.slice(0,2))).toThrow("must hold");
 // a markdown file that is internally consistent with the manifest but is not what this brief renders
 const other=exportLiteratureBrief(buildLiteratureBrief({set}));
 const mixed=[files[0]!,{...other[1]!},files[2]!];expect(()=>verifyLiteratureBriefExport(mixed)).toThrow();
 const md2=files[1]!.content+"\n- injected";const man=JSON.parse(files[2]!.content);man.files.find((x:{name:string})=>x.name==="brief.md").sha256=require("node:crypto").createHash("sha256").update(md2).digest("hex");
 expect(()=>verifyLiteratureBriefExport([files[0]!,{...files[1]!,content:md2},{...files[2]!,content:JSON.stringify(man)}])).toThrow("not what this brief renders");
});

/* ---------- save and reopen ---------- */
test("save and reopen: a brief round-trips through a content-addressed store and any edit on disk is caught on load",async()=>{
 const {set,ref,audit}=await retrieve();const b=buildLiteratureBrief({set,ref,audit});
 const dir=mkd(),store=createFileBriefStore(dir);
 const r=await store.save(b);expect(r).toMatch(/^brief:\/\/[a-f0-9]{40}$/);expect(await store.save(b)).toBe(r);
 expect(await store.load(r)).toEqual(b);
 const f=join(dir,readdirSync(dir).find(x=>x.endsWith(".json"))!);
 const x=JSON.parse(readFileSync(f,"utf8"));x.sources[0].reviewStatus="approved";writeFileSync(f,JSON.stringify(x));
 await expect(store.load(r)).rejects.toThrow();
 writeFileSync(f,JSON.stringify(b));renameSync(f,join(dir,"0".repeat(40)+".json"));
 await expect(store.load("brief://"+"0".repeat(40))).rejects.toThrow("reference");
 await expect(store.load("brief://"+"1".repeat(40))).rejects.toThrow("Unknown");
 for(const bad of ["../x","brief://short","lit://"+"0".repeat(40),""])await expect(store.load(bad)).rejects.toThrow();
 await expect(store.save({...b,graphPromotion:"direct"} as never)).rejects.toThrow();
});
test("END TO END: retrieve (real executor, orchestrator, gateway) -> save set -> reopen set -> brief -> export -> verify -> save brief -> reopen",async()=>{
 const sink=createFileLiteratureSink(mkd());
 const {ref,audit}=await retrieve({sink});
 const set=await sink.load(ref);                       // reopened from disk, hash-checked
 const b=buildLiteratureBrief({set,ref,audit,question:"Which cytokines drive fibroblast activation?",claims:[claim()]});
 const files=exportLiteratureBrief(b);const back=verifyLiteratureBriefExport(files);
 const store=createFileBriefStore(mkd());const bref=await store.save(back);
 expect(await store.load(bref)).toEqual(b);
 expect(back.provenance.audit.status).toBe("verified");expect(back.sources.length).toBe(3);
});
test("the candidate-set sinks refuse an edited or unknown set on load",async()=>{
 const dir=mkd(),sink=createFileLiteratureSink(dir);const {set}=await retrieve();
 const ref=await sink.save(set);expect(await sink.load(ref)).toEqual(set);
 const f=join(dir,readdirSync(dir).find(x=>x.endsWith(".json"))!);const x=JSON.parse(readFileSync(f,"utf8"));x.candidates[0].reviewStatus="approved";writeFileSync(f,JSON.stringify(x));
 await expect(sink.load(ref)).rejects.toThrow("does not match");
 await expect(sink.load("lit://"+"9".repeat(40))).rejects.toThrow("Unknown");await expect(sink.load("../x")).rejects.toThrow();
 await expect(createMemoryLiteratureSink().load(ref)).rejects.toThrow();
});
test("source scan: the brief module neither touches the network nor a model, and cannot name a state above model_assessed as creatable",()=>{
 const src=readFileSync("src/literatureBrief.ts","utf8");
 expect(/(^|[^.\w])fetch\s*\(/.test(src)).toBe(false);expect(/node:https?|XMLHttpRequest|undici|WebSocket|anthropic|openai/i.test(src.replace(/\/\*\*[\s\S]*?\*\//g,""))).toBe(false);
 expect(/CREATABLE_CLAIM_STATES=\["extracted","candidate","model_assessed"\]/.test(src)).toBe(true);
});
