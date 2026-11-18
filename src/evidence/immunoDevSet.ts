/**
 * A4.3 — founder immunology development-set authoring tooling.
 *
 * Owner drafts cases offline under the gitignored label vault. Import validates
 * schema. Scoring and numeric floors stay blocked until an independent owner
 * decision — this module never invents floors or enables the locked evaluator.
 */
import {existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {join,resolve,sep} from "node:path";
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
 initLabelVault,
 refusePublicWrite,
 vaultRoot,
} from "./labelVault";

export const IMMUNO_DEV_SET_SCHEMA="hsi-immuno-dev-set-1" as const;
export const IMMUNO_DEV_CASE_DRAFT_SCHEMA="hsi-immuno-dev-case-draft-1" as const;
export const IMMUNO_DEV_SET_RELATIVE=`${LABEL_VAULT_DIRNAME}/immuno/dev-set` as const;

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

function assertUnderVault(repoRoot:string,target:string){
 const root=resolve(vaultRoot(repoRoot))+sep;
 const resolved=resolve(target);
 if(resolved!==resolve(vaultRoot(repoRoot))&&!resolved.startsWith(root)){
  throw Error("Immuno development set must stay under .hsi-private-benchmark/");
 }
}

function isLayerDomain(layer:string,domain:string):layer is ImmunoLayer{
 return IMMUNO_ALLOCATIONS.some(([l,d])=>l===layer&&d===domain);
}

function nonempty(v:unknown):v is string{
 return typeof v==="string"&&v.trim().length>0&&v.length<=4000;
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
 return{
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
 if(![c.caseId,c.researchQuestion,c.biologicalClaim,c.estimand].every(nonempty))throw Error("Incomplete development draft");
}

function refuseHoldoutSlot(slotId:string|null):void{
 if(slotId===null)return;
 if(buildImmunoProtocol().slots.some(s=>s.slotId===slotId)){
  throw Error(`Holdout slot ${slotId} cannot appear in the founder development set`);
 }
 throw Error("Development cases must use slotId=null");
}

/** Validates an imported founder development set. Scoring/floors remain blocked. */
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
 if(!Array.isArray(doc.cases)||doc.cases.length===0)throw Error("Development set requires at least one case");
 if(doc.cases.length>200)throw Error("Development set exceeds authoring bound");
 const ids=new Set<string>();
 let draftCount=0;
 let completeCount=0;
 for(const raw of doc.cases){
  if(isDraft(raw)){
   validateDraft(raw);
   refuseHoldoutSlot(raw.slotId);
   if(ids.has(raw.caseId))throw Error(`Duplicate case id: ${raw.caseId}`);
   ids.add(raw.caseId);
   draftCount++;
   continue;
  }
  const c=raw as ImmunoCase;
  if(c.partition!=="development")throw Error("Imported immuno cases must use partition=development");
  refuseHoldoutSlot(c.slotId);
  validateImmunoCase(c);
  if(ids.has(c.caseId))throw Error(`Duplicate case id: ${c.caseId}`);
  ids.add(c.caseId);
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

export function ensureImmunoDevSetLayout(repoRoot:string):void{
 initLabelVault(repoRoot);
 const dir=join(vaultRoot(repoRoot),"immuno","dev-set");
 assertUnderVault(repoRoot,dir);
 refusePublicWrite(dir,repoRoot);
 mkdirSync(dir,{recursive:true});
 const readme=join(dir,"README.md");
 if(!existsSync(readme)){
  writeFileSync(readme,`# Founder immuno development set (A4.3)

Separately authored from the 120 holdout slots. \`slotId\` must stay null.
Gold labels are filled privately; this tree is gitignored.

- \`cases.json\` — development-set document (\`hsi-immuno-dev-set-1\`)
- Scoring and numeric floors stay blocked until an independent owner decision
- Never copy into \`site/\`, \`evaluation/\`, or git

Scientific approval: false. floorsOwnerApproved: false. numericFloors: null.
`);
 }
 const path=immunoDevSetPath(repoRoot);
 if(!existsSync(path)){
  refusePublicWrite(path,repoRoot);
  writeFileSync(path,`${JSON.stringify(emptyImmunoDevSet(),null,2)}\n`);
 }
}

export function appendImmunoDevCase(
 repoRoot:string,
 draft:ImmunoDevCaseDraft,
):{path:string;total:number}{
 ensureImmunoDevSetLayout(repoRoot);
 const path=immunoDevSetPath(repoRoot);
 refusePublicWrite(path,repoRoot);
 validateDraft(draft);
 const doc=JSON.parse(readFileSync(path,"utf8")) as ImmunoDevSetDocument;
 assertDevDocumentMeta(doc);
 if(doc.cases.some(c=>("caseId" in c)&&c.caseId===draft.caseId)){
  throw Error(`Case id already present: ${draft.caseId}`);
 }
 doc.cases.push(draft);
 validateImmunoDevSet(doc);
 writeFileSync(path,`${JSON.stringify(doc,null,2)}\n`);
 return{path:path.slice(repoRoot.length+1).replaceAll("\\","/"),total:doc.cases.length};
}

/** Import a founder development-set JSON file into the private vault. */
export function importImmunoDevSet(
 repoRoot:string,
 sourcePath:string,
):{path:string;summary:ReturnType<typeof validateImmunoDevSet>}{
 const abs=resolve(sourcePath);
 if(!existsSync(abs))throw Error(`Import source not found: ${sourcePath}`);
 // Refuse importing from committed public trees into a confused workflow.
 const rel=abs.slice(resolve(repoRoot).length+1).replaceAll("\\","/");
 if(rel.startsWith("site/")||rel.startsWith("evaluation/")||rel.startsWith("src/")){
  throw Error("Refuse to treat public repository paths as private immuno gold sources");
 }
 const doc=JSON.parse(readFileSync(abs,"utf8")) as ImmunoDevSetDocument;
 const summary=validateImmunoDevSet(doc);
 ensureImmunoDevSetLayout(repoRoot);
 const dest=immunoDevSetPath(repoRoot);
 refusePublicWrite(dest,repoRoot);
 writeFileSync(dest,`${JSON.stringify(doc,null,2)}\n`);
 return{path:dest.slice(repoRoot.length+1).replaceAll("\\","/"),summary};
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
 // Prove the locked evaluator remains disabled by default.
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
