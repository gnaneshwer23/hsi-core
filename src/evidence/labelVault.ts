/**
 * VER-05 label vault layout and authoring stubs.
 *
 * Expert labels and freeze digests live only under the gitignored
 * `.hsi-private-benchmark/` tree. This module never invents gold labels,
 * never writes vault content into `site/` or other public artifacts, and
 * never claims scientific approval.
 */
import {createHash} from "node:crypto";
import {existsSync,mkdirSync,readFileSync,readdirSync,statSync,writeFileSync} from "node:fs";
import {join,resolve,sep} from "node:path";

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
      purpose:"Immunology benchmark private curation drafts (holdout; not public slots)",
      requiredFiles:["README.md"],
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

function writeIfMissing(path:string,content:string){
  if(existsSync(path))return false;
  mkdirSync(resolve(path,".."),{recursive:true});
  writeFileSync(path,content);
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

Holdout drafts and curation records for the immunology benchmark.

Public repository holds authoring *slots* only (\`src/evidence/immunoBenchmark.ts\`).
Real questions, gold labels and reviewer identities belong here, never in git.

Scientific approval: false.
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
      immuno:existsSync(join(root,"immuno"))?readdirSync(join(root,"immuno")).filter(f=>f.endsWith(".json")).length:0,
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

function refreshManifest(repoRoot:string,now:string){
  const root=rootSafe(repoRoot);
  const freezeDir=join(root,"freezes");
  const freezes=existsSync(freezeDir)
    ?readdirSync(freezeDir).filter(f=>f.endsWith(".json")).sort()
    :[];
  const manifest:VaultManifest={
    schemaVersion:"hsi-label-vault-manifest-1",
    createdAt:now,
    tracks:[...LABEL_VAULT_TRACKS],
    caseCounts:{
      conflict:countConflictCases(join(root,"conflict","cases.json")),
      immuno:0,
    },
    freezes,
    scientificApproval:false,
    containsGoldLabels:freezes.length>0||countConflictCases(join(root,"conflict","cases.json"))>0,
  };
  writeFileSync(join(root,"manifests","vault-manifest.v1.json"),`${JSON.stringify(manifest,null,2)}\n`);
}
