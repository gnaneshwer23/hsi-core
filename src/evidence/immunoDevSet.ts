/**
 * A4.3 — founder immunology development-set authoring tooling.
 *
 * Owner drafts cases offline under the gitignored label vault. Import validates
 * schema. Scoring and numeric floors stay blocked until an independent owner
 * decision — this module never invents floors or enables the locked evaluator.
 */
import {existsSync,mkdirSync,readFileSync,renameSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {
 IMMUNO_ALLOCATIONS,
 buildImmunoProtocol,
 type ImmunoCase,
 type ImmunoDomain,
 type ImmunoLayer,
 validateImmunoCase,
} from "./immunoBenchmark";
import {createImmunoLockedEvaluator} from "./immunoBenchmarkAcceptance";
import {
 LABEL_VAULT_DIRNAME,
 assertSafeVaultWritePath,
 atomicWriteJson,
 initLabelVault,
 refreshLabelVaultManifest,
 vaultRoot,
 withLabelVaultLock,
} from "./labelVault";

export const IMMUNO_DEV_SET_SCHEMA="hsi-immuno-dev-set-1" as const;
export const IMMUNO_DEV_CASE_DRAFT_SCHEMA="hsi-immuno-dev-case-draft-1" as const;
export const IMMUNO_DEV_SET_RELATIVE=`${LABEL_VAULT_DIRNAME}/immuno/dev-set` as const;

const TASK_TYPES=new Set([
 "retrieval","extraction","entity_resolution","mechanism","contradiction","opposing_retrieval",
 "hypothesis","experiment","translational_failure","precision","e2e_investigation","abstention",
]);

/** Draft shell: partition locked to development; gold not yet filled. */
export type ImmunoDevCaseDraft={
 schemaVersion:typeof IMMUNO_DEV_CASE_DRAFT_SCHEMA;
 caseId:string;
 partition:"development";
 slotId:null;
 layer:ImmunoLayer;
 domain:ImmunoDomain;
 risk:"high"|"standard";
 categoryId:string;
 taskType:string;
 researchDomain:string;
 researchQuestion:string;
 biologicalClaim:string;
 estimand:string;
 permittedAnswerBoundaries:string[];
 studyFamilies:string[];
 claimFamilies:string[];
 questionFamilies:string[];
 aliases:{namespace:"R2"|"M7"|"independent_evaluation";id:string}[];
 evidence:unknown[];
 /** Null until the owner attaches vault gold privately. Never invent labels here. */
 gold:null;
 scoringBlocked:true;
 floorsOwnerApproved:false;
 scientificApproval:false;
};

export type ImmunoDevSetDocument={
 schemaVersion:typeof IMMUNO_DEV_SET_SCHEMA;
 purpose:"founder_development_set";
 scientificApproval:false;
 floorsOwnerApproved:false;
 numericFloors:null;
 scoringBlocked:true;
 heldOutSlotsForbidden:true;
 cases:Array<ImmunoDevCaseDraft|ImmunoCase>;
};

function isLayerDomain(layer:string,domain:string):layer is ImmunoLayer{
 return IMMUNO_ALLOCATIONS.some(([l,d])=>l===layer&&d===domain);
}

function nonempty(v:unknown):v is string{
 return typeof v==="string"&&v.trim().length>0&&v.length<=4000;
}

function strings(a:unknown):a is string[]{
 return Array.isArray(a)&&a.length>0&&a.every(nonempty)&&new Set(a).size===a.length;
}

function assertNoPhi(...blobs:string[]):void{
 const gate=rejectPhiPayload({textBlobs:blobs});
 if(!gate.ok)throw Error(`PHI rejected in immuno development set: ${gate.detail}`);
}

function draftTextBlobs(c:ImmunoDevCaseDraft):string[]{
 return[
  c.researchQuestion,c.biologicalClaim,c.estimand,c.researchDomain,c.categoryId,
  ...c.permittedAnswerBoundaries,...c.studyFamilies,...c.claimFamilies,...c.questionFamilies,
  ...c.aliases.map(a=>a.id),
 ];
}

function completeTextBlobs(c:ImmunoCase):string[]{
 return[
  c.researchQuestion,c.biologicalClaim,c.estimand,c.researchDomain,c.categoryId,c.gold.vaultRef,
  ...c.permittedAnswerBoundaries,...c.studyFamilies,...c.claimFamilies,...c.questionFamilies,
  ...c.aliases.map(a=>a.id),
 ];
}

/** Scaffold an empty development case (no gold). Does not invent expert labels. */
export function scaffoldImmunoDevCase(input:{
 caseId:string;
 layer:ImmunoLayer;
 domain:ImmunoDomain;
 question:string;
 risk?:"high"|"standard";
 categoryId?:string;
 taskType?:string;
}):ImmunoDevCaseDraft{
 if(!/^[A-Za-z0-9._-]{1,80}$/.test(input.caseId))throw Error("Invalid case id");
 if(!isLayerDomain(input.layer,input.domain))throw Error("Unknown immuno layer/domain allocation");
 if(!nonempty(input.question)||input.question.length>2000)throw Error("question required");
 assertNoPhi(input.question);
 const draft:ImmunoDevCaseDraft={
  schemaVersion:IMMUNO_DEV_CASE_DRAFT_SCHEMA,
  caseId:input.caseId,
  partition:"development",
  slotId:null,
  layer:input.layer,
  domain:input.domain,
  risk:input.risk??"standard",
  categoryId:input.categoryId??"abstention_uncertainty_handling",
  taskType:input.taskType??"abstention",
  researchDomain:input.domain,
  researchQuestion:input.question.trim(),
  biologicalClaim:"PENDING curator fill",
  estimand:"PENDING curator fill",
  permittedAnswerBoundaries:["PENDING curator fill"],
  studyFamilies:[`DEV_STUDY_${input.caseId}`],
  claimFamilies:[`DEV_CLAIM_${input.caseId}`],
  questionFamilies:[`DEV_QUESTION_${input.caseId}`],
  aliases:[],
  evidence:[],
  gold:null,
  scoringBlocked:true,
  floorsOwnerApproved:false,
  scientificApproval:false,
 };
 validateDraft(draft);
 return draft;
}

function assertDevDocumentMeta(doc:ImmunoDevSetDocument):void{
 if(doc.schemaVersion!==IMMUNO_DEV_SET_SCHEMA)throw Error("Unsupported immuno development-set schema");
 if(doc.purpose!=="founder_development_set")throw Error("purpose must be founder_development_set");
 if(doc.scientificApproval!==false)throw Error("Development set cannot claim scientific approval");
 if(doc.floorsOwnerApproved!==false)throw Error("floorsOwnerApproved must stay false until owner decision");
 if(doc.numericFloors!==null)throw Error("numericFloors must be null; scoring blocked until floors");
 if(doc.scoringBlocked!==true)throw Error("scoringBlocked must be true");
 if(doc.heldOutSlotsForbidden!==true)throw Error("heldOutSlotsForbidden must be true");
}

function isDraft(c:unknown):c is ImmunoDevCaseDraft{
 return Boolean(c&&typeof c==="object"&&(c as ImmunoDevCaseDraft).schemaVersion===IMMUNO_DEV_CASE_DRAFT_SCHEMA);
}

function validateDraft(c:ImmunoDevCaseDraft):void{
 if(c.partition!=="development"||c.slotId!==null)throw Error("Development drafts require partition=development and slotId=null");
 if(!isLayerDomain(c.layer,c.domain))throw Error("Unknown immuno layer/domain allocation");
 if(c.gold!==null)throw Error("Draft gold must be null until privately filled");
 if(c.scoringBlocked!==true||c.floorsOwnerApproved!==false||c.scientificApproval!==false){
  throw Error("Draft must keep scoring blocked and approvals false");
 }
 if(!TASK_TYPES.has(c.taskType))throw Error("Invalid draft taskType");
 if(![c.caseId,c.researchQuestion,c.biologicalClaim,c.estimand,c.researchDomain,c.categoryId].every(nonempty)){
  throw Error("Incomplete development draft");
 }
 if(!strings(c.permittedAnswerBoundaries)||![c.studyFamilies,c.claimFamilies,c.questionFamilies].every(strings)){
  throw Error("Draft family/boundary collections invalid");
 }
 if(!Array.isArray(c.aliases)||c.aliases.some(a=>!["R2","M7","independent_evaluation"].includes(a.namespace)||!nonempty(a.id))){
  throw Error("Draft aliases invalid");
 }
 if(new Set(c.aliases.map(a=>`${a.namespace}:${a.id}`)).size!==c.aliases.length)throw Error("Duplicate draft aliases");
 if(!Array.isArray(c.evidence)||c.evidence.length>16)throw Error("Draft evidence must be an array of at most 16 items");
 assertNoPhi(...draftTextBlobs(c));
}

function refuseHoldoutSlot(slotId:string|null):void{
 if(slotId===null)return;
 if(buildImmunoProtocol().slots.some(s=>s.slotId===slotId)){
  throw Error(`Holdout slot ${slotId} cannot appear in the founder development set`);
 }
 throw Error("Development cases must use slotId=null");
}

/** Validates an imported founder development set. Empty vault documents are allowed. */
export function validateImmunoDevSet(doc:ImmunoDevSetDocument):{
 caseCount:number;
 draftCount:number;
 completeCount:number;
 scoringBlocked:true;
 floorsOwnerApproved:false;
 numericFloors:null;
 scientificApproval:false;
}{
 assertDevDocumentMeta(doc);
 if(!Array.isArray(doc.cases))throw Error("cases must be an array");
 if(doc.cases.length>200)throw Error("Development set exceeds authoring bound");
 const ids=new Set<string>();
 const aliases=new Set<string>();
 let draftCount=0;
 let completeCount=0;
 for(const raw of doc.cases){
  if(isDraft(raw)){
   validateDraft(raw);
   refuseHoldoutSlot(raw.slotId);
   if(ids.has(raw.caseId))throw Error(`Duplicate case id: ${raw.caseId}`);
   ids.add(raw.caseId);
   for(const a of raw.aliases){
    const key=`${a.namespace}:${a.id}`;
    if(aliases.has(key))throw Error(`Duplicate alias across cases: ${key}`);
    aliases.add(key);
   }
   draftCount++;
   continue;
  }
  const c=raw as ImmunoCase;
  if(c.partition!=="development")throw Error("Imported immuno cases must use partition=development");
  refuseHoldoutSlot(c.slotId);
  validateImmunoCase(c);
  if(!c.gold||typeof c.gold.vaultRef!=="string"||!/^[a-f0-9]{64}$/.test(c.gold.sha256)){
   throw Error("Complete development cases require a vault gold reference and sha256");
  }
  assertNoPhi(...completeTextBlobs(c));
  if(ids.has(c.caseId))throw Error(`Duplicate case id: ${c.caseId}`);
  ids.add(c.caseId);
  for(const a of c.aliases){
   const key=`${a.namespace}:${a.id}`;
   if(aliases.has(key))throw Error(`Duplicate alias across cases: ${key}`);
   aliases.add(key);
  }
  completeCount++;
 }
 return{
  caseCount:doc.cases.length,
  draftCount,
  completeCount,
  scoringBlocked:true,
  floorsOwnerApproved:false,
  numericFloors:null,
  scientificApproval:false,
 };
}

export function emptyImmunoDevSet():ImmunoDevSetDocument{
 return{
  schemaVersion:IMMUNO_DEV_SET_SCHEMA,
  purpose:"founder_development_set",
  scientificApproval:false,
  floorsOwnerApproved:false,
  numericFloors:null,
  scoringBlocked:true,
  heldOutSlotsForbidden:true,
  cases:[],
 };
}

export function immunoDevSetPath(repoRoot:string):string{
 return join(vaultRoot(repoRoot),"immuno","dev-set","cases.json");
}

function writeDevSet(repoRoot:string,path:string,doc:ImmunoDevSetDocument):void{
 assertSafeVaultWritePath(repoRoot,path);
 atomicWriteJson(path,doc);
 refreshLabelVaultManifest(repoRoot);
}

export function ensureImmunoDevSetLayout(repoRoot:string):void{
 initLabelVault(repoRoot);
 const dir=join(vaultRoot(repoRoot),"immuno","dev-set");
 mkdirSync(dir,{recursive:true});
 assertSafeVaultWritePath(repoRoot,dir);
 const readme=join(dir,"README.md");
 if(!existsSync(readme)){
  assertSafeVaultWritePath(repoRoot,readme);
  const tmp=`${readme}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp,`# Founder immuno development set (A4.3)

Separately authored from the 120 holdout slots. \`slotId\` must stay null.
Gold labels are filled privately; this tree is gitignored.

- \`cases.json\` — development-set document (\`hsi-immuno-dev-set-1\`)
- Scoring and numeric floors stay blocked until an independent owner decision
- Never copy into \`site/\`, \`evaluation/\`, or git

Scientific approval: false. floorsOwnerApproved: false. numericFloors: null.
`,{flag:"wx"});
  renameSync(tmp,readme);
 }
 const path=immunoDevSetPath(repoRoot);
 assertSafeVaultWritePath(repoRoot,path);
 if(!existsSync(path)){
  writeDevSet(repoRoot,path,emptyImmunoDevSet());
 }
}

