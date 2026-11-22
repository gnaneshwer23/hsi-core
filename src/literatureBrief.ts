/** Literature brief: a reviewable, exportable, tamper-evident record of what a retrieval step found, with its provenance, and nothing more.
 *
 * It turns the candidate set saved by `createLiteratureRetrievalExecutor` into a brief. It is deliberately honest about how little a
 * search hit is:
 * - Every source is in state `retrieved` and `unreviewed`. A source is a bibliographic hit, not evidence.
 * - A brief has CLAIMS only if a separate extraction step supplied them. The builder will carry a claim in state `extracted`,
 *   `candidate` or `model_assessed` and nothing higher: `independently_reviewed` and `approved` cannot be created by this module at
 *   all (they belong to the existing human review and delivery path), and a `model_assessed` claim must name its assessment record and is
 *   always marked `independentlyVerified: false`. Every claim must link to a source in the set; orphans are refused.
 * - `scope` is `research_only`, `clinicalUse` is `none`, `publicationEligible` is false, graph promotion is `none`. These are fixed values
 *   the verifier checks, not options.
 *
 * Provenance. The brief embeds the candidate set's hash (and its reference, when given) and a per-provider call receipt. When the gateway's
 * audit records are supplied, the chain is verified and every receipt must match its record (tool, investigation, task, provider, request
 * and response hashes, outcome); any mismatch refuses the brief. Without them the brief says so and says it is unverified against the audit.
 *
 * Integrity. `contentHash` covers the whole brief. `verifyLiteratureBrief` re-derives it and re-checks every invariant, so a reopened or
 * imported brief that was edited, promoted or re-labelled is refused. Exports are JSON, Markdown and a manifest with SHA-256 for each file.
 * Markdown is inert: imported strings cannot create links, images, HTML or headings.
 *
 * Not provided: it does not extract anything, retrieve anything, call a model, or decide relevance; it is not tied to an authenticated
 * principal, tenant or ownership record (saving and reopening under ownership belongs to the persistence layer, which is held); it does not
 * make a search hit scientifically valid; and nothing here is reviewed or approved. */
import {mkdirSync,readFileSync,existsSync} from "node:fs";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {rejectPhiPayload} from "./cdsPhiBoundary";
import {writeFileAtomic} from "./fileLock";
import {hashHsiCheckpointInput} from "./hsiAgentDurableCheckpoint";
import {verifyAuditChain,type AuditRecord} from "./governedToolGateway";
import type {LiteratureCandidateSet} from "./governedLiteratureRetrievalExecutor";

/** The full ladder, in order. This module can create the first four only for sources/claims as described above. */
export const EVIDENCE_STATE_LADDER=["retrieved","extracted","candidate","model_assessed","independently_reviewed","approved"] as const;
export const CREATABLE_CLAIM_STATES=["extracted","candidate","model_assessed"] as const;
export type ClaimState=typeof CREATABLE_CLAIM_STATES[number];

export type ClaimInput={claimId:string;sourceCanonicalId:string;statement:string;state:string;context?:{species?:string|null;tissue?:string|null;cellType?:string|null;method?:string|null};assessmentRef?:string|null};
export type BriefReceipt={provider:string;ok:boolean;code:string|null;replayed:boolean;auditSeq:number;requestHash:string|null;responseHash:string|null};
export type BriefSource={canonicalId:string;sourceUrl:string;title:string|null;doi:string|null;pmid:string|null;publicationYear:number|string|null;state:"retrieved";reviewStatus:"unreviewed";providers:string[]};
export type BriefClaim={claimId:string;sourceCanonicalId:string;statement:string;state:ClaimState;
 /** Free text as supplied, capped. Not ontology-normalised: species, tissue, cell type and method are NOT validated terms. */
 context:{species:string|null;tissue:string|null;cellType:string|null;method:string|null};contextNormalised:false;
 assessmentRef:string|null;independentlyVerified:false;promotable:false};
