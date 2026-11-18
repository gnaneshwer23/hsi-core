/**
 * VER-05 label vault authoring stubs (A4.1) + immuno founder development set (A4.3).
 *
 *   bun run label-vault:init
 *   bun run label-vault:status
 *   bun run label-vault:validate
 *   bun run label-vault:scaffold-conflict -- --id CB-001 --question "..."
 *   bun run label-vault:scaffold-immuno-dev -- --id DEV-001 --layer core --domain innate_adaptive_cells --question "..."
 *   bun run label-vault:import-immuno-dev -- --from /path/to/dev-set.json
 *   bun run label-vault:validate-immuno-dev
 *   bun run label-vault:score-immuno-dev   # always refuses until floors
 *   bun run label-vault:freeze -- --track conflict
 *
 * Writes only under gitignored `.hsi-private-benchmark/`. Never invents gold labels or floors.
 */
import {resolve} from "node:path";
import {
  LABEL_VAULT_LAYOUT,
  appendConflictCaseStub,
  freezeConflictLabels,
  initLabelVault,
  labelVaultStatus,
  scaffoldConflictCaseStub,
  validateLabelVaultLayout,
} from "../src/evidence/labelVault";
import {
  appendImmunoDevCase,
  importImmunoDevSet,
  loadImmunoDevSet,
  refuseImmunoDevSetScoring,
  scaffoldImmunoDevCase,
  validateImmunoDevSet,
} from "../src/evidence/immunoDevSet";
import {IMMUNO_ALLOCATIONS,type ImmunoDomain,type ImmunoLayer} from "../src/evidence/immunoBenchmark";

const args=process.argv.slice(2);
const cmd=args[0]??"status";
const flag=(name:string)=>args.includes(name);
const value=(name:string)=>{const i=args.indexOf(name);return i>=0&&args[i+1]?args[i+1]!:undefined};
const root=resolve(value("--root")??resolve(import.meta.dir,".."));

if(cmd==="layout"){
  console.log(JSON.stringify(LABEL_VAULT_LAYOUT,null,2));
  process.exit(0);
}

if(cmd==="init"){
  const result=initLabelVault(root);
  console.log(JSON.stringify({ok:true,root:result.root.slice(root.length+1),created:result.created,scientificApproval:false,goldCommittedInGit:false},null,2));
  process.exit(0);
}

if(cmd==="status"){
  console.log(JSON.stringify(labelVaultStatus(root),null,2));
  process.exit(0);
}

if(cmd==="validate"){
  const status=validateLabelVaultLayout(root);
  console.log(JSON.stringify({ok:true,...status},null,2));
  process.exit(0);
}

if(cmd==="scaffold-conflict"){
  const id=value("--id");
  const question=value("--question");
  if(!id||!question){
    console.error("Usage: bun run label-vault:scaffold-conflict -- --id CB-001 --question \"...\"");
    process.exit(1);
  }
  initLabelVault(root);
  const stub=scaffoldConflictCaseStub({id,question});
  if(flag("--dry-run")){
    console.log(JSON.stringify({dryRun:true,stub,note:"labels left empty; curator fills privately"},null,2));
    process.exit(0);
  }
  const written=appendConflictCaseStub(root,stub);
  console.log(JSON.stringify({wrote:written.path,id,total:written.total,labelsInvented:false,scientificApproval:false},null,2));
  process.exit(0);
}

if(cmd==="scaffold-immuno-dev"){
  const id=value("--id");
  const layer=value("--layer") as ImmunoLayer|undefined;
  const domain=value("--domain") as ImmunoDomain|undefined;
  const question=value("--question");
  if(!id||!layer||!domain||!question){
    console.error("Usage: bun run label-vault:scaffold-immuno-dev -- --id DEV-001 --layer core --domain innate_adaptive_cells --question \"...\"");
    console.error(`Domains: ${IMMUNO_ALLOCATIONS.map(([l,d])=>`${l}/${d}`).join(", ")}`);
    process.exit(1);
  }
  const draft=scaffoldImmunoDevCase({caseId:id,layer,domain,question});
  if(flag("--dry-run")){
    console.log(JSON.stringify({dryRun:true,draft,note:"gold left null; scoring blocked until floors"},null,2));
    process.exit(0);
  }
  const written=appendImmunoDevCase(root,draft);
  console.log(JSON.stringify({
    wrote:written.path,
    id,
    total:written.total,
    goldInvented:false,
    scoringBlocked:true,
    floorsOwnerApproved:false,
    scientificApproval:false,
  },null,2));
  process.exit(0);
}

if(cmd==="import-immuno-dev"){
  const from=value("--from");
  if(!from){
    console.error("Usage: bun run label-vault:import-immuno-dev -- --from /path/to/dev-set.json");
    process.exit(1);
  }
  const result=importImmunoDevSet(root,resolve(from));
  console.log(JSON.stringify({
    imported:result.path,
    merged:result.merged,
    ...result.summary,
    note:"Scoring remains blocked until owner-approved floors; existing case ids are never overwritten",
  },null,2));
  process.exit(0);
}

if(cmd==="validate-immuno-dev"){
  const doc=loadImmunoDevSet(root);
  const summary=validateImmunoDevSet(doc);
  console.log(JSON.stringify({ok:true,...summary},null,2));
  process.exit(0);
}

if(cmd==="score-immuno-dev"){
  try{
    const doc=loadImmunoDevSet(root);
    refuseImmunoDevSetScoring(doc);
  }catch(error){
    console.error(JSON.stringify({
      ok:false,
      scoringBlocked:true,
      floorsOwnerApproved:false,
      numericFloors:null,
      error:error instanceof Error?error.message:String(error),
    },null,2));
    process.exit(1);
  }
}

if(cmd==="freeze"){
  const track=value("--track")??"conflict";
  if(track!=="conflict"){
    console.error("Only --track conflict is stubbed for freeze (immuno freeze remains owner-gated)");
    process.exit(1);
  }
  const record=freezeConflictLabels(root);
  console.log(JSON.stringify({froze:true,track:record.track,contentSha256:record.contentSha256,caseIds:record.caseIds.length,scientificApproval:false,floorsOwnerApproved:false},null,2));
  process.exit(0);
}

console.error("Unknown command. Use: layout | init | status | validate | scaffold-conflict | scaffold-immuno-dev | import-immuno-dev | validate-immuno-dev | score-immuno-dev | freeze");
process.exit(1);