export function appendImmunoDevCase(
 repoRoot:string,
 draft:ImmunoDevCaseDraft,
):{path:string;total:number}{
 return withLabelVaultLock(repoRoot,"immuno-dev-set",()=>{
  ensureImmunoDevSetLayout(repoRoot);
  const path=immunoDevSetPath(repoRoot);
  assertSafeVaultWritePath(repoRoot,path);
  validateDraft(draft);
  const doc=JSON.parse(readFileSync(path,"utf8")) as ImmunoDevSetDocument;
  assertDevDocumentMeta(doc);
  if(doc.cases.some(c=>("caseId" in c)&&c.caseId===draft.caseId)){
   throw Error(`Case id already present: ${draft.caseId}`);
  }
  doc.cases.push(draft);
  validateImmunoDevSet(doc);
  writeDevSet(repoRoot,path,doc);
  return{path:path.slice(repoRoot.length+1).replaceAll("\\","/"),total:doc.cases.length};
 });
}

const PUBLIC_SOURCE_PREFIXES=["site/","evaluation/","src/","docs/","research/"];

/** Import merges new case ids into the vault; never overwrites existing ids. */
export function importImmunoDevSet(
 repoRoot:string,
 sourcePath:string,
):{path:string;summary:ReturnType<typeof validateImmunoDevSet>;merged:number}{
 return withLabelVaultLock(repoRoot,"immuno-dev-set",()=>{
  const abs=resolve(sourcePath);
  if(!existsSync(abs))throw Error(`Import source not found: ${sourcePath}`);
  const repoAbs=resolve(repoRoot);
  if(abs===repoAbs||abs.startsWith(repoAbs+"/")){
   const rel=abs.slice(repoAbs.length+1).replaceAll("\\","/");
   if(PUBLIC_SOURCE_PREFIXES.some(p=>rel===p.slice(0,-1)||rel.startsWith(p))){
    throw Error("Refuse to treat public repository paths as private immuno gold sources");
   }
  }
  const incoming=JSON.parse(readFileSync(abs,"utf8")) as ImmunoDevSetDocument;
  validateImmunoDevSet(incoming);
  if(incoming.cases.length===0)throw Error("Import source has no cases");
  ensureImmunoDevSetLayout(repoRoot);
  const dest=immunoDevSetPath(repoRoot);
  assertSafeVaultWritePath(repoRoot,dest);
  const existing=JSON.parse(readFileSync(dest,"utf8")) as ImmunoDevSetDocument;
  assertDevDocumentMeta(existing);
  const existingIds=new Set(existing.cases.map(c=>c.caseId));
  let merged=0;
  for(const c of incoming.cases){
   if(existingIds.has(c.caseId))throw Error(`Refuse to overwrite existing case id: ${c.caseId}`);
   existing.cases.push(c);
   existingIds.add(c.caseId);
   merged++;
  }
  const summary=validateImmunoDevSet(existing);
  writeDevSet(repoRoot,dest,existing);
  return{path:dest.slice(repoRoot.length+1).replaceAll("\\","/"),summary,merged};
 });
}