export type LiteratureBrief={
 schemaVersion:"hsi-literature-brief-1";investigationId:string;taskId:string;question:string|null;terms:string[];
 scope:"research_only";clinicalUse:"none";publicationEligible:false;graphPromotion:"none";stateLadder:readonly string[];
 sourceSet:{hash:string;ref:string|null};sources:BriefSource[];claims:BriefClaim[];claimsNote:string|null;
 provenance:{receipts:BriefReceipt[];audit:{status:"verified"|"not_supplied";records:number;headHash:string|null};incomplete:boolean;quarantined:number;rejectedSources:number};
 limitations:string[];contentHash:string;
};

const ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const PROVIDER=/^[a-z0-9-]{2,40}$/;
const HASH=/^[a-f0-9]{64}$/;
const CLAIM_ID=/^c-[a-z0-9-]{3,40}$/;
const ASSESSMENT_REF=/^[A-Za-z0-9][A-Za-z0-9._:/-]{2,120}$/;
const SOURCE_URL=/^https:\/\/(europepmc\.org\/[A-Za-z0-9/_.%-]{1,200}|openalex\.org\/W\d{1,15}|doi\.org\/10\.\d{4,9}\/[A-Za-z0-9._;()/:%-]{1,160})$/;
// eslint-disable-next-line no-control-regex
const CTRL=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]|\p{Cf}/gu;
const MAX_CANDIDATES=100,MAX_CLAIMS=200;
const clean=(v:unknown,max:number):string|null=>typeof v==="string"&&v.replace(CTRL,"").trim()?v.replace(CTRL," ").trim().slice(0,max):null;

const FIXED_LIMITATIONS=[
 "Search hits are not evidence: relevance, study design, species, tissue, cell state and assay are unassessed",
 "Nothing in this brief is reviewed, approved or promoted to the knowledge graph",
 "Research use only: not clinical advice and not clinical decision support",
];

function validateSet(set:LiteratureCandidateSet):void{
 const s=set as LiteratureCandidateSet|undefined;
 if(!s||s.schemaVersion!=="hsi-literature-candidates-1"||s.evidenceStatus!=="candidate_only"||!ID.test(String(s.investigationId))||!ID.test(String(s.taskId)))throw Error("Not a candidate-only literature set");
 if(!Array.isArray(s.terms)||s.terms.length<1||s.terms.length>8||s.terms.some(t=>typeof t!=="string"||!t.trim()||t.length>160))throw Error("Invalid search terms in set");
 if(!Array.isArray(s.candidates)||s.candidates.length>MAX_CANDIDATES||!Array.isArray(s.calls)||s.calls.length<1||s.calls.length>3||!Array.isArray(s.limitations))throw Error("Malformed literature set");
 if(!Number.isInteger(s.quarantined)||s.quarantined<0)throw Error("Malformed literature set");
 if(s.candidates.some(c=>!c||c.reviewStatus!=="unreviewed"||typeof c.canonicalId!=="string"||!c.canonicalId||!Array.isArray(c.providers)||!c.providers.length))throw Error("A candidate is not unreviewed");
 for(const c of s.calls)if(!c||!PROVIDER.test(String(c.provider))||typeof c.ok!=="boolean"||!Number.isInteger(c.auditSeq)||c.auditSeq<1)throw Error("Malformed call receipt");
 if(new Set(s.calls.map(c=>c.provider)).size!==s.calls.length)throw Error("Duplicate provider receipt");
}

/** Binds receipts to the gateway's audit chain. Returns the chain head hash; throws (codes only) on any mismatch. */
function checkAudit(set:LiteratureCandidateSet,audit:readonly AuditRecord[]):string|null{
 if(!verifyAuditChain(audit).ok)throw Error("Audit chain failed verification");
 const bySeq=new Map(audit.map(r=>[r.seq,r]));
 for(const c of set.calls){
  const r=bySeq.get(c.auditSeq);
  if(!r||r.toolId!=="literature.search"||r.providerId!==c.provider||r.investigationId!==set.investigationId||r.taskId!==set.taskId)throw Error("Receipt does not match an audit record");
  if(c.ok){if(!(r.outcome==="success"||r.outcome==="replayed")||r.responseHash!==c.responseHash||r.requestHash!==c.requestHash)throw Error("Receipt hashes do not match the audit record")}
  else if(r.outcome!=="refused"||r.code!==c.code)throw Error("Failure receipt does not match the audit record");
 }
 return audit.length?audit[audit.length-1]!.hash:null;
}

