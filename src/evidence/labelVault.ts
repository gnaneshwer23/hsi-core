/**
 * VER-05 label vault layout and authoring stubs.
 *
 * Expert labels and freeze digests live only under the gitignored
 * `.hsi-private-benchmark/` tree. This module never invents gold labels,
 * never writes vault content into `site/` or other public artifacts, and
 * never claims scientific approval.
 */
import {createHash} from "node:crypto";
import {
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {dirname,join,resolve,sep} from "node:path";

export const LABEL_VAULT_SCHEMA="hsi-label-vault-layout-1" as const;
export const LABEL_VAULT_DIRNAME=".hsi-private-benchmark" as const;

export const LABEL_VAULT_TRACKS=["conflict","immuno","freezes","manifests"] as const;
export type LabelVaultTrack=(typeof LABEL_VAULT_TRACKS)[number];

export type LabelVaultLayout={
  schemaVersion:typeof LABEL_VAULT_SCHEMA;
  root:typeof LABEL_VAULT_DIRNAME;
  tracks:ReadonlyArray<{
    id:LabelVaultTrack;
    path:string;
    purpose:string;
    requiredFiles:string[];
  }>;
  runtimeMayRead:false;
  scientificApproval:false;
  goldCommittedInGit:false;
};

export const LABEL_VAULT_LAYOUT:LabelVaultLayout=Object.freeze({
  schemaVersion:LABEL_VAULT_SCHEMA,
  root:LABEL_VAULT_DIRNAME,
  tracks:Object.freeze([
    Object.freeze({
      id:"conflict" as const,
      path:`${LABEL_VAULT_DIRNAME}/conflict`,
      purpose:"HSI-BENCH-CONFLICT expert cases, labels and private reports",
      requiredFiles:["cases.json","README.md"],
    }),
    Object.freeze({
      id:"immuno" as const,
      path:`${LABEL_VAULT_DIRNAME}/immuno`,
      purpose:"Immunology benchmark private curation: founder development set + holdout drafts (not public slots)",
      requiredFiles:["README.md","dev-set/cases.json","dev-set/README.md"],
    }),
    Object.freeze({
      id:"freezes" as const,
      path:`${LABEL_VAULT_DIRNAME}/freezes`,
      purpose:"Hashed label freezes the scoring job may read; runtime DB role must not",
      requiredFiles:["README.md"],
    }),
    Object.freeze({
      id:"manifests" as const,
      path:`${LABEL_VAULT_DIRNAME}/manifests`,
      purpose:"Vault inventory and freeze index (ids and digests only)",
      requiredFiles:["vault-manifest.v1.json","README.md"],
    }),
  ]),
  runtimeMayRead:false,
  scientificApproval:false,
  goldCommittedInGit:false,
});

export type VaultManifest={
  schemaVersion:"hsi-label-vault-manifest-1";
  createdAt:string;
  tracks:LabelVaultTrack[];
  caseCounts:{conflict:number;immuno:number};
  freezes:string[];
  scientificApproval:false;
  containsGoldLabels:boolean;
};

export type LabelFreezeRecord={
  schemaVersion:"hsi-label-freeze-1";
  track:"conflict"|"immuno";
  sourceRelativePath:string;
  frozenAt:string;
  contentSha256:string;
  caseIds:string[];
  labelCount:number;
  scientificApproval:false;
  floorsOwnerApproved:false;
};

function assertUnderRoot(root:string,target:string){
  const resolvedRoot=resolve(root)+sep;
  const resolvedTarget=resolve(target);
  if(resolvedTarget!==resolve(root)&&!resolvedTarget.startsWith(resolvedRoot)){
    throw Error("Label vault path escapes repository root");
  }
}

export function vaultRoot(repoRoot:string):string{
  return resolve(repoRoot,LABEL_VAULT_DIRNAME);
}

export function refusePublicWrite(target:string,repoRoot:string){
  const rel=resolve(target).slice(resolve(repoRoot).length+1).replaceAll("\\","/");
  const blocked=["site/","evaluation/","src/","docs/","research/"];
  if(blocked.some(p=>rel===p.slice(0,-1)||rel.startsWith(p))){
    throw Error("Label vault content must not be written into public repository paths");
  }
  if(!rel.startsWith(`${LABEL_VAULT_DIRNAME}/`)&&rel!==LABEL_VAULT_DIRNAME){
    throw Error("Label vault writes are restricted to .hsi-private-benchmark/");
  }
}

/** Refuse symlinks and resolved targets outside the private vault tree. */
export function assertSafeVaultWritePath(repoRoot:string,target:string){
  refusePublicWrite(target,repoRoot);
  const abs=resolve(target);
  // A checkout reached through a symlinked directory (macOS /var -> /private/var) must compare real paths with real paths.
  const realRoot=existsSync(repoRoot)?realpathSync(repoRoot):resolve(repoRoot);
  const vault=join(realRoot,LABEL_VAULT_DIRNAME);
  let cur=abs;
  for(;;){
    if(existsSync(cur)&&lstatSync(cur).isSymbolicLink()){
      throw Error("Label vault path must not be a symlink");
    }
    const parent=dirname(cur);
    if(parent===cur||!parent.startsWith(resolve(repoRoot)))break;
    cur=parent;
  }
  if(existsSync(abs)){
    const real=realpathSync(abs);
    refusePublicWrite(real,realRoot);
    if(real!==vault&&!real.startsWith(vault+sep)){
      throw Error("Resolved vault path escapes .hsi-private-benchmark/");
    }
  }
}

/** Write JSON via temp file + rename so a crash cannot leave a truncated document. */
export function atomicWriteJson(path:string,value:unknown){
  mkdirSync(dirname(path),{recursive:true});
  const tmp=`${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp,`${JSON.stringify(value,null,2)}\n`,{flag:"wx"});
  renameSync(tmp,path);
}

function writeIfMissing(path:string,content:string){
  if(existsSync(path))return false;
  mkdirSync(resolve(path,".."),{recursive:true});
  const tmp=`${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp,content,{flag:"wx"});
  renameSync(tmp,path);
  return true;
}

const CONFLICT_README=`# Private conflict benchmark vault

Expert cases and labels for HSI-BENCH-CONFLICT (A4.2 expert path).

- Put cases in \`cases.json\` (JSON array). See \`evaluation/conflict-benchmark/README.md\`.
- Optional comparator predictions: \`predictions/*.json\`
- Reports from \`bun run conflict:bench:expert\` land under \`reports/\`
- Public fixtures stay in \`evaluation/conflict-benchmark/fixtures/\` and are never mixed in
- Never copy this directory into git, \`site/\`, or public evaluation fixtures

Scientific approval: false. Gold labels stay private.
`;

const IMMUNO_README=`# Private immuno benchmark vault

- \`dev-set/\` — founder development set (A4.3); \`slotId\` always null; scoring blocked until floors
- Holdout drafts for the 120 public slots stay separate; never mix partitions

Public repository holds authoring *slots* only (\`src/evidence/immunoBenchmark.ts\`).
Real questions, gold labels and reviewer identities belong here, never in git.

Scientific approval: false. floorsOwnerApproved: false. numericFloors: null.
`;

const IMMUNO_DEV_SET_README=`# Founder immuno development set (A4.3)

Separately authored from the 120 holdout slots. \`slotId\` must stay null.
Import with \`bun run label-vault:import-immuno-dev -- --from <file.json>\`.
Scaffold with \`bun run label-vault:scaffold-immuno-dev -- --id DEV-001 --layer core --domain innate_adaptive_cells --question "..."\`.

Scoring refuses until an independent owner approves numeric floors.
Never copy into git, \`site/\`, or public evaluation fixtures.

Scientific approval: false. floorsOwnerApproved: false. numericFloors: null.
`;

const FREEZES_README=`# Label freezes (VER-05)

Frozen, hashed label snapshots. The scoring job may read these files from the private vault.
The application runtime database role must not.

Create a freeze with \`bun run label-vault:freeze -- --track conflict\` after cases are labelled.
`;

const MANIFEST_README=`# Vault manifests

Inventory files list track paths, case counts and freeze digests only.
They must not embed gold label text.
`;

function emptyConflictCases():string{
  return `${JSON.stringify([],null,2)}\n`;
}

function emptyManifest(now:string):VaultManifest{
  return {
    schemaVersion:"hsi-label-vault-manifest-1",
    createdAt:now,
    tracks:[...LABEL_VAULT_TRACKS],
    caseCounts:{conflict:0,immuno:0},
    freezes:[],
    scientificApproval:false,
    containsGoldLabels:false,
  };
}

export function initLabelVault(repoRoot:string,now=new Date().toISOString()):{root:string;created:string[]}{
  const root=vaultRoot(repoRoot);
  assertUnderRoot(repoRoot,root);
  refusePublicWrite(root,repoRoot);
  mkdirSync(root,{recursive:true});
  const created:string[]=[];
  const files:Array<[string,string]>=[
    [join(root,"README.md"),"# HSI private label vault (VER-05)\n\nGitignored. No gold labels in the public repository. Runtime must not read this tree.\n"],
    [join(root,"conflict","README.md"),CONFLICT_README],
    [join(root,"conflict","cases.json"),emptyConflictCases()],
    [join(root,"immuno","README.md"),IMMUNO_README],
    [join(root,"immuno","dev-set","README.md"),IMMUNO_DEV_SET_README],
    [join(root,"immuno","dev-set","cases.json"),`${JSON.stringify({
      schemaVersion:"hsi-immuno-dev-set-1",
      purpose:"founder_development_set",
      scientificApproval:false,
      floorsOwnerApproved:false,
      numericFloors:null,
      scoringBlocked:true,
      heldOutSlotsForbidden:true,
      cases:[],
    },null,2)}\n`],
    [join(root,"freezes","README.md"),FREEZES_README],
    [join(root,"manifests","README.md"),MANIFEST_README],
    [join(root,"manifests","vault-manifest.v1.json"),`${JSON.stringify(emptyManifest(now),null,2)}\n`],
  ];
  for(const [path,content] of files){
    if(writeIfMissing(path,content))created.push(path.slice(repoRoot.length+1).replaceAll("\\","/"));
  }
  mkdirSync(join(root,"conflict","reports"),{recursive:true});
  mkdirSync(join(root,"conflict","predictions"),{recursive:true});
  writeIfMissing(
    join(root,"conflict","predictions","README.md"),
    "# Comparator predictions (private)\n\nOne JSON file per hand-run system. Loaded by `bun run conflict:bench:expert`.\n",
  );
  return {root,created};
}

export type VaultStatus={
  present:boolean;
  root:string;
  missing:string[];
  caseCounts:{conflict:number;immuno:number};
  freezeCount:number;
  scientificApproval:false;
  goldCommittedInGit:false;
};

function countConflictCases(casesPath:string):number{
  if(!existsSync(casesPath))return 0;
  const raw=JSON.parse(readFileSync(casesPath,"utf8"));
  return Array.isArray(raw)?raw.length:0;
}

function countImmunoDevCases(casesPath:string):number{
  if(!existsSync(casesPath))return 0;
  const raw=JSON.parse(readFileSync(casesPath,"utf8")) as {cases?:unknown};
  return Array.isArray(raw.cases)?raw.cases.length:0;
}

export function labelVaultStatus(repoRoot:string):VaultStatus{
  const root=vaultRoot(repoRoot);
  const missing:string[]=[];
  for(const track of LABEL_VAULT_LAYOUT.tracks){
    const dir=join(repoRoot,track.path);
    if(!existsSync(dir)||!statSync(dir).isDirectory()){
      missing.push(track.path);
      continue;
    }
    for(const file of track.requiredFiles){
      const p=join(dir,file);
      if(!existsSync(p))missing.push(`${track.path}/${file}`);
    }
  }
  const freezeDir=join(root,"freezes");
  const freezeCount=existsSync(freezeDir)
    ?readdirSync(freezeDir).filter(f=>f.endsWith(".json")&&f!=="README.md").length
    :0;
  return {
    present:missing.length===0,
    root:root.slice(repoRoot.length+1).replaceAll("\\","/"),
    missing,
    caseCounts:{
      conflict:countConflictCases(join(root,"conflict","cases.json")),
      immuno:countImmunoDevCases(join(root,"immuno","dev-set","cases.json")),
    },
    freezeCount,
    scientificApproval:false,
    goldCommittedInGit:false,
  };
}

export function validateLabelVaultLayout(repoRoot:string):VaultStatus{
  const status=labelVaultStatus(repoRoot);
  if(!status.present)throw Error(`Label vault layout incomplete: ${status.missing.join(", ")}`);
  const manifestPath=join(rootSafe(repoRoot),"manifests","vault-manifest.v1.json");
  const manifest=JSON.parse(readFileSync(manifestPath,"utf8")) as VaultManifest;
  if(manifest.schemaVersion!=="hsi-label-vault-manifest-1")throw Error("Unsupported vault manifest schema");
  if(manifest.scientificApproval!==false)throw Error("Vault manifest cannot claim scientific approval");
  return status;
}

function rootSafe(repoRoot:string){
  const root=vaultRoot(repoRoot);
  assertUnderRoot(repoRoot,root);
  return root;
}

/** Scaffold an empty expert case shell (no labels). Does not invent gold. */
export function scaffoldConflictCaseStub(input:{id:string;question:string}):Record<string,unknown>{
  if(!/^[A-Za-z0-9._-]{1,80}$/.test(input.id))throw Error("Invalid case id");
  if(!input.question.trim()||input.question.length>2000)throw Error("question required");
  return {
    id:input.id,
    question:input.question.trim(),
    provenance:"expert_curated",
    records:[
      {
        sourceId:"PMID:pending",
        citation:"Pending curator fill",
        model:"unspecified",
        tissue:null,
        population:null,
        design:null,
        negated:false,
      },
    ],
    labels:[],
    adjudicated:null,
  };
}

export function appendConflictCaseStub(repoRoot:string,stub:Record<string,unknown>):{path:string;total:number}{
  const root=rootSafe(repoRoot);
  const path=join(root,"conflict","cases.json");
  refusePublicWrite(path,repoRoot);
  if(!existsSync(path))initLabelVault(repoRoot);
  const raw=JSON.parse(readFileSync(path,"utf8"));
  if(!Array.isArray(raw))throw Error("cases.json must be a JSON array");
  if(raw.some((c:any)=>c&&c.id===stub.id))throw Error(`Case id already present: ${stub.id}`);
  raw.push(stub);
  writeFileSync(path,`${JSON.stringify(raw,null,2)}\n`);
  return {path:path.slice(repoRoot.length+1).replaceAll("\\","/"),total:raw.length};
}

export function freezeConflictLabels(repoRoot:string,now=new Date().toISOString()):LabelFreezeRecord{
  const root=rootSafe(repoRoot);
  const source=join(root,"conflict","cases.json");
  refusePublicWrite(source,repoRoot);
  if(!existsSync(source))throw Error("No conflict cases.json to freeze");
  const text=readFileSync(source,"utf8");
  const cases=JSON.parse(text);
  if(!Array.isArray(cases))throw Error("cases.json must be a JSON array");
  const labelled=cases.filter((c:any)=>Array.isArray(c?.labels)&&c.labels.length>0||c?.adjudicated!=null);
  if(labelled.length===0)throw Error("Refuse to freeze: no labelled or adjudicated cases yet");
  const contentSha256=createHash("sha256").update(text).digest("hex");
  const record:LabelFreezeRecord={
    schemaVersion:"hsi-label-freeze-1",
    track:"conflict",
    sourceRelativePath:`${LABEL_VAULT_DIRNAME}/conflict/cases.json`,
    frozenAt:now,
    contentSha256,
    caseIds:labelled.map((c:any)=>String(c.id)),
    labelCount:labelled.reduce((n:number,c:any)=>n+(Array.isArray(c.labels)?c.labels.length:0)+(c.adjudicated?1:0),0),
    scientificApproval:false,
    floorsOwnerApproved:false,
  };
  const out=join(root,"freezes",`conflict-${contentSha256.slice(0,12)}.json`);
  refusePublicWrite(out,repoRoot);
  writeFileSync(out,`${JSON.stringify(record,null,2)}\n`);
  refreshManifest(repoRoot,now);
  return record;
}

function conflictHasGoldLabels(casesPath:string):boolean{
  if(!existsSync(casesPath))return false;
  const raw=JSON.parse(readFileSync(casesPath,"utf8"));
  if(!Array.isArray(raw))return false;
  return raw.some((c:any)=>Array.isArray(c?.labels)&&c.labels.length>0||c?.adjudicated!=null);
}

function immunoDevHasGoldLabels(casesPath:string):boolean{
  if(!existsSync(casesPath))return false;
  const raw=JSON.parse(readFileSync(casesPath,"utf8")) as {cases?:unknown};
  if(!Array.isArray(raw.cases))return false;
  return raw.cases.some((c:any)=>c&&c.gold!=null&&typeof c.gold==="object");
}

export function refreshLabelVaultManifest(repoRoot:string,now=new Date().toISOString()){
  const root=rootSafe(repoRoot);
  const freezeDir=join(root,"freezes");
  const freezes=existsSync(freezeDir)
    ?readdirSync(freezeDir).filter(f=>f.endsWith(".json")).sort()
    :[];
  const conflictPath=join(root,"conflict","cases.json");
  const immunoPath=join(root,"immuno","dev-set","cases.json");
  const manifest:VaultManifest={
    schemaVersion:"hsi-label-vault-manifest-1",
    createdAt:now,
    tracks:[...LABEL_VAULT_TRACKS],
    caseCounts:{
      conflict:countConflictCases(conflictPath),
      immuno:countImmunoDevCases(immunoPath),
    },
    freezes,
    scientificApproval:false,
    containsGoldLabels:freezes.length>0||conflictHasGoldLabels(conflictPath)||immunoDevHasGoldLabels(immunoPath),
  };
  assertSafeVaultWritePath(repoRoot,join(root,"manifests","vault-manifest.v1.json"));
  atomicWriteJson(join(root,"manifests","vault-manifest.v1.json"),manifest);
}

function refreshManifest(repoRoot:string,now:string){
  refreshLabelVaultManifest(repoRoot,now);
}

/** Exclusive lock for immuno/conflict vault mutations (single-host authoring). */
export function withLabelVaultLock<T>(repoRoot:string,lockName:string,fn:()=>T):T{
  const lockDir=join(vaultRoot(repoRoot),".locks");
  mkdirSync(lockDir,{recursive:true});
  const lockPath=join(lockDir,`${lockName}.lock`);
  assertSafeVaultWritePath(repoRoot,lockPath);
  let fd:number;
  try{
    fd=openSync(lockPath,"wx");
  }catch{
    throw Error(`Label vault is locked (${lockName}); retry after the other authoring process exits`);
  }
  try{
    return fn();
  }finally{
    closeSync(fd);
    try{unlinkSync(lockPath)}catch{/* ignore */}
  }
}
