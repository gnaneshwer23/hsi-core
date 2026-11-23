/** Browser-safe core of the literature brief: types, invariants, canonical JSON, rendering. No Node imports, so the workbench can run the SAME
 * verification the server does. Hashing is injected (`sha256Hex`), because the browser digests asynchronously and the server synchronously.
 * Server-side building, audit binding, export and storage live in `literatureBrief.ts`; read its header for what a brief is and is not.
 * `canonicalJson` must stay byte-identical to the canonical form behind `hashHsiCheckpointInput`; a test enforces that. */

/** The full ladder, in order. The brief can create the first four only for sources/claims as described in `literatureBrief.ts`. */
export const EVIDENCE_STATE_LADDER=["retrieved","extracted","candidate","model_assessed","independently_reviewed","approved"] as const;
export const CREATABLE_CLAIM_STATES=["extracted","candidate","model_assessed"] as const;
export type ClaimState=typeof CREATABLE_CLAIM_STATES[number];
/** `fixture_recorded`: the data came from recorded responses, not a live provider. It is printed on the brief and cannot be omitted. */
export const BRIEF_DATA_MODES=["fixture_recorded","live"] as const;
export type BriefDataMode=typeof BRIEF_DATA_MODES[number];

export type BriefReceipt={provider:string;ok:boolean;code:string|null;replayed:boolean;auditSeq:number;requestHash:string|null;responseHash:string|null};
export type BriefSource={canonicalId:string;sourceUrl:string;title:string|null;doi:string|null;pmid:string|null;publicationYear:number|string|null;state:"retrieved";reviewStatus:"unreviewed";providers:string[]};
export type BriefClaim={claimId:string;sourceCanonicalId:string;statement:string;state:ClaimState;
 /** Free text as supplied, capped. Not ontology-normalised: species, tissue, cell type and method are NOT validated terms. */
 context:{species:string|null;tissue:string|null;cellType:string|null;method:string|null};contextNormalised:false;
 assessmentRef:string|null;independentlyVerified:false;promotable:false};
export type LiteratureBrief={
 schemaVersion:"hsi-literature-brief-1";dataMode:BriefDataMode;investigationId:string;taskId:string;question:string|null;terms:string[];
 scope:"research_only";clinicalUse:"none";publicationEligible:false;graphPromotion:"none";stateLadder:readonly string[];
 sourceSet:{hash:string;ref:string|null};sources:BriefSource[];claims:BriefClaim[];claimsNote:string|null;
 provenance:{receipts:BriefReceipt[];audit:{status:"verified"|"not_supplied";records:number;headHash:string|null};incomplete:boolean;quarantined:number;rejectedSources:number};
 limitations:string[];contentHash:string;
};

export const BRIEF_LIMITS={maxCandidates:100,maxClaims:200} as const;
export const BRIEF_ID=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
export const BRIEF_PROVIDER=/^[a-z0-9-]{2,40}$/;
export const BRIEF_HASH=/^[a-f0-9]{64}$/;
export const BRIEF_CLAIM_ID=/^c-[a-z0-9-]{3,40}$/;
export const BRIEF_ASSESSMENT_REF=/^[A-Za-z0-9][A-Za-z0-9._:/-]{2,120}$/;
export const BRIEF_SOURCE_URL=/^https:\/\/(europepmc\.org\/[A-Za-z0-9/_.%-]{1,200}|openalex\.org\/W\d{1,15}|doi\.org\/10\.\d{4,9}\/[A-Za-z0-9._;()/:%-]{1,160})$/;
// eslint-disable-next-line no-control-regex
export const BRIEF_CTRL=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]|\p{Cf}/gu;

/** Sorted-key canonical JSON. Identical to the canonical form hashed by `hashHsiCheckpointInput`. */
export const canonicalJson=(x:unknown):string=>Array.isArray(x)?"["+x.map(canonicalJson).join(",")+"]":x&&typeof x==="object"?"{"+Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canonicalJson(v)).join(",")+"}":JSON.stringify(x)??"null";