export function buildLiteratureBrief(input:{set:LiteratureCandidateSet;/** `lit://…` reference the set was saved under; checked against the set's hash. */ref?:string;audit?:readonly AuditRecord[];claims?:readonly ClaimInput[];question?:string}):LiteratureBrief{
 const set=input.set;validateSet(set);
 const hash=hashHsiCheckpointInput(set);
 if(input.ref!==undefined&&input.ref!==`lit://${hash.slice(0,40)}`)throw Error("Reference does not match the candidate set");
 const okByProvider=new Map(set.calls.filter(c=>c.ok).map(c=>[c.provider,c]));
 const question=input.question===undefined?null:clean(input.question,500);
 if(input.question!==undefined&&question===null)throw Error("Empty question");

 let rejectedSources=0;const sources:BriefSource[]=[];
 for(const c of set.candidates){
  const url=typeof c.sourceUrl==="string"?c.sourceUrl:"";
  if(!SOURCE_URL.test(url)||c.providers.some(p=>!okByProvider.has(p))){rejectedSources++;continue} // an unknown URL host or a provider that never answered
  sources.push({canonicalId:String(c.canonicalId).slice(0,200),sourceUrl:url,title:clean(c.title,500),doi:clean(c.doi,200),pmid:clean(c.pmid,20),
   publicationYear:typeof c.publicationYear==="number"&&Number.isInteger(c.publicationYear)?c.publicationYear:clean(c.publicationYear,10),state:"retrieved",reviewStatus:"unreviewed",providers:[...c.providers].sort()});
 }
 sources.sort((a,b)=>a.canonicalId.localeCompare(b.canonicalId));
 const byId=new Map(sources.map(s=>[s.canonicalId.toLowerCase(),s]));

 const claims:BriefClaim[]=[],seen=new Set<string>();
 for(const x of input.claims??[]){
  if(claims.length>=MAX_CLAIMS)throw Error("Too many claims");
  if(!x||!CLAIM_ID.test(String(x.claimId))||seen.has(x.claimId))throw Error("Invalid or duplicate claim id");
  seen.add(x.claimId);
  if(!(CREATABLE_CLAIM_STATES as readonly string[]).includes(x.state))throw Error(`A claim cannot be created in state ${String(x.state).slice(0,40)}`);
  const src=byId.get(String(x.sourceCanonicalId).toLowerCase());
  if(!src)throw Error("A claim must link to a source in this set");
  const statement=clean(x.statement,300);if(!statement)throw Error("Empty claim statement");
  const state=x.state as ClaimState;
  const ref=x.assessmentRef==null?null:String(x.assessmentRef);
  if(state==="model_assessed"&&(ref===null||!ASSESSMENT_REF.test(ref)))throw Error("A model-assessed claim must name its assessment record");
  if(state!=="model_assessed"&&ref!==null)throw Error("Only a model-assessed claim carries an assessment reference");
  const ctx=x.context??{};
  claims.push({claimId:x.claimId,sourceCanonicalId:src.canonicalId,statement,state,context:{species:clean(ctx.species,80),tissue:clean(ctx.tissue,80),cellType:clean(ctx.cellType,80),method:clean(ctx.method,120)},contextNormalised:false,assessmentRef:ref,independentlyVerified:false,promotable:false});
 }
 claims.sort((a,b)=>a.claimId.localeCompare(b.claimId));

 const phi=rejectPhiPayload({textBlobs:[question??"",...set.terms,...sources.map(s=>s.title??""),...claims.flatMap(c=>[c.statement,...Object.values(c.context).map(v=>v??"")])]});
 if(!phi.ok)throw Error("Brief refused: possible personal health information");

 let headHash:string|null=null;
 if(input.audit)headHash=checkAudit(set,input.audit);
 const limitations=[...FIXED_LIMITATIONS];
 const incomplete=set.calls.some(c=>!c.ok);
 if(incomplete)limitations.push(`Incomplete: ${set.calls.filter(c=>!c.ok).map(c=>`${c.provider} (${c.code})`).join(", ")} did not answer`);
 if(set.quarantined)limitations.push(`${set.quarantined} hit(s) were quarantined at retrieval because the gateway flagged possible prompt injection`);
 if(rejectedSources)limitations.push(`${rejectedSources} hit(s) were dropped because their source link was not on the approved list`);
 if(!input.audit)limitations.push("Not checked against the gateway audit log: the receipts are as recorded in the candidate set");
 if(!claims.length)limitations.push("No claims: no extraction step has run, so this brief lists sources only");
 else limitations.push("Claim context (species, tissue, cell type, method) is free text and has not been normalised to an ontology");

 const body:Omit<LiteratureBrief,"contentHash">={
  schemaVersion:"hsi-literature-brief-1",investigationId:set.investigationId,taskId:set.taskId,question,terms:[...set.terms],
  scope:"research_only",clinicalUse:"none",publicationEligible:false,graphPromotion:"none",stateLadder:[...EVIDENCE_STATE_LADDER],
  sourceSet:{hash,ref:input.ref??null},sources,claims,claimsNote:claims.length?null:"No extraction has run",
  provenance:{receipts:set.calls.map(c=>({provider:c.provider,ok:c.ok,code:c.code,replayed:c.replayed,auditSeq:c.auditSeq,requestHash:c.requestHash,responseHash:c.responseHash})),
   audit:{status:input.audit?"verified":"not_supplied",records:input.audit?.length??0,headHash},incomplete,quarantined:set.quarantined,rejectedSources},
  limitations,
 };
 return {...body,contentHash:hashHsiCheckpointInput(body)};
}

