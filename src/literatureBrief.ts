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
import {BRIEF_ASSESSMENT_REF,BRIEF_CLAIM_ID,BRIEF_CTRL,BRIEF_ID,BRIEF_LIMITS,BRIEF_PROVIDER,BRIEF_SOURCE_URL,CREATABLE_CLAIM_STATES,EVIDENCE_STATE_LADDER,briefHashInput,checkBriefInvariants,renderBriefJson,renderBriefMarkdown,type BriefDataMode,type BriefReceipt,type BriefSource,type BriefClaim,type ClaimState,type LiteratureBrief} from "./literatureBriefCore";
export {CREATABLE_CLAIM_STATES,EVIDENCE_STATE_LADDER,type BriefDataMode,type BriefReceipt,type BriefSource,type BriefClaim,type ClaimState,type LiteratureBrief};


export type ClaimInput={claimId:string;sourceCanonicalId:string;statement:string;state:string;context?:{species?:string|null;tissue?:string|null;cellType?:string|null;method?:string|null};assessmentRef?:string|null};
const ID=BRIEF_ID,PROVIDER=BRIEF_PROVIDER,CLAIM_ID=BRIEF_CLAIM_ID,ASSESSMENT_REF=BRIEF_ASSESSMENT_REF,SOURCE_URL=BRIEF_SOURCE_URL,CTRL=BRIEF_CTRL;
const MAX_CANDIDATES=BRIEF_LIMITS.maxCandidates,MAX_CLAIMS=BRIEF_LIMITS.maxClaims;
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

export function buildLiteratureBrief(input:{set:LiteratureCandidateSet;/** Required, never defaulted: whether the set came from recorded fixtures or a live provider. It is printed on the brief. */dataMode:BriefDataMode;/** `lit://…` reference the set was saved under; checked against the set's hash. */ref?:string;audit?:readonly AuditRecord[];claims?:readonly ClaimInput[];question?:string}):LiteratureBrief{
 const set=input.set;validateSet(set);
 if(!(["fixture_recorded","live"] as readonly string[]).includes(input.dataMode))throw Error("dataMode must be fixture_recorded or live");
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
  schemaVersion:"hsi-literature-brief-1",dataMode:input.dataMode,investigationId:set.investigationId,taskId:set.taskId,question,terms:[...set.terms],
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
 const b=checkBriefInvariants(value);
 if(createHash("sha256").update(briefHashInput(b)).digest("hex")!==b.contentHash)throw Error("Brief content does not match its hash");
 return b;
}

/* ---------- rendering and export ---------- */
/** Renders only a verified brief: an unverified one is refused. The pure renderers live in `literatureBriefCore.ts`. */
export function renderLiteratureBrief(brief:LiteratureBrief,format:"json"|"markdown"):string{
 const b=verifyLiteratureBrief(brief);
 return format==="json"?renderBriefJson(b):renderBriefMarkdown(b);
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