/** Every structural and state invariant EXCEPT the content hash. Throws on any violation. */
export function checkBriefInvariants(value:unknown):LiteratureBrief{
 const b=value as LiteratureBrief;
 if(!b||typeof b!=="object"||b.schemaVersion!=="hsi-literature-brief-1")throw Error("Not a literature brief");
 if(!(BRIEF_DATA_MODES as readonly string[]).includes(b.dataMode))throw Error("Brief does not say whether its data is recorded or live");
 if(b.scope!=="research_only"||b.clinicalUse!=="none"||b.publicationEligible!==false||b.graphPromotion!=="none")throw Error("Brief scope flags were altered");
 if(JSON.stringify(b.stateLadder)!==JSON.stringify(EVIDENCE_STATE_LADDER))throw Error("State ladder was altered");
 if(!BRIEF_ID.test(String(b.investigationId))||!BRIEF_ID.test(String(b.taskId))||!BRIEF_HASH.test(String(b.contentHash))||!BRIEF_HASH.test(String(b.sourceSet?.hash)))throw Error("Malformed brief identity");
 if(!Array.isArray(b.sources)||b.sources.length>BRIEF_LIMITS.maxCandidates||!Array.isArray(b.claims)||b.claims.length>BRIEF_LIMITS.maxClaims||!Array.isArray(b.terms)||!Array.isArray(b.limitations)||!Array.isArray(b.provenance?.receipts))throw Error("Malformed brief");
 const ids=new Set<string>();
 for(const s of b.sources){
  if(s.state!=="retrieved"||s.reviewStatus!=="unreviewed"||!BRIEF_SOURCE_URL.test(String(s.sourceUrl))||!Array.isArray(s.providers)||!s.providers.every(p=>BRIEF_PROVIDER.test(String(p))))throw Error("A source is not a retrieved, unreviewed, approved-host hit");
  ids.add(String(s.canonicalId).toLowerCase());
 }
 const seen=new Set<string>();
 for(const c of b.claims){
  if(!BRIEF_CLAIM_ID.test(String(c.claimId))||seen.has(c.claimId)||!(CREATABLE_CLAIM_STATES as readonly string[]).includes(c.state))throw Error("A claim is in a state this brief cannot hold");
  seen.add(c.claimId);
  if(!ids.has(String(c.sourceCanonicalId).toLowerCase()))throw Error("A claim is not linked to a source");
  if(c.independentlyVerified!==false||c.promotable!==false||c.contextNormalised!==false)throw Error("A claim was promoted or marked verified");
  if(c.state==="model_assessed"?!(typeof c.assessmentRef==="string"&&BRIEF_ASSESSMENT_REF.test(c.assessmentRef)):c.assessmentRef!==null)throw Error("Assessment reference does not match claim state");
 }
 for(const r of b.provenance.receipts)if(!BRIEF_PROVIDER.test(String(r.provider))||typeof r.ok!=="boolean"||!Number.isInteger(r.auditSeq))throw Error("Malformed receipt");
 return b;
}
/** The text that is hashed: the brief without its own hash. */
export const briefHashInput=(b:LiteratureBrief):string=>{const {contentHash:_,...body}=b;return canonicalJson(body)};

/** Invariants plus the content hash, with the digest injected (async in the browser, sync on the server). */
export async function verifyBriefWith(value:unknown,sha256Hex:(text:string)=>Promise<string>):Promise<LiteratureBrief>{
 const b=checkBriefInvariants(value);
 if(await sha256Hex(briefHashInput(b))!==b.contentHash)throw Error("Brief content does not match its hash");
 return b;
}

/* ---------- rendering (pure; callers verify first) ---------- */
/** Besides escaping, URL schemes and `www.` are defanged in untrusted text ("https :" not "https:"), because GitHub-flavoured renderers
 * auto-link bare URLs even inside escaped text. The JSON export keeps the original strings; only validated source links appear as
 * links, and only inside code spans. */
export const briefMarkdownText=(s:unknown)=>String(s??"").replace(BRIEF_CTRL," ").replace(/\s+/g," ")
 .replace(/\b(https?|ftps?|file|javascript|data|vbscript|mailto|sftp|ssh|git)\s*:/gi,"$1 :").replace(/\bwww\s*\./gi,"www .").replace(/@/g," at ")
 .replace(/[\\<>\[\]()*_`#|!&~{}+\-=]/g,c=>"\\"+c).trim();
const canon=(x:unknown):unknown=>Array.isArray(x)?x.map(canon):x&&typeof x==="object"?Object.fromEntries(Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canon(v)])):x;
export const renderBriefJson=(b:LiteratureBrief):string=>JSON.stringify(canon(b),null,2)+"\n";
export const DATA_MODE_BANNER:Record<BriefDataMode,string>={
 fixture_recorded:"RECORDED FIXTURE DATA — these hits come from recorded responses, not a live provider search. Not a research finding.",
 live:"Live provider search results, as returned at the time recorded in the audit log.",
};

export function renderBriefMarkdown(b:LiteratureBrief):string{
 const md=briefMarkdownText;
 const L:string[]=["# Human Super Intelligence — literature brief","",`**${DATA_MODE_BANNER[b.dataMode]}**`,"","**Research preview. Search hits, not evidence. Nothing here is reviewed, approved or clinical advice.**",""];
 if(b.question)L.push("Question (as supplied):",md(b.question),"");
 L.push(`Investigation: ${md(b.investigationId)}`,`Task: ${md(b.taskId)}`,`Data source: ${md(b.dataMode)}`,`Search terms: ${b.terms.map(md).join("; ")}`,`Brief SHA-256: ${b.contentHash}`,`Candidate set SHA-256: ${b.sourceSet.hash}`,b.sourceSet.ref?`Candidate set reference: ${md(b.sourceSet.ref)}`:"Candidate set reference: not supplied","",
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