/** Re-derives the hash and re-checks every invariant. Use on anything reopened, imported or received. Throws on any violation. */
export function verifyLiteratureBrief(value:unknown):LiteratureBrief{
 const b=value as LiteratureBrief;
 if(!b||typeof b!=="object"||b.schemaVersion!=="hsi-literature-brief-1")throw Error("Not a literature brief");
 if(b.scope!=="research_only"||b.clinicalUse!=="none"||b.publicationEligible!==false||b.graphPromotion!=="none")throw Error("Brief scope flags were altered");
 if(JSON.stringify(b.stateLadder)!==JSON.stringify(EVIDENCE_STATE_LADDER))throw Error("State ladder was altered");
 if(!ID.test(String(b.investigationId))||!ID.test(String(b.taskId))||!HASH.test(String(b.contentHash))||!HASH.test(String(b.sourceSet?.hash)))throw Error("Malformed brief identity");
 if(!Array.isArray(b.sources)||b.sources.length>MAX_CANDIDATES||!Array.isArray(b.claims)||b.claims.length>MAX_CLAIMS||!Array.isArray(b.terms)||!Array.isArray(b.limitations)||!Array.isArray(b.provenance?.receipts))throw Error("Malformed brief");
 const ids=new Set<string>();
 for(const s of b.sources){
  if(s.state!=="retrieved"||s.reviewStatus!=="unreviewed"||!SOURCE_URL.test(String(s.sourceUrl))||!Array.isArray(s.providers)||!s.providers.every(p=>PROVIDER.test(String(p))))throw Error("A source is not a retrieved, unreviewed, approved-host hit");
  ids.add(String(s.canonicalId).toLowerCase());
 }
 const seen=new Set<string>();
 for(const c of b.claims){
  if(!CLAIM_ID.test(String(c.claimId))||seen.has(c.claimId)||!(CREATABLE_CLAIM_STATES as readonly string[]).includes(c.state))throw Error("A claim is in a state this brief cannot hold");
  seen.add(c.claimId);
  if(!ids.has(String(c.sourceCanonicalId).toLowerCase()))throw Error("A claim is not linked to a source");
  if(c.independentlyVerified!==false||c.promotable!==false||c.contextNormalised!==false)throw Error("A claim was promoted or marked verified");
  if(c.state==="model_assessed"?!(typeof c.assessmentRef==="string"&&ASSESSMENT_REF.test(c.assessmentRef)):c.assessmentRef!==null)throw Error("Assessment reference does not match claim state");
 }
 for(const r of b.provenance.receipts)if(!PROVIDER.test(String(r.provider))||typeof r.ok!=="boolean"||!Number.isInteger(r.auditSeq))throw Error("Malformed receipt");
 const {contentHash,...body}=b;
 if(hashHsiCheckpointInput(body)!==contentHash)throw Error("Brief content does not match its hash");
 return b;
}