export function loadImmunoDevSet(repoRoot:string):ImmunoDevSetDocument{
 const path=immunoDevSetPath(repoRoot);
 if(!existsSync(path))throw Error("No immuno development set in the private vault (run scaffold/import first)");
 const doc=JSON.parse(readFileSync(path,"utf8")) as ImmunoDevSetDocument;
 validateImmunoDevSet(doc);
 return doc;
}

/**
 * Scoring entry for the founder development set — always refuses.
 * Floors and the locked evaluator stay blocked until an independent owner decision.
 */
export function refuseImmunoDevSetScoring(doc:ImmunoDevSetDocument):never{
 validateImmunoDevSet(doc);
 if(doc.numericFloors!==null||doc.floorsOwnerApproved!==false||doc.scoringBlocked!==true){
  throw Error("Development set scoring gates were tampered with");
 }
 try{
  createImmunoLockedEvaluator({
   enabled:false,
   authorize:async()=>false,
   evaluate:async()=>({}),
   assess:async()=>{throw Error("unreachable")},
   verifyAssessment:async()=>false,
  });
 }catch{
  /* constructor itself must not throw when disabled */
 }
 throw Error(
  "Immuno development-set scoring is blocked until numeric floors are owner-approved (A4.3). numericFloors=null; floorsOwnerApproved=false.",
 );
}