/* ---------- rendering and export ---------- */
/** Markdown is inert downloadable text: imported scientific strings cannot create links, images, HTML, headings or lists. */
/** Besides escaping, URL schemes and `www.` are defanged in untrusted text ("https :" not "https:"), because GitHub-flavoured renderers
 * auto-link bare URLs even inside escaped text. The JSON export keeps the original strings; only validated source links appear as
 * links, and only inside code spans. */
const md=(s:unknown)=>String(s??"").replace(CTRL," ").replace(/\s+/g," ")
 .replace(/\b(https?|ftps?|file|javascript|data|vbscript|mailto|sftp|ssh|git)\s*:/gi,"$1 :").replace(/\bwww\s*\./gi,"www .").replace(/@/g," at ")
 .replace(/[\\<>\[\]()*_`#|!&~{}+\-=]/g,c=>"\\"+c).trim();
const canon=(x:unknown):unknown=>Array.isArray(x)?x.map(canon):x&&typeof x==="object"?Object.fromEntries(Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canon(v)])):x;

export function renderLiteratureBrief(brief:LiteratureBrief,format:"json"|"markdown"):string{
 const b=verifyLiteratureBrief(brief);
 if(format==="json")return JSON.stringify(canon(b),null,2)+"\n";
 const L:string[]=["# Human Super Intelligence — literature brief","","**Research preview. Search hits, not evidence. Nothing here is reviewed, approved or clinical advice.**",""];
 if(b.question)L.push("Question (as supplied):",md(b.question),"");
 L.push(`Investigation: ${md(b.investigationId)}`,`Task: ${md(b.taskId)}`,`Search terms: ${b.terms.map(md).join("; ")}`,`Brief SHA-256: ${b.contentHash}`,`Candidate set SHA-256: ${b.sourceSet.hash}`,b.sourceSet.ref?`Candidate set reference: ${md(b.sourceSet.ref)}`:"Candidate set reference: not supplied","",
  `Evidence state ladder: ${b.stateLadder.map(md).join(" → ")}`,"Every source below is at the first state, retrieved, and unreviewed.","",
  `## Sources (${b.sources.length})`,"");
 for(const s of b.sources)L.push(`### ${md(s.canonicalId)}`,"",`Title: ${md(s.title??"not supplied")}`,`DOI: ${md(s.doi??"not supplied")}; PMID: ${md(s.pmid??"not supplied")}; year: ${md(s.publicationYear??"not supplied")}`,`Link: \`${s.sourceUrl}\``,`State: retrieved; review status: unreviewed`,`Found by: ${s.providers.map(md).join(", ")}`,"");
 L.push(`## Claims (${b.claims.length})`,"");
 if(!b.claims.length)L.push(md(b.claimsNote??"No claims"),"");
 for(const c of b.claims)L.push(`### ${md(c.claimId)}`,"",md(c.statement),"",`State: ${md(c.state)}; independently verified: no; promotable: no`,`Source: ${md(c.sourceCanonicalId)}`,`Context as supplied (not normalised): species ${md(c.context.species??"not supplied")}; tissue ${md(c.context.tissue??"not supplied")}; cell type ${md(c.context.cellType??"not supplied")}; method ${md(c.context.method??"not supplied")}`,...(c.assessmentRef?[`Assessment record: ${md(c.assessmentRef)}`]:[]),"");
 L.push("## Provenance","",`Audit log check: ${b.provenance.audit.status}${b.provenance.audit.headHash?`; chain head ${b.provenance.audit.headHash}`:""}`,`Complete: ${b.provenance.incomplete?"no":"yes"}; quarantined hits: ${b.provenance.quarantined}; dropped hits: ${b.provenance.rejectedSources}`,"");
 for(const r of b.provenance.receipts)L.push(`- ${md(r.provider)}: ${r.ok?"answered":`did not answer (${md(r.code)})`}; audit record ${r.auditSeq}${r.replayed?"; replayed":""}${r.requestHash?`; request ${r.requestHash}`:""}${r.responseHash?`; response ${r.responseHash}`:""}`);
 L.push("","## Limitations","",...b.limitations.map(x=>"- "+md(x)),"");
 return L.join("\n");
}

export type ExportFile={name:string;content:string;sha256:string};
const sha=(t:string)=>createHash("sha256").update(t).digest("hex");
/** JSON, Markdown and a manifest binding both by SHA-256 to the brief's own hash. */
export function exportLiteratureBrief(brief:LiteratureBrief):ExportFile[]{
 const json=renderLiteratureBrief(brief,"json"),markdown=renderLiteratureBrief(brief,"markdown");
 const files=[{name:"brief.json",content:json,sha256:sha(json)},{name:"brief.md",content:markdown,sha256:sha(markdown)}];
 const manifest=JSON.stringify({schemaVersion:"hsi-literature-brief-export-1",briefContentHash:brief.contentHash,files:files.map(f=>({name:f.name,sha256:f.sha256}))},null,2)+"\n";
 return [...files,{name:"manifest.json",content:manifest,sha256:sha(manifest)}];
}
/** Checks an export: manifest hashes, the JSON brief's own verification, and that the Markdown is exactly what that brief renders. */
export function verifyLiteratureBriefExport(files:readonly ExportFile[]):LiteratureBrief{
 const get=(n:string)=>files.find(f=>f.name===n)?.content;
 const man=get("manifest.json"),json=get("brief.json"),mdText=get("brief.md");
 if(man===undefined||json===undefined||mdText===undefined||files.length!==3)throw Error("Export must hold brief.json, brief.md and manifest.json");
 const m=JSON.parse(man) as {schemaVersion:string;briefContentHash:string;files:{name:string;sha256:string}[]};
 if(m.schemaVersion!=="hsi-literature-brief-export-1")throw Error("Unknown manifest");
 for(const f of [["brief.json",json],["brief.md",mdText]] as const)if(m.files.find(x=>x.name===f[0])?.sha256!==sha(f[1]))throw Error(`${f[0]} does not match the manifest`);
 const brief=verifyLiteratureBrief(JSON.parse(json));
 if(brief.contentHash!==m.briefContentHash)throw Error("Manifest does not match the brief");
 if(renderLiteratureBrief(brief,"markdown")!==mdText)throw Error("brief.md is not what this brief renders");
 if(renderLiteratureBrief(brief,"json")!==json)throw Error("brief.json is not canonical");
 return brief;
}

/* ---------- save and reopen ---------- */
export type LiteratureBriefStore={save(brief:LiteratureBrief):Promise<string>;load(ref:string):Promise<LiteratureBrief>};
/** Content-addressed files; `load` re-verifies the brief and that it still matches the reference. Not tenant- or owner-scoped. */
export function createFileBriefStore(dir:string):LiteratureBriefStore{
 mkdirSync(dir,{recursive:true});
 const file=(ref:string)=>{const m=/^brief:\/\/([a-f0-9]{40})$/.exec(ref);if(!m)throw Error("Invalid brief reference");return join(dir,`${m[1]}.json`)};
 return {
  async save(brief){const b=verifyLiteratureBrief(brief);const ref=`brief://${b.contentHash.slice(0,40)}`;writeFileAtomic(file(ref),JSON.stringify(b));return ref},
  async load(ref){const f=file(ref);if(!existsSync(f))throw Error("Unknown brief");const b=verifyLiteratureBrief(JSON.parse(readFileSync(f,"utf8")));if(`brief://${b.contentHash.slice(0,40)}`!==ref)throw Error("Brief does not match its reference");return b},
 };
}
